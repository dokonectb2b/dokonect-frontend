import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Phone } from 'lucide-react';

import { getDriverOrderFn } from '../../api/driver.api';

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  ASSIGNED:   { label: 'Tayinlangan', color: 'text-amber-400' },
  PICKED:     { label: 'Olindi',      color: 'text-violet-400' },
  IN_TRANSIT: { label: "Yo'lda",      color: 'text-amber-400' },
  DELIVERED:  { label: 'Yetkazildi',  color: 'text-green-400' },
  RETURNED:   { label: 'Qaytarildi',  color: 'text-red-400' },
  CANCELLED:  { label: 'Bekor',       color: 'text-red-400' },
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  CASH: 'Naqt', CARD: 'Karta', BANK_TRANSFER: "Bank o'tkazma", CREDIT: 'Kredit',
};

export default function TgDriverOrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate     = useNavigate();

  const { data: orderRes, isLoading } = useQuery({
    queryKey: ['tg-driver-delivery', orderId],
    queryFn: () => getDriverOrderFn(orderId!),
    enabled: !!orderId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500" />
      </div>
    );
  }

  const order = orderRes?.data || orderRes;
  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Buyurtma topilmadi</p>
          <button onClick={() => navigate('/driver/tg/orders')} className="text-sky-400 hover:underline">Orqaga</button>
        </div>
      </div>
    );
  }

  const deliveryAddr = typeof order.deliveryAddress === 'object'
    ? order.deliveryAddress?.street || order.deliveryAddress?.address || ''
    : order.deliveryAddress || '';

  const handleCallClient = () => {
    const phone = order.client?.user?.phone;
    if (phone) window.location.href = `tel:${phone}`;
  };

  const s = STATUS_LABEL[order.status] ?? { label: order.status, color: 'text-slate-400' };
  const delivery = order.delivery;
  const needsPayment = order.status === 'DELIVERED' && order.paymentStatus !== 'PAID';

  return (
    <div className="text-white p-4 pt-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-tight">Buyurtma #{order.orderNumber}</h1>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full bg-white/5 ${s.color}`}>{s.label}</span>
      </div>

      {/* Customer info */}
      <div className="tg-glass rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-slate-400 text-xs">Mijoz</p>
            <p className="text-lg font-bold">{order.client?.user?.name}</p>
          </div>
          <button onClick={handleCallClient} className="p-3 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl shadow-lg shadow-emerald-500/25 active:scale-95 transition-transform">
            <Phone className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
          <p className="text-slate-300">{deliveryAddr}</p>
        </div>
      </div>

      {/* Items */}
      <div className="tg-glass rounded-2xl p-4">
        <p className="text-slate-400 text-xs mb-3">Mahsulotlar</p>
        <div className="space-y-2">
          {(order.items || []).map((item: any, i: number) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-slate-300">{item.quantity}x {item.product?.name}</span>
              <span className="text-slate-400">{((item.quantity || 0) * (item.unitPrice || 0)).toLocaleString('uz-UZ')} so'm</span>
            </div>
          ))}
        </div>
        <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between font-bold text-sm">
          <span>Jami</span>
          <span>{(order.totalAmount || 0).toLocaleString('uz-UZ')} so'm</span>
        </div>
      </div>

      {/* Delivery proof */}
      {delivery && (delivery.photoProof || delivery.signature || delivery.problemReport) && (
        <div className="bg-slate-800 rounded-xl p-4 space-y-3">
          <p className="text-slate-400 text-xs">Yetkazish ma'lumotlari</p>
          {(delivery.photoProof || delivery.signature) && (
            <div className="flex gap-3">
              {delivery.photoProof && (
                <img src={delivery.photoProof} alt="Yetkazish isboti" className="w-24 h-24 object-cover rounded-lg" />
              )}
              {delivery.signature && (
                <img src={delivery.signature} alt="Imzo" className="w-24 h-24 object-contain rounded-lg bg-white" />
              )}
            </div>
          )}
          {delivery.problemReport && (
            <div className="bg-rose-500/10 text-rose-400 text-sm rounded-xl p-3">{delivery.problemReport}</div>
          )}
        </div>
      )}

      {/* Payment info */}
      {order.status === 'DELIVERED' && (
        <div className="tg-glass rounded-2xl p-4">
          <p className="text-slate-400 text-xs mb-2">To'lov</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-300">
              {order.paymentMethod ? PAYMENT_METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod : "Hali to'lanmagan"}
            </span>
            <span className={`font-semibold ${order.paymentStatus === 'PAID' ? 'text-green-400' : 'text-amber-400'}`}>
              {order.paymentStatus === 'PAID' ? "To'landi" : order.paymentStatus === 'PARTIAL' ? 'Qisman' : "To'lanmagan"}
            </span>
          </div>
        </div>
      )}

      {needsPayment && (
        <button
          onClick={() => navigate(`/driver/tg/orders/${orderId}/payment`)}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-green-500 text-emerald-950 font-bold text-sm shadow-lg shadow-emerald-900/30 active:scale-[0.98] transition-all"
        >
          To'lovni qabul qilish
        </button>
      )}
    </div>
  );
}
