// Yandex Maps JS API global ob'ekti
declare global {
  interface Window {
    ymaps?: any;
  }
}

export const YANDEX_KEY = import.meta.env.VITE_YANDEX_MAPS_API_KEY as string | undefined;

// Skriptni faqat bir marta yuklash (singleton)
let loaderPromise: Promise<any> | null = null;

export function loadYmaps(): Promise<any> {
  if (window.ymaps?.ready) {
    return new Promise((resolve) => window.ymaps.ready(() => resolve(window.ymaps)));
  }
  if (!loaderPromise) {
    loaderPromise = new Promise((resolve, reject) => {
      if (!YANDEX_KEY) { reject(new Error('no-key')); return; }
      const script = document.createElement('script');
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${YANDEX_KEY}&lang=ru_RU`;
      script.async = true;
      script.onload = () => window.ymaps.ready(() => resolve(window.ymaps));
      script.onerror = () => reject(new Error('load-failed'));
      document.head.appendChild(script);
    });
  }
  return loaderPromise;
}
