
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { AggregatedResult } from '../types';

interface ScoreChartProps {
    data: AggregatedResult[];
}

const ScoreChart: React.FC<ScoreChartProps> = ({ data }) => {
    const topData = data
        .slice(0, 15)
        .map(item => ({
            ...item,
            finalScore: item.finalScore != null ? parseFloat(item.finalScore.toFixed(1)) : 0
        }));

    return (
        <>
            <div className="flex items-center justify-between">
                <h2 className="font-semibold">Σύγκριση Τελικού Σκορ</h2>
                <div className="text-xs text-slate-500">Top 15 με βάση το Final Score</div>
            </div>
            <div className="w-full h-80 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={topData}
                        margin={{ top: 5, right: 20, left: -10, bottom: 5, }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-20} textAnchor="end" height={60} interval={0} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(4px)',
                            border: '1px solid #e2e8f0',
                            borderRadius: '0.75rem',
                          }}
                        />
                        <Legend wrapperStyle={{fontSize: "14px"}} />
                        <Bar dataKey="finalScore" fill="#4f46e5" name="Final Score" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </>
    );
};

export default ScoreChart;
