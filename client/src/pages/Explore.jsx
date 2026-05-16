import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import '../utils/leafletIcon.js';
import { listItems } from '../api/items.js';
import { useGeoLocation } from '../hooks/useLocation.js';
import ItemCard from '../components/items/ItemCard.jsx';
import { ItemCardSkeleton } from '../components/common/Skeleton.jsx';
import Button from '../components/common/Button.jsx';

export default function Explore() {
  const [params] = useSearchParams();
  const initialCat = params.get('category') || '';
  const { coords, detect } = useGeoLocation();
  const [radius, setRadius] = useState(3);
  const [category, setCategory] = useState(initialCat);
  const [type, setType] = useState('');
  const [view, setView] = useState('split');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    detect();
  }, [detect]);

  useEffect(() => {
    setCategory(initialCat);
  }, [initialCat]);

  useEffect(() => {
    if (!coords) return;
    const run = async () => {
      setLoading(true);
      try {
        const { data } = await listItems({
          lat: coords.lat,
          lng: coords.lng,
          radius,
          category: category || undefined,
          type: type || undefined,
          status: 'available',
        });
        setItems(data.data?.items || []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [coords, radius, category, type]);

  const center = useMemo(() => (coords ? [coords.lat, coords.lng] : [40.6782, -73.9442]), [coords]);

  const token = import.meta.env.VITE_MAPBOX_TOKEN;
  const useMapbox = token && !token.includes('your_mapbox');
  const tileUrl = useMapbox
    ? `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/512/{z}/{x}/{y}@2x?access_token=${token}`
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const tileOpts = useMapbox
    ? { tileSize: 512, zoomOffset: -1, attribution: '&copy; Mapbox &copy; OpenStreetMap' }
    : { attribution: '&copy; OpenStreetMap' };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-serif text-3xl text-ink">Explore nearby</h1>
          <p className="text-sm text-ink/60">Map + list within your chosen radius.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant={view === 'map' ? 'primary' : 'ghost'} onClick={() => setView('map')}>
            Map
          </Button>
          <Button variant={view === 'list' ? 'primary' : 'ghost'} onClick={() => setView('list')}>
            List
          </Button>
          <Button variant={view === 'split' ? 'primary' : 'ghost'} onClick={() => setView('split')}>
            Split
          </Button>
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl border border-ink/5 bg-white p-4 shadow-sm md:grid-cols-4">
        <label className="text-xs font-semibold uppercase tracking-wide text-ink/50">
          Category
          <select
            className="mt-1 w-full rounded-xl border border-ink/10 px-2 py-2 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All</option>
            {['Tools', 'Kitchen', 'Electronics', 'Sports', 'Garden', 'Skills', 'Other'].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold uppercase tracking-wide text-ink/50">
          Type
          <select
            className="mt-1 w-full rounded-xl border border-ink/10 px-2 py-2 text-sm"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">All</option>
            <option value="lend">Lend</option>
            <option value="gift">Gift</option>
            <option value="skill">Skill</option>
          </select>
        </label>
        <label className="md:col-span-2 text-xs font-semibold uppercase tracking-wide text-ink/50">
          Radius: {radius} mi
          <input
            type="range"
            min={1}
            max={5}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="mt-2 w-full accent-primary"
          />
        </label>
      </div>

      <div
        className={`grid gap-4 ${view === 'split' ? 'lg:grid-cols-2' : ''} ${
          view === 'list' ? 'lg:grid-cols-1' : ''
        }`}
      >
        {(view === 'map' || view === 'split') && (
          <div className="h-[320px] overflow-hidden rounded-2xl border border-ink/10 shadow-inner lg:h-[480px]">
            <MapContainer center={center} zoom={13} className="h-full w-full" scrollWheelZoom>
              <TileLayer url={tileUrl} {...tileOpts} />
              {coords && (
                <>
                  <Circle
                    center={[coords.lat, coords.lng]}
                    radius={radius * 1609.34}
                    pathOptions={{ color: '#2D6A4F', fillColor: '#95D5B2', fillOpacity: 0.15 }}
                  />
                  <Marker position={[coords.lat, coords.lng]}>
                    <Popup>You are here</Popup>
                  </Marker>
                </>
              )}
              {items.map((it) =>
                it.location?.coordinates ? (
                  <Marker
                    key={it._id}
                    position={[it.location.coordinates[1], it.location.coordinates[0]]}
                  >
                    <Popup>
                      <Link className="font-semibold text-primary" to={`/items/${it._id}`}>
                        {it.title}
                      </Link>
                    </Popup>
                  </Marker>
                ) : null
              )}
            </MapContainer>
          </div>
        )}

        {(view === 'list' || view === 'split') && (
          <div className="space-y-3">
            {loading ? (
              <div className="grid gap-3">
                {[1, 2, 3].map((k) => (
                  <ItemCardSkeleton key={k} />
                ))}
              </div>
            ) : items.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-ink/15 bg-white px-4 py-8 text-center text-ink/60">
                Nothing in this radius yet. Try widening the map or listing something new.
              </p>
            ) : (
              <div className="grid gap-3">
                {items.map((it) => (
                  <ItemCard key={it._id} item={it} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
