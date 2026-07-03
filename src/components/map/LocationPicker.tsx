import { useEffect, useRef, useState } from 'react';
import { Loader2, LocateFixed, MapPinOff } from 'lucide-react';
import { loadYmaps, YANDEX_KEY } from '../../lib/loadYmaps';

export interface PickedLocation {
  lat: number;
  lng: number;
  address?: string;
}

interface LocationPickerProps {
  value: PickedLocation | null;
  onChange: (loc: PickedLocation) => void;
}

const DEFAULT_CENTER: [number, number] = [41.311081, 69.240562]; // Toshkent

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const placemarkRef = useRef<any>(null);
  const ymapsRef = useRef<any>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'nokey'>('loading');
  const [locating, setLocating] = useState(false);

  // Manzilni teskari geokodlash (koordinata → matn)
  function reverseGeocode(coords: [number, number]) {
    const ymaps = ymapsRef.current;
    if (!ymaps) { onChange({ lat: coords[0], lng: coords[1] }); return; }
    ymaps.geocode(coords, { results: 1 }).then((res: any) => {
      const obj = res.geoObjects.get(0);
      const address = obj ? obj.getAddressLine() : undefined;
      onChange({ lat: coords[0], lng: coords[1], address });
    }).catch(() => onChange({ lat: coords[0], lng: coords[1] }));
  }

  function setPoint(coords: [number, number], recenter = true) {
    const ymaps = ymapsRef.current;
    const map = mapRef.current;
    if (!ymaps || !map) return;
    if (placemarkRef.current) {
      placemarkRef.current.geometry.setCoordinates(coords);
    } else {
      const pm = new ymaps.Placemark(coords, {}, { preset: 'islands#greenDotIcon', draggable: true });
      pm.events.add('dragend', () => {
        const c = pm.geometry.getCoordinates();
        reverseGeocode(c);
      });
      map.geoObjects.add(pm);
      placemarkRef.current = pm;
    }
    if (recenter) map.setCenter(coords, Math.max(map.getZoom(), 16));
  }

  useEffect(() => {
    if (!YANDEX_KEY) { setStatus('nokey'); return; }
    let cancelled = false;

    loadYmaps().then((ymaps) => {
      if (cancelled || !containerRef.current) return;
      ymapsRef.current = ymaps;
      const start: [number, number] = value ? [value.lat, value.lng] : DEFAULT_CENTER;
      const map = new ymaps.Map(containerRef.current, {
        center: start,
        zoom: value ? 16 : 12,
        controls: ['zoomControl', 'geolocationControl'],
      }, { suppressMapOpenBlock: true });
      mapRef.current = map;

      if (value) setPoint([value.lat, value.lng], false);

      // Xaritaga bosganda nuqta qo'yish
      map.events.add('click', (e: any) => {
        const coords = e.get('coords');
        setPoint(coords, false);
        reverseGeocode(coords);
      });

      setStatus('ready');
    }).catch((err) => {
      if (cancelled) return;
      setStatus(err?.message === 'no-key' ? 'nokey' : 'error');
    });

    return () => {
      cancelled = true;
      if (mapRef.current) { mapRef.current.destroy(); mapRef.current = null; }
      placemarkRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function useMyLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setPoint(coords, true);
        reverseGeocode(coords);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  if (status === 'nokey') return null;

  return (
    <div>
      <div className="relative rounded-xl overflow-hidden border border-gray-200">
        <div ref={containerRef} className="w-full h-52" />
        {status === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
          </div>
        )}
        {status === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400 bg-gray-50">
            <MapPinOff className="w-6 h-6" />
            <p className="text-xs">Xarita yuklanmadi</p>
          </div>
        )}
        {status === 'ready' && (
          <button type="button" onClick={useMyLocation}
            className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-white shadow-md rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 active:scale-95 transition-transform">
            {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4 text-green-600" />}
            Mening joylashuvim
          </button>
        )}
      </div>
      <p className="text-[11px] text-gray-400 mt-1.5">
        Xaritada aniq joyni bosing yoki nuqtani suring
      </p>
    </div>
  );
}
