-- PROFILES
create policy "Anyone authenticated can read profiles"
    on public.profiles for select
    to authenticated
    using (true);

create policy "Users can update own profile"
    on public.profiles for update
    to authenticated
    using (id = auth.uid());

-- PATIENTS
create policy "Users can insert patients"
    on public.patients for insert
    to authenticated
    with check (created_by = auth.uid());

create policy "Users can read patients they created or referred to their tier"
    on public.patients for select
    to authenticated
    using (
        created_by = auth.uid()
        or id in (
            select r.patient_id from public.referrals r
            join public.profiles p on p.id = auth.uid()
            where (
                (p.role = 'phc' and r.referred_to = 'phc')
                or (p.role = 'chc' and r.referred_to = 'chc')
            )
        )
    );

create policy "Users can update patients they created"
    on public.patients for update
    to authenticated
    using (created_by = auth.uid());

-- PREDICTIONS
create policy "Users can insert predictions"
    on public.predictions for insert
    to authenticated
    with check (predicted_by = auth.uid());

create policy "Users can read predictions for accessible patients"
    on public.predictions for select
    to authenticated
    using (
        predicted_by = auth.uid()
        or patient_id in (
            select r.patient_id from public.referrals r
            join public.profiles p on p.id = auth.uid()
            where (
                (p.role = 'phc' and r.referred_to = 'phc')
                or (p.role = 'chc' and r.referred_to = 'chc')
            )
        )
    );

-- REFERRALS
create policy "Users can create referrals"
    on public.referrals for insert
    to authenticated
    with check (referred_by = auth.uid());

create policy "Users can read referrals they made or targeting their tier"
    on public.referrals for select
    to authenticated
    using (
        referred_by = auth.uid()
        or (
            referred_to::text = (select role::text from public.profiles where id = auth.uid())
        )
    );

create policy "Target-tier users can update referral status"
    on public.referrals for update
    to authenticated
    using (
        referred_to::text = (select role::text from public.profiles where id = auth.uid())
    );
