alter table if exists projects
  add column if not exists archived_at timestamptz;

create index if not exists idx_projects_archived_at on projects(archived_at);
