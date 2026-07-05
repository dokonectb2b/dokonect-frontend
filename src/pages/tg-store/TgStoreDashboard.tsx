import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ShoppingCart, ClipboardList, ChevronRight } from 'lucide-react';
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

  const initials = (user?.name || "Do'kon")
    .split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div>
      {/* Header — gradient hero */}
      <div className="tgs-hero relative overflow-hidden px-4 pt-10 pb-16 text-white">
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/15 blur-2xl" />
        <div className="absolute top-20 -left-10 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center font-bold text-base shadow-lg">
            {initials}
          </div>
          <div>
            <p className="text-xs opacity-80">Xush kelibsiz 👋</p>
            <h1 className="text-lg font-bold tracking-tight">{user?.name || "Do'kon"}</h1>
            <p className="text-[11px] opacity-70">{user?.phone}</p>
          </div>
        </div>
      </div>

      {/* Stat cards — hero ustiga chiqib turadi */}
      <div className="px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: 'Faol buyurtma', value: String(activeOrders),        accent: 'text-amber-500' },
            { label: 'Jami buyurtma', value: String(dash?.totalOrders ?? 0), accent: 'text-green-600' },
            { label: 'Qarzdorlik',    value: fmt(dash?.totalDebt ?? 0),   accent: 'text-rose-500' },
          ].map(({ label, value, accent }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="tgs-card rounded-2xl p-3 text-center">
              <p className={`text-sm font-bold tracking-tight ${accent}`}>{value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-4 mt-4 mb-5">
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { icon: Package,       label: 'Katalog',     path: '/store/tg/catalog', tint: 'bg-green-50 text-green-600' },
            { icon: ShoppingCart,  label: 'Savat',       path: '/store/tg/cart',    tint: 'bg-emerald-50 text-emerald-600' },
            { icon: ClipboardList, label: 'Buyurtmalar', path: '/store/tg/orders',  tint: 'bg-teal-50 text-teal-600' },
          ].map(({ icon: Icon, label, path, tint }) => (
            <button key={path} onClick={() => navigate(path)}
              className="tgs-card rounded-2xl p-3.5 flex flex-col items-center gap-2 active:scale-95 transition-transform">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tint}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-gray-700">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent orders */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900 text-sm tracking-tight">So'nggi buyurtmalar</h2>
          <button onClick={() => navigate('/store/tg/orders')}
            className="flex items-center text-xs font-semibold" style={{ color: PRIMARY }}>
            Barchasi <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="tgs-card rounded-3xl p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
              <ClipboardList className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-gray-500 text-sm">Hali buyurtma yo'q</p>
            <button onClick={() => navigate('/store/tg/catalog')}
              className="mt-4 px-6 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg shadow-green-500/25 active:scale-95 transition-transform"
              style={{ background: `linear-gradient(135deg, ${PRIMARY}, #16A34A)` }}>
              Katalogga o'tish
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {orders.slice(0, 5).map((order: any, i: number) => {
              const s = STATUS_LABEL[order.status] ?? { label: order.status, color: '#637381', bg: '#F9FAFB' };
              return (
                <motion.button key={order.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  onClick={() => navigate(`/store/tg/orders/${order.id}`)}
                  className="tgs-card rounded-2xl p-4 text-left w-full active:scale-[0.98] transition-transform">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-sm">Buyurtma #{order.orderNumber}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {order.distributor?.companyName || 'Distribyutor'}
                      </p>
                      <p className="text-sm font-bold mt-2 tracking-tight" style={{ color: PRIMARY }}>
                        {fmt(order.totalAmount)}
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
                      style={{ color: s.color, background: s.bg }}>
                      {s.label}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
      <div className="h-4" />
    </div>
  );
}
