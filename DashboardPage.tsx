
import React from 'react';
import { Link } from 'react-router-dom';
import type { AggregatedResult, Kpi } from './types';
import KpiCards from './components/KpiCards';
import ScoreChart from './components/ScoreChart';
import { PartnerCard } from './components/PartnerCard';

interface DashboardPageProps {
    kpis: Kpi | null;
    itemsToDisplay: AggregatedResult[];
}

const DashboardPage: React.FC<DashboardPageProps> = ({ kpis, itemsToDisplay }) => {
    if (itemsToDisplay.length === 0) {
        return (
            <div className="text-center py-12 text-slate-500">
                <p>Δεν υπάρχουν δεδομένα για προβολή.</p>
                <p className="text-sm">Επιλέξτε ένα αρχείο και φορτώστε ένα φύλλο για να ξεκινήσετε.</p>
            </div>
        );
    }
    
    return (
        <>
            {kpis && <KpiCards kpis={kpis} />}
            
            <section className="mb-6 bg-white rounded-2xl shadow p-4">
                <ScoreChart data={itemsToDisplay} />
            </section>
            
            <section className="mb-12">
                <h2 className="text-xl font-semibold mb-4">Αξιολογήσεις Συνεργατών</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {itemsToDisplay.map(item => (
                        <Link to={`/partner/${encodeURIComponent(item.key)}`} key={item.key} className="block hover:scale-[1.02] transition-transform duration-200">
                           <PartnerCard partner={item} />
                        </Link>
                    ))}
                </div>
            </section>
        </>
    );
};

export default DashboardPage;
