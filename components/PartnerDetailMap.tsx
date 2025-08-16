
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { AggregatedResult } from '../types';

interface PartnerDetailMapProps {
    coordinates: AggregatedResult['coordinates'];
}

const PartnerDetailMap: React.FC<PartnerDetailMapProps> = ({ coordinates }) => {
    if (!coordinates || coordinates.length === 0) {
        return <div className="h-96 flex items-center justify-center bg-slate-50 rounded-xl text-slate-500">Δεν υπάρχουν διαθέσιμες συντεταγμένες.</div>;
    }

    const position: [number, number] = [coordinates[0].lat, coordinates[0].lng];
    const bounds = coordinates.map(c => [c.lat, c.lng] as [number, number]);

    return (
        <div className="h-96 rounded-xl overflow-hidden">
            <MapContainer center={position} zoom={10} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }} bounds={bounds}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {coordinates.map((coord, idx) => (
                    <Marker key={idx} position={[coord.lat, coord.lng]}>
                        <Popup>
                            <b>Work Order:</b> {coord.workOrder || 'N/A'}<br />
                            <b>Completed:</b> {coord.completedOn ? new Date(coord.completedOn).toLocaleDateString('el-GR') : 'N/A'}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default PartnerDetailMap;
