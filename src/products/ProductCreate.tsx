import * as React from 'react';
import { Create, SimpleForm } from 'react-admin';
import ProductInputs from './ProductInputs';

const ProductCreate = () => (
    <Create>
        <SimpleForm>
            <ProductInputs />
        </SimpleForm>
    </Create>
);

export default ProductCreate;
