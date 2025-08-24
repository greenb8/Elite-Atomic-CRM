import jsPDF from 'jspdf';
import { Proposal, ProposalLineItem } from '../types';

interface PDFGenerationOptions {
    proposal: Proposal;
    lineItems: ProposalLineItem[];
    dealName?: string;
    contactName?: string;
    contactEmail?: string;
    companyName?: string;
}

interface PDFSection {
    name: string;
    items: ProposalLineItem[];
    total: number;
}

export class ProposalPDFGenerator {
    private doc: jsPDF;
    private pageWidth: number;
    private pageHeight: number;
    private margin: number;
    private currentY: number;
    private lineHeight: number;

    // Elite Landscaping Brand Colors
    private readonly colors = {
        primary: '#0A2243',      // Elite Navy
        accent: '#FCBB1C',       // Action Gold
        text: '#212121',         // Dark Gray
        textSecondary: '#757575', // Medium Gray
        background: '#FFFFFF',    // White
        border: '#E0E0E0',       // Light Gray
    };

    constructor() {
        this.doc = new jsPDF('p', 'mm', 'a4');
        this.pageWidth = this.doc.internal.pageSize.getWidth();
        this.pageHeight = this.doc.internal.pageSize.getHeight();
        this.margin = 20;
        this.currentY = this.margin;
        this.lineHeight = 6;
    }

    async generateProposalPDF(options: PDFGenerationOptions): Promise<Blob> {
        const { proposal, lineItems, dealName, contactName, contactEmail, companyName } = options;

        try {
            // Add Elite Landscaping branding
            await this.addHeader();
            
            // Add proposal title and metadata
            this.addProposalHeader(proposal, dealName, contactName, contactEmail, companyName);
            
            // Group line items by section (client-visible only)
            const sections = this.groupLineItemsBySection(lineItems);
            
            // Add sections with line items
            this.addSections(sections);
            
            // Add pricing summary
            this.addPricingSummary(proposal, sections);
            
            // Add footer
            this.addFooter(proposal);
            
            return this.doc.output('blob');
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw new Error('Failed to generate proposal PDF');
        }
    }

    private async addHeader(): Promise<void> {
        // Add Elite Landscaping logo (placeholder - would need actual logo conversion)
        this.doc.setFillColor(this.colors.primary);
        this.doc.rect(0, 0, this.pageWidth, 40, 'F');
        
        // Company name and logo area
        this.doc.setTextColor('#FFFFFF');
        this.doc.setFontSize(24);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('ELITE LANDSCAPING', this.margin, 25);
        
        // Tagline
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text('Professional Landscape Services', this.margin, 32);
        
        this.currentY = 50;
    }

    private addProposalHeader(
        proposal: Proposal,
        dealName?: string,
        contactName?: string,
        contactEmail?: string,
        companyName?: string
    ): void {
        // Proposal title
        this.doc.setTextColor(this.colors.primary);
        this.doc.setFontSize(20);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(proposal.title, this.margin, this.currentY);
        this.currentY += 15;

        // Two-column layout for metadata
        const leftColumn = this.margin;
        const rightColumn = this.pageWidth / 2 + 10;

        // Left column - Client information
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(this.colors.text);
        this.doc.text('PREPARED FOR:', leftColumn, this.currentY);
        
        this.doc.setFont('helvetica', 'normal');
        this.doc.setFontSize(10);
        let clientY = this.currentY + 6;
        
        if (contactName) {
            this.doc.text(contactName, leftColumn, clientY);
            clientY += 5;
        }
        
        if (companyName) {
            this.doc.text(companyName, leftColumn, clientY);
            clientY += 5;
        }
        
        if (contactEmail) {
            this.doc.text(contactEmail, leftColumn, clientY);
            clientY += 5;
        }

        // Right column - Proposal information
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('PROPOSAL DETAILS:', rightColumn, this.currentY);
        
        this.doc.setFont('helvetica', 'normal');
        this.doc.setFontSize(10);
        let proposalY = this.currentY + 6;
        
        this.doc.text(`Proposal #: ${proposal.id}`, rightColumn, proposalY);
        proposalY += 5;
        
        this.doc.text(`Created: ${new Date(proposal.created_at).toLocaleDateString()}`, rightColumn, proposalY);
        proposalY += 5;
        
        if (proposal.expires_at) {
            this.doc.text(`Expires: ${new Date(proposal.expires_at).toLocaleDateString()}`, rightColumn, proposalY);
            proposalY += 5;
        }
        
        this.doc.text(`Status: ${proposal.status.toUpperCase()}`, rightColumn, proposalY);

        this.currentY = Math.max(clientY, proposalY) + 15;
        
        // Add separator line
        this.doc.setDrawColor(this.colors.border);
        this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
        this.currentY += 10;
    }

    private groupLineItemsBySection(lineItems: ProposalLineItem[]): PDFSection[] {
        // Filter to only client-visible items
        const visibleItems = lineItems.filter(item => item.is_visible_to_client);
        
        // Group by section
        const sectionMap = new Map<string, ProposalLineItem[]>();
        visibleItems.forEach(item => {
            const sectionName = item.section_name || 'General';
            if (!sectionMap.has(sectionName)) {
                sectionMap.set(sectionName, []);
            }
            sectionMap.get(sectionName)!.push(item);
        });

        // Convert to sections array with totals
        return Array.from(sectionMap.entries()).map(([name, items]) => {
            const total = items.reduce((sum, item) => 
                sum + (item.is_selected_by_client ? item.total_price : 0), 0
            );
            
            return {
                name,
                items: items.sort((a, b) => a.sort_order - b.sort_order),
                total,
            };
        }).sort((a, b) => {
            // Sort sections by the minimum section_sort_order of their items
            const aMinSort = Math.min(...a.items.map(item => item.section_sort_order));
            const bMinSort = Math.min(...b.items.map(item => item.section_sort_order));
            return aMinSort - bMinSort;
        });
    }

    private addSections(sections: PDFSection[]): void {
        sections.forEach((section, sectionIndex) => {
            // Check if we need a new page
            if (this.currentY > this.pageHeight - 60) {
                this.doc.addPage();
                this.currentY = this.margin;
            }

            // Section header
            this.doc.setFillColor(this.colors.accent);
            this.doc.rect(this.margin, this.currentY - 3, this.pageWidth - (2 * this.margin), 12, 'F');
            
            this.doc.setTextColor('#FFFFFF');
            this.doc.setFontSize(14);
            this.doc.setFont('helvetica', 'bold');
            this.doc.text(section.name.toUpperCase(), this.margin + 5, this.currentY + 5);
            
            // Section total
            this.doc.text(
                `$${section.total.toLocaleString()}`,
                this.pageWidth - this.margin - 5,
                this.currentY + 5,
                { align: 'right' }
            );
            
            this.currentY += 20;

            // Section items
            section.items.forEach((item, itemIndex) => {
                this.addLineItem(item);
            });

            // Add spacing between sections
            this.currentY += 10;
        });
    }

    private addLineItem(item: ProposalLineItem): void {
        // Check if we need a new page
        if (this.currentY > this.pageHeight - 40) {
            this.doc.addPage();
            this.currentY = this.margin;
        }

        const startY = this.currentY;
        
        // Item name and optional indicator
        this.doc.setTextColor(this.colors.text);
        this.doc.setFontSize(11);
        this.doc.setFont('helvetica', 'bold');
        
        let itemTitle = item.name;
        if (item.is_optional) {
            itemTitle += ' (Optional)';
        }
        
        this.doc.text(itemTitle, this.margin + 5, this.currentY);
        
        // Item total (right aligned)
        this.doc.text(
            `$${item.total_price.toLocaleString()}`,
            this.pageWidth - this.margin - 5,
            this.currentY,
            { align: 'right' }
        );
        
        this.currentY += 6;

        // Item description
        if (item.description) {
            this.doc.setFont('helvetica', 'normal');
            this.doc.setFontSize(9);
            this.doc.setTextColor(this.colors.textSecondary);
            
            const descriptionLines = this.doc.splitTextToSize(
                item.description,
                this.pageWidth - (2 * this.margin) - 60
            );
            
            descriptionLines.forEach((line: string) => {
                this.doc.text(line, this.margin + 5, this.currentY);
                this.currentY += 4;
            });
        }

        // Quantity and unit price
        this.doc.setFont('helvetica', 'normal');
        this.doc.setFontSize(9);
        this.doc.setTextColor(this.colors.textSecondary);
        this.doc.text(
            `${item.quantity} ${item.unit} × $${item.unit_price.toLocaleString()} each`,
            this.margin + 5,
            this.currentY
        );
        
        this.currentY += 8;

        // Optional item styling
        if (item.is_optional) {
            // Add subtle background for optional items
            this.doc.setFillColor('#FFF3E0');
            this.doc.rect(this.margin, startY - 2, this.pageWidth - (2 * this.margin), this.currentY - startY, 'F');
            
            // Re-draw text over background
            this.doc.setTextColor(this.colors.text);
            this.doc.setFontSize(11);
            this.doc.setFont('helvetica', 'bold');
            this.doc.text(itemTitle, this.margin + 5, startY);
            
            this.doc.text(
                `$${item.total_price.toLocaleString()}`,
                this.pageWidth - this.margin - 5,
                startY,
                { align: 'right' }
            );
        }

        // Add subtle separator line
        this.doc.setDrawColor(this.colors.border);
        this.doc.line(this.margin + 5, this.currentY, this.pageWidth - this.margin - 5, this.currentY);
        this.currentY += 5;
    }

    private addPricingSummary(proposal: Proposal, sections: PDFSection[]): void {
        // Check if we need a new page
        if (this.currentY > this.pageHeight - 80) {
            this.doc.addPage();
            this.currentY = this.margin;
        }

        this.currentY += 10;

        // Pricing summary header
        this.doc.setFillColor(this.colors.primary);
        this.doc.rect(this.margin, this.currentY - 3, this.pageWidth - (2 * this.margin), 12, 'F');
        
        this.doc.setTextColor('#FFFFFF');
        this.doc.setFontSize(14);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('PRICING SUMMARY', this.margin + 5, this.currentY + 5);
        
        this.currentY += 20;

        // Section totals
        const summaryStartX = this.pageWidth - 80;
        
        sections.forEach(section => {
            if (section.total > 0) {
                this.doc.setTextColor(this.colors.text);
                this.doc.setFontSize(10);
                this.doc.setFont('helvetica', 'normal');
                this.doc.text(section.name, this.margin + 5, this.currentY);
                this.doc.text(`$${section.total.toLocaleString()}`, summaryStartX, this.currentY, { align: 'right' });
                this.currentY += 6;
            }
        });

        // Separator line
        this.currentY += 5;
        this.doc.setDrawColor(this.colors.border);
        this.doc.line(summaryStartX - 60, this.currentY, summaryStartX, this.currentY);
        this.currentY += 8;

        // Subtotal
        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(11);
        this.doc.text('Subtotal:', this.margin + 5, this.currentY);
        this.doc.text(`$${proposal.subtotal.toLocaleString()}`, summaryStartX, this.currentY, { align: 'right' });
        this.currentY += 8;

        // Tax
        const taxPercent = ((proposal.tax_rate || 0) * 100).toFixed(2);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setFontSize(10);
        this.doc.text(`Tax (${taxPercent}%):`, this.margin + 5, this.currentY);
        this.doc.text(`$${proposal.tax_amount.toLocaleString()}`, summaryStartX, this.currentY, { align: 'right' });
        this.currentY += 8;

        // Total
        this.doc.setDrawColor(this.colors.primary);
        this.doc.line(summaryStartX - 60, this.currentY, summaryStartX, this.currentY);
        this.currentY += 5;
        
        this.doc.setTextColor(this.colors.primary);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(14);
        this.doc.text('TOTAL:', this.margin + 5, this.currentY);
        this.doc.text(`$${proposal.total_amount.toLocaleString()}`, summaryStartX, this.currentY, { align: 'right' });
        this.currentY += 12;

        // Deposit information
        if (proposal.deposit_amount > 0) {
            this.doc.setTextColor(this.colors.accent);
            this.doc.setFont('helvetica', 'bold');
            this.doc.setFontSize(11);
            this.doc.text('Deposit Required:', this.margin + 5, this.currentY);
            this.doc.text(`$${proposal.deposit_amount.toLocaleString()}`, summaryStartX, this.currentY, { align: 'right' });
            this.currentY += 8;
        }
    }

    private addFooter(proposal: Proposal): void {
        const footerY = this.pageHeight - 30;
        
        // Footer background
        this.doc.setFillColor(this.colors.primary);
        this.doc.rect(0, footerY - 5, this.pageWidth, 25, 'F');
        
        // Contact information
        this.doc.setTextColor('#FFFFFF');
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'normal');
        
        const contactInfo = [
            'Elite Landscaping Services',
            'Phone: (555) 123-4567',
            'Email: info@elitelandscaping.com',
            'www.elitelandscaping.com'
        ];
        
        contactInfo.forEach((info, index) => {
            this.doc.text(info, this.margin, footerY + (index * 4));
        });

        // Proposal validity
        if (proposal.expires_at) {
            this.doc.text(
                `This proposal is valid until ${new Date(proposal.expires_at).toLocaleDateString()}`,
                this.pageWidth - this.margin,
                footerY + 8,
                { align: 'right' }
            );
        }

        // Page number
        const pageCount = this.doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            this.doc.setPage(i);
            this.doc.setTextColor('#FFFFFF');
            this.doc.setFontSize(8);
            this.doc.text(
                `Page ${i} of ${pageCount}`,
                this.pageWidth - this.margin,
                footerY + 16,
                { align: 'right' }
            );
        }
    }

    // Helper method to convert hex color to RGB
    private hexToRgb(hex: string): { r: number; g: number; b: number } {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }
}

// Service function to generate and upload PDF
export async function generateAndUploadProposalPDF(
    proposal: Proposal,
    lineItems: ProposalLineItem[],
    dealName?: string,
    contactName?: string,
    contactEmail?: string,
    companyName?: string
): Promise<string> {
    try {
        // Generate PDF
        const generator = new ProposalPDFGenerator();
        const pdfBlob = await generator.generateProposalPDF({
            proposal,
            lineItems,
            dealName,
            contactName,
            contactEmail,
            companyName,
        });

        // Generate unique filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `proposal-${proposal.id}-${timestamp}.pdf`;
        
        // Convert blob to file for upload
        const file = new File([pdfBlob], filename, { type: 'application/pdf' });
        
        // Upload to Supabase storage (proposal-pdfs bucket)
        // Note: This would need to be implemented with actual Supabase client
        // For now, return the filename that would be used
        const filePath = `proposals/${proposal.id}/${filename}`;
        
        return filePath;
    } catch (error) {
        console.error('Error generating and uploading PDF:', error);
        throw new Error('Failed to generate proposal PDF');
    }
}

// Helper function to download PDF directly
export async function downloadProposalPDF(
    proposal: Proposal,
    lineItems: ProposalLineItem[],
    dealName?: string,
    contactName?: string,
    contactEmail?: string,
    companyName?: string
): Promise<void> {
    try {
        const generator = new ProposalPDFGenerator();
        const pdfBlob = await generator.generateProposalPDF({
            proposal,
            lineItems,
            dealName,
            contactName,
            contactEmail,
            companyName,
        });

        // Create download link
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${proposal.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading PDF:', error);
        throw new Error('Failed to download proposal PDF');
    }
}
