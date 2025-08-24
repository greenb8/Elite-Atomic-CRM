-- Query to verify the trigger function exists
SELECT 
    proname AS function_name,
    proargtypes,
    prosrc AS function_definition
FROM 
    pg_proc
WHERE 
    proname = 'create_property_for_new_contact';

-- Query to verify the trigger exists on the contacts table
SELECT 
    tgname AS trigger_name,
    tgrelid::regclass AS table_name,
    tgtype,
    tgenabled,
    tgfoid::regproc AS trigger_function
FROM 
    pg_trigger
WHERE 
    tgname = 'on_contact_created_create_property';
