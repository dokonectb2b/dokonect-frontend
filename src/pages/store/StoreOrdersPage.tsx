import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { format } from 'date-fns';
import { uz } from 'date-fns/locale';
import {
  Package, Clock, Truck, ChevronLeft, ChevronRight,
  PackageCheck, ChevronRight as ChevronRightIcon,
} from 'lucide-react';

const STATUS_MAP: Record<string, { label: string; cls: string; dot: string }> = {
  NEW:        { label: 'Yangi',          cls: 'bg-amber-50 text-amber-700 border border-amber-200',    dot: 'bg-amber-400'  },
  ACCEPTED:   { label: 'Qabul qilindi',  cls: 'bg-blue-50 text-blue-700 border border-blue-200',      dot: 'bg-blue-400'   },
  REJECTED:   { label: 'Rad etildi',     cls: 'bg-red-50 text-red-700 border border-red-200',         dot: 'bg-red-400'    },
  ASSIGNED:   { label: 'Tayinlandi',     cls: 'bg-purple-50 text-purple-700 border border-purple-200',dot: 'bg-purple-400' },
  PICKED:     { label: 'Olib ketildi',   cls: 'bg-sky-50 text-sky-700 border border-sky-200',         dot: 'bg-sky-400'    },
  IN_TRANSIT: { label: "Yo'lda",         cls: 'bg-sky-50 text-sky-700 border border-sky-200',         dot: 'bg-sky-400'    },
  DELIVERED:  { label: 'Yetkazildi',     cls: 'bg-green-50 text-green-700 border border-green-200',   dot: 'bg-green-500'  },
  RETURNED:   { label: 'Qaytarildi',     cls: 'bg-slate-100 text-slate-600 border border-slate-200',  dot: 'bg-slate-400'  },
  CANCELLED:  { label: 'Bekor qilindi',  cls: 'bg-red-50 text-red-700 border border-red-200',         dot: 'bg-red-400'    },
};

const STATUS_ICON: Record<string, typeof Package> = {
  NEW:        Clock,
  ACCEPTED:   Package,
  IN_TRANSIT: Truck,
  DELIVERED:  PackageCheck,
};

const StoreOrdersPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data: ordersResponse, isLoading } = useQuery({
    queryKey: ['store-orders', page],
    queryFn: async () => {
      const response = await api.get('/api/orders', { params: { page, limit: 20 } });
      return response.data;
    },
    staleTime: 30_000,
  });

  const orders     = ordersResponse?.data || (Array.isArray(ordersResponse) ? ordersResponse : []);
  const totalPages = ordersResponse?.pagination?.totalPages ?? 1;

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

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#0F172A]">Buyurtmalarim</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {orders.length > 0 ? `${orders.length} ta buyurtma` : 'Hozircha buyurtmalar yo\'q'}
            </p>
          </div>
          <button
            onClick={() => navigate('/store/catalog')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-green text-white text-sm font-semibold rounded-xl hover:bg-[#156347] transition-colors duration-200 self-start sm:self-auto"
          >
            <Package className="w-4 h-4" />
            Yangi buyurtma
          </button>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-20">
            <PackageCheck className="w-12 h-12 text-slate-200 mb-4" />
            <p className="text-sm font-semibold text-slate-600 mb-1">Buyurtmalar yo'q</p>
            <p className="text-xs text-slate-400 mb-6">Katalogdan mahsulot tanlab birinchi buyurtmani bering</p>
            <button
              onClick={() => navigate('/store/catalog')}
              className="px-4 py-2 bg-brand-green text-white text-xs font-semibold rounded-xl hover:bg-[#156347] transition-colors duration-200"
            >
              Katalogga o'tish
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order: any) => {
              const st       = STATUS_MAP[order.status] || { label: order.status, cls: 'bg-slate-50 text-slate-600 border border-slate-200', dot: 'bg-slate-400' };
              const Icon     = STATUS_ICON[order.status] || Package;

              return (
                <div
                  key={order.id}
                  onClick={() => navigate(`/store/orders/${order.id}`)}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer group overflow-hidden"
                >
                  <div className="flex items-center gap-4 px-5 py-4">
                    {/* Icon */}
                    <div className="w-10 h-10 bg-slate-50 group-hover:bg-green-50 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200">
                      <Icon className="w-5 h-5 text-slate-400 group-hover:text-brand-green transition-colors duration-200" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-mono font-semibold text-brand-green">
                          #{order.orderNumber ?? order.id.slice(0, 8)}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${st.cls}`}>
                          {st.label}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-[#0F172A] truncate">
                        {order.distributor?.companyName}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {format(new Date(order.createdAt), "dd MMMM, yyyy · HH:mm", { locale: uz })}
                      </p>
                    </div>

                    {/* Amount + Arrow */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#0F172A]">
                          {(order.totalAmount || 0).toLocaleString('uz-UZ')}
                        </p>
                        <p className="text-xs text-slate-400">UZS</p>
                      </div>
                      <ChevronRightIcon className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all duration-200" />
                    </div>
                  </div>

                  {/* Items preview */}
                  {order.items?.length > 0 && (
                    <div className="px-5 pb-3.5 flex items-center gap-2 border-t border-slate-100 pt-3">
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider shrink-0">
                        {order.items.length} ta mahsulot:
                      </span>
                      <div className="flex flex-wrap gap-1.5 min-w-0">
                        {order.items.slice(0, 3).map((item: any) => (
                          <span
                            key={item.id}
                            className="text-xs text-slate-600 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md truncate max-w-30"
                          >
                            {item.product?.name || 'Mahsulot'}
                          </span>
                        ))}
                        {order.items.length > 3 && (
                          <span className="text-xs text-slate-400 px-1">
                            +{order.items.length - 3} ta
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-500 hover:text-slate-800 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronLeft className="w-4 h-4" /> Oldingi
            </button>
            <span className="text-sm text-slate-500 px-2">
              <span className="font-semibold text-[#0F172A]">{page}</span> / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-500 hover:text-slate-800 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              Keyingi <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreOrdersPage;
