import "server-only";

import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/utils/supabase/public";

export const PUBLIC_PAGE_SIZE = 20;

type QueryError = { message: string } | null;

export type PagedResult<T> = {
  data: T[];
  count: number;
  error: string | null;
  page: number;
  pageSize: number;
};

export type PublicProject = {
  id: string;
  title: string;
  description: string;
  department: string;
  status: string;
  created_at: string;
  profiles: { full_name: string; id: string } | { full_name: string; id: string }[] | null;
};

export type PublicFaculty = {
  id: string;
  name: string;
  email: string;
  role: string;
  dept: string;
  research: string;
  website: string | null;
  verified: boolean;
};

export type PublicForumPost = {
  id: string;
  title: string;
  content: string;
  department: string;
  upvotes: number | null;
  created_at: string;
  profiles: { full_name: string; role: string } | { full_name: string; role: string }[] | null;
};

export type PublicPublication = {
  id: string;
  title: string;
  authors: string[] | null;
  published_date: string | null;
  url: string | null;
};

export type PublicNewsItem = {
  id: string;
  title: string;
  content: string;
  category: string | null;
  created_at: string;
  profiles: { full_name: string } | { full_name: string }[] | null;
};

export type PublicOpportunity = {
  id: string;
  title: string;
  description: string;
  type: string;
  deadline: string | null;
  link_url: string | null;
  created_at?: string;
};

export type PublicFeedItem = {
  id: string;
  type: "research";
  title: string;
  description: string;
  date: string;
  topic: string;
};

type FacultyProfileRow = {
  user_id: string;
  department: string | null;
  designation: string | null;
  research_area: string | null;
  website_url: string | null;
  verification_status: string | null;
};

type ProfileRow = {
  id: string;
  full_name: string;
  email: string;
  department: string | null;
};

function pageNumber(value: number) {
  return Number.isFinite(value) ? Math.min(Math.max(Math.trunc(value), 1), 500) : 1;
}

function searchTerm(value: string) {
  return value.replace(/[%(),]/g, " ").replace(/\s+/g, " ").trim().slice(0, 100);
}

function rangeFor(page: number) {
  const normalizedPage = pageNumber(page);
  const from = (normalizedPage - 1) * PUBLIC_PAGE_SIZE;
  return { from, page: normalizedPage, to: from + PUBLIC_PAGE_SIZE - 1 };
}

function errorMessage(error: QueryError) {
  return error?.message || null;
}

const loadProjects = unstable_cache(
  async (filters: { q: string; department: string; status: string; page: number }) => {
    const supabase = createPublicClient();
    const { from, page, to } = rangeFor(filters.page);
    const q = searchTerm(filters.q);
    let query = supabase
      .from("projects")
      .select(
        "id, title, description, department, status, created_at, profiles!projects_faculty_id_fkey(full_name, id)",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    if (filters.department !== "all") query = query.eq("department", filters.department);
    if (filters.status !== "all") query = query.eq("status", filters.status);

    const { data, count, error } = await query;
    return {
      data: (data || []) as PublicProject[],
      count: count || 0,
      error: errorMessage(error),
      page,
      pageSize: PUBLIC_PAGE_SIZE,
    } satisfies PagedResult<PublicProject>;
  },
  ["public-projects-v1"],
  { revalidate: 60, tags: ["public-projects"] },
);

export function getPublicProjects(filters: { q?: string; department?: string; status?: string; page?: number }) {
  return loadProjects({
    q: filters.q || "",
    department: filters.department || "all",
    status: filters.status || "all",
    page: pageNumber(filters.page || 1),
  });
}

const loadFacultyDepartments = unstable_cache(
  async () => {
    const { data } = await createPublicClient()
      .from("faculty_profiles")
      .select("department")
      .not("department", "is", null)
      .limit(500);
    return Array.from(new Set((data || []).map((item) => item.department).filter(Boolean))).sort() as string[];
  },
  ["public-faculty-departments-v1"],
  { revalidate: 120, tags: ["public-faculty"] },
);

export function getPublicFacultyDepartments() {
  return loadFacultyDepartments();
}

const loadFaculty = unstable_cache(
  async (filters: { q: string; department: string; verification: string; page: number }) => {
    const supabase = createPublicClient();
    const { from, page, to } = rangeFor(filters.page);
    const q = searchTerm(filters.q).toLowerCase();

    let facultyProfileQuery = supabase
      .from("faculty_profiles")
      .select("user_id, department, designation, research_area, website_url, verification_status")
      .limit(500);
    if (filters.department !== "all") facultyProfileQuery = facultyProfileQuery.eq("department", filters.department);
    if (filters.verification === "verified") facultyProfileQuery = facultyProfileQuery.eq("verification_status", "approved");
    if (filters.verification === "pending") facultyProfileQuery = facultyProfileQuery.or("verification_status.neq.approved,verification_status.is.null");

    const { data: profileData, error: profileError } = await facultyProfileQuery;
    if (profileError) {
      return { data: [], count: 0, error: profileError.message, page, pageSize: PUBLIC_PAGE_SIZE } satisfies PagedResult<PublicFaculty>;
    }

    const eligibleProfiles = (profileData || []) as FacultyProfileRow[];
    const eligibleById = new Map(eligibleProfiles.map((profile) => [profile.user_id, profile]));
    let candidateIds = eligibleProfiles.map((profile) => profile.user_id);

    if (q) {
      const researchIds = eligibleProfiles
        .filter((profile) =>
          [profile.department, profile.designation, profile.research_area]
            .filter(Boolean)
            .some((value) => value!.toLowerCase().includes(q)),
        )
        .map((profile) => profile.user_id);
      let nameQuery = supabase.from("profiles").select("id").eq("role", "faculty").limit(500);
      nameQuery = nameQuery.or(`full_name.ilike.%${q}%,department.ilike.%${q}%`);
      const { data: nameMatches, error: nameError } = await nameQuery;
      if (nameError) {
        return { data: [], count: 0, error: nameError.message, page, pageSize: PUBLIC_PAGE_SIZE } satisfies PagedResult<PublicFaculty>;
      }
      const nameIds = (nameMatches || []).map((profile) => profile.id).filter((id) => eligibleById.has(id));
      candidateIds = Array.from(new Set([...researchIds, ...nameIds]));
    }

    if (candidateIds.length === 0) {
      return { data: [], count: 0, error: null, page, pageSize: PUBLIC_PAGE_SIZE } satisfies PagedResult<PublicFaculty>;
    }

    const { data: users, count, error: usersError } = await supabase
      .from("profiles")
      .select("id, full_name, email, department", { count: "exact" })
      .eq("role", "faculty")
      .in("id", candidateIds)
      .order("full_name")
      .range(from, to);

    const data = ((users || []) as ProfileRow[]).map((person) => {
      const profile = eligibleById.get(person.id);
      return {
        id: person.id,
        name: person.full_name,
        email: person.email,
        role: profile?.designation || "Faculty",
        dept: profile?.department || person.department || "NSUT",
        research: profile?.research_area || "Interdisciplinary Research",
        website: profile?.website_url || null,
        verified: profile?.verification_status === "approved",
      };
    });

    return {
      data,
      count: count || 0,
      error: errorMessage(usersError),
      page,
      pageSize: PUBLIC_PAGE_SIZE,
    } satisfies PagedResult<PublicFaculty>;
  },
  ["public-faculty-v1"],
  { revalidate: 120, tags: ["public-faculty"] },
);

export function getPublicFaculty(filters: { q?: string; department?: string; verification?: string; page?: number }) {
  return loadFaculty({
    q: filters.q || "",
    department: filters.department || "all",
    verification: filters.verification || "all",
    page: pageNumber(filters.page || 1),
  });
}

const loadForumPosts = unstable_cache(
  async (filters: { q: string; department: string; page: number }) => {
    const supabase = createPublicClient();
    const { from, page, to } = rangeFor(filters.page);
    const q = searchTerm(filters.q);
    let query = supabase
      .from("forum_posts")
      .select(
        "id, title, content, department, upvotes, created_at, profiles!forum_posts_author_id_fkey(full_name, role)",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(from, to);
    if (q) query = query.or(`title.ilike.%${q}%,content.ilike.%${q}%`);
    if (filters.department !== "all") query = query.eq("department", filters.department);
    const { data, count, error } = await query;
    return {
      data: (data || []) as PublicForumPost[],
      count: count || 0,
      error: errorMessage(error),
      page,
      pageSize: PUBLIC_PAGE_SIZE,
    } satisfies PagedResult<PublicForumPost>;
  },
  ["public-forum-v1"],
  { revalidate: 60, tags: ["public-forum"] },
);

export function getPublicForumPosts(filters: { q?: string; department?: string; page?: number }) {
  return loadForumPosts({
    q: filters.q || "",
    department: filters.department || "all",
    page: pageNumber(filters.page || 1),
  });
}

const loadPublicationYears = unstable_cache(
  async () => {
    const { data } = await createPublicClient().from("publications").select("published_date").limit(500);
    return Array.from(
      new Set(
        (data || []).map((publication) =>
          publication.published_date ? String(new Date(publication.published_date).getFullYear()) : "forthcoming",
        ),
      ),
    ).sort().reverse();
  },
  ["public-publication-years-v1"],
  { revalidate: 120, tags: ["public-publications"] },
);

export function getPublicPublicationYears() {
  return loadPublicationYears();
}

const loadPublications = unstable_cache(
  async (filters: { q: string; year: string; page: number }) => {
    const supabase = createPublicClient();
    const { from, page, to } = rangeFor(filters.page);
    const q = searchTerm(filters.q);
    let query = supabase
      .from("publications")
      .select("id, title, authors, published_date, url", { count: "exact" })
      .order("published_date", { ascending: false, nullsFirst: false })
      .range(from, to);
    if (q) query = query.ilike("title", `%${q}%`);
    if (filters.year === "forthcoming") query = query.is("published_date", null);
    if (/^\d{4}$/.test(filters.year)) {
      query = query
        .gte("published_date", `${filters.year}-01-01`)
        .lt("published_date", `${Number(filters.year) + 1}-01-01`);
    }
    const { data, count, error } = await query;
    return {
      data: (data || []) as PublicPublication[],
      count: count || 0,
      error: errorMessage(error),
      page,
      pageSize: PUBLIC_PAGE_SIZE,
    } satisfies PagedResult<PublicPublication>;
  },
  ["public-publications-v1"],
  { revalidate: 120, tags: ["public-publications"] },
);

export function getPublicPublications(filters: { q?: string; year?: string; page?: number }) {
  return loadPublications({ q: filters.q || "", year: filters.year || "all", page: pageNumber(filters.page || 1) });
}

const loadNewsCategories = unstable_cache(
  async () => {
    const { data } = await createPublicClient().from("announcements").select("category").limit(500);
    return Array.from(new Set((data || []).map((item) => item.category || "general"))).sort();
  },
  ["public-news-categories-v1"],
  { revalidate: 120, tags: ["public-news"] },
);

export function getPublicNewsCategories() {
  return loadNewsCategories();
}

const loadNews = unstable_cache(
  async (filters: { q: string; category: string; page: number }) => {
    const supabase = createPublicClient();
    const { from, page, to } = rangeFor(filters.page);
    const q = searchTerm(filters.q);
    let query = supabase
      .from("announcements")
      .select(
        "id, title, content, category, created_at, profiles!announcements_author_id_fkey(full_name)",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(from, to);
    if (q) query = query.or(`title.ilike.%${q}%,content.ilike.%${q}%`);
    if (filters.category === "general") query = query.or("category.eq.general,category.is.null");
    else if (filters.category !== "all") query = query.eq("category", filters.category);
    const { data, count, error } = await query;
    return {
      data: (data || []) as PublicNewsItem[],
      count: count || 0,
      error: errorMessage(error),
      page,
      pageSize: PUBLIC_PAGE_SIZE,
    } satisfies PagedResult<PublicNewsItem>;
  },
  ["public-news-v1"],
  { revalidate: 60, tags: ["public-news"] },
);

export function getPublicNews(filters: { q?: string; category?: string; page?: number }) {
  return loadNews({ q: filters.q || "", category: filters.category || "all", page: pageNumber(filters.page || 1) });
}

const loadOpportunities = unstable_cache(
  async (filters: { q: string; type: string; deadline: string; page: number }) => {
    const supabase = createPublicClient();
    const { from, page, to } = rangeFor(filters.page);
    const q = searchTerm(filters.q);
    const today = new Date().toISOString().slice(0, 10);
    let query = supabase
      .from("highlights")
      .select("id, title, description, type, deadline, link_url, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);
    if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    if (filters.type !== "all") query = query.eq("type", filters.type);
    if (filters.deadline === "open") query = query.gte("deadline", today);
    if (filters.deadline === "closed") query = query.lt("deadline", today);
    if (filters.deadline === "none") query = query.is("deadline", null);
    const { data, count, error } = await query;
    return {
      data: (data || []) as PublicOpportunity[],
      count: count || 0,
      error: errorMessage(error),
      page,
      pageSize: PUBLIC_PAGE_SIZE,
    } satisfies PagedResult<PublicOpportunity>;
  },
  ["public-opportunities-v1"],
  { revalidate: 60, tags: ["public-opportunities"] },
);

export function getPublicOpportunities(filters: { q?: string; type?: string; deadline?: string; page?: number }) {
  return loadOpportunities({
    q: filters.q || "",
    type: filters.type || "all",
    deadline: filters.deadline || "all",
    page: pageNumber(filters.page || 1),
  });
}

const researchTopics = ["space", "ai-robotics", "biotech", "civil-climate", "entrepreneurship", "energy"] as const;

const loadPublicFeed = unstable_cache(
  async (filters: { topic: string; q: string }) => {
    const supabase = createPublicClient();
    const q = searchTerm(filters.q);
    let query = supabase
      .from("announcements")
      .select("id, title, content, category, created_at")
      .in("category", [...researchTopics])
      .order("created_at", { ascending: false })
      .limit(PUBLIC_PAGE_SIZE);
    if (filters.topic !== "all") query = query.eq("category", filters.topic);
    if (q) query = query.or(`title.ilike.%${q}%,content.ilike.%${q}%`);
    const { data, error } = await query;
    if (error) return { feedItems: [] as PublicFeedItem[], error: error.message };
    return {
      feedItems: (data || []).map((item) => ({
        id: item.id,
        type: "research" as const,
        title: item.title,
        description: item.content,
        date: item.created_at,
        topic: item.category || "research",
      })),
      error: null,
    };
  },
  ["public-research-feed-v2"],
  { revalidate: 60, tags: ["public-feed", "public-news"] },
);

export function getPublicFeed(filters: { topic?: string; q?: string }) {
  const topic = researchTopics.includes(filters.topic as (typeof researchTopics)[number]) ? filters.topic! : "all";
  return loadPublicFeed({ topic, q: filters.q || "" });
}
