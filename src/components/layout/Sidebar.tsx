import { NavLink, useNavigate } from 'react-router-dom';
import {
  LogOut, LayoutDashboard, Package, ClipboardList,
  BarChart3, MessageSquare, Truck,
  Warehouse, Tag, Settings,
  FolderOpen, DollarSign, Users,
  ChevronLeft, ChevronRight, ShoppingCart, CreditCard,
  Navigation,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import DokonectLogo from '../ui/DokonectLogo';

const distributorMenu = [
  { to: '/distributor/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/distributor/orders',      icon: ClipboardList,   label: 'Buyurtmalar' },
  { to: '/distributor/products',    icon: Package,         label: 'Mahsulotlar' },
  { to: '/distributor/inventory',   icon: Warehouse,       label: 'Inventar' },
  { to: '/distributor/drivers',     icon: Truck,           label: 'Haydovchilar' },
  { to: '/distributor/analytics',   icon: BarChart3,       label: 'Analytics' },
  { to: '/distributor/pricing',     icon: Tag,             label: 'Narxlash' },
  { to: '/distributor/chat',        icon: MessageSquare,   label: 'Chat' },
  { to: '/distributor/settings',    icon: Settings,        label: 'Sozlamalar' },
  { to: '/distributor/categories',  icon: FolderOpen,      label: 'Kategoriyalar' },
  { to: '/distributor/clients',  icon: Users,       label: 'Mijozlar'  },
  { to: '/distributor/payments', icon: CreditCard,  label: "To'lovlar" },
];

const clientMenu = [
  { to: '/store/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/store/orders',       icon: ClipboardList,   label: 'Buyurtmalar' },
  { to: '/store/catalog',      icon: Package,         label: 'Katalog' },
  { to: '/store/cart',         icon: ShoppingCart,    label: 'Savat' },
  { to: '/store/distributors', icon: Users,           label: 'Distribyutorlar' },
  { to: '/store/finance',      icon: DollarSign,      label: 'Moliya' },
  { to: '/store/chat',         icon: MessageSquare,   label: 'Chat' },
];

const driverMenu = [
  { to: '/driver/home',      icon: LayoutDashboard, label: 'Bosh sahifa' },
  { to: '/driver/dashboard', icon: Navigation,      label: 'Dashboard' },
  { to: '/driver/earnings',  icon: DollarSign,      label: 'Daromadlar' },
];

interface SidebarProps {
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const Sidebar = ({ onClose, collapsed = false, onToggleCollapse }: SidebarProps) => {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const menuItems =
    user?.role === 'DRIVER'
      ? driverMenu
      : user?.role === 'CLIENT' || user?.role === 'STORE'
      ? clientMenu
      : distributorMenu;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside
      className="bg-slate-900 flex flex-col h-full fixed left-0 top-0 z-50 shadow-2xl transition-all duration-300 overflow-hidden"
      style={{ width: collapsed ? 64 : 256 }}
    >
      {/* Brand */}
      <div className={`border-b border-white/5 flex items-center ${collapsed ? 'px-3 py-5 justify-center' : 'px-5 py-4 justify-between'}`}>
        {collapsed ? (
          <div className="cursor-pointer group" onClick={() => navigate('/')}>
            <DokonectLogo size={34} variant="icon" onDark className="group-hover:scale-110 transition-transform" />
          </div>
        ) : (
          <div className="flex flex-col gap-0.5 cursor-pointer group min-w-0" onClick={() => navigate('/')}>
            <DokonectLogo size={34} onDark className="group-hover:opacity-90 transition-opacity" />
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pl-0.5">
              {user?.role === 'DRIVER'
                ? 'Haydovchi'
                : user?.role === 'CLIENT' || user?.role === 'STORE'
                ? "Do'kon egasi"
                : 'Distribyutor platformasi'}
            </span>
          </div>
        )}

        {onToggleCollapse && !collapsed && (
          <button
            onClick={onToggleCollapse}
            className="shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {onToggleCollapse && collapsed && (
        <button
          onClick={onToggleCollapse}
          className="mx-auto mt-3 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Navigation */}
      <nav className={`flex-1 py-6 space-y-1 overflow-y-auto custom-scrollbar overflow-x-hidden ${collapsed ? 'px-2' : 'px-4'}`}>
        {!collapsed && (
          <p className="px-3 mb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest opacity-50">Asosiy menyu</p>
        )}
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center rounded-xl text-sm font-bold transition-all duration-200 group ${
                collapsed ? 'justify-center p-3' : 'gap-3 px-3 py-3'
              } ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 active:scale-95'
              }`
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="tracking-tight whitespace-nowrap">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className={`border-t border-white/5 bg-slate-950/30 ${collapsed ? 'p-2' : 'p-4'}`}>
        <button
          onClick={handleLogout}
          title={collapsed ? 'Chiqish' : undefined}
          className={`w-full flex items-center rounded-xl text-sm font-bold text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all active:scale-95 group ${
            collapsed ? 'justify-center p-3' : 'gap-3 px-3 py-3'
          }`}
        >
          <LogOut className="w-5 h-5 shrink-0 group-hover:-translate-x-1 transition-transform" />
          {!collapsed && <span className="tracking-widest uppercase text-[11px]">Chiqish</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
