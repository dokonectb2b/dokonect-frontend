interface LogoProps {
  size?: number;
  variant?: 'full' | 'icon';
  className?: string;
  dark?: boolean;
}

const DokonectLogo = ({ size = 40, variant = 'full', className = '', dark = false }: LogoProps) => {
  const gid = 'dg1';
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4F8EF7" />
            <stop offset="100%" stopColor="#6C3DE8" />
          </linearGradient>
        </defs>
        {/* D outer shape */}
        <path d="M18 12 H46 C68 12 82 28 82 50 C82 72 68 88 46 88 H18 Z" fill={`url(#${gid})`} />
        {/* White inner cutout */}
        <path d="M30 26 H44 C58 26 68 37 68 50 C68 63 58 74 44 74 H30 Z" fill="white" />
        {/* 3 network nodes */}
        <circle cx="43" cy="37" r="5.5" fill={`url(#${gid})`} />
        <circle cx="57" cy="50" r="5.5" fill={`url(#${gid})`} />
        <circle cx="43" cy="63" r="5.5" fill={`url(#${gid})`} />
        {/* Connecting lines */}
        <line x1="43" y1="37" x2="57" y2="50" stroke={`url(#${gid})`} strokeWidth="3" strokeLinecap="round" />
        <line x1="57" y1="50" x2="43" y2="63" stroke={`url(#${gid})`} strokeWidth="3" strokeLinecap="round" />
      </svg>
      {variant === 'full' && (
        <span style={{
          fontWeight: 800,
          fontSize: size * 0.52,
          letterSpacing: '-0.02em',
          lineHeight: 1,
          color: dark ? '#0D1526' : 'inherit',
          fontFamily: "'DM Sans', 'Outfit', 'Inter', sans-serif",
        }}>
          Dokonect
        </span>
      )}
    </div>
  );
};

export default DokonectLogo;