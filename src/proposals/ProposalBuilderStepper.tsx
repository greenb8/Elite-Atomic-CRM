import {
    Box,
    Step,
    StepLabel,
    Stepper,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import * as React from 'react';

interface ProposalBuilderStep {
    label: string;
    component: React.ComponentType<any>;
    optional?: boolean;
}

interface ProposalBuilderStepperProps {
    steps: ProposalBuilderStep[];
    currentStep: number;
    onStepChange: (step: number) => void;
    children?: React.ReactNode;
}

export const ProposalBuilderStepper: React.FC<ProposalBuilderStepperProps> = ({
    steps,
    currentStep,
    onStepChange,
    children,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <Box>
            {/* Elite Landscaping Branded Header */}
            <Box
                sx={{
                    backgroundColor: '#0A2243',
                    color: 'white',
                    p: 3,
                    borderRadius: '12px 12px 0 0',
                }}
            >
                <Typography
                    variant="h4"
                    sx={{
                        fontFamily: 'Montserrat',
                        fontWeight: 700,
                        mb: 1,
                    }}
                >
                    Create New Proposal
                </Typography>
                <Typography
                    variant="body1"
                    sx={{
                        opacity: 0.9,
                        fontFamily: 'Raleway',
                    }}
                >
                    Build professional proposals with line items and pricing
                </Typography>
            </Box>

            {/* Step Navigation */}
            <Box
                sx={{
                    backgroundColor: 'white',
                    p: 3,
                    borderBottom: '1px solid #E0E0E0',
                }}
            >
                <Stepper
                    activeStep={currentStep}
                    orientation={isMobile ? 'vertical' : 'horizontal'}
                    sx={{
                        '& .MuiStepLabel-root .Mui-active': {
                            color: '#0A2243',
                        },
                        '& .MuiStepLabel-root .Mui-completed': {
                            color: '#FCBB1C',
                        },
                        '& .MuiStepIcon-root.Mui-active': {
                            color: '#0A2243',
                        },
                        '& .MuiStepIcon-root.Mui-completed': {
                            color: '#FCBB1C',
                        },
                        '& .MuiStepConnector-line': {
                            borderColor: '#E0E0E0',
                        },
                        '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line':
                            {
                                borderColor: '#0A2243',
                            },
                        '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line':
                            {
                                borderColor: '#FCBB1C',
                            },
                    }}
                >
                    {steps.map((step, index) => (
                        <Step key={step.label}>
                            <StepLabel
                                optional={
                                    step.optional ? (
                                        <Typography variant="caption">
                                            Optional
                                        </Typography>
                                    ) : null
                                }
                                sx={{
                                    cursor: 'pointer',
                                    '& .MuiStepLabel-label': {
                                        fontFamily: 'Raleway',
                                        fontWeight: 500,
                                        '&.Mui-active': {
                                            fontWeight: 600,
                                        },
                                        '&.Mui-completed': {
                                            fontWeight: 600,
                                        },
                                    },
                                }}
                                onClick={() => onStepChange(index)}
                            >
                                {step.label}
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Box>

            {/* Step Content */}
            <Box
                sx={{
                    backgroundColor: '#fafafb',
                    minHeight: '60vh',
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

// Individual step wrapper component
interface StepContentProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

export const StepContent: React.FC<StepContentProps> = ({
    children,
    title,
    description,
}) => {
    return (
        <Box sx={{ p: 3 }}>
            {(title || description) && (
                <Box sx={{ mb: 3 }}>
                    {title && (
                        <Typography
                            variant="h5"
                            sx={{
                                color: '#0A2243',
                                fontFamily: 'Montserrat',
                                fontWeight: 600,
                                mb: 1,
                            }}
                        >
                            {title}
                        </Typography>
                    )}
                    {description && (
                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{ fontFamily: 'Raleway' }}
                        >
                            {description}
                        </Typography>
                    )}
                </Box>
            )}
            {children}
        </Box>
    );
};
