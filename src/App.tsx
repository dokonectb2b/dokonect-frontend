import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppLayout from './components/layout/AppLayout';
import AdminLayout from './components/layout/AdminLayout';
import { useAuthStore } from './store/authStore';

// Landing
const LandingPage = lazy(() => import('./pages/LandingPage'));

// Auth
const LoginPage    = lazy(() => import('./pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));

// Admin
const GlobalDashboard        = lazy(() => import('./pages/admin/GlobalDashboard'));
const AdminOrdersPage        = lazy(() => import('./pages/admin/OrdersPage').then(m => ({ default: m.OrdersPage })));
const UsersPage              = lazy(() => import('./pages/admin/UsersPage').then(m => ({ default: m.UsersPage })));
const AdminStoresPage        = lazy(() => import('./pages/admin/StoresPage'));
const AdminPaymentsPage      = lazy(() => import('./pages/admin/PaymentsPage'));
const AdminDistributorsPage  = lazy(() => import('./pages/admin/AdminDistributorsPage'));
const AdminProductsPage      = lazy(() => import('./pages/admin/AdminProducts'));
const AdminAnalyticsPage     = lazy(() => import('./pages/admin/AdminAnalyticsPage'));

// Distributor
const DistributorDashboard  = lazy(() => import('./pages/distributor/DistributorDashboard').then(m => ({ default: m.DistributorDashboard })));
const OrdersPage            = lazy(() => import('./pages/distributor/OrdersPage'));
const OrderDetailPage       = lazy(() => import('./pages/distributor/OrderDetailPage'));
const ProductsPage          = lazy(() => import('./pages/distributor/ProductsPage').then(m => ({ default: m.ProductsPage })));
const AddProductPage        = lazy(() => import('./pages/distributor/AddProductPage'));
const DriversPage           = lazy(() => import('./pages/distributor/DriversPage'));
const InventoryPage         = lazy(() => import('./pages/distributor/InventoryPage'));
const AnalyticsPage         = lazy(() => import('./pages/distributor/AnalyticsPage'));
const SettingsPage          = lazy(() => import('./pages/distributor/SettingsPage'));
const DistributorChatPage   = lazy(() => import('./pages/distributor/ChatPage'));
const PricingPage           = lazy(() => import('./pages/distributor/PricingPage'));
const CategoriesPage        = lazy(() => import('./pages/distributor/CategoriesPage'));
const ClientsPage           = lazy(() => import('./pages/distributor/ClientsPage'));
const ClientDetailPage      = lazy(() => import('./pages/distributor/ClientDetailPage'));
const PaymentsPage          = lazy(() => import('./pages/distributor/PaymentsPage'));

// Driver
const DriverHomePage      = lazy(() => import('./pages/driver/DriverHomePage').then(m => ({ default: m.DriverHomePage })));
const DriverDashboard     = lazy(() => import('./pages/driver/DriverDashboard').then(m => ({ default: m.DriverDashboard })));
const ActiveDeliveryPage  = lazy(() => import('./pages/driver/ActiveDeliveryPage').then(m => ({ default: m.ActiveDeliveryPage })));
const DriverEarningsPage  = lazy(() => import('./pages/driver/DriverEarningsPage').then(m => ({ default: m.DriverEarningsPage })));

// Store
const StoreDashboard        = lazy(() => import('./pages/store/StoreDashboard'));
const StoreOrdersPage       = lazy(() => import('./pages/store/StoreOrdersPage'));
const StoreOrderDetailPage  = lazy(() => import('./pages/store/StoreOrderDetailPage'));
const CatalogPage           = lazy(() => import('./pages/store/CatalogPage'));
const DistributorsPage      = lazy(() => import('./pages/store/DistributorsPage'));
const DistributorDetailPage = lazy(() => import('./pages/store/DistributorDetailPage'));
const FinancePage           = lazy(() => import('./pages/store/FinancePage'));
const StoreChatPage         = lazy(() => import('./pages/store/ChatPage'));
const CartPage              = lazy(() => import('./pages/store/CartPage'));

// ─── ProtectedRoute ───────────────────────────────────────────────────────────
const ProtectedRoute = ({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: string[];
}) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user?.role && !roles.includes(user.role)) {
    if (user.role === 'ADMIN')                           return <Navigate to="/admin/dashboard"       replace />;
    if (user.role === 'DISTRIBUTOR')                     return <Navigate to="/distributor/dashboard" replace />;
    if (user.role === 'CLIENT' || user.role === 'STORE') return <Navigate to="/store/dashboard"       replace />;
    if (user.role === 'DRIVER')                          return <Navigate to="/driver/dashboard"      replace />;
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

// ─── HomeRedirect ─────────────────────────────────────────────────────────────
const HomeRedirect = () => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (user?.role === 'ADMIN')                            return <Navigate to="/admin/dashboard"       replace />;
  if (user?.role === 'DISTRIBUTOR')                      return <Navigate to="/distributor/dashboard" replace />;
  if (user?.role === 'CLIENT' || user?.role === 'STORE') return <Navigate to="/store/dashboard"       replace />;
  if (user?.role === 'DRIVER')                           return <Navigate to="/driver/dashboard"      replace />;
  return <Navigate to="/" replace />;
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Suspense fallback={null}>
        <Routes>

          {/* ── LANDING ── */}
          <Route path="/" element={<LandingPage />} />

          {/* ── PUBLIC ── */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ── ADMIN ── */}
          <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminLayout /></ProtectedRoute>}>
            <Route index               element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"    element={<GlobalDashboard />} />
            <Route path="orders"       element={<AdminOrdersPage />} />
            <Route path="users"        element={<UsersPage />} />
            <Route path="distributors" element={<AdminDistributorsPage />} />
            <Route path="stores"       element={<AdminStoresPage />} />
            <Route path="products"     element={<AdminProductsPage />} />
            <Route path="payments"     element={<AdminPaymentsPage />} />
            <Route path="analytics"    element={<AdminAnalyticsPage />} />
          </Route>

          {/* ── APP LAYOUT ── */}
          <Route element={<AppLayout />}>
            <Route path="/home" element={<HomeRedirect />} />

            {/* DISTRIBUTOR */}
            <Route path="/distributor/dashboard"    element={<ProtectedRoute roles={['DISTRIBUTOR','ADMIN']}><DistributorDashboard /></ProtectedRoute>} />
            <Route path="/distributor/orders"       element={<ProtectedRoute roles={['DISTRIBUTOR','ADMIN']}><OrdersPage /></ProtectedRoute>} />
            <Route path="/distributor/orders/:id"   element={<ProtectedRoute roles={['DISTRIBUTOR','ADMIN']}><OrderDetailPage /></ProtectedRoute>} />
            <Route path="/distributor/products"     element={<ProtectedRoute roles={['DISTRIBUTOR','ADMIN']}><ProductsPage /></ProtectedRoute>} />
            <Route path="/distributor/products/add" element={<ProtectedRoute roles={['DISTRIBUTOR','ADMIN']}><AddProductPage /></ProtectedRoute>} />
            <Route path="/distributor/drivers"      element={<ProtectedRoute roles={['DISTRIBUTOR','ADMIN']}><DriversPage /></ProtectedRoute>} />
            <Route path="/distributor/inventory"    element={<ProtectedRoute roles={['DISTRIBUTOR','ADMIN']}><InventoryPage /></ProtectedRoute>} />
            <Route path="/distributor/analytics"    element={<ProtectedRoute roles={['DISTRIBUTOR','ADMIN']}><AnalyticsPage /></ProtectedRoute>} />
            <Route path="/distributor/pricing"      element={<ProtectedRoute roles={['DISTRIBUTOR','ADMIN']}><PricingPage /></ProtectedRoute>} />
            <Route path="/distributor/chat"         element={<ProtectedRoute roles={['DISTRIBUTOR','ADMIN']}><DistributorChatPage /></ProtectedRoute>} />
            <Route path="/distributor/settings"     element={<ProtectedRoute roles={['DISTRIBUTOR','ADMIN']}><SettingsPage /></ProtectedRoute>} />
            <Route path="/distributor/categories"   element={<ProtectedRoute roles={['DISTRIBUTOR','ADMIN']}><CategoriesPage /></ProtectedRoute>} />
            <Route path="/distributor/clients"      element={<ProtectedRoute roles={['DISTRIBUTOR','ADMIN']}><ClientsPage /></ProtectedRoute>} />
            <Route path="/distributor/clients/:id"  element={<ProtectedRoute roles={['DISTRIBUTOR','ADMIN']}><ClientDetailPage /></ProtectedRoute>} />
            <Route path="/distributor/payments"     element={<ProtectedRoute roles={['DISTRIBUTOR','ADMIN']}><PaymentsPage /></ProtectedRoute>} />

            {/* DRIVER */}
            <Route path="/driver/home"               element={<ProtectedRoute roles={['DRIVER']}><DriverHomePage /></ProtectedRoute>} />
            <Route path="/driver/dashboard"          element={<ProtectedRoute roles={['DRIVER']}><DriverDashboard /></ProtectedRoute>} />
            <Route path="/driver/delivery/:orderId"  element={<ProtectedRoute roles={['DRIVER']}><ActiveDeliveryPage /></ProtectedRoute>} />
            <Route path="/driver/earnings"           element={<ProtectedRoute roles={['DRIVER']}><DriverEarningsPage /></ProtectedRoute>} />

            {/* STORE / CLIENT */}
            <Route path="/store/dashboard"        element={<ProtectedRoute roles={['CLIENT','STORE','ADMIN']}><StoreDashboard /></ProtectedRoute>} />
            <Route path="/store/orders"           element={<ProtectedRoute roles={['CLIENT','STORE','ADMIN']}><StoreOrdersPage /></ProtectedRoute>} />
            <Route path="/store/orders/:id"       element={<ProtectedRoute roles={['CLIENT','STORE','ADMIN']}><StoreOrderDetailPage /></ProtectedRoute>} />
            <Route path="/store/catalog"          element={<ProtectedRoute roles={['CLIENT','STORE','ADMIN']}><CatalogPage /></ProtectedRoute>} />
            <Route path="/store/distributors"     element={<ProtectedRoute roles={['CLIENT','STORE','ADMIN']}><DistributorsPage /></ProtectedRoute>} />
            <Route path="/store/distributors/:id" element={<ProtectedRoute roles={['CLIENT','STORE','ADMIN']}><DistributorDetailPage /></ProtectedRoute>} />
            <Route path="/store/finance"          element={<ProtectedRoute roles={['CLIENT','STORE','ADMIN']}><FinancePage /></ProtectedRoute>} />
            <Route path="/store/chat"             element={<ProtectedRoute roles={['CLIENT','STORE','ADMIN']}><StoreChatPage /></ProtectedRoute>} />
            <Route path="/store/cart"             element={<ProtectedRoute roles={['CLIENT','STORE','ADMIN']}><CartPage /></ProtectedRoute>} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
