import React from 'react';

interface PawtopiaLogoProps {
  variant?: 'full' | 'compact' | 'icon' | 'badge' | 'graphic';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  inverted?: boolean;
}

export const PawtopiaLogo: React.FC<PawtopiaLogoProps> = ({
  variant = 'compact',
  size = 'md',
  className = '',
  inverted = false,
}) => {
  const logoSrc = '/assets/aistudio/paw_a87483f4.png';

  const emblemSizes = {
    sm: { box: 'w-8 h-8', text: 'text-lg', sub: 'text-[9px]' },
    md: { box: 'w-11 h-11', text: 'text-2xl', sub: 'text-[10px]' },
    lg: { box: 'w-16 h-16', text: 'text-3xl', sub: 'text-xs' },
    xl: { box: 'w-24 h-24', text: 'text-4xl', sub: 'text-sm' },
  };

  const currentSize = emblemSizes[size] || emblemSizes.md;

  // Renders the exact user-uploaded hexagon paw emblem cleanly isolated from the lower text
  const LogoEmblem = (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl overflow-hidden bg-[#FAF6EE] dark:bg-[#FAF6EE] shadow-xs border border-[#0B3E39]/20 flex-shrink-0 transition-transform duration-200 hover:scale-105 ${currentSize.box} ${
        inverted ? 'ring-2 ring-teal-400/40' : ''
      }`}
    >
      <img
        src={logoSrc}
        alt="Pawtopia Emblem"
        className="w-full h-full object-cover select-none pointer-events-none"
        style={{
          transform: 'scale(1.85)',
          transformOrigin: '50% 41%',
        }}
      />
    </div>
  );

  // Directly display the exact user-uploaded graphic
  if (variant === 'graphic') {
    return (
      <div className={`inline-flex flex-col items-center justify-center ${className}`}>
        <img
          src={logoSrc}
          alt="Pawtopia Brand Logo"
          className="w-auto max-h-24 object-contain rounded-2xl shadow-sm border border-[#0B3E39]/15 bg-[#FAF6EE]"
        />
      </div>
    );
  }

  if (variant === 'icon') {
    return <div className={`inline-flex items-center ${className}`}>{LogoEmblem}</div>;
  }

  if (variant === 'badge') {
    return (
      <div className={`inline-flex flex-col items-center p-3 rounded-2xl bg-[#FAF6EE] border border-[#0B3E39]/20 shadow-md ${className}`}>
        <img src={logoSrc} alt="Pawtopia Full Logo" className="w-48 h-auto object-contain rounded-xl" />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {LogoEmblem}
      <div className="flex flex-col text-left">
        <span
          className={`font-black tracking-wider leading-none transition-colors duration-200 ${
            currentSize.text
          } ${
            inverted
              ? 'text-[#FAF6EE]'
              : 'text-[#0B3E39] dark:text-[#FAF6EE]'
          }`}
          style={{ letterSpacing: '0.08em' }}
        >
          PAWTOPIA
        </span>
        {variant === 'full' && (
          <span
            className={`font-bold tracking-widest uppercase mt-0.5 transition-colors duration-200 ${
              currentSize.sub
            } ${
              inverted
                ? 'text-[#FAF6EE]/80'
                : 'text-[#0B3E39]/80 dark:text-teal-200/90'
            }`}
            style={{ letterSpacing: '0.22em' }}
          >
            A Better World For Every Paw
          </span>
        )}
      </div>
    </div>
  );
};
