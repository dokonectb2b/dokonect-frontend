import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  CreditCard, Banknote, AlertCircle, Truck, CalendarDays,
  CheckCircle2, Clock, TrendingUp, Search, Filter,
  ChevronDown, Phone, Store,
} from 'lucide-react';
import { DayPicker, DateRange } from 'react-day-picker';
import { format, subDays } from 'date-fns';
import { uz } from 'date-fns/locale';
import 'react-day-picker/style.css';
import { getPaymentsAnalyticsFn } from '../../api/analytics.api';

const METHOD_LABEL: Record<string, string> = {
  CARD:          'Karta',
  BANK_TRANSFER: "Bank o'tkazma",
  CASH:          'Naqt',
  CREDIT:        'Kredit',
};

const STATUS_CFG: Record<string, { label: string; bg: string; text: string }> = {
  PAID:     { label: "To'langan",   bg: 'bg-emerald-100', text: 'text-emerald-700' },
  UNPAID:   { label: "To'lanmagan", bg: 'bg-red-100',     text: 'text-red-700'     },
  PARTIAL:  { label: 'Qisman',      bg: 'bg-amber-100',   text: 'text-amber-700'   },
  REFUNDED: { label: 'Qaytarildi',  bg: 'bg-slate-100',   text: 'text-slate-600'   },
};

const PaymentsPage = () => {
  const [tab,          setTab]          = useState<'driver' | 'online'>('driver');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [range, setRange] = useState<DateRange>({ from: subDays(new Date(), 7), to: new Date() });
  const calRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (calRef.current && !calRef.current.contains(e.target as Node)) setCalendarOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const fromStr    = range.from ? format(range.from, 'yyyy-MM-dd') : undefined;
  const toStr      = range.to   ? format(range.to,   'yyyy-MM-dd') : undefined;
  const rangeLabel = range.from && range.to
    ? `${format(range.from, 'd MMM', { locale: uz })} — ${format(range.to, 'd MMM yyyy', { locale: uz })}`
    : 'Sana tanlang';

  const { data: res, isLoading } = useQuery({
    queryKey: ['payments-analytics', fromStr, toStr],
    queryFn: () => getPaymentsAnalyticsFn({ from: fromStr, to: toStr }),
    enabled: !!fromStr,
    staleTime: 60_000,
    retry: false,
  });

  const data     = res?.data || res || {};
  const summary  = data.summary         || {};
  const drivers: any[] = data.driverPayments || [];
  const online:  any[] = data.onlinePayments || [];

  // ── Barcha to'lovlarni yoyib ro'yxat qilish ──────────────────────────────
  const allDriverRows: any[] = drivers.flatMap((d: any) =>
    (d.collections || []).map((c: any) => ({
      ...c,
      driverName: d.driverName,
      driverId:   d.driverId,
      type:       'driver',
    }))
  );

  const allOnlineRows: any[] = online.map((p: any) => ({ ...p, type: 'online' }));

  // ── Filter ────────────────────────────────────────────────────────────────
  const filterRow = (row: any) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      row.storeName?.toLowerCase().includes(q) ||
      row.driverName?.toLowerCase().includes(q) ||
      row.storePhone?.includes(q);
    const matchStatus = !statusFilter || row.paymentStatus === statusFilter;
    const matchMethod = !methodFilter || row.method === methodFilter;
    return matchSearch && matchStatus && matchMethod;
  };

  const filteredDriver = allDriverRows.filter(filterRow);
  const filteredOnline = allOnlineRows.filter(filterRow);
  const currentRows    = tab === 'driver' ? filteredDriver : filteredOnline;

  // Jami (filtered)
  const filteredTotal = currentRows.reduce((s: number, r: any) => s + (r.amount || 0), 0);

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
    </div>
  );

  return (
    <div className="fade-in space-y-6 max-w-7xl mx-auto pb-12">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-widest underline decoration-indigo-500 decoration-2 underline-offset-8">
            To'lovlar
          </h1>
          <p className="text-slate-500 text-sm mt-1">Online va haydovchi naqt to'lovlari tahlili.</p>
        </div>

        {/* Date picker */}
        <div className="relative" ref={calRef}>
          <button onClick={() => setCalendarOpen(v => !v)}
            className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-indigo-400 transition-all">
            <CalendarDays className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>{rangeLabel}</span>
          </button>
          {calendarOpen && (
            <div className="absolute right-0 top-12 z-50 bg-white rounded-2xl border border-slate-200 shadow-2xl p-3">
              <DayPicker mode="range" selected={range}
                onSelect={(r) => { if (r) { setRange(r); if (r.from && r.to) setCalendarOpen(false); } }}
                locale={uz} disabled={{ after: new Date() }} numberOfMonths={2} className="text-sm" />
              <div className="flex gap-2 border-t border-slate-100 pt-2 mt-1">
                {[{ label: '7 kun', days: 7 }, { label: '30 kun', days: 30 }, { label: '90 kun', days: 90 }].map(({ label, days }) => (
                  <button key={days}
                    onClick={() => { setRange({ from: subDays(new Date(), days), to: new Date() }); setCalendarOpen(false); }}
                    className="flex-1 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700 rounded-lg transition-colors">
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { key: 'online', label: 'Online to\'lovlar', icon: CreditCard, color: 'indigo', value: summary.onlineTotal || 0, sub: `${summary.onlineCount || 0} ta buyurtma` },
          { key: 'driver', label: 'Haydovchi naqt',   icon: Banknote,   color: 'emerald', value: summary.cashTotal || 0,   sub: `${summary.cashCount || 0} ta buyurtma`  },
          { key: null,     label: "To'lanmagan",      icon: AlertCircle, color: 'red',    value: summary.unpaidTotal || 0, sub: 'Kutilmoqda' },
        ].map((card) => (
          <div key={card.label}
            onClick={() => card.key && setTab(card.key as any)}
            className={`bg-white rounded-3xl border shadow-sm p-6 relative overflow-hidden group ${card.key ? 'cursor-pointer' : ''} ${tab === card.key ? `border-${card.color}-300` : 'border-slate-200'}`}>
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${card.color}-50 rounded-bl-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500`} />
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-2xl bg-${card.color}-50 flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 text-${card.color}-500`} />
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{card.label}</p>
            </div>
            <p className="text-2xl font-black text-slate-900">{card.value.toLocaleString('uz-UZ')} UZS</p>
            <p className={`text-xs text-${card.color}-500 font-bold mt-2 flex items-center gap-1`}>
              <TrendingUp className="w-3 h-3" /> {card.sub}
            </p>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
        {[
          { key: 'driver', label: 'Haydovchi naqt',  icon: Truck      },
          { key: 'online', label: "Online to'lovlar", icon: CreditCard },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
              tab === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Qidiruv */}
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Do'kon nomi yoki haydovchi nomi..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50" />
          </div>

          {/* Status filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50 appearance-none">
              <option value="">Barcha statuslar</option>
              <option value="PAID">To'langan</option>
              <option value="UNPAID">To'lanmagan</option>
              <option value="PARTIAL">Qisman</option>
              <option value="REFUNDED">Qaytarildi</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Method filter (only online) */}
          {tab === 'online' && (
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select value={methodFilter} onChange={e => setMethodFilter(e.target.value)}
                className="pl-9 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50 appearance-none">
                <option value="">Barcha usullar</option>
                <option value="CARD">Karta</option>
                <option value="BANK_TRANSFER">Bank o'tkazma</option>
                <option value="CASH">Naqt</option>
                <option value="CREDIT">Kredit</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          )}

          {/* Tozalash */}
          {(search || statusFilter || methodFilter) && (
            <button onClick={() => { setSearch(''); setStatusFilter(''); setMethodFilter(''); }}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-500 hover:text-red-500 hover:border-red-200 transition-all bg-slate-50">
              Tozalash
            </button>
          )}
        </div>

        {/* Result count */}
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-3">
          <span>{currentRows.length} ta natija topildi</span>
          <span>Jami: <strong className="text-slate-700">{filteredTotal.toLocaleString('uz-UZ')} UZS</strong></span>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {currentRows.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              {tab === 'driver' ? <Banknote className="w-7 h-7 text-slate-300" /> : <CreditCard className="w-7 h-7 text-slate-300" />}
            </div>
            <p className="text-slate-400 font-bold">To'lovlar topilmadi</p>
            <p className="text-slate-300 text-sm mt-1">Filter yoki sana oralig'ini o'zgartiring</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-4 py-3.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">#</th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Do'kon</th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    {tab === 'driver' ? 'Haydovchi' : 'To\'lov usuli'}
                  </th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Sana</th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3.5 text-right text-[10px] font-black text-slate-400 uppercase tracking-wider">Summa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentRows.map((row: any, i: number) => {
                  const st     = STATUS_CFG[row.paymentStatus] || STATUS_CFG.UNPAID;
                  const method = METHOD_LABEL[row.method] || row.method;
                  return (
                    <tr key={row.orderId || i} className="hover:bg-slate-50/70 transition-colors">
                      {/* # */}
                      <td className="px-4 py-3.5 text-slate-400 text-xs font-semibold">{i + 1}</td>

                      {/* Do'kon */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 font-black text-sm flex items-center justify-center shrink-0">
                            {(row.storeName || 'S').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{row.storeName || '—'}</p>
                            {row.storePhone && (
                              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3" />{row.storePhone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Haydovchi / Usul */}
                      <td className="px-4 py-3.5">
                        {tab === 'driver' ? (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 font-black text-xs flex items-center justify-center shrink-0">
                              {(row.driverName || 'H').charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm text-slate-700 font-medium">{row.driverName || '—'}</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700">
                            <CreditCard className="w-3 h-3" />{method || '—'}
                          </span>
                        )}
                      </td>

                      {/* Sana */}
                      <td className="px-4 py-3.5 text-sm text-slate-500 whitespace-nowrap">
                        {row.date ? format(new Date(row.date), 'd MMM yyyy', { locale: uz }) : '—'}
                        {row.date && <span className="block text-xs text-slate-400">{format(new Date(row.date), 'HH:mm')}</span>}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl ${st.bg} ${st.text}`}>
                          {row.paymentStatus === 'PAID'
                            ? <CheckCircle2 className="w-3 h-3" />
                            : <Clock className="w-3 h-3" />}
                          {st.label}
                        </span>
                      </td>

                      {/* Summa */}
                      <td className="px-4 py-3.5 text-right">
                        <span className={`font-black text-sm ${row.paymentStatus === 'PAID' ? 'text-emerald-600' : row.paymentStatus === 'UNPAID' ? 'text-red-500' : 'text-slate-900'}`}>
                          {(row.amount || 0).toLocaleString('uz-UZ')} UZS
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <Store className="w-4 h-4" />
                {currentRows.length} ta yozuv
              </div>
              <div className="text-sm font-black text-slate-900">
                Jami: <span className="text-indigo-600">{filteredTotal.toLocaleString('uz-UZ')} UZS</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;