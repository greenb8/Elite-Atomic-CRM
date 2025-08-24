import { Box, Typography } from '@mui/material';
import { ListBase, Pagination, Title, TopToolbar, CreateButton } from 'react-admin';

import { ProductGrid } from './ProductGrid';
import { Empty } from '../layout/Empty';

const ProductListActions = () => (
    <TopToolbar>
        <CreateButton />
    </TopToolbar>
);

export const ProductList = () => (
    <ListBase
        resource="product_sales_stats"
        perPage={24}
        sort={{ field: 'name', order: 'ASC' }}
    >
        <Title title="Products" />
        <ProductListActions />
        <Box sx={{ mt: 2 }}>
            <ProductGrid />
        </Box>
        <Pagination rowsPerPageOptions={[12, 24, 48, 72]} />
        <Empty />
    </ListBase>
);

export default ProductList;

