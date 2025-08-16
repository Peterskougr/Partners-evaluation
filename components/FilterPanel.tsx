
import React, { useState } from 'react';
import type { Filters } from '../types';

interface FilterPanelProps {
    onFilter: (filters: Filters) => void;
    onClear: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onFilter, onClear }) => {
    const [completedFrom, setCompletedFrom] = useState('');
    const [completedTo, setCompletedTo] = useState('');
    const [service, setService] = useState('');
    const [product, setProduct] = useState('');
    const [zip, setZip] = useState('');

    const handleApply = () => {
        onFilter({ completedFrom, completedTo, service, product, zip });
    };

    const handleClear = () => {
        setCompletedFrom('');
        setCompletedTo('');
        setService('');
        setProduct('');
        setZip('');
        onClear();
    };

    return (
        <div className="bg-white rounded-2xl shadow p-4">
            <h2 className="font-semibold mb-2">Φίλτρα</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                    <label className="block text-xs text-slate-500">Completed από</label>
                    <input type="date" value={completedFrom} onChange={e => setCompletedFrom(e.target.value)} className="w-full border rounded px-2 py-1" />
                </div>
                <div>
                    <label className="block text-xs text-slate-500">Completed έως</label>
                    <input type="date" value={completedTo} onChange={e => setCompletedTo(e.target.value)} className="w-full border rounded px-2 py-1" />
                </div>
                <div>
                    <label className="block text-xs text-slate-500">Service</label>
                    <input type="text" placeholder="π.χ. Εγκατάσταση" value={service} onChange={e => setService(e.target.value)} className="w-full border rounded px-2 py-1" />
                </div>
                <div>
                    <label className="block text-xs text-slate-500">Product (SKU/Name)</label>
                    <input type="text" placeholder="π.χ. AC" value={product} onChange={e => setProduct(e.target.value)} className="w-full border rounded px-2 py-1" />
                </div>
                <div>
                    <label className="block text-xs text-slate-500">Postal Code</label>
                    <input type="text" placeholder="π.χ. 10445" value={zip} onChange={e => setZip(e.target.value)} className="w-full border rounded px-2 py-1" />
                </div>
            </div>
            <div className="flex gap-2 mt-3">
                <button onClick={handleApply} className="px-3 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800">Εφαρμογή φίλτρων</button>
                <button onClick={handleClear} className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200">Καθαρισμός</button>
            </div>
        </div>
    );
};

export default FilterPanel;
