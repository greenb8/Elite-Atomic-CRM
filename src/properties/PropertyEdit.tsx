import * as React from 'react';
import { Edit, SimpleForm } from 'react-admin';
import PropertyInputs from './PropertyInputs';

export default function PropertyEdit() {
    return (
        <Edit>
            <SimpleForm>
                <PropertyInputs />
            </SimpleForm>
        </Edit>
    );
}
