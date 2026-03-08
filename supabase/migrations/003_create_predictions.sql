create table public.predictions (
    id uuid default gen_random_uuid() primary key,
    patient_id uuid references public.patients(id) on delete cascade not null,
    symptoms_used text[] not null,
    predicted_disease text not null,
    confidence numeric(5,4) not null,
    disease_description text,
    precautions text[],
    predicted_by uuid references public.profiles(id) not null,
    created_at timestamptz not null default now()
);

alter table public.predictions enable row level security;
