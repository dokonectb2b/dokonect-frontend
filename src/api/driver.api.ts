import api from './api';

// GET /api/driver/dashboard
export const getDriverDashboardFn = async () => {
  const res = await api.get('/api/driver/dashboard');
  return res.data;
};

// POST /api/driver/location — joylashuvni yuborish
export const updateDriverLocationFn = async (data: { lat: number; lng: number }) => {
  const res = await api.post('/api/driver/location', data);
  return res.data;
};

// PATCH /api/driver/status — online/offline
export const updateDriverStatusFn = async (data: { isOnline: boolean }) => {
  const res = await api.patch('/api/driver/status', data);
  return res.data;
};

// POST /api/driver/orders/:orderId/accept
export const acceptDriverOrderFn = async (orderId: string) => {
  const res = await api.post(`/api/driver/orders/${orderId}/accept`);
  return res.data;
};

// PATCH /api/driver/orders/:orderId/status
export const updateDriverOrderStatusFn = async ({
  orderId,
  status,
  note,
  photoProof,
  signature,
  problemReport,
}: {
  orderId: string;
  status: 'PICKED' | 'IN_TRANSIT' | 'DELIVERED' | 'RETURNED';
  note?: string;
  photoProof?: string;
  signature?: string;
  problemReport?: string;
}) => {
  const res = await api.patch(`/api/driver/orders/${orderId}/status`, { status, note, photoProof, signature, problemReport });
  return res.data;
};

// GET /api/driver/earnings
export const getDriverEarningsFn = async (params: { period?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) => {
  const res = await api.get('/api/driver/earnings', { params });
  return res.data;
};

// GET /api/driver/orders/:orderId
export const getDriverOrderFn = async (orderId: string) => {
  const res = await api.get(`/api/driver/orders/${orderId}`);
  return res.data;
};

// GET /api/driver/orders
export const getDriverOrdersFn = async (params: {
  status?: string;
  page?: number;
  limit?: number;
  date?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const res = await api.get('/api/driver/orders', { params });
  return res.data;
};

// GET /api/driver/orders/search/:orderNumber
export const searchDriverOrderFn = async (orderNumber: string | number) => {
  const res = await api.get(`/api/driver/orders/search/${orderNumber}`);
  return res.data;
};

// POST /api/driver/orders/:orderId/collect-payment
export const collectPaymentFn = async ({
  orderId,
  paymentMethod,
  amount,
}: {
  orderId: string;
  paymentMethod: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'CREDIT';
  amount: number;
}) => {
  const res = await api.post(`/api/driver/orders/${orderId}/collect-payment`, { paymentMethod, amount });
  return res.data;
};

// GET /api/driver/payment-stats
export const getDriverPaymentStatsFn = async (params: { startDate?: string; endDate?: string }) => {
  const res = await api.get('/api/driver/payment-stats', { params });
  return res.data;
};

// GET /api/driver/collections
export const getDriverCollectionsFn = async (params: { startDate?: string; endDate?: string }) => {
  const res = await api.get('/api/driver/collections', { params });
  return res.data;
};

// GET /api/driver/statistics
export const getDriverStatisticsFn = async (params: { startDate?: string; endDate?: string }) => {
  const res = await api.get('/api/driver/statistics', { params });
  return res.data;
};