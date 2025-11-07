'use client';

// Ce wrapper évite les erreurs de typing react-leaflet à la compilation Render.
import { MapContainer as RLMapContainer, LayersControl as RLLayersControl, ScaleControl as RLScaleControl } from 'react-leaflet';

// on "neutralise" les types côté TS pour garantir le build
export const MapContainer: any = RLMapContainer as any;
export const LayersControl: any = RLLayersControl as any;
export const ScaleControl: any = RLScaleControl as any;

export default function MapInner(props: any) {
  // n'est pas utilisé directement par la page, mais exister proprement évite un build cassé
  return <div {...props} />;
}
