import { useEffect, useRef } from 'react';
import { TextInput } from 'react-admin';
import { useFormContext } from 'react-hook-form';
import { useGoogleMapsScript } from './useGoogleMapsScript';

interface AddressAutocompleteInputProps {
    source: string;
    label?: string;
    citySource: string;
    stateSource: string;
    zipSource: string;
    helperText?: false | string | React.ReactElement;
}

export const AddressAutocompleteInput = (
    props: AddressAutocompleteInputProps
) => {
    const { source, citySource, stateSource, zipSource, ...rest } = props;
    const scriptLoaded = useGoogleMapsScript();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const { setValue } = useFormContext();

    // We let react-admin manage the input via source and use ref for autocomplete

    useEffect(() => {
        if (!scriptLoaded || !inputRef.current || !(window as any).google)
            return;

        const autocomplete = new (
            window as any
        ).google.maps.places.Autocomplete(inputRef.current, {
            types: ['address'],
            fields: ['address_components'],
        });

        const listener = autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            const components = place?.address_components as any[] | undefined;
            if (!components) return;

            let streetNumber = '';
            let route = '';
            let locality = '';
            let admin1 = '';
            let postal = '';

            for (const component of components) {
                if (component.types.includes('street_number')) {
                    streetNumber = component.long_name;
                } else if (component.types.includes('route')) {
                    route = component.long_name;
                } else if (component.types.includes('locality')) {
                    locality = component.long_name;
                } else if (
                    component.types.includes('administrative_area_level_1')
                ) {
                    admin1 = component.short_name;
                } else if (component.types.includes('postal_code')) {
                    postal = component.long_name;
                }
            }

            const fullAddress = `${streetNumber} ${route}`.trim();
            if (fullAddress)
                setValue(source, fullAddress, { shouldValidate: true });
            if (locality)
                setValue(citySource, locality, { shouldValidate: true });
            if (admin1) setValue(stateSource, admin1, { shouldValidate: true });
            if (postal) setValue(zipSource, postal, { shouldValidate: true });
        });

        return () => {
            (window as any).google.maps.event.removeListener(listener);
        };
    }, [scriptLoaded, source, citySource, stateSource, zipSource, setValue]);

    return <TextInput {...rest} source={source} inputRef={inputRef} />;
};
