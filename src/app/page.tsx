import Link from "next/link";
import { Users, FileText, ShieldCheck, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-x-0 inset-y-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop"
            alt="University Campus"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gray-900/70 mix-blend-multiply"></div>
          {/* subtle gradient overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            <h2 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight mb-4">
              Pioneering Academic <br className="hidden md:block" />
              <span className="text-primary">Research Excellence.</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl font-light">
              Connecting NSUT students and faculty for transparent, high-impact research collaboration.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/projects"
                className="bg-primary hover:bg-primary/90 text-white px-8 py-3.5 rounded font-bold tracking-wide transition-all shadow-lg hover:shadow-xl text-center flex items-center justify-center gap-2"
              >
                EXPLORE PROJECT LISTINGS
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/faculty"
                className="bg-white hover:bg-gray-100 text-gray-900 px-8 py-3.5 rounded font-bold tracking-wide transition-all shadow-lg text-center"
              >
                FACULTY DIRECTORY
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Unified Research Ecosystem Section */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12 border-b border-gray-200 dark:border-gray-800 pb-4">
            <div>
              <p className="text-xs font-bold text-primary tracking-widest uppercase mb-2">Institutional Resource</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">A Unified Research Ecosystem</h3>
            </div>
            <Link href="/faculty" className="hidden md:flex text-primary font-semibold text-sm items-center gap-1 hover:underline">
              VIEW ALL DEPARTMENTS <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-lg shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300">
              <Users className="w-8 h-8 text-primary mb-6" />
              <h4 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Faculty Directory</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-8 leading-relaxed">
                Access comprehensive profiles of NSUT faculty members, their research specializations, and publication history.
              </p>
              <Link href="/faculty" className="text-xs font-bold text-primary tracking-widest hover:text-primary/80 uppercase">FIND A MENTOR</Link>
            </div>

            {/* Card 2 */}
            <div className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-lg shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300">
              <FileText className="w-8 h-8 text-primary mb-6" />
              <h4 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Active Projects</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-8 leading-relaxed">
                Explore ongoing research initiatives across various engineering and technology departments seeking student researchers.
              </p>
              <Link href="/projects" className="text-xs font-bold text-primary tracking-widest hover:text-primary/80 uppercase">BROWSE LISTINGS</Link>
            </div>

            {/* Card 3 */}
            <div className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-lg shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300">
              <ShieldCheck className="w-8 h-8 text-primary mb-6" />
              <h4 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Compliance & Ethics</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-8 leading-relaxed">
                Institutional guidelines for research ethics, IP policy, and project management standards at NSUT.
              </p>
              <Link href="#" className="text-xs font-bold text-primary tracking-widest hover:text-primary/80 uppercase">READ GUIDELINES</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-[#171e2e] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-gray-700/50">
            <div className="text-center px-4">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">450+</div>
              <div className="text-xs font-bold tracking-widest uppercase text-gray-400">ACTIVE PROJECTS</div>
            </div>
            <div className="text-center px-4">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">1,200+</div>
              <div className="text-xs font-bold tracking-widest uppercase text-gray-400">RESEARCH STUDENTS</div>
            </div>
            <div className="text-center px-4">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">890</div>
              <div className="text-xs font-bold tracking-widest uppercase text-gray-400">PUBLICATIONS</div>
            </div>
            <div className="text-center px-4">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">34</div>
              <div className="text-xs font-bold tracking-widest uppercase text-gray-400">PATENTS PENDING</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Advance Your Research at NSUT</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
            Whether you are a faculty member initiating a project or a student seeking to contribute, the research portal is your primary gateway.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/projects/new" className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded font-bold tracking-wide transition-all shadow-md">
              NEW PROJECT PROPOSAL
            </Link>
            <Link href="/contact" className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-8 py-3 rounded font-bold tracking-wide transition-all">
              CONTACT RESEARCH OFFICE
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
