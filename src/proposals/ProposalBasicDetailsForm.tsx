import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { Box, Button, Stack } from '@mui/material';
import * as React from 'react';
import { useFormContext } from 'react-hook-form';

import { StepContent } from './ProposalBuilderStepper';
import { ProposalInputs } from './ProposalInputs';

interface ProposalBasicDetailsFormProps {
    onNext: () => void;
}

export const ProposalBasicDetailsForm: React.FC<
    ProposalBasicDetailsFormProps
> = ({ onNext }) => {
    const form = useFormContext();

    const handleNext = () => {
        // Basic validation - ensure title is provided
        const title = form?.getValues?.('title');
        if (!title || title.trim() === '') {
            form?.setError?.('title', {
                type: 'required',
                message: 'Proposal title is required',
            });
            return;
        }

        onNext();
    };

    return (
        <StepContent
            title="Proposal Details"
            description="Set up the basic information for your proposal including title, related deal, and financial settings."
        >
            <Stack spacing={3}>
                {/* Proposal Input Form */}
                <ProposalInputs />

                {/* Navigation Actions */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        pt: 2,
                        borderTop: '1px solid #E0E0E0',
                        mt: 3,
                    }}
                >
                    <Button
                        variant="contained"
                        endIcon={<ArrowForwardIcon />}
                        onClick={handleNext}
                        sx={{
                            backgroundColor: '#FCBB1C',
                            color: '#0A2243',
                            fontWeight: 600,
                            px: 4,
                            py: 1.5,
                            '&:hover': {
                                backgroundColor: '#E6A619',
                                transform: 'translateY(-1px)',
                            },
                        }}
                    >
                        Continue to Line Items
                    </Button>
                </Box>
            </Stack>
        </StepContent>
    );
};
