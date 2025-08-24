import {
    Box,
    Card,
    CardContent,
    Chip,
    Grid,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import * as React from 'react';
import { 
    useRecordContext, 
    ReferenceManyField,
    useListContext,
    TextField,
    DateField,
    Datagrid,
} from 'react-admin';
import { Contact } from '../types';

interface PropertyRecord {
    id: string;
    name: string;
    address?: string;
    city?: string;
    state?: string;
    zipcode?: string;
    notes?: string;
    created_at: string;
}

const PropertyCard = ({ record }: { record: PropertyRecord }) => {
    const theme = useTheme();
    
    const fullAddress = [record.address, record.city, record.state, record.zipcode]
        .filter(Boolean)
        .join(', ');

    return (
        <Card
            sx={{
                boxShadow: theme.shadows[2],
                '&:hover': {
                    boxShadow: theme.shadows[4],
                },
                transition: 'box-shadow 0.2s ease',
            }}
        >
            <CardContent sx={{ p: 2 }}>
                <Stack spacing={2}>
                    {/* Property Header */}
                    <Box>
                        <Typography
                            variant="h6"
                            fontWeight={600}
                            sx={{ color: '#0A2243' }}
                        >
                            {record.name}
                        </Typography>
                        {fullAddress && (
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={0.5}
                            >
                                <PlaceIcon
                                    fontSize="small"
                                    sx={{ color: 'text.secondary' }}
                                />
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {fullAddress}
                                </Typography>
                            </Stack>
                        )}
                    </Box>

                    {/* Property Notes */}
                    {record.notes && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                            }}
                        >
                            {record.notes}
                        </Typography>
                    )}

                    {/* Created Date */}
                    <Typography variant="caption" color="text.secondary">
                        Added: {new Date(record.created_at).toLocaleDateString()}
                    </Typography>
                </Stack>
            </CardContent>
        </Card>
    );
};

const PropertyGrid = () => {
    const { data: properties } = useListContext<PropertyRecord>();
    
    if (!properties || properties.length === 0) {
        return (
            <Card sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    No properties found for this contact.
                </Typography>
            </Card>
        );
    }

    return (
        <Grid container spacing={2}>
            {properties.map((property) => (
                <Grid item xs={12} md={6} key={property.id}>
                    <PropertyCard record={property} />
                </Grid>
            ))}
        </Grid>
    );
};

const PropertyDatagrid = () => {
    const theme = useTheme();
    
    return (
        <Datagrid
            rowClick="show"
            bulkActionButtons={false}
            sx={{
                '& .RaDatagrid-table': {
                    backgroundColor: 'white',
                },
                '& .RaDatagrid-headerRow': {
                    backgroundColor: '#0A2243',
                    '& .RaDatagrid-headerCell': {
                        color: 'white',
                        fontWeight: 600,
                    },
                },
                '& .RaDatagrid-row:hover': {
                    backgroundColor: '#f5f5f5',
                },
            }}
        >
            <TextField 
                source="name" 
                label="Property Name"
                sx={{ fontWeight: 500 }}
            />
            <TextField source="address" label="Address" />
            <TextField source="city" label="City" />
            <TextField source="state" label="State" />
            <DateField
                source="created_at"
                label="Added"
                showTime={false}
            />
        </Datagrid>
    );
};

export const PropertyManagementSection = () => {
    const record = useRecordContext<Contact>();
    const [viewMode, setViewMode] = React.useState<'grid' | 'table'>('grid');
    
    if (!record) return null;

    return (
        <Box sx={{ mb: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography
                    variant="h6"
                    sx={{
                        color: '#0A2243',
                        fontWeight: 700,
                        fontFamily: 'Montserrat',
                    }}
                >
                    Properties
                </Typography>
                
                <Stack direction="row" spacing={1}>
                    <Chip
                        label="Grid"
                        size="small"
                        onClick={() => setViewMode('grid')}
                        sx={{
                            backgroundColor: viewMode === 'grid' ? '#FCBB1C' : 'transparent',
                            color: viewMode === 'grid' ? '#0A2243' : '#757575',
                            cursor: 'pointer',
                            '&:hover': {
                                backgroundColor: viewMode === 'grid' ? '#E6A619' : '#f5f5f5',
                            },
                        }}
                    />
                    <Chip
                        label="Table"
                        size="small"
                        onClick={() => setViewMode('table')}
                        sx={{
                            backgroundColor: viewMode === 'table' ? '#FCBB1C' : 'transparent',
                            color: viewMode === 'table' ? '#0A2243' : '#757575',
                            cursor: 'pointer',
                            '&:hover': {
                                backgroundColor: viewMode === 'table' ? '#E6A619' : '#f5f5f5',
                            },
                        }}
                    />
                </Stack>
            </Stack>

            <ReferenceManyField
                reference="properties"
                target="contact_id"
                sort={{ field: 'created_at', order: 'DESC' }}
            >
                {viewMode === 'grid' ? <PropertyGrid /> : <PropertyDatagrid />}
            </ReferenceManyField>
        </Box>
    );
};
