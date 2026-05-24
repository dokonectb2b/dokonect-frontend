import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, Search, TrendingUp, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAdminOrdersFn } from '../../api/admin.api';
import { format } from 'date-fns';
import { uz } from 'date-fns/locale';

const PERIODS = [
  { value: 'today',  label: 'Bugun'    },
  { value: 'week',   label: 'Haftalik' },
  { value: 'month',  label: 'Oylik'    },
  { value: 'custom', label: 'Custom'   },
];

const AdminPaymentsPage = () => {
  const [search,        setSearch]        = useState('');
  const [period,        setPeriod]        = useState('month');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [page,          setPage]          = useState(1);

  const { data: res, isLoading } = useQuery({
    queryKey: ['admin-payments', period],
    queryFn: () => getAdminOrdersFn({ status: 'DELIVERED', limit: 1000 }),
    retry: false,
  });

  const orders: any[] = res?.data?.orders || res?.orders || res?.data || [];

  const periodStart = (): Date => {
    const now = new Date();
    if (period === 'today') { const d = new Date(now); d.setHours(0, 0, 0, 0); return d; }
    if (period === 'week')  { const d = new Date(now); d.setDate(d.getDate() - 7); return d; }
    if (period === 'month') { const d = new Date(now); d.setMonth(d.getMonth() - 1); return d; }
    return new Date(0);
  };

  const paidOrders = orders.filter((o: any) =>
    ['DELIVERED', 'PAID'].includes(o.status) &&
    new Date(o.updatedAt ?? o.createdAt) >= periodStart(),
  );

  const filtered = paidOrders.filter((o: any) => {
    const q = search.toLowerCase();
    const matchSearch = !q || o.client?.storeName?.toLowerCase().includes(q) || o.id?.toLowerCase().includes(q);
    const matchPay    = !paymentFilter || o.paymentMethod === paymentFilter;
    return matchSearch && matchPay;
  });
  const PAGE_SIZE = 20;
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalRevenue = paidOrders.reduce((s: number, o: any) => s + (o.totalAmount || 0), 0);
  const cashRevenue  = paidOrders.filter((o: any) => o.paymentMethod === 'CASH').reduce((s: number, o: any) => s + (o.totalAmount || 0), 0);
  const onlineRevenue = paidOrders.filter((o: any) => o.paymentMethod !== 'CASH').reduce((s: number, o: any) => s + (o.totalAmount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-sky-400" /> To'lovlar
          </h1>
          <p className="text-slate-400 text-sm mt-1">Moliyaviy monitoring</p>
        </div>
        <div className="flex gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
          {PERIODS.map((p) => (
            <button key={p.value} onClick={() => { setPeriod(p.value); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${period === p.value ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Umumiy pul aylanmasi', value: totalRevenue,  icon: TrendingUp, c: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Naqd to\'lovlar',       value: cashRevenue,   icon: DollarSign, c: 'text-amber-400',   bg: 'bg-amber-500/10'   },
          { label: 'Online to\'lovlar',      value: onlineRevenue, icon: CreditCard, c: 'text-sky-400',     bg: 'bg-sky-500/10'     },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
              <s.icon className={`w-6 h-6 ${s.c}`} />
            </div>
            <div>
              <p className="text-xs text-slate-400">{s.label}</p>
              <p className={`text-xl font-bold ${s.c}`}>{s.value.toLocaleString('uz-UZ')} UZS</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Do'kon nomi yoki buyurtma ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40" />
        </div>
        <select value={paymentFilter} onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none">
          <option value="">Barcha to'lov turlari</option>
          <option value="CASH">Naqd</option>
          <option value="CARD">Karta</option>
          <option value="ONLINE">Online</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/50">
                  {['Buyurtma ID', "Do'kon", 'Distribyutor', 'Summa', "To'lov turi", 'Sana'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {paged.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-slate-500">To'lovlar topilmadi</td></tr>
                ) : paged.map((order: any) => (
                  <tr key={order.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">#{order.orderNumber}</td>
                    <td className="px-4 py-3 font-medium text-white">{order.client?.storeName || '—'}</td>
                    <td className="px-4 py-3 text-slate-300">{order.distributor?.companyName || '—'}</td>
                    <td className="px-4 py-3 font-bold text-emerald-400">{(order.totalAmount||0).toLocaleString('uz-UZ')} UZS</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full border font-medium ${
                        order.paymentMethod === 'CASH'
                          ? 'bg-amber-900/40 text-amber-300 border-amber-800/30'
                          : 'bg-sky-900/40 text-sky-300 border-sky-800/30'
                      }`}>
                        {order.paymentMethod === 'CASH' ? 'Naqd' : order.paymentMethod || 'Online'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                      {order.createdAt ? format(new Date(order.createdAt), 'dd MMM yyyy, HH:mm', { locale: uz }) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-400 hover:text-white disabled:opacity-40 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Oldingi
          </button>
          <span className="text-sm text-slate-400">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-400 hover:text-white disabled:opacity-40 transition-colors">
            Keyingi <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentsPage;