import React, { useState, useEffect, useCallback } from 'react';
import { ExtractedTable, ExtractedCell } from '../../../lib/extraction-core/model/types';
import { Plus, Minus, Type, AlertCircle } from 'lucide-react';

interface Props {
    table: ExtractedTable;
    onUpdateTable: (table: ExtractedTable) => void;
    aiSuggestions?: any;
    onClearAiSuggestions?: () => void;
}

export default function SpreadsheetEditor({ table, onUpdateTable, aiSuggestions, onClearAiSuggestions }: Props) {
    const [editingCellId, setEditingCellId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");
    
    // History for Undo/Redo
    const [history, setHistory] = useState<ExtractedTable[]>([table]);
    const [historyIndex, setHistoryIndex] = useState(0);

    // Sync if parent table changes completely outside editor
    useEffect(() => {
        if (history[historyIndex].id !== table.id) {
            setHistory([table]);
            setHistoryIndex(0);
        }
    }, [table.id]);

    const commitChange = (newTable: ExtractedTable) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newTable);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        onUpdateTable(newTable);
    };

    const handleUndo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            onUpdateTable(history[historyIndex - 1]);
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            onUpdateTable(history[historyIndex + 1]);
        }
    };

    const handleCellDoubleClick = (cell: ExtractedCell) => {
        setEditingCellId(cell.id);
        setEditValue(cell.text);
    };

    const handleCellBlur = (cell: ExtractedCell) => {
        if (editingCellId === cell.id) {
            if (cell.text !== editValue) {
                const newCells = table.cells.map(c => 
                    c.id === cell.id ? { ...c, text: editValue, edited: true } : c
                );
                commitChange({ ...table, cells: newCells });
            }
            setEditingCellId(null);
        }
    };

    const handleAddRow = () => {
        const newRowIndex = table.rowCount;
        const newCells = [...table.cells];
        for (let c = 0; c < table.columnCount; c++) {
            newCells.push({
                id: `${table.id}-${newRowIndex}-${c}-new`,
                tableId: table.id,
                row: newRowIndex,
                column: c,
                text: "",
                pageNumber: table.pageNumbers[0],
                bbox: { x: 0, y: 0, width: 0, height: 0 },
                sourceItemRefs: [],
                isHeader: false,
                isMerged: false,
                edited: true
            });
        }
        commitChange({ ...table, rowCount: newRowIndex + 1, cells: newCells });
    };

    const handleAddColumn = () => {
        const newColIndex = table.columnCount;
        const newCells = [...table.cells];
        for (let r = 0; r < table.rowCount; r++) {
            newCells.push({
                id: `${table.id}-${r}-${newColIndex}-new`,
                tableId: table.id,
                row: r,
                column: newColIndex,
                text: "",
                pageNumber: table.pageNumbers[0],
                bbox: { x: 0, y: 0, width: 0, height: 0 },
                sourceItemRefs: [],
                isHeader: false,
                isMerged: false,
                edited: true
            });
        }
        commitChange({ ...table, columnCount: newColIndex + 1, cells: newCells });
    };

    const handleDeleteRow = (r: number) => {
        if (table.rowCount <= 1) return;
        const newCells = table.cells
            .filter(c => c.row !== r)
            .map(c => c.row > r ? { ...c, row: c.row - 1 } : c);
        commitChange({ ...table, rowCount: table.rowCount - 1, cells: newCells });
    };

    const handleDeleteColumn = (c: number) => {
        if (table.columnCount <= 1) return;
        const newCells = table.cells
            .filter(cell => cell.column !== c)
            .map(cell => cell.column > c ? { ...cell, column: cell.column - 1 } : cell);
        commitChange({ ...table, columnCount: table.columnCount - 1, cells: newCells });
    };

    const toggleHeader = () => {
        const isCurrentlyHeader = table.headerRow === 0;
        const newHeaderRow = isCurrentlyHeader ? undefined : 0;
        const newCells = table.cells.map(c => c.row === 0 ? { ...c, isHeader: !isCurrentlyHeader } : c);
        commitChange({ ...table, headerRow: newHeaderRow, cells: newCells });
    };

    const applyAiSuggestions = () => {
        if (!aiSuggestions || !aiSuggestions.operations) return;
        let newTable = { ...table, cells: [...table.cells] };

        // Process header suggestion
        if (aiSuggestions.headerSuggestion) {
            newTable.headerRow = aiSuggestions.headerSuggestion.row;
            newTable.cells = newTable.cells.map(c => 
                c.row === newTable.headerRow ? { ...c, isHeader: true } : c
            );
        }

        // Process move/merge operations
        for (const op of aiSuggestions.operations) {
            if (op.type === 'move-cell') {
                const cellIndex = newTable.cells.findIndex(c => c.id === op.cellId);
                if (cellIndex !== -1) {
                    newTable.cells[cellIndex] = {
                        ...newTable.cells[cellIndex],
                        row: op.toRow,
                        column: op.toColumn,
                        edited: true
                    };
                }
            } else if (op.type === 'merge-cells') {
                const primaryIndex = newTable.cells.findIndex(c => c.id === op.primaryCellId);
                if (primaryIndex !== -1) {
                    const primary = newTable.cells[primaryIndex];
                    let mergedText = primary.text;
                    const idsToRemove = new Set(op.mergeWithCellIds);
                    
                    const toMerge = newTable.cells.filter(c => idsToRemove.has(c.id));
                    for (const c of toMerge) {
                        mergedText += (mergedText.length > 0 ? " " : "") + c.text;
                    }
                    
                    newTable.cells[primaryIndex] = {
                        ...primary,
                        text: mergedText,
                        edited: true,
                        isMerged: true
                    };
                    
                    // Remove the merged cells
                    newTable.cells = newTable.cells.filter(c => !idsToRemove.has(c.id));
                }
            }
        }
        
        // Remove issues flags since they have been reviewed
        newTable.issues = [];
        
        commitChange(newTable);
        if (onClearAiSuggestions) onClearAiSuggestions();
    };

    // Render Grid
    const grid: ExtractedCell[][] = Array.from({ length: table.rowCount }, () => Array(table.columnCount));
    table.cells.forEach(cell => {
        if (cell.row < table.rowCount && cell.column < table.columnCount) {
            grid[cell.row][cell.column] = cell;
        }
    });

    return (
        <div className="pdf-editor-container">
            {aiSuggestions && (
                <div className="pdf-ai-suggestions-panel" style={{ padding: '1rem', background: '#fffbeb', borderBottom: '1px solid #fcd34d' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertCircle size={16} /> AI Structure Suggestions
                    </h4>
                    <ul style={{ margin: '0 0 1rem 0', paddingLeft: '1.5rem', fontSize: '0.9rem' }}>
                        {aiSuggestions.headerSuggestion && (
                            <li>Mark Row {aiSuggestions.headerSuggestion.row + 1} as Table Header.</li>
                        )}
                        {aiSuggestions.operations?.map((op: any, i: number) => (
                            <li key={i}>{op.reason}</li>
                        ))}
                        {aiSuggestions.warnings?.map((w: string, i: number) => (
                            <li key={'w'+i} style={{ color: '#d97706' }}>Warning: {w}</li>
                        ))}
                        {(!aiSuggestions.operations?.length && !aiSuggestions.headerSuggestion) && (
                            <li>AI analyzed the table and found no structure changes to recommend.</li>
                        )}
                    </ul>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {(aiSuggestions.operations?.length > 0 || aiSuggestions.headerSuggestion) && (
                            <button onClick={applyAiSuggestions} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '0.25rem 0.75rem', borderRadius: '4px', cursor: 'pointer' }}>Apply Suggestions</button>
                        )}
                        <button onClick={onClearAiSuggestions} style={{ background: 'transparent', border: '1px solid #d1d5db', padding: '0.25rem 0.75rem', borderRadius: '4px', cursor: 'pointer' }}>Dismiss</button>
                    </div>
                </div>
            )}
            <div className="pdf-editor-toolbar">
                <button onClick={handleUndo} disabled={historyIndex === 0} title="Undo">Undo</button>
                <button onClick={handleRedo} disabled={historyIndex === history.length - 1} title="Redo">Redo</button>
                <div className="pdf-editor-divider" />
                <button onClick={handleAddRow}><Plus size={14}/> Row</button>
                <button onClick={handleAddColumn}><Plus size={14}/> Column</button>
                <button onClick={toggleHeader} className={table.headerRow === 0 ? 'active' : ''}>
                    <Type size={14}/> Header
                </button>
            </div>
            
            <div className="pdf-editor-grid-wrapper">
                <table className="pdf-editor-grid">
                    <thead>
                        <tr>
                            <th className="pdf-editor-row-handle"></th>
                            {Array.from({ length: table.columnCount }).map((_, c) => (
                                <th key={c}>
                                    <div className="pdf-editor-col-header">
                                        Col {c + 1}
                                        <button className="pdf-delete-btn" onClick={() => handleDeleteColumn(c)}><Minus size={12}/></button>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {grid.map((row, rIndex) => (
                            <tr key={rIndex}>
                                <td className="pdf-editor-row-handle">
                                    {rIndex + 1}
                                    <button className="pdf-delete-btn" onClick={() => handleDeleteRow(rIndex)}><Minus size={12}/></button>
                                </td>
                                {row.map((cell, cIndex) => {
                                    if (!cell) return <td key={cIndex} className="pdf-editor-empty-cell"></td>;
                                    
                                    const isEditing = editingCellId === cell.id;
                                    const hasWarning = cell.issues && cell.issues.length > 0;
                                    const isHeader = cell.isHeader || table.headerRow === cell.row;

                                    return (
                                        <td 
                                            key={cell.id} 
                                            className={`pdf-editor-cell ${isHeader ? 'header-cell' : ''} ${cell.edited ? 'edited-cell' : ''}`}
                                            onDoubleClick={() => handleCellDoubleClick(cell)}
                                        >
                                            {isEditing ? (
                                                <textarea
                                                    autoFocus
                                                    value={editValue}
                                                    onChange={e => setEditValue(e.target.value)}
                                                    onBlur={() => handleCellBlur(cell)}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            e.currentTarget.blur();
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <div className="pdf-editor-cell-content">
                                                    {cell.text}
                                                    {hasWarning && (
                                                        <span className="pdf-editor-warning-icon" title={cell.issues?.join(", ")}>
                                                            <AlertCircle size={12} />
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
