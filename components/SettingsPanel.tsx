
import React, { useState } from 'react';
import type { Weights } from '../types';

interface SettingsPanelProps {
    onApply: (weights: Weights, kCred: number) => void;
    initialWeights: Weights;
    initialKCred: number;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onApply, initialWeights, initialKCred }) => {
    const [wInRange, setWInRange] = useState(initialWeights.inRange * 100);
    const [wSet1d, setWSet1d] = useState(initialWeights.set1d * 100);
    const [wApptEq, setWApptEq] = useState(initialWeights.apptEq * 100);
    const [wMedian, setWMedian] = useState(initialWeights.median * 100);
    const [kCred, setKCred] = useState(initialKCred);

    const handleApply = () => {
        const weights: Weights = {
            inRange: wInRange / 100,
            set1d: wSet1d / 100,
            apptEq: wApptEq / 100,
            median: wMedian / 100
        };
        onApply(weights, kCred);
    };

    return (
        <div className="bg-white rounded-2xl shadow p-4">
            <h2 className="font-semibold mb-2">Ρυθμίσεις Σκορ</h2>
            <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                    <label className="min-w-[12rem]">% In Range (40%)</label>
                    <input type="number" min="0" max="100" value={wInRange} onChange={e => setWInRange(Number(e.target.value))} className="w-20 border rounded px-2 py-1" />
                </div>
                <div className="flex items-center justify-between gap-2">
                    <label className="min-w-[12rem]">% Set Within 1 Day (25%)</label>
                    <input type="number" min="0" max="100" value={wSet1d} onChange={e => setWSet1d(Number(e.target.value))} className="w-20 border rounded px-2 py-1" />
                </div>
                <div className="flex items-center justify-between gap-2">
                    <label className="min-w-[12rem]">% Appt = Completion (25%)</label>
                    <input type="number" min="0" max="100" value={wApptEq} onChange={e => setWApptEq(Number(e.target.value))} className="w-20 border rounded px-2 py-1" />
                </div>
                <div className="flex items-center justify-between gap-2">
                    <label className="min-w-[12rem]">Median Days (10%)</label>
                    <input type="number" min="0" max="100" value={wMedian} onChange={e => setWMedian(Number(e.target.value))} className="w-20 border rounded px-2 py-1" />
                </div>
                <p className="text-xs text-slate-500">Το άθροισμα πρέπει να είναι 100. Αν όχι, γίνεται αυτόματη κλιμάκωση.</p>
                <div className="flex items-center justify-between gap-2">
                    <label className="min-w-[12rem]">K (Credibility)</label>
                    <input type="number" min="1" value={kCred} onChange={e => setKCred(Math.max(1, Number(e.target.value)))} className="w-24 border rounded px-2 py-1" />
                </div>
                <button onClick={handleApply} className="mt-2 w-full px-3 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800">Εφαρμογή</button>
            </div>
        </div>
    );
};

export default SettingsPanel;
