
import type { Weights } from './types';

export const HANDLE_KEY = 'workbookHandle';

export const DEFAULT_WEIGHTS: Weights = {
    inRange: 0.40,
    set1d: 0.25,
    apptEq: 0.25,
    median: 0.10,
};

export const REQUIRED_COLUMNS: { [key: string]: string[] } = {
    installer: ['dot_installeridname', 'installer', 'installername', 'dot_installer'],
    technician: ['TECHNICIAN', 'technician'],
    appointmentDate: ['APPOINTMENT DATE', 'appointment date'],
    appointmentSetOn: ['APPOINTMENT SET ON', 'appointment set on'],
    lastAssignedOn: ['LAST ASSIGNED ON', 'last assigned on'],
    productDeliveryDate: ['PRODUCT DELIVERY DATE', 'product delivery date'],
    appointmentRange: ['APPOINTMENT RANGE', 'appointment range'],
    completedOn: ['msdyn_completedon', 'completed on', 'msdyn completedon'],
    service: ['SERVICE', 'service'],
    product: ['PRODUCT', 'product'],
    postalCode: ['POSTAL CODE', 'postal code', 'zip', 'τκ'],
    workOrder: ['WORK ORDER', 'work order'],
    latitude: ['latitude', 'lat', 'y', 'γεωγραφικό πλάτος'],
    longitude: ['longitude', 'lon', 'lng', 'x', 'γεωγραφικό μήκος'],
};
