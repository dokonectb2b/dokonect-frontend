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
  const [state, setState]     = useState<State>('loading');
  const [errMsg, setErrMsg]   = useState('');
  const [phone, setPhone]     = useState('');
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

  async function submitPhone() {
    const tg = window.Telegram?.WebApp;
    if (!tg || !phone.trim()) return;
    setSubmitting(true);
    await authenticate(tg, phone.trim());
    setSubmitting(false);
  }

  // ─── Loading ────────────────────────────────────────────────────────────────

  if (state === 'loading') {
    return (
      <div className="tg-driver-root min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400 mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  // ─── Need Phone ─────────────────────────────────────────────────────────────

  if (state === 'need_phone') {
    return (
      <div className="tg-driver-root min-h-screen flex items-center justify-center p-6 text-white">
        <div className="max-w-xs w-full">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center mx-auto mb-5 text-4xl shadow-xl shadow-sky-500/25">
            🚗
          </div>
          <h1 className="text-2xl font-bold text-center tracking-tight mb-1">Dokonect Driver</h1>
          <p className="text-slate-400 text-sm text-center mb-6">
            Kirish uchun telefon raqamingizni kiriting
          </p>
          <div className="tg-glass rounded-3xl p-5">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998901234567"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-base text-white placeholder:text-slate-500 mb-3 outline-none focus:border-sky-400/50 transition-colors"
            />
            <button
              onClick={submitPhone}
              disabled={submitting || !phone.trim()}
              className="w-full bg-gradient-to-r from-sky-500 to-blue-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-sky-900/30 active:scale-[0.98] transition-all"
            >
              {submitting ? 'Tekshirilmoqda...' : 'Kirish'}
            </button>
          </div>
          <p className="text-xs text-slate-500 text-center mt-4">
            Raqamingiz faqat tizimga kirish uchun ishlatiladi
          </p>
        </div>
      </div>
    );
  }

  // ─── Error ──────────────────────────────────────────────────────────────────

  return (
    <div className="tg-driver-root min-h-screen flex items-center justify-center p-6 text-white">
      <div className="text-center max-w-xs w-full">
        <div className="w-20 h-20 rounded-3xl bg-rose-500/15 flex items-center justify-center mx-auto mb-5 text-4xl">
          ❌
        </div>
        <h1 className="text-xl font-bold tracking-tight mb-2">Xatolik</h1>
        <p className="text-slate-400 text-sm mb-8">{errMsg}</p>
        <button
          onClick={() => window.Telegram?.WebApp.close()}
          className="w-full bg-white/5 hover:bg-white/10 text-slate-200 font-semibold py-3.5 rounded-2xl transition-colors"
        >
          Yopish
        </button>
      </div>
    </div>
  );
}
