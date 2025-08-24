import { Box, Card, CardContent } from '@mui/material';
import * as React from 'react';
import { CreateBase, Form, Toolbar, useGetIdentity } from 'react-admin';

import { useFormContext } from 'react-hook-form';
import { useGoogleMapsScript } from '../misc/useGoogleMapsScript';
import { Contact } from '../types';
import { ContactInputs } from './ContactInputs';

const ContactCreateAutocompleteBinder = () => {
    const scriptLoaded = useGoogleMapsScript();
    const { setValue, watch } = useFormContext<Contact>();

    React.useEffect(() => {
        if (!scriptLoaded || !(window as any).google) return;

        const bindServiceAddresses = () => {
            // Find all service address inputs
            const addressInputs = document.querySelectorAll(
                'input[name*="service_addresses_jsonb"][name*=".address"]'
            ) as NodeListOf<HTMLInputElement>;

            const cleanupFunctions: (() => void)[] = [];

            addressInputs.forEach((input, index) => {
                if (input.dataset.autocompleteInitialized) return;
                input.dataset.autocompleteInitialized = 'true';

                const autocomplete = new (
                    window as any
                ).google.maps.places.Autocomplete(input, {
                    types: ['address'],
                    fields: ['address_components', 'geometry'],
                });

                const listener = autocomplete.addListener('place_changed', () => {
                    const place = autocomplete.getPlace();
                    const components = place?.address_components as
                        | any[]
                        | undefined;
                    if (!components) return;

                    let streetNumber = '';
                    let route = '';
                    let locality = '';
                    let admin1 = '';
                    let postal = '';

                    for (const component of components) {
                        if (component.types.includes('street_number'))
                            streetNumber = component.long_name;
                        else if (component.types.includes('route'))
                            route = component.long_name;
                        else if (component.types.includes('locality'))
                            locality = component.long_name;
                        else if (
                            component.types.includes('administrative_area_level_1')
                        )
                            admin1 = component.short_name;
                        else if (component.types.includes('postal_code'))
                            postal = component.long_name;
                    }

                    const fullAddress = `${streetNumber} ${route}`.trim();
                    
                    // Update the service address array
                    if (fullAddress) {
                        setValue(`service_addresses_jsonb.${index}.address`, fullAddress, {
                            shouldValidate: true,
                        });
                    }
                    if (locality) {
                        setValue(`service_addresses_jsonb.${index}.city`, locality, {
                            shouldValidate: true,
                        });
                    }
                    if (admin1) {
                        setValue(`service_addresses_jsonb.${index}.state`, admin1, {
                            shouldValidate: true,
                        });
                    }
                    if (postal) {
                        setValue(`service_addresses_jsonb.${index}.zipcode`, postal, {
                            shouldValidate: true,
                        });
                    }

                    // Add lat/lng if available
                    if (place.geometry?.location) {
                        setValue(`service_addresses_jsonb.${index}.lat`, place.geometry.location.lat(), {
                            shouldValidate: true,
                        });
                        setValue(`service_addresses_jsonb.${index}.lng`, place.geometry.location.lng(), {
                            shouldValidate: true,
                        });
                    }
                });

                cleanupFunctions.push(() => {
                    (window as any).google.maps.event.removeListener(listener);
                    input.dataset.autocompleteInitialized = '';
                });
            });

            return cleanupFunctions;
        };

        const bindBillingAddress = () => {
            const input = document.querySelector(
                `input[name="billing_address"]`
            ) as HTMLInputElement | null;
            if (!input || input.dataset.autocompleteInitialized) return null;
            
            input.dataset.autocompleteInitialized = 'true';

            const autocomplete = new (
                window as any
            ).google.maps.places.Autocomplete(input, {
                types: ['address'],
                fields: ['address_components'],
            });

            const listener = autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                const components = place?.address_components as
                    | any[]
                    | undefined;
                if (!components) return;

                let streetNumber = '';
                let route = '';
                let locality = '';
                let admin1 = '';
                let postal = '';

                for (const component of components) {
                    if (component.types.includes('street_number'))
                        streetNumber = component.long_name;
                    else if (component.types.includes('route'))
                        route = component.long_name;
                    else if (component.types.includes('locality'))
                        locality = component.long_name;
                    else if (
                        component.types.includes('administrative_area_level_1')
                    )
                        admin1 = component.short_name;
                    else if (component.types.includes('postal_code'))
                        postal = component.long_name;
                }

                const fullAddress = `${streetNumber} ${route}`.trim();
                if (fullAddress)
                    setValue('billing_address', fullAddress, {
                        shouldValidate: true,
                    });
                if (locality)
                    setValue('billing_city', locality, {
                        shouldValidate: true,
                    });
                if (admin1)
                    setValue('billing_state', admin1, {
                        shouldValidate: true,
                    });
                if (postal)
                    setValue('billing_zipcode', postal, {
                        shouldValidate: true,
                    });
            });

            return () => {
                (window as any).google.maps.event.removeListener(listener);
                input.dataset.autocompleteInitialized = '';
            };
        };

        // Initial binding
        const serviceAddressCleanups = bindServiceAddresses();
        const billingCleanup = bindBillingAddress();

        // Re-bind when service addresses change (when new ones are added)
        const interval = setInterval(() => {
            const newServiceCleanups = bindServiceAddresses();
            const newBillingCleanup = bindBillingAddress();
            
            // Store new cleanups
            serviceAddressCleanups.push(...newServiceCleanups);
            if (newBillingCleanup && !billingCleanup) {
                // billingCleanup = newBillingCleanup;
            }
        }, 1000);

        return () => {
            clearInterval(interval);
            serviceAddressCleanups.forEach(cleanup => cleanup());
            if (billingCleanup) billingCleanup();
        };
    }, [scriptLoaded, setValue, watch]);

    return null;
};

export const ContactCreate = () => {
    const { identity } = useGetIdentity();
    return (
        <CreateBase
            redirect="show"
            transform={(data: Contact) => ({
                ...data,
                first_seen: new Date().toISOString(),
                last_seen: new Date().toISOString(),
                tags: [],
            })}
        >
            <Box mt={2} display="flex">
                <Box flex="1">
                    <Form defaultValues={{ sales_id: identity?.id }}>
                        <Card>
                            <CardContent>
                                <ContactInputs />
                                <ContactCreateAutocompleteBinder />
                            </CardContent>
                            <Toolbar />
                        </Card>
                    </Form>
                </Box>
            </Box>
        </CreateBase>
    );
};
