import {
    Box,
    Card,
    CardContent,
    Chip,
    Grid,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import * as React from 'react';
import {
    BooleanField,
    DateField,
    EditButton,
    Show,
    SimpleShowLayout,
    TextField,
    TopToolbar,
    useRecordContext,
} from 'react-admin';

import { ProposalTemplate } from '../../types';

const ProposalTemplateShowActions = () => (
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

const TemplateHeader = () => {
    const record = useRecordContext<ProposalTemplate>();
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
                            {record.name}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            <Chip
                                label={record.is_active ? 'Active' : 'Inactive'}
                                sx={{
                                    backgroundColor: record.is_active ? '#4CAF50' : '#757575',
                                    color: 'white',
                                    fontWeight: 600,
                                }}
                            />
                            {record.is_default && (
                                <Chip
                                    label="Default"
                                    sx={{
                                        backgroundColor: '#FCBB1C',
                                        color: '#0A2243',
                                        fontWeight: 600,
                                    }}
                                />
                            )}
                        </Stack>
                    </Stack>
                    
                    {record.description && (
                        <Typography variant="body1" color="text.secondary">
                            {record.description}
                        </Typography>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
};

const TemplateStructure = () => {
    const record = useRecordContext<ProposalTemplate>();
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
                    Template Structure
                </Typography>
                
                <Box
                    sx={{
                        backgroundColor: '#fafafb',
                        borderRadius: 1,
                        p: 2,
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                        overflow: 'auto',
                        maxHeight: 300,
                    }}
                >
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(record.structure, null, 2)}
                    </pre>
                </Box>
            </CardContent>
        </Card>
    );
};

const TemplateSections = () => {
    const record = useRecordContext<ProposalTemplate>();
    const theme = useTheme();
    
    if (!record) return null;

    const sections = Array.isArray(record.default_sections) ? record.default_sections : [];

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
                    Default Sections ({sections.length})
                </Typography>
                
                {sections.length > 0 ? (
                    <Stack spacing={2}>
                        {sections.map((section: any, index: number) => (
                            <Box
                                key={index}
                                sx={{
                                    border: '1px solid #e0e0e0',
                                    borderRadius: 1,
                                    p: 2,
                                    backgroundColor: '#fafafb',
                                }}
                            >
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                    <Stack spacing={1} flex={1}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                            {section.name}
                                        </Typography>
                                        {section.description && (
                                            <Typography variant="body2" color="text.secondary">
                                                {section.description}
                                            </Typography>
                                        )}
                                    </Stack>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography variant="caption" color="text.secondary">
                                            Order: {section.sortOrder}
                                        </Typography>
                                        <Chip
                                            label={section.isVisible ? 'Visible' : 'Hidden'}
                                            size="small"
                                            sx={{
                                                backgroundColor: section.isVisible ? '#4CAF50' : '#757575',
                                                color: 'white',
                                                fontSize: '0.75rem',
                                            }}
                                        />
                                    </Stack>
                                </Stack>
                            </Box>
                        ))}
                    </Stack>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        No default sections configured for this template.
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};

const TemplateMetadata = () => {
    const record = useRecordContext<ProposalTemplate>();
    const theme = useTheme();
    
    if (!record) return null;

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
                    Template Information
                </Typography>
                
                <Grid container spacing={3}>
                    <Grid item xs={6} md={3}>
                        <Stack spacing={1}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Status
                            </Typography>
                            <BooleanField source="is_active" />
                        </Stack>
                    </Grid>
                    
                    <Grid item xs={6} md={3}>
                        <Stack spacing={1}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Default Template
                            </Typography>
                            <BooleanField source="is_default" />
                        </Stack>
                    </Grid>
                    
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
                                Last Updated
                            </Typography>
                            <DateField source="updated_at" showTime />
                        </Stack>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export const ProposalTemplateShow = () => {
    return (
        <Show
            actions={<ProposalTemplateShowActions />}
            sx={{
                '& .RaShow-main': {
                    backgroundColor: '#fafafb',
                },
            }}
        >
            <SimpleShowLayout>
                <TemplateHeader />
                <TemplateStructure />
                <TemplateSections />
                <TemplateMetadata />
            </SimpleShowLayout>
        </Show>
    );
};
