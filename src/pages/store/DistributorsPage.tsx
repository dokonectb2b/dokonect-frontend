import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SafeImage } from '../../components/ui/SafeImage';
import {
  Search, MapPin, Star, CheckCircle2, Phone,
  Package, Info, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getClientDistributorsFn } from '../../api/client.api';

const DistributorsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('');
  const [page,   setPage]   = useState(1);

  const { data: distRes, isLoading } = useQuery({
    queryKey: ['client-distributors', search, region, page],
    queryFn: () => getClientDistributorsFn({
      search: search || undefined,
      region: region || undefined,
      page,
      limit: 20,
    }),
    staleTime: 30_000,
    retry: false,
  });

  const distributors: any[] = distRes?.data || distRes?.distributors || [];
  const totalPages = distRes?.pagination?.totalPages ?? 1;

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#0F172A]">Distribyutorlar</h1>
            <p className="text-sm text-slate-500 mt-0.5">Hamkorlar toping va mahsulotlarini ko'ring.</p>
          </div>
          {distributors.length > 0 && (
            <div className="flex items-center gap-1.5 bg-green-50 text-brand-green px-3 py-1.5 rounded-xl text-xs font-semibold border border-green-100">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {distributors.length} ta distribyutor
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Nomi bo'yicha qidirish..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all duration-200"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="sm:w-56 relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all duration-200"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              <option value="">Barcha hududlar</option>
              <option value="Toshkent">Toshkent</option>
              <option value="Samarqand">Samarqand</option>
              <option value="Andijon">Andijon</option>
              <option value="Namangan">Namangan</option>
              <option value="Farg'ona">Farg'ona</option>
              <option value="Buxoro">Buxoro</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-56 bg-white animate-pulse rounded-2xl border border-slate-200" />
            ))}
          </div>
        ) : distributors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <Search className="w-10 h-10 text-slate-200 mb-4" />
            <p className="text-sm font-semibold text-slate-600 mb-1">Distribyutorlar topilmadi</p>
            <p className="text-xs text-slate-400">Boshqa hudud yoki qidiruv so'zi bilan urinib ko'ring</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {distributors.map((dist: any) => (
              <div
                key={dist.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden group"
              >
                <div className="p-5">
                  {/* Logo + Verified */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 overflow-hidden">
                      {dist.logo ? (
                        <SafeImage
                          src={dist.logo}
                          alt={dist.companyName}
                          fallback="company"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xl font-bold text-brand-green">
                          {dist.companyName?.charAt(0) || 'D'}
                        </span>
                      )}
                    </div>
                    {dist.isVerified && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-brand-green bg-green-50 px-2 py-1 rounded-lg border border-green-100">
                        <CheckCircle2 className="w-3 h-3" /> Tasdiqlangan
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="text-base font-bold text-[#0F172A] mb-1 group-hover:text-brand-green transition-colors duration-200">
                    {dist.companyName}
                  </h3>

                  {/* Rating + Region */}
                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="font-medium">{dist.rating || '0.0'}</span>
                    </div>
                    {dist.region && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{dist.region}</span>
                      </div>
                    )}
                  </div>

                  {/* Contact */}
                  {dist.phone && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 bg-slate-50 rounded-xl px-3 py-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{dist.phone}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/store/catalog?distributorId=${dist.id}`)}
                      className="flex-1 py-2.5 bg-brand-green text-white rounded-xl text-xs font-semibold hover:bg-[#156347] transition-colors duration-200 flex items-center justify-center gap-1.5"
                    >
                      <Package className="w-3.5 h-3.5" /> Mahsulotlar
                    </button>
                    <button
                      onClick={() => navigate(`/store/distributors/${dist.id}`)}
                      className="py-2.5 px-3.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors duration-200 flex items-center justify-center"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-500 hover:text-slate-800 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronLeft className="w-4 h-4" /> Oldingi
            </button>
            <span className="text-sm text-slate-500">
              <span className="font-semibold text-[#0F172A]">{page}</span> / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-500 hover:text-slate-800 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              Keyingi <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DistributorsPage;
