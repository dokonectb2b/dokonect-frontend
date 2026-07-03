import { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { getDriverEarningsFn } from '../../api/driver.api';

type Period = 'today' | 'week' | 'month';

const TABS: Array<{ key: Period; label: string }> = [
  { key: 'today', label: 'Bugun' },
  { key: 'week',  label: 'Hafta' },
  { key: 'month', label: 'Oy'    },
];

function dateStr(d: Date) {
  return d.toISOString().split('T')[0];
}

function rangeFor(period: Period) {
  const end = new Date();
  const start = new Date();
  if (period === 'week') start.setDate(start.getDate() - 6);
  if (period === 'month') start.setDate(start.getDate() - 29);
  return { startDate: dateStr(start), endDate: dateStr(end) };
}

export default function TgDriverEarnings() {
  const [period, setPeriod] = useState<Period>('today');
  const [page,   setPage]   = useState(1);

  const { startDate, endDate } = rangeFor(period);

  const { data: earningsRes } = useQuery({
    queryKey: ['tg-driver-earnings', period, page],
    queryFn: () => getDriverEarningsFn({ startDate, endDate, page, limit: 20 }),
    staleTime: 30_000,
  });

  const earnings     = earningsRes?.data || earningsRes || {};
  const earningsList: any[] = earnings.earnings || [];
  const totalPages   = earnings.pagination?.totalPages ?? 1;

  return (
    <div className="text-white p-4 pt-8">
      <h1 className="text-lg font-bold mb-4 tracking-tight">Daromadlar</h1>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-5 mb-4 shadow-2xl shadow-emerald-900/40 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-white/15 backdrop-blur rounded-2xl"><DollarSign className="w-5 h-5" /></div>
            <div>
              <p className="text-emerald-50/90 text-xs">Jami daromad</p>
              <p className="text-2xl font-bold tracking-tight">{(earnings.total || 0).toLocaleString('uz-UZ')} so'm</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-50/80">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Tanlangan davr bo'yicha</span>
          </div>
        </div>
      </motion.div>

      <div className="flex gap-2 mb-4">
        {TABS.map((tab) => (
          <button key={tab.key} onClick={() => { setPeriod(tab.key); setPage(1); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 ${period === tab.key ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-900/30' : 'bg-white/5 text-slate-400'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tg-glass rounded-2xl p-4">
        <p className="font-semibold text-sm mb-3">Daromad tafsiloti</p>
        <div className="space-y-2.5">
          {earningsList.map((earning: any, i: number) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <div>
                <p className="font-medium text-sm">Buyurtma #{earning.order?.orderNumber ?? earning.orderId?.slice(0, 8)}</p>
                <p className="text-xs text-slate-400">{format(new Date(earning.date), 'MMM dd, HH:mm')}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald-400 text-sm">+{(earning.amount || 0).toLocaleString('uz-UZ')}</p>
                {earning.bonus > 0 && <p className="text-xs text-amber-400">+{earning.bonus.toLocaleString('uz-UZ')} bonus</p>}
              </div>
            </motion.div>
          ))}
          {earningsList.length === 0 && <div className="text-center py-8 text-slate-500 text-sm">Bu davr uchun daromad yo'q</div>}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-4 border-t border-white/10 mt-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="flex items-center gap-1 px-3 py-2 bg-white/5 rounded-xl text-xs text-slate-300 disabled:opacity-40">
              <ChevronLeft className="w-3.5 h-3.5" /> Oldingi
            </button>
            <span className="text-xs text-slate-400">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-2 bg-white/5 rounded-xl text-xs text-slate-300 disabled:opacity-40">
              Keyingi <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
