import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { getClientDashboardFn, getClientFinanceFn } from '../../api/client.api';

const PRIMARY = '#22C55E';

function fmt(n: number) { return new Intl.NumberFormat('uz-UZ').format(Math.round(n)) + " so'm"; }

export default function TgStoreProfile() {
  const navigate = useNavigate();
  const { user: _user, logout } = useAuthStore();
  const user = _user as any;

  const { data: dash } = useQuery({
    queryKey: ['tg-client-dashboard'],
    queryFn:  getClientDashboardFn,
    select:   (r) => r.data ?? r,
  });

  const { data: finance } = useQuery({
    queryKey: ['tg-client-finance'],
    queryFn:  getClientFinanceFn,
    select:   (r) => r.data ?? r,
  });

  function handleLogout() {
    logout();
    window.Telegram?.WebApp?.close?.();
  }

  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <div>
      {/* Header */}
      <div className="px-4 pt-10 pb-8 text-white text-center"
        style={{ background: `linear-gradient(135deg, ${PRIMARY}, #16A34A)` }}>
        <div className="w-20 h-20 rounded-full bg-white/30 flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
          {initials}
        </div>
        <h1 className="text-xl font-bold">{user?.name ?? 'Foydalanuvchi'}</h1>
        <p className="text-sm opacity-80 mt-0.5">{user?.phone}</p>
        {user?.storeName && (
          <p className="text-xs opacity-60 mt-0.5">🏪 {user.storeName}</p>
        )}
      </div>

      <div className="px-4 -mt-4 flex flex-col gap-4">

        {/* Stats */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-900 text-sm mb-3">Statistika</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Jami buyurtma',  value: dash?.totalOrders ?? 0,          unit: 'ta' },
              { label: 'Yetkazildi',     value: dash?.deliveredOrders ?? 0,       unit: 'ta' },
              { label: 'Umumiy summa',   value: fmt(dash?.totalSpent ?? 0),       unit: '' },
            ].map(({ label, value, unit }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="font-bold text-gray-900 text-sm">{value}{unit && <span className="text-xs ml-0.5">{unit}</span>}</p>
                <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Finance summary */}
        {finance && (
          <div className="bg-white rounded-2xl p-4">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Moliya</h3>
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Jami qarzdorlik</span>
                <span className="font-bold text-sm text-red-500">{fmt(finance.totalDebt ?? 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">To'langan</span>
                <span className="font-bold text-sm text-green-600">{fmt(finance.totalPaid ?? 0)}</span>
              </div>
              {finance.creditLimit > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Kredit limiti</span>
                  <span className="font-bold text-sm text-gray-700">{fmt(finance.creditLimit)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Menu items */}
        <div className="bg-white rounded-2xl overflow-hidden">
          {[
            { icon: '📋', label: 'Buyurtmalarim',    path: '/store/tg/orders' },
            { icon: '📦', label: 'Katalog',           path: '/store/tg/catalog' },
            { icon: '🏢', label: 'Distribyutorlar',   path: '/store/tg/catalog' },
          ].map(({ icon, label, path }, i) => (
            <button key={label} onClick={() => navigate(path)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-gray-50 ${
                i > 0 ? 'border-t border-gray-50' : ''
              }`}>
              <span className="text-lg w-8 text-center">{icon}</span>
              <span className="flex-1 text-sm font-medium text-gray-800">{label}</span>
              <span className="text-gray-300 text-lg">›</span>
            </button>
          ))}
        </div>

        {/* Shop info */}
        {(user?.region || user?.address) && (
          <div className="bg-white rounded-2xl p-4">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Do'kon ma'lumotlari</h3>
            <div className="flex flex-col gap-2">
              {user?.region && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">📍</span>
                  <span className="text-sm text-gray-700">{user.region}</span>
                </div>
              )}
              {user?.address && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">🏠</span>
                  <span className="text-sm text-gray-700">{user.address}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Logout */}
        <button onClick={handleLogout}
          className="w-full py-3.5 rounded-2xl text-red-500 font-semibold text-sm bg-red-50">
          Chiqish
        </button>

        <div className="text-center text-xs text-gray-400 pb-2">
          Dokonect v1.0
        </div>
      </div>
      <div className="h-4" />
    </div>
  );
}
