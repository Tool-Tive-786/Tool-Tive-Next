import * as pdfjsLib from 'pdfjs-dist';
import { parsePdfPage } from '../lib/providers/pdf/parser';
import { detectTables } from '../lib/extraction-core/detection/candidates';
import { ExtractedTable } from '../lib/extraction-core/model/types';

// Setup worker source for pdf.js inside this Web Worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

self.onmessage = async (e: MessageEvent) => {
    const { type, payload } = e.data;

    if (type === 'PROCESS_PDF') {
        try {
            const file: File = payload.file;
            const arrayBuffer = await file.arrayBuffer();
            
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            
            const numPages = pdf.numPages;
            const allTables: ExtractedTable[] = [];
            
            for (let i = 1; i <= numPages; i++) {
                // Post progress
                self.postMessage({ type: 'PROGRESS', payload: { page: i, total: numPages } });
                
                const { items, segments } = await parsePdfPage(pdf, i);
                
                if (items.length > 0) {
                    const pageTables = detectTables(i, items, segments);
                    allTables.push(...pageTables);
                }
            }

            self.postMessage({ type: 'SUCCESS', payload: { tables: allTables, numPages } });
        } catch (error: any) {
            self.postMessage({ type: 'ERROR', payload: { message: error.message || 'Unknown error occurred during PDF processing' } });
        }
    }
};
