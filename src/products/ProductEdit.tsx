import * as React from 'react';
import { Edit, SimpleForm } from 'react-admin';
import ProductInputs from './ProductInputs';

const ProductEdit = () => (
    <Edit>
        <SimpleForm>
            <ProductInputs />
        </SimpleForm>
    </Edit>
);

export default ProductEdit;
