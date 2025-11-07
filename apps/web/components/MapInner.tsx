'use client';
import { MapContainer as RLMapContainer, LayersControl as RLLayersControl, ScaleControl as RLScaleControl } from 'react-leaflet';
export const MapContainer: any = RLMapContainer as any;
export const LayersControl: any = RLLayersControl as any;
export const ScaleControl: any = RLScaleControl as any;
export default function MapInner(props: any) { return <div {...props} />; }
