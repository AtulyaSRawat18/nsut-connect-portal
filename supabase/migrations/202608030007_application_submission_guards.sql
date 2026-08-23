-- Require complete student submissions even when the database is called directly.

drop policy if exists "Active students can apply to open projects" on public.applications;
drop policy if exists "Active students submit complete applications" on public.applications;
create policy "Active students submit complete applications"
  on public.applications for insert to authenticated
  with check (
    student_id = auth.uid()
    and public.has_portal_role(array['student'])
    and char_length(statement_of_purpose) between 100 and 3000
    and skills_summary is not null
    and char_length(skills_summary) between 40 and 1200
    and availability_hours between 1 and 40
    and resume_url is not null
    and google_form_response_url is not null
    and status = 'pending'
    and exists (
      select 1 from public.projects project
      where project.id = applications.project_id
        and project.status = 'open'
        and project.brief_url is not null
    )
  );

-- Application decisions must use the checked RPC; clients cannot rewrite submissions.
revoke update on public.applications from authenticated;
