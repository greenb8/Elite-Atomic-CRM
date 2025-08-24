import {
    ArrowBack as ArrowBackIcon,
    CheckCircle as CheckCircleIcon,
    Save as SaveIcon,
} from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    Stack,
    Typography,
} from '@mui/material';
import * as React from 'react';
import { useFormContext } from 'react-hook-form';

import { StepContent } from './ProposalBuilderStepper';

interface ProposalReviewSummaryProps {
    onPrevious: () => void;
    onSave: () => void;
    isLoading?: boolean;
}

export const ProposalReviewSummary: React.FC<ProposalReviewSummaryProps> = ({
    onPrevious,
    onSave,
    isLoading = false,
}) => {
    const form = useFormContext();
    const formData = form?.getValues?.() || {};

    return (
        <StepContent
            title="Review & Create"
            description="Review your proposal details before creating. You can make changes by going back to previous steps."
        >
            <Stack spacing={3}>
                {/* Proposal Summary Card */}
                <Card
                    sx={{
                        backgroundColor: 'white',
                        borderRadius: 3,
                        boxShadow: '0 4px 12px rgba(10,34,67,0.10)',
                        border: '1px solid #E0E0E0',
                    }}
                >
                    <CardContent sx={{ p: 3 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                color: '#0A2243',
                                fontFamily: 'Montserrat',
                                fontWeight: 600,
                                mb: 2,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                            }}
                        >
                            <CheckCircleIcon sx={{ color: '#4CAF50' }} />
                            Proposal Summary
                        </Typography>

                        <Stack spacing={2}>
                            <Box>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Title:
                                </Typography>
                                <Typography variant="body1" fontWeight={500}>
                                    {formData.title || 'Untitled Proposal'}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Status:
                                </Typography>
                                <Typography variant="body1" fontWeight={500}>
                                    {formData.status || 'draft'}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Tax Rate:
                                </Typography>
                                <Typography variant="body1" fontWeight={500}>
                                    {(
                                        (formData.tax_rate || 0.0825) * 100
                                    ).toFixed(2)}
                                    %
                                </Typography>
                            </Box>

                            {formData.deposit_amount && (
                                <Box>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Deposit Required:
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        fontWeight={500}
                                    >
                                        $
                                        {Number(
                                            formData.deposit_amount || 0
                                        ).toLocaleString()}
                                    </Typography>
                                </Box>
                            )}

                            {formData.expires_at && (
                                <Box>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Expires:
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        fontWeight={500}
                                    >
                                        {new Date(
                                            formData.expires_at
                                        ).toLocaleDateString()}
                                    </Typography>
                                </Box>
                            )}
                        </Stack>
                    </CardContent>
                </Card>

                {/* Line Items Summary - Placeholder */}
                <Card
                    sx={{
                        backgroundColor: '#E8F5E8',
                        borderRadius: 3,
                        border: '1px solid #4CAF50',
                    }}
                >
                    <CardContent sx={{ p: 3 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                color: '#0A2243',
                                fontFamily: 'Montserrat',
                                fontWeight: 600,
                                mb: 2,
                            }}
                        >
                            Line Items
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            No line items added yet. Line items functionality
                            will be available in the next phase of development.
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <Typography
                                variant="h6"
                                sx={{ color: '#0A2243', fontWeight: 600 }}
                            >
                                Total:
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: '#0A2243',
                                    fontWeight: 700,
                                    fontSize: '1.2rem',
                                }}
                            >
                                $0.00
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>

                {/* Next Steps Information */}
                <Card
                    sx={{
                        backgroundColor: '#E8F5FD',
                        borderRadius: 3,
                        border: '1px solid #2196F3',
                    }}
                >
                    <CardContent sx={{ p: 3 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                color: '#0A2243',
                                fontFamily: 'Montserrat',
                                fontWeight: 600,
                                mb: 2,
                            }}
                        >
                            Next Steps
                        </Typography>
                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{ mb: 2 }}
                        >
                            After creating this proposal, you'll be able to:
                        </Typography>
                        <Stack spacing={1}>
                            <Typography variant="body2">
                                • Add and manage line items
                            </Typography>
                            <Typography variant="body2">
                                • Generate professional PDFs via PandaDoc
                            </Typography>
                            <Typography variant="body2">
                                • Send proposals to clients for review
                            </Typography>
                            <Typography variant="body2">
                                • Track proposal status and client interactions
                            </Typography>
                        </Stack>
                    </CardContent>
                </Card>

                {/* Navigation Actions */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        pt: 2,
                        borderTop: '1px solid #E0E0E0',
                        mt: 3,
                    }}
                >
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={onPrevious}
                        disabled={isLoading}
                        sx={{
                            borderColor: '#0A2243',
                            color: '#0A2243',
                            fontWeight: 600,
                            px: 4,
                            py: 1.5,
                            '&:hover': {
                                borderColor: '#0A2243',
                                backgroundColor: '#0A224310',
                            },
                        }}
                    >
                        Back to Line Items
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={onSave}
                        disabled={isLoading}
                        sx={{
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            fontWeight: 600,
                            px: 4,
                            py: 1.5,
                            '&:hover': {
                                backgroundColor: '#45A049',
                                transform: 'translateY(-1px)',
                            },
                        }}
                    >
                        {isLoading ? 'Creating...' : 'Create Proposal'}
                    </Button>
                </Box>
            </Stack>
        </StepContent>
    );
};
