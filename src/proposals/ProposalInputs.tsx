import {
    Stack,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import * as React from 'react';
import {
    AutocompleteInput,
    DateTimeInput,
    NumberInput,
    ReferenceInput,
    SelectInput,
    TextInput,
    required,
    useGetIdentity,
} from 'react-admin';

import { ProposalStatus } from '../types';

const proposalStatuses: ProposalStatus[] = [
    { value: 'draft', label: 'Draft', color: '#757575' },
    { value: 'sent', label: 'Sent', color: '#2196F3' },
    { value: 'viewed', label: 'Viewed', color: '#FF9800' },
    { value: 'accepted', label: 'Accepted', color: '#4CAF50' },
    { value: 'rejected', label: 'Rejected', color: '#F44336' },
    { value: 'expired', label: 'Expired', color: '#9E9E9E' },
];

export const ProposalInputs = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { identity } = useGetIdentity();

    return (
        <Stack gap={2} p={1}>
            <Stack gap={3} direction={isMobile ? 'column' : 'row'}>
                <Stack gap={4} flex={4}>
                    <ProposalBasicInputs />
                    <ProposalFinancialInputs />
                </Stack>
                <Stack gap={4} flex={3}>
                    <ProposalStatusInputs />
                    <ProposalMetadataInputs />
                </Stack>
            </Stack>
        </Stack>
    );
};

const ProposalBasicInputs = () => {
    return (
        <Stack>
            <Typography variant="h6" sx={{ color: '#0A2243', fontWeight: 600 }}>
                Proposal Details
            </Typography>
            <TextInput
                source="title"
                validate={required()}
                helperText={false}
                fullWidth
            />
            <ReferenceInput source="deal_id" reference="deals">
                <AutocompleteInput
                    optionText="name"
                    helperText={false}
                    label="Related Deal"
                />
            </ReferenceInput>
            <ReferenceInput 
                source="template_id" 
                reference="proposal_templates"
                filter={{ is_active: true }}
                sort={{ field: 'is_default', order: 'DESC' }}
            >
                <AutocompleteInput
                    optionText="name"
                    helperText="Select a template to use as the starting point for this proposal"
                    label="Template"
                    sx={{
                        '& .MuiAutocomplete-option': {
                            '&[data-focus="true"]': {
                                backgroundColor: '#FCBB1C20',
                            },
                        },
                    }}
                />
            </ReferenceInput>
        </Stack>
    );
};

const ProposalStatusInputs = () => {
    return (
        <Stack>
            <Typography variant="h6" sx={{ color: '#0A2243', fontWeight: 600 }}>
                Status & Tracking
            </Typography>
            <SelectInput
                source="status"
                choices={proposalStatuses}
                optionText="label"
                optionValue="value"
                helperText={false}
                defaultValue="draft"
                sx={{
                    '& .MuiChip-root': {
                        backgroundColor: '#FCBB1C',
                        color: '#0A2243',
                    },
                }}
            />
            <DateTimeInput
                source="expires_at"
                label="Expiration Date"
                helperText={false}
            />
            <NumberInput
                source="view_count"
                label="View Count"
                helperText={false}
                disabled
            />
        </Stack>
    );
};

const ProposalFinancialInputs = () => {
    return (
        <Stack>
            <Typography variant="h6" sx={{ color: '#0A2243', fontWeight: 600 }}>
                Financial Details
            </Typography>
            <NumberInput
                source="subtotal"
                label="Subtotal"
                helperText={false}
                disabled
                sx={{
                    '& .MuiInputBase-input': {
                        fontWeight: 500,
                    },
                }}
            />
            <NumberInput
                source="tax_rate"
                label="Tax Rate"
                helperText="Enter as decimal (e.g., 0.0825 for 8.25%)"
                step={0.0001}
                min={0}
                max={1}
                defaultValue={0.0825}
            />
            <NumberInput
                source="tax_amount"
                label="Tax Amount"
                helperText={false}
                disabled
                sx={{
                    '& .MuiInputBase-input': {
                        fontWeight: 500,
                    },
                }}
            />
            <NumberInput
                source="total_amount"
                label="Total Amount"
                helperText={false}
                disabled
                sx={{
                    '& .MuiInputBase-input': {
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        color: '#0A2243',
                    },
                }}
            />
            <NumberInput
                source="deposit_amount"
                label="Deposit Required"
                helperText={false}
                min={0}
            />
        </Stack>
    );
};

const ProposalMetadataInputs = () => {
    return (
        <Stack>
            <Typography variant="h6" sx={{ color: '#0A2243', fontWeight: 600 }}>
                Tracking Information
            </Typography>
            <DateTimeInput
                source="sent_at"
                label="Date Sent"
                helperText={false}
                disabled
            />
            <DateTimeInput
                source="first_viewed_at"
                label="First Viewed"
                helperText={false}
                disabled
            />
            <DateTimeInput
                source="responded_at"
                label="Client Response"
                helperText={false}
                disabled
            />
        </Stack>
    );
};
