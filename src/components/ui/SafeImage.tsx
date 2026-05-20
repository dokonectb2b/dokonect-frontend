import React, { useState } from 'react';
import { Package, User, Building2 } from 'lucide-react';

type FallbackType = 'product' | 'avatar' | 'company';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: FallbackType;
  fallbackClassName?: string;
}

const FallbackIcon: React.FC<{ type: FallbackType; className?: string }> = ({ type, className }) => {
  const cls = className || 'w-10 h-10 text-slate-300';
  if (type === 'avatar') return <User className={cls} />;
  if (type === 'company') return <Building2 className={cls} />;
  return <Package className={cls} />;
};

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  fallback = 'product',
  fallbackClassName,
  className,
  ...props
}) => {
  const [error, setError] = useState(false);

  const isOldCloudinary = src?.includes('res.cloudinary.com');

  if (!src || error || isOldCloudinary) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 ${className || ''}`}>
        <FallbackIcon type={fallback} className={fallbackClassName} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  );
};
