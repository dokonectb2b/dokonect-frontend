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
      <div className="px-4 pt-10 pb-8 text-center bg-slate-800 border-b border-slate-700">
        <div className="w-20 h-20 rounded-full bg-sky-500/20 flex items-center justify-center mx-auto mb-3 text-2xl font-bold text-sky-400">
          {initials}
        </div>
        <h1 className="text-xl font-bold">{user?.name ?? 'Haydovchi'}</h1>
        <p className="text-sm text-slate-400 mt-0.5">{user?.phone}</p>
        {driver?.rating != null && (
          <p className="text-xs text-amber-400 mt-1">⭐ {driver.rating.toFixed(1)}</p>
        )}
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">
        {/* Stats */}
        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
          <h3 className="font-bold text-sm mb-3">Statistika</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-700 rounded-xl p-3 text-center">
              <p className="font-bold text-sm">{driver?.totalDeliveries ?? 0} ta</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Jami yetkazish</p>
            </div>
            <div className="bg-slate-700 rounded-xl p-3 text-center">
              <p className="font-bold text-sm">{driver?.isOnline ? 'Online' : 'Offline'}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Holat</p>
            </div>
          </div>
        </div>

        {/* Vehicle info */}
        {driver && (
          <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
            <h3 className="font-bold text-sm mb-3">Transport ma'lumotlari</h3>
            <div className="flex flex-col gap-2">
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
          className="w-full py-3.5 rounded-2xl text-red-400 font-semibold text-sm bg-red-500/10">
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
