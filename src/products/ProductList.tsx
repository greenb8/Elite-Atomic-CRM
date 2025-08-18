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
import { Box, Chip } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';

const productFilters = [
    <SearchInput source="q" alwaysOn />,
    <TextInput source="name" />,
    <TextInput source="vendor" />,
];

const VendorFilterList = () => {
    const { filterValues, setFilters } = useListFilterContext();

    const handleClick = (vendor: string) => {
        const newFilterValues = { ...filterValues, vendor };
        setFilters(newFilterValues, {});
    };

    return (
        <FilterList label="Vendor" icon={<InventoryIcon />}>
            <FilterListItem
                label="All"
                value={{ vendor: undefined }}
            />
            <FilterListItem
                label="Vendor A"
                value={{ vendor: 'Vendor A' }}
            />
            <FilterListItem
                label="Vendor B"
                value={{ vendor: 'Vendor B' }}
            />
            {/* Add more vendors as needed */}
        </FilterList>
    );
};

const ProductList = () => {
    return (
        <List
            filters={productFilters}
            sort={{ field: 'name', order: 'ASC' }}
            aside={
                <Box width={200} mr={1} mt={8}>
                    <VendorFilterList />
                </Box>
            }
        >
            <Datagrid rowClick="show">
                <TextField source="name" />
                <TextField source="vendor" />
                <TextField source="size" />
                <NumberField source="quantity_on_hand" label="In Stock" />
                <NumberField source="cost" options={{ style: 'currency', currency: 'USD' }} />
                <NumberField source="price" options={{ style: 'currency', currency: 'USD' }} />
                <EditButton />
            </Datagrid>
        </List>
    );
};

export default ProductList;
