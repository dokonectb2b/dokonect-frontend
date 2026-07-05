import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getOrdersFn } from '../../api/order.api';

const PRIMARY = '#22C55E';

const TABS = [
  { key: '',            label: 'Barchasi' },
  { key: 'NEW',         label: 'Yangi' },
  { key: 'ACCEPTED',    label: 'Faol' },
  { key: 'DELIVERED',   label: 'Yetkazildi' },
  { key: 'CANCELLED',   label: 'Bekor' },
];

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  NEW:        { label: 'Yangi',       color: '#3390F8', bg: '#EFF6FF' },
  ACCEPTED:   { label: 'Qabul',       color: '#22C55E', bg: '#F0FDF4' },
  ASSIGNED:   { label: 'Tayinlangan', color: '#F59E0B', bg: '#FFFBEB' },
  PICKED:     { label: 'Olindi',      color: '#8B5CF6', bg: '#F5F3FF' },
  IN_TRANSIT: { label: "Yo'lda",      color: '#F59E0B', bg: '#FFFBEB' },
  DELIVERED:  { label: 'Yetkazildi',  color: '#22C55E', bg: '#F0FDF4' },
  RETURNED:   { label: 'Qaytarildi',  color: '#EF4444', bg: '#FEF2F2' },
  CANCELLED:  { label: 'Bekor',       color: '#EF4444', bg: '#FEF2F2' },
  PAID:       { label: "To'landi",    color: '#22C55E', bg: '#F0FDF4' },
};

function fmt(n: number) { return new Intl.NumberFormat('uz-UZ').format(Math.round(n)) + " so'm"; }
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function TgStoreOrders() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['tg-orders', activeTab],
    queryFn:  () => getOrdersFn({ status: activeTab || undefined, limit: 50 }),
    select:   (r) => r.data ?? r,
  });

  const orders: any[] = data?.orders ?? data ?? [];

  return (
    <div>
      {/* Header — gradient hero */}
      <div className="tgs-hero relative overflow-hidden px-4 pt-10 pb-6 text-white">
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/15 blur-2xl" />
        <h1 className="relative text-xl font-bold tracking-tight">Buyurtmalar</h1>
        <p className="relative text-sm opacity-80 mt-0.5">{orders.length} ta buyurtma</p>
      </div>

      {/* Status filter tabs — pill uslub */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex overflow-x-auto scrollbar-hide gap-2">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`shrink-0 px-4 py-2 text-xs font-semibold rounded-full whitespace-nowrap transition-all active:scale-95 ${
                activeTab === t.key
                  ? 'text-white shadow-md shadow-green-500/25'
                  : 'tgs-card text-gray-500'
              }`}
              style={activeTab === t.key ? { background: `linear-gradient(135deg, ${PRIMARY}, #16A34A)` } : undefined}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="tgs-card rounded-2xl h-24 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-2xl">📋</div>
            <p className="text-gray-700 font-semibold">Buyurtmalar yo'q</p>
            <p className="text-gray-400 text-sm mt-1">Bu kategoriyada hali buyurtma yo'q</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {orders.map((order: any) => {
              const s = STATUS_LABEL[order.status] ?? { label: order.status, color: '#637381', bg: '#F9FAFB' };
              return (
                <button key={order.id}
                  onClick={() => navigate(`/store/tg/orders/${order.id}`)}
                  className="tgs-card rounded-2xl p-4 text-left w-full active:scale-[0.98] transition-transform">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-gray-900 text-sm">#{order.orderNumber}</p>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                          style={{ color: s.color, background: s.bg }}>
                          {s.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 truncate">
                        {order.distributor?.companyName || 'Distribyutor'}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {order.createdAt ? fmtDate(order.createdAt) : ''}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm tracking-tight" style={{ color: PRIMARY }}>
                        {fmt(order.totalAmount)}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {order.items?.length ?? 0} mahsulot
                      </p>
                    </div>
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
