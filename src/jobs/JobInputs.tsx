import {
    AutocompleteInput,
    DateTimeInput,
    ReferenceInput,
    SelectInput,
    TextInput,
} from 'react-admin';
import { Box } from '@mui/material';

const statusChoices = [
    { id: 'Unscheduled', name: 'Unscheduled' },
    { id: 'Scheduled', name: 'Scheduled' },
    { id: 'In Progress', name: 'In Progress' },
    { id: 'Completed', name: 'Completed' },
    { id: 'Cancelled', name: 'Cancelled' },
];

export default function JobInputs() {
    return (
        <Box
            display="grid"
            gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }}
            gap={2}
        >
            <ReferenceInput source="deal_id" reference="deals" fullWidth>
                <AutocompleteInput label="Deal" optionText="name" fullWidth />
            </ReferenceInput>

            <ReferenceInput
                source="property_id"
                reference="properties"
                fullWidth
            >
                <AutocompleteInput
                    label="Property"
                    optionText="name"
                    fullWidth
                />
            </ReferenceInput>

            <ReferenceInput source="assigned_to_id" reference="sales" fullWidth>
                <AutocompleteInput
                    label="Assigned To"
                    optionText="full_name"
                    fullWidth
                />
            </ReferenceInput>

            <SelectInput source="status" choices={statusChoices} fullWidth />

            <DateTimeInput source="scheduled_at" fullWidth />

            <TextInput
                source="notes"
                multiline
                fullWidth
                sx={{ gridColumn: '1 / -1' }}
            />
        </Box>
    );
}
