alter table if exists daily_entries add column if not exists updated_at timestamptz default now();

create table if not exists project_delivery_versions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  version_no integer not null,
  final_diagnosis jsonb not null default '{}'::jsonb,
  generated_by uuid references users(id) on delete set null,
  generated_at timestamptz not null default now(),
  unique(project_id, version_no)
);
