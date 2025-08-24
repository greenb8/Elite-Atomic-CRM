import {
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import {
    Add as AddIcon,
    Close as CloseIcon,
    Save as SaveIcon,
    Inventory as InventoryIcon,
    Warning as WarningIcon,
} from '@mui/icons-material';
import * as React from 'react';
import { useState } from 'react';
import {
    useCreate,
    useDataProvider,
    useGetIdentity,
    useNotify,
} from 'react-admin';

import { Product, ProposalLineItem } from '../types';

interface CustomLineItemData {
    name: string;
    description: string;
    quantity: number;
    unit: string;
    unit_price: number;
    unit_cost: number;
    section_name: string;
    is_visible_to_client: boolean;
    is_optional: boolean;
    is_selected_by_client: boolean;
}

interface CustomLineItemDialogProps {
    open: boolean;
    onClose: () => void;
    onAddLineItem: (lineItem: Partial<ProposalLineItem>, savedProduct?: Product) => void;
    proposalId: string;
    currentSectionName: string;
    availableSections: string[];
}

export const CustomLineItemDialog: React.FC<CustomLineItemDialogProps> = ({
    open,
    onClose,
    onAddLineItem,
    proposalId,
    currentSectionName,
    availableSections,
}) => {
    const [formData, setFormData] = useState<CustomLineItemData>({
        name: '',
        description: '',
        quantity: 1,
        unit: 'each',
        unit_price: 0,
        unit_cost: 0,
        section_name: currentSectionName,
        is_visible_to_client: true,
        is_optional: false,
        is_selected_by_client: true,
    });
    const [saveToCatalog, setSaveToCatalog] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    
    const theme = useTheme();
    const { identity } = useGetIdentity();
    const [createProduct] = useCreate();
    const dataProvider = useDataProvider();
    const notify = useNotify();

    // Calculate totals
    const totalPrice = formData.quantity * formData.unit_price;
    const totalCost = formData.quantity * formData.unit_cost;
    const margin = totalPrice - totalCost;
    const marginPercent = totalPrice > 0 ? (margin / totalPrice) * 100 : 0;

    // Get suggested category based on section
    const getSuggestedCategory = (sectionName: string): string => {
        const categoryMap: Record<string, string> = {
            'Landscape Management': 'Landscape Management',
            'Installation Services': 'Installation Services',
            'Additional Services': 'Additional Services',
            'Site Preparation': 'Installation Services',
            'Plant Installation': 'Installation Services',
            'Hardscape Features': 'Installation Services',
            'Irrigation & Lighting': 'Installation Services',
        };
        return categoryMap[sectionName] || 'Additional Services';
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            notify('Item name is required', { type: 'error' });
            return;
        }

        if (formData.unit_price <= 0) {
            notify('Unit price must be greater than 0', { type: 'error' });
            return;
        }

        try {
            setIsCreating(true);
            let savedProduct: Product | undefined;

            // Save to product catalog if requested
            if (saveToCatalog) {
                const productData = {
                    name: formData.name,
                    description: formData.description,
                    price: formData.unit_price,
                    cost: formData.unit_cost || null,
                    category: getSuggestedCategory(formData.section_name),
                    proposal_category: getSuggestedCategory(formData.section_name),
                    proposal_description: formData.description,
                    is_proposal_visible: true,
                    is_optional: formData.is_optional,
                    sort_order: 0,
                    quantity_on_hand: 0, // Default for services
                    quantity_sold: 0,
                    created_by: identity?.id,
                };

                savedProduct = await createProduct('products', {
                    data: productData,
                }, { returnPromise: true });

                notify('Product saved to catalog successfully', { type: 'success' });
            }

            // Create line item
            const lineItemData: Partial<ProposalLineItem> = {
                proposal_id: proposalId,
                product_id: savedProduct?.id || undefined,
                section_name: formData.section_name,
                name: formData.name,
                description: formData.description,
                quantity: formData.quantity,
                unit: formData.unit,
                unit_price: formData.unit_price,
                unit_cost: formData.unit_cost || undefined,
                is_visible_to_client: formData.is_visible_to_client,
                is_optional: formData.is_optional,
                is_selected_by_client: formData.is_selected_by_client,
                sort_order: 0,
                section_sort_order: 0,
                image_paths: [],
                custom_data: saveToCatalog ? {} : { is_custom_item: true },
            };

            onAddLineItem(lineItemData, savedProduct);
            handleClose();
            
            notify(
                saveToCatalog 
                    ? 'Custom item added and saved to catalog' 
                    : 'Custom item added to proposal',
                { type: 'success' }
            );
        } catch (error) {
            notify('Error creating line item', { type: 'error' });
        } finally {
            setIsCreating(false);
        }
    };

    const handleClose = () => {
        setFormData({
            name: '',
            description: '',
            quantity: 1,
            unit: 'each',
            unit_price: 0,
            unit_cost: 0,
            section_name: currentSectionName,
            is_visible_to_client: true,
            is_optional: false,
            is_selected_by_client: true,
        });
        setSaveToCatalog(false);
        onClose();
    };

    const isFormValid = formData.name.trim() && formData.unit_price > 0;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    maxHeight: '90vh',
                },
            }}
        >
            <DialogTitle
                sx={{
                    backgroundColor: '#0A2243',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Add Custom Line Item
                </Typography>
                <IconButton
                    onClick={handleClose}
                    sx={{ color: 'white' }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    {/* Left column - Item details */}
                    <Grid item xs={12} md={8}>
                        <Stack spacing={3}>
                            {/* Basic information */}
                            <Box>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: '#0A2243',
                                        fontWeight: 600,
                                        mb: 2,
                                    }}
                                >
                                    Item Details
                                </Typography>
                                
                                <Stack spacing={2}>
                                    <TextField
                                        label="Item Name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        fullWidth
                                        required
                                        error={!formData.name.trim()}
                                        helperText={!formData.name.trim() ? 'Item name is required' : ''}
                                    />
                                    
                                    <TextField
                                        label="Description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        fullWidth
                                        multiline
                                        rows={3}
                                        helperText="Detailed description for client proposals"
                                    />
                                </Stack>
                            </Box>

                            {/* Quantity and pricing */}
                            <Box>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: '#0A2243',
                                        fontWeight: 600,
                                        mb: 2,
                                    }}
                                >
                                    Quantity & Pricing
                                </Typography>
                                
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <TextField
                                            label="Quantity"
                                            type="number"
                                            value={formData.quantity}
                                            onChange={(e) => setFormData({ 
                                                ...formData, 
                                                quantity: parseFloat(e.target.value) || 1 
                                            })}
                                            fullWidth
                                            inputProps={{ min: 0.01, step: 0.01 }}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            label="Unit"
                                            value={formData.unit}
                                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                            fullWidth
                                            placeholder="each, sq ft, hour, etc."
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            label="Unit Price (Client)"
                                            type="number"
                                            value={formData.unit_price}
                                            onChange={(e) => setFormData({ 
                                                ...formData, 
                                                unit_price: parseFloat(e.target.value) || 0 
                                            })}
                                            fullWidth
                                            required
                                            error={formData.unit_price <= 0}
                                            InputProps={{
                                                startAdornment: '$',
                                            }}
                                            inputProps={{ min: 0, step: 0.01 }}
                                            helperText={formData.unit_price <= 0 ? 'Price must be greater than 0' : 'Price shown to client'}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            label="Unit Cost (Internal)"
                                            type="number"
                                            value={formData.unit_cost}
                                            onChange={(e) => setFormData({ 
                                                ...formData, 
                                                unit_cost: parseFloat(e.target.value) || 0 
                                            })}
                                            fullWidth
                                            InputProps={{
                                                startAdornment: '$',
                                            }}
                                            inputProps={{ min: 0, step: 0.01 }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    backgroundColor: '#FFF3E0',
                                                },
                                            }}
                                            helperText="Internal cost - hidden from client"
                                        />
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* Section and visibility */}
                            <Box>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: '#0A2243',
                                        fontWeight: 600,
                                        mb: 2,
                                    }}
                                >
                                    Organization & Visibility
                                </Typography>
                                
                                <Stack spacing={2}>
                                    <FormControl fullWidth>
                                        <InputLabel>Section</InputLabel>
                                        <Select
                                            value={formData.section_name}
                                            onChange={(e) => setFormData({ 
                                                ...formData, 
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

                                    <Stack spacing={1}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formData.is_visible_to_client}
                                                    onChange={(e) => setFormData({ 
                                                        ...formData, 
                                                        is_visible_to_client: e.target.checked,
                                                        is_optional: e.target.checked ? formData.is_optional : false,
                                                    })}
                                                    sx={{
                                                        color: '#FCBB1C',
                                                        '&.Mui-checked': {
                                                            color: '#FCBB1C',
                                                        },
                                                    }}
                                                />
                                            }
                                            label="Visible to Client"
                                        />
                                        
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formData.is_optional}
                                                    onChange={(e) => setFormData({ 
                                                        ...formData, 
                                                        is_optional: e.target.checked,
                                                        is_selected_by_client: e.target.checked ? formData.is_selected_by_client : true,
                                                    })}
                                                    disabled={!formData.is_visible_to_client}
                                                    sx={{
                                                        color: '#FF9800',
                                                        '&.Mui-checked': {
                                                            color: '#FF9800',
                                                        },
                                                    }}
                                                />
                                            }
                                            label="Optional Item (Client can select/deselect)"
                                        />
                                        
                                        {formData.is_optional && (
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={formData.is_selected_by_client}
                                                        onChange={(e) => setFormData({ 
                                                            ...formData, 
                                                            is_selected_by_client: e.target.checked 
                                                        })}
                                                        sx={{
                                                            color: '#4CAF50',
                                                            '&.Mui-checked': {
                                                                color: '#4CAF50',
                                                            },
                                                        }}
                                                    />
                                                }
                                                label="Pre-selected by Client"
                                                sx={{ ml: 3 }}
                                            />
                                        )}
                                    </Stack>
                                </Stack>
                            </Box>
                        </Stack>
                    </Grid>

                    {/* Right column - Preview and catalog option */}
                    <Grid item xs={12} md={4}>
                        <Stack spacing={3}>
                            {/* Save to catalog option */}
                            <Card
                                sx={{
                                    backgroundColor: saveToCatalog ? '#FCBB1C10' : '#fafafb',
                                    border: saveToCatalog ? '2px solid #FCBB1C' : '1px solid #e0e0e0',
                                }}
                            >
                                <CardContent>
                                    <Stack spacing={2}>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <InventoryIcon sx={{ color: '#0A2243' }} />
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    color: '#0A2243',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                Save to Catalog
                                            </Typography>
                                        </Stack>
                                        
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={saveToCatalog}
                                                    onChange={(e) => setSaveToCatalog(e.target.checked)}
                                                    sx={{
                                                        color: '#FCBB1C',
                                                        '&.Mui-checked': {
                                                            color: '#FCBB1C',
                                                        },
                                                    }}
                                                />
                                            }
                                            label="Save to Product Catalog for Future Use"
                                            sx={{
                                                '& .MuiFormControlLabel-label': {
                                                    fontWeight: 500,
                                                },
                                            }}
                                        />
                                        
                                        <Typography variant="body2" color="text.secondary">
                                            {saveToCatalog 
                                                ? 'This item will be available in your product catalog for future proposals'
                                                : 'This item will only be used in this proposal'
                                            }
                                        </Typography>

                                        {saveToCatalog && (
                                            <Box
                                                sx={{
                                                    p: 2,
                                                    backgroundColor: '#E8F5E8',
                                                    borderRadius: 1,
                                                    border: '1px solid #4CAF50',
                                                }}
                                            >
                                                <Typography variant="caption" color="success.dark" sx={{ fontWeight: 500 }}>
                                                    Will be saved to: {getSuggestedCategory(formData.section_name)}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Stack>
                                </CardContent>
                            </Card>

                            {/* Pricing preview */}
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
                                        Pricing Preview
                                    </Typography>
                                    
                                    <Stack spacing={1}>
                                        <Stack direction="row" justifyContent="space-between">
                                            <Typography variant="body2">Unit Price:</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                ${formData.unit_price.toLocaleString()}
                                            </Typography>
                                        </Stack>
                                        
                                        <Stack direction="row" justifyContent="space-between">
                                            <Typography variant="body2">Quantity:</Typography>
                                            <Typography variant="body2">
                                                {formData.quantity} {formData.unit}
                                            </Typography>
                                        </Stack>
                                        
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
                                        
                                        {formData.unit_cost > 0 && (
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
                                </CardContent>
                            </Card>

                            {/* Client view preview */}
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
                                        Client View Preview
                                    </Typography>
                                    
                                    <Box
                                        sx={{
                                            p: 2,
                                            backgroundColor: formData.is_visible_to_client ? 'white' : '#f5f5f5',
                                            border: '1px solid #e0e0e0',
                                            borderRadius: 1,
                                            opacity: formData.is_visible_to_client ? 1 : 0.6,
                                        }}
                                    >
                                        <Stack spacing={1}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                                <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
                                                    {formData.name || 'Item Name'}
                                                </Typography>
                                                {formData.is_optional && (
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
                                            </Stack>
                                            
                                            {formData.description && (
                                                <Typography variant="body2" color="text.secondary">
                                                    {formData.description}
                                                </Typography>
                                            )}
                                            
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Typography variant="body2">
                                                    {formData.quantity} {formData.unit} × ${formData.unit_price.toLocaleString()}
                                                </Typography>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                    ${totalPrice.toLocaleString()}
                                                </Typography>
                                            </Stack>
                                            
                                            {!formData.is_visible_to_client && (
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1,
                                                        mt: 1,
                                                        p: 1,
                                                        backgroundColor: '#FFF3E0',
                                                        borderRadius: 1,
                                                    }}
                                                >
                                                    <WarningIcon sx={{ fontSize: 16, color: '#FF9800' }} />
                                                    <Typography variant="caption" color="warning.dark">
                                                        Hidden from client view
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Stack>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Stack>
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions
                sx={{
                    p: 3,
                    backgroundColor: '#fafafb',
                    borderTop: '1px solid #e0e0e0',
                }}
            >
                <Stack direction="row" justifyContent="space-between" alignItems="center" width="100%">
                    <Typography variant="body2" color="text.secondary">
                        Adding to: <strong>{formData.section_name}</strong>
                    </Typography>
                    
                    <Stack direction="row" spacing={2}>
                        <Button onClick={handleClose} color="inherit">
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={!isFormValid || isCreating}
                            startIcon={saveToCatalog ? <SaveIcon /> : <AddIcon />}
                            sx={{
                                backgroundColor: '#FCBB1C',
                                color: '#0A2243',
                                '&:hover': {
                                    backgroundColor: '#E6A619',
                                },
                            }}
                        >
                            {isCreating 
                                ? 'Creating...' 
                                : saveToCatalog 
                                ? 'Add & Save to Catalog' 
                                : 'Add to Proposal'
                            }
                        </Button>
                    </Stack>
                </Stack>
            </DialogActions>
        </Dialog>
    );
};
