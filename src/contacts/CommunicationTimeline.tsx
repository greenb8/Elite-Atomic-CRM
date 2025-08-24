import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Chip,
    Stack,
    Typography,
    useTheme,
    Avatar,
    Divider,
    IconButton,
    Tooltip,
    CircularProgress
} from '@mui/material';
import { motion } from 'framer-motion';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import MessageIcon from '@mui/icons-material/Message';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useRecordContext } from 'react-admin';
import { Contact } from '../types';

const MotionCard = motion(Card);
const MotionBox = motion(Box);

interface CommunicationEvent {
    id: string;
    type: 'call' | 'email' | 'meeting' | 'note';
    direction: 'inbound' | 'outbound';
    date: string;
    subject: string;
    content: string;
    duration?: number;
    priority: 'low' | 'medium' | 'high';
    status: 'completed' | 'pending' | 'scheduled';
    assignedTo: string;
    followUpRequired: boolean;
    followUpDate?: string;
}

export const CommunicationTimeline = () => {
    const record = useRecordContext<Contact>();
    const theme = useTheme();

    if (!record) return null;

    // Mock communication data
    const communications: CommunicationEvent[] = [
        {
            id: '1',
            type: 'call',
            direction: 'outbound',
            date: '2024-01-20T10:30:00Z',
            subject: 'Spring Service Planning',
            content: 'Discussed upcoming spring cleanup and new landscaping project. Client interested in adding irrigation system.',
            duration: 15,
            priority: 'high',
            status: 'completed',
            assignedTo: 'John Smith',
            followUpRequired: true,
            followUpDate: '2024-01-25'
        },
        {
            id: '2',
            type: 'email',
            direction: 'inbound',
            date: '2024-01-18T14:22:00Z',
            subject: 'Question about winter protection',
            content: 'Client asking about protecting rose bushes during upcoming freeze. Provided detailed instructions and scheduled follow-up.',
            priority: 'medium',
            status: 'completed',
            assignedTo: 'Sarah Johnson',
            followUpRequired: false
        },
        {
            id: '3',
            type: 'meeting',
            direction: 'outbound',
            date: '2024-01-15T09:00:00Z',
            subject: 'Property Assessment',
            content: 'On-site consultation for backyard renovation project. Measured areas and discussed plant selections.',
            duration: 60,
            priority: 'high',
            status: 'completed',
            assignedTo: 'Mike Davis',
            followUpRequired: true,
            followUpDate: '2024-01-22'
        },
        {
            id: '4',
            type: 'call',
            direction: 'outbound',
            date: '2024-01-25T11:00:00Z',
            subject: 'Follow-up on irrigation quote',
            content: 'Schedule follow-up call to discuss irrigation system proposal.',
            priority: 'medium',
            status: 'scheduled',
            assignedTo: 'John Smith',
            followUpRequired: false
        }
    ];

    const getTypeIcon = (type: CommunicationEvent['type']) => {
        switch (type) {
            case 'call': return <PhoneIcon fontSize="small" />;
            case 'email': return <EmailIcon fontSize="small" />;
            case 'meeting': return <EventIcon fontSize="small" />;
            case 'note': return <MessageIcon fontSize="small" />;
            default: return <MessageIcon fontSize="small" />;
        }
    };

    const getTypeColor = (type: CommunicationEvent['type']) => {
        switch (type) {
            case 'call': return '#4CAF50';
            case 'email': return '#2196F3';
            case 'meeting': return '#FF9800';
            case 'note': return '#9C27B0';
            default: return '#757575';
        }
    };

    const getPriorityColor = (priority: CommunicationEvent['priority']) => {
        switch (priority) {
            case 'high': return '#F44336';
            case 'medium': return '#FF9800';
            case 'low': return '#4CAF50';
            default: return '#757575';
        }
    };

    const getStatusColor = (status: CommunicationEvent['status']) => {
        switch (status) {
            case 'completed': return '#4CAF50';
            case 'pending': return '#FF9800';
            case 'scheduled': return '#2196F3';
            default: return '#757575';
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { 
            opacity: 1, 
            x: 0,
            transition: { duration: 0.3, ease: "easeOut" }
        }
    };

    return (
        <MotionCard
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ 
                boxShadow: theme.shadows[8],
                transition: { duration: 0.2 }
            }}
            sx={{
                mb: 3,
                boxShadow: theme.shadows[4]
            }}
        >
            <CardContent>
                <Typography 
                    variant="h6" 
                    sx={{ 
                        color: '#0A2243', 
                        fontWeight: 700, 
                        mb: 2,
                        fontFamily: 'Montserrat'
                    }}
                >
                    Communication Timeline
                </Typography>

                <Stack spacing={2}>
                    {communications.map((comm, index) => (
                        <MotionBox
                            key={comm.id}
                            variants={itemVariants}
                            whileHover={{ 
                                x: 4,
                                transition: { duration: 0.15 }
                            }}
                        >
                            <Card 
                                variant="outlined" 
                                sx={{ 
                                    borderLeft: `4px solid ${getTypeColor(comm.type)}`,
                                    '&:hover': {
                                        boxShadow: theme.shadows[2],
                                        backgroundColor: 'rgba(0,0,0,0.02)'
                                    },
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <CardContent sx={{ p: 2 }}>
                                    <Stack spacing={1}>
                                        {/* Header */}
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Avatar
                                                    sx={{
                                                        backgroundColor: getTypeColor(comm.type),
                                                        width: 32,
                                                        height: 32
                                                    }}
                                                >
                                                    {getTypeIcon(comm.type)}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        {comm.subject}
                                                    </Typography>
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {new Date(comm.date).toLocaleDateString()} at{' '}
                                                            {new Date(comm.date).toLocaleTimeString([], { 
                                                                hour: '2-digit', 
                                                                minute: '2-digit' 
                                                            })}
                                                        </Typography>
                                                        {comm.duration && (
                                                            <Chip
                                                                icon={<AccessTimeIcon />}
                                                                label={`${comm.duration}min`}
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{ height: 20 }}
                                                            />
                                                        )}
                                                    </Stack>
                                                </Box>
                                            </Stack>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Chip
                                                    label={comm.priority}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: `${getPriorityColor(comm.priority)}15`,
                                                        color: getPriorityColor(comm.priority),
                                                        textTransform: 'capitalize'
                                                    }}
                                                />
                                                <Chip
                                                    label={comm.status}
                                                    size="small"
                                                    icon={comm.status === 'completed' ? <CheckCircleIcon /> : undefined}
                                                    sx={{
                                                        backgroundColor: `${getStatusColor(comm.status)}15`,
                                                        color: getStatusColor(comm.status),
                                                        textTransform: 'capitalize'
                                                    }}
                                                />
                                            </Stack>
                                        </Stack>

                                        {/* Content */}
                                        <Typography variant="body2" sx={{ ml: 5 }}>
                                            {comm.content}
                                        </Typography>

                                        {/* Footer */}
                                        <Stack 
                                            direction="row" 
                                            justifyContent="space-between" 
                                            alignItems="center"
                                            sx={{ ml: 5 }}
                                        >
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <PersonIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                                <Typography variant="caption" color="text.secondary">
                                                    {comm.assignedTo}
                                                </Typography>
                                            </Stack>
                                            
                                            {comm.followUpRequired && (
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <Tooltip title="Follow-up required">
                                                        <PriorityHighIcon 
                                                            fontSize="small" 
                                                            sx={{ color: '#FF9800' }} 
                                                        />
                                                    </Tooltip>
                                                    {comm.followUpDate && (
                                                        <Typography variant="caption" sx={{ color: '#FF9800' }}>
                                                            Follow-up: {new Date(comm.followUpDate).toLocaleDateString()}
                                                        </Typography>
                                                    )}
                                                </Stack>
                                            )}
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>
                            {index < communications.length - 1 && (
                                <Divider sx={{ my: 1, opacity: 0.3 }} />
                            )}
                        </MotionBox>
                    ))}
                </Stack>
            </CardContent>
        </MotionCard>
    );
};
