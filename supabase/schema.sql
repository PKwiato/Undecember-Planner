-- ==============================================================================
-- SCHEMAT BAZY DANYCH DLA UNDECEMBER BUILD PLANNER (Z SUPABASE AUTH)
-- ==============================================================================

create table builds (
  id text primary key default substr(md5(random()::text || clock_timestamp()::text), 1, 8),
  user_id uuid references auth.users(id) on delete set null default auth.uid(),
  title text not null check (char_length(title) between 1 and 80),
  description text check (char_length(description) <= 2000),
  class text not null,
  data jsonb not null check (pg_column_size(data) < 20000),
  created_at timestamptz default now()
);

alter table builds enable row level security;

-- Wszyscy mogą przeglądać i odczytywać buildy (zarówno zalogowani, jak i goście)
create policy "public read" on builds for select using (true);

-- Tylko zalogowani użytkownicy (z aktywną sesją Auth) mogą dodawać nowe buildy
create policy "authenticated insert" on builds
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Właściciel buildu może go edytować lub usunąć
create policy "authenticated update" on builds
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "authenticated delete" on builds
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- ==============================================================================
-- MIGRACJA DLA ISTNIEJĄCEJ TABELI W SUPABASE:
-- Jeśli tabela `builds` już u Ciebie istnieje, uruchom poniższy blok w SQL Editor:
-- ==============================================================================
-- alter table builds add column if not exists user_id uuid references auth.users(id) default auth.uid();
-- drop policy if exists "public insert" on builds;
-- drop policy if exists "authenticated insert" on builds;
-- drop policy if exists "authenticated update" on builds;
-- drop policy if exists "authenticated delete" on builds;
-- create policy "authenticated insert" on builds for insert to authenticated with check (auth.uid() = user_id);
-- create policy "authenticated update" on builds for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- create policy "authenticated delete" on builds for delete to authenticated using (auth.uid() = user_id);
