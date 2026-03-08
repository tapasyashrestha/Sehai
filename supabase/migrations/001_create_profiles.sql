create type user_role as enum ('anm', 'phc', 'chc');

create table public.profiles (
    id uuid references auth.users(id) on delete cascade primary key,
    full_name text not null,
    role user_role not null,
    facility_name text not null default '',
    facility_location text not null default '',
    phone text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Automatically create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
    insert into public.profiles (id, full_name, role, facility_name)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'full_name', ''),
        coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'anm'),
        coalesce(new.raw_user_meta_data->>'facility_name', '')
    );
    return new;
end;
$$;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
