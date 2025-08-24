import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    IconButton,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import {
    Add as AddIcon,
    Description as DescriptionIcon,
    PictureAsPdf as PdfIcon,
    Visibility as ViewIcon,
    Edit as EditIcon,
} from '@mui/icons-material';
import * as React from 'react';
import { useState } from 'react';
import {
    CreateButton,
    Datagrid,
    DateField,
    NumberField,
    ReferenceField,
    ReferenceManyField,
    TextField,
    useRecordContext,
    useRedirect,
    useListContext,
} from 'react-admin';

import { Deal, Proposal } from '../types';
import { PDFGenerationButton } from '../proposals/ProposalPDFGenerator';

const proposalStatusColors: Record<string, string> = {
    draft: '#757575',
    sent: '#2196F3',
    viewed: '#FF9800',
    accepted: '#4CAF50',
    rejected: '#F44336',
    expired: '#9E9E9E',
};

const ProposalStatusChip = ({ record }: { record: Proposal }) => {
    const color = proposalStatusColors[record.status] || '#757575';
    
    return (
        <Chip
            label={record.status.charAt(0).toUpperCase() + record.status.slice(1)}
            size="small"
            sx={{
                backgroundColor: color,
                color: 'white',
                fontWeight: 500,
                minWidth: 80,
            }}
        />
    );
};

const ProposalActions = ({ record }: { record: Proposal }) => {
    const redirect = useRedirect();
    
    return (
        <Stack direction="row" spacing={1}>
            <IconButton
                size="small"
                onClick={() => redirect('show', 'proposals', record.id)}
                sx={{
                    color: '#0A2243',
                    '&:hover': {
                        backgroundColor: '#0A224310',
                    },
                }}
            >
                <ViewIcon />
            </IconButton>
            <IconButton
                size="small"
                onClick={() => redirect('edit', 'proposals', record.id)}
                sx={{
                    color: '#FCBB1C',
                    '&:hover': {
                        backgroundColor: '#FCBB1C20',
                    },
                }}
            >
                <EditIcon />
            </IconButton>
            <PDFGenerationButton
                proposalId={record.id.toString()}
                variant="download"
                size="small"
            />
        </Stack>
    );
};

const CreateProposalButton = () => {
    const record = useRecordContext<Deal>();
    const redirect = useRedirect();
    
    if (!record) return null;

    // Show create proposal button for deals that can have proposals
    const canCreateProposal = !record.archived_at && 
        !['lost', 'cancelled'].includes(record.stage.toLowerCase());

    if (!canCreateProposal) return null;

    const handleCreateProposal = () => {
        redirect('/proposals/create', undefined, undefined, undefined, {
            record: { 
                deal_id: record.id,
                title: `${record.name} - Proposal`,
            }
        });
    };

    return (
        <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateProposal}
            size="small"
            sx={{
                backgroundColor: '#FCBB1C',
                color: '#0A2243',
                '&:hover': {
                    backgroundColor: '#E6A619',
                },
            }}
        >
            Create Proposal
        </Button>
    );
};

const ProposalSummaryCard = () => {
    const { data: proposals } = useListContext<Proposal>();
    const record = useRecordContext<Deal>();
    
    if (!proposals || proposals.length === 0) return null;

    const totalProposalValue = proposals.reduce((sum, proposal) => 
        sum + (proposal.total_amount || 0), 0
    );
    
    const acceptedProposals = proposals.filter(p => p.status === 'accepted');
    const acceptedValue = acceptedProposals.reduce((sum, proposal) => 
        sum + (proposal.total_amount || 0), 0
    );

    const latestProposal = proposals.reduce((latest, current) => 
        new Date(current.created_at) > new Date(latest.created_at) ? current : latest
    );

    return (
        <Card
            sx={{
                mb: 2,
                backgroundColor: '#fafafb',
                border: '1px solid #e0e0e0',
            }}
        >
            <CardContent sx={{ py: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack spacing={1}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Proposal Summary
                        </Typography>
                        <Stack direction="row" spacing={3}>
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Total Proposals
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {proposals.length}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Total Value
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    ${totalProposalValue.toLocaleString()}
                                </Typography>
                            </Box>
                            {acceptedProposals.length > 0 && (
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Accepted Value
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#4CAF50' }}>
                                        ${acceptedValue.toLocaleString()}
                                    </Typography>
                                </Box>
                            )}
                        </Stack>
                    </Stack>
                    
                    <Stack alignItems="flex-end" spacing={1}>
                        <ProposalStatusChip record={latestProposal} />
                        <Typography variant="caption" color="text.secondary">
                            Latest: {latestProposal.title}
                        </Typography>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
};

const ProposalDatagrid = () => {
    const theme = useTheme();
    
    return (
        <Datagrid
            rowClick="show"
            bulkActionButtons={false}
            sx={{
                '& .RaDatagrid-table': {
                    backgroundColor: 'white',
                },
                '& .RaDatagrid-headerRow': {
                    backgroundColor: '#0A2243',
                    '& .RaDatagrid-headerCell': {
                        color: 'white',
                        fontWeight: 600,
                    },
                },
                '& .RaDatagrid-row:hover': {
                    backgroundColor: '#f5f5f5',
                },
            }}
        >
            <TextField 
                source="title" 
                label="Proposal Title"
                sx={{ fontWeight: 500 }}
            />
            <TextField source="status" label="Status" />
            <NumberField 
                source="total_amount" 
                label="Total Amount" 
                options={{ style: 'currency', currency: 'USD' }}
                sx={{ fontWeight: 600 }}
            />
            <DateField
                source="created_at"
                label="Created"
                showTime={false}
            />
            <DateField
                source="sent_at"
                label="Sent"
                showTime={false}
                emptyText="-"
            />
            <TextField source="id" label="Actions" render={ProposalActions} />
        </Datagrid>
    );
};

export const ProposalManagementSection = () => {
    const record = useRecordContext<Deal>();
    
    if (!record || record.archived_at) return null;

    return (
        <Box m={2}>
            <Divider />
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1, mb: 2 }}>
                <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{ display: 'block' }}
                >
                    Proposals
                </Typography>
                <CreateProposalButton />
            </Stack>
            
            <ReferenceManyField
                reference="proposals"
                target="deal_id"
                sort={{ field: 'created_at', order: 'DESC' }}
            >
                <>
                    <ProposalSummaryCard />
                    <ProposalDatagrid />
                </>
            </ReferenceManyField>
        </Box>
    );
};
