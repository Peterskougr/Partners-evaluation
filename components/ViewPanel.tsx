import React from 'react';
import * as XLSX from 'xlsx';
import type { AggregatedResult } from '../types';

interface ViewPanelProps {
    viewMode: 'installer' | 'technician';
    onViewModeChange: (mode: 'installer' | 'technician') => void;
    itemsToExport: AggregatedResult[];
    fileNamePrefix: string;
}

const ViewPanel: React.FC<ViewPanelProps> = ({ viewMode, onViewModeChange, itemsToExport, fileNamePrefix }) => {
    
    const exportToCSV = () => {
        const filename = `${fileNamePrefix}_results_${new Date().toISOString().slice(0,10)}.csv`;
        const headers = ['Name', 'Jobs', 'PctInRange', 'PctSetWithin1d', 'PctApptEqCompletion', 'MedianDays', 'RawScore', 'FinalScore'];
        const lines = [headers.join(',')];
        for (const i of itemsToExport) {
            lines.push([
                '"' + (i.name || '') + '"', i.jobs,
                (i.pctInRange != null ? (i.pctInRange * 100).toFixed(2) : ''),
                (i.pctSet1d != null ? (i.pctSet1d * 100).toFixed(2) : ''),
                (i.pctApptEq != null ? (i.pctApptEq * 100).toFixed(2) : ''),
                (i.medDays != null ? i.medDays : ''),
                (i.rawScore != null ? i.rawScore.toFixed(2) : ''),
                (i.finalScore != null ? i.finalScore.toFixed(2) : '')
            ].join(','));
        }
        const blob = new Blob([lines.join('\\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
        URL.revokeObjectURL(url);
    };

    const exportToXLSX = () => {
        const filename = `${fileNamePrefix}_results_${new Date().toISOString().slice(0,10)}.xlsx`;
        const aoa: (string | number | null)[][] = [['Name', 'Jobs', 'PctInRange', 'PctSetWithin1d', 'PctApptEqCompletion', 'MedianDays', 'RawScore', 'FinalScore']];
        for (const i of itemsToExport) {
            aoa.push([
                i.name || '', i.jobs,
                (i.pctInRange != null ? (i.pctInRange * 100) : null),
                (i.pctSet1d != null ? (i.pctSet1d * 100) : null),
                (i.pctApptEq != null ? (i.pctApptEq * 100) : null),
                i.medDays,
                (i.rawScore != null ? parseFloat(i.rawScore.toFixed(2)) : null),
                (i.finalScore != null ? parseFloat(i.finalScore.toFixed(2)) : null)
            ]);
        }
        const ws = XLSX.utils.aoa_to_sheet(aoa);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Results');
        XLSX.writeFile(wb, filename);
    };

    return (
        <div className="bg-white rounded-2xl shadow p-4">
            <h2 className="font-semibold mb-2">Προβολή</h2>
            <div className="text-sm space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="viewMode" value="installer" checked={viewMode === 'installer'} onChange={() => onViewModeChange('installer')} />
                    <span>Ανά Συνεργάτη (dot_installeridname)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="viewMode" value="technician" checked={viewMode === 'technician'} onChange={() => onViewModeChange('technician')} />
                    <span>Ανά Τεχνικό (ανά installer)</span>
                </label>
            </div>
            <div className="mt-3 flex gap-2">
                <button onClick={exportToCSV} className="px-3 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">Export CSV</button>
                <button onClick={exportToXLSX} className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100">Export XLSX</button>
            </div>
        </div>
    );
};

export default ViewPanel;