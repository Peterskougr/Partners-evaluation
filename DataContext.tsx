
import { createContext } from 'react';
import type { AggregatedResult } from './types';
import type { ColumnMap } from './services/excelProcessor';

interface DataContextType {
    processedData: {
        installers: AggregatedResult[];
        installerTechs: AggregatedResult[];
        childrenMap: Map<string, AggregatedResult[]>;
    } | null;
    rawRows: any[];
    colMap: ColumnMap | null;
}

export const DataContext = createContext<DataContextType>({
    processedData: null,
    rawRows: [],
    colMap: null,
});