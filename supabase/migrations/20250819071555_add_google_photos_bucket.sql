-- Create a new storage bucket for Google Photos integration
insert into storage.buckets (id, name, public)
values ('google-photos', 'google-photos', false)
on conflict (id) do nothing;

-- Set up RLS policies for the new bucket
create policy "google_photos_select"
on storage.objects for select to authenticated
using (bucket_id = 'google-photos');

create policy "google_photos_insert"
on storage.objects for insert to authenticated
with check (bucket_id = 'google-photos');

create policy "google_photos_delete"
on storage.objects for delete to authenticated
using (bucket_id = 'google-photos');

-- Add Google Photos references column to properties table
alter table public.properties
add column if not exists google_photos_paths text[];

-- Update the properties_summary view to include the new column
create or replace view public.properties_summary
with (security_invoker=on) as
select
  p.*,
  (coalesce(c.first_name,'') || case when c.first_name is null or c.last_name is null then '' else ' ' end || coalesce(c.last_name,'')) as contact_name,
  count(d.id)::int as nb_deals,
  max(d.created_at) as last_deal_date
from public.properties p
left join public.contacts c on c.id = p.contact_id
left join public.deals d on d.property_id = p.id
group by p.id, contact_name;