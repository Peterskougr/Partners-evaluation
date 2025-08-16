
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import * as XLSX from 'xlsx';

import type { FileSystemFileHandle } from 'native-fs-access';
import type { AggregatedResult, Filters, Weights, Status } from './types';
import { groupAndCompute, computeScores, buildChildrenMap, getOverallKpis, hasAllEssential, buildColumnMap } from './services/excelProcessor';
import type { ColumnMap } from './services/excelProcessor';
import { idbGet, idbSet, idbDel } from './services/idb';

import Header from './components/Header';
import FileControls from './components/FileControls';
import SettingsPanel from './components/SettingsPanel';
import FilterPanel from './components/FilterPanel';
import ViewPanel from './components/ViewPanel';
import { DEFAULT_WEIGHTS, HANDLE_KEY } from './constants';
import { DataContext } from './DataContext';
import DashboardPage from './DashboardPage';
import PartnerDetailPage from './PartnerDetailPage';


const App: React.FC = () => {
    const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
    const [rawRows, setRawRows] = useState<any[]>([]);
    const [colMap, setColMap] = useState<ColumnMap | null>(null);
    const [status, setStatus] = useState<Status>({ ok: false, text: 'Διάλεξε αρχείο για πρώτη φορά (αποθηκεύεται η άδεια).' });
    
    const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);
    const [kCred, setKCred] = useState<number>(100);
    const [filters, setFilters] = useState<Filters>({
        completedFrom: '', completedTo: '', service: '', product: '', zip: ''
    });
    const [viewMode, setViewMode] = useState<'installer' | 'technician'>('installer');

    const loadFromHandle = useCallback(async (handle: FileSystemFileHandle) => {
        try {
            setStatus({ ok: true, text: 'Φόρτωση αρχείου...' });
            const file = await handle.getFile();
            setFileName(`${file.name} • ${new Date(file.lastModified).toLocaleString('el-GR')}`);
            const buffer = await file.arrayBuffer();
            const wb = XLSX.read(buffer, { type: 'array', cellDates: true });
            setWorkbook(wb);
            setFileHandle(handle);
        } catch (err) {
            console.error(err);
            setStatus({ ok: false, text: 'Σφάλμα ανάγνωσης αρχείου.' });
            setFileHandle(null);
            await idbDel(HANDLE_KEY);
        }
    }, []);

    const tryRestoreHandle = useCallback(async () => {
        try {
            const handle = await idbGet<FileSystemFileHandle>(HANDLE_KEY);
            if (!handle) return;

            const permission = await handle.queryPermission({ mode: 'read' });
            if (permission === 'granted') {
                await loadFromHandle(handle);
            } else {
                setStatus({ ok: false, text: 'Η άδεια πρόσβασης στο αρχείο έχει λήξει. Επιλέξτε το ξανά.' });
            }
        } catch (e) {
            console.warn('Δεν έγινε restore handle:', e);
        }
    }, [loadFromHandle]);
    
    useEffect(() => {
        tryRestoreHandle();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadSheetByName = useCallback((name: string) => {
        if (!workbook) return;
        try {
            const ws = workbook.Sheets[name];
            if (!ws) {
                setStatus({ ok: false, text: 'Δεν βρέθηκε το φύλλο: ' + name });
                return;
            }
            const rows = XLSX.utils.sheet_to_json(ws, { defval: null, raw: true });
            setRawRows(rows);
            
            const headers = Object.keys(rows[0] || {});
            const newColMap = buildColumnMap(headers);
            const essentials = hasAllEssential(newColMap);
            if (!essentials.ok) {
              setStatus({ ok: false, text: 'Λείπουν βασικές στήλες: ' + essentials.missing.join(', ') });
              setRawRows([]);
              setColMap(null);
            } else {
              setColMap(newColMap);
              setStatus({ ok: true, text: `Φορτώθηκε: ${name} (${rows.length} γραμμές)` });
            }

        } catch (e) {
            console.error(e);
            const message = e instanceof Error ? e.message : ' Άγνωστο σφάλμα.';
            setStatus({ ok: false, text: `Σφάλμα στο φύλλο ${name}: ${message}` });
        }
    }, [workbook]);

    const processedData = useMemo(() => {
        if (!rawRows.length || !colMap) return null;
        const { installers, installerTechs } = groupAndCompute(rawRows, colMap, filters);
        
        const scoredInstallers = computeScores(installers, weights, kCred);
        const scoredInstallerTechs = computeScores(installerTechs, weights, kCred);
        const childrenMap = buildChildrenMap(scoredInstallers, scoredInstallerTechs);

        return { installers: scoredInstallers, installerTechs: scoredInstallerTechs, childrenMap };
    }, [rawRows, colMap, filters, weights, kCred]);

    const handlePickFile = async () => {
        try {
            if (!(window as any).showOpenFilePicker) {
                throw new Error('Fallback to input');
            }
            const [handle] = await (window as any).showOpenFilePicker({
                types: [{ description: 'Excel', accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 'application/vnd.ms-excel': ['.xls'] } }],
            });
            await handle.requestPermission({ mode: 'read' });
            await idbSet(HANDLE_KEY, handle);
            await loadFromHandle(handle);
        } catch (err) {
            console.warn('Could not use File System Access API, using fallback.', err);
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.xlsx,.xls';
            input.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                    setFileName(`${file.name} • ${new Date(file.lastModified).toLocaleString('el-GR')}`);
                    const buffer = await file.arrayBuffer();
                    const wb = XLSX.read(buffer, { type: 'array', cellDates: true });
                    setWorkbook(wb);
                    setFileHandle(null); // No handle for fallback
                }
            };
            input.click();
        }
    };

    const handleReload = () => {
        if (fileHandle) {
            loadFromHandle(fileHandle);
        } else {
            handlePickFile();
        }
    };

    const handleForget = async () => {
        await idbDel(HANDLE_KEY);
        setFileHandle(null);
        setWorkbook(null);
        setRawRows([]);
        setFileName('');
        setColMap(null);
        setStatus({ ok: false, text: 'Καθαρίστηκε η αποθήκευση άδειας' });
    };

    const handleApplySettings = useCallback((newWeights: Weights, newKCred: number) => {
        setWeights(newWeights);
        setKCred(newKCred);
        const sum = Object.values(newWeights).reduce((acc, w) => acc + (w * 100), 0);
        setStatus(prev => ({ ...prev, ok: true, text: Math.round(sum) === 100 ? 'Εφαρμόστηκαν τα βάρη.' : `Τα βάρη άθροισμα ${sum.toFixed(0)}%. Έγινε αυτόματη κλιμάκωση.` }));
    }, []);

    const itemsToDisplay: AggregatedResult[] = useMemo(() => {
        if (!processedData) return [];
        return viewMode === 'installer' ? processedData.installers : processedData.installerTechs;
    }, [processedData, viewMode]);

    const kpis = useMemo(() => {
        if (!itemsToDisplay.length) return null;
        return getOverallKpis(itemsToDisplay);
    }, [itemsToDisplay]);

    const contextValue = useMemo(() => ({
        processedData, rawRows, colMap
    }), [processedData, rawRows, colMap]);

    return (
        <DataContext.Provider value={contextValue}>
            <div className="max-w-7xl mx-auto p-4 md:p-6">
                <Header />

                <section className="mb-6 bg-white rounded-2xl shadow p-4 md:p-5">
                    <FileControls
                        status={status}
                        fileName={fileName}
                        sheetNames={workbook?.SheetNames || []}
                        onPickFile={handlePickFile}
                        onReload={handleReload}
                        onForget={handleForget}
                        onLoadSheet={loadSheetByName}
                    />
                </section>
                
                <main className={!workbook ? 'opacity-40 pointer-events-none' : ''}>
                    <section className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <SettingsPanel onApply={handleApplySettings} initialWeights={weights} initialKCred={kCred} />
                        <FilterPanel onFilter={setFilters} onClear={() => setFilters({ completedFrom: '', completedTo: '', service: '', product: '', zip: '' })} />
                        <ViewPanel
                            viewMode={viewMode}
                            onViewModeChange={setViewMode}
                            itemsToExport={itemsToDisplay}
                            fileNamePrefix={viewMode}
                        />
                    </section>
                    
                    <Routes>
                        <Route path="/" element={<DashboardPage kpis={kpis} itemsToDisplay={itemsToDisplay} />} />
                        <Route path="/partner/:partnerKey" element={<PartnerDetailPage viewMode={viewMode} />} />
                    </Routes>
                </main>
            </div>
        </DataContext.Provider>
    );
};

export default App;