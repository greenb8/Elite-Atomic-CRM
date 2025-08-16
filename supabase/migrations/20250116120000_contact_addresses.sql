-- Add service and billing address fields to contacts
alter table contacts 
    add column if not exists service_address text,
    add column if not exists service_city text,
    add column if not exists service_state text,
    add column if not exists service_zipcode text,
    add column if not exists billing_address text,
    add column if not exists billing_city text,
    add column if not exists billing_state text,
    add column if not exists billing_zipcode text;

-- Recreate contacts_summary view to include new address fields
drop view if exists contacts_summary;

create view contacts_summary
as
select 
    co.id,
    co.first_name,
    co.last_name,
    co.gender,
    co.title,
    co.email_jsonb,
    jsonb_path_query_array(co.email_jsonb, '$[*].email')::text as email_fts,
    co.phone_jsonb,
    jsonb_path_query_array(co.phone_jsonb, '$[*].number')::text as phone_fts,
    co.background,
    co.avatar,
    co.first_seen,
    co.last_seen,
    co.has_newsletter,
    co.status,
    co.tags,
    co.company_id,
    co.sales_id,
    co.linkedin_url,
    co.service_address,
    co.service_city,
    co.service_state,
    co.service_zipcode,
    co.billing_address,
    co.billing_city,
    co.billing_state,
    co.billing_zipcode,
    c.name as company_name,
    count(distinct t.id) as nb_tasks
from
    contacts co
left join
    tasks t on co.id = t.contact_id
left join
    companies c on co.company_id = c.id
group by
    co.id, c.name;


