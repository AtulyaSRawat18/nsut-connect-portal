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
const facultyEducation = [
  "Ph.D. in Computer Science, IIT Delhi\nM.Tech. in Information Systems, DTU",
  "Ph.D. in Electrical Engineering, IIT Kanpur\nM.E. in Control Systems, PEC Chandigarh",
  "Ph.D. in Electronics and Communication, IISc Bengaluru\nM.Tech. in VLSI Design, NIT Kurukshetra",
  "Ph.D. in Applied Mathematics, University of Delhi\nM.Sc. in Mathematics, Hindu College",
  "Ph.D. in Mechanical Engineering, IIT Roorkee\nM.Tech. in Design Engineering, NIT Jaipur",
  "Ph.D. in Management Studies, IIT Bombay\nMBA in Technology Management, FMS Delhi",
];
const studentEducation = [
  "Currently pursuing B.Tech. at Netaji Subhas University of Technology.\nSenior secondary education completed in Delhi NCR.",
  "Undergraduate researcher at Netaji Subhas University of Technology.\nCoursework includes data structures, probability and technical communication.",
  "Currently pursuing an engineering degree at NSUT.\nCompleted school with a focus on mathematics, physics and computer science.",
  "NSUT student combining core engineering coursework with project-based research and open-source practice.",
];
const studentInterests = ["responsible machine learning", "embedded prototyping", "computer vision", "wireless systems", "cybersecurity", "clean-energy analytics", "language technology", "robotics", "data visualization", "semiconductor design", "cloud engineering", "accessible interfaces"];
const learningGoals = ["reproducible experiments", "field-ready prototypes", "clear technical writing", "open-source collaboration", "ethical data practice", "user-centred evaluation"];
const pick = (values, index, salt = 0) => values[(index * 7 + salt * 3) % values.length];

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
    const appMetadata = { demo_account: true };
    const current = existing.get(account.email);
    if (current) {
      await must(`Update ${account.email}`, db.auth.admin.updateUserById(current.id, { password, email_confirm: true, user_metadata: metadata, app_metadata: appMetadata }));
      account.id = current.id;
    } else {
      const created = await must(`Create ${account.email}`, db.auth.admin.createUser({ email: account.email, password, email_confirm: true, user_metadata: metadata, app_metadata: appMetadata }));
      account.id = created.user.id;
    }
  }
}

function records() {
  const users = accounts.map((a, i) => ({ id: a.id, name: a.name, email: a.email, role: a.role, is_content_handler: a.role === "faculty" && i % 4 === 0, account_status: "active", approved_at: ago(60), profile_completed_at: ago(45 - i / 4), created_at: ago(180 - i), updated_at: ago(i % 8) }));
  const profiles = accounts.map((a, i) => ({ id: a.id, email: a.email, nsut_roll_number: a.roll || null, role: a.role === "moderator" ? "student" : a.role, full_name: a.name, department: a.department, is_content_handler: a.role === "faculty" && i % 4 === 0, created_at: ago(180 - i) }));
  const facultyProfiles = faculty.map((a, i) => ({
    user_id: a.id,
    department: a.department,
    designation: a.designation,
    research_area: `${a.research}; ${pick(["digital public infrastructure", "sustainable systems", "trustworthy automation", "health technology", "urban resilience", "education technology"], i, 1)}`,
    bio: `${a.name} studies ${a.research.toLowerCase()} with an emphasis on ${pick(["reliable deployment", "responsible evaluation", "resource-efficient design", "interdisciplinary translation", "real-world validation", "inclusive engineering"], i, 2)}. ${pick(["Their group mentors undergraduate research teams and maintains reproducible project documentation.", "They collaborate with student teams on prototypes, datasets and peer-reviewed research.", "Their teaching connects foundational methods with practical campus and public-interest problems."], i, 3)}`,
    education: pick(facultyEducation, i, 4),
    contact_email: a.email,
    office_location: `${departmentById.get(a.department)?.shortName || "NSUT"} Block, Room ${201 + i}`,
    office_hours: pick(["Monday and Wednesday, 2:00-4:00 PM", "Tuesday and Thursday, 11:00 AM-1:00 PM", "Friday, 10:00 AM-12:00 PM", "Wednesday, 3:00-5:00 PM by appointment"], i, 5),
    scholar_url: `https://scholar.google.com/scholar?q=${encodeURIComponent(a.name)}`,
    orcid: `0000-0002-${String(1200 + i).padStart(4, "0")}-${String((i * 7) % 10)}`,
    website_url: "NA",
    github_url: `https://github.com/topics/${pick(["machine-learning", "embedded-systems", "computer-vision", "cybersecurity", "robotics", "data-science"], i, 6)}`,
    linkedin_url: "https://www.linkedin.com/school/nsut-delhi/",
    cv_url: "NA",
    verification_status: i < 18 ? "approved" : ["pending", "reviewing", "changes_requested"][i % 3],
  }));
  const studentProfiles = students.map((a, i) => ({
    user_id: a.id,
    roll_number: a.roll,
    course: a.course,
    year: a.year,
    department: a.department,
    bio: `${a.name} is a ${a.year}${a.year === 1 ? "st" : a.year === 2 ? "nd" : a.year === 3 ? "rd" : "th"}-year ${a.course} student interested in ${pick(studentInterests, i, 1)}. They are building experience through ${pick(learningGoals, i, 2)} and interdisciplinary project work.`,
    education: pick(studentEducation, i, 3),
    contact_email: a.email,
    website_url: "NA",
    github_url: `https://github.com/topics/${pick(["student-project", "open-source", "web-development", "python", "robotics", "data-analysis"], i, 4)}`,
    linkedin_url: "https://www.linkedin.com/school/nsut-delhi/",
    cv_url: i === 0 ? "/demo-cvs/aarav-sharma-research-cv.pdf" : i === 4 ? "/demo-cvs/aditya-verma-research-cv.pdf" : "NA",
  }));
  const projectProgress = [45, 30, 20, 55, 25, 35, 100];
  const projectNotes = ["Dataset protocol complete; embedded baseline validation is in progress.", "Study-area data audit complete; uncertainty model is being designed.", "Biosafety review is required before laboratory validation.", "Ontology and licensing audit complete; bilingual retrieval evaluation is active.", "Sensor selection and privacy requirements are approved for prototype collection.", "Accessibility tasks and bilingual intent coverage are under evaluation.", "Scenario analysis and final reproducibility review are complete."];
  const projects = showcase.projects.map((item, i) => ({ id: item.id, title: item.title, description: item.summary, department: item.department, status: item.status, faculty_id: faculty[item.leadIndex].id, max_students: item.maxStudents, brief_url: item.pdf, application_form_url: item.applicationFormUrl, progress_percent: projectProgress[i % projectProgress.length], health_status: i === 2 ? "at_risk" : "on_track", progress_note: projectNotes[i % projectNotes.length], last_assessed_at: ago(i), created_at: ago(20 - i * 2), updated_at: ago(i) }));
  const applications = students.slice(0, 8).map((student, i) => { const project = i < 4 ? projects[0] : projects[i - 3]; const responseReference = project.application_form_url === "NA" ? "NA" : `${project.application_form_url}?completed=1&reference=DEMO-STUDENT-${i + 1}`; return { id: uuid(`application:${i}`), project_id: project.id, student_id: student.id, statement_of_purpose: `I want to contribute to ${project.title}. My proposed first milestone is to reproduce the baseline, document its limits and agree an eight-hour weekly plan with the project lead.`, skills_summary: `Course and project experience in ${pick(studentInterests, i, 2)}, reproducible analysis and collaborative technical documentation.`, availability_hours: 8 + i % 4, google_form_response_url: responseReference, resume_url: i === 0 ? "/demo-cvs/aarav-sharma-research-cv.pdf" : i === 4 ? "/demo-cvs/aditya-verma-research-cv.pdf" : "NA", status: i < 4 ? "accepted" : ["pending", "rejected"][i % 2], applied_at: ago(8 - i % 6) }; });
  const contributionRequests = [students[8], students[9]].map((student, i) => ({ id: uuid(`contribution-request:${i}`), project_id: projects[0].id, student_id: student.id, contribution_statement: [`I can prepare a reproducibility audit and independent evaluation notebook for the battery-health model without joining the allocated student team. The output will be a bounded validation report with documented failure cases.`, `I propose to contribute a compact visualization and documentation module that explains model uncertainty to non-specialist reviewers. This is a standalone output and does not require a project seat.`][i], skills_summary: [`Python evaluation workflows, time-series visualization and reproducible experiment documentation developed through course projects.`, `Accessible interface design, data visualization and technical writing supported by a public student project portfolio.`][i], availability_hours: 5 + i, status: "pending", created_at: ago(3 - i) }));
  const collaborationRequests = [{ requester: faculty[0], project: projects[0], type: "methodology", proposal: "I propose a cross-laboratory collaboration on uncertainty calibration and evaluation design for the edge battery-health model. My group can define independent validation splits and contribute a provenance-first reporting workflow.", expertise: "Natural-language and knowledge-representation methods for evidence provenance, evaluation design and reproducible research documentation.", status: "pending" }, { requester: faculty[2], project: projects[1], type: "data", proposal: "I can collaborate on the geospatial data-quality and uncertainty layer, including missing-data diagnostics and reproducible feature documentation for the InSAR screening workflow.", expertise: "Computer-vision evaluation, data-quality auditing and uncertainty communication for field-facing engineering prototypes.", status: "accepted" }].map((item, i) => ({ id: uuid(`collaboration-request:${i}`), project_id: item.project.id, requester_faculty_id: item.requester.id, collaboration_type: item.type, proposal: item.proposal, expertise_summary: item.expertise, status: item.status, owner_note: item.status === "accepted" ? "Accepted for the next methodology review." : null, reviewed_by: item.status === "accepted" ? faculty[item.project === projects[1] ? 6 : 1].id : null, reviewed_at: item.status === "accepted" ? ago(1) : null, created_at: ago(4 - i) }));
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
  return { users, profiles, facultyProfiles, studentProfiles, projects, applications, contributionRequests, collaborationRequests, publications, forum, forumReplies, announcements, highlights, reports, verifications };
}

async function replaceOldDemoContent() {
  const oldIds = {
    project_contribution_requests: Array.from({ length: 8 }, (_, i) => uuid(`contribution-request:${i}`)),
    faculty_collaboration_requests: Array.from({ length: 8 }, (_, i) => uuid(`collaboration-request:${i}`)),
    content_reports: Array.from({ length: 16 }, (_, i) => uuid(`report:${i}`)),
    applications: Array.from({ length: 72 }, (_, i) => uuid(`application:${Math.floor(i / 3)}:${i % 3}`)).concat(Array.from({ length: 8 }, (_, i) => uuid(`application:${i}`))),
    publications: Array.from({ length: 40 }, (_, i) => uuid(`publication:${i}`)),
    forum_posts: Array.from({ length: 32 }, (_, i) => uuid(`forum:${i}`)),
    announcements: Array.from({ length: 20 }, (_, i) => uuid(`announcement:${i}`)),
    highlights: Array.from({ length: 24 }, (_, i) => uuid(`highlight:${i}`)),
    projects: Array.from({ length: 30 }, (_, i) => uuid(`project:${i}`)),
  };

  // Earlier seed generations used non-deterministic application IDs for the
  // deterministic demo projects. Remove those dependants only after proving
  // every applicant is one of the namespaced demo student accounts.
  const legacyApplications = await must(
    "Inspect legacy demo project applications",
    db.from("applications").select("id,student_id").in("project_id", oldIds.projects),
  );
  if (legacyApplications.length > 0) {
    const applicantIds = [...new Set(legacyApplications.map((application) => application.student_id))];
    const applicants = await must(
      "Inspect legacy demo applicants",
      db.from("portal_users").select("id,email").in("id", applicantIds),
    );
    const emailById = new Map(applicants.map((applicant) => [applicant.id, applicant.email]));
    const unsafeApplication = legacyApplications.find((application) => !String(emailById.get(application.student_id) || "").startsWith("demo.student"));
    if (unsafeApplication) throw new Error("Refusing to replace legacy demo projects because a non-demo application references them.");
    await must(
      "Replace legacy demo project applications",
      db.from("applications").delete().in("id", legacyApplications.map((application) => application.id)),
    );
  }

  for (const table of ["project_contribution_requests", "faculty_collaboration_requests", "content_reports", "applications", "publications", "forum_posts", "announcements", "highlights", "projects"]) {
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
  for (const project of data.projects) {
    const accepted = data.applications.filter((application) => application.project_id === project.id && application.status === "accepted").length;
    await must(`Reconcile seats for ${project.id}`, db.from("projects").update({ available_seats: Math.max(project.max_students - accepted, 0) }).eq("id", project.id));
  }
  await must("Contribution requests", db.from("project_contribution_requests").upsert(data.contributionRequests, { onConflict: "id" }));
  await must("Faculty collaboration requests", db.from("faculty_collaboration_requests").upsert(data.collaborationRequests, { onConflict: "id" }));
  await must("Forum replies", db.from("forum_replies").upsert(data.forumReplies, { onConflict: "id" }));
}

async function clean(data) {
  await must("Clean contribution requests", db.from("project_contribution_requests").delete().in("id", data.contributionRequests.map((request) => request.id)));
  await must("Clean collaboration requests", db.from("faculty_collaboration_requests").delete().in("id", data.collaborationRequests.map((request) => request.id)));
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
  ["portal_users", "id,account_status,profile_completed_at"],
  ["faculty_profiles", "user_id,department,designation,research_area,bio,education,contact_email,office_location,office_hours,scholar_url,orcid,website_url,github_url,linkedin_url,cv_url,verification_status"],
  ["student_profiles", "user_id,roll_number,course,year,department,bio,education,contact_email,website_url,github_url,linkedin_url,cv_url"],
  ["content_reports", "id,status"],
  ["faculty_verification_requests", "id,status"],
  ["user_roles", "user_id,role_key"],
  ["projects", "id,brief_url,application_form_url,progress_percent,health_status"],
  ["forum_replies", "id,score"],
  ["project_contribution_requests", "id,project_id,student_id,status"],
  ["faculty_collaboration_requests", "id,project_id,requester_faculty_id,status"],
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
