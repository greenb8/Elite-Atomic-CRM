import {
    Divider,
    Stack,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import * as React from 'react';
import {
    ArrayInput,
    AutocompleteInput,
    BooleanInput,
    RadioButtonGroupInput,
    ReferenceInput,
    SelectInput,
    SimpleFormIterator,
    TextInput,
    email,
    required,
    useCreate,
    useGetIdentity,
    useNotify,
} from 'react-admin';
import { useFormContext } from 'react-hook-form';

import { AddressAutocompleteInput } from '../misc/AddressAutocompleteInput';
import { useConfigurationContext } from '../root/ConfigurationContext';
import { Sale } from '../types';
import { Avatar } from './Avatar';

export const ContactInputs = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <Stack gap={2} p={1}>
            <Avatar />
            <Stack gap={3} direction={isMobile ? 'column' : 'row'}>
                <Stack gap={4} flex={4}>
                    <ContactIdentityInputs />
                    <ContactPositionInputs />
                </Stack>
                <Divider
                    orientation={isMobile ? 'horizontal' : 'vertical'}
                    flexItem
                />
                <Stack gap={4} flex={5}>
                    <ContactPersonalInformationInputs />
                    <ContactAddressInputs />
                    <ContactMiscInputs />
                </Stack>
            </Stack>
        </Stack>
    );
};

const ContactIdentityInputs = () => {
    const { contactGender } = useConfigurationContext();
    return (
        <Stack>
            <Typography variant="h6">Identity</Typography>
            <RadioButtonGroupInput
                label={false}
                source="gender"
                choices={contactGender}
                helperText={false}
                optionText="label"
                optionValue="value"
                sx={{ '& .MuiRadio-root': { paddingY: 0 } }}
                defaultValue={contactGender[0].value}
            />
            <TextInput
                source="first_name"
                validate={required()}
                helperText={false}
            />
            <TextInput
                source="last_name"
                validate={required()}
                helperText={false}
            />
        </Stack>
    );
};

const ContactPositionInputs = () => {
    const [create] = useCreate();
    const { identity } = useGetIdentity();
    const notify = useNotify();
    const handleCreateCompany = async (name?: string) => {
        if (!name) return;
        try {
            const newCompany = await create(
                'companies',
                {
                    data: {
                        name,
                        sales_id: identity?.id,
                        created_at: new Date().toISOString(),
                    },
                },
                { returnPromise: true }
            );
            return newCompany;
        } catch (error) {
            notify('An error occurred while creating the company', {
                type: 'error',
            });
        }
    };
    return (
        <Stack>
            <Typography variant="h6">Position</Typography>
            <TextInput source="title" helperText={false} />
            <ReferenceInput source="company_id" reference="companies">
                <AutocompleteInput
                    optionText="name"
                    onCreate={handleCreateCompany}
                    helperText={false}
                />
            </ReferenceInput>
        </Stack>
    );
};

const ContactPersonalInformationInputs = () => {
    const { getValues, setValue } = useFormContext();

    // set first and last name based on email
    const handleEmailChange = (email: string) => {
        const { first_name, last_name } = getValues();
        if (first_name || last_name || !email) return;
        const [first, last] = email.split('@')[0].split('.');
        setValue('first_name', first.charAt(0).toUpperCase() + first.slice(1));
        setValue(
            'last_name',
            last ? last.charAt(0).toUpperCase() + last.slice(1) : ''
        );
    };

    const handleEmailPaste: React.ClipboardEventHandler<HTMLDivElement> = e => {
        const email = e.clipboardData?.getData('text/plain');
        handleEmailChange(email);
    };

    const handleEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const email = e.target.value;
        handleEmailChange(email);
    };

    const formatPhoneForDisplay = (value?: string) => {
        const digits = (value || '').replace(/\D/g, '').slice(0, 10);
        if (digits.length <= 3) return digits;
        if (digits.length <= 6)
            return `${digits.slice(0, 3)}-${digits.slice(3)}`;
        return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    };

    const parsePhoneForSave = (value?: string) => {
        return (value || '').replace(/\D/g, '').slice(0, 10);
    };

    return (
        <Stack>
            <Typography variant="h6">Personal info</Typography>
            <ArrayInput
                source="email_jsonb"
                label="Email addresses"
                helperText={false}
            >
                <SimpleFormIterator inline disableReordering>
                    <TextInput
                        source="email"
                        helperText={false}
                        validate={email()}
                        onPaste={handleEmailPaste}
                        onBlur={handleEmailBlur}
                    />
                    <SelectInput
                        source="type"
                        helperText={false}
                        optionText="id"
                        choices={personalInfoTypes}
                        defaultValue="Work"
                        fullWidth={false}
                        sx={{ width: 100, minWidth: 100 }}
                    />
                </SimpleFormIterator>
            </ArrayInput>
            <ArrayInput
                source="phone_jsonb"
                label="Phone numbers"
                helperText={false}
            >
                <SimpleFormIterator inline disableReordering>
                    <TextInput
                        source="number"
                        helperText={false}
                        format={formatPhoneForDisplay}
                        parse={parsePhoneForSave}
                        inputProps={{ inputMode: 'numeric' }}
                    />
                    <SelectInput
                        source="type"
                        helperText={false}
                        optionText="id"
                        choices={personalInfoTypes}
                        defaultValue="Work"
                        fullWidth={false}
                        sx={{ width: 100, minWidth: 100 }}
                    />
                </SimpleFormIterator>
            </ArrayInput>
        </Stack>
    );
};

const personalInfoTypes = [{ id: 'Work' }, { id: 'Home' }, { id: 'Other' }];

const ContactMiscInputs = () => {
    return (
        <Stack>
            <Typography variant="h6">Misc</Typography>
            <TextInput
                source="background"
                label="Background info (bio, how you met, etc)"
                multiline
                helperText={false}
            />
            <BooleanInput source="has_newsletter" helperText={false} />
            <ReferenceInput
                reference="sales"
                source="sales_id"
                sort={{ field: 'last_name', order: 'ASC' }}
                filter={{
                    'disabled@neq': true,
                }}
            >
                <SelectInput
                    helperText={false}
                    label="Account manager"
                    optionText={saleOptionRenderer}
                    validate={required()}
                />
            </ReferenceInput>
        </Stack>
    );
};

const saleOptionRenderer = (choice: Sale) =>
    `${choice.first_name} ${choice.last_name}`;

const ContactAddressInputs = () => {
    const { serviceAddressTypes } = useConfigurationContext();

    return (
        <Stack>
            <Typography variant="h6">Addresses</Typography>
            <ArrayInput
                source="service_addresses_jsonb"
                label="Service addresses"
                helperText={false}
            >
                <SimpleFormIterator disableReordering>
                    <Stack spacing={2} sx={{ width: '100%', minWidth: 600 }}>
                        <AddressAutocompleteInput
                            source="address"
                            label="Address"
                            citySource="city"
                            stateSource="state"
                            zipSource="zipcode"
                            helperText={false}
                        />
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={2}
                        >
                            <TextInput
                                source="city"
                                label="City"
                                helperText={false}
                                sx={{ flex: 2 }}
                            />
                            <TextInput
                                source="state"
                                label="State"
                                helperText={false}
                                sx={{ flex: 1, maxWidth: 120 }}
                            />
                            <TextInput
                                source="zipcode"
                                label="Zip code"
                                helperText={false}
                                sx={{ flex: 1, maxWidth: 140 }}
                            />
                        </Stack>
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={2}
                        >
                            <SelectInput
                                source="type"
                                label="Property Type"
                                helperText={false}
                                optionText="label"
                                optionValue="value"
                                choices={serviceAddressTypes}
                                defaultValue="Primary Property"
                                sx={{ flex: 1, minWidth: 180 }}
                            />
                            <TextInput
                                source="gate_code"
                                label="Gate Code"
                                helperText={false}
                                sx={{ flex: 1, maxWidth: 140 }}
                            />
                            <TextInput
                                source="property_size"
                                label="Property Size"
                                helperText={false}
                                sx={{ flex: 1, maxWidth: 140 }}
                            />
                        </Stack>
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={2}
                        >
                            <TextInput
                                source="access_notes"
                                label="Access Notes"
                                helperText={false}
                                multiline
                                rows={2}
                                sx={{ flex: 1 }}
                            />
                            <TextInput
                                source="service_notes"
                                label="Service Notes"
                                helperText={false}
                                multiline
                                rows={2}
                                sx={{ flex: 1 }}
                            />
                        </Stack>
                    </Stack>
                </SimpleFormIterator>
            </ArrayInput>
            <Typography variant="subtitle2" mt={2}>
                Billing address (if different)
            </Typography>
            <AddressAutocompleteInput
                source="billing_address"
                label="Address"
                citySource="billing_city"
                stateSource="billing_state"
                zipSource="billing_zipcode"
                helperText={false}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
                <TextInput
                    source="billing_city"
                    label="City"
                    helperText={false}
                />
                <TextInput
                    source="billing_state"
                    label="State"
                    helperText={false}
                    sx={{ maxWidth: 120 }}
                />
                <TextInput
                    source="billing_zipcode"
                    label="Zip code"
                    helperText={false}
                    sx={{ maxWidth: 160 }}
                />
            </Stack>
        </Stack>
    );
};
