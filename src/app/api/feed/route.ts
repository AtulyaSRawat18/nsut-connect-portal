import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter") || "all"; // all, news, projects, opportunities
  const personalized = searchParams.get("personalized") === "true";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userProfile = null;
  if (user) {
    // Attempt to fetch role and details
    const { data: profile } = await supabase
      .from("portal_users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profile) {
      userProfile = profile;
      if (profile.role === "student") {
        const { data: sProfile } = await supabase
          .from("student_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();
        if (sProfile) {
          userProfile = { ...userProfile, ...sProfile };
        }
      } else if (profile.role === "faculty") {
        const { data: fProfile } = await supabase
          .from("faculty_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();
        if (fProfile) {
          userProfile = { ...userProfile, ...fProfile };
        }
      }
    }
  }

  const userDept = userProfile?.department || null;

  // Data arrays to consolidate
  let newsList: any[] = [];
  let projectsList: any[] = [];
  let highlightsList: any[] = [];

  // Fetch based on filter criteria
  const fetchNews = filter === "all" || filter === "news";
  const fetchProjects = filter === "all" || filter === "projects";
  const fetchOpportunities = filter === "all" || filter === "opportunities";

  // Run queries concurrently
  const [newsRes, projectsRes, highlightsRes] = await Promise.all([
    fetchNews
      ? supabase
          .from("announcements")
          .select("id, title, content, category, created_at")
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: null }),
    fetchProjects
      ? supabase
          .from("projects")
          .select("id, title, description, department, status, created_at")
          .eq("status", "open")
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: null }),
    fetchOpportunities
      ? supabase
          .from("highlights")
          .select("id, title, description, type, link_url, deadline, created_at")
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: null }),
  ]);

  if (newsRes.data) {
    newsList = newsRes.data.map((item: any) => ({
      id: item.id,
      type: "news",
      title: item.title,
      description: item.content,
      category: item.category,
      date: item.created_at,
      department: "General", // Default
    }));
  }

  if (projectsRes.data) {
    projectsList = projectsRes.data.map((item: any) => ({
      id: item.id,
      type: "project",
      title: item.title,
      description: item.description,
      department: item.department,
      date: item.created_at,
    }));
  }

  if (highlightsRes.data) {
    highlightsList = highlightsRes.data.map((item: any) => ({
      id: item.id,
      type: "opportunity",
      title: item.title,
      description: item.description,
      opportunityType: item.type, // internship, scholarship, event, highlight
      linkUrl: item.link_url,
      deadline: item.deadline,
      date: item.created_at,
      department: "General",
    }));
  }

  // Consolidate list
  let feedItems = [...newsList, ...projectsList, ...highlightsList];

  // Sorting & Personalization
  feedItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (personalized && userDept) {
    // Rank matched departments higher
    feedItems = feedItems.sort((a, b) => {
      const aMatch = a.department?.toLowerCase() === userDept.toLowerCase();
      const bMatch = b.department?.toLowerCase() === userDept.toLowerCase();

      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }

  return NextResponse.json({
    userDept,
    feedItems,
  });
}
