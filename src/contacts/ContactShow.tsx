import { Box, Card, CardContent, Typography } from '@mui/material';
import {
    ReferenceField,
    ReferenceManyField,
    ShowBase,
    TextField,
    useShowContext,
} from 'react-admin';

import PlaceIcon from '@mui/icons-material/Place';
import { CompanyAvatar } from '../companies/CompanyAvatar';
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
