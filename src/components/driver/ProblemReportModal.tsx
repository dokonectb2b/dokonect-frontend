import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ProblemReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
  isSubmitting?: boolean;
}

export function ProblemReportModal({ isOpen, onClose, onSubmit, isSubmitting }: ProblemReportModalProps) {
  const [text, setText] = useState('');

  if (!isOpen) return null;

  function handleSubmit() {
    if (!text.trim()) return;
    onSubmit(text.trim());
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-[400px] tg-glass rounded-3xl p-4 mb-4 sm:mb-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-rose-400">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="font-bold text-white">Muammo xabari</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Muammoni tasvirlab bering..."
          rows={4}
          className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-sm text-white placeholder:text-slate-500 outline-none resize-none focus:border-rose-400/40 transition-colors"
        />
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || isSubmitting}
          className="w-full mt-3 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold text-sm shadow-lg shadow-rose-900/30 active:scale-[0.98] transition-all disabled:opacity-40 disabled:shadow-none"
        >
          {isSubmitting ? 'Yuborilmoqda...' : 'Yuborish'}
        </button>
      </div>
    </div>
  );
}
