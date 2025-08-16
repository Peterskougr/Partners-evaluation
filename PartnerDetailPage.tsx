
import React, { useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DataContext } from './DataContext';
import ResultsTable from './components/ResultsTable';
import PartnerDetailMap from './components/PartnerDetailMap';
import KpiCards from './components/KpiCards';
import { getOverallKpis } from './services/excelProcessor';
import PartnerPerfChart from './components/PartnerPerfChart';

const PartnerDetailPage: React.FC<{ viewMode: 'installer' | 'technician' }> = ({ viewMode }) => {
    const { partnerKey } = useParams<{ partnerKey: string }>();
    const { processedData } = useContext(DataContext);
    
    if (!processedData) return <div className="text-center py-10">Φόρτωση δεδομένων...</div>;
    
    const decodedPartnerKey = decodeURIComponent(partnerKey || '');
    const partner = [...processedData.installers, ...processedData.installerTechs].find(p => p.key === decodedPartnerKey);
    
    if (!partner) return <div className="text-center py-10">Δεν βρέθηκε ο συνεργάτης. <Link to="/" className="text-indigo-600">Επιστροφή</Link></div>;

    const isInstaller = partner.installer && !partner.technician;
    const children = isInstaller ? processedData.childrenMap.get(partner.installer!) : [];
    const kpis = getOverallKpis([partner]);

    return (
        <div>
            <Link to="/" className="text-indigo-600 hover:underline mb-4 inline-block">&larr; Επιστροφή στην αρχική</Link>
            <h1 className="text-3xl font-bold mb-1">{partner.name}</h1>
            <p className="text-slate-600 mb-6">{partner.jobs} συνολικές εργασίες</p>

            <KpiCards kpis={kpis} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <section className="bg-white rounded-2xl shadow p-4">
                    <h2 className="font-semibold mb-2">Χάρτης Εργασιών</h2>
                    <PartnerDetailMap coordinates={partner.coordinates} />
                </section>
                 <section className="bg-white rounded-2xl shadow p-4">
                    <h2 className="font-semibold mb-2">Ανάλυση KPI</h2>
                    <PartnerPerfChart partner={partner} />
                </section>
            </div>

            {isInstaller && children && children.length > 0 && (
                <section className="mt-6 bg-white rounded-2xl shadow p-4">
                     <h2 className="font-semibold mb-2">Ανάλυση ανά Τεχνικό</h2>
                     <ResultsTable 
                        data={children} 
                        level='technician'
                    />
                </section>
            )}
        </div>
    );
};

export default PartnerDetailPage;
