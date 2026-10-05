import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidateTag } from "next/cache";
import {
  AuthenticationError,
  AuthorizationError,
  getPortalIdentity,
  requirePortalIdentity,
} from "@/lib/auth/server";
import { authError } from "@/lib/auth/responses";
import { checkRateLimit, isSameOrigin } from "@/lib/auth/rate-limit";
import { IDEA_TOPICS, type IdeaPerson } from "@/lib/idea-search";
import type { IdeaState } from "@/lib/idea-types";
import { safeResourceUrl } from "@/lib/idea-resources";
import { createClient } from "@/utils/supabase/server";

const topicId = z
  .string()
  .refine(
    (value) => IDEA_TOPICS.some((topic) => topic.id === value),
    "Choose an existing interest space",
  );
const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("interest"), topicId, selected: z.boolean() }),
  z.object({
    action: z.literal("connection"),
    targetId: z.uuid(),
    selected: z.boolean(),
  }),
  z.object({
    action: z.literal("discussion"),
    topicId,
    title: z.string().trim().min(8).max(180),
    content: z.string().trim().min(30).max(5000),
    resourceUrl: z
      .string()
      .trim()
      .max(700)
      .refine(
        (value) => !value || Boolean(safeResourceUrl(value)),
        "Resources must use a valid HTTPS URL without credentials",
      )
      .optional(),
  }),
]);

export async function GET() {
  const state: IdeaState = {
    userId: null,
    selected: [],
    connections: [],
    people: [],
    counts: {},
    discussions: [],
    error: null,
  };
  try {
    const supabase = await createClient();
    const identity = await getPortalIdentity();
    const active =
      identity?.emailVerified &&
      identity.accountStatus === "active" &&
      (!identity.bannedUntil ||
        new Date(identity.bannedUntil).getTime() <= Date.now());
    state.userId = active ? identity.id : null;
    const [counts, discussions] = await Promise.all([
      supabase.rpc("idea_member_counts"),
      supabase
        .from("forum_posts")
        .select(
          "id, title, content, author_id, created_at, idea_topic, resource_url",
        )
        .not("idea_topic", "is", null)
        .eq("moderation_status", "visible")
        .order("created_at", { ascending: false })
        .limit(100),
    ]);
    if (counts.error || discussions.error) throw new Error("Read failed");
    state.counts = Object.fromEntries(
      (counts.data || []).map(
        (row: { topic_id: string; member_count: number }) => [
          row.topic_id,
          Number(row.member_count),
        ],
      ),
    );
    state.discussions = (discussions.data || []).map((post) => ({
      ...post,
      resource_url: safeResourceUrl(post.resource_url),
    }));
    if (active) {
      const [selected, connections] = await Promise.all([
        supabase
          .from("idea_memberships")
          .select("topic_id")
          .eq("user_id", identity.id),
        supabase
          .from("idea_connections")
          .select("target_id")
          .eq("user_id", identity.id),
      ]);
      if (selected.error || connections.error) throw new Error("Read failed");
      state.selected = (selected.data || []).map((row) => row.topic_id);
      state.connections = (connections.data || []).map((row) => row.target_id);
      // PostgREST caps each response; paging prevents a silent partial directory.
      for (let offset = 0; ; offset += 500) {
        const people = await supabase
          .rpc("idea_people")
          .order("id")
          .range(offset, offset + 499);
        if (people.error) throw new Error("Read failed");
        state.people.push(...((people.data as IdeaPerson[]) || []));
        if ((people.data || []).length < 500) break;
      }
    }
    return NextResponse.json(state, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch {
    return NextResponse.json(
      {
        ...state,
        selected: [],
        connections: [],
        people: [],
        counts: {},
        discussions: [],
        error: "Live community data is unavailable. Please try again shortly.",
      },
      { status: 503, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request))
    return authError(
      403,
      "INVALID_ORIGIN",
      "Cross-origin changes are not allowed",
    );
  const limit = checkRateLimit(request, "idea:write", {
    limit: 25,
    windowMs: 60_000,
  });
  if (!limit.allowed)
    return authError(
      429,
      "RATE_LIMITED",
      "Please wait before making another change",
      { "Retry-After": String(limit.retryAfterSeconds) },
    );
  try {
    const identity = await requirePortalIdentity({
      permissions: ["idea.participate"],
    });
    const parsed = actionSchema.safeParse(
      await request.json().catch(() => null),
    );
    if (!parsed.success)
      return authError(
        400,
        "INVALID_IDEA",
        parsed.error.issues[0]?.message || "Invalid request",
      );
    const input = parsed.data;
    const supabase = await createClient();
    if (input.action === "interest") {
      const result = input.selected
        ? await supabase
            .from("idea_memberships")
            .upsert(
              { user_id: identity.id, topic_id: input.topicId },
              { onConflict: "user_id,topic_id", ignoreDuplicates: true },
            )
        : await supabase
            .from("idea_memberships")
            .delete()
            .eq("user_id", identity.id)
            .eq("topic_id", input.topicId);
      if (result.error) throw new Error("Write failed");
    } else if (input.action === "connection") {
      if (input.targetId === identity.id)
        return authError(400, "SELF_CONNECTION", "Choose another member");
      const result = input.selected
        ? await supabase
            .from("idea_connections")
            .upsert(
              { user_id: identity.id, target_id: input.targetId },
              { onConflict: "user_id,target_id", ignoreDuplicates: true },
            )
        : await supabase
            .from("idea_connections")
            .delete()
            .eq("user_id", identity.id)
            .eq("target_id", input.targetId);
      if (result.error) throw new Error("Write failed");
    } else {
      const membership = await supabase
        .from("idea_memberships")
        .select("topic_id")
        .eq("user_id", identity.id)
        .eq("topic_id", input.topicId)
        .maybeSingle();
      if (membership.error) throw new Error("Read failed");
      if (!membership.data)
        return authError(
          403,
          "JOIN_REQUIRED",
          "Join this space before starting a discussion",
        );
      const profile = await supabase
        .from(
          identity.role === "faculty" ? "faculty_profiles" : "student_profiles",
        )
        .select("department")
        .eq("user_id", identity.id)
        .maybeSingle();
      if (profile.error) throw new Error("Read failed");
      const result = await supabase
        .from("forum_posts")
        .insert({
          author_id: identity.id,
          title: input.title,
          content: input.content,
          department: profile.data?.department || null,
          idea_topic: input.topicId,
          resource_url: input.resourceUrl || null,
        })
        .select("id")
        .single();
      if (result.error) throw new Error("Write failed");
      revalidateTag("public-forum", "max");
      return NextResponse.json({ id: result.data.id }, { status: 201 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthenticationError)
      return authError(401, "UNAUTHENTICATED", error.message);
    if (error instanceof AuthorizationError)
      return authError(403, "FORBIDDEN", error.message);
    return authError(
      503,
      "IDEA_UNAVAILABLE",
      "Your change could not be saved. Please try again.",
    );
  }
}
