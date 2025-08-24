/* @vitest-environment jsdom */
import { render, screen } from '@testing-library/react';
import { AdminContext } from 'react-admin';
import { testDataProvider } from 'ra-core';
import { vi } from 'vitest';
import { i18nProvider } from '../../root/i18nProvider';
import JobList from '../JobList';

// Minimal mock for FullCalendar since it relies on DOM APIs not present in jsdom
vi.mock('@fullcalendar/react', () => ({
    default: ({ events }: { events: any[] }) => (
        <div data-testid="calendar-mock">{events?.length || 0}</div>
    ),
}));
vi.mock('@fullcalendar/daygrid', () => ({ default: {} }));
vi.mock('@fullcalendar/timegrid', () => ({ default: {} }));
vi.mock('@fullcalendar/interaction', () => ({ default: {} }));

describe('JobList calendar mapping', () => {
    it('renders calendar container', async () => {
        render(
            <AdminContext
                i18nProvider={i18nProvider}
                dataProvider={testDataProvider({
                    getList: () => Promise.resolve({ data: [], total: 0 }),
                })}
            >
                <JobList />
            </AdminContext>
        );

        // Calendar placeholder should render
        expect(await screen.findByTestId('calendar-mock')).toBeInTheDocument();
    });
});
