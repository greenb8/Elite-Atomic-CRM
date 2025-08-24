import * as React from 'react';
import { useState } from 'react';
import { 
    Card, 
    CardMedia, 
    CardContent, 
    Typography, 
    Box, 
    Chip,
    IconButton,
    Tooltip
} from '@mui/material';
import { 
    ShoppingCart as ShoppingCartIcon,
    Inventory as InventoryIcon,
    LocalOffer as PriceIcon,
    Business as VendorIcon,
    Warning as LowStockIcon,
    CheckCircle as InStockIcon
} from '@mui/icons-material';
import { useCreatePath, useRecordContext, Link } from 'react-admin';
import { m } from 'framer-motion';

import { Product } from '../types';

// Helper to format currency
const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(price);
};

// Helper to get inventory status
const getInventoryStatus = (quantity: number) => {
    if (quantity === 0) return { status: 'out', color: 'error' as const, icon: LowStockIcon, label: 'Out of Stock' };
    if (quantity <= 5) return { status: 'low', color: 'warning' as const, icon: LowStockIcon, label: 'Low Stock' };
    return { status: 'in', color: 'success' as const, icon: InStockIcon, label: 'In Stock' };
};

// Helper to get primary image
const getPrimaryImage = (record: Product) => {
    if (record.photos_paths && record.photos_paths.length > 0) {
        return record.photos_paths[0];
    }
    return record.image_path || null;
};

export const ProductCard = (props: { record?: Product }) => {
    const [isHovered, setIsHovered] = useState(false);
    const createPath = useCreatePath();
    const record = useRecordContext<Product>(props);
    
    if (!record) return null;

    const primaryImage = getPrimaryImage(record);
    const inventoryStatus = getInventoryStatus(record.quantity_on_hand);
    const totalSold = record.total_sold || record.quantity_sold || 0;

    return (
        <m.div
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
        >
            <Link
                to={createPath({
                    resource: 'products',
                    id: record.id,
                    type: 'show',
                })}
                underline="none"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <Card
                    sx={{
                        height: 360,
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        borderRadius: 3,
                        overflow: 'hidden',
                        boxShadow: isHovered 
                            ? '0 8px 32px rgba(10, 34, 67, 0.15)' 
                            : '0 4px 12px rgba(10, 34, 67, 0.08)',
                        transition: 'box-shadow 0.2s ease',
                        '&:hover': {
                            '& .product-image': {
                                transform: 'scale(1.05)',
                            }
                        }
                    }}
                >
                    {/* Inventory Status Badge */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            zIndex: 2,
                        }}
                    >
                        <Tooltip title={inventoryStatus.label}>
                            <Chip
                                icon={<inventoryStatus.icon sx={{ fontSize: '16px !important' }} />}
                                label={record.quantity_on_hand}
                                size="small"
                                color={inventoryStatus.color}
                                sx={{
                                    backgroundColor: `${inventoryStatus.color}.light`,
                                    color: `${inventoryStatus.color}.dark`,
                                    fontWeight: 600,
                                    '& .MuiChip-icon': {
                                        color: `${inventoryStatus.color}.main`,
                                    }
                                }}
                            />
                        </Tooltip>
                    </Box>

                    {/* Product Image */}
                    <Box sx={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                        {primaryImage ? (
                            <CardMedia
                                component="img"
                                height="200"
                                image={primaryImage}
                                alt={record.name}
                                className="product-image"
                                sx={{
                                    objectFit: 'cover',
                                    transition: 'transform 0.3s ease',
                                }}
                            />
                        ) : (
                            <Box
                                sx={{
                                    height: 200,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: 'grey.100',
                                    color: 'grey.400',
                                }}
                            >
                                <InventoryIcon sx={{ fontSize: 64 }} />
                            </Box>
                        )}
                    </Box>

                    {/* Product Content */}
                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                        {/* Product Name */}
                        <Typography 
                            variant="h6" 
                            component="h3"
                            sx={{
                                fontWeight: 600,
                                fontSize: '1.1rem',
                                lineHeight: 1.3,
                                mb: 1,
                                color: 'text.primary',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                            }}
                        >
                            {record.name}
                        </Typography>

                        {/* Vendor */}
                        {record.vendor && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <VendorIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                                <Typography variant="body2" color="text.secondary">
                                    {record.vendor}
                                </Typography>
                            </Box>
                        )}

                        {/* Price */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <PriceIcon sx={{ fontSize: 18, color: 'primary.main', mr: 0.5 }} />
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    fontWeight: 700, 
                                    color: 'primary.main',
                                    fontSize: '1.25rem'
                                }}
                            >
                                {formatPrice(record.price)}
                            </Typography>
                            {record.cost && (
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        ml: 1, 
                                        color: 'text.secondary',
                                        textDecoration: 'line-through'
                                    }}
                                >
                                    {formatPrice(record.cost)}
                                </Typography>
                            )}
                        </Box>

                        {/* Bottom Row - Sales Stats */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                mt: 'auto',
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <ShoppingCartIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                    {totalSold} sold
                                </Typography>
                            </Box>
                            
                            {record.size && (
                                <Chip
                                    label={record.size}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                        fontSize: '0.75rem',
                                        height: 24,
                                        borderColor: 'primary.main',
                                        color: 'primary.main',
                                    }}
                                />
                            )}
                        </Box>
                    </CardContent>
                </Card>
            </Link>
        </m.div>
    );
};
