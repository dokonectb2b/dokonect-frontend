import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, DollarSign, Navigation, History, BarChart3 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import {
  getDriverDashboardFn,
  updateDriverStatusFn,
  updateDriverLocationFn,
  acceptDriverOrderFn,
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

  const driverName = dashboard.driver?.user?.name || 'Haydovchi';
  const initials = driverName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="text-white">
      {/* Header */}
      <div className="px-4 pt-10 pb-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center font-bold text-sm shadow-lg shadow-sky-500/20">
              {initials}
            </div>
            <div>
              <p className="text-slate-400 text-xs">Xush kelibsiz 👋</p>
              <h1 className="text-base font-bold tracking-tight">{driverName}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/driver/tg/orders')} className="p-2.5 tg-glass rounded-2xl active:scale-95 transition-transform">
              <History className="w-5 h-5 text-slate-200" />
            </button>
            <button onClick={() => navigate('/driver/tg/statistics')} className="p-2.5 tg-glass rounded-2xl active:scale-95 transition-transform">
              <BarChart3 className="w-5 h-5 text-slate-200" />
            </button>
          </div>
        </div>
        <DriverStatusToggle isOnline={isOnline} onChange={updateStatus} disabled={statusPending} />
      </div>

      <div className="px-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="tg-glass rounded-2xl p-4">
            <div className="w-9 h-9 rounded-xl bg-sky-500/15 flex items-center justify-center mb-2.5">
              <Package className="w-5 h-5 text-sky-400" />
            </div>
            <p className="text-2xl font-bold tracking-tight">{dashboard.todayOrders || 0}</p>
            <p className="text-slate-400 text-xs mt-0.5">Bugungi buyurtma</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="tg-glass rounded-2xl p-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center mb-2.5">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold tracking-tight">{(dashboard.todayEarnings || 0).toLocaleString('uz-UZ')}</p>
            <p className="text-slate-400 text-xs mt-0.5">Bugungi daromad</p>
          </motion.div>
        </div>

        {/* Active order */}
        {activeOrder ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl p-5 shadow-2xl shadow-sky-900/40 bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-white tg-live-dot" />
                <h2 className="text-base font-bold tracking-tight">Faol yetkazish</h2>
              </div>
              <div className="mb-4">
                <p className="text-sky-100 text-xs">Mijoz</p>
                <p className="font-bold text-lg">{activeOrder.client?.user?.name}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const addr = typeof activeOrder.deliveryAddress === 'object'
                      ? activeOrder.deliveryAddress?.street || activeOrder.deliveryAddress?.address || ''
                      : activeOrder.deliveryAddress || '';
                    handleNavigate(addr);
                  }}
                  className="flex-1 bg-white text-sky-600 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                >
                  <Navigation className="w-4 h-4" /> Navigatsiya
                </button>
                <button
                  onClick={() => navigate(`/driver/tg/delivery/${activeOrder.id}`)}
                  className="flex-1 bg-white/15 backdrop-blur text-white py-3 rounded-2xl font-bold text-sm active:scale-95 transition-transform"
                >
                  Batafsil
                </button>
              </div>
              {activeOrder.status === 'IN_TRANSIT' && (
                <button
                  onClick={() => navigate(`/driver/tg/delivery/${activeOrder.id}`)}
                  className="w-full mt-2 bg-emerald-400 text-emerald-950 py-3 rounded-2xl font-bold text-sm active:scale-95 transition-transform"
                >
                  Yetkazildi ✓
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="tg-glass rounded-3xl p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-400 text-sm">
              {isOnline ? 'Buyurtma kutilmoqda...' : "Online bo'ling va buyurtma oling"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
