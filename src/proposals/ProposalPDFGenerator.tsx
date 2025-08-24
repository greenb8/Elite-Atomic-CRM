import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import {
    Close as CloseIcon,
    Download as DownloadIcon,
    PictureAsPdf as PdfIcon,
    Share as ShareIcon,
} from '@mui/icons-material';
import * as React from 'react';
import { useState } from 'react';
import {
    useDataProvider,
    useNotify,
    useRecordContext,
    useUpdate,
} from 'react-admin';

import { Proposal, ProposalLineItem } from '../types';
import { ProposalPDFGenerator, downloadProposalPDF } from '../services/pdfGenerator';
import { uploadProposalPDF, getProposalPDFUrl, cleanupOldProposalPDFs } from '../services/supabaseStorage';

interface ProposalPDFGeneratorProps {
    open: boolean;
    onClose: () => void;
    proposalId: string;
}

export const ProposalPDFGeneratorDialog: React.FC<ProposalPDFGeneratorProps> = ({
    open,
    onClose,
    proposalId,
}) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const theme = useTheme();
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const [update] = useUpdate();
    const record = useRecordContext<Proposal>();

    const generatePDF = async (uploadToStorage: boolean = false) => {
        if (!record) {
            notify('Proposal data not available', { type: 'error' });
            return;
        }

        try {
            setIsGenerating(true);
            setError(null);

            // Load line items for this proposal
            const { data: lineItems } = await dataProvider.getList('proposal_line_items', {
                filter: { proposal_id: proposalId },
                sort: { field: 'section_sort_order', order: 'ASC' },
                pagination: { page: 1, perPage: 1000 },
            });

            // Load related data for PDF context
            let dealName = '';
            let contactName = '';
            let contactEmail = '';
            let companyName = '';

            if (record.deal_id) {
                try {
                    const { data: deal } = await dataProvider.getOne('deals', { id: record.deal_id });
                    dealName = deal.name;

                    // Load contact information
                    if (deal.contact_ids && deal.contact_ids.length > 0) {
                        const { data: contact } = await dataProvider.getOne('contacts', { 
                            id: deal.contact_ids[0] 
                        });
                        contactName = `${contact.first_name || ''} ${contact.last_name || ''}`.trim();
                        contactEmail = contact.email_jsonb?.find((e: any) => e.type === 'Work')?.email || 
                                     contact.email_jsonb?.[0]?.email || '';
                    }

                    // Load company information
                    if (deal.company_id) {
                        const { data: company } = await dataProvider.getOne('companies', { 
                            id: deal.company_id 
                        });
                        companyName = company.name;
                    }
                } catch (error) {
                    console.warn('Could not load deal context:', error);
                }
            }

            // Generate PDF
            const generator = new ProposalPDFGenerator();
            const pdfBlob = await generator.generateProposalPDF({
                proposal: record,
                lineItems: lineItems as ProposalLineItem[],
                dealName,
                contactName,
                contactEmail,
                companyName,
            });

            if (uploadToStorage) {
                setIsUploading(true);
                
                // Upload to Supabase storage
                const pdfPath = await uploadProposalPDF(proposalId, pdfBlob);
                
                // Update proposal record with PDF metadata
                await update('proposals', {
                    id: proposalId,
                    data: {
                        pdf_path: pdfPath,
                        pdf_generated_at: new Date().toISOString(),
                    },
                    previousData: record,
                });

                // Get signed URL for immediate access
                const signedUrl = await getProposalPDFUrl(pdfPath);
                setGeneratedPdfUrl(signedUrl);

                // Cleanup old PDFs (keep latest 3)
                await cleanupOldProposalPDFs(proposalId, 3);

                notify('PDF generated and saved successfully', { type: 'success' });
            } else {
                // Direct download
                const url = URL.createObjectURL(pdfBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${record.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                notify('PDF downloaded successfully', { type: 'success' });
                onClose();
            }
        } catch (error) {
            console.error('PDF generation error:', error);
            setError(error instanceof Error ? error.message : 'Failed to generate PDF');
            notify('Error generating PDF', { type: 'error' });
        } finally {
            setIsGenerating(false);
            setIsUploading(false);
        }
    };

    const handleDownloadGenerated = async () => {
        if (!generatedPdfUrl) return;
        
        try {
            const response = await fetch(generatedPdfUrl);
            const blob = await response.blob();
            
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${record?.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            notify('Error downloading PDF', { type: 'error' });
        }
    };

    const handleClose = () => {
        setGeneratedPdfUrl(null);
        setError(null);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                },
            }}
        >
            <DialogTitle
                sx={{
                    backgroundColor: '#0A2243',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Stack direction="row" alignItems="center" spacing={1}>
                    <PdfIcon />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Generate Proposal PDF
                    </Typography>
                </Stack>
                <IconButton
                    onClick={handleClose}
                    sx={{ color: 'white' }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                <Stack spacing={3}>
                    {/* PDF Preview Info */}
                    <Card sx={{ backgroundColor: '#fafafb' }}>
                        <CardContent>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: '#0A2243',
                                    fontWeight: 600,
                                    mb: 2,
                                }}
                            >
                                PDF Preview
                            </Typography>
                            
                            <Stack spacing={1}>
                                <Typography variant="body2">
                                    <strong>Proposal:</strong> {record?.title}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Status:</strong> {record?.status?.toUpperCase()}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Total Amount:</strong> ${record?.total_amount?.toLocaleString()}
                                </Typography>
                                {record?.expires_at && (
                                    <Typography variant="body2">
                                        <strong>Expires:</strong> {new Date(record.expires_at).toLocaleDateString()}
                                    </Typography>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>

                    {/* Elite Landscaping Branding Info */}
                    <Card sx={{ backgroundColor: '#0A224310' }}>
                        <CardContent>
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    color: '#0A2243',
                                    fontWeight: 600,
                                    mb: 1,
                                }}
                            >
                                Elite Landscaping Branding
                            </Typography>
                            
                            <Typography variant="body2" color="text.secondary">
                                PDF will include professional Elite Landscaping branding with company logo, 
                                contact information, and branded color scheme.
                            </Typography>
                        </CardContent>
                    </Card>

                    {/* Client-Only Information Notice */}
                    <Card sx={{ backgroundColor: '#E8F5E8' }}>
                        <CardContent>
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    color: 'success.dark',
                                    fontWeight: 600,
                                    mb: 1,
                                }}
                            >
                                Client-Ready Format
                            </Typography>
                            
                            <Typography variant="body2" color="success.dark">
                                Only client-visible line items will be included. Internal costs and 
                                administrative notes are automatically excluded.
                            </Typography>
                        </CardContent>
                    </Card>

                    {/* Error display */}
                    {error && (
                        <Card sx={{ backgroundColor: '#FFEBEE' }}>
                            <CardContent>
                                <Typography variant="subtitle2" color="error.main" sx={{ fontWeight: 600 }}>
                                    Error
                                </Typography>
                                <Typography variant="body2" color="error.main">
                                    {error}
                                </Typography>
                            </CardContent>
                        </Card>
                    )}

                    {/* Generated PDF actions */}
                    {generatedPdfUrl && (
                        <Card sx={{ backgroundColor: '#E3F2FD' }}>
                            <CardContent>
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        color: 'primary.main',
                                        fontWeight: 600,
                                        mb: 2,
                                    }}
                                >
                                    PDF Generated Successfully
                                </Typography>
                                
                                <Stack direction="row" spacing={2}>
                                    <Button
                                        variant="outlined"
                                        startIcon={<DownloadIcon />}
                                        onClick={handleDownloadGenerated}
                                        size="small"
                                    >
                                        Download
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        startIcon={<ShareIcon />}
                                        onClick={() => {
                                            navigator.clipboard.writeText(generatedPdfUrl);
                                            notify('PDF link copied to clipboard', { type: 'info' });
                                        }}
                                        size="small"
                                    >
                                        Copy Link
                                    </Button>
                                </Stack>
                            </CardContent>
                        </Card>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 3, backgroundColor: '#fafafb' }}>
                <Stack direction="row" spacing={2} width="100%" justifyContent="space-between">
                    <Button onClick={handleClose} color="inherit">
                        Cancel
                    </Button>
                    
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="outlined"
                            onClick={() => generatePDF(false)}
                            disabled={isGenerating || isUploading}
                            startIcon={isGenerating ? <CircularProgress size={16} /> : <DownloadIcon />}
                            sx={{
                                borderColor: '#0A2243',
                                color: '#0A2243',
                                '&:hover': {
                                    borderColor: '#0A2243',
                                    backgroundColor: '#0A224310',
                                },
                            }}
                        >
                            {isGenerating ? 'Generating...' : 'Download PDF'}
                        </Button>
                        
                        <Button
                            variant="contained"
                            onClick={() => generatePDF(true)}
                            disabled={isGenerating || isUploading}
                            startIcon={
                                isGenerating || isUploading ? 
                                <CircularProgress size={16} /> : 
                                <PdfIcon />
                            }
                            sx={{
                                backgroundColor: '#FCBB1C',
                                color: '#0A2243',
                                '&:hover': {
                                    backgroundColor: '#E6A619',
                                },
                            }}
                        >
                            {isGenerating 
                                ? 'Generating...' 
                                : isUploading 
                                ? 'Uploading...' 
                                : 'Generate & Save PDF'
                            }
                        </Button>
                    </Stack>
                </Stack>
            </DialogActions>
        </Dialog>
    );
};

// Simplified PDF generation button for use in other components
interface PDFGenerationButtonProps {
    proposalId: string;
    variant?: 'download' | 'generate';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
}

export const PDFGenerationButton: React.FC<PDFGenerationButtonProps> = ({
    proposalId,
    variant = 'download',
    size = 'medium',
    disabled = false,
}) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const record = useRecordContext<Proposal>();

    const handleQuickDownload = async () => {
        if (!record) return;

        try {
            setIsGenerating(true);

            // Load line items
            const { data: lineItems } = await dataProvider.getList('proposal_line_items', {
                filter: { proposal_id: proposalId },
                sort: { field: 'section_sort_order', order: 'ASC' },
                pagination: { page: 1, perPage: 1000 },
            });

            // Quick download without uploading
            await downloadProposalPDF(
                record,
                lineItems as ProposalLineItem[]
            );

            notify('PDF downloaded successfully', { type: 'success' });
        } catch (error) {
            notify('Error generating PDF', { type: 'error' });
        } finally {
            setIsGenerating(false);
        }
    };

    if (variant === 'download') {
        return (
            <Button
                variant="outlined"
                startIcon={isGenerating ? <CircularProgress size={16} /> : <DownloadIcon />}
                onClick={handleQuickDownload}
                disabled={disabled || isGenerating}
                size={size}
                sx={{
                    borderColor: '#0A2243',
                    color: '#0A2243',
                    '&:hover': {
                        borderColor: '#0A2243',
                        backgroundColor: '#0A224310',
                    },
                }}
            >
                {isGenerating ? 'Generating...' : 'Download PDF'}
            </Button>
        );
    }

    return (
        <>
            <Button
                variant="contained"
                startIcon={<PdfIcon />}
                onClick={() => setDialogOpen(true)}
                disabled={disabled}
                size={size}
                sx={{
                    backgroundColor: '#FCBB1C',
                    color: '#0A2243',
                    '&:hover': {
                        backgroundColor: '#E6A619',
                    },
                }}
            >
                Generate PDF
            </Button>
            
            <ProposalPDFGeneratorDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                proposalId={proposalId}
            />
        </>
    );
};

// Hook for PDF generation functionality
export const usePDFGeneration = (proposalId: string) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const [update] = useUpdate();

    const generateAndSavePDF = async (proposal: Proposal): Promise<string | null> => {
        try {
            setIsGenerating(true);

            // Load line items
            const { data: lineItems } = await dataProvider.getList('proposal_line_items', {
                filter: { proposal_id: proposalId },
                sort: { field: 'section_sort_order', order: 'ASC' },
                pagination: { page: 1, perPage: 1000 },
            });

            // Generate PDF
            const generator = new ProposalPDFGenerator();
            const pdfBlob = await generator.generateProposalPDF({
                proposal,
                lineItems: lineItems as ProposalLineItem[],
            });

            // Upload to storage
            const pdfPath = await uploadProposalPDF(proposalId, pdfBlob);

            // Update proposal record
            await update('proposals', {
                id: proposalId,
                data: {
                    pdf_path: pdfPath,
                    pdf_generated_at: new Date().toISOString(),
                },
                previousData: proposal,
            });

            // Cleanup old PDFs
            await cleanupOldProposalPDFs(proposalId, 3);

            notify('PDF generated and saved successfully', { type: 'success' });
            return pdfPath;
        } catch (error) {
            console.error('PDF generation error:', error);
            notify('Error generating PDF', { type: 'error' });
            return null;
        } finally {
            setIsGenerating(false);
        }
    };

    return {
        generateAndSavePDF,
        isGenerating,
    };
};
