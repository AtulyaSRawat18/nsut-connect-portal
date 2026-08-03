import { NextResponse } from "next/server";
import { getPublicFeed } from "@/lib/public-data";

const PUBLIC_CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get("topic") || "all";
  const q = searchParams.get("q") || "";
  const feed = await getPublicFeed({ topic, q });
  return NextResponse.json(
    { feedItems: feed.feedItems, error: feed.error },
    { headers: PUBLIC_CACHE_HEADERS },
  );
}