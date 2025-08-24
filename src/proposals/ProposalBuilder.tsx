import {
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    Fab,
    Grid,
    IconButton,
    Paper,
    Stack,
    Tab,
    Tabs,
    Typography,
    useTheme,
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    DragIndicator as DragIcon,
    Save as SaveIcon,
} from '@mui/icons-material';
import { motion, Reorder } from 'framer-motion';
import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
    useDataProvider,
    useNotify,
    useRecordContext,
    useUpdate,
} from 'react-admin';

import { Proposal, ProposalLineItem } from '../types';
import { useDebounce } from '../misc/useDebounce';

interface ProposalSection {
    id: string;
    name: string;
    description?: string;
    sortOrder: number;
    isVisible: boolean;
    lineItems: ProposalLineItem[];
}

interface ProposalBuilderProps {
    proposalId: string;
}

export const ProposalBuilder: React.FC<ProposalBuilderProps> = ({ proposalId }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [sections, setSections] = useState<ProposalSection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    
    const theme = useTheme();
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const [update] = useUpdate();
    const record = useRecordContext<Proposal>();

    // Debounced auto-save
    const debouncedSections = useDebounce(sections, 1000);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const loadProposalData = useCallback(async () => {
        try {
            setIsLoading(true);
            
            // Load line items for this proposal
            const { data: lineItems } = await dataProvider.getList('proposal_line_items', {
                filter: { proposal_id: proposalId },
                sort: { field: 'section_sort_order', order: 'ASC' },
                pagination: { page: 1, perPage: 1000 },
            });

            // Group line items by section
            const sectionMap = new Map<string, ProposalLineItem[]>();
            lineItems.forEach((item: ProposalLineItem) => {
                const sectionName = item.section_name || 'General';
                if (!sectionMap.has(sectionName)) {
                    sectionMap.set(sectionName, []);
                }
                sectionMap.get(sectionName)!.push(item);
            });

            // Convert to sections array
            const sectionsArray: ProposalSection[] = Array.from(sectionMap.entries()).map(
                ([name, items], index) => ({
                    id: `section-${name.toLowerCase().replace(/\s+/g, '-')}`,
                    name,
                    description: getSectionDescription(name),
                    sortOrder: index + 1,
                    isVisible: true,
                    lineItems: items.sort((a, b) => a.sort_order - b.sort_order),
                })
            );

            setSections(sectionsArray);
        } catch (error) {
            notify('Error loading proposal data', { type: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, [proposalId, dataProvider, notify]);

    const getSectionDescription = (sectionName: string): string => {
        const descriptions: Record<string, string> = {
            'Landscape Management': 'Ongoing maintenance and care services',
            'Installation Services': 'New installations and improvements',
            'Additional Services': 'Optional add-on services',
            'Site Preparation': 'Initial site work and preparation',
            'Plant Installation': 'Trees, shrubs, and plant installations',
            'Hardscape Features': 'Patios, walkways, and structural elements',
            'Irrigation & Lighting': 'Water and lighting system installation',
        };
        return descriptions[sectionName] || 'Custom section';
    };

    const saveProposal = useCallback(async () => {
        if (!hasUnsavedChanges) return;
        
        try {
            setIsSaving(true);
            
            // Update proposal sections data
            await update('proposals', {
                id: proposalId,
                data: {
                    sections: sections.map(section => ({
                        name: section.name,
                        description: section.description,
                        sortOrder: section.sortOrder,
                        isVisible: section.isVisible,
                    })),
                },
                previousData: record,
            });

            setHasUnsavedChanges(false);
            notify('Proposal saved successfully', { type: 'success' });
        } catch (error) {
            notify('Error saving proposal', { type: 'error' });
        } finally {
            setIsSaving(false);
        }
    }, [sections, hasUnsavedChanges, proposalId, update, record, notify]);

    // Auto-save when sections change
    useEffect(() => {
        if (debouncedSections.length > 0 && hasUnsavedChanges) {
            saveProposal();
        }
    }, [debouncedSections, saveProposal, hasUnsavedChanges]);

    // Load initial data
    useEffect(() => {
        loadProposalData();
    }, [loadProposalData]);

    const addSection = () => {
        const newSection: ProposalSection = {
            id: `section-${Date.now()}`,
            name: 'New Section',
            description: 'Custom section',
            sortOrder: sections.length + 1,
            isVisible: true,
            lineItems: [],
        };
        setSections([...sections, newSection]);
        setHasUnsavedChanges(true);
    };

    const removeSection = (sectionId: string) => {
        setSections(sections.filter(s => s.id !== sectionId));
        setHasUnsavedChanges(true);
    };

    const updateSection = (sectionId: string, updates: Partial<ProposalSection>) => {
        setSections(sections.map(s => 
            s.id === sectionId ? { ...s, ...updates } : s
        ));
        setHasUnsavedChanges(true);
    };

    const reorderSections = (newSections: ProposalSection[]) => {
        const reorderedSections = newSections.map((section, index) => ({
            ...section,
            sortOrder: index + 1,
        }));
        setSections(reorderedSections);
        setHasUnsavedChanges(true);
    };

    if (isLoading) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                    Loading proposal builder...
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header with tabs and save indicator */}
            <Paper
                elevation={1}
                sx={{
                    borderRadius: 0,
                    borderBottom: '1px solid #e0e0e0',
                }}
            >
                <Box sx={{ px: 3, pt: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography
                            variant="h5"
                            sx={{
                                color: '#0A2243',
                                fontWeight: 700,
                            }}
                        >
                            {record?.title || 'Proposal Builder'}
                        </Typography>
                        
                        <Stack direction="row" spacing={2} alignItems="center">
                            {hasUnsavedChanges && (
                                <Typography variant="caption" color="warning.main">
                                    Unsaved changes
                                </Typography>
                            )}
                            {isSaving && (
                                <Typography variant="caption" color="primary.main">
                                    Saving...
                                </Typography>
                            )}
                            <Button
                                variant="contained"
                                startIcon={<SaveIcon />}
                                onClick={saveProposal}
                                disabled={!hasUnsavedChanges || isSaving}
                                sx={{
                                    backgroundColor: '#FCBB1C',
                                    color: '#0A2243',
                                    '&:hover': {
                                        backgroundColor: '#E6A619',
                                    },
                                }}
                            >
                                Save
                            </Button>
                        </Stack>
                    </Stack>
                </Box>
                
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    sx={{
                        '& .MuiTab-root': {
                            fontWeight: 600,
                            textTransform: 'none',
                        },
                        '& .Mui-selected': {
                            color: '#0A2243',
                        },
                        '& .MuiTabs-indicator': {
                            backgroundColor: '#FCBB1C',
                            height: 3,
                        },
                    }}
                >
                    <Tab label="Build" />
                    <Tab label="Design" />
                </Tabs>
            </Paper>

            {/* Main content area */}
            <Box sx={{ flex: 1, overflow: 'auto', backgroundColor: '#fafafb' }}>
                {activeTab === 0 ? (
                    <BuildTab
                        sections={sections}
                        onReorderSections={reorderSections}
                        onUpdateSection={updateSection}
                        onRemoveSection={removeSection}
                        onAddSection={addSection}
                    />
                ) : (
                    <DesignTab />
                )}
            </Box>

            {/* Floating action button for adding sections */}
            {activeTab === 0 && (
                <Fab
                    color="primary"
                    onClick={addSection}
                    sx={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        backgroundColor: '#FCBB1C',
                        color: '#0A2243',
                        '&:hover': {
                            backgroundColor: '#E6A619',
                        },
                    }}
                >
                    <AddIcon />
                </Fab>
            )}
        </Box>
    );
};

interface BuildTabProps {
    sections: ProposalSection[];
    onReorderSections: (sections: ProposalSection[]) => void;
    onUpdateSection: (sectionId: string, updates: Partial<ProposalSection>) => void;
    onRemoveSection: (sectionId: string) => void;
    onAddSection: () => void;
}

const BuildTab: React.FC<BuildTabProps> = ({
    sections,
    onReorderSections,
    onUpdateSection,
    onRemoveSection,
    onAddSection,
}) => {
    return (
        <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
                {/* Left panel - Sections */}
                <Grid item xs={12} lg={8}>
                    <Stack spacing={2}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography
                                variant="h6"
                                sx={{
                                    color: '#0A2243',
                                    fontWeight: 600,
                                }}
                            >
                                Proposal Sections
                            </Typography>
                            <Button
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={onAddSection}
                                sx={{
                                    borderColor: '#FCBB1C',
                                    color: '#0A2243',
                                    '&:hover': {
                                        borderColor: '#E6A619',
                                        backgroundColor: '#FCBB1C20',
                                    },
                                }}
                            >
                                Add Section
                            </Button>
                        </Stack>

                        <Reorder.Group
                            axis="y"
                            values={sections}
                            onReorder={onReorderSections}
                            as="div"
                        >
                            {sections.map((section) => (
                                <SectionCard
                                    key={section.id}
                                    section={section}
                                    onUpdate={(updates) => onUpdateSection(section.id, updates)}
                                    onRemove={() => onRemoveSection(section.id)}
                                />
                            ))}
                        </Reorder.Group>

                        {sections.length === 0 && (
                            <Card
                                sx={{
                                    p: 4,
                                    textAlign: 'center',
                                    border: '2px dashed #e0e0e0',
                                }}
                            >
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    No sections yet
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Add your first section to start building your proposal
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={onAddSection}
                                    sx={{
                                        backgroundColor: '#FCBB1C',
                                        color: '#0A2243',
                                        '&:hover': {
                                            backgroundColor: '#E6A619',
                                        },
                                    }}
                                >
                                    Add Section
                                </Button>
                            </Card>
                        )}
                    </Stack>
                </Grid>

                {/* Right panel - Pricing summary */}
                <Grid item xs={12} lg={4}>
                    <PricingSummary sections={sections} />
                </Grid>
            </Grid>
        </Box>
    );
};

interface SectionCardProps {
    section: ProposalSection;
    onUpdate: (updates: Partial<ProposalSection>) => void;
    onRemove: () => void;
}

const SectionCard: React.FC<SectionCardProps> = ({ section, onUpdate, onRemove }) => {
    const theme = useTheme();
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(section.name);

    const handleSaveName = () => {
        onUpdate({ name: editName });
        setIsEditing(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSaveName();
        } else if (e.key === 'Escape') {
            setEditName(section.name);
            setIsEditing(false);
        }
    };

    const sectionTotal = section.lineItems.reduce(
        (sum, item) => sum + (item.is_selected_by_client ? item.total_price : 0),
        0
    );

    return (
        <Reorder.Item
            value={section}
            as="div"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
        >
            <Card
                sx={{
                    mb: 2,
                    backgroundColor: 'white',
                    boxShadow: theme.shadows[2],
                    border: '1px solid #e0e0e0',
                    '&:hover': {
                        boxShadow: theme.shadows[4],
                    },
                }}
            >
                <CardContent>
                    <Stack spacing={2}>
                        {/* Section header */}
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Stack direction="row" alignItems="center" spacing={1} flex={1}>
                                <IconButton
                                    size="small"
                                    sx={{ cursor: 'grab', color: '#757575' }}
                                >
                                    <DragIcon />
                                </IconButton>
                                
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        onBlur={handleSaveName}
                                        onKeyDown={handleKeyPress}
                                        autoFocus
                                        style={{
                                            border: 'none',
                                            outline: 'none',
                                            fontSize: '1.25rem',
                                            fontWeight: 600,
                                            color: '#0A2243',
                                            backgroundColor: 'transparent',
                                            width: '100%',
                                        }}
                                    />
                                ) : (
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            color: '#0A2243',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            flex: 1,
                                        }}
                                        onClick={() => setIsEditing(true)}
                                    >
                                        {section.name}
                                    </Typography>
                                )}
                            </Stack>

                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        color: '#0A2243',
                                        fontWeight: 600,
                                    }}
                                >
                                    ${sectionTotal.toLocaleString()}
                                </Typography>
                                <IconButton
                                    size="small"
                                    onClick={onRemove}
                                    sx={{
                                        color: '#F44336',
                                        '&:hover': {
                                            backgroundColor: '#F4433620',
                                        },
                                    }}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Stack>
                        </Stack>

                        {/* Section description */}
                        {section.description && (
                            <Typography variant="body2" color="text.secondary">
                                {section.description}
                            </Typography>
                        )}

                        {/* Line items */}
                        <LineItemsList
                            sectionId={section.id}
                            lineItems={section.lineItems}
                            onUpdateLineItems={(items) => onUpdate({ lineItems: items })}
                        />
                    </Stack>
                </CardContent>
            </Card>
        </Reorder.Item>
    );
};

interface LineItemsListProps {
    sectionId: string;
    lineItems: ProposalLineItem[];
    onUpdateLineItems: (items: ProposalLineItem[]) => void;
}

const LineItemsList: React.FC<LineItemsListProps> = ({
    sectionId,
    lineItems,
    onUpdateLineItems,
}) => {
    if (lineItems.length === 0) {
        return (
            <Box
                sx={{
                    border: '1px dashed #e0e0e0',
                    borderRadius: 1,
                    p: 2,
                    textAlign: 'center',
                    backgroundColor: '#fafafb',
                }}
            >
                <Typography variant="body2" color="text.secondary">
                    No items in this section
                </Typography>
                <Button
                    size="small"
                    startIcon={<AddIcon />}
                    sx={{
                        mt: 1,
                        color: '#0A2243',
                        '&:hover': {
                            backgroundColor: '#FCBB1C20',
                        },
                    }}
                >
                    Add Item
                </Button>
            </Box>
        );
    }

    return (
        <Stack spacing={1}>
            {lineItems.map((item, index) => (
                <LineItemCard
                    key={item.id}
                    item={item}
                    index={index}
                />
            ))}
        </Stack>
    );
};

interface LineItemCardProps {
    item: ProposalLineItem;
    index: number;
}

const LineItemCard: React.FC<LineItemCardProps> = ({ item, index }) => {
    return (
        <Box
            sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                p: 2,
                backgroundColor: item.is_selected_by_client ? 'white' : '#f5f5f5',
                opacity: item.is_visible_to_client ? 1 : 0.6,
            }}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Stack spacing={1} flex={1}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {item.name}
                    </Typography>
                    {item.description && (
                        <Typography variant="body2" color="text.secondary">
                            {item.description}
                        </Typography>
                    )}
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                            Qty: {item.quantity} {item.unit}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            ${item.unit_price.toLocaleString()} each
                        </Typography>
                    </Stack>
                </Stack>
                
                <Stack alignItems="flex-end" spacing={1}>
                    <Typography
                        variant="subtitle2"
                        sx={{
                            fontWeight: 600,
                            color: item.is_selected_by_client ? '#0A2243' : '#757575',
                        }}
                    >
                        ${item.total_price.toLocaleString()}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        {item.is_optional && (
                            <Typography variant="caption" color="warning.main">
                                Optional
                            </Typography>
                        )}
                        {!item.is_visible_to_client && (
                            <Typography variant="caption" color="error.main">
                                Hidden
                            </Typography>
                        )}
                    </Stack>
                </Stack>
            </Stack>
        </Box>
    );
};

interface PricingSummaryProps {
    sections: ProposalSection[];
}

const PricingSummary: React.FC<PricingSummaryProps> = ({ sections }) => {
    const record = useRecordContext<Proposal>();
    
    const subtotal = sections.reduce((sum, section) => 
        sum + section.lineItems.reduce((sectionSum, item) => 
            sectionSum + (item.is_selected_by_client ? item.total_price : 0), 0
        ), 0
    );
    
    const taxRate = record?.tax_rate || 0.0825;
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    return (
        <Card
            sx={{
                position: 'sticky',
                top: 16,
                backgroundColor: 'white',
                boxShadow: 2,
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
                    Pricing Summary
                </Typography>
                
                <Stack spacing={2}>
                    {sections.map((section) => {
                        const sectionTotal = section.lineItems.reduce(
                            (sum, item) => sum + (item.is_selected_by_client ? item.total_price : 0),
                            0
                        );
                        
                        if (sectionTotal === 0) return null;
                        
                        return (
                            <Stack
                                key={section.id}
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                <Typography variant="body2">
                                    {section.name}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    ${sectionTotal.toLocaleString()}
                                </Typography>
                            </Stack>
                        );
                    })}
                    
                    <Divider />
                    
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle2">Subtotal</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            ${subtotal.toLocaleString()}
                        </Typography>
                    </Stack>
                    
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle2">
                            Tax ({(taxRate * 100).toFixed(2)}%)
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            ${taxAmount.toLocaleString()}
                        </Typography>
                    </Stack>
                    
                    <Divider />
                    
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography
                            variant="h6"
                            sx={{
                                color: '#0A2243',
                                fontWeight: 700,
                            }}
                        >
                            Total
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                color: '#0A2243',
                                fontWeight: 700,
                            }}
                        >
                            ${total.toLocaleString()}
                        </Typography>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
};

const DesignTab = () => {
    return (
        <Box sx={{ p: 3 }}>
            <Card>
                <CardContent>
                    <Typography
                        variant="h6"
                        sx={{
                            color: '#0A2243',
                            fontWeight: 600,
                            mb: 2,
                        }}
                    >
                        Design & Branding
                    </Typography>
                    
                    <Box
                        sx={{
                            border: '2px dashed #e0e0e0',
                            borderRadius: 2,
                            p: 4,
                            textAlign: 'center',
                            backgroundColor: '#fafafb',
                        }}
                    >
                        <Typography variant="body1" color="text.secondary">
                            Design customization interface coming soon
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Configure proposal branding, colors, fonts, and layout options
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};
