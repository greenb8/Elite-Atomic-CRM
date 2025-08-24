import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Grid,
    Box,
    useTheme,
    useMediaQuery,
    CircularProgress,
    LinearProgress,
    Stack,
    Chip
} from '@mui/material';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    CheckCircle,
    AttachMoney,
    Schedule,
    Assessment
} from '@mui/icons-material';
import { useRecordContext, useDataProvider } from 'react-admin';
import { ContactDataService } from './contactDataService';
import { BusinessInsight, SeasonalRevenue, Contact } from '../types';

const iconMap = {
    'lifetime-value': AttachMoney,
    'projects-completed': CheckCircle,
    'avg-project-size': Assessment,
    'next-service': Schedule,
    'pending-tasks': TrendingUp
};

const MotionCard = motion(Card);

export const ContactBusinessInsights = () => {
    const record = useRecordContext<Contact>();
    const dataProvider = useDataProvider();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const [insights, setInsights] = useState<BusinessInsight[]>([]);
    const [seasonalRevenue, setSeasonalRevenue] = useState<SeasonalRevenue[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (record?.id) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const [insightsData, seasonalData] = await Promise.all([
                        ContactDataService.getBusinessInsights(record.id, dataProvider),
                        ContactDataService.getSeasonalRevenue(record.id, dataProvider)
                    ]);
                    setInsights(insightsData);
                    setSeasonalRevenue(seasonalData);
                } catch (error) {
                    console.error('Error fetching business insights:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [record?.id, dataProvider]);

    if (!record) return null;

    if (loading) {
        return (
            <Card sx={{ p: 3 }}>
                <Box display="flex" justifyContent="center">
                    <CircularProgress />
                </Box>
            </Card>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.3 }
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: theme.palette.primary.main }}>
                Business Intelligence
            </Typography>

            {/* Key Metrics Grid */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {insights.map((insight) => {
                    const IconComponent = iconMap[insight.id as keyof typeof iconMap] || Assessment;
                    return (
                        <Grid key={insight.id} xs={12} sm={6} md={4}>
                            <MotionCard
                                variants={cardVariants}
                                whileHover={{ 
                                    boxShadow: theme.shadows[8],
                                    transition: { duration: 0.2 }
                                }}
                                sx={{ 
                                    height: '100%',
                                    boxShadow: theme.shadows[4],
                                    background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`
                                }}
                            >
                                <CardContent sx={{ p: 2 }}>
                                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                                        <IconComponent 
                                            sx={{ 
                                                color: insight.color || theme.palette.primary.main,
                                                fontSize: 24
                                            }} 
                                        />
                                        {insight.trend && (
                                            <Chip
                                                label={insight.trendValue}
                                                size="small"
                                                color={insight.trend === 'up' ? 'success' : 'error'}
                                                sx={{ fontSize: '0.75rem' }}
                                            />
                                        )}
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                                        {insight.value}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {insight.label}
                                    </Typography>
                                </CardContent>
                            </MotionCard>
                        </Grid>
                    );
                })}
            </Grid>

            {/* Seasonal Revenue Chart */}
            {seasonalRevenue.length > 0 && (
                <MotionCard
                    variants={cardVariants}
                    whileHover={{ 
                        boxShadow: theme.shadows[8],
                        transition: { duration: 0.2 }
                    }}
                    sx={{ mt: 2, boxShadow: theme.shadows[4] }}
                >
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            Seasonal Revenue Distribution
                        </Typography>
                        <Grid container spacing={2}>
                            {seasonalRevenue.map((season) => (
                                <Grid key={season.season} xs={12} sm={6}>
                                    <Box>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                            <Typography variant="body2" fontWeight={500}>
                                                {season.season}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                ${season.revenue.toLocaleString()}
                                            </Typography>
                                        </Stack>
                                        <LinearProgress
                                            variant="determinate"
                                            value={season.percentage}
                                            sx={{
                                                height: 8,
                                                borderRadius: 4,
                                                backgroundColor: 'rgba(0,0,0,0.1)',
                                                '& .MuiLinearProgress-bar': {
                                                    backgroundColor: theme.palette.secondary.main,
                                                    borderRadius: 4
                                                }
                                            }}
                                        />
                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                            {season.percentage}% of total revenue
                                        </Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </CardContent>
                </MotionCard>
            )}
        </motion.div>
    );
};
