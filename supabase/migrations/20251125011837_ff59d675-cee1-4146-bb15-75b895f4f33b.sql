-- Create profiles table for user data
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  created_at timestamp with time zone not null default now(),
  primary key (id)
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Function to create profile on signup
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

-- Trigger to automatically create profile
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create brand_kits table
create table public.brand_kits (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  brand_name text not null,
  tagline_options jsonb not null,
  positioning text not null,
  core_message text not null,
  tone_of_voice jsonb not null,
  color_palette jsonb not null,
  typography jsonb not null,
  hero_section jsonb not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  primary key (id)
);

alter table public.brand_kits enable row level security;

create policy "Users can view their own brand kits"
  on public.brand_kits for select
  using (auth.uid() = user_id);

create policy "Users can create their own brand kits"
  on public.brand_kits for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own brand kits"
  on public.brand_kits for update
  using (auth.uid() = user_id);

create policy "Users can delete their own brand kits"
  on public.brand_kits for delete
  using (auth.uid() = user_id);

-- Function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = public;

-- Trigger for automatic timestamp updates
create trigger update_brand_kits_updated_at
  before update on public.brand_kits
  for each row
  execute function public.update_updated_at_column();