import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

import { getDriverOrdersFn, searchDriverOrderFn } from '../../api/driver.api';

type Period = 'today' | 'week' | 'month' | 'all';

const PERIOD_TABS: Array<{ key: Period; label: string }> = [
  { key: 'today', label: 'Bugun' },
  { key: 'week',  label: 'Hafta' },
  { key: 'month', label: 'Oy' },
  { key: 'all',   label: 'Hammasi' },
];

const STATUS_TABS = [
  { key: '',            label: 'Barchasi' },
  { key: 'ASSIGNED',    label: 'Tayinlangan' },
  { key: 'PICKED',      label: 'Olindi' },
  { key: 'IN_TRANSIT',  label: "Yo'lda" },
  { key: 'DELIVERED',   label: 'Yetkazildi' },
  { key: 'RETURNED',    label: 'Qaytarildi' },
  { key: 'CANCELLED',   label: 'Bekor' },
];

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  ASSIGNED:   { label: 'Tayinlangan', color: 'text-amber-400' },
  PICKED:     { label: 'Olindi',      color: 'text-violet-400' },
  IN_TRANSIT: { label: "Yo'lda",      color: 'text-amber-400' },
  DELIVERED:  { label: 'Yetkazildi',  color: 'text-green-400' },
  RETURNED:   { label: 'Qaytarildi',  color: 'text-red-400' },
  CANCELLED:  { label: 'Bekor',       color: 'text-red-400' },
};

const ACTIVE_STATUSES = new Set(['ASSIGNED', 'PICKED', 'IN_TRANSIT']);

function dateStr(d: Date) {
  return d.toISOString().split('T')[0];
}

function rangeFor(period: Period) {
  if (period === 'all') return {};
  const end = new Date();
  const start = new Date();
  if (period === 'week') start.setDate(start.getDate() - 6);
  if (period === 'month') start.setDate(start.getDate() - 29);
  return { startDate: dateStr(start), endDate: dateStr(end) };
}

export default function TgDriverOrderHistory() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>('all');
  const [status, setStatus] = useState('');
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);

  const { startDate, endDate } = rangeFor(period);

  const { data: ordersRes, isLoading } = useQuery({
    queryKey: ['tg-driver-orders', period, status, page],
    queryFn: () => getDriverOrdersFn({ status: status || undefined, startDate, endDate, page, limit: 20 }),
    staleTime: 15_000,
  });

  const orders: any[] = ordersRes?.data?.orders ?? ordersRes?.orders ?? [];
  const totalPages: number = ordersRes?.data?.pagination?.totalPages ?? ordersRes?.pagination?.totalPages ?? 1;

  function goToOrder(order: any) {
    if (ACTIVE_STATUSES.has(order.status)) navigate(`/driver/tg/delivery/${order.id}`);
    else navigate(`/driver/tg/orders/${order.id}`);
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!search.trim()) return;
    setSearching(true);
    try {
      const res = await searchDriverOrderFn(search.trim());
      const order = res?.data || res;
      if (order?.id) goToOrder(order);
      else toast.error('Buyurtma topilmadi');
    } catch {
      toast.error('Buyurtma topilmadi');
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="text-white">
      <div className="px-4 pt-10 pb-4">
        <h1 className="text-lg font-bold mb-3 tracking-tight">Buyurtmalar tarixi</h1>
        <form onSubmit={handleSearch} className="flex items-center gap-2 tg-glass rounded-2xl px-4 py-3">
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buyurtma raqami bo'yicha qidirish"
            inputMode="numeric"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500"
          />
          {searching && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sky-500 shrink-0" />}
        </form>
      </div>

      <div className="flex gap-2 px-4 pb-3">
        {PERIOD_TABS.map((t) => (
          <button key={t.key} onClick={() => { setPeriod(t.key); setPage(1); }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${period === t.key ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-900/30' : 'bg-white/5 text-slate-400'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="border-b border-white/[0.06]">
        <div className="flex overflow-x-auto scrollbar-hide px-4 gap-1">
          {STATUS_TABS.map((t) => (
            <button key={t.key} onClick={() => { setStatus(t.key); setPage(1); }}
              className={`shrink-0 px-3 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                status === t.key ? 'border-sky-400 text-sky-400' : 'border-transparent text-slate-500'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[...Array(4)].map((_, i) => <div key={i} className="tg-glass-soft rounded-2xl h-20 animate-pulse" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm">Bu bo'limda buyurtma yo'q</div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {orders.map((order) => {
              const s = STATUS_LABEL[order.status] ?? { label: order.status, color: 'text-slate-400' };
              return (
                <button key={order.id} onClick={() => goToOrder(order)}
                  className="tg-glass rounded-2xl p-3.5 text-left flex items-center justify-between active:scale-[0.98] transition-transform">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-sm">#{order.orderNumber}</p>
                      <span className={`text-xs font-semibold ${s.color}`}>{s.label}</span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{order.client?.user?.name || order.client?.storeName}</p>
                  </div>
                  <p className="font-bold text-sm shrink-0">{(order.totalAmount || 0).toLocaleString('uz-UZ')}</p>
                </button>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-4 mt-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="flex items-center gap-1 px-3 py-2 bg-white/5 rounded-xl text-xs text-slate-300 disabled:opacity-40">
              <ChevronLeft className="w-3.5 h-3.5" /> Oldingi
            </button>
            <span className="text-xs text-slate-400">{page} / {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-2 bg-white/5 rounded-xl text-xs text-slate-300 disabled:opacity-40">
              Keyingi <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
