import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Package, CheckCircle, TrendingUp, Wallet } from 'lucide-react';

import { getDriverStatisticsFn, getDriverCollectionsFn } from '../../api/driver.api';

type Period = 'today' | 'week' | 'month';

const TABS: Array<{ key: Period; label: string }> = [
  { key: 'today', label: 'Bugun' },
  { key: 'week',  label: 'Hafta' },
  { key: 'month', label: 'Oy' },
];

function dateStr(d: Date) {
  return d.toISOString().split('T')[0];
}

function rangeFor(period: Period) {
  const end = new Date();
  const start = new Date();
  if (period === 'week') start.setDate(start.getDate() - 6);
  if (period === 'month') start.setDate(start.getDate() - 29);
  return { startDate: dateStr(start), endDate: dateStr(end) };
}

const PAYMENT_ROWS: Array<{ key: 'cash' | 'card' | 'credit' | 'bankTransfer'; label: string }> = [
  { key: 'cash',         label: 'Naqt' },
  { key: 'card',         label: 'Karta' },
  { key: 'credit',       label: 'Kredit' },
  { key: 'bankTransfer', label: "Bank o'tkazma" },
];

export default function TgDriverStatistics() {
  const [period, setPeriod] = useState<Period>('today');
  const { startDate, endDate } = rangeFor(period);

  const { data: statsRes } = useQuery({
    queryKey: ['tg-driver-statistics', period],
    queryFn: () => getDriverStatisticsFn({ startDate, endDate }),
    staleTime: 30_000,
  });
  const stats = statsRes?.data || statsRes || {};
  const summary = stats.summary || {};
  const byPaymentMethod = stats.byPaymentMethod || {};

  const { data: collectionsRes } = useQuery({
    queryKey: ['tg-driver-collections', period],
    queryFn: () => getDriverCollectionsFn({ startDate, endDate }),
    staleTime: 30_000,
  });
  const collections = collectionsRes?.data || collectionsRes || {};
  const collectionList: any[] = collections.collections || [];

  return (
    <div className="text-white p-4 space-y-4">
      <h1 className="text-lg font-bold">Statistika</h1>

      <div className="flex gap-2">
        {TABS.map((tab) => (
          <button key={tab.key} onClick={() => setPeriod(tab.key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${period === tab.key ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-4 h-4 text-sky-400" />
            <p className="text-slate-400 text-xs">Tayinlangan</p>
          </div>
          <p className="text-xl font-bold">{summary.totalAssigned ?? 0} ta</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <p className="text-slate-400 text-xs">Yetkazilgan</p>
          </div>
          <p className="text-xl font-bold">{summary.totalDelivered ?? 0} ta</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <p className="text-slate-400 text-xs">Yetkazish darajasi</p>
          </div>
          <p className="text-xl font-bold">{Math.round(summary.deliveryRate ?? 0)}%</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-4 h-4 text-green-400" />
            <p className="text-slate-400 text-xs">Yig'ilgan</p>
          </div>
          <p className="text-xl font-bold">{(summary.totalCollected ?? 0).toLocaleString('uz-UZ')}</p>
        </div>
      </div>

      {/* Payment method breakdown */}
      <div className="bg-slate-800 rounded-xl p-4">
        <p className="text-slate-400 text-xs mb-3">To'lov turlari bo'yicha</p>
        <div className="space-y-2">
          {PAYMENT_ROWS.map((row) => {
            const data = byPaymentMethod[row.key] || { count: 0, amount: 0 };
            return (
              <div key={row.key} className="flex items-center justify-between text-sm">
                <span className="text-slate-300">{row.label} ({data.count})</span>
                <span className="font-medium">{(data.amount || 0).toLocaleString('uz-UZ')} so'm</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-client collections */}
      <div className="bg-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-slate-400 text-xs">Mijozlar bo'yicha yig'imlar</p>
          <p className="text-xs text-slate-500">{collections.summary?.totalClients ?? 0} ta mijoz</p>
        </div>
        <div className="space-y-2.5">
          {collectionList.map((c: any) => (
            <div key={c.clientId} className="bg-slate-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-sm">{c.clientName || c.storeName}</p>
                <p className="font-bold text-sm text-green-400">{(c.totalAmount || 0).toLocaleString('uz-UZ')}</p>
              </div>
              <p className="text-xs text-slate-400">{c.totalOrders} ta buyurtma</p>
            </div>
          ))}
          {collectionList.length === 0 && (
            <div className="text-center py-6 text-slate-500 text-sm">Bu davr uchun yig'im yo'q</div>
          )}
        </div>
      </div>
    </div>
  );
}
