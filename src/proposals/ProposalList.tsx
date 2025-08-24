import {
    Box,
    Chip,
    Stack,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import * as React from 'react';
import {
    CreateButton,
    Datagrid,
    DateField,
    ExportButton,
    FilterButton,
    List,
    NumberField,
    ReferenceField,
    SearchInput,
    SelectInput,
    TextField,
    TopToolbar,
    useListContext,
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

const proposalFilters = [
    <SearchInput source="q" placeholder="Search proposals..." alwaysOn />,
    <SelectInput
        source="status"
        label="Status"
        choices={proposalStatuses}
        optionText="label"
        optionValue="value"
        alwaysOn
    />,
];

const ProposalListActions = () => (
    <TopToolbar>
        <FilterButton />
        <CreateButton
            sx={{
                backgroundColor: '#FCBB1C',
                color: '#0A2243',
                '&:hover': {
                    backgroundColor: '#E6A619',
                },
            }}
        />
        <ExportButton />
    </TopToolbar>
);

const StatusChip = ({ record }: { record: Proposal }) => {
    const status = proposalStatuses.find(s => s.value === record.status);
    return (
        <Chip
            label={status?.label || record.status}
            size="small"
            sx={{
                backgroundColor: status?.color || '#757575',
                color: 'white',
                fontWeight: 500,
                minWidth: 80,
            }}
        />
    );
};

const AmountField = ({ record }: { record: Proposal }) => {
    return (
        <Typography
            variant="body2"
            sx={{
                fontWeight: 600,
                color: '#0A2243',
            }}
        >
            ${record.total_amount?.toLocaleString() || '0.00'}
        </Typography>
    );
};

const DealNameField = ({ record }: { record: Proposal }) => {
    if (!record.deal_id) {
        return <Typography variant="body2" color="text.secondary">No deal</Typography>;
    }
    return (
        <ReferenceField
            source="deal_id"
            reference="deals"
            record={record}
            link="show"
        >
            <TextField source="name" />
        </ReferenceField>
    );
};

export const ProposalList = () => {
    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <List
            filters={proposalFilters}
            actions={<ProposalListActions />}
            sort={{ field: 'created_at', order: 'DESC' }}
            perPage={25}
            sx={{
                '& .RaList-main': {
                    backgroundColor: '#fafafb',
                },
            }}
        >
            {isSmall ? <ProposalMobileList /> : <ProposalDesktopList />}
        </List>
    );
};

const ProposalDesktopList = () => (
    <Datagrid
        rowClick="show"
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
        <ReferenceField source="deal_id" reference="deals" label="Deal" link="show" emptyText="No deal">
            <TextField source="name" />
        </ReferenceField>
        <TextField source="status" label="Status" />
        <NumberField source="total_amount" label="Total Amount" options={{ style: 'currency', currency: 'USD' }} />
        <NumberField
            source="view_count"
            label="Views"
            sx={{ textAlign: 'center' }}
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
        <DateField
            source="expires_at"
            label="Expires"
            showTime={false}
            emptyText="-"
        />
    </Datagrid>
);

const ProposalMobileList = () => {
    const { data } = useListContext<Proposal>();

    return (
        <Stack spacing={1} p={1}>
            {data?.map((proposal) => (
                <ProposalMobileCard key={proposal.id} proposal={proposal} />
            ))}
        </Stack>
    );
};

const ProposalMobileCard = ({ proposal }: { proposal: Proposal }) => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                backgroundColor: 'white',
                borderRadius: 2,
                p: 2,
                boxShadow: theme.shadows[1],
                border: '1px solid #e0e0e0',
            }}
        >
            <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Typography
                        variant="subtitle1"
                        sx={{
                            fontWeight: 600,
                            color: '#0A2243',
                            flex: 1,
                            mr: 1,
                        }}
                    >
                        {proposal.title}
                    </Typography>
                    <StatusChip record={proposal} />
                </Stack>
                
                {proposal.deal_id && (
                    <Typography variant="body2" color="text.secondary">
                        Deal: <DealNameField record={proposal} />
                    </Typography>
                )}
                
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <AmountField record={proposal} />
                    <Typography variant="caption" color="text.secondary">
                        {proposal.view_count} views
                    </Typography>
                </Stack>
                
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                        Created: <DateField record={proposal} source="created_at" showTime={false} />
                    </Typography>
                    {proposal.expires_at && (
                        <Typography variant="caption" color="text.secondary">
                            Expires: <DateField record={proposal} source="expires_at" showTime={false} />
                        </Typography>
                    )}
                </Stack>
            </Stack>
        </Box>
    );
};
