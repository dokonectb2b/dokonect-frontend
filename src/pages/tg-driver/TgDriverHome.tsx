import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, DollarSign, Navigation } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import {
  getDriverDashboardFn,
  updateDriverStatusFn,
  updateDriverLocationFn,
  acceptDriverOrderFn,
  updateDriverOrderStatusFn,
} from '../../api/driver.api';
import { DriverStatusToggle } from '../../components/driver/DriverStatusToggle';
import { OrderAcceptCard } from '../../components/driver/OrderAcceptCard';

export default function TgDriverHome() {
  const navigate     = useNavigate();
  const queryClient  = useQueryClient();
  const [isOnline, setIsOnline]         = useState(false);
  const [incomingOrder, setIncomingOrder] = useState<any>(null);

  const { data: dashRes } = useQuery({
    queryKey: ['tg-driver-home'],
    queryFn: getDriverDashboardFn,
    staleTime: 30_000,
  });
  const dashboard = dashRes?.data || dashRes || {};

  useEffect(() => {
    setIsOnline(!!dashboard.driver?.isOnline);
  }, [dashboard.driver?.isOnline]);

  const { mutate: updateStatus, isPending: statusPending } = useMutation({
    mutationFn: (online: boolean) => updateDriverStatusFn({ isOnline: online }),
    onSuccess: (_, online) => {
      setIsOnline(online);
      toast.success(online ? "Online bo'ldingiz" : "Offline bo'ldingiz");
      queryClient.invalidateQueries({ queryKey: ['tg-driver-home'] });
    },
    onError: () => toast.error("Holat o'zgartirishda xatolik"),
  });

  const { mutate: acceptOrder } = useMutation({
    mutationFn: (orderId: string) => acceptDriverOrderFn(orderId),
    onSuccess: () => {
      toast.success('Buyurtma qabul qilindi!');
      setIncomingOrder(null);
      queryClient.invalidateQueries({ queryKey: ['tg-driver-home'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Xatolik'),
  });

  const { mutate: markDelivered } = useMutation({
    mutationFn: (orderId: string) => updateDriverOrderStatusFn({ orderId, status: 'DELIVERED' }),
    onSuccess: () => {
      toast.success('Yetkazish tasdiqlandi! 🎉');
      queryClient.invalidateQueries({ queryKey: ['tg-driver-home'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Xatolik'),
  });

  // Joylashuvni har 5 soniyada yuborish
  useEffect(() => {
    if (!isOnline) return;
    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => updateDriverLocationFn({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error('Location:', err)
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [isOnline]);

  // Socket orqali kelgan buyurtma taklifi
  useEffect(() => {
    const handler = (event: any) => setIncomingOrder(event.detail.order ?? event.detail);
    window.addEventListener('order-offer', handler);
    return () => window.removeEventListener('order-offer', handler);
  }, []);

  const activeOrder = dashboard.activeOrder;

  const handleNavigate = (addr: string) =>
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`);

  if (incomingOrder) {
    return (
      <div className="p-4 pt-10">
        <OrderAcceptCard
          order={incomingOrder}
          expiresIn={incomingOrder.expiresIn || 30}
          onAccept={() => acceptOrder(incomingOrder.id)}
          onDecline={() => setIncomingOrder(null)}
        />
      </div>
    );
  }

  return (
    <div className="text-white">
      {/* Header */}
      <div className="bg-slate-800 px-4 pt-10 pb-5 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-slate-400 text-sm">Xush kelibsiz 👋</p>
            <h1 className="text-lg font-bold">{dashboard.driver?.user?.name || 'Haydovchi'}</h1>
          </div>
        </div>
        <DriverStatusToggle isOnline={isOnline} onChange={updateStatus} disabled={statusPending} />
      </div>

      <div className="p-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-sky-400" />
              <p className="text-slate-400 text-xs">Bugun</p>
            </div>
            <p className="text-xl font-bold">{dashboard.todayOrders || 0} ta</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-green-400" />
              <p className="text-slate-400 text-xs">Daromad</p>
            </div>
            <p className="text-xl font-bold">{(dashboard.todayEarnings || 0).toLocaleString('uz-UZ')}</p>
          </div>
        </div>

        {/* Active order */}
        {activeOrder ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl p-5 shadow-xl">
            <h2 className="text-lg font-bold mb-3">Faol yetkazish</h2>
            <div className="space-y-2 mb-4 text-sm">
              <p className="text-sky-100">Mijoz</p>
              <p className="font-semibold -mt-1">{activeOrder.client?.user?.name}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const addr = typeof activeOrder.deliveryAddress === 'object'
                    ? activeOrder.deliveryAddress?.street || activeOrder.deliveryAddress?.address || ''
                    : activeOrder.deliveryAddress || '';
                  handleNavigate(addr);
                }}
                className="flex-1 bg-white text-sky-600 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5"
              >
                <Navigation className="w-4 h-4" /> Navigatsiya
              </button>
              <button
                onClick={() => navigate(`/driver/tg/delivery/${activeOrder.id}`)}
                className="flex-1 bg-white/20 text-white py-2.5 rounded-xl font-bold text-sm"
              >
                Batafsil
              </button>
            </div>
            {activeOrder.status === 'IN_TRANSIT' && (
              <button
                onClick={() => markDelivered(activeOrder.id)}
                className="w-full mt-2 bg-green-500 text-white py-2.5 rounded-xl font-bold text-sm"
              >
                Yetkazildi ✓
              </button>
            )}
          </motion.div>
        ) : (
          <div className="bg-slate-800 rounded-2xl p-10 text-center border border-slate-700">
            <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">
              {isOnline ? 'Buyurtma kutilmoqda...' : "Online bo'ling va buyurtma oling"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
