import { Box } from '@mui/material';
import {
    DateField,
    ReferenceField,
    Show,
    SimpleShowLayout,
    TextField,
    useRecordContext,
} from 'react-admin';
import StreetViewImage from '../misc/StreetViewImage';

export default function JobShow() {
    const record = useRecordContext<any>();
    return (
        <Show>
            <SimpleShowLayout>
                <ReferenceField source="deal_id" reference="deals" />
                <ReferenceField source="property_id" reference="properties" />
                <ReferenceField source="assigned_to_id" reference="sales" />
                <TextField source="status" />
                <DateField source="scheduled_at" />
                <DateField source="completed_at" />
                <TextField source="notes" />
                <DateField source="created_at" />
                <Box sx={{ mt: 2 }}>
                    <StreetViewImage
                        address={record?.property_address || ''}
                        city={record?.property_city}
                        state={record?.property_state}
                        zipcode={record?.property_zipcode}
                        size={{ width: 600, height: 300 }}
                    />
                </Box>
            </SimpleShowLayout>
        </Show>
    );
}
