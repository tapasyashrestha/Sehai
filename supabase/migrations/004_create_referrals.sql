create type referral_target as enum ('phc', 'chc');
create type referral_priority as enum ('low', 'medium', 'high', 'critical');
create type referral_status as enum ('pending', 'reviewed', 'in_progress', 'completed', 'rejected');

create table public.referrals (
    id uuid default gen_random_uuid() primary key,
    patient_id uuid references public.patients(id) on delete cascade not null,
    referred_by uuid references public.profiles(id) not null,
    referred_to referral_target not null,
    target_facility text,
    priority referral_priority not null default 'medium',
    status referral_status not null default 'pending',
    reason text,
    notes text,
    reviewed_by uuid references public.profiles(id),
    reviewed_at timestamptz,
    prediction_id uuid references public.predictions(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.referrals enable row level security;
