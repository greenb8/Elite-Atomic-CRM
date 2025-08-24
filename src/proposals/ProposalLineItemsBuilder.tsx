import {
    Add as AddIcon,
    ArrowBack as ArrowBackIcon,
    ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardContent,
    Stack,
    Typography,
} from '@mui/material';
import * as React from 'react';

import { StepContent } from './ProposalBuilderStepper';

interface ProposalLineItemsBuilderProps {
    onNext: () => void;
    onPrevious: () => void;
}

export const ProposalLineItemsBuilder: React.FC<
    ProposalLineItemsBuilderProps
> = ({ onNext, onPrevious }) => {
    return (
        <StepContent
            title="Line Items & Services"
            description="Add products and services to your proposal. Organize them into sections and set pricing."
        >
            <Stack spacing={3}>
                {/* Placeholder for future line items functionality */}
                <Card
                    sx={{
                        backgroundColor: '#E8F5FD',
                        border: '2px dashed #2196F3',
                        borderRadius: 3,
                    }}
                >
                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                        <Typography
                            variant="h6"
                            sx={{
                                color: '#0A2243',
                                fontFamily: 'Montserrat',
                                fontWeight: 600,
                                mb: 2,
                            }}
                        >
                            Line Items Builder Coming Soon
                        </Typography>
                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{ mb: 3 }}
                        >
                            This step will include:
                        </Typography>
                        <Stack
                            spacing={1}
                            sx={{
                                mb: 3,
                                textAlign: 'left',
                                maxWidth: 400,
                                mx: 'auto',
                            }}
                        >
                            <Typography variant="body2">
                                • Product catalog search and selection
                            </Typography>
                            <Typography variant="body2">
                                • Custom line item creation
                            </Typography>
                            <Typography variant="body2">
                                • Section organization
                            </Typography>
                            <Typography variant="body2">
                                • Real-time pricing calculations
                            </Typography>
                            <Typography variant="body2">
                                • Client visibility controls
                            </Typography>
                        </Stack>
                        <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            disabled
                            sx={{
                                borderColor: '#2196F3',
                                color: '#2196F3',
                            }}
                        >
                            Add Products (Coming Soon)
                        </Button>
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
                        Back to Details
                    </Button>

                    <Button
                        variant="contained"
                        endIcon={<ArrowForwardIcon />}
                        onClick={onNext}
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
                        Continue to Review
                    </Button>
                </Box>
            </Stack>
        </StepContent>
    );
};
