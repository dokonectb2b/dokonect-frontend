import { motion } from 'framer-motion';
import { MapPin, Phone, Navigation, Check, Package, Truck, CheckCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { updateDriverOrderStatusFn } from '../../api/driver.api';
import api from '../../api/api';

type Step = 'PICKED' | 'IN_TRANSIT' | 'DELIVERED';

const STEPS: Array<{ key: Step; label: string; icon: any }> = [
  { key: 'PICKED',     label: 'Olib ketildi', icon: Package },
  { key: 'IN_TRANSIT', label: "Yo'lda",       icon: Truck },
  { key: 'DELIVERED',  label: 'Yetkazildi',   icon: CheckCircle },
];

export default function TgDriverDelivery() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate     = useNavigate();
  const queryClient  = useQueryClient();

  const { data: orderRes, isLoading } = useQuery({
    queryKey: ['tg-driver-delivery', orderId],
    queryFn: () => api.get(`/api/driver/orders/${orderId}`).then(r => r.data),
    enabled: !!orderId,
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: (status: Step) => updateDriverOrderStatusFn({ orderId: orderId!, status }),
    onSuccess: (_, status) => {
      queryClient.invalidateQueries({ queryKey: ['tg-driver-delivery', orderId] });
      queryClient.invalidateQueries({ queryKey: ['tg-driver-home'] });
      toast.success('Holat yangilandi');
      if (status === 'DELIVERED') {
        toast.success('Yetkazish yakunlandi! 🎉');
        setTimeout(() => navigate('/driver/tg', { replace: true }), 2000);
      }
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Xatolik'),
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
          <button onClick={() => navigate('/driver/tg')} className="text-sky-400 hover:underline">Orqaga</button>
        </div>
      </div>
    );
  }

  const deliveryAddr = typeof order.deliveryAddress === 'object'
    ? order.deliveryAddress?.street || order.deliveryAddress?.address || ''
    : order.deliveryAddress || '';

  const handleNavigate = () =>
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(deliveryAddr)}`);

  const handleCallClient = () => {
    const phone = order.client?.user?.phone;
    if (phone) window.location.href = `tel:${phone}`;
  };

  const currentIndex = STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="text-white p-4 space-y-4">
      {/* Customer info */}
      <div className="bg-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-slate-400 text-xs">Mijoz</p>
            <p className="text-lg font-bold">{order.client?.user?.name}</p>
          </div>
          <button onClick={handleCallClient} className="p-3 bg-green-500 rounded-full">
            <Phone className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
          <p className="text-slate-300">{deliveryAddr}</p>
        </div>
        <button onClick={handleNavigate}
          className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 bg-sky-500/20 text-sky-400 rounded-xl text-sm font-semibold">
          <Navigation className="w-4 h-4" /> Xaritada ochish
        </button>
      </div>

      {/* Items */}
      <div className="bg-slate-800 rounded-xl p-4">
        <p className="text-slate-400 text-xs mb-3">Mahsulotlar</p>
        <div className="space-y-2">
          {(order.items || []).map((item: any, i: number) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-slate-300">{item.quantity}x {item.product?.name}</span>
              <span className="text-slate-400">{((item.quantity || 0) * (item.unitPrice || 0)).toLocaleString('uz-UZ')} so'm</span>
            </div>
          ))}
        </div>
        <div className="pt-3 mt-3 border-t border-slate-700 flex items-center justify-between font-bold text-sm">
          <span>Jami</span>
          <span>{(order.totalAmount || 0).toLocaleString('uz-UZ')} so'm</span>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {STEPS.map((step, index) => {
          const Icon        = step.icon;
          const isCompleted = index < currentIndex;
          const isCurrent   = index === currentIndex;
          const isDisabled  = index > currentIndex + 1 || index <= currentIndex - 1;

          return (
            <motion.button
              key={step.key}
              whileTap={!isDisabled ? { scale: 0.98 } : {}}
              onClick={() => !isDisabled && !isCompleted && updateStatus(step.key)}
              disabled={isDisabled || isCompleted}
              className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                isCompleted ? 'bg-green-500 text-white'
                : isCurrent ? 'bg-sky-500 text-white shadow-lg'
                : 'bg-slate-800 text-slate-500'
              }`}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20">
                {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold">{step.label}</p>
                {isCurrent && <p className="text-xs opacity-80">Bosing va tasdiqlang</p>}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
