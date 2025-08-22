import * as React from 'react';
import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    Typography,
} from '@mui/material';
import {
    RecordContextProvider,
    useListContext,
    useRedirect,
    useRecordContext,
} from 'react-admin';

export type Product = {
    id: number;
    name: string;
    description?: string | null;
    price?: number | null;
    photos_paths?: string[] | null;
};

const times = (nbChildren: number, fn: (key: number) => any) =>
    Array.from({ length: nbChildren }, (_, key) => fn(key));

const LoadingGridList = () => (
    <Box display="flex" flexWrap="wrap" width="100%" gap={2}>
        {times(12, key => (
            <Card key={key} sx={{ width: 220, height: 220 }} />
        ))}
    </Box>
);

const ProductCard = () => {
    const redirect = useRedirect();
    const record = useRecordContext<Product>();
    if (!record) return null;
    const firstPhoto =
        Array.isArray(record.photos_paths) && record.photos_paths.length > 0
            ? record.photos_paths[0]
            : undefined;
    return (
        <Card sx={{ width: 220 }}>
            <CardActionArea
                onClick={() => redirect('show', 'products', record.id)}
            >
                {firstPhoto ? (
                    <CardMedia
                        component="img"
                        height="140"
                        image={firstPhoto}
                        alt={record.name}
                    />
                ) : (
                    <Box
                        sx={{
                            height: 140,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'action.hover',
                        }}
                    >
                        <Typography variant="caption" color="text.secondary">
                            No image
                        </Typography>
                    </Box>
                )}
                <CardContent>
                    <Typography variant="subtitle2" noWrap>
                        {record.name}
                    </Typography>
                    {record.price != null ? (
                        <Typography variant="body2" color="text.secondary">
                            {Number(record.price).toLocaleString('en-US', {
                                style: 'currency',
                                currency: 'USD',
                            })}
                        </Typography>
                    ) : null}
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

const LoadedGridList = () => {
    const { data, isPending, error } = useListContext<Product>();
    if (isPending || error) return null;
    return (
        <Box
            width="100%"
            display="grid"
            gap={2}
            gridTemplateColumns="repeat(auto-fill, minmax(220px, 1fr))"
        >
            {data.map(record => (
                <RecordContextProvider key={record.id} value={record}>
                    <ProductCard />
                </RecordContextProvider>
            ))}
            {data.length === 0 ? (
                <Typography p={2}>No products found</Typography>
            ) : null}
        </Box>
    );
};

export const ProductGrid = () => {
    const { isPending } = useListContext<Product>();
    return isPending ? <LoadingGridList /> : <LoadedGridList />;
};
