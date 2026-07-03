import React from 'react';
import { motion } from 'framer-motion';

interface DriverStatusToggleProps {
  isOnline: boolean;
  onChange: (status: boolean) => void;
  disabled?: boolean;
}

export const DriverStatusToggle: React.FC<DriverStatusToggleProps> = ({
  isOnline,
  onChange,
  disabled = false,
}) => {
  return (
    <div className={`relative overflow-hidden flex items-center justify-between gap-4 p-4 rounded-3xl transition-colors tg-glass ${isOnline ? 'ring-1 ring-emerald-400/30' : ''}`}>
      {isOnline && <div className="absolute -left-8 -top-8 w-32 h-32 rounded-full bg-emerald-500/20 blur-2xl" />}
      <div className="relative">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 tg-live-dot' : 'bg-slate-500'}`} />
          <p className="text-base font-bold tracking-tight text-white">
            {isOnline ? 'Onlaynsiz' : 'Oflaynsiz'}
          </p>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          {isOnline ? 'Buyurtma qabul qilyapsiz' : 'Buyurtma olish uchun yoqing'}
        </p>
      </div>

      <motion.button
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        onClick={() => !disabled && onChange(!isOnline)}
        disabled={disabled}
        className={`relative w-[68px] h-9 rounded-full transition-colors shrink-0 ${
          isOnline ? 'bg-emerald-500' : 'bg-slate-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <motion.div
          animate={{ x: isOnline ? 34 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 left-1 w-7 h-7 bg-white rounded-full shadow-lg"
        />
      </motion.button>
    </div>
  );
};
