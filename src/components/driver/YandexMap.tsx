import { useEffect, useRef, useState } from 'react';
import { Loader2, MapPinOff } from 'lucide-react';
import { loadYmaps, YANDEX_KEY } from '../../lib/loadYmaps';

interface YandexMapProps {
  address: string;
  destCoords?: [number, number] | null;   // aniq manzil koordinatasi (bo'lsa geocoder ishlatilmaydi)
  driverCoords?: [number, number] | null;  // haydovchining joriy joylashuvi
  className?: string;
}

// Toshkent markazi (fallback)
const DEFAULT_CENTER: [number, number] = [41.311081, 69.240562];

export function YandexMap({ address, destCoords, driverCoords, className = '' }: YandexMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'nokey'>('loading');

  useEffect(() => {
    if (!YANDEX_KEY) { setStatus('nokey'); return; }
    if (!address && !destCoords) { setStatus('error'); return; }

    let cancelled = false;

    loadYmaps()
      .then((ymaps) => {
        if (cancelled || !containerRef.current) return;

        const map = new ymaps.Map(containerRef.current, {
          center: destCoords || driverCoords || DEFAULT_CENTER,
          zoom: 14,
          controls: ['zoomControl'],
        }, { suppressMapOpenBlock: true });
        mapRef.current = map;

        // Manzil nuqtasini aniqlash: aniq koordinata bo'lsa o'shani, bo'lmasa geocoder
        const withDest = (destLatLng: [number, number]) => {
          if (driverCoords) {
            const multiRoute = new ymaps.multiRouter.MultiRoute(
              { referencePoints: [driverCoords, destLatLng], params: { routingMode: 'auto' } },
              {
                boundsAutoApply: true,
                wayPointStartIconColor: '#38BDF8',
                wayPointFinishIconColor: '#22C55E',
                routeActiveStrokeColor: '#38BDF8',
                routeStrokeColor: '#38BDF8',
              },
            );
            multiRoute.model.events.add('requestsuccess', () => { if (!cancelled) setStatus('ready'); });
            multiRoute.model.events.add('requestfail', () => { if (!cancelled) placeOnly(destLatLng); });
            map.geoObjects.add(multiRoute);
          } else {
            placeOnly(destLatLng);
          }
        };

        const placeOnly = (coords: [number, number]) => {
          const placemark = new ymaps.Placemark(coords, { balloonContent: address }, { preset: 'islands#greenDotIcon' });
          map.geoObjects.removeAll();
          map.geoObjects.add(placemark);
          map.setCenter(coords, 15);
          if (!cancelled) setStatus('ready');
        };

        if (destCoords) {
          withDest(destCoords);
        } else {
          // Koordinata yo'q — manzil matnini geokodlaymiz
          ymaps.geocode(address, { results: 1 }).then((res: any) => {
            if (cancelled) return;
            const obj = res.geoObjects.get(0);
            if (!obj) { setStatus('error'); return; }
            withDest(obj.geometry.getCoordinates());
          }).catch(() => { if (!cancelled) setStatus('error'); });
        }
      })
      .catch((e) => {
        if (cancelled) return;
        setStatus(e?.message === 'no-key' ? 'nokey' : 'error');
      });

    return () => {
      cancelled = true;
      if (mapRef.current) { mapRef.current.destroy(); mapRef.current = null; }
    };
  }, [address, destCoords, driverCoords]);

  // Kalit yo'q bo'lsa — umuman ko'rsatmaymiz
  if (status === 'nokey') return null;

  return (
    <div className={`tg-glass rounded-2xl overflow-hidden relative ${className}`}>
      <div ref={containerRef} className="w-full h-56" />
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40">
          <Loader2 className="w-6 h-6 text-sky-400 animate-spin" />
        </div>
      )}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400 bg-slate-900/60">
          <MapPinOff className="w-6 h-6" />
          <p className="text-xs">Xaritada ko'rsatib bo'lmadi</p>
        </div>
      )}
    </div>
  );
}
