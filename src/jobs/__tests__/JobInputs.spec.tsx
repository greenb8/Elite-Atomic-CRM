/* @vitest-environment jsdom */
import { render, screen } from '@testing-library/react';
import { AdminContext, ResourceContextProvider } from 'react-admin';
import { testDataProvider } from 'ra-core';
import { i18nProvider } from '../../root/i18nProvider';
import JobInputs from '../JobInputs';

describe('JobInputs', () => {
    it('renders core inputs', () => {
        render(
            <AdminContext
                i18nProvider={i18nProvider}
                dataProvider={testDataProvider({
                    getList: () => Promise.resolve({ data: [], total: 0 }),
                })}
            >
                <ResourceContextProvider value="jobs">
                    <JobInputs />
                </ResourceContextProvider>
            </AdminContext>
        );

        expect(screen.getByLabelText(/Deal/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Property/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Assigned To/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/scheduled/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
    });
});
