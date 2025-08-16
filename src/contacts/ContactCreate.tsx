import { Box, Card, CardContent } from '@mui/material';
import * as React from 'react';
import { CreateBase, Form, Toolbar, useGetIdentity } from 'react-admin';

import { useFormContext } from 'react-hook-form';
import { useGoogleMapsScript } from '../misc/useGoogleMapsScript';
import { Contact } from '../types';
import { ContactInputs } from './ContactInputs';

const ContactCreateAutocompleteBinder = () => {
    const scriptLoaded = useGoogleMapsScript();
    const { setValue } = useFormContext<Contact>();

    React.useEffect(() => {
        if (!scriptLoaded || !(window as any).google) return;

        const bind = (
            name: keyof Contact & string,
            mapping: {
                city: keyof Contact & string;
                state: keyof Contact & string;
                zip: keyof Contact & string;
            }
        ) => {
            const input = document.querySelector(
                `input[name="${name}"]`
            ) as HTMLInputElement | null;
            if (!input) return;

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
                    setValue(name as any, fullAddress, {
                        shouldValidate: true,
                    });
                if (locality)
                    setValue(mapping.city as any, locality, {
                        shouldValidate: true,
                    });
                if (admin1)
                    setValue(mapping.state as any, admin1, {
                        shouldValidate: true,
                    });
                if (postal)
                    setValue(mapping.zip as any, postal, {
                        shouldValidate: true,
                    });
            });

            return () => {
                (window as any).google.maps.event.removeListener(listener);
            };
        };

        const cleanup1 = bind('service_address', {
            city: 'service_city',
            state: 'service_state',
            zip: 'service_zipcode',
        });
        const cleanup2 = bind('billing_address', {
            city: 'billing_city',
            state: 'billing_state',
            zip: 'billing_zipcode',
        });

        return () => {
            if (cleanup1) cleanup1();
            if (cleanup2) cleanup2();
        };
    }, [scriptLoaded, setValue]);

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
