import { createTheme } from '@mui/material/styles';
import { CRM } from './root/CRM';

/**
 * Application entry point
 *
 * Customize Atomic CRM by passing props to the CRM component:
 *  - contactGender
 *  - companySectors
 *  - darkTheme
 *  - dealCategories
 *  - dealPipelineStatuses
 *  - dealStages
 *  - lightTheme
 *  - logo
 *  - noteStatuses
 *  - taskTypes
 *  - title
 * ... as well as all the props accepted by react-admin's <Admin> component.
 */

// Elite Landscaping Brand Theme
const eliteTheme = createTheme({
    palette: {
        primary: { 
            main: '#0A2243', // Elite Navy
            contrastText: '#FFFFFF' 
        },
        secondary: { 
            main: '#FCBB1C', // Action Gold
            contrastText: '#0A2243' 
        },
        background: { 
            default: '#FAFAFB', 
            paper: '#FFFFFF' 
        },
        text: { 
            primary: '#212121', 
            secondary: '#757575' 
        },
        success: {
            main: '#4CAF50',
            light: '#E8F5E8',
            dark: '#2E7D32',
        },
        warning: {
            main: '#FF9800',
            light: '#FFF3E0',
            dark: '#F57C00',
        },
        error: {
            main: '#F44336',
            light: '#FFEBEE',
            dark: '#D32F2F',
        },
    },
    typography: {
        fontFamily: 'Raleway, Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        h1: { fontFamily: 'Montserrat', fontWeight: 700 },
        h2: { fontFamily: 'Montserrat', fontWeight: 700 },
        h3: { fontFamily: 'Montserrat', fontWeight: 600 },
        h4: { fontFamily: 'Montserrat', fontWeight: 600 },
        h5: { fontFamily: 'Montserrat', fontWeight: 500 },
        h6: { fontFamily: 'Montserrat', fontWeight: 500 },
        button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: { borderRadius: 12 },
    components: {
        MuiButton: {
            styleOverrides: {
                root: { 
                    borderRadius: 8,
                    textTransform: 'none',
                    fontWeight: 600,
                },
                containedPrimary: { 
                    boxShadow: '0 4px 12px rgba(10, 34, 67, 0.24)',
                    '&:hover': {
                        boxShadow: '0 6px 16px rgba(10, 34, 67, 0.32)',
                        transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease',
                },
                containedSecondary: {
                    boxShadow: '0 4px 12px rgba(252, 187, 28, 0.24)',
                    '&:hover': {
                        boxShadow: '0 6px 16px rgba(252, 187, 28, 0.32)',
                        transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease',
                },
            },
        },
        MuiPaper: { 
            styleOverrides: { 
                root: {
                    borderRadius: 12,
                },
                elevation1: { 
                    boxShadow: '0 4px 12px rgba(10, 34, 67, 0.08)' 
                },
                elevation2: { 
                    boxShadow: '0 6px 16px rgba(10, 34, 67, 0.12)' 
                },
                elevation3: { 
                    boxShadow: '0 8px 24px rgba(10, 34, 67, 0.16)' 
                },
            } 
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 4px 12px rgba(10, 34, 67, 0.08)',
                    '&:hover': {
                        boxShadow: '0 8px 24px rgba(10, 34, 67, 0.16)',
                    },
                    transition: 'box-shadow 0.2s ease',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontWeight: 500,
                },
            },
        },
    },
});

const App = () => (
    <CRM 
        title="Elite Atomic CRM"
        lightTheme={eliteTheme}
        darkTheme={eliteTheme}
        dealStages={[
            { value: 'inquiry', label: 'Inquiry' },
            { value: 'estimate-sent', label: 'Estimate Sent' },
            { value: 'job-won', label: 'Job Won' },
            { value: 'in-progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' },
            { value: 'billed', label: 'Billed' },
            { value: 'lost', label: 'Lost' },
        ]}
        dealCategories={[
            'Lawn Maintenance',
            'Landscape Design', 
            'Hardscaping',
            'Irrigation Install',
            'Tree Removal',
            'Seasonal Cleanup'
        ]}
        taskTypes={[
            'Site Visit',
            'Client Call',
            'Team Dispatch',
            'Supply Order',
            'Follow-up'
        ]}
        companySectors={[
            'Residential',
            'Commercial',
            'HOA',
            'Municipal'
        ]}
        serviceAddressTypes={[
            { value: 'Primary Property', label: 'Primary Property' },
            { value: 'Secondary Property', label: 'Secondary Property' },
            { value: 'Commercial Site', label: 'Commercial Site' },
            { value: 'Seasonal Property', label: 'Seasonal Property' },
            { value: 'HOA Common Area', label: 'HOA Common Area' },
            { value: 'Rental Property', label: 'Rental Property' },
        ]}
        disableTelemetry
    />
);

export default App;
