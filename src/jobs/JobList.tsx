import { List, useGetList } from 'react-admin';
import { Box, Card, CardContent, Typography } from '@mui/material';

export default function JobList() {
    // Basic list wrapper to keep consistent with RA layout; Calendar view can replace this later
    const { data: jobs, isLoading } = useGetList('jobs', {
        pagination: { page: 1, perPage: 50 },
        sort: { field: 'scheduled_at', order: 'ASC' },
        filter: {},
    });

    return (
        <List pagination={false} exporter={false} perPage={50}>
            <Box p={2} display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={2}>
                {isLoading ? (
                    <Typography variant="body2">Loading…</Typography>
                ) : (
                    jobs?.map(job => (
                        <Card key={job.id} sx={{ boxShadow: theme => theme.shadows[2] }}>
                            <CardContent>
                                <Typography variant="subtitle1">Job #{job.id}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Status: {job.status}
                                </Typography>
                                {job.scheduled_at ? (
                                    <Typography variant="body2" color="text.secondary">
                                        Scheduled: {new Date(job.scheduled_at).toLocaleString()}
                                    </Typography>
                                ) : null}
                            </CardContent>
                        </Card>
                    ))
                )}
            </Box>
        </List>
    );
}


