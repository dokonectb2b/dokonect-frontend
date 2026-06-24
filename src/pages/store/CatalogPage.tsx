import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCartStore } from '../../store/cart.store';
import ProductCard from '../../components/products/ProductCard';
import { ShoppingBag, Search, SlidersHorizontal, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

import { getClientProductsFn } from '../../api/client.api';
import { getProductCategoriesFn } from '../../api/product.api';

const LIMIT = 12;

const CatalogPage = () => {
  const [search,     setSearch]     = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [sortBy,     setSortBy]     = useState('newest');
  const [page,       setPage]       = useState(1);

  const { data: categoriesData } = useQuery({
    queryKey: ['catalog-categories'],
    queryFn: () => getProductCategoriesFn(''),
    staleTime: 300_000,
  });
  const categories: any[] = Array.isArray(categoriesData) ? categoriesData : categoriesData?.data || [];

  const { data: fetchRes, isLoading } = useQuery({
    queryKey: ['client-catalog', search, categoryId, sortBy, page],
    queryFn: () =>
      getClientProductsFn({
        search:     search     || undefined,
        categoryId: categoryId || undefined,
        sort:       sortBy !== 'newest' ? sortBy : undefined,
        page,
        limit: LIMIT,
      } as any),
    staleTime: 30_000,
  });

  const { items, addItem, removeItem, updateQuantity } = useCartStore();

  const catalogData     = fetchRes?.data || fetchRes || {};
  const products: any[] = catalogData.products || catalogData.items || [];
  const total: number   = catalogData.total || catalogData.pagination?.total || 0;
  const totalPages      = Math.ceil(total / LIMIT);

  const handleAddToCart = (product: any) => {
    addItem({
      ...product,
      quantity:      1,
      productId:     product.id,
      distributorId: product.distributorId || product.distributor?.id || '',
    });
    toast.success(`${product.name} savatga qo'shildi`);
  };

  const hasFilters = search || categoryId || sortBy !== 'newest';

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">Mahsulotlar Katalogi</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Hamkorlarimiz mahsulotlarini ko'ring va savatga qo'shing.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Mahsulot yoki SKU qidirish..."
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all duration-200"
              />
              {search && (
                <button
                  onClick={() => { setSearch(''); setPage(1); }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex gap-3">
              {/* Category */}
              <div className="relative flex-1 min-w-40">
                <SlidersHorizontal className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={categoryId}
                  onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
                  className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all duration-200"
                >
                  <option value="">Kategoriyalar</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                className="flex-1 min-w-32 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all duration-200"
              >
                <option value="newest">Yangi</option>
                <option value="price_asc">Arzonroq</option>
                <option value="price_desc">Qimmatroq</option>
              </select>
            </div>
          </div>

          {hasFilters && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <p className="text-xs text-slate-400">Filtrlar faol</p>
              <button
                onClick={() => { setSearch(''); setCategoryId(''); setSortBy('newest'); setPage(1); }}
                className="text-xs font-semibold text-brand-green hover:text-[#156347] transition-colors"
              >
                Tozalash
              </button>
            </div>
          )}
        </div>

        {/* Products */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, n) => (
              <div key={n} className="h-64 bg-white animate-pulse rounded-2xl border border-slate-200" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              <ShoppingBag className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-600 mb-1">Mahsulotlar topilmadi</p>
            <p className="text-xs text-slate-400">Boshqa so'z bilan qidiring yoki filtrlarni tozalang.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.map((product: any) => {
                const cartItem = items.find((i) => i.productId === product.id);
                return (
                  <ProductCard
                    key={product.id}
                    product={{
                      ...product,
                      price:    product.wholesalePrice || product.price,
                      category: product.category?.name || product.category || '',
                      imageUrl: product.imageUrl || product.images?.[0]?.url || product.images?.[0] || null,
                    }}
                    type="STORE_OWNER"
                    onAddCart={handleAddToCart}
                    onRemoveCart={removeItem}
                    onUpdateQuantity={updateQuantity}
                    cartQuantity={cartItem?.quantity}
                  />
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-10 h-10 p-0 rounded-xl border-slate-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-slate-500">
                  <span className="font-semibold text-[#0F172A]">{page}</span> / {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-10 h-10 p-0 rounded-xl border-slate-200"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CatalogPage;
