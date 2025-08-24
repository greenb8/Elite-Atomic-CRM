import {
    Box,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import * as React from 'react';
import {
    DateField,
    EditButton,
    NumberField,
    ReferenceField,
    ReferenceManyField,
    Show,
    SimpleShowLayout,
    TextField,
    TopToolbar,
    useRecordContext,
} from 'react-admin';

import { Proposal, ProposalStatus } from '../types';

const proposalStatuses: ProposalStatus[] = [
    { value: 'draft', label: 'Draft', color: '#757575' },
    { value: 'sent', label: 'Sent', color: '#2196F3' },
    { value: 'viewed', label: 'Viewed', color: '#FF9800' },
    { value: 'accepted', label: 'Accepted', color: '#4CAF50' },
    { value: 'rejected', label: 'Rejected', color: '#F44336' },
    { value: 'expired', label: 'Expired', color: '#9E9E9E' },
];

const ProposalShowActions = () => (
    <TopToolbar>
        <EditButton
            sx={{
                backgroundColor: '#FCBB1C',
                color: '#0A2243',
                '&:hover': {
                    backgroundColor: '#E6A619',
                },
            }}
        />
    </TopToolbar>
);

const ProposalHeader = () => {
    const record = useRecordContext<Proposal>();
    const theme = useTheme();
    
    if (!record) return null;

    const status = proposalStatuses.find(s => s.value === record.status);

    return (
        <Card
            sx={{
                mb: 2,
                backgroundColor: 'white',
                boxShadow: theme.shadows[2],
            }}
        >
            <CardContent>
                <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Typography
                            variant="h4"
                            sx={{
                                color: '#0A2243',
                                fontWeight: 700,
                                flex: 1,
                            }}
                        >
                            {record.title}
                        </Typography>
                        <Chip
                            label={status?.label || record.status}
                            sx={{
                                backgroundColor: status?.color || '#757575',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                height: 32,
                            }}
                        />
                    </Stack>
                    
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Stack spacing={1}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Related Deal
                                </Typography>
                                {record.deal_id ? (
                                    <ReferenceField source="deal_id" reference="deals" link="show">
                                        <TextField source="name" sx={{ fontWeight: 500 }} />
                                    </ReferenceField>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        No deal associated
                                    </Typography>
                                )}
                            </Stack>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <Stack spacing={1}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Template Used
                                </Typography>
                                {record.template_id ? (
                                    <ReferenceField source="template_id" reference="proposal_templates">
                                        <TextField source="name" sx={{ fontWeight: 500 }} />
                                    </ReferenceField>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        No template
                                    </Typography>
                                )}
                            </Stack>
                        </Grid>
                    </Grid>
                </Stack>
            </CardContent>
        </Card>
    );
};

const ProposalFinancials = () => {
    const record = useRecordContext<Proposal>();
    const theme = useTheme();
    
    if (!record) return null;

    return (
        <Card
            sx={{
                mb: 2,
                backgroundColor: 'white',
                boxShadow: theme.shadows[2],
            }}
        >
            <CardContent>
                <Typography
                    variant="h6"
                    sx={{
                        color: '#0A2243',
                        fontWeight: 600,
                        mb: 2,
                    }}
                >
                    Financial Summary
                </Typography>
                
                <Grid container spacing={3}>
                    <Grid item xs={6} md={3}>
                        <Stack spacing={1}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Subtotal
                            </Typography>
                            <NumberField
                                source="subtotal"
                                options={{ style: 'currency', currency: 'USD' }}
                                sx={{ fontWeight: 500, fontSize: '1.1rem' }}
                            />
                        </Stack>
                    </Grid>
                    
                    <Grid item xs={6} md={3}>
                        <Stack spacing={1}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Tax ({((record.tax_rate || 0) * 100).toFixed(2)}%)
                            </Typography>
                            <NumberField
                                source="tax_amount"
                                options={{ style: 'currency', currency: 'USD' }}
                                sx={{ fontWeight: 500, fontSize: '1.1rem' }}
                            />
                        </Stack>
                    </Grid>
                    
                    <Grid item xs={6} md={3}>
                        <Stack spacing={1}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Total Amount
                            </Typography>
                            <NumberField
                                source="total_amount"
                                options={{ style: 'currency', currency: 'USD' }}
                                sx={{
                                    fontWeight: 700,
                                    fontSize: '1.25rem',
                                    color: '#0A2243',
                                }}
                            />
                        </Stack>
                    </Grid>
                    
                    <Grid item xs={6} md={3}>
                        <Stack spacing={1}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Deposit Required
                            </Typography>
                            <NumberField
                                source="deposit_amount"
                                options={{ style: 'currency', currency: 'USD' }}
                                sx={{ fontWeight: 500, fontSize: '1.1rem' }}
                            />
                        </Stack>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

const ProposalTracking = () => {
    const record = useRecordContext<Proposal>();
    const theme = useTheme();
    
    if (!record) return null;

    return (
        <Card
            sx={{
                mb: 2,
                backgroundColor: 'white',
                boxShadow: theme.shadows[2],
            }}
        >
            <CardContent>
                <Typography
                    variant="h6"
                    sx={{
                        color: '#0A2243',
                        fontWeight: 600,
                        mb: 2,
                    }}
                >
                    Tracking Information
                </Typography>
                
                <Grid container spacing={3}>
                    <Grid item xs={6} md={3}>
                        <Stack spacing={1}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Created
                            </Typography>
                            <DateField source="created_at" showTime />
                        </Stack>
                    </Grid>
                    
                    <Grid item xs={6} md={3}>
                        <Stack spacing={1}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Date Sent
                            </Typography>
                            {record.sent_at ? (
                                <DateField source="sent_at" showTime />
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    Not sent
                                </Typography>
                            )}
                        </Stack>
                    </Grid>
                    
                    <Grid item xs={6} md={3}>
                        <Stack spacing={1}>
                            <Typography variant="subtitle2" color="text.secondary">
                                First Viewed
                            </Typography>
                            {record.first_viewed_at ? (
                                <DateField source="first_viewed_at" showTime />
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    Not viewed
                                </Typography>
                            )}
                        </Stack>
                    </Grid>
                    
                    <Grid item xs={6} md={3}>
                        <Stack spacing={1}>
                            <Typography variant="subtitle2" color="text.secondary">
                                View Count
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {record.view_count || 0} views
                            </Typography>
                        </Stack>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

const ProposalLineItems = () => {
    const theme = useTheme();

    return (
        <Card
            sx={{
                backgroundColor: 'white',
                boxShadow: theme.shadows[2],
            }}
        >
            <CardContent>
                <Typography
                    variant="h6"
                    sx={{
                        color: '#0A2243',
                        fontWeight: 600,
                        mb: 2,
                    }}
                >
                    Proposal Line Items
                </Typography>
                
                <ReferenceManyField
                    reference="proposal_line_items"
                    target="proposal_id"
                    sort={{ field: 'section_sort_order', order: 'ASC' }}
                >
                    <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Line items will be displayed here when the proposal_line_items resource is available.
                        </Typography>
                    </Box>
                </ReferenceManyField>
            </CardContent>
        </Card>
    );
};

export const ProposalShow = () => {
    return (
        <Show
            actions={<ProposalShowActions />}
            sx={{
                '& .RaShow-main': {
                    backgroundColor: '#fafafb',
                },
            }}
        >
            <SimpleShowLayout>
                <ProposalHeader />
                <ProposalFinancials />
                <ProposalTracking />
                <ProposalLineItems />
            </SimpleShowLayout>
        </Show>
    );
};
