-- Marvel Quest — Supabase Schema
-- Run this in the Supabase SQL editor at: https://app.supabase.com

-- ── Drop old tables if re-running ──────────────────────────────────
drop table if exists achievements_unlocked cascade;
drop table if exists progress cascade;
drop table if exists user_settings cascade;

-- ── progress ───────────────────────────────────────────────────────
create table progress (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  title_id    text not null,
  watched     boolean default false,
  rating      int check (rating >= 1 and rating <= 5),
  note        text,
  watched_at  timestamptz default now(),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique(user_id, title_id)
);

-- ── user_settings ──────────────────────────────────────────────────
create table user_settings (
  user_id              uuid primary key references auth.users(id) on delete cascade,
  active_path          text default 'all',
  theme                text default 'dark',
  streak_count         int default 0,
  longest_streak       int default 0,
  last_watched_date    date,
  onboarding_complete  boolean default false,
  show_countdown       boolean default true,
  pace_target_date     date,
  watch_history        jsonb default '[]',
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

-- ── achievements_unlocked ──────────────────────────────────────────
create table achievements_unlocked (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  achievement_id  text not null,
  unlocked_at     timestamptz default now(),
  unique(user_id, achievement_id)
);

-- ── Row Level Security ─────────────────────────────────────────────
alter table progress enable row level security;
alter table user_settings enable row level security;
alter table achievements_unlocked enable row level security;

create policy "Users own their progress"
  on progress for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users own their settings"
  on user_settings for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users own their achievements"
  on achievements_unlocked for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Auto-update updated_at ─────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger progress_updated_at
  before update on progress
  for each row execute function update_updated_at();

create trigger settings_updated_at
  before update on user_settings
  for each row execute function update_updated_at();

-- ── Indexes ────────────────────────────────────────────────────────
create index idx_progress_user_id on progress(user_id);
create index idx_progress_title_id on progress(title_id);
create index idx_achievements_user_id on achievements_unlocked(user_id);
