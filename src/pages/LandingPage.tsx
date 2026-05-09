import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, X, Store, Truck, ShieldCheck,
  BarChart3, Package, Users, ChevronRight,
  Play, Zap, Globe, Clock,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../api/api';
import toast from 'react-hot-toast';
import DokonectLogo from '../components/ui/DokonectLogo';

const TEST_ACCOUNTS = [
  { role: 'Distribyutor', phone: '+998901234567', password: '123456', desc: "Mahsulotlar, buyurtmalar va haydovchilar", icon: Truck,       c: 'text-blue-400',    bg: 'rgba(79,142,247,0.1)',  border: 'rgba(79,142,247,0.2)'  },
  { role: "Do'kon egasi", phone: '+998901234500', password: '123456', desc: "Katalogdan mahsulot buyurtma qiling",      icon: Store,       c: 'text-violet-400',  bg: 'rgba(108,61,232,0.1)', border: 'rgba(108,61,232,0.2)' },
  { role: 'Admin',        phone: '+998900000000', password: '123456', desc: "Butun platformani nazorat qiling",         icon: ShieldCheck, c: 'text-emerald-400', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
];

const FEATURES = [
  { icon: Package,   title: 'Mahsulot boshqaruvi',  desc: "Real vaqtda inventar va narxlarni boshqaring",       c: 'text-blue-400',    bg: 'rgba(79,142,247,0.1)'  },
  { icon: BarChart3, title: 'Analitika',             desc: "Sotuv dinamikasi va daromad hisobotlari",            c: 'text-violet-400',  bg: 'rgba(108,61,232,0.1)' },
  { icon: Truck,     title: 'Yetkazib berish',       desc: "Haydovchilarni buyurtmalarga avtomatik tayinlash",   c: 'text-cyan-400',    bg: 'rgba(6,182,212,0.1)'  },
  { icon: Users,     title: 'Mijozlar bazasi',       desc: "Do'konlar bilan aloqani boshqaring",                c: 'text-emerald-400', bg: 'rgba(16,185,129,0.1)' },
  { icon: Zap,       title: 'Real vaqt',             desc: "Socket.io orqali instant bildirishnomalar",          c: 'text-amber-400',   bg: 'rgba(245,158,11,0.1)' },
  { icon: Globe,     title: "Ko'p tilli",            desc: "O'zbek, Rus, Ingliz tillari qo'llab-quvvatlanadi",  c: 'text-pink-400',    bg: 'rgba(236,72,153,0.1)' },
];

const STATS = [
  { value: '500+', label: "Do'konlar"     },
  { value: '50+',  label: 'Distribyutor' },
  { value: '99%',  label: 'Uptime'       },
  { value: '24/7', label: 'Support'      },
];

export default function LandingPage() {
  const navigate    = useNavigate();
  const { setAuth } = useAuthStore();
  const [showDemo,  setShowDemo]  = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDemo = async (acc: typeof TEST_ACCOUNTS[0]) => {
    setLoadingId(acc.role);
    try {
      const res     = await api.post('/api/auth/login', { phone: acc.phone, password: acc.password });
      const payload = res.data?.data ?? res.data;
      const user    = payload?.user  ?? payload;
      const token   = payload?.token ?? payload?.accessToken ?? '';
      if (!user?.id) { toast.error('Xatolik'); return; }
      setAuth({ id: user.id, name: user.name, email: user.email ?? '', phone: user.phone ?? '', role: user.role,
        distributorId: user.distributorId ?? user.distributor?.id ?? undefined,
        clientId: user.clientId ?? user.client?.id ?? undefined,
        driverId: user.driverId ?? user.driver?.id ?? undefined,
      }, token, payload?.refreshToken ?? '');
      toast.success(`${acc.role} sifatida kirdingiz!`);
      setShowDemo(false);
      if (user.role === 'DISTRIBUTOR')                           navigate('/distributor/dashboard', { replace: true });
      else if (user.role === 'STORE' || user.role === 'CLIENT') navigate('/store/dashboard',       { replace: true });
      else if (user.role === 'ADMIN')                           navigate('/admin/dashboard',        { replace: true });
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Xatolik');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen text-white overflow-x-hidden" style={{ background: '#080C1A', fontFamily: "'DM Sans','Outfit','Inter',sans-serif" }}>

      {/* BG effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-5%] left-[15%] w-[600px] h-[600px] rounded-full blur-[140px]" style={{ background: 'rgba(79,142,247,0.09)' }} />
        <div className="absolute top-[35%] right-[5%] w-[450px] h-[450px] rounded-full blur-[120px]" style={{ background: 'rgba(108,61,232,0.09)' }} />
        <div className="absolute bottom-[5%] left-[25%] w-[350px] h-[350px] rounded-full blur-[100px]" style={{ background: 'rgba(6,182,212,0.07)' }} />
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '56px 56px' }} />
      </div>

      {/* Navbar */}
      <nav className="relative z-20 flex items-center justify-between px-6 lg:px-16 py-5 max-w-7xl mx-auto">
        <DokonectLogo size={36} className="text-white" />
        <div className="flex items-center gap-2">
          <button onClick={() => setShowDemo(true)}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/5">
            <Play className="w-3.5 h-3.5" /> Demo
          </button>
          <button onClick={() => navigate('/login')}
            className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white border rounded-xl transition-all"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            Kirish
          </button>
          <button onClick={() => navigate('/register')}
            className="px-5 py-2 text-sm font-bold text-white rounded-xl transition-all"
            style={{ background: 'linear-gradient(135deg,#4F8EF7 0%,#6C3DE8 100%)', boxShadow: '0 4px 20px rgba(79,142,247,0.3)' }}>
            Boshlash
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-6 pt-20 pb-24 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-8 border"
            style={{ background: 'rgba(79,142,247,0.1)', borderColor: 'rgba(79,142,247,0.22)', color: '#4F8EF7' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#4F8EF7' }} />
            O'zbekistoning #1 B2B Savdo Platformasi
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-7">
            Biznesingizni{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg,#4F8EF7 0%,#6C3DE8 100%)' }}>
              yangi bosqichga
            </span>
            <br />olib chiqing
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Distribyutorlar, do'kon egalari va haydovchilarni birlashtiruvchi yagona platforma.
            Real vaqtda buyurtmalar, analitika va yetkazib berish boshqaruvi.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/register')}
              className="flex items-center gap-2.5 px-8 py-4 text-white font-bold rounded-2xl text-sm"
              style={{ background: 'linear-gradient(135deg,#4F8EF7 0%,#6C3DE8 100%)', boxShadow: '0 8px 32px rgba(79,142,247,0.35)' }}>
              Bepul boshlash <ArrowRight className="w-4 h-4" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
              onClick={() => setShowDemo(true)}
              className="flex items-center gap-2.5 px-8 py-4 font-bold rounded-2xl text-sm border"
              style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.12)' }}>
              <Play className="w-4 h-4 fill-white" /> Sinab ko'rish
            </motion.button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-2xl mx-auto">
          {STATS.map((s) => (
            <div key={s.label} className="text-center p-4 rounded-2xl border"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}>
              <p className="text-2xl font-black bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg,#4F8EF7,#6C3DE8)' }}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 lg:px-16 pb-24 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Nima uchun Dokonect?</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Biznesingizni o'sishiga yordam beruvchi barcha vositalar bir joyda</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.07 * i }}
              className="p-6 rounded-2xl border hover:border-white/15 transition-all group cursor-default"
              style={{ background: 'rgba(255,255,255,0.025)', borderColor: 'rgba(255,255,255,0.07)' }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                style={{ background: f.bg }}>
                <f.icon className={`w-5 h-5 ${f.c}`} />
              </div>
              <h3 className="font-bold text-white mb-2">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 pb-24 max-w-4xl mx-auto">
        <div className="text-center p-12 rounded-3xl border relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,rgba(79,142,247,0.1) 0%,rgba(108,61,232,0.1) 100%)', borderColor: 'rgba(79,142,247,0.18)' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px"
            style={{ background: 'linear-gradient(90deg,transparent,rgba(79,142,247,0.7),transparent)' }} />
          <DokonectLogo size={44} className="text-white justify-center mb-6" />
          <h2 className="text-3xl md:text-4xl font-black mb-3">Hoziroq boshlang</h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">Demo hisoblar bilan platformani bepul sinab ko'ring</p>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowDemo(true)}
            className="inline-flex items-center gap-2.5 px-8 py-4 text-white font-bold rounded-2xl"
            style={{ background: 'linear-gradient(135deg,#4F8EF7,#6C3DE8)', boxShadow: '0 8px 32px rgba(79,142,247,0.35)' }}>
            <Play className="w-4 h-4 fill-white" /> Demo kirish
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t px-6 py-8 text-center"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <DokonectLogo size={26} className="text-slate-500 justify-center mb-3" />
        <p className="text-slate-600 text-xs">© 2025 Dokonect. Barcha huquqlar himoyalangan.</p>
      </footer>

      {/* Demo Modal */}
      <AnimatePresence>
        {showDemo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}
            onClick={(e) => e.target === e.currentTarget && setShowDemo(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 24 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              className="w-full max-w-md rounded-3xl overflow-hidden border shadow-2xl"
              style={{ background: '#0E1425', borderColor: 'rgba(255,255,255,0.1)' }}>

              <div className="p-6 border-b flex items-center justify-between"
                style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                <div>
                  <DokonectLogo size={26} className="text-white mb-1" />
                  <p className="text-slate-500 text-xs mt-1.5">Rol tanlang va platformani sinab ko'ring</p>
                </div>
                <button onClick={() => setShowDemo(false)}
                  className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/8 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-3">
                {TEST_ACCOUNTS.map((acc) => (
                  <motion.button key={acc.role}
                    whileHover={{ scale: 1.01, x: 3 }} whileTap={{ scale: 0.99 }}
                    onClick={() => handleDemo(acc)}
                    disabled={loadingId !== null}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border transition-all group text-left disabled:opacity-60"
                    style={{ background: acc.bg, borderColor: acc.border }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{ background: 'rgba(255,255,255,0.05)', borderColor: acc.border }}>
                      {loadingId === acc.role
                        ? <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: acc.c.includes('blue') ? '#4F8EF7' : acc.c.includes('violet') ? '#8B5CF6' : '#10B981' }} />
                        : <acc.icon className={`w-6 h-6 ${acc.c}`} />}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white text-sm">{acc.role}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{acc.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </motion.button>
                ))}
              </div>

              <div className="px-5 pb-5">
                <div className="flex items-center gap-2.5 p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Clock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  <p className="text-xs text-slate-500">
                    Barcha demo hisoblar uchun parol:{' '}
                    <span className="font-mono font-bold text-slate-300">123456</span>
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