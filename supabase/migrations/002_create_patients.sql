create type gender_type as enum ('male', 'female', 'other');

create table public.patients (
    id uuid default gen_random_uuid() primary key,
    patient_name text not null,
    age integer not null check (age > 0 and age < 150),
    gender gender_type not null,
    symptoms text not null,
    symptom_tags text[] default '{}',
    contact text,
    address text,
    medical_history text,
    vitals jsonb default '{}'::jsonb,
    notes text,
    created_by uuid references public.profiles(id) not null,
    facility_name text not null default '',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.patients enable row level security;
