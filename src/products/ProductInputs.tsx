import * as React from 'react';
import {
    TextInput,
    NumberInput,
    required,
    ImageInput,
    ImageField,
} from 'react-admin';
import { Grid } from '@mui/material';

export const ProductInputs = () => (
    <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
            <TextInput source="name" fullWidth validate={required()} />
        </Grid>
        <Grid item xs={12} md={6}>
            <TextInput source="sku" fullWidth />
        </Grid>
        <Grid item xs={12}>
            <TextInput source="description" fullWidth multiline rows={3} />
        </Grid>
        <Grid item xs={12} md={6}>
            <TextInput source="vendor" fullWidth />
        </Grid>
        <Grid item xs={12} md={6}>
            <TextInput source="size" fullWidth />
        </Grid>
        <Grid item xs={12} md={4}>
            <NumberInput source="cost" fullWidth />
        </Grid>
        <Grid item xs={12} md={4}>
            <NumberInput source="price" fullWidth validate={required()} />
        </Grid>
        <Grid item xs={12} md={4}>
            <NumberInput source="quantity_on_hand" fullWidth defaultValue={0} />
        </Grid>
        <Grid item xs={12}>
            <ImageInput source="photos_paths" label="Product Photos" multiple>
                <ImageField source="src" title="title" />
            </ImageInput>
        </Grid>
    </Grid>
);

export default ProductInputs;
