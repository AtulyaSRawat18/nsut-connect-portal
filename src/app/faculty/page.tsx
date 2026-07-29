import { Search, Mail, Globe } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

type FacultyProfileRow = {
  department: string | null;
  designation: string | null;
  research_area: string | null;
  website_url: string | null;
  verification_status: string | null;
};

type FacultyRow = {
  id: string;
  name: string;
  email: string;
  faculty_profiles: FacultyProfileRow | FacultyProfileRow[] | null;
};

export default async function FacultyDirectory() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("portal_users")
    .select("id, name, email, faculty_profiles(department, designation, research_area, website_url, verification_status)")
    .eq("role", "faculty")
    .eq("account_status", "active")
    .order("name");

  const faculty = ((data || []) as FacultyRow[]).map((person) => {
    const profile = Array.isArray(person.faculty_profiles)
      ? person.faculty_profiles[0]
      : person.faculty_profiles;
    return {
      id: person.id,
      name: person.name,
      email: person.email,
      role: profile?.designation || "Faculty",
      dept: profile?.department || "NSUT",
      research: profile?.research_area || "Interdisciplinary Research",
      website: profile?.website_url,
      verified: profile?.verification_status === "approved",
    };
  });

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-4xl font-display font-black text-primary mb-4 tracking-tight">Faculty Directory</h1>
        <p className="text-foreground/70 mb-12 max-w-2xl">Connect with NSUT researchers and find the right mentor for your academic journey.</p>

        <div className="bg-surface border border-outline p-4 flex items-center gap-4 mb-12">
          <Search className="w-5 h-5 text-foreground/50 ml-2" />
          <input type="text" placeholder="Search by name, department, or research area..." className="w-full bg-transparent border-none focus:ring-0 text-foreground" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {faculty.map((f) => (
            <div key={f.id} className="bg-surface border border-outline p-8 hover:border-primary transition-all group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {f.name.split(" ").at(-1)?.[0] || "F"}
                </div>
                <div>
                  <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{f.name}</h3>
                  <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">
                    {f.role} • {f.dept}{f.verified ? " • Verified" : ""}
                  </p>
                </div>
              </div>
              <p className="text-sm text-foreground/70 mb-6 font-medium italic">&quot;{f.research}&quot;</p>
              <div className="flex gap-4">
                <Link href={`mailto:${f.email}`} className="text-primary hover:underline flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                  <Mail className="w-4 h-4" /> Email
                </Link>
                <Link href={f.website || `/profile/${f.id}`} className="text-primary hover:underline flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                  <Globe className="w-4 h-4" /> Profile
                </Link>
              </div>
            </div>
          ))}
          {faculty.length === 0 && (
            <p className="col-span-full border border-dashed border-outline p-12 text-center text-foreground/50">
              No faculty profiles are available yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
