-- Run this in the Supabase SQL editor (Dashboard → SQL → New query → Run).
-- Personal debt ledger: money you lent to / borrowed from other people.

create table if not exists public.loans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  direction text not null check (direction in ('lent', 'borrowed')),
  person text not null,
  amount numeric not null check (amount > 0),
  currency text,
  due_date date,
  description text,
  status text not null default 'outstanding' check (status in ('outstanding', 'repaid')),
  repaid_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.loans enable row level security;

create policy "loans_select_own"
  on public.loans for select
  using (auth.uid() = user_id);

create policy "loans_insert_own"
  on public.loans for insert
  with check (auth.uid() = user_id);

create policy "loans_update_own"
  on public.loans for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "loans_delete_own"
  on public.loans for delete
  using (auth.uid() = user_id);
