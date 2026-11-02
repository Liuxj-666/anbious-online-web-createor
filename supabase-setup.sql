-- 岸标 ANBIAO · Supabase 初始化脚本
-- 在 Supabase Dashboard → SQL Editor 中整段执行。
-- 项目：https://qdphpjcxluayglvzvafp.supabase.co
-- Bucket：images

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- 1. 用户资料（与 auth.users 一对一）
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles are public" on public.profiles;
create policy "profiles are public"
  on public.profiles for select
  using (true);

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base_username text;
  final_username text;
begin
  base_username := coalesce(nullif(new.raw_user_meta_data->>'username', ''), split_part(coalesce(new.email, 'user'), '@', 1));
  base_username := regexp_replace(base_username, '[^a-zA-Z0-9_-]', '', 'g');
  if length(base_username) < 3 then
    base_username := 'user';
  end if;
  final_username := base_username || '_' || substr(new.id::text, 1, 4);
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    final_username,
    coalesce(nullif(new.raw_user_meta_data->>'display_name', ''), base_username)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 2. 站点与公开快照（账号绑定网页）
-- ---------------------------------------------------------------------------
create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique,
  title text not null,
  owner_name text not null default '',
  snapshot jsonb not null,
  published boolean not null default true,
  consent_version text not null default '2026.10',
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_seen timestamptz
);

create index if not exists sites_published_idx on public.sites (published, published_at desc);
create index if not exists sites_owner_idx on public.sites (owner_id);

create or replace function public.enforce_site_limit()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if exists (select 1 from public.sites where id = new.id) then
    return new;
  end if;
  if (select count(*) from public.sites where owner_id = new.owner_id) >= 5 then
    raise exception '每个账号最多只能创建 5 个网页。';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_site_limit_before_insert on public.sites;
create trigger enforce_site_limit_before_insert
  before insert on public.sites
  for each row execute function public.enforce_site_limit();

alter table public.sites enable row level security;

drop policy if exists "published sites are public" on public.sites;
create policy "published sites are public"
  on public.sites for select
  using (published = true or owner_id = auth.uid());

drop policy if exists "owner inserts sites" on public.sites;
create policy "owner inserts sites"
  on public.sites for insert
  with check (owner_id = auth.uid());

drop policy if exists "owner updates sites" on public.sites;
create policy "owner updates sites"
  on public.sites for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "owner deletes sites" on public.sites;
create policy "owner deletes sites"
  on public.sites for delete
  using (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 3. 评论（绑定登录账号）
-- ---------------------------------------------------------------------------
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  item_id text not null,
  parent_id uuid references public.comments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists comments_site_item_idx on public.comments (site_id, item_id, created_at);

alter table public.comments enable row level security;

drop policy if exists "comments on published sites are public" on public.comments;
create policy "comments on published sites are public"
  on public.comments for select
  using (
    exists (
      select 1 from public.sites s
      where s.id = comments.site_id
        and (s.published = true or s.owner_id = auth.uid())
    )
  );

drop policy if exists "logged in users write comments" on public.comments;
create policy "logged in users write comments"
  on public.comments for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.sites s
      where s.id = comments.site_id and s.published = true
    )
  );

drop policy if exists "users delete own comments" on public.comments;
create policy "users delete own comments"
  on public.comments for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 4. 访客记录（主人可读，匿名可写）
-- ---------------------------------------------------------------------------
create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  user_name text not null default '',
  visitor_id text not null default '',
  path text not null default '',
  user_agent text not null default '',
  created_at timestamptz not null default now()
);

alter table public.visits add column if not exists user_name text not null default '';
create index if not exists visits_site_idx on public.visits (site_id, created_at desc);

alter table public.visits enable row level security;

drop policy if exists "anyone can record visits" on public.visits;
create policy "anyone can record visits"
  on public.visits for insert
  with check (
    exists (select 1 from public.sites s where s.id = visits.site_id and s.published = true)
    and (visits.user_id is null or visits.user_id = auth.uid())
  );

drop policy if exists "owner reads visits" on public.visits;
create policy "owner reads visits"
  on public.visits for select
  using (
    exists (
      select 1 from public.sites s
      where s.id = visits.site_id and s.owner_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- 5. Storage：bucket = images（图片/视频/音频/文件都放这里）
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do update set public = true;

drop policy if exists "public read images" on storage.objects;
create policy "public read images"
  on storage.objects for select
  using (bucket_id = 'images');

drop policy if exists "authenticated upload images" on storage.objects;
create policy "authenticated upload images"
  on storage.objects for insert
  with check (bucket_id = 'images' and auth.role() = 'authenticated');

drop policy if exists "authenticated update images" on storage.objects;
create policy "authenticated update images"
  on storage.objects for update
  using (bucket_id = 'images' and auth.role() = 'authenticated');

drop policy if exists "authenticated delete images" on storage.objects;
create policy "authenticated delete images"
  on storage.objects for delete
  using (bucket_id = 'images' and auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- 6. Realtime（最新发布/评论可以实时刷新）
-- ---------------------------------------------------------------------------
do $$
begin
  begin
    alter publication supabase_realtime add table public.sites;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.comments;
  exception when duplicate_object then null;
  end;
end $$;

grant usage on schema public to anon, authenticated;
grant select on public.profiles, public.sites, public.comments to anon, authenticated;
grant insert, update, delete on public.sites to authenticated;
grant insert, delete on public.comments to authenticated;
grant insert on public.visits to anon, authenticated;
grant select on public.visits to authenticated;
