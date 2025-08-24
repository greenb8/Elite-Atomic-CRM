import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
    Datagrid,
    DateField,
    NumberField,
    ReferenceField,
    ReferenceManyField,
    ShowBase,
    TextField,
    useGetList,
    useShowContext,
} from 'react-admin';

import PlaceIcon from '@mui/icons-material/Place';
import { CompanyAvatar } from '../companies/CompanyAvatar';
import StreetViewImage from '../misc/StreetViewImage';
import { NotesIterator } from '../notes';
import { Contact } from '../types';
import { Avatar } from './Avatar';
import { ContactAside } from './ContactAside';
import { ContactBusinessInsights } from './ContactBusinessInsights';
import { PropertyManagementSection } from './PropertyManagementSection';
import { QuickActionsPanel } from './QuickActionsPanel';
import { CommunicationTimeline } from './CommunicationTimeline';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

export const ContactShow = () => (
    <ShowBase>
        <ContactShowContent />
    </ShowBase>
);

const ContactShowContent = () => {
    const { record, isPending } = useShowContext<Contact>();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const _isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));

    if (isPending || !record) return null;

    const pageVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: 'easeOut',
                staggerChildren: 0.1,
            },
        },
    };

    const sectionVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3, ease: 'easeOut' },
        },
    };

    return (
        <MotionBox
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            sx={{
                minHeight: '100vh',
                backgroundColor: '#fafafa',
                pb: 8,
            }}
        >
            {/* Quick Actions Panel - Always visible */}
            <QuickActionsPanel />

            <Box
                sx={{
                    px: { xs: 1, sm: 2, md: 3 },
                    display: 'flex',
                    flexDirection: { xs: 'column', lg: 'row' },
                    gap: { xs: 2, lg: 3 },
                    maxWidth: '1400px',
                    mx: 'auto',
                }}
            >
                <Box flex={1} sx={{ minWidth: 0 }}>
                    {/* Business Insights Section */}
                    <MotionBox variants={sectionVariants}>
                        <ContactBusinessInsights />
                    </MotionBox>

                    {/* Contact Header Card */}
                    <MotionCard
                        variants={sectionVariants}
                        whileHover={{
                            boxShadow: theme.shadows[8],
                            transition: { duration: 0.2 },
                        }}
                        sx={{
                            mb: 3,
                            boxShadow: theme.shadows[4],
                            overflow: 'hidden',
                        }}
                    >
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm="auto">
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        gap={2}
                                    >
                                        <Avatar />
                                        <Box flex={1} minWidth={0}>
                                            <Typography
                                                variant={isMobile ? 'h6' : 'h5'}
                                                fontWeight={600}
                                                noWrap={!isMobile}
                                            >
                                                {record.first_name}{' '}
                                                {record.last_name}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                component="div"
                                                color="text.secondary"
                                                sx={{
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: isMobile
                                                        ? 2
                                                        : 1,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                }}
                                            >
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
                                    </Box>
                                </Grid>
                                {!isMobile && (
                                    <Grid item>
                                        <ReferenceField
                                            source="company_id"
                                            reference="companies"
                                            link="show"
                                            sx={{
                                                '& a': {
                                                    textDecoration: 'none',
                                                },
                                            }}
                                        >
                                            <CompanyAvatar />
                                        </ReferenceField>
                                    </Grid>
                                )}
                            </Grid>
                            {/* Notes Section - Condensed */}
                            <Box mt={3}>
                                <Typography
                                    variant="subtitle1"
                                    fontWeight={600}
                                    sx={{ color: '#0A2243', mb: 1 }}
                                >
                                    Recent Notes
                                </Typography>
                                <ReferenceManyField
                                    target="contact_id"
                                    reference="contactNotes"
                                    sort={{ field: 'date', order: 'DESC' }}
                                >
                                    <NotesIterator
                                        showStatus
                                        reference="contacts"
                                    />
                                </ReferenceManyField>
                            </Box>

                            {/* Recent Deals - Simplified */}
                            <Box mt={3}>
                                <Typography
                                    variant="subtitle1"
                                    fontWeight={600}
                                    sx={{ color: '#0A2243', mb: 1 }}
                                >
                                    Recent Deals
                                </Typography>
                                <DealsForContact />
                            </Box>
                            <Box mt={3}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Service Addresses
                                </Typography>
                                {record.service_addresses_jsonb &&
                                record.service_addresses_jsonb.length > 0 ? (
                                    record.service_addresses_jsonb.map(
                                        (address: any, index: number) => (
                                            <Box key={index} mb={3}>
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
                                                    <Typography
                                                        variant="body2"
                                                        fontWeight="medium"
                                                    >
                                                        {address.type ||
                                                            'Service Location'}
                                                    </Typography>
                                                </Box>
                                                <Typography
                                                    variant="body2"
                                                    ml={isMobile ? 2 : 3}
                                                    sx={{
                                                        wordBreak: 'break-word',
                                                    }}
                                                >
                                                    {[
                                                        address.address,
                                                        address.city,
                                                        address.state,
                                                        address.zipcode,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(', ')}
                                                </Typography>
                                                {(address.gate_code ||
                                                    address.access_notes) && (
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        ml={isMobile ? 2 : 3}
                                                        mt={0.5}
                                                        sx={{
                                                            wordBreak:
                                                                'break-word',
                                                        }}
                                                    >
                                                        {address.gate_code &&
                                                            `Gate: ${address.gate_code}`}
                                                        {address.gate_code &&
                                                            address.access_notes &&
                                                            ' • '}
                                                        {address.access_notes}
                                                    </Typography>
                                                )}
                                                {address.property_size && (
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        ml={isMobile ? 2 : 3}
                                                    >
                                                        Size:{' '}
                                                        {address.property_size}
                                                    </Typography>
                                                )}
                                                {address.service_notes && (
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        ml={isMobile ? 2 : 3}
                                                        sx={{
                                                            wordBreak:
                                                                'break-word',
                                                        }}
                                                    >
                                                        Notes:{' '}
                                                        {address.service_notes}
                                                    </Typography>
                                                )}
                                                {address.address && (
                                                    <Box
                                                        mt={1}
                                                        ml={isMobile ? 2 : 3}
                                                    >
                                                        <StreetViewImage
                                                            address={
                                                                address.address ||
                                                                ''
                                                            }
                                                            city={
                                                                address.city ||
                                                                undefined
                                                            }
                                                            state={
                                                                address.state ||
                                                                undefined
                                                            }
                                                            zipcode={
                                                                address.zipcode ||
                                                                undefined
                                                            }
                                                            size={{
                                                                width: isMobile
                                                                    ? 280
                                                                    : 300,
                                                                height: isMobile
                                                                    ? 180
                                                                    : 200,
                                                            }}
                                                            fov={80}
                                                        />
                                                    </Box>
                                                )}
                                            </Box>
                                        )
                                    )
                                ) : (
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        No service addresses on file
                                    </Typography>
                                )}

                                {(record.billing_address ||
                                    record.billing_city ||
                                    record.billing_state ||
                                    record.billing_zipcode) && (
                                    <Box mt={3}>
                                        <Typography
                                            variant="subtitle2"
                                            gutterBottom
                                        >
                                            Billing Address
                                        </Typography>
                                        <Box
                                            display="flex"
                                            alignItems="flex-start"
                                            gap={1}
                                        >
                                            <PlaceIcon
                                                fontSize="small"
                                                color="disabled"
                                                sx={{ mt: 0.25 }}
                                            />
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    wordBreak: 'break-word',
                                                    flex: 1,
                                                }}
                                            >
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
                                    </Box>
                                )}
                            </Box>
                        </CardContent>
                    </MotionCard>

                    {/* Property Management Section */}
                    <MotionBox variants={sectionVariants}>
                        <PropertyManagementSection />
                    </MotionBox>

                    {/* Communication Timeline */}
                    <MotionBox variants={sectionVariants}>
                        <CommunicationTimeline />
                    </MotionBox>
                </Box>
                {/* Sidebar - Enhanced for mobile */}
                <MotionBox
                    variants={sectionVariants}
                    sx={{
                        width: { xs: '100%', lg: '320px' },
                        minWidth: { lg: '320px' },
                    }}
                >
                    <ContactAside link="edit" />
                </MotionBox>
            </Box>
        </MotionBox>
    );
};

const DealsForContact = () => {
    const { record: contact } = useShowContext<Contact>();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const _isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));

    const { data, total, isPending } = useGetList('deals', {
        filter: { 'contact_ids@cs': `{${contact?.id}}` },
        sort: { field: 'created_at', order: 'DESC' },
    });

    if (isPending || total === 0) return null;

    return (
        <Box sx={{ overflowX: 'auto' }}>
            <Datagrid
                data={data}
                rowClick="show"
                bulkActionButtons={false}
                size={isMobile ? 'small' : 'medium'}
                sx={{
                    '& .MuiTableCell-root': {
                        fontSize: isMobile ? '0.75rem' : 'inherit',
                        padding: isMobile ? '8px 4px' : 'inherit',
                    },
                }}
            >
                <TextField source="name" />
                {!isMobile && <TextField source="stage" />}
                <NumberField
                    source="amount"
                    options={{
                        style: 'currency',
                        currency: 'USD',
                    }}
                />
                {!_isTablet && <DateField source="created_at" />}
            </Datagrid>
        </Box>
    );
};
