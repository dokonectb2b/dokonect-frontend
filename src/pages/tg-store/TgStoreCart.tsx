import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cart.store';
import { createOrderFn } from '../../api/order.api';
import { getClientDistributorsFn } from '../../api/client.api';
import toast from 'react-hot-toast';

const PRIMARY = '#22C55E';
const PAY_METHODS = [
  { value: 'CASH',          label: '💵 Naqd' },
  { value: 'CARD',          label: '💳 Karta' },
  { value: 'BANK_TRANSFER', label: '🏦 Bank o\'tkazma' },
  { value: 'CREDIT',        label: '📝 Nasiya' },
];

function fmt(n: number) { return new Intl.NumberFormat('uz-UZ').format(Math.round(n)) + " so'm"; }

export default function TgStoreCart() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart, totalAmount } = useCartStore();
  const [payMethod, setPayMethod]   = useState('CASH');
  const [address, setAddress]       = useState('');
  const [notes, setNotes]           = useState('');
  const [showForm, setShowForm]     = useState(false);

  const distributorId = items[0]?.distributorId ?? '';

  const { data: distData } = useQuery({
    queryKey: ['tg-dist-info', distributorId],
    queryFn:  () => getClientDistributorsFn({ limit: 1 } as any),
    enabled:  !!distributorId,
  });

  const createMutation = useMutation({
    mutationFn: createOrderFn,
    onSuccess: () => {
      clearCart();
      toast.success("Buyurtma yuborildi!");
      navigate('/store/tg/orders');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Xatolik yuz berdi');
    },
  });

  function handleOrder() {
    if (!items.length) return;
    createMutation.mutate({
      distributorId,
      items: items.map(i => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
      deliveryAddress: address || undefined,
      notes:           notes   || undefined,
      paymentMethod:   payMethod as any,
    });
  }

  if (items.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6">
      <div className="text-6xl mb-4">🛒</div>
      <h2 className="font-bold text-gray-900 text-lg mb-1">Savat bo'sh</h2>
      <p className="text-gray-500 text-sm text-center mb-6">Katalogdan mahsulot qo'shing</p>
      <button onClick={() => navigate('/store/tg/catalog')}
        className="px-8 py-3 rounded-2xl text-white font-semibold text-sm"
        style={{ background: PRIMARY }}>
        Katalogga o'tish
      </button>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="px-4 pt-10 pb-4 text-white" style={{ background: `linear-gradient(135deg, ${PRIMARY}, #16A34A)` }}>
        <h1 className="text-xl font-bold">Savat</h1>
        <p className="text-sm opacity-80 mt-0.5">{items.length} ta mahsulot</p>
      </div>

      <div className="px-4 py-4 flex flex-col gap-3">
        {/* Cart items */}
        {items.map(item => (
          <div key={item.productId} className="bg-white rounded-2xl p-4">
            <div className="flex gap-3">
              <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                {item.imageUrl
                  ? <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                  : <span className="text-2xl">📦</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 line-clamp-2">{item.name}</p>
                <p className="text-sm font-bold mt-1" style={{ color: PRIMARY }}>
                  {fmt(item.price)}
                </p>
              </div>
              <button onClick={() => removeItem(item.productId)}
                className="text-red-400 text-lg self-start">×</button>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-1.5">
                <button onClick={() => item.quantity > 1
                  ? updateQuantity(item.productId, item.quantity - 1)
                  : removeItem(item.productId)}
                  className="w-6 h-6 flex items-center justify-center font-bold text-gray-600">−</button>
                <span className="font-bold text-sm w-5 text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="w-6 h-6 flex items-center justify-center font-bold text-gray-600">+</button>
              </div>
              <p className="font-bold text-gray-900 text-sm">{fmt(item.price * item.quantity)}</p>
            </div>
          </div>
        ))}

        {/* Total */}
        <div className="bg-white rounded-2xl p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">Jami summa</span>
            <span className="font-bold text-lg" style={{ color: PRIMARY }}>{fmt(totalAmount())}</span>
          </div>
        </div>

        {/* Order form toggle */}
        {!showForm ? (
          <button onClick={() => setShowForm(true)}
            className="w-full py-3.5 rounded-2xl text-white font-bold text-sm"
            style={{ background: PRIMARY }}>
            Buyurtma berish →
          </button>
        ) : (
          <div className="bg-white rounded-2xl p-4 flex flex-col gap-4">
            <h3 className="font-bold text-gray-900 text-sm">Buyurtma ma'lumotlari</h3>

            {/* Delivery address */}
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">Yetkazib berish manzili</label>
              <input value={address} onChange={e => setAddress(e.target.value)}
                placeholder="Manzilni kiriting..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400" />
            </div>

            {/* Payment method */}
            <div>
              <label className="text-xs text-gray-500 font-medium mb-2 block">To'lov turi</label>
              <div className="grid grid-cols-2 gap-2">
                {PAY_METHODS.map(m => (
                  <button key={m.value} onClick={() => setPayMethod(m.value)}
                    className={`py-2.5 rounded-xl text-xs font-semibold border-2 transition-colors ${
                      payMethod === m.value
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-100 text-gray-600 bg-gray-50'
                    }`}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">Izoh (ixtiyoriy)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Qo'shimcha ma'lumot..."
                rows={2}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none resize-none focus:border-green-400" />
            </div>

            <button onClick={handleOrder} disabled={createMutation.isPending}
              className="w-full py-3.5 rounded-2xl text-white font-bold text-sm disabled:opacity-60"
              style={{ background: PRIMARY }}>
              {createMutation.isPending ? 'Yuklanmoqda...' : `✅ Buyurtma yuborish — ${fmt(totalAmount())}`}
            </button>
            <button onClick={() => setShowForm(false)}
              className="w-full py-2.5 rounded-2xl text-gray-500 text-sm bg-gray-100">
              Bekor qilish
            </button>
          </div>
        )}
      </div>
      <div className="h-4" />
    </div>
  );
}
