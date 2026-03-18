alter table if exists projects
  add column if not exists account_plan jsonb not null default '[]'::jsonb,
  add column if not exists workflow_state text not null default 'novo',
  add column if not exists historical_context text not null default '',
  add column if not exists ai_attention_points jsonb not null default '[]'::jsonb,
  add column if not exists normalization_payload jsonb not null default '{}'::jsonb,
  add column if not exists normalization_status text not null default 'pendente',
  add column if not exists final_diagnosis jsonb not null default '{}'::jsonb,
  add column if not exists final_diagnosis_status text not null default 'pendente';

create table if not exists project_workflow_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id),
  step_key text not null,
  status text not null,
  payload jsonb not null default '{}'::jsonb,
  created_by uuid references users(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_project_workflow_events_project_created on project_workflow_events(project_id, created_at desc);
