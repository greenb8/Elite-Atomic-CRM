import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    useTheme,
} from '@mui/material';
import { format } from 'date-fns';
import React, { useMemo } from 'react';
import { useRecordContext } from 'react-admin';

// Icons
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TaskIcon from '@mui/icons-material/Task';
import TimelineIcon from '@mui/icons-material/Timeline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

import { Contact } from '../types';

// Extended Contact interface to include the stats from our enhanced database view
interface ContactWithStats extends Contact {
    total_deals?: number;
    won_deals?: number;
    total_revenue?: number;
    pipeline_value?: number;
    total_properties?: number;
    total_notes?: number;
    customer_tenure_months?: number;
    days_since_last_seen?: number;
}

interface StatCardProps {
    icon: React.ReactElement;
    title: string;
    value: string | number;
    color?: 'primary' | 'secondary' | 'default';
}

const StatCard: React.FC<StatCardProps> = ({
    icon,
    title,
    value,
    color = 'default',
}) => {
    const theme = useTheme();

    const getColorStyle = () => {
        switch (color) {
            case 'primary':
                return {
                    borderLeft: `4px solid ${theme.palette.primary.main}`,
                    '& .stat-icon': { color: theme.palette.primary.main },
                };
            case 'secondary':
                return {
                    borderLeft: `4px solid ${theme.palette.secondary.main}`,
                    '& .stat-icon': { color: theme.palette.secondary.main },
                };
            default:
                return {
                    borderLeft: `4px solid ${theme.palette.grey[300]}`,
                    '& .stat-icon': { color: theme.palette.action.active },
                };
        }
    };

    return (
        <Card
            sx={{
                height: '100%',
                ...getColorStyle(),
                boxShadow: theme.shadows[1],
                '&:hover': {
                    boxShadow: theme.shadows[2],
                    transform: 'translateY(-1px)',
                },
                transition:
                    'box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out',
            }}
        >
            <CardContent sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" mb={1}>
                    <Box className="stat-icon" mr={1}>
                        {icon}
                    </Box>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                            fontFamily: 'Raleway',
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                        }}
                    >
                        {title}
                    </Typography>
                </Box>
                <Typography
                    variant="h6"
                    sx={{
                        fontFamily: 'Montserrat',
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                    }}
                >
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );
};

export const ContactStats: React.FC = () => {
    const record = useRecordContext<ContactWithStats>();
    const theme = useTheme();

    const stats = useMemo(() => {
        if (!record) return null;

        // Calculate customer tenure display
        let customerTenure = 'N/A';
        if (
            record.customer_tenure_months !== null &&
            record.customer_tenure_months !== undefined
        ) {
            const months = record.customer_tenure_months;
            if (months < 12) {
                customerTenure = `${months} mo${months !== 1 ? 's' : ''}`;
            } else {
                const years = Math.floor(months / 12);
                const remainingMonths = months % 12;
                if (remainingMonths === 0) {
                    customerTenure = `${years} yr${years !== 1 ? 's' : ''}`;
                } else {
                    customerTenure = `${years}y ${remainingMonths}m`;
                }
            }
        }

        // Calculate last seen display
        let lastSeenDisplay = 'Never';
        if (
            record.days_since_last_seen !== null &&
            record.days_since_last_seen !== undefined
        ) {
            const days = record.days_since_last_seen;
            if (days === 0) {
                lastSeenDisplay = 'Today';
            } else if (days === 1) {
                lastSeenDisplay = '1 day ago';
            } else if (days < 30) {
                lastSeenDisplay = `${days} days ago`;
            } else if (record.last_seen) {
                lastSeenDisplay = format(new Date(record.last_seen), 'MMM dd');
            }
        }

        return {
            totalDeals: record.total_deals || 0,
            totalRevenue: record.total_revenue || 0,
            totalProperties: record.total_properties || 0,
            openTasks: record.nb_tasks || 0,
            customerTenure,
            lastSeenDisplay,
        };
    }, [record]);

    if (!record || !stats) return null;

    return (
        <Box mb={3}>
            <Typography
                variant="subtitle2"
                sx={{
                    fontFamily: 'Montserrat',
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    mb: 2,
                }}
            >
                Customer Overview
            </Typography>

            <Grid container spacing={1.5}>
                <Grid item xs={6}>
                    <StatCard
                        icon={<TrendingUpIcon fontSize="small" />}
                        title="Total Deals"
                        value={stats.totalDeals}
                        color="primary"
                    />
                </Grid>

                <Grid item xs={6}>
                    <StatCard
                        icon={<AttachMoneyIcon fontSize="small" />}
                        title="Revenue"
                        value={new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                        }).format(stats.totalRevenue)}
                        color="secondary"
                    />
                </Grid>

                <Grid item xs={6}>
                    <StatCard
                        icon={<BusinessIcon fontSize="small" />}
                        title="Properties"
                        value={stats.totalProperties}
                    />
                </Grid>

                <Grid item xs={6}>
                    <StatCard
                        icon={<TaskIcon fontSize="small" />}
                        title="Open Tasks"
                        value={stats.openTasks}
                    />
                </Grid>

                <Grid item xs={6}>
                    <StatCard
                        icon={<CalendarTodayIcon fontSize="small" />}
                        title="Customer"
                        value={stats.customerTenure}
                    />
                </Grid>

                <Grid item xs={6}>
                    <StatCard
                        icon={<TimelineIcon fontSize="small" />}
                        title="Last Seen"
                        value={stats.lastSeenDisplay}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};
