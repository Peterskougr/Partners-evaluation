
import React from 'react';
import type { AggregatedResult } from '../types';
import { fmtNum, fmtPct } from '../services/excelProcessor';

interface PartnerCardProps {
    partner: AggregatedResult;
}

export const PartnerCard: React.FC<PartnerCardProps> = ({ partner }) => {
    const scoreColor = (score: number | null) => {
        if (score == null) return 'bg-slate-200 text-slate-700';
        if (score >= 85) return 'bg-emerald-100 text-emerald-800';
        if (score >= 70) return 'bg-yellow-100 text-yellow-800';
        return 'bg-rose-100 text-rose-800';
    };

    return (
        <div className="bg-white rounded-2xl shadow p-4 h-full flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-slate-800 mb-2 pr-4">{partner.name}</h3>
                    <div className={`text-lg font-bold px-3 py-1 rounded-full text-sm ${scoreColor(partner.finalScore)}`}>
                        {partner.finalScore != null ? partner.finalScore.toFixed(1) : 'N/A'}
                    </div>
                </div>
                <div className="text-xs text-slate-500">{partner.jobs} Εργασίες</div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                    <div className="text-xs text-slate-500">% In Range</div>
                    <div className="font-medium">{fmtPct(partner.pctInRange)}</div>
                </div>
                <div>
                    <div className="text-xs text-slate-500">% Set≤1d</div>
                    <div className="font-medium">{fmtPct(partner.pctSet1d)}</div>
                </div>
                <div>
                    <div className="text-xs text-slate-500">% Appt=Comp</div>
                    <div className="font-medium">{fmtPct(partner.pctApptEq)}</div>
                </div>
                <div>
                    <div className="text-xs text-slate-500">Median Days</div>
                    <div className="font-medium">{fmtNum(partner.medDays)}</div>
                </div>
            </div>
        </div>
    );
};
