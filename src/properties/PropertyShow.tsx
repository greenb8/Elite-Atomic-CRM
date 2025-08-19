import * as React from 'react';
import { 
    Show, 
    SimpleShowLayout, 
    TextField, 
    DateField, 
    ReferenceManyField, 
    Datagrid, 
    NumberField,
    ImageField,
    ArrayField,
    SingleFieldList
} from 'react-admin';
import { Box, Typography, Divider } from '@mui/material';

export default function PropertyShow() {
	return (
		<Show>
			<SimpleShowLayout>
				<TextField source="name" />
				<TextField source="contact_name" label="Contact" />
				<TextField source="address" />
				<TextField source="city" />
				<TextField source="state" />
				<TextField source="zipcode" />
				<TextField source="country" />
				<TextField source="gate_code" />
				<TextField source="access_notes" />
				<TextField source="notes" />
				<DateField source="created_at" />
                
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>Property Photos</Typography>
                <ArrayField source="photos_paths">
                    <SingleFieldList>
                        <ImageField source="src" title="title" />
                    </SingleFieldList>
                </ArrayField>

                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>Google Photos</Typography>
                <ArrayField source="google_photos_paths">
                    <SingleFieldList>
                        <ImageField source="src" title="title" />
                    </SingleFieldList>
                </ArrayField>

                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>Related Deals</Typography>
				<ReferenceManyField reference="deals" target="property_id">
					<Datagrid rowClick="show">
						<TextField source="name" />
						<NumberField source="amount" />
						<DateField source="created_at" />
					</Datagrid>
				</ReferenceManyField>
			</SimpleShowLayout>
		</Show>
	);
}