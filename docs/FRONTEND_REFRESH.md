# Portal Frontend Refresh

## Scope

The portal now extends the account-entry and IDea design across public discovery,
profiles, discussions, student/faculty workspaces, moderation, and administration.
The existing NSUT red is paired with neutral surfaces and restrained green, blue,
and gold accents. Dark mode uses charcoal surfaces rather than blue backgrounds.

- `AppShell` keeps `/`, `/login`, and `/signup` free of global navigation.
- `Navbar` provides primary destinations, a grouped Explore menu, a complete
  mobile menu, theme switching, account actions, and a native search dialog.
  Search submits the existing `q` parameter to the selected directory.
- `PageHeading` and shared layout classes align headings, filters, and spacing.
  Labels no longer depend on tiny, widely spaced uppercase text.
- `WorkspaceShell` uses a sidebar below the sticky navbar on desktop and
  horizontally scrollable role navigation on smaller screens.
- Profiles use a compact identity header. The student dashboard includes IDea.
- Loading, denied, not-found, and unexpected-error pages use the shared design.
  The research feed distinguishes a failed request from an empty result.
- Campus photography remains a real local asset; decorative research backdrops
  have been removed from active pages.

## Content And Navigation

`NewsDirectory` is shared by News and Developments; `OpportunitiesDirectory` is
shared by Opportunities and Highlights. Each route preserves its own pagination
path. They use the existing public-data layer, including its explicit errors and
curated showcase behavior. The older invented fallback announcements, attributed
quotes, and unverified internship entries have been removed from the legacy views.

Grants no longer displays unverified awards, expired deadlines, or no-op application
links. It points to enquiries and published scholarship opportunities. Ethics
links to the existing policy drafts and contact page instead of nonexistent PDFs
or a nonfunctional review submission. About no longer claims fabricated metrics
or offers a contact form with no submission behavior.

## Security Boundary

No migration, remote seed, role assignment, authorization guard, RLS policy, or
protected mutation was changed in this frontend refresh. Session lookup and
sign-out continue to use the existing authenticated endpoints. A search dialog
does not grant access to private content. Staging availability is still required
to validate signed-in workflows against the real database.

## Verification

Run from the repository root in PowerShell:

```powershell
$env:NSUT_BUILD_DIR = '.next-idea'
npm run build -- --webpack
npm run test:idea
node scripts/test-idea-http.mjs
node scripts/test-portal-http.mjs
```

HTTP tests require a local server on port 3000. `PORTAL_TEST_URL` can override the
URL for `test-portal-http.mjs`. Stop a dev server using the same build directory
before building. The `.next-idea` directory avoids known locks in the original
OneDrive `.next` cache. Webpack avoids the earlier stalled Turbopack run.

The portal HTTP suite covers entry-page isolation, public page availability,
shared navigation, labelled search fields, main landmarks, missing pages, asset
availability, and guest redirects for protected workspaces. It does not test
client interactions, pixel layouts, or logged-in workflows.

On 5 October 2026, the production webpack build, TypeScript, changed-file ESLint,
13 search/policy tests, 13 IDea HTTP checks, and 38 portal HTTP checks passed.
The live IDea API returned an explicit 503 while staging remained unavailable;
the test verifies the outage state and absence of leaked member data, not a
successful authenticated workflow.

Before pilot approval, review desktop/mobile and both themes in a browser,
exercise the menu/dialog with a keyboard, and test student, faculty, moderator,
and administrator views against resumed staging. Browser access was denied in
this task, so screenshots and interactive visual QA remain outstanding.
