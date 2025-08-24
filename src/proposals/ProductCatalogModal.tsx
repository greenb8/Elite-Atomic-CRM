import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Checkbox,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import {
    Add as AddIcon,
    Close as CloseIcon,
    Inventory as InventoryIcon,
    Remove as RemoveIcon,
    Search as SearchIcon,
    ShoppingCart as CartIcon,
} from '@mui/icons-material';
import { m } from 'framer-motion';
import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import {
    useDataProvider,
    useNotify,
} from 'react-admin';

import { Product } from '../types';
import { useDebounce } from '../misc/useDebounce';

interface SelectedProduct extends Product {
    quantity: number;
    selectedTotal: number;
}

interface ProductCatalogModalProps {
    open: boolean;
    onClose: () => void;
    onAddProducts: (products: SelectedProduct[], sectionName: string) => void;
    currentSectionName?: string;
}

export const ProductCatalogModal: React.FC<ProductCatalogModalProps> = ({
    open,
    onClose,
    onAddProducts,
    currentSectionName = 'General',
}) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<Map<string, SelectedProduct>>(new Map());
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const theme = useTheme();
    const dataProvider = useDataProvider();
    const notify = useNotify();
    
    // Debounced search
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Load products
    useEffect(() => {
        if (!open) return;
        
        const loadProducts = async () => {
            try {
                setIsLoading(true);
                const { data } = await dataProvider.getList('products', {
                    filter: {
                        is_proposal_visible: true,
                        ...(debouncedSearchTerm && {
                            q: debouncedSearchTerm,
                        }),
                        ...(categoryFilter && {
                            proposal_category: categoryFilter,
                        }),
                    },
                    sort: { field: 'name', order: 'ASC' },
                    pagination: { page: 1, perPage: 100 },
                });
                setProducts(data);
            } catch (error) {
                notify('Error loading products', { type: 'error' });
            } finally {
                setIsLoading(false);
            }
        };

        loadProducts();
    }, [open, debouncedSearchTerm, categoryFilter, dataProvider, notify]);

    // Get unique categories
    const categories = useMemo(() => {
        const uniqueCategories = [...new Set(products.map(p => p.proposal_category).filter(Boolean))];
        return uniqueCategories.sort();
    }, [products]);

    // Calculate totals
    const selectedTotal = useMemo(() => {
        return Array.from(selectedProducts.values()).reduce(
            (sum, product) => sum + product.selectedTotal,
            0
        );
    }, [selectedProducts]);

    const selectedCount = selectedProducts.size;

    const handleProductSelect = (product: Product, selected: boolean) => {
        const newSelected = new Map(selectedProducts);
        
        if (selected) {
            newSelected.set(product.id.toString(), {
                ...product,
                quantity: 1,
                selectedTotal: product.price,
            });
        } else {
            newSelected.delete(product.id.toString());
        }
        
        setSelectedProducts(newSelected);
    };

    const handleQuantityChange = (productId: string, quantity: number) => {
        const newSelected = new Map(selectedProducts);
        const product = newSelected.get(productId);
        
        if (product && quantity > 0) {
            product.quantity = quantity;
            product.selectedTotal = product.price * quantity;
            newSelected.set(productId, product);
            setSelectedProducts(newSelected);
        } else if (quantity <= 0) {
            newSelected.delete(productId);
            setSelectedProducts(newSelected);
        }
    };

    const handleAddProducts = () => {
        const productsToAdd = Array.from(selectedProducts.values());
        onAddProducts(productsToAdd, currentSectionName);
        setSelectedProducts(new Map());
        onClose();
    };

    const handleClose = () => {
        setSelectedProducts(new Map());
        setSearchTerm('');
        setCategoryFilter('');
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="lg"
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
                    Add Products from Catalog
                </Typography>
                <IconButton
                    onClick={handleClose}
                    sx={{ color: 'white' }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
                {/* Search and Filter Bar */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        borderBottom: '1px solid #e0e0e0',
                        backgroundColor: '#fafafb',
                    }}
                >
                    <Stack direction="row" spacing={2} alignItems="center">
                        <TextField
                            placeholder="Search products by name, description, or SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: '#757575' }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ flex: 1 }}
                        />
                        
                        <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                label="Category"
                            >
                                <MenuItem value="">All Categories</MenuItem>
                                {categories.map((category) => (
                                    <MenuItem key={category} value={category}>
                                        {category}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>
                </Paper>

                {/* Product Grid */}
                <Box sx={{ p: 2, minHeight: 400, maxHeight: 500, overflow: 'auto' }}>
                    {isLoading ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="h6" color="text.secondary">
                                Loading products...
                            </Typography>
                        </Box>
                    ) : products.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                No products found
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Try adjusting your search or filter criteria
                            </Typography>
                        </Box>
                    ) : (
                        <Grid container spacing={2}>
                            {products.map((product) => (
                                <Grid item xs={12} sm={6} md={4} key={product.id}>
                                    <ProductSelectionCard
                                        product={product}
                                        selected={selectedProducts.has(product.id.toString())}
                                        selectedProduct={selectedProducts.get(product.id.toString())}
                                        onSelect={handleProductSelect}
                                        onQuantityChange={handleQuantityChange}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>

                {/* Selected Products Summary */}
                {selectedCount > 0 && (
                    <Paper
                        elevation={0}
                        sx={{
                            borderTop: '1px solid #e0e0e0',
                            backgroundColor: '#fafafb',
                            p: 2,
                        }}
                    >
                        <Typography variant="h6" sx={{ color: '#0A2243', fontWeight: 600, mb: 2 }}>
                            Selected Products ({selectedCount})
                        </Typography>
                        
                        <Stack spacing={1} sx={{ maxHeight: 150, overflow: 'auto' }}>
                            {Array.from(selectedProducts.values()).map((product) => (
                                <SelectedProductRow
                                    key={product.id}
                                    product={product}
                                    onQuantityChange={handleQuantityChange}
                                    onRemove={() => handleProductSelect(product, false)}
                                />
                            ))}
                        </Stack>
                    </Paper>
                )}
            </DialogContent>

            <DialogActions
                sx={{
                    p: 2,
                    backgroundColor: '#fafafb',
                    borderTop: '1px solid #e0e0e0',
                }}
            >
                <Stack direction="row" justifyContent="space-between" alignItems="center" width="100%">
                    <Typography variant="h6" sx={{ color: '#0A2243', fontWeight: 600 }}>
                        Total: ${selectedTotal.toLocaleString()}
                    </Typography>
                    
                    <Stack direction="row" spacing={2}>
                        <Button onClick={handleClose} color="inherit">
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleAddProducts}
                            disabled={selectedCount === 0}
                            startIcon={<CartIcon />}
                            sx={{
                                backgroundColor: '#FCBB1C',
                                color: '#0A2243',
                                '&:hover': {
                                    backgroundColor: '#E6A619',
                                },
                            }}
                        >
                            Add {selectedCount} Item{selectedCount !== 1 ? 's' : ''} to {currentSectionName}
                        </Button>
                    </Stack>
                </Stack>
            </DialogActions>
        </Dialog>
    );
};

interface ProductSelectionCardProps {
    product: Product;
    selected: boolean;
    selectedProduct?: SelectedProduct;
    onSelect: (product: Product, selected: boolean) => void;
    onQuantityChange: (productId: string, quantity: number) => void;
}

const ProductSelectionCard: React.FC<ProductSelectionCardProps> = ({
    product,
    selected,
    selectedProduct,
    onSelect,
    onQuantityChange,
}) => {
    const theme = useTheme();
    const primaryImage = product.photos_paths?.[0] || product.image_path;

    return (
        <m.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
        >
            <Card
                sx={{
                    height: 320,
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    border: selected ? '2px solid #FCBB1C' : '1px solid #e0e0e0',
                    backgroundColor: selected ? '#FCBB1C10' : 'white',
                    cursor: 'pointer',
                    '&:hover': {
                        boxShadow: theme.shadows[4],
                    },
                }}
                onClick={() => onSelect(product, !selected)}
            >
                {/* Selection Checkbox */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        zIndex: 2,
                    }}
                >
                    <Checkbox
                        checked={selected}
                        onChange={(e) => onSelect(product, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        sx={{
                            color: 'white',
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            borderRadius: 1,
                            '&.Mui-checked': {
                                color: '#FCBB1C',
                                backgroundColor: 'rgba(0,0,0,0.3)',
                            },
                        }}
                    />
                </Box>

                {/* Product Image */}
                <Box sx={{ height: 140, overflow: 'hidden' }}>
                    {primaryImage ? (
                        <CardMedia
                            component="img"
                            height="140"
                            image={primaryImage}
                            alt={product.name}
                            sx={{ objectFit: 'cover' }}
                        />
                    ) : (
                        <Box
                            sx={{
                                height: 140,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'grey.100',
                                color: 'grey.400',
                            }}
                        >
                            <InventoryIcon sx={{ fontSize: 48 }} />
                        </Box>
                    )}
                </Box>

                {/* Product Details */}
                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Typography
                        variant="subtitle1"
                        sx={{
                            fontWeight: 600,
                            mb: 1,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        {product.name}
                    </Typography>

                    {product.proposal_category && (
                        <Chip
                            label={product.proposal_category}
                            size="small"
                            sx={{
                                mb: 1,
                                backgroundColor: '#0A224320',
                                color: '#0A2243',
                                fontSize: '0.75rem',
                            }}
                        />
                    )}

                    <Typography
                        variant="h6"
                        sx={{
                            color: '#0A2243',
                            fontWeight: 700,
                            mb: 1,
                        }}
                    >
                        ${product.price.toLocaleString()}
                    </Typography>

                    {product.description && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                            }}
                        >
                            {product.description}
                        </Typography>
                    )}
                </CardContent>

                {/* Quantity Controls (when selected) */}
                {selected && selectedProduct && (
                    <Box
                        sx={{
                            p: 2,
                            backgroundColor: '#FCBB1C20',
                            borderTop: '1px solid #FCBB1C',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                Quantity
                            </Typography>
                            
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <IconButton
                                    size="small"
                                    onClick={() => onQuantityChange(product.id.toString(), selectedProduct.quantity - 1)}
                                    disabled={selectedProduct.quantity <= 1}
                                    sx={{
                                        backgroundColor: '#0A2243',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: '#0A224380',
                                        },
                                        '&:disabled': {
                                            backgroundColor: '#e0e0e0',
                                            color: '#757575',
                                        },
                                    }}
                                >
                                    <RemoveIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                                
                                <Typography
                                    variant="body1"
                                    sx={{
                                        minWidth: 40,
                                        textAlign: 'center',
                                        fontWeight: 600,
                                    }}
                                >
                                    {selectedProduct.quantity}
                                </Typography>
                                
                                <IconButton
                                    size="small"
                                    onClick={() => onQuantityChange(product.id.toString(), selectedProduct.quantity + 1)}
                                    sx={{
                                        backgroundColor: '#0A2243',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: '#0A224380',
                                        },
                                    }}
                                >
                                    <AddIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            </Stack>
                        </Stack>
                        
                        <Typography
                            variant="subtitle2"
                            sx={{
                                textAlign: 'center',
                                mt: 1,
                                color: '#0A2243',
                                fontWeight: 600,
                            }}
                        >
                            Total: ${selectedProduct.selectedTotal.toLocaleString()}
                        </Typography>
                    </Box>
                )}
            </Card>
        </m.div>
    );
};

interface SelectedProductRowProps {
    product: SelectedProduct;
    onQuantityChange: (productId: string, quantity: number) => void;
    onRemove: () => void;
}

const SelectedProductRow: React.FC<SelectedProductRowProps> = ({
    product,
    onQuantityChange,
    onRemove,
}) => {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1,
                backgroundColor: 'white',
                borderRadius: 1,
                border: '1px solid #e0e0e0',
            }}
        >
            <Stack direction="row" alignItems="center" spacing={2} flex={1}>
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        overflow: 'hidden',
                        backgroundColor: 'grey.100',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {product.photos_paths?.[0] ? (
                        <img
                            src={product.photos_paths[0]}
                            alt={product.name}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />
                    ) : (
                        <InventoryIcon sx={{ fontSize: 20, color: 'grey.400' }} />
                    )}
                </Box>
                
                <Stack flex={1}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {product.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        ${product.price.toLocaleString()} each
                    </Typography>
                </Stack>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <IconButton
                        size="small"
                        onClick={() => onQuantityChange(product.id.toString(), product.quantity - 1)}
                        disabled={product.quantity <= 1}
                    >
                        <RemoveIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                    
                    <Typography variant="body2" sx={{ minWidth: 30, textAlign: 'center' }}>
                        {product.quantity}
                    </Typography>
                    
                    <IconButton
                        size="small"
                        onClick={() => onQuantityChange(product.id.toString(), product.quantity + 1)}
                    >
                        <AddIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                </Stack>

                <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 80, textAlign: 'right' }}>
                    ${product.selectedTotal.toLocaleString()}
                </Typography>

                <IconButton
                    size="small"
                    onClick={onRemove}
                    sx={{ color: '#F44336' }}
                >
                    <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
            </Stack>
        </Box>
    );
};
