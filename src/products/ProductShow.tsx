import * as React from 'react';
import {
    Show,
    SimpleShowLayout,
    TextField,
    NumberField,
    DateField,
    useRecordContext,
    EditButton,
    TopToolbar,
    ReferenceManyField,
    Datagrid,
} from 'react-admin';
import { Grid, Card, CardMedia, Typography, Box } from '@mui/material';

const ProductShowActions = () => (
    <TopToolbar>
        <EditButton />
    </TopToolbar>
);

const ProductGallery = () => {
    const record = useRecordContext();

    if (!record || !record.photos_paths || record.photos_paths.length === 0) {
        return null;
    }

    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
            {record.photos_paths.map((path: string, index: number) => (
                <Card key={index} sx={{ width: 200 }}>
                    <CardMedia
                        component="img"
                        height="140"
                        image={path}
                        alt={`Product image ${index + 1}`}
                    />
                </Card>
            ))}
        </Box>
    );
};

const ProductShow = () => (
    <Show actions={<ProductShowActions />}>
        <SimpleShowLayout>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                        Product Details
                    </Typography>
                    <TextField source="name" />
                    <TextField source="sku" />
                    <TextField source="description" />
                    <TextField source="vendor" />
                    <TextField source="size" />
                </Grid>
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                        Pricing & Inventory
                    </Typography>
                    <NumberField
                        source="cost"
                        options={{ style: 'currency', currency: 'USD' }}
                    />
                    <NumberField
                        source="price"
                        options={{ style: 'currency', currency: 'USD' }}
                    />
                    <NumberField source="quantity_on_hand" label="In Stock" />
                    <NumberField source="quantity_sold" label="Total Sold" />
                    <DateField source="created_at" label="Added On" />
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                        Product Images
                    </Typography>
                    <ProductGallery />
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                        Sales History
                    </Typography>
                    <ReferenceManyField
                        target="product_id"
                        reference="deal_line_items"
                    >
                        <Datagrid
                            bulkActionButtons={false}
                            rowClick={false}
                            size="small"
                        >
                            <TextField source="name" />
                            <NumberField
                                source="price"
                                options={{ style: 'currency', currency: 'USD' }}
                            />
                            <NumberField source="quantity" />
                        </Datagrid>
                    </ReferenceManyField>
                </Grid>
            </Grid>
        </SimpleShowLayout>
    </Show>
);

export default ProductShow;
