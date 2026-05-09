import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, X, Store, Truck, ShieldCheck, ChevronRight, Play, Clock, ArrowUpRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../api/api';
import toast from 'react-hot-toast';

/* ─── Logo ─────────────────────────────────────────────────────────────────── */
const Logo = ({ size = 32, white = true }: { size?: number; white?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#4A90E2" />
        <stop offset="100%" stopColor="#7B5CE7" />
      </linearGradient>
    </defs>
    <path d="M18 12H46C68 12 82 28 82 50C82 72 68 88 46 88H18Z" fill="url(#lg)" />
    <path d="M30 26H44C58 26 68 37 68 50C68 63 58 74 44 74H30Z" fill={white ? 'white' : '#0A0F1E'} />
    <circle cx="43" cy="37" r="5.5" fill="url(#lg)" />
    <circle cx="57" cy="50" r="5.5" fill="url(#lg)" />
    <circle cx="43" cy="63" r="5.5" fill="url(#lg)" />
    <line x1="43" y1="37" x2="57" y2="50" stroke="url(#lg)" strokeWidth="3" strokeLinecap="round" />
    <line x1="57" y1="50" x2="43" y2="63" stroke="url(#lg)" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const LogoFull = ({ size = 36, white = true }: { size?: number; white?: boolean }) => (
  <div className="flex items-center gap-2.5">
    <Logo size={size} white={white} />
    <span style={{
      fontFamily: "'Clash Display','Cabinet Grotesk','DM Sans',sans-serif",
      fontWeight: 700, fontSize: size * 0.56, letterSpacing: '-0.03em',
      color: white ? '#fff' : '#0A0F1E', lineHeight: 1,
    }}>Dokonect</span>
  </div>
);

/* ─── Test accounts ─────────────────────────────────────────────────────────── */
const ACCOUNTS = [
  { role: 'Distribyutor', nav: 'DISTRIBUTOR', phone: '+998901234567', password: '123456', icon: Truck,       tag: 'B2B yetkazib berish', color: '#4A90E2' },
  { role: "Do'kon egasi",  nav: 'CLIENT',      phone: '+998901234500', password: '123456', icon: Store,       tag: 'Savdo platformasi',   color: '#7B5CE7' },
  { role: 'Admin',        nav: 'ADMIN',        phone: '+998900000000', password: '123456', icon: ShieldCheck, tag: 'Platform boshqaruvi', color: '#00C2A8' },
];

/* ─── Ticker items ──────────────────────────────────────────────────────────── */
const TICKER = ['Real vaqt buyurtmalar', 'B2B marketplace', 'Yetkazib berish tizimi', 'Analitika va hisobotlar', 'Haydovchi boshqaruvi', 'Inventar nazorati', '500+ do\'kon'];

/* ─── Main ──────────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showDemo, setShowDemo] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 120]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  useEffect(() => {
    const move = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  const handleDemo = async (acc: typeof ACCOUNTS[0]) => {
    setLoadingId(acc.role);
    try {
      const res = await api.post('/api/auth/login', { phone: acc.phone, password: acc.password });
      const payload = res.data?.data ?? res.data;
      const user = payload?.user ?? payload;
      const token = payload?.token ?? payload?.accessToken ?? '';
      if (!user?.id) { toast.error('Xatolik'); return; }
      setAuth({
        id: user.id, name: user.name, email: user.email ?? '', phone: user.phone ?? '', role: user.role,
        distributorId: user.distributorId ?? user.distributor?.id,
        clientId: user.clientId ?? user.client?.id,
        driverId: user.driverId ?? user.driver?.id,
      }, token, payload?.refreshToken ?? '');
      toast.success(`Xush kelibsiz!`);
      setShowDemo(false);
      if (user.role === 'DISTRIBUTOR') navigate('/distributor/dashboard', { replace: true });
      else if (user.role === 'STORE' || user.role === 'CLIENT') navigate('/store/dashboard', { replace: true });
      else if (user.role === 'ADMIN') navigate('/admin/dashboard', { replace: true });
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Xatolik');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden" style={{
      background: '#060A14',
      fontFamily: "'DM Sans','Outfit',sans-serif",
    }}>
      {/* ── Cursor glow ── */}
      <div className="fixed pointer-events-none z-0 w-[600px] h-[600px] rounded-full transition-all duration-700 ease-out"
        style={{
          background: 'radial-gradient(circle, rgba(74,144,226,0.06) 0%, transparent 70%)',
          left: mousePos.x - 300, top: mousePos.y - 300,
        }} />

      {/* ── Noise texture ── */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.035]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />

      {/* ── Grid ── */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)',
        backgroundSize: '72px 72px',
      }} />

      {/* ── Nav ── */}
      <nav className="relative z-30 flex items-center justify-between px-6 md:px-12 py-6 max-w-7xl mx-auto">
        <LogoFull size={34} />
        <div className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-500">
          {['Mahsulot', 'Narxlar', 'Haqida'].map(l => (
            <button key={l} className="px-3 py-1.5 hover:text-white transition-colors rounded-lg hover:bg-white/5">{l}</button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowDemo(true)}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white rounded-xl transition-all hover:bg-white/5">
            <Play className="w-3.5 h-3.5 fill-current" /> Demo
          </button>
          <button onClick={() => navigate('/login')}
            className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white rounded-xl border border-white/10 hover:border-white/20 transition-all">
            Kirish
          </button>
          <button onClick={() => navigate('/register')}
            className="flex items-center gap-1.5 px-5 py-2 text-sm font-bold text-white rounded-xl transition-all"
            style={{ background: 'linear-gradient(135deg,#4A90E2,#7B5CE7)', boxShadow: '0 0 24px rgba(74,144,226,0.3)' }}>
            Boshlash <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pb-32 overflow-hidden">

        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(74,144,226,0.08) 0%, rgba(123,92,231,0.06) 40%, transparent 70%)' }} />

        {/* Orbiting ring */}
        <motion.div
          animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border pointer-events-none"
          style={{ borderColor: 'rgba(74,144,226,0.07)', borderStyle: 'dashed' }} />
        <motion.div
          animate={{ rotate: -360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border pointer-events-none"
          style={{ borderColor: 'rgba(123,92,231,0.05)' }} />

        {/* Floating badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-[0.12em] mb-10"
          style={{ background: 'rgba(74,144,226,0.08)', borderColor: 'rgba(74,144,226,0.2)', color: '#6BA8ED' }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#4A90E2' }} />
          O'zbekistoning #1 B2B Platformasi
        </motion.div>

        {/* Headline */}
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="text-center max-w-5xl mx-auto">
          <h1 style={{
            fontFamily: "'Clash Display','Cabinet Grotesk','DM Sans',sans-serif",
            fontWeight: 700, lineHeight: 1.02, letterSpacing: '-0.04em',
            fontSize: 'clamp(52px, 8vw, 96px)',
          }}>
            <motion.span
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="block text-white">
              Biznesingizni
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.22 }}
              className="block"
              style={{ background: 'linear-gradient(135deg,#4A90E2 0%,#9B72E8 50%,#00C2A8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              raqamlashtiring
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.38 }}
            className="mt-8 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto"
            style={{ color: 'rgba(255,255,255,0.45)' }}>
            Distribyutorlar, do'kon egalari va haydovchilarni birlashtiruvchi yagona ekotizim.
            <br className="hidden md:block" /> Buyurtmalar, analitika, yetkazib berish — barchasi bir joyda.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.52 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-12">
            <button onClick={() => navigate('/register')}
              className="group flex items-center gap-2.5 px-8 py-4 text-white font-bold rounded-2xl text-sm transition-all"
              style={{ background: 'linear-gradient(135deg,#4A90E2,#7B5CE7)', boxShadow: '0 8px 40px rgba(74,144,226,0.35)' }}>
              Bepul boshlash
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button onClick={() => setShowDemo(true)}
              className="group flex items-center gap-2.5 px-8 py-4 font-bold rounded-2xl text-sm border transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors">
                <Play className="w-3 h-3 fill-current ml-0.5" />
              </div>
              Demo kirish
            </button>
          </motion.div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65 }}
          className="flex flex-wrap justify-center gap-px mt-20 rounded-2xl overflow-hidden border"
          style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          {[
            { n: '500+', l: "Faol do'konlar" },
            { n: '50+',  l: 'Distribyutor'  },
            { n: '10K+', l: 'Buyurtmalar'   },
            { n: '99.9%',l: 'Uptime'        },
          ].map((s, i) => (
            <div key={i} className="px-8 py-5 text-center"
              style={{ background: 'rgba(255,255,255,0.025)', minWidth: 120 }}>
              <p className="text-2xl font-black text-white">{s.n}</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.l}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Ticker ── */}
      <div className="relative z-10 overflow-hidden py-5 border-y" style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="flex gap-12 whitespace-nowrap">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="flex items-center gap-3 text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>
              <span className="w-1 h-1 rounded-full" style={{ background: '#4A90E2' }} />
              {t}
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── Who is it for ── */}
      <section className="relative z-10 px-6 md:px-12 py-28 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] mb-3" style={{ color: '#4A90E2' }}>Platforma imkoniyatlari</p>
            <h2 className="text-4xl md:text-5xl font-black text-white" style={{ letterSpacing: '-0.03em', lineHeight: 1.05 }}>
              Har bir rol uchun<br />maxsus panel
            </h2>
          </div>
          <p className="text-base max-w-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Distribyutordan tortib do'kon egasigacha — har bir foydalanuvchi o'z ishini samarali bajara oladi
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: Truck, title: 'Distribyutor', color: '#4A90E2',
              points: ['Mahsulot va narx boshqaruvi', 'Buyurtmalarni qabul qilish', 'Haydovchi tayinlash', 'Sotuv analitikasi', 'Inventar nazorati'],
            },
            {
              icon: Store, title: "Do'kon egasi", color: '#7B5CE7',
              points: ['Distribyutorga ulanish', 'Katalogdan buyurtma', 'Buyurtma kuzatish', 'Moliyaviy hisobot', 'Chat imkoniyati'],
            },
            {
              icon: ShieldCheck, title: 'Admin', color: '#00C2A8',
              points: ['Platforma statistikasi', 'Foydalanuvchi boshqaruvi', 'GMV monitoring', 'Distribyutor CRUD', 'Global analitika'],
            },
          ].map((card, i) => (
            <motion.div key={card.title}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.12 }}
              className="group relative rounded-3xl p-7 border overflow-hidden cursor-default transition-all duration-300"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
              whileHover={{ borderColor: `${card.color}30`, background: `${card.color}08` }}>

              {/* Glow on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(circle at 50% 0%, ${card.color}12 0%, transparent 60%)` }} />

              <div className="relative">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${card.color}18`, border: `1px solid ${card.color}25` }}>
                  <card.icon className="w-6 h-6" style={{ color: card.color }} />
                </div>
                <h3 className="text-xl font-black text-white mb-5" style={{ letterSpacing: '-0.02em' }}>{card.title}</h3>
                <ul className="space-y-3">
                  {card.points.map((p, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: card.color, opacity: 0.7 }} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="relative z-10 px-6 md:px-12 pb-28 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden p-12 md:p-16 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(74,144,226,0.12) 0%, rgba(123,92,231,0.12) 50%, rgba(0,194,168,0.08) 100%)', border: '1px solid rgba(74,144,226,0.2)' }}>

          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(74,144,226,0.15) 0%, transparent 60%)' }} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(74,144,226,0.6), transparent)' }} />

          <div className="relative">
            <LogoFull size={42} />
            <h2 className="text-4xl md:text-5xl font-black text-white mt-6 mb-4" style={{ letterSpacing: '-0.03em' }}>
              Hoziroq sinab ko'ring
            </h2>
            <p className="text-base mb-10 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Ro'yxatdan o'tmay, demo hisoblar orqali platformani to'liq sinab ko'ring
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button onClick={() => setShowDemo(true)}
                className="flex items-center gap-2.5 px-8 py-4 text-white font-bold rounded-2xl text-sm transition-all"
                style={{ background: 'linear-gradient(135deg,#4A90E2,#7B5CE7)', boxShadow: '0 8px 40px rgba(74,144,226,0.4)' }}>
                <Play className="w-4 h-4 fill-white" /> Demo kirish
              </button>
              <button onClick={() => navigate('/register')}
                className="flex items-center gap-2 px-8 py-4 text-sm font-bold rounded-2xl border transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}>
                Ro'yxatdan o'tish <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t px-6 md:px-12 py-10"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <LogoFull size={26} />
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>© 2025 Dokonect. Barcha huquqlar himoyalangan.</p>
          <div className="flex gap-4 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <button className="hover:text-white transition-colors">Shartlar</button>
            <button className="hover:text-white transition-colors">Maxfiylik</button>
            <button className="hover:text-white transition-colors">Aloqa</button>
          </div>
        </div>
      </footer>

      {/* ── Demo Modal ── */}
      <AnimatePresence>
        {showDemo && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backdropFilter: 'blur(16px)', background: 'rgba(6,10,20,0.85)' }}
            onClick={e => e.target === e.currentTarget && setShowDemo(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 24, stiffness: 300 }}
              className="w-full max-w-md overflow-hidden rounded-3xl border shadow-2xl"
              style={{ background: '#0C1222', borderColor: 'rgba(255,255,255,0.1)' }}>

              {/* Top accent */}
              <div className="h-px w-full" style={{ background: 'linear-gradient(90deg,transparent,#4A90E2,#7B5CE7,transparent)' }} />

              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <LogoFull size={30} />
                    <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      Rol tanlang va platformani bepul sinab ko'ring
                    </p>
                  </div>
                  <button onClick={() => setShowDemo(false)}
                    className="p-2 rounded-xl transition-colors"
                    style={{ color: 'rgba(255,255,255,0.3)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {ACCOUNTS.map(acc => (
                    <button key={acc.role}
                      onClick={() => handleDemo(acc)}
                      disabled={loadingId !== null}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group disabled:opacity-60"
                      style={{ background: `${acc.color}09`, borderColor: `${acc.color}20` }}
                      onMouseEnter={e => { e.currentTarget.style.background = `${acc.color}14`; e.currentTarget.style.borderColor = `${acc.color}35`; }}
                      onMouseLeave={e => { e.currentTarget.style.background = `${acc.color}09`; e.currentTarget.style.borderColor = `${acc.color}20`; }}>
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border"
                        style={{ background: `${acc.color}15`, borderColor: `${acc.color}25` }}>
                        {loadingId === acc.role
                          ? <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: acc.color, borderTopColor: 'transparent' }} />
                          : <acc.icon className="w-5 h-5" style={{ color: acc.color }} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm">{acc.role}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{acc.tag}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 shrink-0 transition-all" style={{ color: `${acc.color}60` }} />
                    </button>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-2.5 px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }} />
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    Barcha demo hisoblar uchun parol:{' '}
                    <span className="font-mono font-bold" style={{ color: 'rgba(255,255,255,0.7)' }}>123456</span>
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}