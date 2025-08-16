
import type { AggregatedResult, Filters, Kpi, ProcessedRow, Weights } from '../types';
import { REQUIRED_COLUMNS } from '../constants';

// --- Formatting Helpers ---
export const fmtPct = (v: number | null | undefined): string => (v == null || isNaN(v)) ? '—' : (v * 100).toFixed(1) + '%';
export const fmtNum = (n: number | null | undefined): string => (n == null || isNaN(n)) ? '—' : new Intl.NumberFormat('el-GR').format(n);

// --- Date Helpers ---
const excelDateToJSDate = (n: number): Date => {
    const utc_days = Math.floor(n - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    const fractional_day = n - Math.floor(n);
    if (fractional_day > 0) {
        const totalSeconds = Math.round(86400 * fractional_day);
        date_info.setSeconds(date_info.getSeconds() + totalSeconds);
    }
    return date_info;
};

const onlyDate = (d?: Date | null): Date | null => {
    if (!d) return null;
    const nd = new Date(d);
    if (isNaN(nd.getTime())) return null;
    nd.setHours(0, 0, 0, 0);
    return nd;
};

const parseDateGuess = (val: any): Date | null => {
    if (val == null || val === '') return null;
    if (val instanceof Date) return onlyDate(val);
    if (typeof val === 'number') return onlyDate(excelDateToJSDate(val));
    if (typeof val === 'string') {
        const s = val.trim();
        const d1 = new Date(s);
        if (!isNaN(d1.getTime())) return onlyDate(d1);
        const m = s.match(/^(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?/);
        if (m) {
            let dd = parseInt(m[1], 10), mm = parseInt(m[2], 10) - 1, yyyy = (m[3] ? parseInt(m[3], 10) : null);
            if (yyyy != null && yyyy < 100) yyyy += 2000;
            const d = new Date();
            d.setHours(0, 0, 0, 0);
            d.setMonth(mm); d.setDate(dd);
            if (yyyy != null) d.setFullYear(yyyy);
            return isNaN(d.getTime()) ? null : d;
        }
    }
    return null;
};

const parseApptRange = (rangeStr: any, contextYear: number): [Date, Date] | null => {
    if (!rangeStr) return null;
    const s = String(rangeStr).trim().toLowerCase();
    const norm = s.replace(/έως|εως|to| έως | εως |–|—/g, '-');
    const re = /(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?/g;
    const matches = [...norm.matchAll(re)].slice(0, 2);
    if (matches.length < 2) return null;

    const partToDate = (m: RegExpMatchArray, fallbackYear: number): Date | null => {
        const dd = parseInt(m[1], 10);
        const mm = parseInt(m[2], 10) - 1;
        let yy = m[3] ? parseInt(m[3], 10) : null;
        if (yy != null && yy < 100) yy += 2000;
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setMonth(mm); d.setDate(dd);
        d.setFullYear(yy || fallbackYear || new Date().getFullYear());
        return isNaN(d.getTime()) ? null : d;
    }
    const start = partToDate(matches[0], contextYear);
    const end = partToDate(matches[1], contextYear);
    if (!start || !end) return null;
    if (end < start) return [start, start];
    return [start, end];
};

const daysBetween = (a: Date | null, b: Date | null): number | null => {
    if (!a || !b) return null;
    const d1 = onlyDate(a), d2 = onlyDate(b);
    if (!d1 || !d2) return null;
    return Math.round((d2.getTime() - d1.getTime()) / 86400000);
};

export const median = (arr: (number | null)[]): number | null => {
    const a = arr.filter((v): v is number => v != null && !isNaN(v)).slice().sort((x, y) => x - y);
    if (!a.length) return null;
    const mid = Math.floor(a.length / 2);
    return (a.length % 2) ? a[mid] : (a[mid - 1] + a[mid]) / 2;
};

const medianDaysToScore = (m: number | null): number | null => {
    if (m == null || isNaN(m)) return null;
    if (m <= 1) return 100;
    if (m <= 2) return 100 - (m - 1) * 5;
    if (m <= 5) return 95 - (m - 2) * 5;
    if (m <= 10) return 80 - (m - 5) * 6;
    return Math.max(0, 50 - (m - 10) * 3);
};

const parseCoord = (val: any): number | null => {
    if (val == null) return null;
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
        const n = parseFloat(val.replace(',', '.'));
        return isNaN(n) ? null : n;
    }
    return null;
}

// --- Column Mapping ---
export type ColumnMap = { [key in keyof typeof REQUIRED_COLUMNS]?: string };

const normalizeHeader = (h: any): string => String(h || '').trim().toLowerCase().replace(/[_\s]+/g, ' ');

export const buildColumnMap = (headers: string[]): ColumnMap => {
    const map: ColumnMap = {};
    const normalizedHeaders = headers.map(h => normalizeHeader(h));
    for (const key in REQUIRED_COLUMNS) {
        const typedKey = key as keyof typeof REQUIRED_COLUMNS;
        const syns = REQUIRED_COLUMNS[typedKey];
        let idx = -1;
        
        // 1. Exact match on normalized headers
        for (const s of syns) {
            const target = normalizeHeader(s);
            idx = normalizedHeaders.findIndex(h => h === target);
            if (idx !== -1) break;
        }

        // 2. Fallback: word-boundary regex to avoid partial matches (e.g., 'installer' in 'installerid')
        if (idx === -1) {
            for (let i = 0; i < normalizedHeaders.length; i++) {
                const header = normalizedHeaders[i];
                if (syns.some(s => new RegExp(`\\b${normalizeHeader(s)}\\b`).test(header))) {
                    idx = i;
                    break;
                }
            }
        }
        
        if (idx !== -1) {
            map[typedKey] = headers[idx];
        }
    }
    return map;
}

export const hasAllEssential = (map: ColumnMap): { ok: boolean; missing: string[] } => {
    const essentials = ['installer', 'technician', 'appointmentDate', 'appointmentSetOn', 'lastAssignedOn', 'productDeliveryDate', 'appointmentRange', 'completedOn'];
    const missing = essentials.filter(k => !map[k as keyof ColumnMap]);
    return { ok: missing.length === 0, missing };
}


// --- Main Processing Logic ---
export const groupAndCompute = (rows: any[], colMap: ColumnMap, filters: Filters): { installers: AggregatedResult[], installerTechs: AggregatedResult[] } => {
    const byInstaller = new Map<string, any>();
    const byInstallerTech = new Map<string, any>();

    const addToGroup = (g: Map<string, any>, key: string, rec: ProcessedRow) => {
        if (!g.has(key)) g.set(key, { jobs: 0, inRange: 0, inRangeDen: 0, set1d: 0, set1dDen: 0, apptEq: 0, apptEqDen: 0, daysList: [], coordinates: [], installer: rec.installer, technician: rec.technician });
        const obj = g.get(key);
        obj.jobs += 1;
        if (rec.inRange != null) { obj.inRangeDen++; if (rec.inRange) obj.inRange++; }
        if (rec.setWithin1d != null) { obj.set1dDen++; if (rec.setWithin1d) obj.set1d++; }
        if (rec.apptEq != null) { obj.apptEqDen++; if (rec.apptEq) obj.apptEq++; }
        if (rec.days != null && rec.days >= 0) obj.daysList.push(rec.days);
        if (rec.lat != null && rec.lng != null) obj.coordinates.push({ lat: rec.lat, lng: rec.lng, workOrder: rec.workOrder, completedOn: rec.completedOn });
    };

    const fFrom = filters.completedFrom ? onlyDate(new Date(filters.completedFrom)) : null;
    const fTo = filters.completedTo ? onlyDate(new Date(filters.completedTo)) : null;
    const fService = filters.service ? filters.service.toLowerCase() : '';
    const fProduct = filters.product ? filters.product.toLowerCase() : '';
    const fZip = filters.zip ? filters.zip.toLowerCase() : '';

    for (const r of rows) {
        const installer = r[colMap.installer!];
        const technician = r[colMap.technician!];
        
        const completedOn = parseDateGuess(r[colMap.completedOn!]);
        if (fFrom && (!completedOn || completedOn < fFrom)) continue;
        if (fTo && (!completedOn || completedOn > fTo)) continue;
        if (fService && colMap.service && r[colMap.service] && !String(r[colMap.service]).toLowerCase().includes(fService)) continue;
        if (fProduct && colMap.product && r[colMap.product] && !String(r[colMap.product]).toLowerCase().includes(fProduct)) continue;
        if (fZip && colMap.postalCode && r[colMap.postalCode] && !String(r[colMap.postalCode]).toLowerCase().includes(fZip)) continue;

        const ctxYearSource = parseDateGuess(r[colMap.appointmentDate!]) || completedOn || parseDateGuess(r[colMap.lastAssignedOn!]) || parseDateGuess(r[colMap.productDeliveryDate!]);
        const ctxYear = ctxYearSource ? ctxYearSource.getFullYear() : new Date().getFullYear();

        const appointmentDate = parseDateGuess(r[colMap.appointmentDate!]);
        const range = parseApptRange(r[colMap.appointmentRange!], ctxYear);
        const inRange = (appointmentDate && range) ? (appointmentDate >= range[0] && appointmentDate <= range[1]) : null;

        const lastAssigned = parseDateGuess(r[colMap.lastAssignedOn!]);
        const apptSetOn = parseDateGuess(r[colMap.appointmentSetOn!]);
        const setWithin1d = (lastAssigned && apptSetOn) ? (Math.abs(daysBetween(lastAssigned, apptSetOn) ?? 2) <= 1) : null;

        const productDelivery = parseDateGuess(r[colMap.productDeliveryDate!]);
        const days = (productDelivery && completedOn) ? daysBetween(productDelivery, completedOn) : null;

        const apptEq = (appointmentDate && completedOn) ? (daysBetween(appointmentDate, completedOn) === 0) : null;

        const lat = colMap.latitude ? parseCoord(r[colMap.latitude]) : null;
        const lng = colMap.longitude ? parseCoord(r[colMap.longitude]) : null;
        const workOrder = colMap.workOrder ? r[colMap.workOrder] : null;

        const rec = { installer, technician, inRange, setWithin1d, apptEq, days, lat, lng, workOrder, completedOn };
        if (installer) addToGroup(byInstaller, installer, rec);
        if (installer || technician) addToGroup(byInstallerTech, `${installer || ''}__${technician || ''}`, rec);
    }
    
    const finalize = (map: Map<string, any>, level: 'installer' | 'tech'): AggregatedResult[] => {
        const list: AggregatedResult[] = [];
        for (const [key, v] of map.entries()) {
            list.push({
                key,
                name: level === 'installer' ? key : `${v.installer || ''} ⟶ ${v.technician || ''}`,
                installer: v.installer || null, technician: v.technician || null,
                jobs: v.jobs,
                pctInRange: v.inRangeDen ? v.inRange / v.inRangeDen : null,
                pctSet1d: v.set1dDen ? v.set1d / v.set1dDen : null,
                pctApptEq: v.apptEqDen ? v.apptEq / v.apptEqDen : null,
                inRangeDen: v.inRangeDen, set1dDen: v.set1dDen, apptEqDen: v.apptEqDen,
                medDays: median(v.daysList),
                rawScore: null, finalScore: null,
                coordinates: v.coordinates || [],
            });
        }
        return list;
    };
    return { installers: finalize(byInstaller, 'installer'), installerTechs: finalize(byInstallerTech, 'tech') };
};


export const computeScores = (items: AggregatedResult[], weights: Weights, kCred: number): AggregatedResult[] => {
    let total = weights.inRange + weights.set1d + weights.apptEq + weights.median;
    if (total <= 0) total = 1;
    const W: Weights = {
        inRange: weights.inRange / total, set1d: weights.set1d / total,
        apptEq: weights.apptEq / total, median: weights.median / total
    };
    for (const it of items) {
        const sInRange = (it.pctInRange != null) ? it.pctInRange * 100 : null;
        const sSet1d = (it.pctSet1d != null) ? it.pctSet1d * 100 : null;
        const sApptEq = (it.pctApptEq != null) ? it.pctApptEq * 100 : null;
        const sMedian = medianDaysToScore(it.medDays);
        const parts: number[] = [];
        if (sInRange != null) parts.push(W.inRange * sInRange);
        if (sSet1d != null) parts.push(W.set1d * sSet1d);
        if (sApptEq != null) parts.push(W.apptEq * sApptEq);
        if (sMedian != null) parts.push(W.median * sMedian);
        it.rawScore = parts.length ? parts.reduce((a, b) => a + b, 0) : null;
    }
    const rawVals = items.map(i => i.rawScore).filter((v): v is number => v != null && !isNaN(v));
    const avg = rawVals.length ? rawVals.reduce((a, b) => a + b, 0) / rawVals.length : 50;
    for (const it of items) {
        const cred = Math.min(1, (it.jobs || 0) / (kCred || 100));
        it.finalScore = (it.rawScore != null) ? (cred * it.rawScore + (1 - cred) * avg) : null;
    }
    items.sort((a, b) => (b.finalScore ?? -1) - (a.finalScore ?? -1));
    return items;
};

export const buildChildrenMap = (installers: AggregatedResult[], techs: AggregatedResult[]): Map<string, AggregatedResult[]> => {
    const map = new Map<string, AggregatedResult[]>();
    for (const inst of installers) {
        if (inst.installer) map.set(inst.installer, []);
    }
    for (const t of techs) {
        if (t.installer) {
            if (!map.has(t.installer)) map.set(t.installer, []);
            map.get(t.installer)?.push(t);
        }
    }
    for (const arr of map.values()) {
        arr.sort((a, b) => (b.finalScore ?? -1) - (a.finalScore ?? -1));
    }
    return map;
};

export const getOverallKpis = (items: AggregatedResult[]): Kpi => {
    const totalJobs = items.reduce((s, i) => s + (i.jobs || 0), 0);
    const avg = (arr: (number | null)[]) => {
        const v = arr.filter((x): x is number => x != null && !isNaN(x));
        return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
    };
    const avgInRange = avg(items.map(i => i.pctInRange));
    const avgSet1d = avg(items.map(i => i.pctSet1d));
    const avgApptEq = avg(items.map(i => i.pctApptEq));
    const medOfMedians = median(items.map(i => i.medDays));
    const avgFinal = avg(items.map(i => (i.finalScore != null ? i.finalScore / 100 : null)));

    return { totalJobs, avgInRange, avgSet1d, avgApptEq, medOfMedians, avgFinal };
};
