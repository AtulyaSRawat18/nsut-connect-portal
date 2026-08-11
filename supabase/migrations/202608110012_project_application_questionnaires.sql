-- Faculty-configured application questionnaires and staging-safe completion references.

alter table public.projects
  add column if not exists application_form_url text not null default 'NA';

alter table public.projects
  drop constraint if exists projects_application_form_url_format,
  add constraint projects_application_form_url_format
    check (
      char_length(application_form_url) between 1 and 700
      and (
        application_form_url = 'NA'
        or application_form_url in (
          '/demo-forms/edge-ai-readiness',
          '/demo-forms/geospatial-validation',
          '/demo-forms/research-software-practice',
          '/demo-forms/accessible-speech-research'
        )
        or application_form_url ~* '^https://(docs\.google\.com/forms/|forms\.gle/)[^[:space:]]+$'
      )
    );

alter table public.applications
  drop constraint if exists applications_google_form_url_format,
  add constraint applications_google_form_url_format
    check (
      google_form_response_url is null
      or google_form_response_url = 'NA'
      or google_form_response_url ~* '^https://(docs\.google\.com/forms/|forms\.gle/)[^[:space:]]+$'
      or google_form_response_url ~ '^/demo-forms/[a-z0-9-]+[?a-zA-Z0-9&=_-]*$'
    );

comment on column public.projects.application_form_url is
  'Faculty-configured Google Forms questionnaire URL, approved portal-local demo questionnaire path, or NA.';

create or replace function public.enforce_project_questionnaire_evidence()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  assigned_form text;
begin
  select application_form_url into assigned_form
  from public.projects
  where id = new.project_id;

  if assigned_form is null then
    raise exception 'Project not found' using errcode = '23503';
  end if;
  if assigned_form <> 'NA' and coalesce(new.google_form_response_url, 'NA') = 'NA' then
    raise exception 'Questionnaire evidence is required for this project' using errcode = '23514';
  end if;
  if assigned_form = 'NA' and coalesce(new.google_form_response_url, 'NA') <> 'NA' then
    raise exception 'This project does not assign an application questionnaire' using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists applications_enforce_questionnaire_evidence on public.applications;
create trigger applications_enforce_questionnaire_evidence
  before insert or update of project_id, google_form_response_url
  on public.applications
  for each row execute function public.enforce_project_questionnaire_evidence();

revoke all on function public.enforce_project_questionnaire_evidence() from public;
