import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSocket } from '../../hooks/useSocket';

const NAV = [
  { path: '/driver/tg',          label: 'Bosh sahifa', icon: HomeIcon },
  { path: '/driver/tg/earnings', label: 'Daromad',      icon: EarningsIcon },
  { path: '/driver/tg/profile',  label: 'Profil',       icon: ProfileIcon },
];

export default function TgDriverLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  useSocket();

  return (
    <div className="tg-driver-root flex flex-col min-h-screen max-w-[430px] mx-auto">
      {/* Page content */}
      <main className="flex-1 overflow-y-auto pb-[92px]">
        <Outlet />
      </main>

      {/* Bottom navigation — floating glass */}
      <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] max-w-[406px] tg-nav rounded-[22px] z-50 overflow-hidden">
        <div className="flex px-1.5 py-1.5">
          {NAV.map(({ path, label, icon: Icon }) => {
            const exact  = path === '/driver/tg';
            const active = exact ? location.pathname === path : location.pathname.startsWith(path);
            return (
              <button key={path} onClick={() => navigate(path)}
                className="relative flex-1 flex flex-col items-center justify-center py-2 gap-1 rounded-2xl"
              >
                {active && (
                  <motion.div
                    layoutId="tg-nav-active"
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                    className="absolute inset-0 rounded-2xl bg-gradient-to-b from-sky-500/25 to-sky-500/5 border border-sky-400/20"
                  />
                )}
                <span className="relative"><Icon active={active} /></span>
                <span className={`relative text-[10px] font-semibold tracking-tight transition-colors ${active ? 'text-sky-300' : 'text-slate-500'}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

// ─── SVG Icons ──────────────────────────────────────────────────────────────

function HomeIcon({ active }: { active: boolean }) {
  const c = active ? '#38BDF8' : '#64748B';
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? c : 'none'}
      stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function EarningsIcon({ active }: { active: boolean }) {
  const c = active ? '#38BDF8' : '#64748B';
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  const c = active ? '#38BDF8' : '#64748B';
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
