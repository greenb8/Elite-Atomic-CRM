-- Function to create a property from a new contact
CREATE OR REPLACE FUNCTION public.create_property_for_new_contact()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if a service_address is provided
  IF NEW.service_address IS NOT NULL AND NEW.service_address <> '' THEN
    INSERT INTO public.properties (contact_id, name, address, city, state, zipcode)
    VALUES (NEW.id, NEW.first_name || ' ' || NEW.last_name || '''s Property', NEW.service_address, NEW.service_city, NEW.service_state, NEW.service_zipcode);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to execute the function after a contact is created
CREATE TRIGGER on_contact_created_create_property
  AFTER INSERT ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.create_property_for_new_contact();
