import { List, useDataProvider, useGetList, useNotify } from 'react-admin';
import { Box, Card, CardContent, Typography, useTheme } from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useCallback, useMemo } from 'react';

export default function JobList() {
    const theme = useTheme();
    const dataProvider = useDataProvider();
    const notify = useNotify();
    
    const { data: jobs, isLoading } = useGetList('jobs', {
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'scheduled_at', order: 'ASC' },
        filter: {},
    });

    // Transform jobs data to FullCalendar event format
    const events = useMemo(() => {
        if (!jobs) return [];
        
        return jobs.map(job => ({
            id: job.id,
            title: `Job #${job.id}`,
            start: job.scheduled_at,
            end: job.scheduled_at, // Could add duration in the future
            allDay: true,
            backgroundColor: getStatusColor(job.status, theme),
            borderColor: getStatusColor(job.status, theme),
            extendedProps: { job },
        }));
    }, [jobs, theme]);

    // Handle event drop (reschedule)
    const handleEventDrop = useCallback(
        (info) => {
            const { event } = info;
            const jobId = event.id;
            const newDate = event.start;
            
            dataProvider
                .update('jobs', {
                    id: jobId,
                    data: { scheduled_at: newDate.toISOString() },
                })
                .then(() => {
                    notify('Job rescheduled', { type: 'success' });
                })
                .catch((error) => {
                    notify(`Error: ${error.message}`, { type: 'error' });
                    info.revert();
                });
        },
        [dataProvider, notify]
    );

    // Handle event click (view job details)
    const handleEventClick = useCallback((info) => {
        window.location.href = `#/jobs/${info.event.id}/show`;
    }, []);

    return (
        <List 
            pagination={false} 
            exporter={false} 
            perPage={100}
            sx={{ 
                '& .RaList-main': { 
                    // Override React-Admin styles to give calendar more space
                    margin: 0,
                    width: '100%',
                    maxWidth: '100%'
                } 
            }}
        >
            <Box p={2}>
                {isLoading ? (
                    <Card sx={{ p: 2, boxShadow: theme.shadows[2] }}>
                        <Typography variant="body2">Loading calendar...</Typography>
                    </Card>
                ) : (
                    <Card sx={{ p: 2, boxShadow: theme.shadows[2] }}>
                        <Box sx={{ height: 'calc(100vh - 200px)', minHeight: '600px' }}>
                            <FullCalendar
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                initialView="dayGridMonth"
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                                }}
                                events={events}
                                editable={true}
                                droppable={true}
                                eventDrop={handleEventDrop}
                                eventClick={handleEventClick}
                                height="100%"
                                themeSystem="standard"
                            />
                        </Box>
                    </Card>
                )}
            </Box>
        </List>
    );
}

// Helper function to get color based on job status
function getStatusColor(status: string, theme: any) {
    switch (status) {
        case 'Unscheduled':
            return theme.palette.grey[500];
        case 'Scheduled':
            return theme.palette.info.main;
        case 'In Progress':
            return theme.palette.warning.main;
        case 'Completed':
            return theme.palette.success.main;
        case 'Cancelled':
            return theme.palette.error.main;
        default:
            return theme.palette.primary.main;
    }
}


