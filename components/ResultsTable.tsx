import React, { useState, useMemo } from 'react';
import type { AggregatedResult } from '../types';
import { fmtNum, fmtPct } from '../services/excelProcessor';
import { ExpandIcon, CollapseIcon } from './icons';

type SortKey = keyof AggregatedResult | 'rank';

interface ResultsTableProps {
    data: AggregatedResult[];
    level: 'installer' | 'technician';
    childrenMap?: Map<string, AggregatedResult[]>;
}

const NestedTable: React.FC<{ items: AggregatedResult[] }> = ({ items }) => (
    <div className="p-2 bg-slate-50 rounded-xl">
        <div className="text-xs text-slate-500 mb-1">Τεχνικοί</div>
        <div className="overflow-x-auto">
            <table className="text-xs w-full">
                <thead>
                    <tr className="border-b">
                        <th className="text-left p-2 font-medium">Τεχνικός</th>
                        <th className="text-left p-2 font-medium">Jobs</th>
                        <th className="text-left p-2 font-medium">%InRange</th>
                        <th className="text-left p-2 font-medium">%Set≤1d</th>
                        <th className="text-left p-2 font-medium">%Appt=Comp</th>
                        <th className="text-left p-2 font-medium">Median</th>
                        <th className="text-left p-2 font-medium">Raw</th>
                        <th className="text-left p-2 font-medium">Final</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(i => (
                        <tr key={i.key} className="border-b border-slate-100 last:border-b-0">
                            <td className="p-2">{i.technician || '—'}</td>
                            <td className="p-2">{fmtNum(i.jobs)}</td>
                            <td className="p-2">{fmtPct(i.pctInRange)}</td>
                            <td className="p-2">{fmtPct(i.pctSet1d)}</td>
                            <td className="p-2">{fmtPct(i.pctApptEq)}</td>
                            <td className="p-2">{i.medDays == null ? '—' : fmtNum(i.medDays)}</td>
                            <td className="p-2">{i.rawScore == null ? '—' : i.rawScore.toFixed(1)}</td>
                            <td className="p-2">{i.finalScore == null ? '—' : i.finalScore.toFixed(1)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);


const ResultsTable: React.FC<ResultsTableProps> = ({ data, level, childrenMap }) => {
    const [sortKey, setSortKey] = useState<SortKey>('finalScore');
    const [sortAsc, setSortAsc] = useState(false);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const sortedData = useMemo(() => {
        return [...data].sort((a, b) => {
            const va = a[sortKey as keyof AggregatedResult];
            const vb = b[sortKey as keyof AggregatedResult];
            const na = (va == null || isNaN(va as number)) ? -Infinity : (va as number);
            const nb = (vb == null || isNaN(vb as number)) ? -Infinity : (vb as number);
            return sortAsc ? (na - nb) : (nb - na);
        });
    }, [data, sortKey, sortAsc]);
    
    const handleSort = (key: SortKey) => {
        if (key === 'name') return;
        
        if (key === sortKey) {
            // Same key, toggle direction
            setSortAsc(prev => !prev);
        } else {
            // New key, update key and reset direction to default descending
            setSortKey(key);
            setSortAsc(false);
        }
    };

    const toggleRow = (installerKey: string) => {
        const newSet = new Set(expandedRows);
        if (newSet.has(installerKey)) {
            newSet.delete(installerKey);
        } else {
            newSet.add(installerKey);
        }
        setExpandedRows(newSet);
    };

    const headers: { key: SortKey, label: string }[] = [
        { key: 'rank', label: '#' },
        { key: 'name', label: 'Όνομα' },
        { key: 'jobs', label: 'Jobs' },
        { key: 'pctInRange', label: '%InRange' },
        { key: 'pctSet1d', label: '%Set≤1d' },
        { key: 'pctApptEq', label: '%Appt=Comp' },
        { key: 'medDays', label: 'Median' },
        { key: 'rawScore', label: 'Raw' },
        { key: 'finalScore', label: 'Final' },
    ];
    
    return (
        <>
            <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold">Αποτελέσματα</h2>
                <span className="text-sm text-slate-500">{data.length} εγγραφές</span>
            </div>
            <div className="overflow-x-auto">
                <table className="text-sm w-full">
                    <thead>
                        <tr>
                            {headers.map(h => (
                                <th key={h.key} className="text-left p-2 font-medium cursor-pointer select-none" onClick={() => handleSort(h.key)}>
                                    {h.label}
                                    {sortKey === h.key && <span className="ml-1">{sortAsc ? '▲' : '▼'}</span>}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.map((item, index) => {
                            const isExpanded = level === 'installer' && item.installer != null && expandedRows.has(item.installer);
                            const children = (level === 'installer' && item.installer != null) ? childrenMap?.get(item.installer) : undefined;
                            return (
                                <React.Fragment key={item.key}>
                                    <tr className="border-b hover:bg-slate-50">
                                        <td className="p-2">
                                            <div className="flex items-center gap-2">
                                                {level === 'installer' && children && children.length > 0 && (
                                                    <button onClick={() => item.installer && toggleRow(item.installer)} className="text-slate-600">
                                                        {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
                                                    </button>
                                                )}
                                                <span>{index + 1}</span>
                                            </div>
                                        </td>
                                        <td className="p-2 font-medium">{item.name || '—'}</td>
                                        <td className="p-2">{fmtNum(item.jobs)}</td>
                                        <td className="p-2">{fmtPct(item.pctInRange)}</td>
                                        <td className="p-2">{fmtPct(item.pctSet1d)}</td>
                                        <td className="p-2">{fmtPct(item.pctApptEq)}</td>
                                        <td className="p-2">{item.medDays == null ? '—' : fmtNum(item.medDays)}</td>
                                        <td className="p-2">{item.rawScore == null ? '—' : item.rawScore.toFixed(1)}</td>
                                        <td className="p-2">{item.finalScore == null ? '—' : item.finalScore.toFixed(1)}</td>
                                    </tr>
                                    {isExpanded && children && children.length > 0 && (
                                        <tr className="bg-slate-50">
                                            <td colSpan={9} className="p-2">
                                                <NestedTable items={children} />
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default ResultsTable;