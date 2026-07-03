import { useEffect, useRef, useState } from 'react';
import { Loader2, MapPinOff } from 'lucide-react';

// Yandex Maps global ob'ekti
declare global {
  interface Window {
    ymaps?: any;
  }
}

const API_KEY = import.meta.env.VITE_YANDEX_MAPS_API_KEY as string | undefined;

// Skriptni faqat bir marta yuklash uchun umumiy promise (singleton)
let loaderPromise: Promise<any> | null = null;

function loadYmaps(): Promise<any> {
  if (window.ymaps?.ready) {
    return new Promise((resolve) => window.ymaps.ready(() => resolve(window.ymaps)));
  }
  if (!loaderPromise) {
    loaderPromise = new Promise((resolve, reject) => {
      if (!API_KEY) { reject(new Error('no-key')); return; }
      const script = document.createElement('script');
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${API_KEY}&lang=ru_RU`;
      script.async = true;
      script.onload = () => window.ymaps.ready(() => resolve(window.ymaps));
      script.onerror = () => reject(new Error('load-failed'));
      document.head.appendChild(script);
    });
  }
  return loaderPromise;
}

interface YandexMapProps {
  address: string;
  driverCoords?: [number, number] | null;
  className?: string;
}

// Toshkent markazi (fallback)
const DEFAULT_CENTER: [number, number] = [41.311081, 69.240562];

export function YandexMap({ address, driverCoords, className = '' }: YandexMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'nokey'>('loading');

  useEffect(() => {
    if (!API_KEY) { setStatus('nokey'); return; }
    if (!address) { setStatus('error'); return; }

    let cancelled = false;

    loadYmaps()
      .then((ymaps) => {
        if (cancelled || !containerRef.current) return;

        // Xaritani yaratish
        const map = new ymaps.Map(containerRef.current, {
          center: driverCoords || DEFAULT_CENTER,
          zoom: 13,
          controls: ['zoomControl'],
        }, { suppressMapOpenBlock: true });
        mapRef.current = map;

        if (driverCoords) {
          // Haydovchi → manzil marshruti (manzil matni ichida geokodlanadi)
          const multiRoute = new ymaps.multiRouter.MultiRoute(
            {
              referencePoints: [driverCoords, address],
              params: { routingMode: 'auto' },
            },
            {
              boundsAutoApply: true,
              wayPointStartIconColor: '#38BDF8',
              wayPointFinishIconColor: '#22C55E',
              routeActiveStrokeColor: '#38BDF8',
              routeStrokeColor: '#38BDF8',
            },
          );
          multiRoute.model.events.add('requestsuccess', () => { if (!cancelled) setStatus('ready'); });
          multiRoute.model.events.add('requestfail', () => {
            // Marshrut chiqmasa — hech bo'lmasa manzil pinini ko'rsatamiz
            if (!cancelled) geocodeOnly(ymaps, map);
          });
          map.geoObjects.add(multiRoute);
        } else {
          geocodeOnly(ymaps, map);
        }
      })
      .catch((e) => {
        if (cancelled) return;
        setStatus(e?.message === 'no-key' ? 'nokey' : 'error');
      });

    function geocodeOnly(ymaps: any, map: any) {
      ymaps.geocode(address, { results: 1 }).then((res: any) => {
        if (cancelled) return;
        const obj = res.geoObjects.get(0);
        if (!obj) { setStatus('error'); return; }
        const coords = obj.geometry.getCoordinates();
        const placemark = new ymaps.Placemark(coords, { balloonContent: address }, {
          preset: 'islands#greenDotIcon',
        });
        map.geoObjects.add(placemark);
        map.setCenter(coords, 15);
        setStatus('ready');
      }).catch(() => { if (!cancelled) setStatus('error'); });
    }

    return () => {
      cancelled = true;
      if (mapRef.current) { mapRef.current.destroy(); mapRef.current = null; }
    };
  }, [address, driverCoords]);

  // Kalit yo'q bo'lsa — umuman ko'rsatmaymiz (Delivery'dagi "Yandex'da ochish" tugmasi qoladi)
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
