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
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate-900/70 px-4">
      <div className="w-full max-w-[400px] bg-slate-800 rounded-2xl p-4 mb-4 sm:mb-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-red-400">
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
          className="w-full bg-slate-700 rounded-xl p-3 text-sm text-white placeholder:text-slate-500 outline-none resize-none"
        />
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || isSubmitting}
          className="w-full mt-3 py-3 rounded-xl bg-red-500 text-white font-bold text-sm disabled:opacity-40"
        >
          {isSubmitting ? 'Yuborilmoqda...' : 'Yuborish'}
        </button>
      </div>
    </div>
  );
}
