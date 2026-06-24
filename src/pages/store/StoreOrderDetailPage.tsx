import { useParams, useNavigate } from 'react-router-dom';
import { SafeImage } from '../../components/ui/SafeImage';
import { useQuery } from '@tanstack/react-query';
import { getOrderByIdFn } from '../../api/order.api';
import { ArrowLeft, Package, MapPin, Truck, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { uz } from 'date-fns/locale';

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  NEW:        { label: 'Yangi',          cls: 'bg-amber-50 text-amber-700 border border-amber-200'    },
  ACCEPTED:   { label: 'Qabul qilindi',  cls: 'bg-blue-50 text-blue-700 border border-blue-200'      },
  REJECTED:   { label: 'Rad etildi',     cls: 'bg-red-50 text-red-700 border border-red-200'         },
  ASSIGNED:   { label: 'Tayinlandi',     cls: 'bg-purple-50 text-purple-700 border border-purple-200'},
  PICKED:     { label: 'Olib ketildi',   cls: 'bg-sky-50 text-sky-700 border border-sky-200'         },
  IN_TRANSIT: { label: "Yo'lda",         cls: 'bg-sky-50 text-sky-700 border border-sky-200'         },
  DELIVERED:  { label: 'Yetkazildi',     cls: 'bg-green-50 text-green-700 border border-green-200'   },
  RETURNED:   { label: 'Qaytarildi',     cls: 'bg-slate-100 text-slate-600 border border-slate-200'  },
  CANCELLED:  { label: 'Bekor qilindi',  cls: 'bg-red-50 text-red-700 border border-red-200'         },
  PAID:       { label: "To'landi",       cls: 'bg-green-50 text-green-700 border border-green-200'   },
};

const StoreOrderDetailPage = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: resp, isLoading } = useQuery({
    queryKey: ['store-order-detail', id],
    queryFn: () => getOrderByIdFn(id!),
    enabled: !!id,
  });

  const order = resp?.data || resp;

  if (isLoading) {
    return (
      <div className="bg-[#F8FAFC] min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
          <div className="h-10 w-40 bg-white animate-pulse rounded-xl border border-slate-200" />
          <div className="h-36 bg-white animate-pulse rounded-2xl border border-slate-200" />
          <div className="h-64 bg-white animate-pulse rounded-2xl border border-slate-200" />
          <div className="h-28 bg-white animate-pulse rounded-2xl border border-slate-200" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-[#F8FAFC] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <XCircle className="w-10 h-10 text-slate-300" />
          <p className="text-sm font-semibold text-slate-600">Buyurtma topilmadi</p>
          <button
            onClick={() => navigate('/store/orders')}
            className="text-sm font-semibold text-brand-green hover:text-[#156347] transition-colors"
          >
            ← Orqaga qaytish
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = STATUS_MAP[order.status] || { label: order.status, cls: 'bg-slate-50 text-slate-600 border border-slate-200' };
  const address = typeof order.deliveryAddress === 'object'
    ? order.deliveryAddress?.address || order.deliveryAddress?.street || JSON.stringify(order.deliveryAddress)
    : order.deliveryAddress || '—';

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/store/orders')}
            className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
          <div>
            <p className="text-xs font-mono font-semibold text-brand-green uppercase">
              #{order.orderNumber ?? order.id?.slice(0, 8)}
            </p>
            <h1 className="text-lg font-bold text-[#0F172A]">Buyurtma tafsiloti</h1>
          </div>
          <div className="ml-auto">
            <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold ${statusInfo.cls}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Distributor + Meta */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3.5">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-green-50 rounded-xl shrink-0">
              <Truck className="w-4 h-4 text-brand-green" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Distribyutor</p>
              <p className="text-sm font-bold text-[#0F172A]">{order.distributor?.companyName || '—'}</p>
              {order.distributor?.phone && (
                <p className="text-xs text-slate-500 mt-0.5">{order.distributor.phone}</p>
              )}
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-slate-50 rounded-xl shrink-0">
              <Clock className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Sana</p>
              <p className="text-sm font-semibold text-[#0F172A]">
                {order.createdAt
                  ? format(new Date(order.createdAt), 'dd MMMM yyyy, HH:mm', { locale: uz })
                  : '—'}
              </p>
            </div>
          </div>

          {address && address !== '—' && (
            <>
              <div className="h-px bg-slate-100" />
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 bg-slate-50 rounded-xl shrink-0">
                  <MapPin className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Manzil</p>
                  <p className="text-sm font-semibold text-[#0F172A]">{address}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-[#0F172A]">Mahsulotlar</h2>
            </div>
            <span className="text-xs text-slate-400">{order.items?.length || 0} ta</span>
          </div>
          <div className="divide-y divide-slate-100">
            {(order.items || []).map((item: any) => {
              const img = item.product?.images?.[0]?.url || item.product?.images?.[0];
              return (
                <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                    {img ? (
                      <SafeImage
                        src={img}
                        alt={item.product?.name}
                        fallback="product"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0F172A] truncate">
                      {item.product?.name || 'Mahsulot'}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.quantity} × {(item.unitPrice || item.price || 0).toLocaleString('uz-UZ')} UZS
                    </p>
                  </div>
                  <p className="text-sm font-bold text-[#0F172A] shrink-0">
                    {((item.quantity || 1) * (item.unitPrice || item.price || 0)).toLocaleString('uz-UZ')} UZS
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Total */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <DollarSign className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-[#0F172A]">Hisob</h2>
          </div>
          <div className="space-y-2">
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-sm text-slate-600">
                <span>Yetkazib berish</span>
                <span>{(order.deliveryFee || 0).toLocaleString('uz-UZ')} UZS</span>
              </div>
            )}
            {order.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Chegirma</span>
                <span>−{(order.discount || 0).toLocaleString('uz-UZ')} UZS</span>
              </div>
            )}
            <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-2">
              <span className="text-sm font-bold text-[#0F172A]">Jami</span>
              <span className="text-xl font-bold text-[#0F172A]">
                {(order.totalAmount || 0).toLocaleString('uz-UZ')} UZS
              </span>
            </div>
            {order.paymentMethod && (
              <p className="text-xs text-slate-400 text-right">
                {order.paymentMethod === 'CASH' ? 'Naqd pul'
                  : order.paymentMethod === 'CARD' ? 'Karta'
                  : "Bank o'tkazma"}
              </p>
            )}
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Izoh</p>
            <p className="text-sm text-slate-700">{order.notes}</p>
          </div>
        )}

        {/* Driver */}
        {order.driver && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
            <div className="p-2.5 bg-blue-50 rounded-xl shrink-0">
              <Truck className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Haydovchi</p>
              <p className="text-sm font-bold text-[#0F172A]">{order.driver?.user?.name || '—'}</p>
              {order.driver?.user?.phone && (
                <p className="text-xs text-slate-500 mt-0.5">{order.driver.user.phone}</p>
              )}
            </div>
            <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreOrderDetailPage;
