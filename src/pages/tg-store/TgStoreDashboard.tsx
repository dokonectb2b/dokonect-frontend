import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { getClientDashboardFn } from '../../api/client.api';
import { getOrdersFn } from '../../api/order.api';

const PRIMARY = '#22C55E';

function fmt(n: number) {
  return new Intl.NumberFormat('uz-UZ').format(Math.round(n)) + " so'm";
}

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  NEW:       { label: 'Yangi',       color: '#3390F8', bg: '#EFF6FF' },
  ACCEPTED:  { label: 'Qabul',       color: '#22C55E', bg: '#F0FDF4' },
  ASSIGNED:  { label: 'Tayinlangan', color: '#F59E0B', bg: '#FFFBEB' },
  PICKED:    { label: 'Olindi',      color: '#8B5CF6', bg: '#F5F3FF' },
  IN_TRANSIT:{ label: "Yo'lda",      color: '#F59E0B', bg: '#FFFBEB' },
  DELIVERED: { label: 'Yetkazildi',  color: '#22C55E', bg: '#F0FDF4' },
  RETURNED:  { label: 'Qaytarildi',  color: '#EF4444', bg: '#FEF2F2' },
  CANCELLED: { label: 'Bekor',       color: '#EF4444', bg: '#FEF2F2' },
};

export default function TgStoreDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);

  const { data: dash } = useQuery({
    queryKey: ['tg-client-dashboard'],
    queryFn: getClientDashboardFn,
    select: (r) => r.data ?? r,
  });

  const { data: ordersData } = useQuery({
    queryKey: ['tg-client-orders-recent'],
    queryFn: () => getOrdersFn({ limit: 5 }),
    select: (r) => r.data ?? r,
  });

  const orders: any[] = ordersData?.orders ?? [];
  const activeOrders  = orders.filter((o: any) =>
    ['NEW','ACCEPTED','ASSIGNED','PICKED','IN_TRANSIT'].includes(o.status)
  ).length;

  return (
    <div>
      {/* Header */}
      <div className="px-4 pt-10 pb-6 text-white" style={{ background: `linear-gradient(135deg, ${PRIMARY}, #16A34A)` }}>
        <p className="text-sm opacity-80 mb-0.5">Xush kelibsiz 👋</p>
        <h1 className="text-xl font-bold">{user?.name || 'Do\'kon'}</h1>
        <p className="text-xs opacity-70 mt-0.5">{user?.phone}</p>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-2 mt-5">
          {[
            { label: 'Faol',      value: activeOrders,                   unit: 'ta' },
            { label: 'Jami',      value: dash?.totalOrders ?? 0,         unit: 'ta' },
            { label: 'Qarz',      value: fmt(dash?.totalDebt ?? 0),      unit: '' },
          ].map(({ label, value, unit }) => (
            <div key={label} className="bg-white/20 rounded-2xl p-3 text-center backdrop-blur-sm">
              <p className="text-base font-bold">{value}{unit && <span className="text-xs ml-0.5">{unit}</span>}</p>
              <p className="text-[10px] opacity-80 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-4 -mt-3 mb-4">
        <div className="bg-white rounded-2xl shadow-sm p-1 flex gap-1">
          {[
            { label: '📦 Katalog',     path: '/store/tg/catalog' },
            { label: '🛒 Savat',       path: '/store/tg/cart' },
            { label: '📋 Buyurtmalar', path: '/store/tg/orders' },
          ].map(({ label, path }) => (
            <button key={path} onClick={() => navigate(path)}
              className="flex-1 py-2.5 text-xs font-semibold text-gray-700 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors">
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Recent orders */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900 text-sm">So'nggi buyurtmalar</h2>
          <button onClick={() => navigate('/store/tg/orders')}
            className="text-xs font-medium" style={{ color: PRIMARY }}>
            Barchasi →
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-gray-500 text-sm">Hali buyurtma yo'q</p>
            <button onClick={() => navigate('/store/tg/catalog')}
              className="mt-4 px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
              style={{ background: PRIMARY }}>
              Katalogga o'tish
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {orders.slice(0, 5).map((order: any) => {
              const s = STATUS_LABEL[order.status] ?? { label: order.status, color: '#637381', bg: '#F9FAFB' };
              return (
                <button key={order.id} onClick={() => navigate(`/store/tg/orders/${order.id}`)}
                  className="bg-white rounded-2xl p-4 text-left w-full active:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-sm">Buyurtma #{order.orderNumber}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {order.distributor?.companyName || 'Distribyutor'}
                      </p>
                      <p className="text-sm font-bold mt-2" style={{ color: PRIMARY }}>
                        {fmt(order.totalAmount)}
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded-lg shrink-0"
                      style={{ color: s.color, background: s.bg }}>
                      {s.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div className="h-4" />
    </div>
  );
}
