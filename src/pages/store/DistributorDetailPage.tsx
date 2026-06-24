import { useParams, useNavigate } from 'react-router-dom';
import { SafeImage } from '../../components/ui/SafeImage';
import { useQuery } from '@tanstack/react-query';
import { getClientDistributorByIdFn } from '../../api/client.api';
import {
  ArrowLeft, MapPin, Star, Phone, Package,
  CheckCircle2, ShoppingBag, Building2, Tag,
} from 'lucide-react';

const DistributorDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: dist, isLoading } = useQuery({
    queryKey: ['distributor-detail', id],
    queryFn: () => getClientDistributorByIdFn(id!),
    enabled: !!id,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="bg-[#F8FAFC] min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
          <div className="h-48 bg-white animate-pulse rounded-2xl border border-slate-200" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-24 bg-white animate-pulse rounded-2xl border border-slate-200" />
            ))}
          </div>
          <div className="h-64 bg-white animate-pulse rounded-2xl border border-slate-200" />
        </div>
      </div>
    );
  }

  if (!dist) {
    return (
      <div className="bg-[#F8FAFC] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-600 mb-4">Distribyutor topilmadi</p>
          <button
            onClick={() => navigate(-1)}
            className="text-sm font-semibold text-brand-green hover:text-[#156347] transition-colors"
          >
            ← Orqaga
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#0F172A] transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" /> Distribyutorlar
        </button>

        {/* Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-start gap-5">
            {/* Logo */}
            <div className="w-20 h-20 shrink-0 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 overflow-hidden">
              {dist.logo ? (
                <SafeImage
                  src={dist.logo}
                  alt={dist.companyName}
                  fallback="company"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-brand-green">
                  {dist.companyName?.charAt(0) || 'D'}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1.5">
                <h1 className="text-xl font-bold text-[#0F172A]">{dist.companyName}</h1>
                {dist.isVerified && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-brand-green bg-green-50 px-2.5 py-1 rounded-lg border border-green-100">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Tasdiqlangan
                  </span>
                )}
              </div>

              <div className="flex items-center flex-wrap gap-4 text-sm text-slate-500 mb-3">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="font-medium">{dist.rating || '0.0'}</span>
                </div>
                {dist.region && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    <span>{dist.region}</span>
                  </div>
                )}
                {dist.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4" />
                    <span>{dist.phone}</span>
                  </div>
                )}
              </div>

              {dist.address && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Building2 className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>{dist.address}</span>
                </div>
              )}

              {dist.description && (
                <p className="text-sm text-slate-600 leading-relaxed mt-3">{dist.description}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 flex gap-3">
            <button
              onClick={() => navigate(`/store/catalog?distributorId=${dist.id}`)}
              className="flex-1 py-2.5 bg-brand-green text-white rounded-xl text-sm font-semibold hover:bg-[#156347] transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Package className="w-4 h-4" /> Mahsulotlar katalogi
            </button>
            <button
              onClick={() => navigate('/store/orders')}
              className="py-2.5 px-5 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors duration-200 flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" /> Buyurtmalar
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Mahsulotlar', value: dist.productsCount ?? 0, color: 'text-brand-green' },
            { label: 'Reyting',     value: Number(dist.rating || 0).toFixed(1), color: 'text-amber-500' },
            { label: 'Kategoriyalar', value: dist.categories?.length ?? 0, color: 'text-blue-500' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Categories */}
        {dist.categories?.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-[#0F172A] mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-brand-green" /> Kategoriyalar
            </h2>
            <div className="flex flex-wrap gap-2">
              {dist.categories.map((cat: any) => (
                <span
                  key={cat.id}
                  className="px-3 py-1.5 bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-medium"
                >
                  {cat.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Products */}
        {dist.products?.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-green" /> Mahsulotlar
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {dist.products.map((product: any) => {
                const cover = product.images?.[0]?.url;
                return (
                  <div
                    key={product.id}
                    className="cursor-pointer group"
                    onClick={() => navigate(`/store/catalog?distributorId=${dist.id}`)}
                  >
                    <div className="aspect-square rounded-xl overflow-hidden bg-slate-50 border border-slate-100 mb-2 group-hover:border-brand-green/30 transition-colors duration-200">
                      {cover ? (
                        <SafeImage
                          src={cover}
                          alt={product.name}
                          fallback="product"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-7 h-7 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-[#0F172A] truncate">{product.name}</p>
                    <p className="text-xs font-bold text-brand-green mt-0.5">
                      {product.wholesalePrice?.toLocaleString()} so'm
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DistributorDetailPage;
