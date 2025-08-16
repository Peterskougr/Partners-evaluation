
export interface Weights {
    inRange: number;
    set1d: number;
    apptEq: number;
    median: number;
}

export interface Filters {
    completedFrom: string;
    completedTo: string;
    service: string;
    product: string;
    zip: string;
}

export interface Status {
    ok: boolean;
    text: string;
}

export interface ProcessedRow {
    installer: string;
    technician: string;
    inRange: boolean | null;
    setWithin1d: boolean | null;
    apptEq: boolean | null;
    days: number | null;
    lat: number | null;
    lng: number | null;
    workOrder: string | null;
    completedOn: Date | null;
}

export interface AggregatedResult {
    key: string;
    name: string;
    installer: string | null;
    technician: string | null;
    jobs: number;
    pctInRange: number | null;
    pctSet1d: number | null;
    pctApptEq: number | null;
    inRangeDen: number;
    set1dDen: number;
    apptEqDen: number;
    medDays: number | null;
    rawScore: number | null;
    finalScore: number | null;
    coordinates: { lat: number; lng: number; workOrder: string | null, completedOn: Date | null }[];
}

export interface Kpi {
    totalJobs: number;
    avgInRange: number | null;
    avgSet1d: number | null;
    avgApptEq: number | null;
    medOfMedians: number | null;
    avgFinal: number | null;
}
