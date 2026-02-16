import RNPrint from 'react-native-print';
import Share from 'react-native-share';
import { Platform } from 'react-native';

class FileService {
    /**
     * Generate and print/save PDF from HTML content
     * @param html HTML content string
     * @param jobName Optional job name
     */
    async printPDF(html: string, jobName: string = 'Document') {
        try {
            await RNPrint.print({
                html,
                jobName,
            });
        } catch (error) {
            console.error('PDF Generation failed:', error);
            throw error;
        }
    }

    /**
     * Share content or file
     * @param options Share options
     */
    async share(options: { title?: string; message?: string; url?: string; type?: string }) {
        try {
            await Share.open(options);
        } catch (error) {
            console.log('Share cancelled or failed:', error);
            // Don't throw if user cancelled
        }
    }
}

export const fileService = new FileService();
