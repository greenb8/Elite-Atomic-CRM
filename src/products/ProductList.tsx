import * as React from 'react';
import {
    List,
    Datagrid,
    TextField,
    NumberField,
    EditButton,
    TextInput,
    SearchInput,
    FilterList,
    FilterListItem,
    useListFilterContext,
} from 'react-admin';
import { Box, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import TableRowsIcon from '@mui/icons-material/TableRows';
import { ProductGrid } from './ProductGrid';

const productFilters = [
    <SearchInput source="q" alwaysOn />,
    <TextInput source="name" />,
    <TextInput source="vendor" />,
];

const VendorFilterList = () => {
    const { filterValues, setFilters } = useListFilterContext();

    return (
        <FilterList label="Vendor" icon={<InventoryIcon />}>
            <FilterListItem label="All" value={{ vendor: undefined }} />
            {/* Example static filters; consider replacing with dynamic list later */}
            <FilterListItem label="Vendor A" value={{ vendor: 'Vendor A' }} />
            <FilterListItem label="Vendor B" value={{ vendor: 'Vendor B' }} />
        </FilterList>
    );
};

const ProductList = () => {
    const [view, setView] = React.useState<'table' | 'grid'>('grid');
    return (
        <List
            filters={productFilters}
            sort={{ field: 'name', order: 'ASC' }}
            aside={
                <Box width={200} mr={1} mt={8}>
                    <VendorFilterList />
                </Box>
            }
            actions={
                <Stack direction="row" alignItems="center" gap={1} sx={{ p: 1 }}>
                    <ToggleButtonGroup
                        value={view}
                        exclusive
                        onChange={(_, v) => v && setView(v)}
                        size="small"
                    >
                        <ToggleButton value="grid">
                            <ViewModuleIcon fontSize="small" />
                        </ToggleButton>
                        <ToggleButton value="table">
                            <TableRowsIcon fontSize="small" />
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Stack>
            }
        >
            {view === 'table' ? (
                <Datagrid rowClick="show">
                    <TextField source="name" />
                    <TextField source="vendor" />
                    <TextField source="size" />
                    <NumberField source="quantity_on_hand" label="In Stock" />
                    <NumberField source="cost" options={{ style: 'currency', currency: 'USD' }} />
                    <NumberField source="price" options={{ style: 'currency', currency: 'USD' }} />
                    <EditButton />
                </Datagrid>
            ) : (
                <ProductGrid />
            )}
        </List>
    );
};

export default ProductList;
