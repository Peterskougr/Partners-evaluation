
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { AggregatedResult } from '../types';

const PartnerPerfChart: React.FC<{ partner: AggregatedResult }> = ({ partner }) => {
    const data = [
        { subject: '% In Range', A: (partner.pctInRange ?? 0) * 100, fullMark: 100 },
        { subject: '% Set ≤1d', A: (partner.pctSet1d ?? 0) * 100, fullMark: 100 },
        { subject: '% Appt=Comp', A: (partner.pctApptEq ?? 0) * 100, fullMark: 100 },
    ];
    
    return (
        <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }}/>
                    <Radar name={partner.name} dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.6} />
                    <Tooltip contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(4px)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.75rem',
                        }}/>
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}

export default PartnerPerfChart;
