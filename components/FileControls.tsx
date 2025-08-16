
import React, { useState, useEffect } from 'react';
import type { Status } from '../types';

interface FileControlsProps {
    status: Status;
    fileName: string;
    sheetNames: string[];
    onPickFile: () => void;
    onReload: () => void;
    onForget: () => void;
    onLoadSheet: (name: string) => void;
}

const FileControls: React.FC<FileControlsProps> = ({ status, fileName, sheetNames, onPickFile, onReload, onForget, onLoadSheet }) => {
    const [selectedSheet, setSelectedSheet] = useState('');

    useEffect(() => {
        if (sheetNames.length > 0) {
            const preferred = sheetNames.find(n => n.toLowerCase() === 'msdyn_workorder') || sheetNames[0];
            setSelectedSheet(preferred);
            onLoadSheet(preferred);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sheetNames]);

    const handleLoadClick = () => {
        if (selectedSheet) {
            onLoadSheet(selectedSheet);
        }
    };

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
                <div className="flex items-center gap-2">
                    <span className={`inline-flex h-3 w-3 rounded-full ${status.ok ? 'bg-emerald-500' : 'bg-amber-400'}`}></span>
                    <span className="text-sm">{status.text}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <button onClick={onPickFile} className="px-3 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700">Επιλογή αρχείου…</button>
                    <button onClick={onReload} className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200">Ανανέωση</button>
                    <button onClick={onForget} className="px-3 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100">Καθαρισμός άδειας</button>
                    
                    {sheetNames.length > 0 && (
                        <>
                            <select 
                                id="sheetSelect" 
                                className="px-2 py-2 rounded-xl border bg-white text-sm"
                                value={selectedSheet}
                                onChange={(e) => setSelectedSheet(e.target.value)}
                            >
                                {sheetNames.map(name => <option key={name} value={name}>{name}</option>)}
                            </select>
                            <button onClick={handleLoadClick} className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200">Φόρτωση φύλλου</button>
                        </>
                    )}
                </div>
            </div>
            {fileName && <p className="text-xs text-slate-500 mt-2">{fileName}</p>}
            <p className="text-xs text-slate-500 mt-1">
                Σενάριο "Λύση Β": Μία φορά δίνεις άδεια πρόσβασης στο Excel. Από την επόμενη εκτέλεση, το εργαλείο προσπαθεί να το ανοίξει αυτόματα.
            </p>
        </>
    );
};

export default FileControls;
