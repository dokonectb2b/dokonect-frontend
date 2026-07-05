import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, Package, Building2, Star, ChevronRight, Plus } from 'lucide-react';
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
      {/* Header — gradient hero */}
      <div className="tgs-hero relative overflow-hidden px-4 pt-10 pb-12 text-white">
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/15 blur-2xl" />
        <h1 className="relative text-xl font-bold tracking-tight mb-3">Katalog</h1>
        <div className="relative flex items-center gap-2 bg-white rounded-2xl px-4 py-3 shadow-lg shadow-green-900/10">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Mahsulot qidirish..."
            className="flex-1 text-gray-800 placeholder-gray-400 text-sm outline-none bg-transparent" />
          {search && (
            <button onClick={() => setSearch('')}
              className="text-gray-300 text-lg shrink-0">×</button>
          )}
        </div>
      </div>

      {/* Tabs — pill uslub */}
      <div className="px-4 -mt-6 relative z-10 mb-1">
        <div className="tgs-card rounded-2xl p-1 flex gap-1">
          {(['products', 'distributors'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                tab === t ? 'text-white shadow-md shadow-green-500/25' : 'text-gray-400'
              }`}
              style={tab === t ? { background: `linear-gradient(135deg, ${PRIMARY}, #16A34A)` } : undefined}>
              {t === 'products' ? <Package className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
              {t === 'products' ? 'Mahsulotlar' : 'Distribyutorlar'}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Products grid */}
        {tab === 'products' && (
          pLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="tgs-card rounded-2xl h-52 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <Package className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-gray-500 text-sm">Mahsulotlar topilmadi</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {products.map((p: any) => {
                const img = p.images?.find((i: any) => i.isCover)?.url ?? p.images?.[0]?.url;
                const qty = getCartQty(p.id);
                const price = p.wholesalePrice ?? p.retailPrice ?? 0;
                return (
                  <div key={p.id} className="tgs-card rounded-2xl overflow-hidden">
                    <div className="h-32 bg-gray-50 flex items-center justify-center overflow-hidden">
                      {img ? (
                        <img src={img} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-9 h-9 text-gray-200" />
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-semibold text-gray-900 line-clamp-2 leading-tight min-h-8">{p.name}</p>
                      <div className="flex items-baseline gap-1 mt-1">
                        <p className="text-sm font-bold tracking-tight" style={{ color: PRIMARY }}>
                          {fmt(price)} so'm
                        </p>
                        {p.unit && <p className="text-[10px] text-gray-400">/ {p.unit}</p>}
                      </div>
                      {qty > 0 ? (
                        <div className="flex items-center justify-between mt-2 bg-green-50 rounded-xl p-1">
                          <button onClick={() => useCartStore.getState().updateQuantity(p.id, qty - 1)}
                            className="w-7 h-7 rounded-lg bg-white shadow-sm text-sm font-bold text-gray-600 active:scale-90 transition-transform">−</button>
                          <span className="text-sm font-bold text-green-600">{qty}</span>
                          <button onClick={() => useCartStore.getState().updateQuantity(p.id, qty + 1)}
                            className="w-7 h-7 rounded-lg bg-white shadow-sm text-sm font-bold text-gray-600 active:scale-90 transition-transform">+</button>
                        </div>
                      ) : (
                        <button onClick={() => handleAdd(p)}
                          className="w-full mt-2 py-2 rounded-xl text-white text-xs font-semibold flex items-center justify-center gap-1 shadow-md shadow-green-500/20 active:scale-95 transition-transform"
                          style={{ background: `linear-gradient(135deg, ${PRIMARY}, #16A34A)` }}>
                          <Plus className="w-3.5 h-3.5" /> Savatga
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
                <div key={i} className="tgs-card rounded-2xl h-20 animate-pulse" />
              ))}
            </div>
          ) : distributors.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <Building2 className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-gray-500 text-sm">Distribyutorlar topilmadi</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {distributors.map((d: any) => (
                <button key={d.id}
                  onClick={() => navigate(`/store/distributors/${d.id}`)}
                  className="tgs-card rounded-2xl p-4 text-left w-full active:scale-[0.98] transition-transform">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center shrink-0 overflow-hidden">
                      {d.banner ? (
                        <img src={d.banner} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-gray-900 text-sm truncate">{d.companyName}</p>
                      <p className="text-xs text-gray-400 truncate">{d.address}</p>
                      {d.rating && (
                        <p className="flex items-center gap-1 text-xs mt-0.5 font-semibold text-amber-500">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {d.rating.toFixed(1)}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
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
