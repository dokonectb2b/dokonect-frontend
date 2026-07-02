import { useRef, useState } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadSingleFileFn } from '../../api/upload.api';

interface PhotoProofCaptureProps {
  value: string | null;
  onChange: (url: string | null) => void;
}

export function PhotoProofCapture({ value, onChange }: PhotoProofCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Rasm 5MB dan katta bo\'lmasligi kerak');
      return;
    }
    setUploading(true);
    try {
      const url = await uploadSingleFileFn(file);
      onChange(url);
    } catch {
      toast.error('Rasm yuklashda xatolik');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <p className="text-slate-400 text-xs mb-2">Yetkazish isboti (foto)</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      {value ? (
        <div className="relative w-28 h-28">
          <img src={value} alt="Yetkazish isboti" className="w-28 h-28 object-cover rounded-lg" />
          <button
            onClick={() => onChange(null)}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-28 h-28 rounded-lg border-2 border-dashed border-slate-600 flex flex-col items-center justify-center gap-1.5 text-slate-400"
        >
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
          <span className="text-[10px]">{uploading ? 'Yuklanmoqda...' : 'Surat olish'}</span>
        </button>
      )}
    </div>
  );
}
