-- Enhanced Service Addresses JSONB Migration
-- Converts single service address fields to JSONB array with landscaping-specific enhancements

-- Add the new service_addresses_jsonb column
alter table contacts add column service_addresses_jsonb jsonb;

-- Migrate existing service address data to the new JSONB format
-- Only migrate if there's actual address data
update contacts 
set service_addresses_jsonb = 
    case 
        when service_address is not null and trim(service_address) != '' then
            jsonb_build_array(
                jsonb_build_object(
                    'address', service_address,
                    'city', coalesce(service_city, ''),
                    'state', coalesce(service_state, ''),
                    'zipcode', coalesce(service_zipcode, ''),
                    'type', 'Primary Property',
                    'gate_code', null,
                    'access_notes', null,
                    'property_size', null,
                    'service_notes', null,
                    'lat', null,
                    'lng', null,
                    'migrated_from_single_address', true
                )
            )
        else '[]'::jsonb
    end;

-- Drop the old service address columns
alter table contacts 
    drop column if exists service_address,
    drop column if exists service_city,
    drop column if exists service_state,
    drop column if exists service_zipcode;

-- Recreate contacts_summary view with enhanced service addresses
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
    co.service_addresses_jsonb,
    -- Full-text search for service addresses (address, city, state, zipcode)
    jsonb_path_query_array(co.service_addresses_jsonb, '$[*].address')::text ||
    jsonb_path_query_array(co.service_addresses_jsonb, '$[*].city')::text ||
    jsonb_path_query_array(co.service_addresses_jsonb, '$[*].state')::text ||
    jsonb_path_query_array(co.service_addresses_jsonb, '$[*].zipcode')::text as service_addresses_fts,
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
    -- Keep billing address as single fields
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

-- Create index for service addresses JSONB for better performance
create index if not exists idx_contacts_service_addresses_jsonb 
on contacts using gin (service_addresses_jsonb);

-- Create a function to auto-create properties from service addresses
create or replace function create_property_from_service_address()
returns trigger as $$
declare
    addr jsonb;
    new_property_id bigint;
begin
    -- Only process if service_addresses_jsonb was updated and is not empty
    if NEW.service_addresses_jsonb is distinct from OLD.service_addresses_jsonb 
       and jsonb_array_length(NEW.service_addresses_jsonb) > 0 then
        
        -- Loop through each service address
        for addr in select jsonb_array_elements(NEW.service_addresses_jsonb)
        loop
            -- Check if this address doesn't already have a corresponding property
            -- (We'll check by matching address and contact_id)
            if not exists (
                select 1 from properties p 
                where p.contact_id = NEW.id 
                and p.address = (addr->>'address')
                and p.city = (addr->>'city')
            ) then
                -- Create a new property record
                insert into properties (
                    contact_id,
                    name,
                    address,
                    city,
                    state,
                    zipcode,
                    gate_code,
                    access_notes,
                    notes,
                    lat,
                    lng
                ) values (
                    NEW.id,
                    coalesce(addr->>'type', 'Service Location') || ' - ' || 
                    coalesce(NEW.first_name, '') || ' ' || coalesce(NEW.last_name, ''),
                    addr->>'address',
                    addr->>'city',
                    addr->>'state',
                    addr->>'zipcode',
                    addr->>'gate_code',
                    addr->>'access_notes',
                    coalesce(addr->>'service_notes', '') || 
                    case when addr->>'property_size' is not null 
                         then ' (Size: ' || (addr->>'property_size') || ')' 
                         else '' end,
                    case when addr->>'lat' is not null then (addr->>'lat')::numeric else null end,
                    case when addr->>'lng' is not null then (addr->>'lng')::numeric else null end
                );
            end if;
        end loop;
    end if;
    
    return NEW;
end;
$$ language plpgsql;

-- Create trigger to auto-create properties from service addresses
drop trigger if exists trigger_create_property_from_service_address on contacts;
create trigger trigger_create_property_from_service_address
    after update of service_addresses_jsonb on contacts
    for each row
    execute function create_property_from_service_address();

-- Also create properties for new contacts with service addresses
create or replace function create_property_from_service_address_insert()
returns trigger as $$
declare
    addr jsonb;
begin
    -- Only process if service_addresses_jsonb is not empty
    if NEW.service_addresses_jsonb is not null 
       and jsonb_array_length(NEW.service_addresses_jsonb) > 0 then
        
        -- Loop through each service address
        for addr in select jsonb_array_elements(NEW.service_addresses_jsonb)
        loop
            -- Create a new property record
            insert into properties (
                contact_id,
                name,
                address,
                city,
                state,
                zipcode,
                gate_code,
                access_notes,
                notes,
                lat,
                lng
            ) values (
                NEW.id,
                coalesce(addr->>'type', 'Service Location') || ' - ' || 
                coalesce(NEW.first_name, '') || ' ' || coalesce(NEW.last_name, ''),
                addr->>'address',
                addr->>'city',
                addr->>'state',
                addr->>'zipcode',
                addr->>'gate_code',
                addr->>'access_notes',
                coalesce(addr->>'service_notes', '') || 
                case when addr->>'property_size' is not null 
                     then ' (Size: ' || (addr->>'property_size') || ')' 
                     else '' end,
                case when addr->>'lat' is not null then (addr->>'lat')::numeric else null end,
                case when addr->>'lng' is not null then (addr->>'lng')::numeric else null end
            );
        end loop;
    end if;
    
    return NEW;
end;
$$ language plpgsql;

drop trigger if exists trigger_create_property_from_service_address_insert on contacts;
create trigger trigger_create_property_from_service_address_insert
    after insert on contacts
    for each row
    execute function create_property_from_service_address_insert();
