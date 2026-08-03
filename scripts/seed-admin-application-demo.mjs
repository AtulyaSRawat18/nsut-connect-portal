import { existsSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

if (!process.argv.includes("--confirm-staging")) {
  throw new Error("Refusing demo writes without --confirm-staging.");
}

const envFile = new URL("../.env.local", import.meta.url);
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.env.DEMO_ACCOUNT_PASSWORD;
if (!url || !serviceKey || !password) throw new Error("Missing staging Supabase configuration or DEMO_ACCOUNT_PASSWORD.");

const db = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
const must = async (label, promise) => {
  const result = await promise;
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  return result.data;
};

await must("Structured application schema", db.from("applications").select("id,skills_summary,availability_hours,resume_url,google_form_response_url,faculty_note,reviewed_at").limit(1));
await must("Admin permission schema", db.from("app_permissions").select("permission_key").eq("permission_key", "user.read").single());

const demoEmails = ["demo.student01@nsut.ac.in", "demo.student05@nsut.ac.in", "demo.faculty01@nsut.ac.in"];
const people = await must("Demo identities", db.from("portal_users").select("id,email,name").in("email", demoEmails));
const byEmail = new Map(people.map((person) => [person.email, person]));
for (const email of demoEmails) if (!byEmail.has(email)) throw new Error(`Missing ${email}; run npm run seed:demo first.`);

const faculty = byEmail.get("demo.faculty01@nsut.ac.in");
const students = [byEmail.get("demo.student01@nsut.ac.in"), byEmail.get("demo.student05@nsut.ac.in")];
const project = await must("Faculty demo project", db.from("projects").select("id,title").eq("faculty_id", faculty.id).eq("status", "open").not("brief_url", "is", null).order("created_at").limit(1).single());

const applications = [
  {
    student: students[0],
    sop: `I am applying to ${project.title} because it combines reproducible engineering analysis with a clear public-interest outcome. I can begin by reproducing the documented baseline, checking data quality and recording every modelling assumption. I will contribute eight hours each week, maintain an experiment log and present a concise validation report before proposing any model change.`,
    skills: "Python, NumPy, pandas and scikit-learn; reproducible Jupyter notebooks; Git-based collaboration; literature review; baseline evaluation and technical documentation.",
    cv: "/demo-cvs/aarav-sharma-research-cv.pdf",
    form: "https://docs.google.com/forms/d/e/DEMO-AARAV-NSUT-CONNECT/viewform",
  },
  {
    student: students[1],
    sop: `I want to join ${project.title} to strengthen its evidence and data-provenance workflow. My first contribution would be a structured audit of source licences, missing metadata and evaluation splits, followed by a small retrieval or classification baseline. I can commit eight hours per week and will document limitations, unsuccessful experiments and review questions for the faculty lead.`,
    skills: "Python and SQL; RDF and knowledge-graph fundamentals; data validation; bilingual information retrieval experiments; TypeScript prototyping and concise research documentation.",
    cv: "/demo-cvs/aditya-verma-research-cv.pdf",
    form: "https://docs.google.com/forms/d/e/DEMO-ADITYA-NSUT-CONNECT/viewform",
  },
];

for (const application of applications) {
  const existing = await must("Find demo application", db.from("applications").select("id").eq("project_id", project.id).eq("student_id", application.student.id).maybeSingle());
  const payload = {
    project_id: project.id,
    student_id: application.student.id,
    statement_of_purpose: application.sop,
    skills_summary: application.skills,
    availability_hours: 8,
    resume_url: application.cv,
    google_form_response_url: application.form,
    faculty_note: null,
    reviewed_at: null,
    status: "pending",
  };
  if (existing) await must("Update structured demo application", db.from("applications").update(payload).eq("id", existing.id));
  else await must("Create structured demo application", db.from("applications").insert(payload));
}

const adminEmail = "demo.admin@nsut.ac.in";
const authUsers = await must("List demo auth users", db.auth.admin.listUsers({ page: 1, perPage: 1000 }));
let adminAuth = authUsers.users.find((user) => user.email?.toLowerCase() === adminEmail);
if (!adminAuth) {
  const created = await must("Create normal demo admin auth account", db.auth.admin.createUser({ email: adminEmail, password, email_confirm: true, user_metadata: { full_name: "Prototype Administrator", role: "student", department: "Administration", demo_account: true } }));
  adminAuth = created.user;
} else {
  await must("Refresh demo admin credentials", db.auth.admin.updateUserById(adminAuth.id, { password, email_confirm: true }));
}

await must("Legacy admin profile", db.from("profiles").upsert({ id: adminAuth.id, email: adminEmail, role: "admin", full_name: "Prototype Administrator", department: "Administration", is_content_handler: false }, { onConflict: "id" }));
await must("Canonical admin profile", db.from("portal_users").upsert({ id: adminAuth.id, name: "Prototype Administrator", email: adminEmail, role: "admin", account_status: "active", approved_at: new Date().toISOString(), updated_at: new Date().toISOString() }, { onConflict: "id" }));
await must("Normalized admin role", db.from("user_roles").upsert({ user_id: adminAuth.id, role_key: "admin" }, { onConflict: "user_id,role_key" }));

console.log("Configured two structured pending applications for demo.faculty01@nsut.ac.in.");
console.log("Configured the staging-only prototype administrator: demo.admin@nsut.ac.in.");
