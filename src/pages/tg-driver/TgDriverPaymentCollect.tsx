import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Wallet } from 'lucide-react';

import { getDriverOrderFn, collectPaymentFn } from '../../api/driver.api';

type PaymentMethod = 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'CREDIT';

const METHODS: Array<{ key: PaymentMethod; label: string }> = [
  { key: 'CASH',          label: 'Naqt' },
  { key: 'CARD',          label: 'Karta' },
  { key: 'BANK_TRANSFER', label: "Bank o'tkazma" },
  { key: 'CREDIT',        label: 'Kredit' },
];

export default function TgDriverPaymentCollect() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate     = useNavigate();
  const queryClient  = useQueryClient();

  const [method, setMethod] = useState<PaymentMethod>('CASH');
  const [amount, setAmount] = useState('');

  const { data: orderRes, isLoading } = useQuery({
    queryKey: ['tg-driver-delivery', orderId],
    queryFn: () => getDriverOrderFn(orderId!),
    enabled: !!orderId,
  });
  const order = orderRes?.data || orderRes;

  useEffect(() => {
    if (order?.totalAmount) setAmount(String(order.totalAmount));
  }, [order?.totalAmount]);

  const { mutate: collect, isPending } = useMutation({
    mutationFn: () => collectPaymentFn({ orderId: orderId!, paymentMethod: method, amount: Number(amount) }),
    onSuccess: () => {
      toast.success("To'lov qabul qilindi");
      queryClient.invalidateQueries({ queryKey: ['tg-driver-home'] });
      queryClient.invalidateQueries({ queryKey: ['tg-driver-earnings'] });
      queryClient.invalidateQueries({ queryKey: ['tg-driver-orders'] });
      navigate('/driver/tg', { replace: true });
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

  const total      = order.totalAmount || 0;
  const numAmount  = Number(amount) || 0;
  const isPartial  = numAmount > 0 && numAmount < total;
  const canSubmit  = numAmount > 0 && !isPending;

  return (
    <div className="text-white p-4 space-y-4">
      <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2.5 bg-white/20 rounded-full"><Wallet className="w-5 h-5" /></div>
          <div>
            <p className="text-sky-100 text-xs">Buyurtma summasi</p>
            <p className="text-2xl font-bold">{total.toLocaleString('uz-UZ')} so'm</p>
          </div>
        </div>
        <p className="text-sky-100 text-xs mt-1">Buyurtma #{order.orderNumber}</p>
      </div>

      <div className="bg-slate-800 rounded-xl p-4">
        <p className="text-slate-400 text-xs mb-3">To'lov turi</p>
        <div className="grid grid-cols-2 gap-2">
          {METHODS.map((m) => (
            <button key={m.key} onClick={() => setMethod(m.key)}
              className={`py-2.5 rounded-xl text-sm font-medium transition-colors ${
                method === m.key ? 'bg-sky-500 text-white' : 'bg-slate-700 text-slate-400'
              }`}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-4">
        <p className="text-slate-400 text-xs mb-2">Summasi</p>
        <input
          type="number"
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-slate-700 rounded-xl p-3 text-lg font-bold text-white outline-none"
        />
        {isPartial && (
          <p className="text-xs text-amber-400 mt-2">Qisman to'lov — qolgan qismi qarzga yoziladi</p>
        )}
      </div>

      <button
        onClick={() => collect()}
        disabled={!canSubmit}
        className="w-full py-3.5 rounded-2xl bg-green-500 text-white font-bold text-sm disabled:opacity-40"
      >
        {isPending ? 'Yuborilmoqda...' : 'Tasdiqlash'}
      </button>
    </div>
  );
}
