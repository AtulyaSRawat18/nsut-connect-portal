# NSUT department catalogue

The portal uses one canonical department catalogue for profiles, faculty verification, projects, forum posts, announcements, opportunities, filters, and demo data. Campus is part of a department's identity so similarly named Main, East, and West campus units are not merged.

## Catalogue

| Department | Campus | Stable ID |
| --- | --- | --- |
| Biological Sciences & Engineering | Main | `biological-sciences-engineering-main` |
| Chemistry | Main | `chemistry-main` |
| Civil Engineering | West | `civil-engineering-west` |
| Computer Science & Engineering | Main | `computer-science-engineering-main` |
| Computer Science & Engineering | East | `computer-science-engineering-east` |
| Electrical Engineering | Main | `electrical-engineering-main` |
| Electronics & Communication Engineering | Main | `electronics-communication-engineering-main` |
| Electronics & Communication Engineering | East | `electronics-communication-engineering-east` |
| Humanities & Social Sciences | Main | `humanities-social-sciences-main` |
| Humanities & Social Sciences | East | `humanities-social-sciences-east` |
| Information Technology | Main | `information-technology-main` |
| Instrumentation & Control Engineering | Main | `instrumentation-control-engineering-main` |
| Management Studies | Main | `management-studies-main` |
| Mathematics | Main | `mathematics-main` |
| Mechanical Engineering | Main | `mechanical-engineering-main` |
| Mechanical Engineering | West | `mechanical-engineering-west` |
| Physics | Main | `physics-main` |
| Personality Development | Campus not specified | `personality-development` |
| Design | Campus not specified | `design` |
| Architecture & Planning | Campus not specified | `architecture-planning` |
| Innovation, Entrepreneurship & Venture Development (IEV) | Campus not specified | `innovation-entrepreneurship-venture-development` |
| Geoinformatics | West | `geoinformatics-west` |

## Implementation rules

- `src/content/departments.json` is the application catalogue used to build options and labels consistently on every page.
- `public.departments` is the database catalogue. It is publicly readable but cannot be mutated by anonymous or authenticated application clients.
- Content and role-profile tables reference `public.departments(id)` through foreign keys. The legacy `profiles.department` field remains temporarily unconstrained because old admin/moderator compatibility records may contain `Administration`; authoritative role-specific department data lives in `faculty_profiles` and `student_profiles`.
- New API writes validate department IDs server-side. UI validation is only a usability layer.
- Legacy values are migrated as follows: `BT` → BSE Main, `CIVIL` → Civil West, `CSE` → CSE Main, `ECE` → ECE Main, `ICE` → ICE Main, `IT` → IT Main, `MAC` → Mathematics Main, `MECH` → Mechanical Main, and `BBA` → Management Studies Main.
- Apply `supabase/migrations/202608110010_departments_catalog.sql` only after verifying the target is non-production and taking a backup when it contains data. Existing unknown department values intentionally cause the foreign-key step to fail instead of being silently reassigned.
