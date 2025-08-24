import { Box, Typography } from '@mui/material';
import { useListContext } from 'react-admin';

export const Empty = () => {
    const { isPending, filterValues, data } = useListContext();

    if (isPending || (data && data.length > 0)) return null;

    const hasFilters = Object.keys(filterValues).length > 0;

    return (
        <Box textAlign="center" m={4}>
            <img
                src="/img/empty.svg"
                alt="No results"
                style={{ width: '150px', height: '150px', opacity: 0.5 }}
            />
            <Typography variant="h6" paragraph>
                {hasFilters ? 'No results found' : 'No products yet'}
            </Typography>
            <Typography variant="body2">
                {hasFilters
                    ? 'Try adjusting your filters'
                    : 'Create the first product to get started'}
            </Typography>
        </Box>
    );
};
