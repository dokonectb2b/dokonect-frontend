import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getClientProductsFn, getClientDistributorsFn } from '../../api/client.api';
import { useCartStore } from '../../store/cart.store';

const PRIMARY = '#22C55E';

function fmt(n: number) {
  return new Intl.NumberFormat('uz-UZ').format(Math.round(n));
}

type Tab = 'products' | 'distributors';

export default function TgStoreCatalog() {
  const navigate  = useNavigate();
  const [tab, setTab]       = useState<Tab>('products');
  const [search, setSearch] = useState('');
  const addItem = useCartStore(s => s.addItem);
  const cartItems = useCartStore(s => s.items);

  const { data: productsData, isLoading: pLoading } = useQuery({
    queryKey: ['tg-products', search],
    queryFn: () => getClientProductsFn({ search, limit: 40 }),
    select: (r) => r.data ?? r,
  });

  const { data: distData, isLoading: dLoading } = useQuery({
    queryKey: ['tg-distributors'],
    queryFn: () => getClientDistributorsFn({ limit: 30 } as any),
    select: (r) => r.data ?? r,
    enabled: tab === 'distributors',
  });

  const products: any[]     = productsData?.products ?? productsData ?? [];
  const distributors: any[] = distData?.distributors ?? distData ?? [];

  function getCartQty(productId: string) {
    return cartItems.find(i => i.productId === productId)?.quantity ?? 0;
  }

  function handleAdd(p: any) {
    const img = p.images?.find((i: any) => i.isCover)?.url ?? p.images?.[0]?.url ?? null;
    addItem({
      productId:     p.id,
      distributorId: p.distributorId ?? '',
      name:          p.name,
      price:         p.wholesalePrice ?? p.retailPrice ?? 0,
      quantity:      1,
      imageUrl:      img,
      stock:         p.stock ?? 9999,
    });
  }

  return (
    <div>
      {/* Header */}
      <div className="px-4 pt-10 pb-4 text-white" style={{ background: `linear-gradient(135deg, ${PRIMARY}, #16A34A)` }}>
        <h1 className="text-xl font-bold mb-3">Katalog</h1>
        <div className="relative">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Mahsulot qidirish..."
            className="w-full bg-white/20 text-white placeholder-white/60 rounded-xl px-4 py-2.5 text-sm outline-none" />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 text-lg">×</button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-100 px-4">
        {(['products', 'distributors'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${
              tab === t ? 'border-green-500 text-green-500' : 'border-transparent text-gray-400'
            }`}>
            {t === 'products' ? '📦 Mahsulotlar' : '🏢 Distribyutorlar'}
          </button>
        ))}
      </div>

      <div className="px-4 py-4">
        {/* Products grid */}
        {tab === 'products' && (
          pLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-48 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">📦</div>
              <p className="text-gray-500 text-sm">Mahsulotlar topilmadi</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {products.map((p: any) => {
                const img = p.images?.find((i: any) => i.isCover)?.url ?? p.images?.[0]?.url;
                const qty = getCartQty(p.id);
                const price = p.wholesalePrice ?? p.retailPrice ?? 0;
                return (
                  <div key={p.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                    <div className="h-32 bg-gray-100 flex items-center justify-center overflow-hidden">
                      {img ? (
                        <img src={img} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl">📦</span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-semibold text-gray-900 line-clamp-2 leading-tight">{p.name}</p>
                      <p className="text-sm font-bold mt-1" style={{ color: PRIMARY }}>
                        {fmt(price)} so'm
                      </p>
                      <p className="text-[10px] text-gray-400">{p.unit}</p>
                      {qty > 0 ? (
                        <div className="flex items-center justify-between mt-2 bg-green-50 rounded-lg p-1">
                          <button onClick={() => useCartStore.getState().updateQuantity(p.id, qty - 1)}
                            className="w-6 h-6 rounded-md bg-white shadow-sm text-sm font-bold text-gray-600">−</button>
                          <span className="text-sm font-bold text-green-600">{qty}</span>
                          <button onClick={() => useCartStore.getState().updateQuantity(p.id, qty + 1)}
                            className="w-6 h-6 rounded-md bg-white shadow-sm text-sm font-bold text-gray-600">+</button>
                        </div>
                      ) : (
                        <button onClick={() => handleAdd(p)}
                          className="w-full mt-2 py-1.5 rounded-lg text-white text-xs font-semibold"
                          style={{ background: PRIMARY }}>
                          + Savatga
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* Distributors list */}
        {tab === 'distributors' && (
          dLoading ? (
            <div className="flex flex-col gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-20 animate-pulse" />
              ))}
            </div>
          ) : distributors.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">🏢</div>
              <p className="text-gray-500 text-sm">Distribyutorlar topilmadi</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {distributors.map((d: any) => (
                <button key={d.id}
                  onClick={() => navigate(`/store/distributors/${d.id}`)}
                  className="bg-white rounded-2xl p-4 text-left w-full active:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                      {d.banner ? (
                        <img src={d.banner} alt="" className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <span className="text-xl">🏢</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-gray-900 text-sm truncate">{d.companyName}</p>
                      <p className="text-xs text-gray-500 truncate">{d.address}</p>
                      {d.rating && (
                        <p className="text-xs mt-0.5" style={{ color: PRIMARY }}>⭐ {d.rating.toFixed(1)}</p>
                      )}
                    </div>
                    <span className="text-gray-300 text-lg">›</span>
                  </div>
                </button>
              ))}
            </div>
          )
        )}
      </div>
      <div className="h-4" />
    </div>
  );
}
