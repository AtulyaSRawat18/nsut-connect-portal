import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const envFile = new URL("../.env.local", import.meta.url);
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
    }
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const showcase = JSON.parse(readFileSync(new URL("../src/content/showcase.json", import.meta.url), "utf8"));
const departmentCatalog = JSON.parse(readFileSync(new URL("../src/content/departments.json", import.meta.url), "utf8"));
const password = process.env.DEMO_ACCOUNT_PASSWORD;
if (!url || !serviceKey) throw new Error("Missing Supabase URL or service-role key in .env.local.");
if (!password) throw new Error("Missing DEMO_ACCOUNT_PASSWORD in .env.local.");

const db = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
const departments = departmentCatalog.map((department) => department.id);
const departmentById = new Map(departmentCatalog.map((department) => [department.id, department]));
const departmentCode = (department) => (departmentById.get(department)?.shortName || "NSUT").replace(/[^A-Za-z0-9]/g, "").slice(0, 8).toUpperCase();
const facultyNames = "Aditi-Sharma,Raghav-Mehta,Sunita-Bansal,Vivek-Singh,Neha-Kapoor,Arjun-Malhotra,Kavita-Rao,Sameer-Khanna,Priya-Nair,Rohit-Verma,Meenal-Gupta,Ankit-Sethi,Nandini-Iyer,Harish-Yadav,Swati-Arora,Kunal-Joshi,Ritu-Chandra,Abhinav-Jain,Pooja-Menon,Siddharth-Bose,Charu-Aggarwal,Manish-Tandon,Divya-Kulkarni,Gaurav-Saxena".split(",").map((name) => `Dr. ${name.replace("-", " ")}`);
const studentNames = "Aarav-Sharma,Aanya-Gupta,Vivaan-Mehta,Diya-Kapoor,Aditya-Verma,Myra-Nair,Arjun-Singh,Ananya-Joshi,Kabir-Malhotra,Ishita-Rao,Reyansh-Jain,Meher-Sethi,Atharv-Khanna,Sara-Iyer,Dhruv-Yadav,Navya-Arora,Rohan-Bose,Kiara-Menon,Yash-Tandon,Avni-Saxena,Laksh-Chandra,Pari-Kulkarni,Nikhil-Bhatia,Saanvi-Mishra".split(",").map((name) => name.replace("-", " "));
const research = ["Artificial Intelligence", "Embedded Systems", "Computer Vision", "Wireless Networks", "Cybersecurity", "Renewable Energy", "Natural Language Processing", "Robotics", "Data Science", "Semiconductor Devices", "Cloud Systems", "Human-Computer Interaction"];

const uuid = (key) => {
  const hex = createHash("sha256").update(`nsut-demo:${key}`).digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
};
const ago = (days) => new Date(Date.now() - days * 86400000).toISOString();
const must = async (label, promise) => {
  const result = await promise;
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  return result.data;
};

const faculty = facultyNames.map((name, i) => ({ name, email: `demo.faculty${String(i + 1).padStart(2, "0")}@nsut.ac.in`, role: "faculty", department: departments[i % departments.length], designation: ["Professor", "Associate Professor", "Assistant Professor"][i % 3], research: research[i % research.length] }));
const students = studentNames.map((name, i) => ({ name, email: `demo.student${String(i + 1).padStart(2, "0")}@nsut.ac.in`, role: "student", department: departments[i % departments.length], roll: `2026U${departmentCode(departments[i % departments.length])}${String(i + 1).padStart(3, "0")}`, course: i % 5 ? "B.Tech" : "M.Tech", year: i % 4 + 1 }));
const moderator = { name: "Meera Sinha", email: "demo.moderator@nsut.ac.in", role: "moderator", department: "Administration" };
const accounts = [...faculty, ...students, moderator];

async function authUsers() {
  const all = [];
  for (let page = 1; ; page++) {
    const data = await must("List Auth users", db.auth.admin.listUsers({ page, perPage: 1000 }));
    all.push(...data.users);
    if (data.users.length < 1000) break;
  }
  const existing = new Map(all.filter((u) => u.email).map((u) => [u.email.toLowerCase(), u]));
  for (const account of accounts) {
    const metadata = { full_name: account.name, role: account.role === "faculty" ? "faculty" : "student", department: account.department, designation: account.designation || "", roll_number: account.roll || "", course: account.course || "", year: account.year ? String(account.year) : "", demo_account: true };
    const current = existing.get(account.email);
    if (current) {
      await must(`Update ${account.email}`, db.auth.admin.updateUserById(current.id, { password, email_confirm: true, user_metadata: metadata }));
      account.id = current.id;
    } else {
      const created = await must(`Create ${account.email}`, db.auth.admin.createUser({ email: account.email, password, email_confirm: true, user_metadata: metadata }));
      account.id = created.user.id;
    }
  }
}

function records() {
  const users = accounts.map((a, i) => ({ id: a.id, name: a.name, email: a.email, role: a.role, is_content_handler: a.role === "faculty" && i % 4 === 0, account_status: "active", approved_at: ago(60), created_at: ago(180 - i), updated_at: ago(i % 8) }));
  const profiles = accounts.map((a, i) => ({ id: a.id, email: a.email, nsut_roll_number: a.roll || null, role: a.role === "moderator" ? "student" : a.role, full_name: a.name, department: a.department, is_content_handler: a.role === "faculty" && i % 4 === 0, created_at: ago(180 - i) }));
  const facultyProfiles = faculty.map((a, i) => ({ user_id: a.id, department: a.department, designation: a.designation, research_area: a.research, bio: `${a.name} researches ${a.research.toLowerCase()} and mentors interdisciplinary student teams.`, office_location: `${a.department} Block, Room ${201 + i}`, office_hours: ["Mon/Wed 2-4 PM", "Tue/Thu 11 AM-1 PM", "Friday 10 AM-12 PM"][i % 3], scholar_url: `https://scholar.google.com/scholar?q=${encodeURIComponent(a.name)}`, website_url: null, verification_status: i < 18 ? "approved" : ["pending", "reviewing", "changes_requested"][i % 3] }));
  const studentProfiles = students.map((a) => ({ user_id: a.id, roll_number: a.roll, course: a.course, year: a.year, department: a.department }));
  const projects = showcase.projects.map((item, i) => ({ id: item.id, title: item.title, description: item.summary, department: item.department, status: item.status, faculty_id: faculty[item.leadIndex].id, max_students: item.maxStudents, brief_url: item.pdf, progress_percent: [45, 30, 20, 55][i], health_status: i === 2 ? "at_risk" : "on_track", progress_note: ["Dataset protocol complete; embedded baseline validation is in progress.", "Study-area data audit complete; uncertainty model is being designed.", "Biosafety review is required before laboratory validation.", "Ontology and licensing audit complete; bilingual retrieval evaluation is active."][i], last_assessed_at: ago(i), created_at: ago(14 - i * 3), updated_at: ago(i) }));
  const applications = students.slice(0, 8).map((student, i) => { const project = projects[i % projects.length]; return { id: uuid(`application:${i}`), project_id: project.id, student_id: student.id, statement_of_purpose: `I want to contribute to ${project.title}. My proposed first milestone is to reproduce the baseline, document its limits and agree an eight-hour weekly plan with the project lead.`, resume_url: null, status: ["pending", "accepted", "pending", "rejected"][i % 4], applied_at: ago(8 - i % 6) }; });
  const publications = [
    { title: "Quantized Temporal Models for Edge Battery Diagnostics", faculty: 1 },
    { title: "Uncertainty-Aware InSAR Screening for Slope Inspection", faculty: 6 },
    { title: "Reproducible Image Analysis for Microfluidic Susceptibility Assays", faculty: 7 },
    { title: "Provenance-First Bilingual Retrieval for Indian Scientific Metadata", faculty: 0 },
  ].map((item, i) => ({ id: uuid(`publication:${i}`), title: item.title, authors: [faculty[item.faculty].name, students[i].name], published_date: `2026-0${i + 3}-15`, url: null, faculty_id: faculty[item.faculty].id, created_at: ago(90 - i * 12) }));
  const forum = showcase.forum.map((item, i) => ({ id: item.id, title: item.title, content: item.content, author_id: faculty[item.authorIndex].id, department: item.department, upvotes: item.upvotes, created_at: ago(6 - i * 2) }));
  const forumReplies = showcase.forum.flatMap((item, postIndex) => item.replies.map((reply, replyIndex) => ({ id: uuid(`forum-reply:${postIndex}:${replyIndex}`), post_id: item.id, author_id: (accounts.find((account) => account.name === reply.author) || faculty[item.authorIndex]).id, content: reply.content, score: reply.posted === "Accepted guidance" ? 8 : Math.max(1, 4 - replyIndex), created_at: ago(5 - postIndex - replyIndex / 4), updated_at: ago(postIndex) })));
  const announcements = showcase.news.map((item, i) => ({ id: item.id, title: item.title, content: item.summary, source_url: item.sourceUrl, author_id: faculty[i].id, category: item.category, department: item.department, created_at: item.date }));
  const highlights = showcase.opportunities.map((item, i) => ({ id: item.id, title: item.title, description: item.summary, type: item.type, link_url: item.sourceUrl, deadline: item.deadline, department: item.department, created_at: ago(5 - i * 2) }));
  const reports = [
    ["forum_post", forum[0].id, "Review the thread for unsupported safety claims."],
    ["announcement", announcements[0].id, "Verify that the source attribution is clear."],
    ["project", projects[2].id, "Confirm that biosafety review is required before wet-lab work."],
    ["application", applications[0].id, "Check that the application contains no sensitive information."],
  ].map(([entity_type, entity_id, summary], i) => ({ id: uuid(`report:${i}`), reporter_id: students[i].id, entity_type, entity_id, category: ["misinformation", "other", "academic_integrity", "privacy"][i], summary, evidence: { source: "demo-seed", reference: `DEMO-${1000 + i}` }, priority: ["normal", "low", "high", "normal"][i], status: ["open", "reviewing", "resolved", "dismissed"][i], assigned_to: i > 0 ? moderator.id : null, resolution_note: i > 1 ? "Reviewed by the demo moderation team." : null, created_at: ago(5 - i), updated_at: ago(i), resolved_at: i > 1 ? ago(i) : null }));
  const verifications = faculty.map((a, i) => { const status = i < 18 ? "approved" : ["pending", "reviewing", "changes_requested"][i % 3]; return { id: uuid(`verification:${i}`), faculty_id: a.id, department: a.department, designation: a.designation, employee_reference: `NSUT-${departmentCode(a.department)}-${4100 + i}`, evidence_url: `https://example.com/demo/faculty-evidence/${i + 1}.pdf`, status, submitted_at: ago(70 - i), reviewed_by: status === "approved" ? moderator.id : null, reviewed_at: status === "approved" ? ago(45 - i) : null, review_note: status === "approved" ? "Institutional identity verified." : null, updated_at: ago(i % 12) }; });
  return { users, profiles, facultyProfiles, studentProfiles, projects, applications, publications, forum, forumReplies, announcements, highlights, reports, verifications };
}

async function replaceOldDemoContent() {
  const oldIds = {
    content_reports: Array.from({ length: 16 }, (_, i) => uuid(`report:${i}`)),
    applications: Array.from({ length: 72 }, (_, i) => uuid(`application:${Math.floor(i / 3)}:${i % 3}`)).concat(Array.from({ length: 8 }, (_, i) => uuid(`application:${i}`))),
    publications: Array.from({ length: 40 }, (_, i) => uuid(`publication:${i}`)),
    forum_posts: Array.from({ length: 32 }, (_, i) => uuid(`forum:${i}`)),
    announcements: Array.from({ length: 20 }, (_, i) => uuid(`announcement:${i}`)),
    highlights: Array.from({ length: 24 }, (_, i) => uuid(`highlight:${i}`)),
    projects: Array.from({ length: 30 }, (_, i) => uuid(`project:${i}`)),
  };
  for (const table of ["content_reports", "applications", "publications", "forum_posts", "announcements", "highlights", "projects"]) {
    await must(`Replace old demo ${table}`, db.from(table).delete().in("id", oldIds[table]));
  }
}

async function seed(data) {
  await replaceOldDemoContent();
  await must("Profiles", db.from("profiles").upsert(data.profiles, { onConflict: "id" }));
  await must("Portal users", db.from("portal_users").upsert(data.users, { onConflict: "id" }));
  await must("Faculty profiles", db.from("faculty_profiles").upsert(data.facultyProfiles, { onConflict: "user_id" }));
  await must("Student profiles", db.from("student_profiles").upsert(data.studentProfiles, { onConflict: "user_id" }));
  await must("RBAC roles", db.from("user_roles").upsert(accounts.map((a) => ({ user_id: a.id, role_key: a.role })), { onConflict: "user_id,role_key" }));
  await must("Verification queue", db.from("faculty_verification_requests").upsert(data.verifications, { onConflict: "faculty_id" }));
  for (const [table, rows] of [["projects", data.projects], ["applications", data.applications], ["publications", data.publications], ["forum_posts", data.forum], ["announcements", data.announcements], ["highlights", data.highlights], ["content_reports", data.reports]]) {
    await must(table, db.from(table).upsert(rows, { onConflict: "id" }));
  }
  await must("Forum replies", db.from("forum_replies").upsert(data.forumReplies, { onConflict: "id" }));
}

async function clean(data) {
  await must("Clean forum replies", db.from("forum_replies").delete().in("id", data.forumReplies.map((reply) => reply.id)));
  for (const [table, rows] of [["content_reports", data.reports], ["applications", data.applications], ["publications", data.publications], ["forum_posts", data.forum], ["announcements", data.announcements], ["highlights", data.highlights], ["projects", data.projects]]) {
    await must(`Clean ${table}`, db.from(table).delete().in("id", rows.map((r) => r.id)));
  }
  const ids = accounts.map((a) => a.id);
  await must("Clean portal users", db.from("portal_users").delete().in("id", ids));
  await must("Clean profiles", db.from("profiles").delete().in("id", ids));
  for (const account of accounts) await must(`Delete ${account.email}`, db.auth.admin.deleteUser(account.id));
}

for (const [table, columns] of [
  ["portal_users", "id,account_status"],
  ["faculty_profiles", "user_id,verification_status"],
  ["content_reports", "id,status"],
  ["faculty_verification_requests", "id,status"],
  ["user_roles", "user_id,role_key"],
  ["projects", "id,brief_url,progress_percent,health_status"],
  ["forum_replies", "id,score"],
]) {
  await must(`Schema preflight for ${table}`, db.from(table).select(columns).limit(1));
}

await authUsers();
const data = records();
if (process.argv.includes("--cleanup")) {
  await clean(data);
  console.log("Removed the namespaced demo accounts and content.");
} else {
  console.log("Seeding demo accounts and a focused editorial research dataset...");
  await seed(data);
  console.log("Demo seed complete.\n");
  console.log("Student:   demo.student01@nsut.ac.in");
  console.log("Student:   demo.student02@nsut.ac.in");
  console.log("Faculty:   demo.faculty01@nsut.ac.in");
  console.log("Faculty:   demo.faculty02@nsut.ac.in");
  console.log("Moderator: demo.moderator@nsut.ac.in");
}
