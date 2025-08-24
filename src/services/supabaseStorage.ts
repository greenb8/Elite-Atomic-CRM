import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for storage operations
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UploadResult {
    path: string;
    publicUrl?: string;
    error?: string;
}

/**
 * Upload a file to Supabase storage
 * @param bucket - The storage bucket name
 * @param filePath - The path where the file should be stored
 * @param file - The file to upload
 * @returns Promise with upload result
 */
export async function uploadFile(
    bucket: string,
    filePath: string,
    file: File | Blob
): Promise<UploadResult> {
    try {
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true, // Replace if file already exists
            });

        if (error) {
            console.error('Storage upload error:', error);
            return { path: filePath, error: error.message };
        }

        return { path: data.path };
    } catch (error) {
        console.error('Upload error:', error);
        return { 
            path: filePath, 
            error: error instanceof Error ? error.message : 'Unknown upload error' 
        };
    }
}

/**
 * Get a signed URL for a private file
 * @param bucket - The storage bucket name
 * @param filePath - The path to the file
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns Promise with signed URL
 */
export async function getSignedUrl(
    bucket: string,
    filePath: string,
    expiresIn: number = 3600
): Promise<string | null> {
    try {
        const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUrl(filePath, expiresIn);

        if (error) {
            console.error('Error creating signed URL:', error);
            return null;
        }

        return data.signedUrl;
    } catch (error) {
        console.error('Signed URL error:', error);
        return null;
    }
}

/**
 * Delete a file from storage
 * @param bucket - The storage bucket name
 * @param filePath - The path to the file to delete
 * @returns Promise with deletion result
 */
export async function deleteFile(
    bucket: string,
    filePath: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase.storage
            .from(bucket)
            .remove([filePath]);

        if (error) {
            console.error('Storage deletion error:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Deletion error:', error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown deletion error' 
        };
    }
}

/**
 * Upload proposal PDF to storage and return the path
 * @param proposalId - The proposal ID
 * @param pdfBlob - The PDF blob to upload
 * @returns Promise with the storage path
 */
export async function uploadProposalPDF(
    proposalId: string,
    pdfBlob: Blob
): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `proposal-${proposalId}-${timestamp}.pdf`;
    const filePath = `proposals/${proposalId}/${filename}`;

    const result = await uploadFile('proposal-pdfs', filePath, pdfBlob);
    
    if (result.error) {
        throw new Error(`Failed to upload PDF: ${result.error}`);
    }

    return result.path;
}

/**
 * Get a signed URL for a proposal PDF
 * @param pdfPath - The path to the PDF in storage
 * @param expiresIn - Expiration time in seconds (default: 24 hours)
 * @returns Promise with signed URL
 */
export async function getProposalPDFUrl(
    pdfPath: string,
    expiresIn: number = 86400 // 24 hours
): Promise<string | null> {
    return getSignedUrl('proposal-pdfs', pdfPath, expiresIn);
}

/**
 * Delete old proposal PDFs to save storage space
 * @param proposalId - The proposal ID
 * @param keepLatest - Number of latest PDFs to keep (default: 3)
 * @returns Promise with cleanup result
 */
export async function cleanupOldProposalPDFs(
    proposalId: string,
    keepLatest: number = 3
): Promise<{ success: boolean; deletedCount: number; error?: string }> {
    try {
        // List all PDFs for this proposal
        const { data: files, error: listError } = await supabase.storage
            .from('proposal-pdfs')
            .list(`proposals/${proposalId}`, {
                limit: 100,
                sortBy: { column: 'created_at', order: 'desc' },
            });

        if (listError) {
            return { success: false, deletedCount: 0, error: listError.message };
        }

        if (!files || files.length <= keepLatest) {
            return { success: true, deletedCount: 0 };
        }

        // Delete old files (keep only the latest ones)
        const filesToDelete = files.slice(keepLatest).map(file => 
            `proposals/${proposalId}/${file.name}`
        );

        const { error: deleteError } = await supabase.storage
            .from('proposal-pdfs')
            .remove(filesToDelete);

        if (deleteError) {
            return { success: false, deletedCount: 0, error: deleteError.message };
        }

        return { success: true, deletedCount: filesToDelete.length };
    } catch (error) {
        console.error('Cleanup error:', error);
        return { 
            success: false, 
            deletedCount: 0, 
            error: error instanceof Error ? error.message : 'Unknown cleanup error' 
        };
    }
}
