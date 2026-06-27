import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrderByIdFn, updateOrderStatusFn } from '../../api/order.api';
import { getClientOrderTrackingFn } from '../../api/client.api';
import toast from 'react-hot-toast';

const PRIMARY = '#22C55E';

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string; emoji: string }> = {
  NEW:        { label: 'Yangi',       color: '#3390F8', bg: '#EFF6FF', emoji: '🆕' },
  ACCEPTED:   { label: 'Qabul',       color: '#22C55E', bg: '#F0FDF4', emoji: '✅' },
  ASSIGNED:   { label: 'Tayinlangan', color: '#F59E0B', bg: '#FFFBEB', emoji: '👤' },
  PICKED:     { label: 'Olindi',      color: '#8B5CF6', bg: '#F5F3FF', emoji: '📦' },
  IN_TRANSIT: { label: "Yo'lda",      color: '#F59E0B', bg: '#FFFBEB', emoji: '🚚' },
  DELIVERED:  { label: 'Yetkazildi',  color: '#22C55E', bg: '#F0FDF4', emoji: '🎉' },
  RETURNED:   { label: 'Qaytarildi',  color: '#EF4444', bg: '#FEF2F2', emoji: '↩️' },
  CANCELLED:  { label: 'Bekor',       color: '#EF4444', bg: '#FEF2F2', emoji: '❌' },
  PAID:       { label: "To'landi",    color: '#22C55E', bg: '#F0FDF4', emoji: '💰' },
};

const STATUS_TIMELINE = ['NEW', 'ACCEPTED', 'ASSIGNED', 'PICKED', 'IN_TRANSIT', 'DELIVERED'];

function fmt(n: number) { return new Intl.NumberFormat('uz-UZ').format(Math.round(n)) + " so'm"; }
function fmtDate(d: string) {
  return new Date(d).toLocaleString('uz-UZ', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function TgStoreOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: orderData, isLoading } = useQuery({
    queryKey: ['tg-order-detail', id],
    queryFn:  () => getOrderByIdFn(id!),
    select:   (r) => r.data ?? r,
    enabled:  !!id,
  });

  const { data: tracking } = useQuery({
    queryKey: ['tg-order-tracking', id],
    queryFn:  () => getClientOrderTrackingFn(id!),
    select:   (r) => r.data ?? r,
    enabled:  !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: () => updateOrderStatusFn({ id: id!, data: { status: 'CANCELLED' } }),
    onSuccess: () => {
      toast.success('Buyurtma bekor qilindi');
      qc.invalidateQueries({ queryKey: ['tg-order-detail', id] });
      qc.invalidateQueries({ queryKey: ['tg-orders'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Xatolik'),
  });

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const order = orderData;
  if (!order) return null;

  const s    = STATUS_LABEL[order.status] ?? { label: order.status, color: '#637381', bg: '#F9FAFB', emoji: '❓' };
  const idx  = STATUS_TIMELINE.indexOf(order.status);
  const canCancel = ['NEW'].includes(order.status);

  return (
    <div>
      {/* Header */}
      <div className="px-4 pt-10 pb-5 text-white" style={{ background: `linear-gradient(135deg, ${PRIMARY}, #16A34A)` }}>
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm opacity-80 mb-3">
          ← Orqaga
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Buyurtma #{order.orderNumber}</h1>
            <p className="text-xs opacity-70 mt-0.5">
              {order.createdAt ? fmtDate(order.createdAt) : ''}
            </p>
          </div>
          <span className="text-sm font-bold px-3 py-1.5 rounded-xl"
            style={{ color: s.color, background: 'rgba(255,255,255,0.9)' }}>
            {s.emoji} {s.label}
          </span>
        </div>
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">

        {/* Status timeline */}
        {!['CANCELLED','RETURNED'].includes(order.status) && (
          <div className="bg-white rounded-2xl p-4">
            <h3 className="font-bold text-gray-900 text-sm mb-4">Buyurtma holati</h3>
            <div className="flex items-center justify-between">
              {STATUS_TIMELINE.map((st, i) => {
                const done    = i <= idx;
                const current = i === idx;
                const stInfo  = STATUS_LABEL[st];
                return (
                  <div key={st} className="flex-1 flex flex-col items-center gap-1 relative">
                    {i < STATUS_TIMELINE.length - 1 && (
                      <div className={`absolute top-3 left-1/2 w-full h-0.5 ${done ? 'bg-green-400' : 'bg-gray-100'}`} />
                    )}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs z-10 ${
                      current ? 'bg-green-500 text-white ring-4 ring-green-100' :
                      done    ? 'bg-green-400 text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {done ? '✓' : i + 1}
                    </div>
                    <p className={`text-[9px] text-center leading-tight ${done ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>
                      {stInfo?.label ?? st}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Distributor info */}
        {order.distributor && (
          <div className="bg-white rounded-2xl p-4">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Distribyutor</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-lg">🏢</div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{order.distributor.companyName}</p>
                {order.distributor.phone && (
                  <p className="text-xs text-gray-500">{order.distributor.phone}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Driver info */}
        {order.driver && (
          <div className="bg-white rounded-2xl p-4">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Kuryer</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-lg">🚗</div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{order.driver.name}</p>
                {order.driver.phone && (
                  <p className="text-xs text-gray-500">{order.driver.phone}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Items */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-bold text-gray-900 text-sm mb-3">
            Mahsulotlar ({order.items?.length ?? 0})
          </h3>
          <div className="flex flex-col gap-3">
            {(order.items ?? []).map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                  {item.product?.images?.[0]?.url
                    ? <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover rounded-xl" />
                    : <span className="text-lg">📦</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 line-clamp-1">
                    {item.product?.name ?? 'Mahsulot'}
                  </p>
                  <p className="text-xs text-gray-500">{item.quantity} × {fmt(item.price)}</p>
                </div>
                <p className="font-bold text-sm text-gray-900 shrink-0">{fmt(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment summary */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-bold text-gray-900 text-sm mb-3">To'lov</h3>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Mahsulotlar</span>
              <span className="text-sm text-gray-900">{fmt(order.subtotal ?? order.totalAmount)}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Yetkazib berish</span>
                <span className="text-sm text-gray-900">{fmt(order.deliveryFee)}</span>
              </div>
            )}
            {order.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Chegirma</span>
                <span className="text-sm text-red-500">−{fmt(order.discount)}</span>
              </div>
            )}
            <div className="border-t border-gray-100 pt-2 mt-1 flex justify-between">
              <span className="font-bold text-gray-900 text-sm">Jami</span>
              <span className="font-bold text-sm" style={{ color: PRIMARY }}>{fmt(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">To'lov turi</span>
              <span className="text-xs text-gray-600 font-medium">{order.paymentMethod ?? '—'}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="bg-white rounded-2xl p-4">
            <h3 className="font-bold text-gray-900 text-sm mb-2">Izoh</h3>
            <p className="text-sm text-gray-600">{order.notes}</p>
          </div>
        )}

        {/* Cancel button */}
        {canCancel && (
          <button
            onClick={() => { if (confirm('Buyurtmani bekor qilishni xohlaysizmi?')) cancelMutation.mutate(); }}
            disabled={cancelMutation.isPending}
            className="w-full py-3.5 rounded-2xl text-red-600 font-semibold text-sm bg-red-50 disabled:opacity-60">
            {cancelMutation.isPending ? 'Bekor qilinmoqda...' : '❌ Buyurtmani bekor qilish'}
          </button>
        )}
      </div>
      <div className="h-4" />
    </div>
  );
}
