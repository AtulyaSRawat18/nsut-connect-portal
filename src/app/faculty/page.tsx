import { Filter, Globe, Mail, Search } from "lucide-react";
import Link from "next/link";
import Pagination from "@/components/shared/Pagination";
import PageHeading from "@/components/shared/PageHeading";
import { DEPARTMENTS, getDepartmentLabel, isDepartmentId } from "@/lib/departments";
import { getPublicFaculty } from "@/lib/public-data";

const verificationFilters = ["all", "verified", "pending"] as const;

export default async function FacultyDirectory({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; department?: string; verification?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = (params?.q || "").trim();
  const verification = verificationFilters.includes(params?.verification as (typeof verificationFilters)[number]) ? params?.verification || "all" : "all";
  const selectedDepartment = isDepartmentId(params?.department) ? params.department : "all";
  const result = await getPublicFaculty({ q, department: selectedDepartment, verification, page: Number(params?.page || 1) });
  const faculty = result.data;

  return (
    <div className="portal-page">
      <div className="portal-container">
        <PageHeading eyebrow="People behind the research" title="Faculty directory" description="Find expertise across NSUT, explore shared interests, and connect with a mentor." />

        <form className="portal-filter-bar lg:grid-cols-[minmax(0,1fr)_13rem_11rem_auto]">
          <label className="relative"><Search className="absolute left-3 top-3.5 h-5 w-5 text-foreground/50" /><input type="search" aria-label="Search name, department, or research" name="q" defaultValue={q} placeholder="Search name, department, or research" className="w-full rounded-lg border border-outline bg-background py-3 pl-11 pr-4 text-sm outline-none focus:border-primary" /></label>
          <select name="department" defaultValue={selectedDepartment} aria-label="Filter faculty by department" className="rounded-lg border border-outline bg-background px-4 py-3 text-sm outline-none focus:border-primary">
            <option value="all">All departments</option>{DEPARTMENTS.map((department) => <option key={department.id} value={department.id}>{getDepartmentLabel(department.id)}</option>)}
          </select>
          <select name="verification" defaultValue={verification} aria-label="Filter faculty by verification" className="rounded-lg border border-outline bg-background px-4 py-3 text-sm outline-none focus:border-primary">
            <option value="all">All profiles</option><option value="verified">Verified</option><option value="pending">Not verified</option>
          </select>
          <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-5 py-3 text-xs font-bold normal-case tracking-normal text-background"><Filter className="h-4 w-4" /> Filter</button>
        </form>

        {result.error ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-12 text-center text-red-600">Faculty profiles are temporarily unavailable.</div>
        ) : (
          <div className="lazy-card-list grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {faculty.map((person) => (
              <article key={person.id} className="group border border-outline bg-surface p-8 transition-all hover:border-primary">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">{person.name.split(" ").at(-1)?.[0] || "F"}</div>
                  <div><h2 className="font-bold text-foreground transition-colors group-hover:text-primary">{person.name}</h2><p className="text-xs font-bold normal-case tracking-normal text-foreground/50">{person.role} · {getDepartmentLabel(person.dept)}{person.verified ? " · Verified" : ""}</p></div>
                </div>
                <p className="mb-6 text-sm font-medium italic text-foreground/70">&quot;{person.research}&quot;</p>
                <div className="flex gap-4">
                  <Link href={`mailto:${person.email}`} className="flex items-center gap-2 text-xs font-bold normal-case tracking-normal text-primary hover:underline"><Mail className="h-4 w-4" /> Email</Link>
                  <Link href={`/profile/${person.id}`} className="flex items-center gap-2 text-xs font-bold normal-case tracking-normal text-primary hover:underline"><Globe className="h-4 w-4" /> Profile</Link>
                </div>
              </article>
            ))}
            {faculty.length === 0 && <p className="col-span-full border border-dashed border-outline p-12 text-center text-foreground/50">No faculty profiles match these filters.</p>}
            <div className="col-span-full"><Pagination basePath="/faculty" currentPage={result.page} pageSize={result.pageSize} searchParams={{ q, department: selectedDepartment, verification }} totalCount={result.count} /></div>
          </div>
        )}
      </div>
    </div>
  );
}
