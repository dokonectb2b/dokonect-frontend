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
  const [state, setState]         = useState<State>('loading');
  const [errMsg, setErrMsg]       = useState('');
  const [phone, setPhone]         = useState('');
  const [submitting, setSubmitting] = useState(false);
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

  async function submitPhone() {
    const tg = window.Telegram?.WebApp;
    if (!tg || !phone.trim()) return;
    setSubmitting(true);
    await authenticate(tg, phone.trim());
    setSubmitting(false);
  }

  if (state === 'loading') return (
    <div className="tgs-root min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Yuklanmoqda...</p>
      </div>
    </div>
  );

  if (state === 'need_phone') return (
    <div className="tgs-root min-h-screen flex items-center justify-center p-6">
      <div className="max-w-xs w-full">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 text-4xl shadow-xl shadow-green-500/25"
          style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
          🛒
        </div>
        <h1 className="text-2xl font-bold text-gray-900 text-center tracking-tight mb-1">Dokonect</h1>
        <p className="text-gray-500 text-sm text-center mb-6">Kirish uchun telefon raqamingizni kiriting</p>
        <div className="tgs-card rounded-3xl p-5">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+998901234567"
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-base mb-3 outline-none focus:border-green-400 transition-colors"
          />
          <button
            onClick={submitPhone}
            disabled={submitting || !phone.trim()}
            className="w-full py-3.5 rounded-2xl font-bold text-white text-sm disabled:opacity-50 shadow-lg shadow-green-500/25 active:scale-[0.98] transition-transform"
            style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
          >
            {submitting ? 'Tekshirilmoqda...' : 'Kirish'}
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-4">Raqamingiz faqat tizimga kirish uchun ishlatiladi</p>
      </div>
    </div>
  );

  return (
    <div className="tgs-root min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-xs w-full">
        <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center mx-auto mb-5 text-4xl">❌</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">Xatolik</h1>
        <p className="text-gray-500 text-sm mb-6">{errMsg}</p>
        <button onClick={() => window.Telegram?.WebApp.close()}
          className="w-full py-3.5 rounded-2xl font-semibold text-gray-700 bg-white border border-gray-200 text-sm active:scale-[0.98] transition-transform">
          Yopish
        </button>
      </div>
    </div>
  );
}
