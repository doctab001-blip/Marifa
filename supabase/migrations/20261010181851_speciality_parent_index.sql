create index if not exists specialties_parent_specialty_idx
  on public.specialties(parent_specialty_id)
  where parent_specialty_id is not null;
