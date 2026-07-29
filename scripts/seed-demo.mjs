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
const password = process.env.DEMO_ACCOUNT_PASSWORD || "NSUTDemo!2026";
if (!url || !serviceKey) throw new Error("Missing Supabase URL or service-role key in .env.local.");

const db = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
const departments = "CSE ECE IT MAC ICE MECH CIVIL BT".split(" ");
const facultyNames = "Aditi-Sharma,Raghav-Mehta,Sunita-Bansal,Vivek-Singh,Neha-Kapoor,Arjun-Malhotra,Kavita-Rao,Sameer-Khanna,Priya-Nair,Rohit-Verma,Meenal-Gupta,Ankit-Sethi,Nandini-Iyer,Harish-Yadav,Swati-Arora,Kunal-Joshi,Ritu-Chandra,Abhinav-Jain,Pooja-Menon,Siddharth-Bose,Charu-Aggarwal,Manish-Tandon,Divya-Kulkarni,Gaurav-Saxena".split(",").map((name) => `Dr. ${name.replace("-", " ")}`);
const studentNames = "Aarav-Sharma,Aanya-Gupta,Vivaan-Mehta,Diya-Kapoor,Aditya-Verma,Myra-Nair,Arjun-Singh,Ananya-Joshi,Kabir-Malhotra,Ishita-Rao,Reyansh-Jain,Meher-Sethi,Atharv-Khanna,Sara-Iyer,Dhruv-Yadav,Navya-Arora,Rohan-Bose,Kiara-Menon,Yash-Tandon,Avni-Saxena,Laksh-Chandra,Pari-Kulkarni,Nikhil-Bhatia,Saanvi-Mishra".split(",").map((name) => name.replace("-", " "));
const research = ["Artificial Intelligence", "Embedded Systems", "Computer Vision", "Wireless Networks", "Cybersecurity", "Renewable Energy", "Natural Language Processing", "Robotics", "Data Science", "Semiconductor Devices", "Cloud Systems", "Human-Computer Interaction"];
const projectTitles = ["Campus Energy Digital Twin", "Multilingual Student Support Assistant", "Privacy-Preserving Health Analytics", "Delhi Air Quality Forecasting", "Autonomous Indoor Delivery Robot", "Low-Power Smart Irrigation Network", "Secure Academic Credential Wallet", "Urban Traffic Signal Optimization", "Sign Language Recognition Platform", "Flood Risk Mapping with Satellite Data", "Edge AI for Equipment Monitoring", "Explainable Scholarship Recommendation", "Waste Segregation Vision System", "Resilient Microgrid Controller", "Research Paper Knowledge Graph", "Accessible Campus Navigation", "Electric Vehicle Battery Diagnostics", "Water Distribution Leak Detection", "Federated Learning Security Lab", "Smart Classroom Occupancy Analytics", "Indian Language Document Understanding", "Drone-Based Structural Inspection", "Mental Wellness Resource Discovery", "Open Source Hardware Testbed", "Alumni Mentorship Matching", "Sustainable Materials Data Platform", "IoT Network Intrusion Detection", "Climate-Aware Building Controls", "Assistive Reading Companion", "University Research Impact Dashboard"];
const paperTitles = ["Federated Learning for Campus Networks", "Explainable Urban Air Quality Forecasting", "Verifiable Academic Credentials", "Edge Intelligence for Predictive Maintenance", "Renewable Microgrid Scheduling", "Indian Language Information Retrieval", "Vision Transformers in Low Light", "Privacy in Collaborative Analytics", "Digital Twins for Sustainable Infrastructure", "Research Collaboration Graph Learning"];

const uuid = (key) => {
  const hex = createHash("sha256").update(`nsut-demo:${key}`).digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
};
const ago = (days) => new Date(Date.now() - days * 86400000).toISOString();
const future = (days) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
const must = async (label, promise) => {
  const result = await promise;
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  return result.data;
};

const faculty = facultyNames.map((name, i) => ({ name, email: `demo.faculty${String(i + 1).padStart(2, "0")}@nsut.ac.in`, role: "faculty", department: departments[i % departments.length], designation: ["Professor", "Associate Professor", "Assistant Professor"][i % 3], research: research[i % research.length] }));
const students = studentNames.map((name, i) => ({ name, email: `demo.student${String(i + 1).padStart(2, "0")}@nsut.ac.in`, role: "student", department: departments[i % departments.length], roll: `2026U${departments[i % departments.length]}${String(i + 1).padStart(3, "0")}`, course: i % 5 ? "B.Tech" : "M.Tech", year: i % 4 + 1 }));
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
  const studentProfiles = students.map((a) => ({ user_id: a.id, roll_number: a.roll, course: a.course, year: a.year }));
  const projects = projectTitles.map((title, i) => ({ id: uuid(`project:${i}`), title, description: `An interdisciplinary ${faculty[i % faculty.length].department} initiative to prototype, evaluate and document ${title.toLowerCase()} using reproducible methods.`, department: faculty[i % faculty.length].department, status: i % 7 ? "open" : "closed", faculty_id: faculty[i % faculty.length].id, max_students: 2 + i % 5, created_at: ago(75 - i), updated_at: ago(i % 12) }));
  const applications = students.flatMap((student, i) => [0, 1, 2].map((offset) => { const project = projects[(i * 2 + offset * 7) % projects.length]; return { id: uuid(`application:${i}:${offset}`), project_id: project.id, student_id: student.id, statement_of_purpose: `I want to contribute my ${student.department} experience to ${project.title}. I can commit eight hours weekly and document all outcomes.`, resume_url: null, status: ["pending", "accepted", "rejected"][(i + offset) % 3], applied_at: ago(28 - (i + offset) % 24) }; }));
  const publications = Array.from({ length: 40 }, (_, i) => ({ id: uuid(`publication:${i}`), title: `${paperTitles[i % paperTitles.length]}${i >= 10 ? `: Study ${Math.floor(i / 10) + 1}` : ""}`, authors: [faculty[i % faculty.length].name, faculty[(i + 5) % faculty.length].name, students[i % students.length].name], published_date: `${2022 + i % 5}-${String(i % 12 + 1).padStart(2, "0")}-${String(i % 25 + 1).padStart(2, "0")}`, url: `https://doi.org/10.5555/nsut.demo.${2026000 + i}`, faculty_id: faculty[i % faculty.length].id, created_at: ago(240 - i) }));
  const forum = Array.from({ length: 32 }, (_, i) => { const author = i % 4 ? students[i % students.length] : faculty[i % faculty.length]; return { id: uuid(`forum:${i}`), title: ["Hackathon teammate search", "Embedded systems resources", "Approaching faculty for research", "Open-source contribution circle", "GATE preparation strategies", "Campus accessibility ideas", "Paper reading group", "Laboratory orientation notes"][i % 8] + ` #${Math.floor(i / 8) + 1}`, content: `Share practical resources, experiences and collaborators relevant to ${author.department}. This is a seeded community discussion.`, author_id: author.id, department: author.department, upvotes: 4 + i * 7 % 91, created_at: ago(i) }; });
  const announcements = Array.from({ length: 20 }, (_, i) => ({ id: uuid(`announcement:${i}`), title: ["Research internships open", "Trustworthy AI seminar", "Laboratory access update", "Industry lecture registration", "Innovation week", "Student project demonstrations", "Library database orientation", "Research showcase", "Scientific writing workshop", "Sustainability challenge"][i % 10] + (i > 9 ? ` - ${faculty[i].department}` : ""), content: `${faculty[i % faculty.length].department} invites students and faculty to participate. Registration and schedule details are available through the department office.`, author_id: faculty[i % faculty.length].id, category: ["research", "academic", "event", "general"][i % 4], created_at: ago(i * 2) }));
  const highlights = Array.from({ length: 24 }, (_, i) => { const type = ["internship", "scholarship", "event", "highlight"][i % 4]; return { id: uuid(`highlight:${i}`), title: `${type[0].toUpperCase() + type.slice(1)} opportunity ${i + 1}`, description: `A curated ${type} opportunity for NSUT students with mentoring and interdisciplinary participation.`, type, link_url: `https://example.com/nsut/${type}/${i + 1}`, deadline: type === "highlight" ? null : future(10 + i * 2), created_at: ago(i) }; });
  const reports = Array.from({ length: 16 }, (_, i) => { const refs = [["forum_post", forum[i].id], ["announcement", announcements[i % 20].id], ["project", projects[i].id], ["profile", faculty[i].id], ["application", applications[i].id]]; const [entity_type, entity_id] = refs[i % refs.length]; const status = ["open", "reviewing", "resolved", "dismissed"][i % 4]; return { id: uuid(`report:${i}`), reporter_id: students[i].id, entity_type, entity_id, category: ["spam", "harassment", "misinformation", "privacy", "academic_integrity", "other"][i % 6], summary: `Demo moderation report ${i + 1}: review this ${entity_type.replace("_", " ")} for community-standard compliance.`, evidence: { source: "demo-seed", reference: `DEMO-${1000 + i}` }, priority: ["low", "normal", "high", "urgent"][i % 4], status, assigned_to: i % 3 === 0 ? moderator.id : null, resolution_note: ["resolved", "dismissed"].includes(status) ? "Reviewed by the demo moderation team." : null, created_at: ago(18 - i), updated_at: ago(i % 5), resolved_at: ["resolved", "dismissed"].includes(status) ? ago(i % 4) : null }; });
  const verifications = faculty.map((a, i) => { const status = i < 18 ? "approved" : ["pending", "reviewing", "changes_requested"][i % 3]; return { id: uuid(`verification:${i}`), faculty_id: a.id, department: a.department, designation: a.designation, employee_reference: `NSUT-${a.department}-${4100 + i}`, evidence_url: `https://example.com/demo/faculty-evidence/${i + 1}.pdf`, status, submitted_at: ago(70 - i), reviewed_by: status === "approved" ? moderator.id : null, reviewed_at: status === "approved" ? ago(45 - i) : null, review_note: status === "approved" ? "Institutional identity verified." : null, updated_at: ago(i % 12) }; });
  return { users, profiles, facultyProfiles, studentProfiles, projects, applications, publications, forum, announcements, highlights, reports, verifications };
}

async function seed(data) {
  await must("Profiles", db.from("profiles").upsert(data.profiles, { onConflict: "id" }));
  await must("Portal users", db.from("portal_users").upsert(data.users, { onConflict: "id" }));
  await must("Faculty profiles", db.from("faculty_profiles").upsert(data.facultyProfiles, { onConflict: "user_id" }));
  await must("Student profiles", db.from("student_profiles").upsert(data.studentProfiles, { onConflict: "user_id" }));
  await must("RBAC roles", db.from("user_roles").upsert(accounts.map((a) => ({ user_id: a.id, role_key: a.role })), { onConflict: "user_id,role_key" }));
  await must("Verification queue", db.from("faculty_verification_requests").upsert(data.verifications, { onConflict: "faculty_id" }));
  for (const [table, rows] of [["projects", data.projects], ["applications", data.applications], ["publications", data.publications], ["forum_posts", data.forum], ["announcements", data.announcements], ["highlights", data.highlights], ["content_reports", data.reports]]) {
    await must(table, db.from(table).upsert(rows, { onConflict: "id" }));
  }
}

async function clean(data) {
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
]) {
  await must(`Schema preflight for ${table}`, db.from(table).select(columns).limit(1));
}

await authUsers();
const data = records();
if (process.argv.includes("--cleanup")) {
  await clean(data);
  console.log("Removed the namespaced demo accounts and content.");
} else {
  console.log("Seeding 24 faculty, 24 students, one moderator and linked page content...");
  await seed(data);
  console.log("Demo seed complete.\n");
  console.log("Student:   demo.student01@nsut.ac.in");
  console.log("Student:   demo.student02@nsut.ac.in");
  console.log("Faculty:   demo.faculty01@nsut.ac.in");
  console.log("Faculty:   demo.faculty02@nsut.ac.in");
  console.log("Moderator: demo.moderator@nsut.ac.in");
  console.log(`Password:  ${password}`);
}
