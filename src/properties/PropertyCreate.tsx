import * as React from 'react';
import { Create, SimpleForm } from 'react-admin';
import PropertyInputs from './PropertyInputs';

export default function PropertyCreate() {
	return (
		<Create>
			<SimpleForm>
				<PropertyInputs />
			</SimpleForm>
		</Create>
	);
}
