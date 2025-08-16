
import React from 'react';
import type { Kpi } from '../types';
import { fmtNum, fmtPct } from '../services/excelProcessor';

interface KpiCardsProps {
    kpis: Kpi;
}

const KpiCards: React.FC<KpiCardsProps> = ({ kpis }) => {
    const cardData = [
        { label: 'Σύνολο Εργασιών', value: fmtNum(kpis.totalJobs) },
        { label: '% In Range', value: fmtPct(kpis.avgInRange) },
        { label: '% Set ≤1d', value: fmtPct(kpis.avgSet1d) },
        { label: '% Appt = Completion', value: fmtPct(kpis.avgApptEq) },
        { label: 'Median (ημ.)', value: kpis.medOfMedians == null ? '—' : fmtNum(kpis.medOfMedians) },
        { label: 'Μ.Ο. Final Score', value: kpis.avgFinal == null ? '—' : (kpis.avgFinal * 100).toFixed(1) }
    ];

    return (
        <section className="mb-6 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
            {cardData.map(c => (
                <div key={c.label} className="bg-white rounded-2xl shadow p-3">
                    <div className="text-xs text-slate-500">{c.label}</div>
                    <div className="text-xl font-semibold">{c.value}</div>
                </div>
            ))}
        </section>
    );
};

export default KpiCards;
