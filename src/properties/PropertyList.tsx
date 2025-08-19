import {
    Datagrid,
    DateField,
    List,
    SearchInput,
    TextField,
    TextInput,
} from 'react-admin';

const filters = [
    <SearchInput source="q" alwaysOn />,
    <TextInput source="name" />,
    <TextInput source="city" />,
];

export default function PropertyList() {
    return (
        <List filters={filters} sort={{ field: 'name', order: 'ASC' }}>
            <Datagrid rowClick="show">
                <TextField source="name" />
                <TextField source="contact_name" label="Contact" />
                <TextField source="city" />
                <TextField source="state" />
                <TextField source="nb_deals" />
                <DateField source="last_deal_date" />
            </Datagrid>
        </List>
    );
}
