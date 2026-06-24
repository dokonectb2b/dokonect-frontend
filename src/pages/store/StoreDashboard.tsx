import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import {
  Package, Clock, ArrowRight, Wallet, ShoppingCart,
  TrendingUp, AlertTriangle, LayoutGrid, Users, CreditCard, ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { uz } from 'date-fns/locale';
import { getClientDashboardFn, getClientFinanceFn } from '../../api/client.api';
import { getOrdersFn } from '../../api/order.api';

const ORDER_STATUS: Record<string, { label: string; cls: string }> = {
  NEW:        { label: 'Yangi',          cls: 'bg-amber-50 text-amber-700 border border-amber-200'    },
  ACCEPTED:   { label: 'Qabul qilindi',  cls: 'bg-blue-50 text-blue-700 border border-blue-200'      },
  REJECTED:   { label: 'Rad etildi',     cls: 'bg-red-50 text-red-700 border border-red-200'         },
  ASSIGNED:   { label: 'Tayinlandi',     cls: 'bg-purple-50 text-purple-700 border border-purple-200'},
  PICKED:     { label: 'Olib ketildi',   cls: 'bg-sky-50 text-sky-700 border border-sky-200'         },
  IN_TRANSIT: { label: "Yo'lda",         cls: 'bg-sky-50 text-sky-700 border border-sky-200'         },
  DELIVERED:  { label: 'Yetkazildi',     cls: 'bg-green-50 text-green-700 border border-green-200'   },
  RETURNED:   { label: 'Qaytarildi',     cls: 'bg-slate-100 text-slate-600 border border-slate-200'  },
  CANCELLED:  { label: 'Bekor qilindi',  cls: 'bg-red-50 text-red-700 border border-red-200'         },
};

const StoreDashboard = () => {
  const { user }  = useAuthStore();
  const navigate  = useNavigate();

  const { data: dashRes, isLoading } = useQuery({
    queryKey: ['client-dashboard'],
    queryFn: getClientDashboardFn,
    staleTime: 30_000,
  });

  const { data: financeRes } = useQuery({
    queryKey: ['client-finance'],
    queryFn: getClientFinanceFn,
    staleTime: 60_000,
  });

  const { data: ordersRes } = useQuery({
    queryKey: ['store-orders', ''],
    queryFn: () => getOrdersFn({ limit: 5 } as any),
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  const dash         = dashRes?.data || dashRes || {};
  const finance      = financeRes?.data?.summary || financeRes?.data || financeRes || {};
  const recentOrders: any[] = ordersRes?.data?.orders || ordersRes?.orders || dash.recentOrders || [];
  const activeOrder  = dash.activeOrder;

  const activeCount = recentOrders.filter((o: any) =>
    ['NEW', 'ACCEPTED', 'ASSIGNED', 'IN_TRANSIT'].includes(o.status)
  ).length;

  const kpis = [
    {
      label:   'Umumiy qarz',
      value:   (finance.totalDebt || 0).toLocaleString('uz-UZ'),
      unit:    'UZS',
      icon:    CreditCard,
      iconCls: 'bg-red-50 text-red-500',
      sub:     (finance.overdueDebt || 0) > 0
        ? `${(finance.overdueDebt).toLocaleString()} muddati o'tgan`
        : "To'lovlar o'z vaqtida",
      subCls:  (finance.overdueDebt || 0) > 0 ? 'text-red-500' : 'text-green-600',
      path:    '/store/finance',
    },
    {
      label:   'Jami xaridlar',
      value:   (finance.totalSpent || 0).toLocaleString('uz-UZ'),
      unit:    'UZS',
      icon:    TrendingUp,
      iconCls: 'bg-green-50 text-brand-green',
      sub:     'Yetkazilgan buyurtmalar',
      subCls:  'text-slate-400',
      path:    '/store/finance',
    },
    {
      label:   'Faol buyurtmalar',
      value:   String(activeCount),
      unit:    'ta',
      icon:    Package,
      iconCls: 'bg-amber-50 text-amber-500',
      sub:     `Jami ${recentOrders.length} ta buyurtma`,
      subCls:  'text-slate-400',
      path:    '/store/orders',
    },
    {
      label:   'Ochiq qarzlar',
      value:   String(finance.activeDebtsCount || 0),
      unit:    'ta',
      icon:    Wallet,
      iconCls: 'bg-blue-50 text-blue-500',
      sub:     "To'lanmagan hisob-fakturalar",
      subCls:  'text-slate-400',
      path:    '/store/finance',
    },
  ];

  const quickLinks = [
    { label: 'Katalog',     icon: LayoutGrid, path: '/store/catalog',      desc: 'Mahsulot qidiring'  },
    { label: 'Buyurtmalar', icon: Package,    path: '/store/orders',       desc: 'Barcha buyurtmalar' },
    { label: 'Moliya',      icon: Wallet,     path: '/store/finance',      desc: "Qarz va to'lovlar"  },
    { label: 'Hamkorlar',   icon: Users,      path: '/store/distributors', desc: 'Distribyutorlar'    },
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">
              {format(new Date(), "d MMMM yyyy, EEEE", { locale: uz })}
            </p>
            <h1 className="text-xl font-bold text-[#0F172A]">
              Xush kelibsiz, {user?.name}!
            </h1>
          </div>
          <button
            onClick={() => navigate('/store/catalog')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-green text-white text-sm font-semibold rounded-xl hover:bg-[#156347] transition-all duration-200 shadow-sm self-start sm:self-auto"
          >
            <ShoppingCart className="w-4 h-4" />
            Yangi xarid
          </button>
        </div>

        {/* ── KPI Cards ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              onClick={() => navigate(kpi.path)}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${kpi.iconCls}`}>
                  <kpi.icon className="w-4 h-4" />
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all duration-200" />
              </div>
              <p className="text-xs text-slate-500 mb-1">{kpi.label}</p>
              <div className="flex items-baseline gap-1 mb-1.5">
                <span className="text-xl font-bold text-[#0F172A] leading-none">{kpi.value}</span>
                <span className="text-xs text-slate-400">{kpi.unit}</span>
              </div>
              <p className={`text-xs ${kpi.subCls}`}>{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Main Grid ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-slate-400" />
                <h2 className="text-sm font-semibold text-[#0F172A]">So'nggi buyurtmalar</h2>
              </div>
              <button
                onClick={() => navigate('/store/orders')}
                className="flex items-center gap-1 text-xs font-semibold text-brand-green hover:text-[#156347] transition-colors"
              >
                Barchasi <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Package className="w-10 h-10 text-slate-200 mb-3" />
                <p className="text-sm text-slate-400 mb-4">Hozircha buyurtmalar yo'q</p>
                <button
                  onClick={() => navigate('/store/catalog')}
                  className="text-xs font-semibold text-brand-green hover:text-[#156347] hover:underline transition-colors"
                >
                  Katalogga o'tish →
                </button>
              </div>
            ) : (
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
                  {recentOrders.map((order: any, i: number) => {
                    const st = ORDER_STATUS[order.status];
                    return (
                      <tr
                        key={order.id}
                        onClick={() => navigate(`/store/orders/${order.id}`)}
                        className={`cursor-pointer hover:bg-slate-50 transition-colors duration-150 ${i < recentOrders.length - 1 ? 'border-b border-slate-100' : ''}`}
                      >
                        <td className="px-6 py-3.5">
                          <p className="text-xs font-mono font-semibold text-brand-green">
                            #{order.orderNumber ?? order.id.slice(0, 8)}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {format(new Date(order.createdAt), 'dd MMM', { locale: uz })}
                          </p>
                        </td>
                        <td className="px-6 py-3.5 hidden sm:table-cell">
                          <p className="text-sm text-[#0F172A]">{order.distributor?.companyName || '—'}</p>
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${st?.cls || 'bg-slate-50 text-slate-600 border border-slate-200'}`}>
                            {st?.label ?? order.status}
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
                </tbody>
              </table>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">

            {/* Quick Links */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-[#0F172A]">Tezkor amallar</h2>
              </div>
              <div className="p-3 grid grid-cols-2 gap-1.5">
                {quickLinks.map((link) => (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-green-50 transition-all duration-200 group text-center"
                  >
                    <div className="w-10 h-10 bg-slate-50 group-hover:bg-brand-green/10 rounded-xl flex items-center justify-center transition-colors duration-200">
                      <link.icon className="w-5 h-5 text-slate-400 group-hover:text-brand-green transition-colors duration-200" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-700 group-hover:text-brand-green transition-colors duration-200 leading-tight">
                        {link.label}
                      </p>
                      <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{link.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Order */}
            {activeOrder && (
              <div
                onClick={() => navigate(`/store/orders/${activeOrder.id}`)}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden cursor-pointer hover:border-brand-green/40 hover:shadow-md transition-all duration-200"
              >
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shrink-0" />
                  <h2 className="text-sm font-semibold text-[#0F172A]">Faol buyurtma</h2>
                </div>
                <div className="p-5">
                  <p className="text-xs font-mono font-semibold text-brand-green mb-1">
                    #{activeOrder.orderNumber}
                  </p>
                  <p className="text-sm font-medium text-[#0F172A] mb-3">
                    {activeOrder.distributor?.companyName}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-[#0F172A]">
                      {(activeOrder.totalAmount || 0).toLocaleString('uz-UZ')} UZS
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${ORDER_STATUS[activeOrder.status]?.cls || 'bg-slate-50 text-slate-600 border border-slate-200'}`}>
                      {ORDER_STATUS[activeOrder.status]?.label ?? activeOrder.status}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Overdue Warning */}
            {(finance?.overdueDebt || 0) > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <h3 className="text-sm font-semibold text-red-700">Muddati o'tgan qarz</h3>
                </div>
                <p className="text-xl font-bold text-red-700 mb-0.5">
                  {finance.overdueDebt.toLocaleString('uz-UZ')} UZS
                </p>
                <p className="text-xs text-red-400 mb-4">Imkon qadar tezroq to'lang</p>
                <button
                  onClick={() => navigate('/store/finance')}
                  className="w-full py-2.5 bg-red-600 text-white text-xs font-semibold rounded-xl hover:bg-red-700 transition-colors duration-200"
                >
                  To'lovni amalga oshirish
                </button>
              </div>
            )}

            {/* Catalog CTA */}
            <div className="bg-brand-green rounded-2xl p-5 text-white">
              <p className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mb-1">
                Yangi mahsulotlar
              </p>
              <h3 className="text-base font-bold mb-2">Katalogni ko'ring</h3>
              <p className="text-xs text-white/60 leading-relaxed mb-4">
                Hamkorlardan yangi mahsulotlar mavjud. Ko'rib chiqing.
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

export default StoreDashboard;
