import Link from "next/link";
import {
  ArrowRight,
  Atom,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  ChartSpline,
  FlaskConical,
  Lightbulb,
  MessagesSquare,
  Microscope,
  Newspaper,
  Orbit,
  Rocket,
  SatelliteDish,
  Send,
  UserRoundSearch,
  UsersRound,
} from "lucide-react";

const features = [
  { icon: FlaskConical, title: "Research projects", text: "Find detailed, faculty-led projects and apply through a structured student workflow.", href: "/projects" },
  { icon: UserRoundSearch, title: "Faculty expertise", text: "Discover verified mentors by department, research area and academic profile.", href: "/faculty" },
  { icon: Newspaper, title: "Research intelligence", text: "Read curated science, engineering and technology briefs with primary sources.", href: "/feed" },
  { icon: MessagesSquare, title: "Academic forum", text: "Ask technical questions, compare methods and learn from faculty-guided replies.", href: "/forum" },
  { icon: BookOpen, title: "Publications", text: "Explore research outputs and connect projects to the evidence behind them.", href: "/publications" },
  { icon: BriefcaseBusiness, title: "Opportunities", text: "Review focused research sprints, reading groups and translation activities.", href: "/opportunities" },
];

const pillars = [
  { icon: UsersRound, title: "Collaborate", text: "Connect with students, faculty and researchers across disciplines.", accent: "navy" },
  { icon: Microscope, title: "Research", text: "Explore substantial projects, publications and evidence briefs.", accent: "red" },
  { icon: Rocket, title: "Innovate", text: "Turn rigorous ideas into prototypes with responsible mentorship.", accent: "navy" },
  { icon: CalendarDays, title: "Stay current", text: "Follow focused research sprints, seminars and technical discussions.", accent: "red" },
];

function CampusSketch() {
  return (
    <svg viewBox="0 0 1200 330" className="h-auto w-full text-[#17345f]" role="img" aria-label="Code-drawn university campus illustration">
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M30 285 C170 245 280 260 385 285 C510 314 690 305 820 276 C970 243 1085 251 1170 286" strokeWidth="3" opacity=".45" />
        <path d="M155 252V132h282v120M437 252V82h166v170M603 252V116h309v136M912 252V157h138v95" strokeWidth="5" />
        <path d="M188 132V103h215v29M469 82V55h102v27M640 116V91h235v25" strokeWidth="4" />
        <path d="M170 252h265M455 252h151M622 252h293M929 252h122" strokeWidth="8" />
        <path d="M195 155h215M195 184h215M195 213h215M462 112h132M462 148h132M462 184h132M633 143h270M633 177h270M633 211h270" strokeWidth="2.5" opacity=".8" />
        <path d="M236 132v120M292 132v120M348 132v120M505 82v170M553 82v170M681 116v136M737 116v136M793 116v136M849 116v136M963 157v95M1009 157v95" strokeWidth="2" opacity=".62" />
        <path d="M476 252v-48h36v48M545 252v-48h36v48M733 252v-51h49v51" strokeWidth="3.5" />
        <ellipse cx="584" cy="285" rx="118" ry="25" strokeWidth="4" />
        <ellipse cx="584" cy="277" rx="72" ry="15" strokeWidth="2.5" />
        <path d="M584 276V220M566 244c12 8 24 8 36 0M574 230c7 5 14 5 21 0" strokeWidth="3" />
        <path d="M555 279c8-21 18-33 29-37c11 4 21 16 29 37" strokeWidth="2" opacity=".7" />
        <path d="M58 285c8-43 22-67 42-72c20 5 34 29 42 72M92 285v-64M73 242l19 12l22-17M1032 284c7-48 22-74 44-80c22 6 37 32 44 80M1076 284v-70M1051 238l25 16l26-21" strokeWidth="4" />
        <path d="M4 306h1192" strokeWidth="4" />
      </g>
      <g fill="#d6222a" opacity=".86">
        <rect x="212" y="146" width="7" height="9" rx="1" /><rect x="268" y="175" width="7" height="9" rx="1" />
        <rect x="326" y="205" width="7" height="9" rx="1" /><rect x="481" y="123" width="7" height="9" rx="1" />
        <rect x="529" y="159" width="7" height="9" rx="1" /><rect x="657" y="154" width="7" height="9" rx="1" />
        <rect x="765" y="188" width="7" height="9" rx="1" /><rect x="865" y="220" width="7" height="9" rx="1" />
      </g>
    </svg>
  );
}

export default function EntryHome() {
  return (
    <div className="overflow-hidden bg-[#f7f2e8] text-[#0a1f3d]">
      <section className="relative isolate min-h-[calc(100svh-72px)] overflow-hidden border-b border-[#17345f]/15 px-5 pb-16 pt-12 md:px-8 md:pt-16">
        <div aria-hidden="true" className="absolute -left-28 -top-20 h-48 w-96 -rotate-12 rounded-[48%] bg-[#173f78] md:-left-24 md:-top-28 md:h-80 md:w-[34rem]" />
        <div aria-hidden="true" className="absolute -right-32 bottom-10 h-36 w-[30rem] rotate-[-18deg] rounded-[50%] bg-[#d6222a]/90" />
        <div aria-hidden="true" className="absolute inset-0 opacity-45 [background-image:radial-gradient(#17345f_0.7px,transparent_0.7px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)]" />

        <Orbit aria-hidden="true" className="absolute left-[6%] top-24 hidden h-24 w-24 -rotate-12 text-white/90 md:block" strokeWidth={1.2} />
        <div aria-hidden="true" className="absolute left-[9%] top-60 hidden -rotate-6 font-mono text-sm leading-7 text-[#17345f]/55 lg:block">
          <p>E = mc²</p>
          <p className="mt-4">for idea in research:</p>
          <p className="pl-5">question();</p>
          <p className="pl-5">validate();</p>
          <p className="pl-5">share();</p>
        </div>
        <Send aria-hidden="true" className="absolute right-[9%] top-44 hidden h-16 w-16 rotate-12 text-[#17345f]/75 lg:block" strokeWidth={1.3} />
        <Lightbulb aria-hidden="true" className="absolute bottom-[27%] left-[5%] hidden h-20 w-20 -rotate-12 text-[#d6222a]/80 lg:block" strokeWidth={1.3} />
        <SatelliteDish aria-hidden="true" className="absolute bottom-8 right-[3%] hidden h-24 w-24 text-[#17345f]/80 md:block" strokeWidth={1.2} />
        <ChartSpline aria-hidden="true" className="absolute bottom-4 left-[42%] hidden h-16 w-28 text-[#17345f]/35 xl:block" strokeWidth={1.2} />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-[#d6222a] bg-[#f7f2e8] shadow-[0_0_0_7px_rgba(214,34,42,0.08)]">
              <Atom className="h-12 w-12 text-[#d6222a]" strokeWidth={1.6} />
            </div>
            <p className="mt-6 font-serif text-2xl italic text-[#d6222a] md:text-3xl">Welcome to</p>
            <h1 className="mt-1 text-[clamp(4rem,12vw,9rem)] font-black uppercase leading-[0.72] tracking-[-0.06em]">
              <span className="block -rotate-1 text-[#123b73]">NSUT</span>
              <span className="mt-5 block rotate-[-1deg] text-[#d6222a]">Connect</span>
            </h1>
            <div className="mx-auto mt-5 h-2 w-72 -rotate-2 rounded-full bg-[#d6222a] md:w-[32rem]" />
            <p className="mt-8 text-xs font-black uppercase tracking-[0.36em] text-[#17345f] md:text-sm">Collaborate. Innovate. Impact.</p>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#17345f]/75 md:text-lg">
              A research and collaboration hub for NSUT students, faculty and innovators—built as a staging prototype pending institutional approval.
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
              <Link href="/login" className="inline-flex items-center justify-center gap-3 rounded-md bg-[#d6222a] px-8 py-4 text-xs font-black uppercase tracking-[0.14em] text-white shadow-lg shadow-[#d6222a]/15 transition-transform hover:-translate-y-0.5">
                Enter NSUT Connect <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/home" className="inline-flex items-center justify-center gap-3 rounded-md border-2 border-[#17345f] bg-[#f7f2e8]/90 px-8 py-4 text-xs font-black uppercase tracking-[0.14em] text-[#17345f] transition-colors hover:bg-[#17345f] hover:text-white">
                Explore research <UserRoundSearch className="h-4 w-4" />
              </Link>
            </div>
            <p className="mt-4 text-sm text-[#17345f]/65">New participant? <Link href="/signup" className="font-black text-[#d6222a] hover:underline">Create an account</Link></p>
          </div>

          <div className="relative mx-auto mt-8 max-w-6xl">
            <CampusSketch />
            <div className="relative z-10 mx-auto -mt-3 grid max-w-5xl overflow-hidden rounded-xl border border-[#17345f]/15 bg-[#fffdf8]/95 shadow-[0_24px_70px_-30px_rgba(10,31,61,0.5)] sm:grid-cols-2 lg:grid-cols-4">
              {pillars.map(({ icon: Icon, title, text, accent }) => (
                <article key={title} className="border-b border-[#17345f]/10 p-6 last:border-b-0 sm:border-r lg:border-b-0">
                  <Icon className={`h-8 w-8 ${accent === "red" ? "text-[#d6222a]" : "text-[#123b73]"}`} strokeWidth={1.7} />
                  <h2 className="mt-4 text-lg font-black">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#17345f]/68">{text}</p>
                  <div className={`mt-5 h-0.5 w-10 ${accent === "red" ? "bg-[#d6222a]" : "bg-[#123b73]"}`} />
                </article>
              ))}
            </div>
          </div>

          <blockquote className="mx-auto mt-10 max-w-2xl text-center font-serif text-lg italic text-[#17345f]/72">
            “Research begins with a better question—and grows through careful collaboration.”
          </blockquote>
        </div>
      </section>

      <section className="relative px-6 py-20">
        <div aria-hidden="true" className="absolute -left-20 bottom-0 h-28 w-72 rotate-12 rounded-[50%] bg-[#123b73]/10" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-12 max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#d6222a]">What the portal includes</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">From discovery to accountable participation.</h2>
          </div>
          <div className="grid border-l border-t border-[#17345f]/20 md:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, text, href }, index) => (
              <Link key={title} href={href} className="group border-b border-r border-[#17345f]/20 bg-[#fffdf8]/55 p-8 transition-colors hover:bg-white">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full border ${index % 2 ? "border-[#d6222a]/30 text-[#d6222a]" : "border-[#123b73]/30 text-[#123b73]"}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-7 text-xl font-black transition-colors group-hover:text-[#d6222a]">{title}</h3>
                <p className="mt-3 min-h-16 text-sm leading-relaxed text-[#17345f]/65">{text}</p>
                <span className="mt-7 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#d6222a]">Explore <ArrowRight className="h-3.5 w-3.5" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#17345f]/20 bg-[#0a1f3d] px-6 py-14 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-white/55">Governance note</p>
            <h2 className="mt-2 text-2xl font-black">Internal research prototype pending institutional approval.</h2>
          </div>
          <Link href="/about" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white">Read the product overview <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </div>
  );
}
