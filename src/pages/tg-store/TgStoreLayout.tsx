import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useCartStore } from '../../store/cart.store';

const NAV = [
  { path: '/store/tg',         label: 'Bosh sahifa', icon: HomeIcon },
  { path: '/store/tg/catalog', label: 'Katalog',     icon: CatalogIcon },
  { path: '/store/tg/cart',    label: 'Savat',       icon: CartIcon,   badge: true },
  { path: '/store/tg/orders',  label: 'Buyurtmalar', icon: OrdersIcon },
  { path: '/store/tg/profile', label: 'Profil',      icon: ProfileIcon },
];

export default function TgStoreLayout() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const cartCount = useCartStore(s => s.items.reduce((n, i) => n + i.quantity, 0));

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 max-w-[430px] mx-auto">
      {/* Page content */}
      <main className="flex-1 overflow-y-auto pb-[72px]">
        <Outlet />
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-100 z-50"
        style={{ boxShadow: '0 -2px 12px rgba(0,0,0,0.06)' }}>
        <div className="flex">
          {NAV.map(({ path, label, icon: Icon, badge }) => {
            const exact  = path === '/store/tg';
            const active = exact ? location.pathname === path : location.pathname.startsWith(path);
            return (
              <button key={path} onClick={() => navigate(path)}
                className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 relative"
              >
                <div className="relative">
                  <Icon active={active} />
                  {badge && cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                      style={{ background: '#22C55E' }}>
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-medium ${active ? 'text-green-500' : 'text-gray-400'}`}>
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
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#22C55E' : 'none'}
      stroke={active ? '#22C55E' : '#9CA3AF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function CatalogIcon({ active }: { active: boolean }) {
  const c = active ? '#22C55E' : '#9CA3AF';
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="7" height="7" /><rect x="15" y="3" width="7" height="7" />
      <rect x="15" y="14" width="7" height="7" /><rect x="2" y="14" width="7" height="7" />
    </svg>
  );
}

function CartIcon({ active }: { active: boolean }) {
  const c = active ? '#22C55E' : '#9CA3AF';
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.96-1.63L23 6H6" />
    </svg>
  );
}

function OrdersIcon({ active }: { active: boolean }) {
  const c = active ? '#22C55E' : '#9CA3AF';
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="12" y2="17" />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  const c = active ? '#22C55E' : '#9CA3AF';
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
