import React, { useState } from 'react';
import {
    Button,
    Card,
    CardContent,
    Grid,
    Typography,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { motion } from 'framer-motion';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import MessageIcon from '@mui/icons-material/Message';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useRecordContext } from 'react-admin';
import { Contact } from '../types';

const MotionCard = motion(Card);
const MotionButton = motion(Button);

interface QuickActionItem {
    id: string;
    label: string;
    icon: React.ComponentType;
    color: string;
    action: () => void;
    description: string;
}

export const QuickActionsPanel = () => {
    const record = useRecordContext<Contact>();
    const [isExpanded, setIsExpanded] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    if (!record) return null;

    const quickActions: QuickActionItem[] = [
        {
            id: 'schedule',
            label: 'Schedule Service',
            icon: CalendarTodayIcon,
            color: '#4CAF50',
            action: () => console.log('Schedule service for:', record.id),
            description: 'Book next maintenance or service appointment',
        },
        {
            id: 'quote',
            label: 'Generate Quote',
            icon: RequestQuoteIcon,
            color: '#FCBB1C',
            action: () => console.log('Generate quote for:', record.id),
            description: 'Create proposal for new services',
        },
        {
            id: 'message',
            label: 'Send Message',
            icon: MessageIcon,
            color: '#2196F3',
            action: () => console.log('Send message to:', record.id),
            description: 'Quick communication with client',
        },
        {
            id: 'invoice',
            label: 'Create Invoice',
            icon: ReceiptIcon,
            color: '#FF9800',
            action: () => console.log('Create invoice for:', record.id),
            description: 'Bill for completed services',
        },
    ];

    const visibleActions = isExpanded ? quickActions : quickActions.slice(0, 4);

    return (
        <MotionCard
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            sx={{
                position: 'sticky',
                top: 16,
                zIndex: 1000,
                mb: 3,
                boxShadow: theme.shadows[8],
                borderRadius: 2,
            }}
        >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography
                    variant="h6"
                    sx={{
                        color: '#0A2243',
                        fontWeight: 700,
                        mb: 2,
                        fontFamily: 'Montserrat',
                    }}
                >
                    Quick Actions
                </Typography>

                <Grid container spacing={2}>
                    {visibleActions.map(action => {
                        const IconComponent = action.icon;
                        return (
                            <Grid key={action.id} xs={12} sm={6} md={4}>
                                <MotionButton
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<IconComponent />}
                                    onClick={action.action}
                                    sx={{
                                        height: 56,
                                        borderColor: action.color,
                                        color: action.color,
                                        '&:hover': {
                                            backgroundColor: `${action.color}15`,
                                            borderColor: action.color,
                                            transform: 'translateY(-2px)',
                                            boxShadow: theme.shadows[4],
                                        },
                                        transition: 'all 0.2s ease-in-out',
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        fontWeight={600}
                                        sx={{
                                            display: {
                                                xs: 'none',
                                                sm: 'block',
                                            },
                                        }}
                                    >
                                        {action.label}
                                    </Typography>
                                </MotionButton>
                            </Grid>
                        );
                    })}

                    {quickActions.length > 4 && (
                        <Grid xs={12} sm={6} md={4}>
                            <Button
                                fullWidth
                                variant="text"
                                onClick={() => setIsExpanded(!isExpanded)}
                                sx={{
                                    height: 56,
                                    color: '#FCBB1C',
                                    '&:hover': {
                                        backgroundColor: '#FCBB1C15',
                                    },
                                }}
                            >
                                {isExpanded ? 'Show Less' : 'Show More'}
                            </Button>
                        </Grid>
                    )}
                </Grid>
            </CardContent>
        </MotionCard>
    );
};
