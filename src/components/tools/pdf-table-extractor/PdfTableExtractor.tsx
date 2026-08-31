'use client';

import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, Loader2, Download, Copy, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { ExtractedTable } from '../../../lib/extraction-core/model/types';
import SpreadsheetEditor from './SpreadsheetEditor';
import PdfDebugCanvas from './PdfDebugCanvas';
import { serializeToCsv } from '../../../lib/extraction-core/export/csv';
import '@/styles/pdf-table-extractor.css';

// ─── Processing stage types ────────────────────────────────────
type ProcessingStage =
    | 'idle'
    | 'loading-library'
    | 'loading-pdf'
    | 'pdf-loaded'
    | 'processing-page'
    | 'detecting-tables'
    | 'complete'
    | 'error'
    | 'cancelled';

interface ProgressInfo {
    stage: ProcessingStage;
    page?: number;
    totalPages?: number;
    message?: string;
}

// ─── Resource limits ───────────────────────────────────────────
const MAX_FILE_BYTES = 100 * 1024 * 1024; // 100 MB
const MAX_PAGE_COUNT = 100;
const INIT_TIMEOUT_MS = 30_000; // 30 seconds for library load

export default function PdfTableExtractor() {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<ProcessingStage>('idle');
    const [progress, setProgress] = useState<ProgressInfo | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [tables, setTables] = useState<ExtractedTable[]>([]);
    const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
    const [showDebug, setShowDebug] = useState<boolean>(false);
    
    // AI State
    const [isRefiningAI, setIsRefiningAI] = useState<boolean>(false);
    const [aiRateLimitError, setAiRateLimitError] = useState<string>('');
    const [aiSuggestionsMap, setAiSuggestionsMap] = useState<Record<string, any>>({});

    // Cancellation ref — checked between async stages
    const cancelledRef = useRef(false);

    // ── Validate the uploaded file ──────────────────────────────
    const validateFile = (f: File): string | null => {
        if (f.size > MAX_FILE_BYTES) {
            return `File is too large (${(f.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is ${MAX_FILE_BYTES / 1024 / 1024} MB.`;
        }
        if (f.type && f.type !== 'application/pdf') {
            return 'Please upload a valid PDF file.';
        }
        return null;
    };

    // ── Core processing pipeline (main thread, async) ───────────
    const processPdf = useCallback(async (uploadedFile: File) => {
        cancelledRef.current = false;
        setStatus('loading-library');
        setProgress({ stage: 'loading-library', message: 'Loading PDF engine…' });

        try {
            // ── Stage 1: Lazy-load pdfjs-dist ──────────────────
            const pdfjsLib = await Promise.race([
                import('pdfjs-dist'),
                new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error('PDF engine took too long to load. Please check your network connection and try again.')), INIT_TIMEOUT_MS)
                ),
            ]);

            if (cancelledRef.current) return;

            // Configure pdf.js worker — point to the local build file
            // Using the build worker bundled with pdfjs-dist
            pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
                'pdfjs-dist/build/pdf.worker.min.mjs',
                import.meta.url
            ).toString();

            setStatus('loading-pdf');
            setProgress({ stage: 'loading-pdf', message: 'Reading PDF file…' });

            // ── Stage 2: Read PDF binary ───────────────────────
            const arrayBuffer = await uploadedFile.arrayBuffer();
            if (cancelledRef.current) return;

            // Quick PDF signature check
            const header = new Uint8Array(arrayBuffer.slice(0, 5));
            const signature = String.fromCharCode(...header);
            if (!signature.startsWith('%PDF-')) {
                throw new Error('This file does not appear to be a valid PDF (missing %PDF- signature).');
            }

            // ── Stage 3: Load document ─────────────────────────
            const loadingTask = pdfjsLib.getDocument({
                data: arrayBuffer,
                useWorkerFetch: false,
                useSystemFonts: true,
            });

            const pdf = await loadingTask.promise;
            if (cancelledRef.current) return;

            const numPages = pdf.numPages;
            if (numPages > MAX_PAGE_COUNT) {
                throw new Error(`This PDF contains ${numPages} pages. The current limit is ${MAX_PAGE_COUNT} pages.`);
            }

            setStatus('pdf-loaded');
            setProgress({ stage: 'pdf-loaded', totalPages: numPages, message: `PDF loaded — ${numPages} page${numPages !== 1 ? 's' : ''}.` });

                // ── Stage 4: Lazy-load extraction engine ───────────
            const { parsePdfPage } = await import('../../../lib/providers/pdf/parser');
            const { detectTables } = await import('../../../lib/extraction-core/detection/candidates');

            if (cancelledRef.current) return;

            // ── Stage 5: Process each page ─────────────────────
            const allTables: ExtractedTable[] = [];

            for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                if (cancelledRef.current) return;

                setStatus('processing-page');
                setProgress({ stage: 'processing-page', page: pageNum, totalPages: numPages, message: `Extracting text and structure from page ${pageNum} of ${numPages}…` });

                const { items, segments, isScanned, taggedStructure } = await parsePdfPage(pdf, pageNum);

                if (isScanned) {
                    throw new Error(`Page ${pageNum} appears to be a scanned image. OCR support is not yet available — automatic table detection requires a text-based PDF.`);
                }

                if (cancelledRef.current) return;

                // ── Stage 6: Detect tables for this page ───────
                setProgress({ stage: 'detecting-tables', page: pageNum, totalPages: numPages, message: `Detecting tables on page ${pageNum} of ${numPages}…` });

                if (items.length > 0) {
                    const pageTables = detectTables(pageNum, items, segments, taggedStructure); 
                    allTables.push(...pageTables);
                }
            }

            if (cancelledRef.current) return;

            // ── Done ───────────────────────────────────────────
            setTables(allTables);
            if (allTables.length > 0) {
                setSelectedTableId(allTables[0].id);
            }
            setStatus('complete');
            setProgress({ stage: 'complete', totalPages: numPages, message: `Found ${allTables.length} table${allTables.length !== 1 ? 's' : ''}.` });

        } catch (err: any) {
            if (cancelledRef.current) return;
            console.error('[PdfTableExtractor] Processing error:', err);
            setErrorMessage(err?.message || 'An unknown error occurred during PDF processing.');
            setStatus('error');
            setProgress(null);
        }
    }, []);

    // ── File upload handler ─────────────────────────────────────
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const uploadedFile = files[0];

        const validationError = validateFile(uploadedFile);
        if (validationError) {
            setErrorMessage(validationError);
            setStatus('error');
            return;
        }

        setFile(uploadedFile);
        setErrorMessage('');
        setProgress(null);
        setTables([]);
        setSelectedTableId(null);

        processPdf(uploadedFile);
    };

    // ── Cancel handler ──────────────────────────────────────────
    const handleCancel = () => {
        cancelledRef.current = true;
        setStatus('idle');
        setFile(null);
        setProgress(null);
        setTables([]);
        setSelectedTableId(null);
    };

    // ── Table update from editor ────────────────────────────────
    const handleUpdateTable = (updatedTable: ExtractedTable) => {
        setTables(prev => prev.map(t => t.id === updatedTable.id ? updatedTable : t));
    };

    // ── Export helpers ───────────────────────────────────────────
    const sanitizeFilename = (name: string): string => {
        return name
            .replace(/\.pdf$/i, '')
            .replace(/[^a-zA-Z0-9\s\-_]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .toLowerCase() || 'extracted-table';
    };

    const exportCsv = () => {
        const table = tables.find(t => t.id === selectedTableId);
        if (!table) return;

        const csv = serializeToCsv(table);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const baseName = file ? sanitizeFilename(file.name) : 'table';
        link.href = URL.createObjectURL(blob);
        link.download = `${baseName}-tables.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
    };

    const exportXlsx = async () => {
        const table = tables.find(t => t.id === selectedTableId);
        if (!table) return;

        try {
            const { serializeToXlsx } = await import('../../../lib/extraction-core/export/xlsx');
            const blob = await serializeToXlsx(table);
            const link = document.createElement('a');
            const baseName = file ? sanitizeFilename(file.name) : 'table';
            link.href = URL.createObjectURL(blob);
            link.download = `${baseName}-tables.xlsx`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch (err) {
            console.error('XLSX Export Error:', err);
            setErrorMessage('Failed to export XLSX. Your data is still available — try CSV instead.');
        }
    };

    const copyToClipboard = () => {
        const table = tables.find(t => t.id === selectedTableId);
        if (!table) return;

        const { cells, rowCount, columnCount } = table;
        const grid: string[][] = Array.from({ length: rowCount }, () => Array(columnCount).fill(''));

        for (const cell of cells) {
            if (cell.row >= 0 && cell.row < rowCount && cell.column >= 0 && cell.column < columnCount) {
                grid[cell.row][cell.column] = cell.text.replace(/\t/g, ' ').replace(/\n/g, ' ');
            }
        }

        const tsv = grid.map(row => row.join('\t')).join('\n');
        navigator.clipboard.writeText(tsv).catch(err => {
            console.error('Failed to copy', err);
        });
    };

    // ── AI Refinement ───────────────────────────────────────────
    const handleImproveWithAI = async () => {
        const table = tables.find(t => t.id === selectedTableId);
        if (!table) return;

        setIsRefiningAI(true);
        setAiRateLimitError('');

        try {
            const payload = {
                tableId: table.id,
                columns: table.columnCount,
                rows: table.rowCount,
                issues: table.issues || [],
                cells: table.cells.map(c => ({
                    id: c.id,
                    row: c.row,
                    column: c.column,
                    text: c.text,
                    isMerged: c.isMerged,
                    colSpan: c.colSpan
                }))
            };

            const response = await fetch('/api/pdf-table/ai-refine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                if (response.status === 429) {
                    setAiRateLimitError(errData.error || 'Rate limit reached.');
                } else {
                    setAiRateLimitError('AI refinement is temporarily unavailable. Your normal table extraction still works.');
                }
                setIsRefiningAI(false);
                return;
            }

            const data = await response.json();
            setAiSuggestionsMap(prev => ({ ...prev, [table.id]: data.result }));
            if (data.remaining !== undefined) {
                // Could optionally display remaining uses to the user
            }
        } catch (error) {
            setAiRateLimitError('AI refinement is temporarily unavailable.');
        } finally {
            setIsRefiningAI(false);
        }
    };

    // ── Derived state ───────────────────────────────────────────
    const selectedTable = tables.find(t => t.id === selectedTableId);
    const isProcessing = status !== 'idle' && status !== 'complete' && status !== 'error' && status !== 'cancelled';

    // ── Render ──────────────────────────────────────────────────
    return (
        <div className="pdf-extractor-app">
            {status === 'idle' && (
                <div className="pdf-upload-container">
                    <input
                        type="file"
                        accept="application/pdf"
                        id="pdf-upload"
                        onChange={handleFileUpload}
                        className="hidden-input"
                    />
                    <label htmlFor="pdf-upload" className="pdf-upload-box">
                        <UploadCloud size={48} className="upload-icon" />
                        <h3>Select a PDF file</h3>
                        <p>Your PDF is processed locally in your browser.</p>
                        <span className="upload-btn">Browse Files</span>
                    </label>
                </div>
            )}

            {isProcessing && (
                <div className="pdf-processing-state">
                    <Loader2 size={32} className="animate-spin text-accent" />
                    <h3>Analyzing PDF…</h3>
                    <p>{progress?.message || 'Starting…'}</p>
                    <button className="cancel-btn" onClick={handleCancel}>Cancel Processing</button>
                </div>
            )}

            {status === 'error' && (
                <div className="pdf-error-state">
                    <AlertCircle size={48} className="error-icon" />
                    <h3>Error Processing PDF</h3>
                    <p>{errorMessage}</p>
                    <div className="error-actions">
                        <button className="try-again-btn" onClick={() => { if (file) { setErrorMessage(''); processPdf(file); } else { setStatus('idle'); } }}>Try Again</button>
                        <button className="cancel-btn" onClick={() => { setStatus('idle'); setFile(null); setErrorMessage(''); }}>Start Over</button>
                    </div>
                </div>
            )}

            {status === 'complete' && (
                <div className="pdf-workspace">
                    <div className="pdf-sidebar">
                        <h3>Tables Found ({tables.length})</h3>
                        {tables.length === 0 ? (
                            <div className="no-tables-message">
                                <p>No tables detected automatically.</p>
                                <button className="secondary-btn">Select Table Area</button>
                            </div>
                        ) : (
                            <ul className="table-list">
                                {tables.map(table => (
                                    <li
                                        key={table.id}
                                        className={table.id === selectedTableId ? 'active' : ''}
                                        onClick={() => setSelectedTableId(table.id)}
                                    >
                                        <div className="table-list-info">
                                            <strong>Table on Page {table.pageNumbers[0]}</strong>
                                            <span>{table.rowCount} × {table.columnCount}</span>
                                        </div>
                                        {table.issues && table.issues.length > 0 && (
                                            <span className="badge warning">Review Recommended</span>
                                        )}
                                        {(!table.issues || table.issues.length === 0) && (
                                            <span className="badge success">High Confidence</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                        <button className="new-file-btn" onClick={() => { setStatus('idle'); setFile(null); }}>Upload Another PDF</button>
                    </div>

                    <div className="pdf-main-area">
                        {selectedTable ? (
                            <>
                                <div className="pdf-main-header">
                                    <div className="pdf-export-actions">
                                        {selectedTable.issues && selectedTable.issues.length > 0 && (
                                            <button 
                                                onClick={handleImproveWithAI} 
                                                disabled={isRefiningAI}
                                                style={{ background: '#f59e0b', color: 'white', border: 'none' }}
                                            >
                                                {isRefiningAI ? 'Analyzing...' : '✨ Improve Structure with AI'}
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => setShowDebug(!showDebug)}
                                            style={{ background: showDebug ? '#e2e8f0' : 'transparent', color: '#334155' }}
                                        >
                                            Developer Debug
                                        </button>
                                        <button onClick={exportCsv}><Download size={14} /> CSV</button>
                                        <button onClick={exportXlsx}><FileSpreadsheet size={14} /> Excel</button>
                                        <button onClick={copyToClipboard}><Copy size={14} /> Copy</button>
                                    </div>
                                </div>
                                {aiRateLimitError && (
                                    <div className="pdf-ai-error">
                                        <AlertCircle size={16} /> {aiRateLimitError}
                                    </div>
                                )}
                                {showDebug && file ? (
                                    <div style={{ overflow: 'auto', maxHeight: '80vh' }}>
                                        <PdfDebugCanvas file={file} table={selectedTable} />
                                    </div>
                                ) : (
                                    <SpreadsheetEditor
                                        table={selectedTable}
                                        onUpdateTable={handleUpdateTable}
                                        aiSuggestions={aiSuggestionsMap[selectedTable.id]}
                                        onClearAiSuggestions={() => setAiSuggestionsMap(prev => {
                                            const newMap = { ...prev };
                                            delete newMap[selectedTable.id];
                                            return newMap;
                                        })}
                                    />
                                )}
                            </>
                        ) : (
                            <div className="empty-workspace">
                                <p>Select a table from the sidebar to review and export.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
