import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Navigation, Check, Package, Truck, CheckCircle, AlertTriangle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { getDriverOrderFn, updateDriverOrderStatusFn } from '../../api/driver.api';
import { uploadSingleFileFn } from '../../api/upload.api';
import { PhotoProofCapture } from '../../components/driver/PhotoProofCapture';
import { SignaturePad } from '../../components/driver/SignaturePad';
import { ProblemReportModal } from '../../components/driver/ProblemReportModal';

type Step = 'PICKED' | 'IN_TRANSIT' | 'DELIVERED';

const STEPS: Array<{ key: Step; label: string; icon: any }> = [
  { key: 'PICKED',     label: 'Olib ketildi', icon: Package },
  { key: 'IN_TRANSIT', label: "Yo'lda",       icon: Truck },
  { key: 'DELIVERED',  label: 'Yetkazildi',   icon: CheckCircle },
];

async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
  const res  = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type });
}

export default function TgDriverDelivery() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate     = useNavigate();
  const queryClient  = useQueryClient();

  const [photoProofUrl, setPhotoProofUrl]       = useState<string | null>(null);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [problemModalOpen, setProblemModalOpen] = useState(false);

  const { data: orderRes, isLoading } = useQuery({
    queryKey: ['tg-driver-delivery', orderId],
    queryFn: () => getDriverOrderFn(orderId!),
    enabled: !!orderId,
  });

  const { mutate: updateStatus, isPending: statusPending } = useMutation({
    mutationFn: async (status: Step) => {
      if (status !== 'DELIVERED') {
        return updateDriverOrderStatusFn({ orderId: orderId!, status });
      }
      let signature: string | undefined;
      if (signatureDataUrl) {
        const file = await dataUrlToFile(signatureDataUrl, `signature-${orderId}.png`);
        signature  = await uploadSingleFileFn(file);
      }
      return updateDriverOrderStatusFn({
        orderId: orderId!,
        status,
        photoProof: photoProofUrl ?? undefined,
        signature,
      });
    },
    onSuccess: (_, status) => {
      queryClient.invalidateQueries({ queryKey: ['tg-driver-delivery', orderId] });
      queryClient.invalidateQueries({ queryKey: ['tg-driver-home'] });
      queryClient.invalidateQueries({ queryKey: ['tg-driver-orders'] });
      toast.success('Holat yangilandi');
      if (status === 'DELIVERED') {
        toast.success('Yetkazish yakunlandi! 🎉');
        setTimeout(() => navigate(`/driver/tg/orders/${orderId}/payment`, { replace: true }), 1500);
      }
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Xatolik'),
  });

  const { mutate: submitProblem, isPending: problemPending } = useMutation({
    mutationFn: (problemReport: string) =>
      updateDriverOrderStatusFn({ orderId: orderId!, status: order.status, problemReport }),
    onSuccess: () => {
      toast.success('Muammo xabari yuborildi');
      setProblemModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['tg-driver-delivery', orderId] });
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

  const order = orderRes?.data || orderRes;
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

  const deliveryAddr = typeof order.deliveryAddress === 'object'
    ? order.deliveryAddress?.street || order.deliveryAddress?.address || ''
    : order.deliveryAddress || '';

  const handleNavigate = () =>
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(deliveryAddr)}`);

  const handleCallClient = () => {
    const phone = order.client?.user?.phone;
    if (phone) window.location.href = `tel:${phone}`;
  };

  const currentIndex   = STEPS.findIndex((s) => s.key === order.status);
  const awaitingProof  = order.status === 'IN_TRANSIT';
  const proofComplete  = !!photoProofUrl && !!signatureDataUrl;

  return (
    <div className="text-white p-4 space-y-4">
      {/* Customer info */}
      <div className="bg-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-slate-400 text-xs">Mijoz</p>
            <p className="text-lg font-bold">{order.client?.user?.name}</p>
          </div>
          <button onClick={handleCallClient} className="p-3 bg-green-500 rounded-full">
            <Phone className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
          <p className="text-slate-300">{deliveryAddr}</p>
        </div>
        <button onClick={handleNavigate}
          className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 bg-sky-500/20 text-sky-400 rounded-xl text-sm font-semibold">
          <Navigation className="w-4 h-4" /> Xaritada ochish
        </button>
      </div>

      {/* Items */}
      <div className="bg-slate-800 rounded-xl p-4">
        <p className="text-slate-400 text-xs mb-3">Mahsulotlar</p>
        <div className="space-y-2">
          {(order.items || []).map((item: any, i: number) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-slate-300">{item.quantity}x {item.product?.name}</span>
              <span className="text-slate-400">{((item.quantity || 0) * (item.unitPrice || 0)).toLocaleString('uz-UZ')} so'm</span>
            </div>
          ))}
        </div>
        <div className="pt-3 mt-3 border-t border-slate-700 flex items-center justify-between font-bold text-sm">
          <span>Jami</span>
          <span>{(order.totalAmount || 0).toLocaleString('uz-UZ')} so'm</span>
        </div>
      </div>

      {/* Photo proof + signature, required before DELIVERED */}
      {awaitingProof && (
        <>
          <PhotoProofCapture value={photoProofUrl} onChange={setPhotoProofUrl} />
          <SignaturePad onChange={setSignatureDataUrl} />
        </>
      )}

      {/* Steps */}
      <div className="space-y-3">
        {STEPS.map((step, index) => {
          const Icon        = step.icon;
          const isCompleted = index < currentIndex;
          const isCurrent   = index === currentIndex;
          const isLastStep  = step.key === 'DELIVERED';
          const isDisabled  = index > currentIndex + 1 || index <= currentIndex - 1
            || statusPending || (isCurrent && isLastStep && !proofComplete);

          return (
            <motion.button
              key={step.key}
              whileTap={!isDisabled ? { scale: 0.98 } : {}}
              onClick={() => !isDisabled && !isCompleted && updateStatus(step.key)}
              disabled={isDisabled || isCompleted}
              className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                isCompleted ? 'bg-green-500 text-white'
                : isCurrent ? 'bg-sky-500 text-white shadow-lg disabled:opacity-50'
                : 'bg-slate-800 text-slate-500'
              }`}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20">
                {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold">{step.label}</p>
                {isCurrent && (
                  <p className="text-xs opacity-80">
                    {isLastStep && !proofComplete ? 'Foto va imzo talab qilinadi' : 'Bosing va tasdiqlang'}
                  </p>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Problem report */}
      <button
        onClick={() => setProblemModalOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors"
      >
        <AlertTriangle className="w-5 h-5" />
        Muammo xabari
      </button>

      <ProblemReportModal
        isOpen={problemModalOpen}
        onClose={() => setProblemModalOpen(false)}
        onSubmit={(text) => submitProblem(text)}
        isSubmitting={problemPending}
      />
    </div>
  );
}
