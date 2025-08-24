import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import * as React from 'react';
import { useDataProvider, useNotify, useRefresh, useUpdate } from 'react-admin';
import { Deal } from '../types';

export type LineItem = {
    id?: number;
    product_id?: number | null;
    name: string;
    description?: string | null;
    sku?: string | null;
    price: number;
    cost?: number | null;
    quantity: number;
};

export const DealLineItems = ({
    deal,
    open,
    onClose,
}: {
    deal: Deal;
    open: boolean;
    onClose: () => void;
}) => {
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const refresh = useRefresh();
    const [update] = useUpdate();

    const [items, setItems] = React.useState<LineItem[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [search, setSearch] = React.useState('');
    const [suggestions, setSuggestions] = React.useState<any[]>([]);

    React.useEffect(() => {
        if (open) {
            setLoading(true);
            dataProvider
                .getList('deal_line_items', {
                    pagination: { page: 1, perPage: 1000 },
                    sort: { field: 'id', order: 'ASC' },
                    filter: { deal_id_eq: deal.id },
                })
                .then(({ data }) => {
                    setItems(data);
                    setLoading(false);
                })
                .catch(() => {
                    notify('Error loading line items', { type: 'error' });
                    setLoading(false);
                });
        }
    }, [open, deal.id, dataProvider, notify]);

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
            const { data: p } = await dataProvider.getOne('products', {
                id: productId,
            });
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
                const { data } = await dataProvider.getList('products', {
                    pagination: { page: 1, perPage: 5 },
                    sort: { field: 'name', order: 'ASC' },
                    filter: { 'name@ilike': q },
                });
                setSuggestions(data);
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

    const handleSave = async () => {
        try {
            // Simple strategy: delete all existing and recreate
            const existing = await dataProvider.getList('deal_line_items', {
                pagination: { page: 1, perPage: 1000 },
                sort: { field: 'id', order: 'ASC' },
                filter: { deal_id_eq: deal.id },
            });
            await Promise.all(
                existing.data.map(it =>
                    dataProvider.delete('deal_line_items', { id: it.id })
                )
            );

            // Create new items
            await Promise.all(
                items.map(it =>
                    dataProvider.create('deal_line_items', {
                        data: {
                            deal_id: deal.id,
                            product_id: it.product_id ?? null,
                            name: it.name,
                            description: it.description ?? null,
                            sku: it.sku ?? null,
                            price: it.price,
                            cost: it.cost ?? null,
                            quantity: it.quantity,
                        },
                    })
                )
            );

            // Update deal amount
            update('deals', {
                id: deal.id,
                data: { amount: total },
                previousData: deal,
            });

            notify('Proposal updated successfully');
            refresh();
            onClose();
        } catch (e) {
            notify('Error saving line items', { type: 'error' });
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Edit Proposal for {deal.name}</DialogTitle>
            <DialogContent>
                <Stack gap={2} mt={2}>
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
                                                ? {
                                                      ...it,
                                                      name: e.target.value,
                                                  }
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
                                        onClick={() =>
                                            handlePickProduct(index, s.id)
                                        }
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
                                                      price: Number(
                                                          e.target.value
                                                      ),
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
                                                      quantity: Number(
                                                          e.target.value
                                                      ),
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
                            <IconButton
                                size="small"
                                onClick={() => removeAt(index)}
                            >
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
            </DialogContent>
            <DialogActions>
                <IconButton size="small" onClick={addEmpty} sx={{ mr: 'auto' }}>
                    <AddIcon fontSize="small" />
                </IconButton>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained">
                    Save Proposal
                </Button>
            </DialogActions>
        </Dialog>
    );
};
