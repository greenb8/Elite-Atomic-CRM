import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Switch,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    DragIndicator as DragIcon,
    Edit as EditIcon,
    Image as ImageIcon,
    Remove as RemoveIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { m } from 'framer-motion';
import * as React from 'react';
import { useState, useEffect } from 'react';
import {
    useDataProvider,
    useNotify,
    useUpdate,
} from 'react-admin';

import { ProposalLineItem } from '../types';
import { useDebounce } from '../misc/useDebounce';

interface LineItemEditorProps {
    item: ProposalLineItem;
    availableSections: string[];
    onUpdate: (updates: Partial<ProposalLineItem>) => void;
    onDelete: () => void;
    onDuplicate?: () => void;
    isClientView?: boolean;
}

export const LineItemEditor: React.FC<LineItemEditorProps> = ({
    item,
    availableSections,
    onUpdate,
    onDelete,
    onDuplicate,
    isClientView = false,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        name: item.name,
        description: item.description || '',
        quantity: item.quantity,
        unit_price: item.unit_price,
        unit_cost: item.unit_cost || 0,
        unit: item.unit,
        section_name: item.section_name,
    });
    const [isSaving, setIsSaving] = useState(false);
    
    const theme = useTheme();
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const [update] = useUpdate();
    
    // Debounced save for inline editing
    const debouncedEditData = useDebounce(editData, 500);

    // Auto-save when edit data changes
    useEffect(() => {
        if (isEditing && JSON.stringify(debouncedEditData) !== JSON.stringify({
            name: item.name,
            description: item.description || '',
            quantity: item.quantity,
            unit_price: item.unit_price,
            unit_cost: item.unit_cost || 0,
            unit: item.unit,
            section_name: item.section_name,
        })) {
            handleSave();
        }
    }, [debouncedEditData, isEditing]);

    const handleSave = async () => {
        try {
            setIsSaving(true);
            
            await update('proposal_line_items', {
                id: item.id,
                data: {
                    ...editData,
                    // Calculated fields will be updated by database triggers
                },
                previousData: item,
            });

            onUpdate(editData);
            notify('Line item updated', { type: 'success' });
        } catch (error) {
            notify('Error updating line item', { type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleVisibilityToggle = async (field: 'is_visible_to_client' | 'is_optional' | 'is_selected_by_client', value: boolean) => {
        try {
            await update('proposal_line_items', {
                id: item.id,
                data: { [field]: value },
                previousData: item,
            });

            onUpdate({ [field]: value });
            notify('Visibility updated', { type: 'success' });
        } catch (error) {
            notify('Error updating visibility', { type: 'error' });
        }
    };

    const totalPrice = editData.quantity * editData.unit_price;
    const totalCost = editData.quantity * editData.unit_cost;
    const margin = totalPrice - totalCost;
    const marginPercent = totalPrice > 0 ? (margin / totalPrice) * 100 : 0;

    return (
        <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
        >
            <Card
                sx={{
                    mb: 2,
                    backgroundColor: item.is_visible_to_client ? 'white' : '#f5f5f5',
                    border: item.is_selected_by_client 
                        ? '2px solid #4CAF50' 
                        : item.is_optional 
                        ? '2px solid #FF9800' 
                        : '1px solid #e0e0e0',
                    opacity: item.is_visible_to_client ? 1 : 0.7,
                    '&:hover': {
                        boxShadow: theme.shadows[4],
                    },
                }}
            >
                <CardContent>
                    <Stack spacing={2}>
                        {/* Header with drag handle and controls */}
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Stack direction="row" alignItems="center" spacing={1} flex={1}>
                                <IconButton
                                    size="small"
                                    sx={{ cursor: 'grab', color: '#757575' }}
                                >
                                    <DragIcon />
                                </IconButton>
                                
                                <Stack spacing={1} flex={1}>
                                    {/* Status indicators */}
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        {!item.is_visible_to_client && (
                                            <Chip
                                                icon={<VisibilityOffIcon />}
                                                label="Hidden from Client"
                                                size="small"
                                                sx={{
                                                    backgroundColor: '#F44336',
                                                    color: 'white',
                                                    fontSize: '0.75rem',
                                                }}
                                            />
                                        )}
                                        {item.is_optional && (
                                            <Chip
                                                label="Optional"
                                                size="small"
                                                sx={{
                                                    backgroundColor: '#FF9800',
                                                    color: 'white',
                                                    fontSize: '0.75rem',
                                                }}
                                            />
                                        )}
                                        {item.is_selected_by_client && (
                                            <Chip
                                                label="Selected by Client"
                                                size="small"
                                                sx={{
                                                    backgroundColor: '#4CAF50',
                                                    color: 'white',
                                                    fontSize: '0.75rem',
                                                }}
                                            />
                                        )}
                                    </Stack>
                                </Stack>
                            </Stack>

                            <Stack direction="row" spacing={1} alignItems="center">
                                <IconButton
                                    size="small"
                                    onClick={() => setIsEditing(!isEditing)}
                                    sx={{
                                        color: isEditing ? '#FCBB1C' : '#757575',
                                        backgroundColor: isEditing ? '#FCBB1C20' : 'transparent',
                                    }}
                                >
                                    <EditIcon />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={onDelete}
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

                        {/* Main content */}
                        <Grid container spacing={2}>
                            {/* Left column - Item details */}
                            <Grid item xs={12} md={8}>
                                <Stack spacing={2}>
                                    {/* Name and description */}
                                    {isEditing ? (
                                        <Stack spacing={2}>
                                            <TextField
                                                label="Item Name"
                                                value={editData.name}
                                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                                fullWidth
                                                required
                                                size="small"
                                            />
                                            <TextField
                                                label="Description"
                                                value={editData.description}
                                                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                                fullWidth
                                                multiline
                                                rows={2}
                                                size="small"
                                            />
                                        </Stack>
                                    ) : (
                                        <Stack spacing={1}>
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    color: '#0A2243',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                }}
                                                onClick={() => setIsEditing(true)}
                                            >
                                                {item.name}
                                            </Typography>
                                            {item.description && (
                                                <Typography variant="body2" color="text.secondary">
                                                    {item.description}
                                                </Typography>
                                            )}
                                        </Stack>
                                    )}

                                    {/* Quantity and unit */}
                                    {isEditing ? (
                                        <Stack direction="row" spacing={2}>
                                            <TextField
                                                label="Quantity"
                                                type="number"
                                                value={editData.quantity}
                                                onChange={(e) => setEditData({ 
                                                    ...editData, 
                                                    quantity: parseFloat(e.target.value) || 0 
                                                })}
                                                size="small"
                                                sx={{ width: 120 }}
                                                inputProps={{ min: 0, step: 0.01 }}
                                            />
                                            <TextField
                                                label="Unit"
                                                value={editData.unit}
                                                onChange={(e) => setEditData({ ...editData, unit: e.target.value })}
                                                size="small"
                                                sx={{ width: 120 }}
                                            />
                                        </Stack>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            Quantity: {item.quantity} {item.unit}
                                        </Typography>
                                    )}

                                    {/* Section assignment */}
                                    {isEditing && (
                                        <FormControl size="small" sx={{ width: 200 }}>
                                            <InputLabel>Section</InputLabel>
                                            <Select
                                                value={editData.section_name}
                                                onChange={(e) => setEditData({ 
                                                    ...editData, 
                                                    section_name: e.target.value 
                                                })}
                                                label="Section"
                                            >
                                                {availableSections.map((section) => (
                                                    <MenuItem key={section} value={section}>
                                                        {section}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    )}
                                </Stack>
                            </Grid>

                            {/* Right column - Pricing and controls */}
                            <Grid item xs={12} md={4}>
                                <Stack spacing={2}>
                                    {/* Pricing section */}
                                    <Box
                                        sx={{
                                            p: 2,
                                            backgroundColor: '#fafafb',
                                            borderRadius: 2,
                                            border: '1px solid #e0e0e0',
                                        }}
                                    >
                                        <Typography
                                            variant="subtitle2"
                                            sx={{
                                                color: '#0A2243',
                                                fontWeight: 600,
                                                mb: 2,
                                            }}
                                        >
                                            Pricing
                                        </Typography>

                                        {isEditing ? (
                                            <Stack spacing={2}>
                                                <TextField
                                                    label="Unit Price (Client)"
                                                    type="number"
                                                    value={editData.unit_price}
                                                    onChange={(e) => setEditData({ 
                                                        ...editData, 
                                                        unit_price: parseFloat(e.target.value) || 0 
                                                    })}
                                                    size="small"
                                                    InputProps={{
                                                        startAdornment: '$',
                                                    }}
                                                    inputProps={{ min: 0, step: 0.01 }}
                                                />
                                                
                                                {!isClientView && (
                                                    <TextField
                                                        label="Unit Cost (Internal)"
                                                        type="number"
                                                        value={editData.unit_cost}
                                                        onChange={(e) => setEditData({ 
                                                            ...editData, 
                                                            unit_cost: parseFloat(e.target.value) || 0 
                                                        })}
                                                        size="small"
                                                        InputProps={{
                                                            startAdornment: '$',
                                                        }}
                                                        inputProps={{ min: 0, step: 0.01 }}
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                backgroundColor: '#FFF3E0',
                                                            },
                                                        }}
                                                        helperText="Hidden from client"
                                                    />
                                                )}
                                            </Stack>
                                        ) : (
                                            <Stack spacing={1}>
                                                <Stack direction="row" justifyContent="space-between">
                                                    <Typography variant="body2">Unit Price:</Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        ${item.unit_price.toLocaleString()}
                                                    </Typography>
                                                </Stack>
                                                
                                                {!isClientView && item.unit_cost && (
                                                    <Stack direction="row" justifyContent="space-between">
                                                        <Typography variant="body2" color="text.secondary">
                                                            Unit Cost:
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            ${item.unit_cost.toLocaleString()}
                                                        </Typography>
                                                    </Stack>
                                                )}
                                                
                                                <Divider />
                                                
                                                <Stack direction="row" justifyContent="space-between">
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                        Total Price:
                                                    </Typography>
                                                    <Typography
                                                        variant="subtitle2"
                                                        sx={{
                                                            fontWeight: 700,
                                                            color: '#0A2243',
                                                        }}
                                                    >
                                                        ${totalPrice.toLocaleString()}
                                                    </Typography>
                                                </Stack>
                                                
                                                {!isClientView && item.unit_cost && (
                                                    <>
                                                        <Stack direction="row" justifyContent="space-between">
                                                            <Typography variant="body2" color="text.secondary">
                                                                Total Cost:
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                ${totalCost.toLocaleString()}
                                                            </Typography>
                                                        </Stack>
                                                        
                                                        <Stack direction="row" justifyContent="space-between">
                                                            <Typography variant="body2" color="success.main">
                                                                Margin:
                                                            </Typography>
                                                            <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                                                                ${margin.toLocaleString()} ({marginPercent.toFixed(1)}%)
                                                            </Typography>
                                                        </Stack>
                                                    </>
                                                )}
                                            </Stack>
                                        )}
                                    </Box>

                                    {/* Client visibility controls */}
                                    {!isClientView && (
                                        <Box
                                            sx={{
                                                p: 2,
                                                backgroundColor: '#fafafb',
                                                borderRadius: 2,
                                                border: '1px solid #e0e0e0',
                                            }}
                                        >
                                            <Typography
                                                variant="subtitle2"
                                                sx={{
                                                    color: '#0A2243',
                                                    fontWeight: 600,
                                                    mb: 2,
                                                }}
                                            >
                                                Client Controls
                                            </Typography>

                                            <Stack spacing={2}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        <VisibilityIcon sx={{ fontSize: 16, color: '#757575' }} />
                                                        <Typography variant="body2">
                                                            Visible to Client
                                                        </Typography>
                                                    </Stack>
                                                    <Switch
                                                        checked={item.is_visible_to_client}
                                                        onChange={(e) => handleVisibilityToggle('is_visible_to_client', e.target.checked)}
                                                        sx={{
                                                            '& .MuiSwitch-switchBase.Mui-checked': {
                                                                color: '#FCBB1C',
                                                            },
                                                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                                backgroundColor: '#FCBB1C',
                                                            },
                                                        }}
                                                    />
                                                </Stack>

                                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        <Typography variant="body2">
                                                            Optional Item
                                                        </Typography>
                                                    </Stack>
                                                    <Switch
                                                        checked={item.is_optional}
                                                        onChange={(e) => handleVisibilityToggle('is_optional', e.target.checked)}
                                                        disabled={!item.is_visible_to_client}
                                                        sx={{
                                                            '& .MuiSwitch-switchBase.Mui-checked': {
                                                                color: '#FF9800',
                                                            },
                                                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                                backgroundColor: '#FF9800',
                                                            },
                                                        }}
                                                    />
                                                </Stack>

                                                {item.is_optional && (
                                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            <Typography variant="body2">
                                                                Client Selected
                                                            </Typography>
                                                        </Stack>
                                                        <Switch
                                                            checked={item.is_selected_by_client}
                                                            onChange={(e) => handleVisibilityToggle('is_selected_by_client', e.target.checked)}
                                                            sx={{
                                                                '& .MuiSwitch-switchBase.Mui-checked': {
                                                                    color: '#4CAF50',
                                                                },
                                                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                                    backgroundColor: '#4CAF50',
                                                                },
                                                            }}
                                                        />
                                                    </Stack>
                                                )}
                                            </Stack>
                                        </Box>
                                    )}
                                </Stack>
                            </Grid>
                        </Grid>

                        {/* Image management */}
                        {item.image_paths && item.image_paths.length > 0 && (
                            <Box>
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        color: '#0A2243',
                                        fontWeight: 600,
                                        mb: 1,
                                    }}
                                >
                                    Images
                                </Typography>
                                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                                    {item.image_paths.map((imagePath, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                width: 60,
                                                height: 60,
                                                borderRadius: 1,
                                                overflow: 'hidden',
                                                border: '1px solid #e0e0e0',
                                            }}
                                        >
                                            <img
                                                src={imagePath}
                                                alt={`${item.name} ${index + 1}`}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                }}
                                            />
                                        </Box>
                                    ))}
                                    
                                    {isEditing && (
                                        <IconButton
                                            sx={{
                                                width: 60,
                                                height: 60,
                                                border: '2px dashed #e0e0e0',
                                                borderRadius: 1,
                                                color: '#757575',
                                            }}
                                        >
                                            <ImageIcon />
                                        </IconButton>
                                    )}
                                </Stack>
                            </Box>
                        )}

                        {/* Action buttons */}
                        {isEditing && (
                            <Stack direction="row" spacing={2} justifyContent="flex-end">
                                <Button
                                    variant="outlined"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditData({
                                            name: item.name,
                                            description: item.description || '',
                                            quantity: item.quantity,
                                            unit_price: item.unit_price,
                                            unit_cost: item.unit_cost || 0,
                                            unit: item.unit,
                                            section_name: item.section_name,
                                        });
                                    }}
                                    size="small"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    size="small"
                                    sx={{
                                        backgroundColor: '#FCBB1C',
                                        color: '#0A2243',
                                        '&:hover': {
                                            backgroundColor: '#E6A619',
                                        },
                                    }}
                                >
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </Stack>
                        )}
                    </Stack>
                </CardContent>
            </Card>
        </m.div>
    );
};

// Bulk line item editor for managing multiple items
interface BulkLineItemEditorProps {
    items: ProposalLineItem[];
    availableSections: string[];
    onUpdateItems: (updates: Partial<ProposalLineItem>[]) => void;
    onDeleteItems: (itemIds: string[]) => void;
}

export const BulkLineItemEditor: React.FC<BulkLineItemEditorProps> = ({
    items,
    availableSections,
    onUpdateItems,
    onDeleteItems,
}) => {
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [bulkSection, setBulkSection] = useState('');
    const [bulkVisibility, setBulkVisibility] = useState<boolean | null>(null);

    const handleSelectAll = () => {
        if (selectedItems.size === items.length) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(items.map(item => item.id.toString())));
        }
    };

    const handleBulkUpdate = () => {
        const updates = Array.from(selectedItems).map(itemId => ({
            id: itemId,
            ...(bulkSection && { section_name: bulkSection }),
            ...(bulkVisibility !== null && { is_visible_to_client: bulkVisibility }),
        }));
        
        onUpdateItems(updates);
        setSelectedItems(new Set());
        setBulkSection('');
        setBulkVisibility(null);
    };

    const handleBulkDelete = () => {
        onDeleteItems(Array.from(selectedItems));
        setSelectedItems(new Set());
    };

    if (items.length === 0) return null;

    return (
        <Card sx={{ mb: 2, backgroundColor: '#f5f5f5' }}>
            <CardContent>
                <Typography
                    variant="h6"
                    sx={{
                        color: '#0A2243',
                        fontWeight: 600,
                        mb: 2,
                    }}
                >
                    Bulk Actions ({selectedItems.size} selected)
                </Typography>

                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                    <Button
                        variant="outlined"
                        onClick={handleSelectAll}
                        size="small"
                    >
                        {selectedItems.size === items.length ? 'Deselect All' : 'Select All'}
                    </Button>

                    {selectedItems.size > 0 && (
                        <>
                            <FormControl size="small" sx={{ minWidth: 150 }}>
                                <InputLabel>Move to Section</InputLabel>
                                <Select
                                    value={bulkSection}
                                    onChange={(e) => setBulkSection(e.target.value)}
                                    label="Move to Section"
                                >
                                    {availableSections.map((section) => (
                                        <MenuItem key={section} value={section}>
                                            {section}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel>Visibility</InputLabel>
                                <Select
                                    value={bulkVisibility === null ? '' : bulkVisibility.toString()}
                                    onChange={(e) => setBulkVisibility(
                                        e.target.value === '' ? null : e.target.value === 'true'
                                    )}
                                    label="Visibility"
                                >
                                    <MenuItem value="">No Change</MenuItem>
                                    <MenuItem value="true">Visible</MenuItem>
                                    <MenuItem value="false">Hidden</MenuItem>
                                </Select>
                            </FormControl>

                            <Button
                                variant="contained"
                                onClick={handleBulkUpdate}
                                disabled={!bulkSection && bulkVisibility === null}
                                size="small"
                                sx={{
                                    backgroundColor: '#FCBB1C',
                                    color: '#0A2243',
                                    '&:hover': {
                                        backgroundColor: '#E6A619',
                                    },
                                }}
                            >
                                Apply Changes
                            </Button>

                            <Button
                                variant="outlined"
                                onClick={handleBulkDelete}
                                size="small"
                                sx={{
                                    borderColor: '#F44336',
                                    color: '#F44336',
                                    '&:hover': {
                                        borderColor: '#D32F2F',
                                        backgroundColor: '#F4433620',
                                    },
                                }}
                            >
                                Delete Selected
                            </Button>
                        </>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
};
