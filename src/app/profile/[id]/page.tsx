import Link from "next/link";
import { BadgeCheck, MapPin, Globe, Mail, Briefcase, BookOpen, Edit3, Link as LinkIcon, User } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

export default async function Profile({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;
  
  // Fetch profile
  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  // Dummy data fallback
  if (!profile) {
    profile = {
      id: id,
      full_name: id === 'owner-id' ? 'Dr. Anita Sharma' : 'Naman Juneja',
      role: id === 'owner-id' ? 'faculty' : 'student',
      department: id === 'owner-id' ? 'Computer Science' : 'Information Technology',
      email: id === 'owner-id' ? 'asharma@nsut.ac.in' : 'naman.juneja@nsut.ac.in',
      nsut_roll_number: id === 'owner-id' ? 'FAC001' : '2020IT01'
    };
  }

  // Fetch their projects (if faculty) or applied/accepted (if student)
  let projects: any[] = [];
  if (profile.role === 'faculty') {
    const { data } = await supabase.from('projects').select('id, title, status').eq('faculty_id', id);
    projects = data || [];
  } else {
    const { data } = await supabase.from('applications').select('projects(id, title, status)').eq('student_id', id);
    projects = data?.map(a => a.projects) || [];
  }

  if (projects.length === 0) {
    if (profile.role === 'faculty') {
      projects = [
        { id: '1', title: 'Federated Learning for Edge Devices', status: 'open' },
        { id: '4', title: 'Adversarial Robustness in NLP', status: 'closed' }
      ];
    } else {
      projects = [
        { id: '1', title: 'Federated Learning for Edge Devices', status: 'open' }
      ];
    }
  }

  // Check if current user is viewing their own profile
  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = user?.id === id;

  return (
    <div className="min-h-screen bg-surface font-sans py-16">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Banner */}
        <div className="h-48 bg-gradient-to-r from-primary to-secondary rounded-t-2xl"></div>
        
        {/* Profile Details Container */}
        <div className="bg-background border border-outline rounded-b-2xl shadow-sm -mt-16 px-8 pb-12 mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-outline pb-8">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-end -mt-12">
              <div className="w-32 h-32 bg-background p-2 rounded-full border-2 border-outline-variant shadow-lg flex-shrink-0">
                <div className="w-full h-full rounded-full bg-primary/20 flex flex-col items-center justify-center text-4xl text-primary font-bold overflow-hidden">
                  {profile.full_name?.charAt(0) || 'U'}
                </div>
              </div>
              <div className="text-center md:text-left mb-2">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <h1 className="text-3xl font-display font-bold text-foreground">{profile.full_name || 'Anonymous User'}</h1>
                  <BadgeCheck className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-foreground/70 font-medium uppercase tracking-widest text-xs mt-2 flex items-center justify-center md:justify-start gap-2">
                  <Briefcase className="w-4 h-4" /> {profile.role} • {profile.department || 'NSUT'}
                </p>
              </div>
            </div>
            
            {isOwner && (
              <button className="bg-surface border border-outline text-foreground px-6 py-2 rounded-lg font-bold tracking-widest text-xs uppercase hover:bg-outline/30 flex items-center gap-2 transition-colors">
                <Edit3 className="w-4 h-4" /> Edit Profile
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12">
            {/* Left Column */}
            <div className="md:col-span-1 space-y-8">
              <div>
                <h3 className="font-bold text-xs text-foreground/50 tracking-widest uppercase mb-4">Contact & Links</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm text-foreground/80">
                    <Mail className="w-4 h-4 text-primary" /> {profile.email}
                  </div>
                  {profile.nsut_roll_number && (
                    <div className="flex items-center gap-3 text-sm text-foreground/80">
                      <Briefcase className="w-4 h-4 text-primary" /> {profile.nsut_roll_number}
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm text-foreground/80">
                    <Globe className="w-4 h-4 text-primary" /> <Link href="#" className="hover:underline">github.com/{profile.full_name?.split(' ')[0].toLowerCase()}</Link>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-foreground/80">
                    <Globe className="w-4 h-4 text-primary" /> <Link href="#" className="hover:underline">linkedin.com/in/{profile.full_name?.split(' ')[0].toLowerCase()}</Link>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-xs text-foreground/50 tracking-widest uppercase mb-4">Skills & Focus</h3>
                <div className="flex flex-wrap gap-2">
                  {['Machine Learning', 'Data Analysis', 'Python', 'Next.js', 'System Architecture'].map(skill => (
                    <span key={skill} className="bg-surface border border-outline px-3 py-1 text-xs font-bold text-foreground rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="md:col-span-2 space-y-12">
              <div>
                <h3 className="font-display font-bold text-xl text-foreground mb-4">Biography</h3>
                <p className="text-foreground/80 leading-relaxed">
                  Passionate researcher focused on building scalable systems and exploring the boundaries of artificial intelligence. Committed to bridging the gap between academic theory and practical engineering applications. Background involves multiple cross-departmental collaborations and open-source contributions.
                </p>
                <Link href="#" className="inline-flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mt-4 hover:underline">
                  <LinkIcon className="w-4 h-4" /> Download CV / Resume
                </Link>
              </div>

              <div>
                <h3 className="font-display font-bold text-xl text-foreground mb-6 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" /> 
                  {profile.role === 'faculty' ? 'Supervised Projects' : 'Project Activity'}
                </h3>
                <div className="space-y-4">
                  {projects.length > 0 ? projects.map((p: any) => p && (
                    <div key={p.id} className="border border-outline bg-surface p-6 rounded-lg flex items-center justify-between group">
                      <div>
                        <h4 className="font-bold text-foreground group-hover:text-primary transition-colors cursor-pointer">{p.title}</h4>
                        <span className="text-xs font-bold text-foreground/50 uppercase tracking-widest mt-1 hidden md:block">Status: {p.status}</span>
                      </div>
                      <Link href={`/projects/${p.id}`} className="p-2 border border-outline rounded hover:bg-primary hover:text-white transition-colors">
                        View
                      </Link>
                    </div>
                  )) : (
                    <div className="text-foreground/50 italic py-4">No public projects available.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
