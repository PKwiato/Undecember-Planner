create table builds (
  id text primary key default substr(md5(random()::text || clock_timestamp()::text), 1, 8),
  title text not null check (char_length(title) between 1 and 80),
  description text check (char_length(description) <= 2000),
  class text not null,
  data jsonb not null check (pg_column_size(data) < 20000),
  created_at timestamptz default now()
);

alter table builds enable row level security;

-- everyone can read and add builds; nobody can edit or delete from the browser
create policy "public read" on builds for select using (true);
create policy "public insert" on builds for insert with check (true);
