import { DateField, ReferenceField, Show, SimpleShowLayout, TextField } from 'react-admin';

export default function JobShow() {
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
            </SimpleShowLayout>
        </Show>
    );
}


