import type { EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import '../fullcalendar.css';
import { Box, Card, Typography, useTheme } from '@mui/material';
import { useCallback, useMemo } from 'react';
import { List, useDataProvider, useGetList, useNotify } from 'react-admin';
import JobListFilter from './JobListFilter';

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
        console.log('Jobs data loaded:', jobs);
        return (jobs as any[]).map(job => ({
            id: job.id,
            title: `Job #${job.id}`,
            start: job.scheduled_at,
            end: job.scheduled_at,
            allDay: true,
            backgroundColor: getStatusColor(job.status, theme),
            borderColor: getStatusColor(job.status, theme),
            extendedProps: { job },
        }));
    }, [jobs, theme]);

    // Handle event drop (reschedule)
    const handleEventDrop = useCallback(
        (info: { event: any; revert: () => void }) => {
            const { event } = info;
            const jobId = event.id;
            const newDate = event.start;
            const previousData = Array.isArray(jobs)
                ? (jobs as any[]).find(j => String(j.id) === String(jobId))
                : undefined;

            if (!newDate) {
                info.revert();
                return;
            }

            dataProvider
                .update('jobs', {
                    id: jobId,
                    data: { scheduled_at: newDate.toISOString() },
                    previousData,
                } as any)
                .then(() => {
                    notify('Job rescheduled', { type: 'success' });
                })
                .catch(error => {
                    notify(`Error: ${error.message}`, { type: 'error' });
                    info.revert();
                });
        },
        [dataProvider, notify, jobs]
    );

    // Handle event click (view job details)
    const handleEventClick = useCallback((info: EventClickArg) => {
        window.location.href = `#/jobs/${info.event.id}/show`;
    }, []);

    // Debug message
    console.log(
        'JobList rendering, isLoading:',
        isLoading,
        'has jobs:',
        Boolean(jobs?.length)
    );

    return (
        <List
            pagination={false}
            exporter={false}
            perPage={100}
            aside={<JobListFilter />}
            sx={{
                '& .RaList-main': {
                    margin: 0,
                    width: '100%',
                    maxWidth: '100%',
                },
            }}
        >
            <Box p={2}>
                {isLoading ? (
                    <Card sx={{ p: 2, boxShadow: theme.shadows[2] }}>
                        <Typography variant="body2">
                            Loading calendar...
                        </Typography>
                    </Card>
                ) : (
                    <Card sx={{ p: 2, boxShadow: theme.shadows[2] }}>
                        <Box
                            sx={{
                                height: 'calc(100vh - 200px)',
                                minHeight: '600px',
                            }}
                        >
                            {events && events.length > 0 ? (
                                <Typography variant="body2" sx={{ mb: 2 }}>
                                    Calendar showing {events.length} jobs
                                </Typography>
                            ) : (
                                <Typography variant="body2" sx={{ mb: 2 }}>
                                    No jobs to display. Create a job to see it
                                    in the calendar.
                                </Typography>
                            )}

                            <FullCalendar
                                plugins={[
                                    dayGridPlugin,
                                    timeGridPlugin,
                                    interactionPlugin,
                                ]}
                                initialView="dayGridMonth"
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth,timeGridWeek,timeGridDay',
                                }}
                                events={events}
                                editable={true}
                                droppable={true}
                                eventDrop={handleEventDrop}
                                eventClick={handleEventClick}
                                height="100%"
                                themeSystem="standard"
                                eventDidMount={arg => {
                                    const job = (arg.event.extendedProps as any)
                                        .job;
                                    arg.el.title =
                                        `Job #${arg.event.id}` +
                                        (job?.status ? ` • ${job.status}` : '');
                                }}
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
