-- ===================================================
-- Skema Database Supabase untuk KALARSA (Portal Kuliah)
-- Versi: 3.0 — Admin auth via Supabase Auth + RLS
--
-- Cara pakai:
--   Dashboard -> SQL Editor -> New Query -> Paste -> Run
-- Script ini idempotent (aman dijalankan berulang).
--
-- Otorisasi admin TIDAK memakai password di frontend.
-- Role admin dibaca dari JWT `app_metadata.role`, yang hanya
-- bisa diubah lewat service role key / dashboard Supabase.
-- ===================================================

create extension if not exists pgcrypto;

-- ===================================================
-- 1. Tabel
-- ===================================================

-- Mata kuliah
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  day text not null,
  start_time text not null,
  end_time text not null,
  credits integer not null default 2,
  building text,
  room text,
  lecturer text,
  class_type text default 'all',
  class_target text default 'all',
  created_at timestamp with time zone default now()
);
alter table courses add column if not exists class_type text default 'all';
alter table courses add column if not exists class_target text default 'all';

create index if not exists idx_courses_day on courses(day);

-- Informasi & pengumuman
create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  media_type text default 'text',
  media_url text,
  pinned boolean default false,
  created_at timestamp with time zone default now()
);

create index if not exists idx_announcements_pinned on announcements(pinned);
create index if not exists idx_announcements_created on announcements(created_at desc);

-- Daftar tugas
create table if not exists assignments (
  id uuid primary key default gen_random_uuid(),
  course_name text not null,
  title text not null,
  description text,
  assigned_date date not null default current_date,
  deadline timestamp with time zone not null,
  type text default 'individual',
  status text default 'pending',
  drive_link text,
  class_type text default 'all',
  class_target text default 'all',
  created_at timestamp with time zone default now()
);
alter table assignments add column if not exists drive_link text;
alter table assignments add column if not exists class_type text default 'all';
alter table assignments add column if not exists class_target text default 'all';

create index if not exists idx_assignments_deadline on assignments(deadline);

-- Profil mahasiswa
create table if not exists profiles (
  user_id text primary key,
  name text not null,
  nim text,
  theory_class text default 'A',
  practice_class text default 'A',
  email text,
  role text not null default 'student',
  updated_at timestamp with time zone default now()
);
alter table profiles add column if not exists role text not null default 'student';

-- Riwayat spin kelompok
create table if not exists group_draws (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  total_groups integer not null,
  raw_members jsonb not null,
  result_groups jsonb not null,
  created_at timestamp with time zone default now()
);

-- Checklist tugas per akun
create table if not exists user_task_completions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  assignment_id text not null,
  completed_at timestamp with time zone default now(),
  unique(user_id, assignment_id)
);

create index if not exists idx_completions_user on user_task_completions(user_id);

-- ===================================================
-- 2. Helper otorisasi
-- ===================================================

-- true hanya jika JWT pengguna punya app_metadata.role = 'admin'.
-- app_metadata hanya bisa ditulis lewat service role key, tidak oleh klien.
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- ===================================================
-- 3. Row Level Security
-- ===================================================
alter table courses enable row level security;
alter table announcements enable row level security;
alter table assignments enable row level security;
alter table profiles enable row level security;
alter table group_draws enable row level security;
alter table user_task_completions enable row level security;

-- ---------------------------------------------------
-- courses: semua boleh baca, hanya admin boleh tulis
-- ---------------------------------------------------
drop policy if exists "Allow read courses" on courses;
drop policy if exists "Allow insert courses" on courses;
drop policy if exists "Allow update courses" on courses;
drop policy if exists "Allow delete courses" on courses;

create policy "Allow read courses" on courses
  for select using (true);
create policy "Allow insert courses" on courses
  for insert with check ((select public.is_admin()));
create policy "Allow update courses" on courses
  for update using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Allow delete courses" on courses
  for delete using ((select public.is_admin()));

-- ---------------------------------------------------
-- announcements: semua boleh baca, hanya admin boleh tulis
-- ---------------------------------------------------
drop policy if exists "Allow read announcements" on announcements;
drop policy if exists "Allow insert announcements" on announcements;
drop policy if exists "Allow update announcements" on announcements;
drop policy if exists "Allow delete announcements" on announcements;

create policy "Allow read announcements" on announcements
  for select using (true);
create policy "Allow insert announcements" on announcements
  for insert with check ((select public.is_admin()));
create policy "Allow update announcements" on announcements
  for update using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Allow delete announcements" on announcements
  for delete using ((select public.is_admin()));

-- ---------------------------------------------------
-- assignments: semua boleh baca, hanya admin boleh tulis
-- ---------------------------------------------------
drop policy if exists "Allow read assignments" on assignments;
drop policy if exists "Allow insert assignments" on assignments;
drop policy if exists "Allow update assignments" on assignments;
drop policy if exists "Allow delete assignments" on assignments;

create policy "Allow read assignments" on assignments
  for select using (true);
create policy "Allow insert assignments" on assignments
  for insert with check ((select public.is_admin()));
create policy "Allow update assignments" on assignments
  for update using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Allow delete assignments" on assignments
  for delete using ((select public.is_admin()));

-- ---------------------------------------------------
-- profiles: baca semua, tulis milik sendiri / admin
-- ---------------------------------------------------
drop policy if exists "Allow read profiles" on profiles;
drop policy if exists "Allow insert profiles" on profiles;
drop policy if exists "Allow update profiles" on profiles;

create policy "Allow read profiles" on profiles
  for select using (true);
create policy "Allow insert profiles" on profiles
  for insert with check (user_id = coalesce(auth.uid()::text, user_id) or (select public.is_admin()));
create policy "Allow update profiles" on profiles
  for update using (user_id = coalesce(auth.uid()::text, user_id) or (select public.is_admin()))
  with check (user_id = coalesce(auth.uid()::text, user_id) or (select public.is_admin()));

-- ---------------------------------------------------
-- group_draws: semua boleh baca & menyimpan hasil spin,
-- hanya admin yang boleh menghapus
-- ---------------------------------------------------
drop policy if exists "Allow read group_draws" on group_draws;
drop policy if exists "Allow insert group_draws" on group_draws;
drop policy if exists "Allow delete group_draws" on group_draws;

create policy "Allow read group_draws" on group_draws
  for select using (true);
create policy "Allow insert group_draws" on group_draws
  for insert with check (true);
create policy "Allow delete group_draws" on group_draws
  for delete using ((select public.is_admin()));

-- ---------------------------------------------------
-- user_task_completions: checklist pribadi
-- ---------------------------------------------------
drop policy if exists "Allow read user_task_completions" on user_task_completions;
drop policy if exists "Allow insert user_task_completions" on user_task_completions;
drop policy if exists "Allow delete user_task_completions" on user_task_completions;

create policy "Allow read user_task_completions" on user_task_completions
  for select using (true);
create policy "Allow insert user_task_completions" on user_task_completions
  for insert with check (true);
create policy "Allow delete user_task_completions" on user_task_completions
  for delete using (true);

-- ===================================================
-- 4. (Opsional) Jadikan user tertentu admin
--    Ganti email di bawah, lalu jalankan.
-- ===================================================
-- update auth.users
-- set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
-- where email = 'admin@kalarsa.app';
--
-- update public.profiles set role = 'admin' where email = 'admin@kalarsa.app';
