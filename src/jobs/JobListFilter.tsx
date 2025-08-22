/* eslint-disable import/no-anonymous-default-export */
import * as React from 'react';
import { Box } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import FlagIcon from '@mui/icons-material/Flag';
import {
    FilterList,
    FilterLiveSearch,
    FilterListItem,
    useGetIdentity,
} from 'react-admin';
import { startOfWeek, startOfMonth, endOfWeek, endOfMonth } from 'date-fns';

const JOB_STATUSES = [
    { id: 'Unscheduled', name: 'Unscheduled' },
    { id: 'Scheduled', name: 'Scheduled' },
    { id: 'In Progress', name: 'In Progress' },
    { id: 'Completed', name: 'Completed' },
    { id: 'Cancelled', name: 'Cancelled' },
];

export default function JobListFilter() {
    const { identity } = useGetIdentity();

    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());

    return (
        <Box width="13em" minWidth="13em" order={-1} mr={2} mt={5}>
            <FilterLiveSearch hiddenLabel placeholder="Search notes or ids" />

            <FilterList label="When" icon={<CalendarMonthIcon />}>
                <FilterListItem
                    label="This week"
                    value={{
                        'scheduled_at@gte': weekStart.toISOString(),
                        'scheduled_at@lte': weekEnd.toISOString(),
                    }}
                />
                <FilterListItem
                    label="This month"
                    value={{
                        'scheduled_at@gte': monthStart.toISOString(),
                        'scheduled_at@lte': monthEnd.toISOString(),
                    }}
                />
            </FilterList>

            <FilterList label="Status" icon={<FlagIcon />}>
                {JOB_STATUSES.map(s => (
                    <FilterListItem
                        key={s.id}
                        label={s.name}
                        value={{ status: s.id }}
                    />
                ))}
            </FilterList>

            <FilterList label="Assignee" icon={<SupervisorAccountIcon />}>
                <FilterListItem
                    label="Assigned to me"
                    value={{ assigned_to_id: identity?.id }}
                />
            </FilterList>
        </Box>
    );
}
