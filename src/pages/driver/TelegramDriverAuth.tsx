import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { telegramDriverAuthFn } from '../../api/auth.api';

// Telegram WebApp SDK tipi (global window.Telegram.WebApp)
interface TelegramWebApp {
  ready(): void;
  expand(): void;
  close(): void;
  initData: string;
  initDataUnsafe: {
    user?: { id: number; first_name: string; last_name?: string };
    contact?: { phone_number: string };
  };
  requestContact(callback: (granted: boolean) => void): void;
}

declare global {
  interface Window {
    Telegram?: { WebApp: TelegramWebApp };
  }
}

type State = 'loading' | 'need_phone' | 'error';

export default function TelegramDriverAuth() {
  const [state, setState]   = useState<State>('loading');
  const [errMsg, setErrMsg] = useState('');
  const navigate = useNavigate();
  const setAuth  = useAuthStore(s => s.setAuth);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    if (!tg?.initData) {
      setState('error');
      setErrMsg('Bu sahifa faqat Telegram orqali ochiladi');
      return;
    }

    tg.ready();
    tg.expand();

    authenticate(tg);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function authenticate(tg: TelegramWebApp, phone?: string) {
    try {
      const res = await telegramDriverAuthFn({ initData: tg.initData, phone });

      if (res.needsPhone) {
        setState('need_phone');
        return;
      }

      const { user, accessToken, refreshToken } = res.data;
      setAuth(user, accessToken, refreshToken);
      navigate('/driver/tg', { replace: true });
    } catch (err: any) {
      setState('error');
      setErrMsg(err?.response?.data?.message || 'Kirish xatosi yuz berdi');
    }
  }

  function requestPhone() {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    tg.requestContact((granted) => {
      if (!granted) {
        setState('error');
        setErrMsg('Telefon raqami taqdim etilmadi');
        return;
      }
      const phone = tg.initDataUnsafe?.contact?.phone_number;
      if (phone) authenticate(tg, phone);
      else { setState('error'); setErrMsg('Telefon raqami topilmadi'); }
    });
  }

  // ─── Loading ────────────────────────────────────────────────────────────────

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  // ─── Need Phone ─────────────────────────────────────────────────────────────

  if (state === 'need_phone') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center max-w-xs w-full">
          <div className="text-6xl mb-5">🚗</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Dokonect Driver</h1>
          <p className="text-gray-500 text-sm mb-8">
            Kirish uchun telefon raqamingizni ulashing
          </p>
          <button
            onClick={requestPhone}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            📱 Telefon raqamni ulashish
          </button>
          <p className="text-xs text-gray-400 mt-4">
            Raqamingiz faqat tizimga kirish uchun ishlatiladi
          </p>
        </div>
      </div>
    );
  }

  // ─── Error ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="text-center max-w-xs w-full">
        <div className="text-6xl mb-5">❌</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Xatolik</h1>
        <p className="text-gray-500 text-sm mb-8">{errMsg}</p>
        <button
          onClick={() => window.Telegram?.WebApp.close()}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-colors"
        >
          Yopish
        </button>
      </div>
    </div>
  );
}
