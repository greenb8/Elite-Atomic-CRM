import * as React from 'react';
import { Show, SimpleShowLayout, TextField, DateField, ReferenceManyField, Datagrid, NumberField } from 'react-admin';

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
