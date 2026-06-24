import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import {
  Mail, Lock, Store, Briefcase, User, Phone, MapPin,
  ArrowRight, Zap, Eye, EyeOff, AlertCircle, RotateCcw, ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendOtpFn, verifyRegisterFn } from '../../api/auth.api';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { cn } from '../../components/ui/Button';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  name:     z.string().min(2, 'Kamida 2 belgi'),
  email:    z.string().email({ message: "Noto'g'ri email" }),
  password: z.string().min(6, 'Kamida 6 belgi'),
  role:     z.enum(['CLIENT', 'DISTRIBUTOR']),
  address:  z.string().min(5, 'Manzilni kiriting'),
  phone:    z.string().min(9, 'Telefon raqam kiriting'),
});
type RegisterForm = z.infer<typeof registerSchema>;

const RESEND_TIMEOUT = 60;
const BOT_USERNAME   = 'dokonect_register_bot';

const RegisterPage = () => {
  const navigate       = useNavigate();
  const { setAuth }    = useAuthStore();
  const [searchParams] = useSearchParams();

  const [step,         setStep]         = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg,     setErrorMsg]     = useState('');
  const [resendTimer,  setResendTimer]  = useState(0);
  const [otpCode,      setOtpCode]      = useState('');
  const [botOpened,    setBotOpened]    = useState(false);

  const { register, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'DISTRIBUTOR', email: searchParams.get('email') ?? '' },
  });

  const selectedRole = watch('role');
  const phone        = watch('phone');

  const startResendTimer = () => {
    setResendTimer(RESEND_TIMEOUT);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 1: faqat validatsiya + Telegram botni ochish
  const handleStep1Submit = () => {
    setErrorMsg('');
    window.open(`https://t.me/${BOT_USERNAME}?start=reg`, '_blank');
    setBotOpened(true);
    setStep(2);
  };

  // Step 2: OTP + Register
  const { mutate: verifyRegister, isPending: isVerifying } = useMutation({
    mutationFn: () => {
      const formData = getValues();
      const payload: any = {
        name:     formData.name,
        email:    formData.email,
        phone:    formData.phone,
        password: formData.password,
        address:  formData.address,
        role:     formData.role,
        code:     otpCode,
      };
      if (formData.role === 'DISTRIBUTOR') payload.companyName = formData.name;
      else                                 payload.storeName   = formData.name;
      return verifyRegisterFn(payload);
    },
    onSuccess: (data) => {
      setErrorMsg('');
      const user   = data.user   ?? data.data?.user   ?? data.data;
      const accTok = data.token  ?? data.accessToken  ?? data.data?.token ?? data.data?.accessToken ?? '';
      const refTok = data.refreshToken ?? data.data?.refreshToken ?? '';

      if (!user?.id) { setErrorMsg("Foydalanuvchi ma'lumotlari topilmadi"); return; }

      setAuth(
        {
          id:            user.id,
          name:          user.name,
          email:         user.email         ?? '',
          phone:         user.phone         ?? '',
          role:          user.role,
          distributorId: user.distributorId ?? user.distributor?.id ?? undefined,
          clientId:      user.clientId      ?? user.client?.id      ?? undefined,
          driverId:      user.driverId      ?? user.driver?.id      ?? undefined,
        },
        accTok,
        refTok,
      );

      toast.success("Muvaffaqiyatli ro'yxatdan o'tdingiz!");

      if (user.role === 'CLIENT' || user.role === 'STORE') navigate('/store/dashboard',       { replace: true });
      else if (user.role === 'DISTRIBUTOR')                navigate('/distributor/dashboard', { replace: true });
      else                                                  navigate('/',                       { replace: true });
    },
    onError: (error: any) => {
      const data = error.response?.data;
      const msg  = Array.isArray(data?.message) ? data.message[0] : data?.message || 'Xatolik yuz berdi';
      setErrorMsg(msg);
    },
  });

  const handleResend = () => {
    if (resendTimer > 0) return;
    const formPhone = getValues('phone');
    sendOtpFn(formPhone)
      .then(() => {
        startResendTimer();
        setErrorMsg('');
        toast.success('Kod qayta yuborildi');
      })
      .catch((err: any) => {
        const msg = err.response?.data?.message || 'Xatolik yuz berdi';
        setErrorMsg(Array.isArray(msg) ? msg[0] : msg);
      });
  };

  const openBot = () => {
    window.open(`https://t.me/${BOT_USERNAME}?start=reg`, '_blank');
    setBotOpened(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 py-10">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-800 text-lg">
            Doko<span className="text-violet-600">nect</span>
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-8">

          {/* Steps indicator */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2].map((s) => (
              <div key={s} className={cn(
                'h-1.5 rounded-full flex-1 transition-all duration-300',
                step >= s ? 'bg-violet-600' : 'bg-slate-200',
              )} />
            ))}
          </div>

          <AnimatePresence mode="wait">

            {/* ── STEP 1: Ma'lumotlar ── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-6">
                  <h1 className="text-xl font-bold text-slate-900 mb-1">Akkaunt yarating</h1>
                  <p className="text-slate-500 text-sm">Ma'lumotlarni to'ldiring</p>
                </div>

                <form onSubmit={handleSubmit(handleStep1Submit)} className="space-y-4">

                  {/* Role */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Rolingiz
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'DISTRIBUTOR', icon: Briefcase, label: 'Distribyutor' },
                        { value: 'CLIENT',      icon: Store,     label: "Do'kon egasi" },
                      ].map(({ value, icon: Icon, label }) => (
                        <button key={value} type="button" onClick={() => setValue('role', value as any)}
                          className={cn(
                            'flex items-center gap-3 p-3.5 rounded-xl border text-sm font-medium transition-all',
                            selectedRole === value
                              ? 'border-violet-500 bg-violet-50 text-violet-700 shadow-sm'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50',
                          )}>
                          <div className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                            selectedRole === value ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-500',
                          )}>
                            <Icon className="w-4 h-4" />
                          </div>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label={selectedRole === 'DISTRIBUTOR' ? 'Kompaniya nomi' : "Do'kon nomi"}
                      placeholder={selectedRole === 'DISTRIBUTOR' ? 'Dokonect MChJ' : "Baraka Do'koni"}
                      leftIcon={<User className="w-4 h-4" />}
                      error={errors.name?.message}
                      {...register('name')}
                    />
                    <Input
                      label="Email" type="email" placeholder="email@example.com"
                      leftIcon={<Mail className="w-4 h-4" />}
                      error={errors.email?.message}
                      {...register('email')}
                    />
                    <Input
                      label="Telefon" placeholder="+998901234567"
                      leftIcon={<Phone className="w-4 h-4" />}
                      error={errors.phone?.message}
                      {...register('phone')}
                    />
                    <Input
                      label="Manzil" placeholder="Toshkent, Chilonzor"
                      leftIcon={<MapPin className="w-4 h-4" />}
                      error={errors.address?.message}
                      {...register('address')}
                    />
                  </div>

                  {/* Parol */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">Parol</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...register('password')}
                        className={cn(
                          'w-full pl-9 pr-10 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all',
                          errors.password ? 'border-red-400' : 'border-slate-200',
                        )}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
                  </div>

                  {errorMsg && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-red-600 font-medium">{errorMsg}</p>
                    </motion.div>
                  )}

                  <Button type="submit" className="w-full" size="lg">
                    Keyingi <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </form>
              </motion.div>
            )}

            {/* ── STEP 2: Telegram + OTP ── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-5">
                  <h1 className="text-xl font-bold text-slate-900 mb-1">Telefon tasdiqlash</h1>
                  <p className="text-slate-500 text-sm">
                    {phone && (
                      <span className="font-semibold text-slate-700">{phone}</span>
                    )}
                    {phone && ' · '}
                    <button
                      type="button"
                      onClick={() => { setStep(1); setOtpCode(''); setErrorMsg(''); setBotOpened(false); }}
                      className="text-violet-600 hover:underline text-xs"
                    >
                      O'zgartirish
                    </button>
                  </p>
                </div>

                <div className="space-y-4">

                  {/* Telegram bot card */}
                  <div className="rounded-2xl border-2 border-blue-100 bg-linear-to-br from-blue-50 to-sky-50 p-5">
                    <div className="flex items-center gap-3 mb-3">
                      {/* Telegram icon */}
                      <div className="w-10 h-10 rounded-xl bg-[#2AABEE] flex items-center justify-center shrink-0 shadow-sm">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">Telegram bot orqali tasdiqlang</p>
                        <p className="text-xs text-slate-500">@{BOT_USERNAME}</p>
                      </div>
                    </div>

                    {/* Steps */}
                    <ol className="space-y-2 mb-4 text-sm text-slate-600">
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-700 text-xs flex items-center justify-center shrink-0 font-bold mt-0.5">1</span>
                        Quyidagi tugmani bosib botni oching
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-700 text-xs flex items-center justify-center shrink-0 font-bold mt-0.5">2</span>
                        Botda <span className="font-semibold mx-1">"📱 Telefon raqamni ulashish"</span> tugmasini bosing
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-700 text-xs flex items-center justify-center shrink-0 font-bold mt-0.5">3</span>
                        Bot avtomatik 6 xonali kod yuboradi
                      </li>
                    </ol>

                    <button
                      type="button"
                      onClick={openBot}
                      className="w-full flex items-center justify-center gap-2 bg-[#2AABEE] hover:bg-[#229ED9] text-white font-semibold py-3 rounded-xl transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {botOpened ? 'Botni qayta ochish' : 'Telegram botni ochish'}
                    </button>
                  </div>

                  {/* OTP input */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">
                      Botdan kelgan kod
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => {
                        setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                        setErrorMsg('');
                      }}
                      placeholder="● ● ● ● ● ●"
                      className="w-full text-center text-2xl font-bold tracking-[0.5rem] py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder:text-slate-300 placeholder:tracking-widest"
                    />
                  </div>

                  {errorMsg && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-red-600 font-medium">{errorMsg}</p>
                    </motion.div>
                  )}

                  <Button
                    type="button"
                    onClick={() => { setErrorMsg(''); verifyRegister(); }}
                    isLoading={isVerifying}
                    disabled={otpCode.length < 6}
                    className="w-full"
                    size="lg"
                  >
                    {!isVerifying && <>Ro'yxatdan o'tish <ArrowRight className="w-4 h-4 ml-1.5" /></>}
                  </Button>

                  {/* Resend */}
                  <div className="text-center">
                    {resendTimer > 0 ? (
                      <p className="text-sm text-slate-400">
                        Qayta yuborish: <span className="font-semibold text-slate-600">{resendTimer}s</span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResend}
                        className="inline-flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-700 font-medium"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Kodni qayta yuborish
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="mt-5 text-center text-sm text-slate-500">
            Allaqachon a'zomisiz?{' '}
            <Link to="/login" className="text-violet-600 font-semibold hover:text-violet-700">
              Kirish
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
