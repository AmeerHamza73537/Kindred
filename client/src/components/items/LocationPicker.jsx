import { useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import '../../utils/leafletIcon.js';

function tileConfig() {
  const token = import.meta.env.VITE_MAPBOX_TOKEN;
  const useMapbox = token && !token.includes('your_mapbox');
  return useMapbox
    ? {
        url: `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/512/{z}/{x}/{y}@2x?access_token=${token}`,
        opts: { tileSize: 512, zoomOffset: -1, attribution: '&copy; Mapbox &copy; OpenStreetMap' },
      }
    : {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        opts: { attribution: '&copy; OpenStreetMap' },
      };
}

function ClickToPlace({ onChange }) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

/**
 * Draggable pickup-location picker.
 * @param {{lat:number,lng:number}} value  current coords
 * @param {(c:{lat:number,lng:number})=>void} onChange
 */
export default function LocationPicker({ value, onChange }) {
  const { url, opts } = useMemo(tileConfig, []);
  const markerRef = useRef(null);
  const center = value ? [value.lat, value.lng] : [40.6782, -73.9442];

  return (
    <div className="h-64 overflow-hidden rounded-xl border border-ink/10">
      <MapContainer center={center} zoom={14} className="h-full w-full" scrollWheelZoom>
        <TileLayer url={url} {...opts} />
        <ClickToPlace onChange={onChange} />
        {value && (
          <Marker
            draggable
            ref={markerRef}
            position={[value.lat, value.lng]}
            eventHandlers={{
              dragend() {
                const m = markerRef.current;
                if (m) {
                  const { lat, lng } = m.getLatLng();
                  onChange({ lat, lng });
                }
              },
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
