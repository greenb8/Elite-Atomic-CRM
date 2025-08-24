import {
    Box,
    Card,
    CardContent,
    Divider,
    Stack,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import * as React from 'react';
import {
    BooleanInput,
    TextInput,
    required,
    useGetIdentity,
} from 'react-admin';

export const ProposalTemplateInputs = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { identity } = useGetIdentity();

    return (
        <Stack gap={2} p={1}>
            <Stack gap={3} direction={isMobile ? 'column' : 'row'}>
                <Stack gap={4} flex={4}>
                    <TemplateBasicInputs />
                    <TemplateStructureInputs />
                </Stack>
                <Divider
                    orientation={isMobile ? 'horizontal' : 'vertical'}
                    flexItem
                />
                <Stack gap={4} flex={5}>
                    <TemplateSectionsInputs />
                    <TemplateSettingsInputs />
                </Stack>
            </Stack>
        </Stack>
    );
};

const TemplateBasicInputs = () => {
    return (
        <Stack>
            <Typography variant="h6" sx={{ color: '#0A2243', fontWeight: 600 }}>
                Template Details
            </Typography>
            <TextInput
                source="name"
                validate={required()}
                helperText={false}
                fullWidth
            />
            <TextInput
                source="description"
                helperText={false}
                multiline
                rows={3}
                fullWidth
            />
        </Stack>
    );
};

const TemplateStructureInputs = () => {
    const defaultStructure = {
        theme: {
            primaryColor: '#0A2243',
            accentColor: '#FCBB1C',
            fontFamily: 'Raleway',
        },
        layout: {
            showImages: true,
            showDescriptions: true,
            showCosts: false,
        },
    };

    return (
        <Stack>
            <Typography variant="h6" sx={{ color: '#0A2243', fontWeight: 600 }}>
                Template Structure
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Configure the visual appearance and layout options for this template.
            </Typography>
            <TextInput
                source="structure"
                label="Template Structure (JSON)"
                helperText="Define theme colors, fonts, and layout preferences"
                multiline
                rows={8}
                defaultValue={JSON.stringify(defaultStructure, null, 2)}
                sx={{
                    '& .MuiInputBase-root': {
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                    },
                }}
                format={(value) => typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                parse={(value) => {
                    try {
                        return JSON.parse(value);
                    } catch {
                        return value;
                    }
                }}
            />
        </Stack>
    );
};

const TemplateSectionsInputs = () => {
    const defaultSections = [
        {
            name: 'Landscape Management',
            description: 'Ongoing maintenance and care services',
            sortOrder: 1,
            isVisible: true,
        },
        {
            name: 'Installation Services',
            description: 'New installations and improvements',
            sortOrder: 2,
            isVisible: true,
        },
        {
            name: 'Additional Services',
            description: 'Optional add-on services',
            sortOrder: 3,
            isVisible: true,
        },
    ];

    return (
        <Stack>
            <Typography variant="h6" sx={{ color: '#0A2243', fontWeight: 600 }}>
                Default Sections
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Define the default sections that will be created when using this template.
            </Typography>
            <TextInput
                source="default_sections"
                label="Default Sections (JSON)"
                helperText="Array of section objects with name, description, sortOrder, and isVisible"
                multiline
                rows={10}
                defaultValue={JSON.stringify(defaultSections, null, 2)}
                sx={{
                    '& .MuiInputBase-root': {
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                    },
                }}
                format={(value) => typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                parse={(value) => {
                    try {
                        return JSON.parse(value);
                    } catch {
                        return value;
                    }
                }}
            />
        </Stack>
    );
};

const TemplateSettingsInputs = () => {
    return (
        <Stack>
            <Typography variant="h6" sx={{ color: '#0A2243', fontWeight: 600 }}>
                Template Settings
            </Typography>
            <BooleanInput
                source="is_active"
                label="Active Template"
                helperText="Only active templates can be used for new proposals"
                defaultValue={true}
                sx={{
                    '& .MuiFormControlLabel-label': {
                        fontWeight: 500,
                    },
                }}
            />
            <BooleanInput
                source="is_default"
                label="Default Template"
                helperText="This template will be pre-selected when creating new proposals"
                defaultValue={false}
                sx={{
                    '& .MuiFormControlLabel-label': {
                        fontWeight: 500,
                    },
                }}
            />
        </Stack>
    );
};

const TemplatePreview = () => {
    const theme = useTheme();

    return (
        <Card
            sx={{
                backgroundColor: 'white',
                boxShadow: theme.shadows[2],
                mt: 2,
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
                    Template Preview
                </Typography>
                
                <Box
                    sx={{
                        border: '2px dashed #e0e0e0',
                        borderRadius: 2,
                        p: 3,
                        textAlign: 'center',
                        backgroundColor: '#fafafb',
                    }}
                >
                    <Typography variant="body2" color="text.secondary">
                        Template preview will be displayed here based on the structure and sections configuration.
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Preview functionality will be implemented in a future update.
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export { TemplatePreview };
