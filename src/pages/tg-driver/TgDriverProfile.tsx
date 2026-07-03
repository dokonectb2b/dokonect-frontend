import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { getDriverDashboardFn } from '../../api/driver.api';

export default function TgDriverProfile() {
  const { user, logout } = useAuthStore();

  const { data: dashRes } = useQuery({
    queryKey: ['tg-driver-profile'],
    queryFn: getDriverDashboardFn,
    staleTime: 30_000,
  });
  const dashboard = dashRes?.data || dashRes || {};
  const driver     = dashboard.driver;

  function handleLogout() {
    logout();
    window.Telegram?.WebApp?.close?.();
  }

  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <div className="text-white">
      {/* Header */}
      <div className="relative px-4 pt-12 pb-8 text-center overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-sky-500/20 to-transparent" />
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center mx-auto mb-3 text-3xl font-bold shadow-xl shadow-sky-500/25">
            {initials}
          </div>
          <h1 className="text-xl font-bold tracking-tight">{user?.name ?? 'Haydovchi'}</h1>
          <p className="text-sm text-slate-400 mt-0.5">{user?.phone}</p>
          {driver?.rating != null && (
            <div className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 text-xs font-semibold">
              ⭐ {driver.rating.toFixed(1)}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 flex flex-col gap-4">
        {/* Stats */}
        <div className="tg-glass rounded-2xl p-4">
          <h3 className="font-bold text-sm mb-3">Statistika</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-xl p-3.5 text-center">
              <p className="font-bold text-lg tracking-tight">{driver?.totalDeliveries ?? 0}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Jami yetkazish</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3.5 text-center">
              <div className="flex items-center justify-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${driver?.isOnline ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                <p className="font-bold text-lg tracking-tight">{driver?.isOnline ? 'Online' : 'Offline'}</p>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Holat</p>
            </div>
          </div>
        </div>

        {/* Vehicle info */}
        {driver && (
          <div className="tg-glass rounded-2xl p-4">
            <h3 className="font-bold text-sm mb-3">Transport ma'lumotlari</h3>
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Turi</span>
                <span className="text-sm font-medium">{driver.vehicleType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Raqami</span>
                <span className="text-sm font-medium">{driver.vehicleNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Guvohnoma</span>
                <span className="text-sm font-medium">{driver.licenseNumber}</span>
              </div>
            </div>
          </div>
        )}

        {/* Logout */}
        <button onClick={handleLogout}
          className="w-full py-3.5 rounded-2xl text-rose-400 font-semibold text-sm bg-rose-500/10 hover:bg-rose-500/20 active:scale-[0.98] transition-all">
          Chiqish
        </button>

        <div className="text-center text-xs text-slate-500 pb-2">
          Dokonect Driver v1.0
        </div>
      </div>
      <div className="h-4" />
    </div>
  );
}
