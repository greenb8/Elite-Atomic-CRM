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
    BooleanField,
    CreateButton,
    Datagrid,
    DateField,
    ExportButton,
    FilterButton,
    List,
    SearchInput,
    SelectInput,
    TextField,
    TopToolbar,
    useListContext,
} from 'react-admin';

import { ProposalTemplate } from '../../types';

const templateFilters = [
    <SearchInput source="q" placeholder="Search templates..." alwaysOn />,
    <SelectInput
        source="is_active"
        label="Status"
        choices={[
            { id: true, name: 'Active' },
            { id: false, name: 'Inactive' },
        ]}
        alwaysOn
    />,
];

const ProposalTemplateListActions = () => (
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

const StatusChip = ({ record }: { record: ProposalTemplate }) => {
    return (
        <Chip
            label={record.is_active ? 'Active' : 'Inactive'}
            size="small"
            sx={{
                backgroundColor: record.is_active ? '#4CAF50' : '#757575',
                color: 'white',
                fontWeight: 500,
                minWidth: 80,
            }}
        />
    );
};

const DefaultBadge = ({ record }: { record: ProposalTemplate }) => {
    if (!record.is_default) return null;
    
    return (
        <Chip
            label="Default"
            size="small"
            sx={{
                backgroundColor: '#FCBB1C',
                color: '#0A2243',
                fontWeight: 600,
                ml: 1,
            }}
        />
    );
};

export const ProposalTemplateList = () => {
    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <List
            filters={templateFilters}
            actions={<ProposalTemplateListActions />}
            sort={{ field: 'created_at', order: 'DESC' }}
            perPage={25}
            sx={{
                '& .RaList-main': {
                    backgroundColor: '#fafafb',
                },
            }}
        >
            {isSmall ? <ProposalTemplateMobileList /> : <ProposalTemplateDesktopList />}
        </List>
    );
};

const ProposalTemplateDesktopList = () => (
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
            source="name" 
            label="Template Name"
            sx={{ fontWeight: 500 }}
        />
        <TextField 
            source="description" 
            label="Description"
            sx={{ maxWidth: 300 }}
        />
        <BooleanField 
            source="is_active" 
            label="Status"
        />
        <BooleanField 
            source="is_default" 
            label="Default"
        />
        <DateField
            source="created_at"
            label="Created"
            showTime={false}
        />
        <DateField
            source="updated_at"
            label="Updated"
            showTime={false}
        />
    </Datagrid>
);

const ProposalTemplateMobileList = () => {
    const { data } = useListContext<ProposalTemplate>();

    return (
        <Stack spacing={1} p={1}>
            {data?.map((template) => (
                <ProposalTemplateMobileCard key={template.id} template={template} />
            ))}
        </Stack>
    );
};

const ProposalTemplateMobileCard = ({ template }: { template: ProposalTemplate }) => {
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
                        {template.name}
                        <DefaultBadge record={template} />
                    </Typography>
                    <StatusChip record={template} />
                </Stack>
                
                {template.description && (
                    <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                        }}
                    >
                        {template.description}
                    </Typography>
                )}
                
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                        Created: <DateField record={template} source="created_at" showTime={false} />
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Updated: <DateField record={template} source="updated_at" showTime={false} />
                    </Typography>
                </Stack>
            </Stack>
        </Box>
    );
};
