interface LogoProps {
  size?: number;
  variant?: "full" | "icon";
  className?: string;
  dark?: boolean;
}

const DokonectLogo = ({
  size = 40,
  variant = "full",
  className = "",
  dark: _dark = false,
}: LogoProps) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-sm"
      >
        <defs>
          <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1A7F5A" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
        </defs>
        {/* Main D Shape */}
        <path
          d="M20 20C20 20 50 20 65 20C80 20 90 35 90 50C90 65 80 80 65 80C50 80 20 80 20 80V20Z"
          fill="url(#logo-grad)"
        />
        {/* Inner white shape */}
        <path
          d="M32 32H50C60 32 68 40 68 50C68 60 60 68 50 68H32V32Z"
          fill="white"
        />
        {/* Connective nodes */}
        <circle cx="45" cy="40" r="5" fill="url(#logo-grad)" />
        <circle cx="58" cy="50" r="5" fill="url(#logo-grad)" />
        <circle cx="45" cy="60" r="5" fill="url(#logo-grad)" />
        {/* Connective lines */}
        <line
          x1="45"
          y1="40"
          x2="58"
          y2="50"
          stroke="url(#logo-grad)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="58"
          y1="50"
          x2="45"
          y2="60"
          stroke="url(#logo-grad)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {variant === "full" && (
        <span
          className={`font-extrabold tracking-tight text-brand-text`}
          style={{ fontSize: size * 0.6 }}
        >
          Doko<span className="text-brand-green">nect</span>
        </span>
      )}
    </div>
  );
};

export default DokonectLogo;
