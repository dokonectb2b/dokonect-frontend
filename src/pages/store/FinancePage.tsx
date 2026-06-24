import { useQuery } from '@tanstack/react-query';
import {
  Wallet, TrendingUp, AlertTriangle, History,
  CreditCard, Clock, ArrowUpRight, CheckCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { uz } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { getClientFinanceFn } from '../../api/client.api';
import { getOrdersFn } from '../../api/order.api';

const ORDER_STATUS: Record<string, { label: string; cls: string }> = {
  NEW:        { label: 'Yangi',          cls: 'bg-amber-50 text-amber-700 border border-amber-200'  },
  ACCEPTED:   { label: 'Qabul qilindi',  cls: 'bg-blue-50 text-blue-700 border border-blue-200'    },
  REJECTED:   { label: 'Rad etildi',     cls: 'bg-red-50 text-red-700 border border-red-200'       },
  ASSIGNED:   { label: 'Tayinlandi',     cls: 'bg-purple-50 text-purple-700 border border-purple-200'},
  PICKED:     { label: 'Olib ketildi',   cls: 'bg-sky-50 text-sky-700 border border-sky-200'       },
  IN_TRANSIT: { label: "Yo'lda",         cls: 'bg-sky-50 text-sky-700 border border-sky-200'       },
  DELIVERED:  { label: 'Yetkazildi',     cls: 'bg-green-50 text-green-700 border border-green-200' },
  RETURNED:   { label: 'Qaytarildi',     cls: 'bg-slate-100 text-slate-600 border border-slate-200'},
  CANCELLED:  { label: 'Bekor qilindi',  cls: 'bg-red-50 text-red-700 border border-red-200'       },
};

const FinancePage = () => {
  const navigate = useNavigate();

  const { data: financeRes } = useQuery({
    queryKey: ['client-finance'],
    queryFn: getClientFinanceFn,
    staleTime: 60_000,
  });

  const { data: ordersRes, isLoading: isOrdersLoading } = useQuery({
    queryKey: ['store-orders', ''],
    queryFn: () => getOrdersFn({ limit: 20 } as any),
    staleTime: 30_000,
  });

  const summary = financeRes?.data?.summary || financeRes?.data || financeRes || {};
  const orders: any[]  = ordersRes?.data?.orders || ordersRes?.orders || [];

  const isOverdue = (summary.overdueDebt || 0) > 0;

  const kpis = [
    {
      label:   'Umumiy qarz',
      value:   (summary.totalDebt || 0).toLocaleString('uz-UZ'),
      unit:    'UZS',
      icon:    Wallet,
      iconCls: 'bg-red-50 text-red-500',
      sub:     `${summary.activeDebtsCount || 0} ta ochiq hisob`,
      subCls:  'text-slate-400',
    },
    {
      label:   "Muddati o'tgan",
      value:   (summary.overdueDebt || 0).toLocaleString('uz-UZ'),
      unit:    'UZS',
      icon:    AlertTriangle,
      iconCls: isOverdue ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600',
      sub:     isOverdue ? "Tezroq to'lang!" : "Hammasi o'z vaqtida",
      subCls:  isOverdue ? 'text-red-500' : 'text-green-600',
    },
    {
      label:   'Jami xaridlar',
      value:   (summary.totalSpent || 0).toLocaleString('uz-UZ'),
      unit:    'UZS',
      icon:    TrendingUp,
      iconCls: 'bg-green-50 text-brand-green',
      sub:     'Yetkazilgan buyurtmalar',
      subCls:  'text-slate-400',
    },
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#0F172A]">Moliya va Hisob-kitob</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              To'lovlar tarixi, qarzdorlik va moliyaviy holat
            </p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-green text-white text-sm font-semibold rounded-xl hover:bg-[#156347] transition-colors duration-200 self-start sm:self-auto">
            <ArrowUpRight className="w-4 h-4" />
            To'lov kiritish
          </button>
        </div>

        {/* ── KPI Cards ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2.5 rounded-xl ${kpi.iconCls}`}>
                  <kpi.icon className="w-4 h-4" />
                </div>
                <p className="text-sm text-slate-500">{kpi.label}</p>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-2xl font-bold text-[#0F172A]">{kpi.value}</span>
                <span className="text-xs text-slate-400">{kpi.unit}</span>
              </div>
              <p className={`text-xs ${kpi.subCls}`}>{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Main Grid ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Orders Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100">
              <History className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-[#0F172A]">Xaridlar tarixi</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-xs text-slate-500 font-medium">
                    <th className="px-6 py-3 text-left">Buyurtma</th>
                    <th className="px-6 py-3 text-left hidden sm:table-cell">Distribyutor</th>
                    <th className="px-6 py-3 text-center">Status</th>
                    <th className="px-6 py-3 text-right">Summa</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order: any, i: number) => {
                    const st = ORDER_STATUS[order.status] || {
                      label: order.status,
                      cls:   'bg-slate-50 text-slate-600 border border-slate-200',
                    };
                    return (
                      <tr
                        key={order.id}
                        onClick={() => navigate(`/store/orders/${order.id}`)}
                        className={`cursor-pointer hover:bg-slate-50 transition-colors duration-150 ${i < orders.length - 1 ? 'border-b border-slate-100' : ''}`}
                      >
                        <td className="px-6 py-3.5">
                          <p className="text-xs font-mono font-semibold text-brand-green">
                            ORD-{order.orderNumber}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {format(new Date(order.createdAt), 'dd MMM yyyy', { locale: uz })}
                          </p>
                        </td>
                        <td className="px-6 py-3.5 hidden sm:table-cell">
                          <p className="text-sm text-[#0F172A]">{order.distributor?.companyName}</p>
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${st.cls}`}>
                            {st.label}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <p className="text-sm font-semibold text-[#0F172A]">
                            {(order.totalAmount || 0).toLocaleString('uz-UZ')}
                          </p>
                          <p className="text-xs text-slate-400">UZS</p>
                        </td>
                      </tr>
                    );
                  })}
                  {!isOrdersLoading && orders.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-16 text-center text-sm text-slate-400">
                        Hech qanday amaliyot topilmadi
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">

            {/* Debt Status Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
                <CreditCard className="w-4 h-4 text-slate-400" />
                <h2 className="text-sm font-semibold text-[#0F172A]">Qarz holati</h2>
              </div>
              <div className="p-5 space-y-0 divide-y divide-slate-100">
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">Faol qarzlar</span>
                  </div>
                  <span className="text-sm font-bold text-[#0F172A]">
                    {summary.activeDebtsCount ?? 0} ta
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">Muddati o'tgan</span>
                  </div>
                  {isOverdue ? (
                    <span className="text-sm font-bold text-red-600">
                      {summary.overdueDebt.toLocaleString('uz-UZ')} UZS
                    </span>
                  ) : (
                    <div className="flex items-center gap-1.5 text-green-600">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span className="text-sm font-semibold">Yo'q</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2.5">
                    <TrendingUp className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">Jami xarid</span>
                  </div>
                  <span className="text-sm font-bold text-[#0F172A]">
                    {(summary.totalSpent || 0).toLocaleString('uz-UZ')} UZS
                  </span>
                </div>
              </div>
            </div>

            {/* Overdue Warning */}
            {isOverdue && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <h3 className="text-sm font-semibold text-red-700">Diqqat!</h3>
                </div>
                <p className="text-xl font-bold text-red-700 mb-0.5">
                  {summary.overdueDebt.toLocaleString('uz-UZ')} UZS
                </p>
                <p className="text-xs text-red-400 leading-relaxed mb-4">
                  Ushbu miqdordagi qarzdorlik muddati o'tgan.
                </p>
                <button className="w-full py-2.5 bg-red-600 text-white text-xs font-semibold rounded-xl hover:bg-red-700 transition-colors duration-200">
                  To'lovni amalga oshirish
                </button>
              </div>
            )}

            {/* CTA */}
            <div className="bg-brand-green rounded-2xl p-5 text-white">
              <p className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mb-1">
                Tavsiya
              </p>
              <h3 className="text-base font-bold mb-2">Bulk xarid qiling</h3>
              <p className="text-xs text-white/60 leading-relaxed mb-4">
                Ulgurji buyurtma bilan kredit limitingizni samarali ishlating.
              </p>
              <button
                onClick={() => navigate('/store/catalog')}
                className="w-full py-2.5 bg-white text-brand-green text-xs font-bold rounded-xl hover:bg-green-50 transition-colors duration-200"
              >
                Katalogga o'tish →
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancePage;
