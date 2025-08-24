import * as React from 'react';
import {
    Box,
    Card,
    Typography,
} from '@mui/material';
import {
    RecordContextProvider,
    useListContext,
} from 'react-admin';

import { Product } from '../types';
import { ProductCard } from './ProductCard';

const times = (nbChildren: number, fn: (key: number) => any) =>
    Array.from({ length: nbChildren }, (_, key) => fn(key));

const LoadingGridList = () => (
    <Box 
        width="100%"
        display="grid"
        gap={3}
        gridTemplateColumns={{
            xs: 'repeat(auto-fill, minmax(280px, 1fr))',
            sm: 'repeat(auto-fill, minmax(300px, 1fr))',
            md: 'repeat(auto-fill, minmax(320px, 1fr))',
            lg: 'repeat(auto-fill, minmax(340px, 1fr))',
        }}
        sx={{
            px: { xs: 1, sm: 2 },
            py: 2,
        }}
    >
        {times(12, key => (
            <Card 
                key={key} 
                sx={{ 
                    height: 360, 
                    backgroundColor: 'grey.100',
                    borderRadius: 3,
                    animation: 'pulse 1.5s ease-in-out infinite',
                    '@keyframes pulse': {
                        '0%': { opacity: 1 },
                        '50%': { opacity: 0.7 },
                        '100%': { opacity: 1 },
                    }
                }} 
            />
        ))}
    </Box>
);

const LoadedGridList = () => {
    const { data, isPending, error } = useListContext<Product>();
    if (isPending || error) return null;
    return (
        <Box
            width="100%"
            display="grid"
            gap={3}
            gridTemplateColumns={{
                xs: 'repeat(auto-fill, minmax(280px, 1fr))',
                sm: 'repeat(auto-fill, minmax(300px, 1fr))',
                md: 'repeat(auto-fill, minmax(320px, 1fr))',
                lg: 'repeat(auto-fill, minmax(340px, 1fr))',
            }}
            sx={{
                px: { xs: 1, sm: 2 },
                py: 2,
            }}
        >
            {data.map(record => (
                <RecordContextProvider key={record.id} value={record}>
                    <ProductCard />
                </RecordContextProvider>
            ))}
            {data.length === 0 ? (
                <Box 
                    sx={{ 
                        gridColumn: '1 / -1',
                        textAlign: 'center',
                        py: 8,
                        color: 'text.secondary'
                    }}
                >
                    <Typography variant="h6" gutterBottom>
                        No products found
                    </Typography>
                    <Typography variant="body2">
                        Try adjusting your search or filters
                    </Typography>
                </Box>
            ) : null}
        </Box>
    );
};

export const ProductGrid = () => {
    const { isPending } = useListContext<Product>();
    return isPending ? <LoadingGridList /> : <LoadedGridList />;
};
