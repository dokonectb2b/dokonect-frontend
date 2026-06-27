import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { telegramClientAuthFn } from '../../api/auth.api';

interface TelegramWebApp {
  ready(): void;
  expand(): void;
  close(): void;
  initData: string;
  initDataUnsafe: { contact?: { phone_number: string } };
  requestContact(callback: (granted: boolean) => void): void;
}
declare global { interface Window { Telegram?: { WebApp: TelegramWebApp } } }

type State = 'loading' | 'need_phone' | 'error';

export default function TgStoreAuth() {
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
      const res = await telegramClientAuthFn({ initData: tg.initData, phone });
      if (res.needsPhone) { setState('need_phone'); return; }
      const { user, accessToken, refreshToken } = res.data;
      setAuth(user, accessToken, refreshToken);
      navigate('/store/tg', { replace: true });
    } catch (err: any) {
      setState('error');
      setErrMsg(err?.response?.data?.message || 'Kirish xatosi yuz berdi');
    }
  }

  function requestPhone() {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;
    tg.requestContact((granted) => {
      if (!granted) { setState('error'); setErrMsg('Telefon raqami taqdim etilmadi'); return; }
      const phone = tg.initDataUnsafe?.contact?.phone_number;
      if (phone) authenticate(tg, phone);
      else { setState('error'); setErrMsg('Telefon raqami topilmadi'); }
    });
  }

  if (state === 'loading') return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Yuklanmoqda...</p>
      </div>
    </div>
  );

  if (state === 'need_phone') return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="text-center max-w-xs w-full">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <span className="text-4xl">🛒</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">Dokonect</h1>
        <p className="text-gray-500 text-sm mb-8">Kirish uchun telefon raqamingizni ulashing</p>
        <button onClick={requestPhone}
          className="w-full py-3 rounded-2xl font-semibold text-white text-sm"
          style={{ background: '#22C55E' }}>
          📱 Telefon raqamni ulashish
        </button>
        <p className="text-xs text-gray-400 mt-4">Raqamingiz faqat tizimga kirish uchun ishlatiladi</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="text-center max-w-xs w-full">
        <div className="text-5xl mb-4">❌</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Xatolik</h1>
        <p className="text-gray-500 text-sm mb-6">{errMsg}</p>
        <button onClick={() => window.Telegram?.WebApp.close()}
          className="w-full py-3 rounded-2xl font-semibold text-gray-700 bg-gray-200 text-sm">
          Yopish
        </button>
      </div>
    </div>
  );
}
