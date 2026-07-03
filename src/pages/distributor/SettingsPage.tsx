import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api';   // ← to'g'ri import
import { User, Bell, Shield, Globe, Building2, Save, X, Mail, Phone, MapPin, Truck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security'>('profile');
  const [commission, setCommission] = useState('10');

  const { data: profileRes, isLoading } = useQuery({
    queryKey: ['distributor-profile'],
    queryFn: () => api.get('/api/distributor/profile').then(r => r.data?.data || r.data || {}),
    staleTime: 60_000 * 5,
    retry: false,
  });

  const profile = profileRes || {};

  // Profil yuklangач komissiyani to'ldirish
  useEffect(() => {
    const c = profile?.distributor?.driverCommission;
    if (c !== undefined && c !== null) setCommission(String(c));
  }, [profile?.distributor?.driverCommission]);

  const { mutate: saveCommission, isPending: savingCommission } = useMutation({
    mutationFn: () => api.patch('/api/distributor/profile', { driverCommission: Number(commission) }),
    onSuccess: () => {
      toast.success('Komissiya saqlandi!');
      queryClient.invalidateQueries({ queryKey: ['distributor-profile'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Xatolik'),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500" />
    </div>
  );

  return (
    <div className="fade-in space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 underline decoration-sky-500 underline-offset-8">
            Tizim Sozlamalari
          </h1>
          <p className="text-slate-500 text-sm mt-1">Profilingiz va bildirishnomalarni boshqaring.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="px-5 font-bold text-sm uppercase tracking-widest">
            <X className="w-4 h-4 mr-2" /> Bekor qilish
          </Button>
          <Button onClick={() => toast.success('Sozlamalar saqlandi!')} className="px-5 font-bold text-sm bg-sky-500 text-white hover:bg-sky-600 shadow-lg shadow-sky-500/20 uppercase tracking-widest">
            <Save className="w-4 h-4 mr-2" /> Saqlash
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Nav tabs */}
        <aside className="w-full md:w-64 space-y-1">
          {[
            { key: 'profile',       label: 'Kompaniya Profil',   icon: Building2 },
            { key: 'notifications', label: 'Bildirishnomalar',   icon: Bell      },
            { key: 'security',      label: 'Xavfsizlik',         icon: Shield    },
          ].map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === key ? 'bg-sky-50 text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </aside>

        {/* Content */}
        <main className="flex-1 space-y-6">

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-tighter">
                  <User className="w-5 h-5 text-sky-500" /> Shaxsiy Ma'lumotlar
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Kompaniya Nomi"    defaultValue={profile.companyName || user?.name} leftIcon={<Building2 className="w-4 h-4" />} />
                  <Input label="Distribyutor ID"   defaultValue={`DIST-${(profile.id || user?.distributorId || '').slice(0,8)}`} leftIcon={<Shield className="w-4 h-4" />} readOnly />
                  <Input label="Email"             defaultValue={profile.email   || user?.email} leftIcon={<Mail className="w-4 h-4" />} />
                  <Input label="Telefon"           defaultValue={profile.phone   || user?.phone} leftIcon={<Phone className="w-4 h-4" />} />
                </div>
              </section>

              <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6 uppercase tracking-tighter">Manzil va Hudud</h3>
                <div className="grid grid-cols-1 gap-4">
                  <Input label="Kompaniya Manzili" defaultValue={profile.address} leftIcon={<MapPin className="w-4 h-4" />} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Website" placeholder="https://company.uz" leftIcon={<Globe className="w-4 h-4" />} />
                    <div className="space-y-1.5">
                      <label className="block text-sm font-bold text-slate-700">Asosiy Hudud</label>
                      <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-500 transition-all">
                        <option>Toshkent shahar</option>
                        <option>Samarqand viloyati</option>
                        <option>Farg'ona viloyati</option>
                        <option>Andijon viloyati</option>
                        <option>Namangan viloyati</option>
                      </select>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2 uppercase tracking-tighter">
                  <Truck className="w-5 h-5 text-sky-500" /> Haydovchi Komissiyasi
                </h3>
                <p className="text-sm text-slate-500 mb-5">
                  Har bir yetkazilgan buyurtma summasidan haydovchiga to'lanadigan foiz.
                  Masalan 10% — 20 000 so'mlik buyurtmada haydovchi 2 000 so'm oladi.
                </p>
                <div className="flex items-end gap-3 max-w-sm">
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Komissiya foizi (%)</label>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step="0.5"
                        value={commission}
                        onChange={(e) => setCommission(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-500 transition-all pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">%</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => saveCommission()}
                    disabled={savingCommission || commission === '' || Number(commission) < 0 || Number(commission) > 100}
                    className="bg-sky-500 text-white hover:bg-sky-600 font-bold px-5 py-2.5"
                  >
                    <Save className="w-4 h-4 mr-2" /> {savingCommission ? 'Saqlanmoqda...' : 'Saqlash'}
                  </Button>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'notifications' && (
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm divide-y divide-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-6 uppercase underline decoration-indigo-500 decoration-2 underline-offset-8 tracking-tighter">
                Bildirishnoma Sozlamalari
              </h3>
              {[
                { label: 'Yangi Buyurtmalar',       desc: 'Yangi buyurtma kelganda xabar berish',         on: true  },
                { label: 'Sklad Ogohlantirishlari', desc: 'Mahsulot kam qolganda bildirishnoma',          on: false },
                { label: 'Chat Xabarlari',          desc: 'Mijozlar xabar yozganda realtime bildirishnoma', on: true  },
              ].map(({ label, desc, on }) => (
                <div key={label} className="py-5 flex items-center justify-between group">
                  <div>
                    <p className="font-bold text-slate-900 uppercase text-sm tracking-tight">{label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                  </div>
                  <div className={`w-12 h-6 ${on ? 'bg-sky-500' : 'bg-slate-200'} rounded-full relative cursor-pointer shadow-inner`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all ${on ? 'right-1' : 'left-1'}`} />
                  </div>
                </div>
              ))}
            </section>
          )}

          {activeTab === 'security' && (
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6 underline underline-offset-8 decoration-red-500 uppercase tracking-tighter">
                Xavfsizlik va Parol
              </h3>
              <div className="space-y-4">
                <Input label="Joriy parol"            type="password" placeholder="••••••••" />
                <Input label="Yangi parol"            type="password" placeholder="••••••••" />
                <Input label="Yangi parolni tasdiqlang" type="password" placeholder="••••••••" />
                <Button
                  onClick={() => toast.success('Parol yangilandi!')}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 mt-4 uppercase tracking-widest text-xs"
                >
                  Parolni Yangilash
                </Button>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;