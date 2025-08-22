import { Box, Card, CardContent, Typography } from '@mui/material';
import {
    Datagrid,
    DateField,
    NumberField,
    ReferenceField,
    ReferenceManyField,
    ShowBase,
    TextField,
    useShowContext,
} from 'react-admin';

import PlaceIcon from '@mui/icons-material/Place';
import { CompanyAvatar } from '../companies/CompanyAvatar';
import StreetViewImage from '../misc/StreetViewImage';
import { NotesIterator } from '../notes';
import { Contact } from '../types';
import { Avatar } from './Avatar';
import { ContactAside } from './ContactAside';

export const ContactShow = () => (
    <ShowBase>
        <ContactShowContent />
    </ShowBase>
);

const ContactShowContent = () => {
    const { record, isPending } = useShowContext<Contact>();
    if (isPending || !record) return null;

    return (
        <Box mt={2} mb={2} display="flex">
            <Box flex="1">
                <Card>
                    <CardContent>
                        <Box display="flex">
                            <Avatar />
                            <Box ml={2} flex="1">
                                <Typography variant="h5">
                                    {record.first_name} {record.last_name}
                                </Typography>
                                <Typography variant="body2" component="div">
                                    {record.title}
                                    {record.title &&
                                        record.company_id != null &&
                                        ' at '}
                                    {record.company_id != null && (
                                        <ReferenceField
                                            source="company_id"
                                            reference="companies"
                                            link="show"
                                        >
                                            <TextField source="name" />
                                        </ReferenceField>
                                    )}
                                </Typography>
                            </Box>
                            <Box>
                                <ReferenceField
                                    source="company_id"
                                    reference="companies"
                                    link="show"
                                    sx={{ '& a': { textDecoration: 'none' } }}
                                >
                                    <CompanyAvatar />
                                </ReferenceField>
                            </Box>
                        </Box>
                        <ReferenceManyField
                            target="contact_id"
                            reference="contactNotes"
                            sort={{ field: 'date', order: 'DESC' }}
                        >
                            <NotesIterator showStatus reference="contacts" />
                        </ReferenceManyField>

                        {/* Associated Properties Section */}
                        <Box mt={3}>
                            <Typography variant="subtitle2" gutterBottom>
                                Associated Properties
                            </Typography>
                            <ReferenceManyField
                                reference="properties"
                                target="contact_id"
                                sort={{ field: 'created_at', order: 'DESC' }}
                            >
                                <Datagrid
                                    rowClick="show"
                                    bulkActionButtons={false}
                                    size="small"
                                >
                                    <TextField source="name" />
                                    <TextField source="address" />
                                    <TextField source="city" />
                                    <TextField source="state" />
                                    <DateField source="created_at" />
                                </Datagrid>
                            </ReferenceManyField>
                        </Box>

                        {/* Associated Deals Section */}
                        <Box mt={3}>
                            <Typography variant="subtitle2" gutterBottom>
                                Recent Deals
                            </Typography>
                            <ReferenceManyField
                                reference="deals"
                                target="contact_id"
                                sort={{ field: 'created_at', order: 'DESC' }}
                            >
                                <Datagrid
                                    rowClick="show"
                                    bulkActionButtons={false}
                                    size="small"
                                >
                                    <TextField source="name" />
                                    <TextField source="stage" />
                                    <NumberField
                                        source="amount"
                                        options={{
                                            style: 'currency',
                                            currency: 'USD',
                                        }}
                                    />
                                    <DateField source="created_at" />
                                </Datagrid>
                            </ReferenceManyField>
                        </Box>
                        <Box mt={2}>
                            <Typography variant="subtitle2" gutterBottom>
                                Addresses
                            </Typography>
                            {(record.service_address ||
                                record.service_city ||
                                record.service_state ||
                                record.service_zipcode) && (
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    gap={1}
                                    mb={1}
                                >
                                    <PlaceIcon
                                        fontSize="small"
                                        color="disabled"
                                    />
                                    <Typography variant="body2">
                                        {[
                                            record.service_address,
                                            record.service_city,
                                            record.service_state,
                                            record.service_zipcode,
                                        ]
                                            .filter(Boolean)
                                            .join(', ')}
                                    </Typography>
                                </Box>
                            )}
                            {record.service_address && (
                                <Box mt={2}>
                                    <Typography
                                        variant="subtitle2"
                                        gutterBottom
                                    >
                                        Service Location Street View
                                    </Typography>
                                    <StreetViewImage
                                        address={record.service_address || ''}
                                        city={record.service_city || undefined}
                                        state={
                                            record.service_state || undefined
                                        }
                                        zipcode={
                                            record.service_zipcode || undefined
                                        }
                                        size={{ width: 400, height: 250 }}
                                        fov={80}
                                    />
                                </Box>
                            )}
                            {(record.billing_address ||
                                record.billing_city ||
                                record.billing_state ||
                                record.billing_zipcode) && (
                                <Box display="flex" alignItems="center" gap={1}>
                                    <PlaceIcon
                                        fontSize="small"
                                        color="disabled"
                                    />
                                    <Typography variant="body2">
                                        {[
                                            record.billing_address,
                                            record.billing_city,
                                            record.billing_state,
                                            record.billing_zipcode,
                                        ]
                                            .filter(Boolean)
                                            .join(', ')}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </CardContent>
                </Card>
            </Box>
            <ContactAside />
        </Box>
    );
};
