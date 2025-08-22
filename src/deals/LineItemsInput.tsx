import * as React from 'react';
import {
    Box,
    IconButton,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useDataProvider, useNotify } from 'react-admin';

export type LineItem = {
    product_id?: number | null;
    name: string;
    description?: string | null;
    sku?: string | null;
    price: number;
    cost?: number | null;
    quantity: number;
};

export const LineItemsInput = () => {
    const notify = useNotify();
    const dataProvider = useDataProvider();
    const [items, setItems] = React.useState<LineItem[]>([]);
    const [search, setSearch] = React.useState('');
    const [suggestions, setSuggestions] = React.useState<any[]>([]);

    const total = items.reduce(
        (sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 0),
        0
    );

    const addEmpty = () =>
        setItems(prev => [...prev, { name: '', price: 0, quantity: 1 }]);
    const removeAt = (index: number) =>
        setItems(prev => prev.filter((_, i) => i !== index));

    const handlePickProduct = async (index: number, productId: number) => {
        try {
            const product = await dataProvider.getOne('products', {
                id: productId,
            });
            const p = product.data as any;
            setItems(prev =>
                prev.map((it, i) =>
                    i === index
                        ? {
                              ...it,
                              product_id: p.id,
                              name: p.name,
                              sku: p.sku,
                              description: p.description,
                              price: Number(p.price) || 0,
                              cost: Number(p.cost) || 0,
                          }
                        : it
                )
            );
        } catch (e) {
            notify('Failed to load product', { type: 'error' });
        }
    };

    const searchProducts = React.useCallback(
        async (q: string) => {
            try {
                const res = await dataProvider.getList('products', {
                    pagination: { page: 1, perPage: 5 },
                    sort: { field: 'name', order: 'ASC' },
                    filter: { 'name@ilike': q },
                });
                setSuggestions(res.data as any[]);
            } catch {
                setSuggestions([]);
            }
        },
        [dataProvider]
    );

    React.useEffect(() => {
        const id = setTimeout(() => {
            if (search && search.length >= 2) {
                searchProducts(`%${search}%`);
            } else {
                setSuggestions([]);
            }
        }, 250);
        return () => clearTimeout(id);
    }, [search, searchProducts]);

    // expose computed values to parent form logic
    (globalThis as any).__LINE_ITEMS_TOTAL__ = total;
    (globalThis as any).__LINE_ITEMS_ITEMS__ = items;

    return (
        <Stack gap={2}>
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
            >
                <Typography variant="subtitle1">Line Items</Typography>
                <IconButton size="small" onClick={addEmpty}>
                    <AddIcon fontSize="small" />
                </IconButton>
            </Stack>
            {items.map((item, index) => (
                <Box
                    key={index}
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
                        gap: 1,
                    }}
                >
                    <TextField
                        label="Product or Name"
                        value={item.name}
                        onChange={e => {
                            setItems(prev =>
                                prev.map((it, i) =>
                                    i === index
                                        ? { ...it, name: e.target.value }
                                        : it
                                )
                            );
                            setSearch(e.target.value);
                        }}
                        size="small"
                        select={suggestions.length > 0}
                        SelectProps={{
                            native: false,
                        }}
                    >
                        {suggestions.map(s => (
                            <MenuItem
                                key={s.id}
                                value={s.name}
                                onClick={() => handlePickProduct(index, s.id)}
                            >
                                {s.name}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="Price"
                        type="number"
                        value={item.price}
                        onChange={e =>
                            setItems(prev =>
                                prev.map((it, i) =>
                                    i === index
                                        ? {
                                              ...it,
                                              price: Number(e.target.value),
                                          }
                                        : it
                                )
                            )
                        }
                        size="small"
                    />
                    <TextField
                        label="Qty"
                        type="number"
                        value={item.quantity}
                        onChange={e =>
                            setItems(prev =>
                                prev.map((it, i) =>
                                    i === index
                                        ? {
                                              ...it,
                                              quantity: Number(e.target.value),
                                          }
                                        : it
                                )
                            )
                        }
                        size="small"
                    />
                    <TextField
                        label="SKU"
                        value={item.sku || ''}
                        onChange={e =>
                            setItems(prev =>
                                prev.map((it, i) =>
                                    i === index
                                        ? { ...it, sku: e.target.value }
                                        : it
                                )
                            )
                        }
                        size="small"
                    />
                    <IconButton size="small" onClick={() => removeAt(index)}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Box>
            ))}
            <Box sx={{ textAlign: 'right', mt: 1 }}>
                <Typography variant="subtitle2">
                    Subtotal:{' '}
                    {total.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                    })}
                </Typography>
            </Box>
        </Stack>
    );
};
