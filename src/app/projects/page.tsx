import Link from "next/link";
import { Search, Filter, ArrowRight } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function Projects(props: { searchParams?: Promise<{ q?: string }> }) {
  const supabase = await createClient();
  const searchParams = await props.searchParams;
  const q = searchParams?.q || '';

  let query = supabase.from('projects').select('*, portal_users(name, id)').order('created_at', { ascending: false });
  if (q) {
    query = query.ilike('title', `%${q}%`);
  }

  let { data: projects } = await query;

  // Dummy data fallback
  if (!projects || projects.length === 0) {
    projects = [
      {
        id: '1',
        title: 'Federated Learning for Edge Devices in Healthcare',
        description: 'Investigating privacy-preserving machine learning models optimized for low-power edge computing nodes in remote healthcare monitoring systems.',
        department: 'CSE',
        status: 'open',
        created_at: new Date().toISOString(),
        portal_users: { name: 'Dr. Anita Sharma' }
      },
      {
        id: '2',
        title: 'Sustainable Smart Grid Infrastructure',
        description: 'Development of IoT-based monitoring systems for residential smart grids to optimize energy consumption and reduce waste.',
        department: 'ECE',
        status: 'open',
        created_at: new Date().toISOString(),
        portal_users: { name: 'Dr. Ramesh Kumar' }
      },
      {
        id: '3',
        title: 'AI-Driven Traffic Management System',
        description: 'Using real-time computer vision data to dynamic calibrate traffic signals and reduce congestion in urban environments.',
        department: 'IT',
        status: 'closed',
        created_at: new Date().toISOString(),
        portal_users: { name: 'Dr. Sunita Bansal' }
      }
    ];
  }

  return (
    <div className="min-h-screen bg-background font-sans py-16">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-5xl md:text-6xl font-display font-extrabold text-primary mb-6 tracking-tight">Project Listings</h1>
        <p className="text-lg text-on-surface-variant font-medium max-w-2xl mb-16 leading-relaxed">
          Discover ongoing research initiatives across all departments. Use the filters to find projects aligned with your interests and academic background.
        </p>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filter */}
          <div className="w-full lg:w-1/4">
            <div className="bg-surface-container-lowest p-8 sticky top-24 border border-outline">
              <div className="flex items-center gap-3 mb-8">
                <Filter className="w-5 h-5 text-primary" />
                <h3 className="font-display font-bold text-lg text-on-surface">Filters</h3>
              </div>

              <div className="space-y-8">
                <div>
                  <h4 className="text-xs font-bold text-on-surface-variant tracking-widest uppercase mb-4">DEPARTMENT</h4>
                  <div className="space-y-3">
                    {['CSE', 'ECE', 'IT', 'MECH', 'CIVIL', 'BBA'].map((dept) => (
                      <label key={dept} className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 bg-surface border-none rounded-sm text-primary focus:ring-primary-container" />
                        <span className="text-sm font-medium text-on-surface">{dept}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Feed */}
          <div className="w-full lg:w-3/4 space-y-6">
            {/* Search Bar */}
            <form className="bg-surface-container-lowest border border-outline p-4 flex items-center gap-4 transition-all focus-within:ring-2 focus-within:ring-primary">
              <Search className="w-5 h-5 text-on-surface-variant ml-2" />
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search by keywords or title..."
                className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline-variant font-medium"
              />
              <button type="submit" className="hidden">Search</button>
            </form>

            {/* Project Cards */}
            {projects && projects.length > 0 ? (
              projects.map((project: any) => (
                <div key={project.id} className="bg-surface-container-lowest border border-outline p-10 transition-all duration-300 hover:border-primary flex flex-col gap-6 group">
                  <div className="flex justify-between items-start">
                    <span className={`px-3 py-1 text-[10px] font-bold tracking-widest rounded uppercase ${project.status === 'open' ? 'bg-green-500/10 text-green-700' : 'bg-red-500/10 text-red-700'}`}>{project.status}</span>
                    <span className="text-[10px] font-bold text-on-surface-variant tracking-widest uppercase">
                      {new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-extrabold text-primary mb-3">
                      {project.title}
                    </h3>
                    <div className="mb-4">
                      <span className="inline-block bg-surface border border-outline px-2 py-1 text-xs text-foreground font-bold rounded">{project.department}</span>
                    </div>
                    <p className="text-on-surface-variant font-medium leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 overflow-hidden flex items-center justify-center text-primary font-bold">
                        {project.portal_users?.name?.charAt(0) || 'D'}
                      </div>
                      <span className="text-sm font-bold text-on-surface">{project.portal_users?.name || 'Unknown Faculty'}</span>
                    </div>
                    <Link href={`/projects/${project.id}`} className="text-xs font-bold text-white bg-primary px-4 py-2 tracking-widest uppercase flex items-center gap-2 hover:brightness-110 transition-colors">
                      VIEW DETAILS <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-on-surface-variant border border-outline">No projects found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
