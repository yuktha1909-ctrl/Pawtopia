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
  const logoSrc = '/paw.png';

  const sizeClasses = {
    sm: {
      img: 'h-8 sm:h-9 w-auto',
      box: 'p-1',
      text: 'text-base sm:text-lg',
      sub: 'text-[8.5px] sm:text-[9.5px]',
    },
    md: {
      img: 'h-10 sm:h-11 md:h-12 w-auto',
      box: 'p-1.5',
      text: 'text-lg sm:text-xl md:text-2xl',
      sub: 'text-[9px] sm:text-[10px] md:text-[11px]',
    },
    lg: {
      img: 'h-14 sm:h-16 md:h-18 w-auto',
      box: 'p-2',
      text: 'text-2xl sm:text-3xl',
      sub: 'text-xs',
    },
    xl: {
      img: 'h-20 sm:h-24 md:h-28 w-auto',
      box: 'p-3',
      text: 'text-3xl sm:text-4xl',
      sub: 'text-sm',
    },
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  // Exact symbol / logo rendering without any distortion or scale cropping
  if (variant === 'graphic') {
    return (
      <div className={`inline-flex flex-col items-center justify-center ${className}`}>
        <img
          src={logoSrc}
          alt="Pawtopia - A Better World For Every Paw"
          className={`${currentSize.img} object-contain rounded-2xl shadow-sm border border-[#0B3E39]/15 dark:border-teal-800/40 bg-[#FAF6EE] p-1`}
        />
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex flex-col items-center p-3 rounded-3xl bg-[#FAF6EE] border border-[#0B3E39]/20 shadow-md ${className}`}
      >
        <img
          src={logoSrc}
          alt="Pawtopia"
          className="w-44 sm:w-52 h-auto object-contain rounded-2xl"
        />
      </div>
    );
  }

  if (variant === 'icon') {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-xl bg-[#FAF6EE] p-1 shadow-2xs border border-[#0B3E39]/20 dark:border-teal-700/50 flex-shrink-0 transition-transform duration-200 hover:scale-105 ${className} ${
          inverted ? 'ring-2 ring-teal-400/50' : ''
        }`}
      >
        <img
          src={logoSrc}
          alt="Pawtopia Symbol"
          className={`${currentSize.img} max-w-full object-contain select-none pointer-events-none`}
        />
      </div>
    );
  }

  // Full / compact responsive layout
  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 ${className}`}>
      {/* Exact symbol in pristine card container */}
      <div
        className={`relative inline-flex items-center justify-center rounded-2xl bg-[#FAF6EE] ${currentSize.box} shadow-xs border border-[#0B3E39]/15 dark:border-teal-800/50 flex-shrink-0 transition-transform duration-200 hover:scale-105 ${
          inverted ? 'ring-2 ring-teal-400/50' : ''
        }`}
      >
        <img
          src={logoSrc}
          alt="Pawtopia Symbol"
          className={`${currentSize.img} object-contain select-none pointer-events-none`}
        />
      </div>

      {/* Brand title & tagline, with responsive scaling across mobile, tablet, and laptop */}
      <div className="hidden sm:flex flex-col text-left select-none">
        <span
          className={`font-black tracking-wider leading-none transition-colors duration-200 ${
            currentSize.text
          } ${
            inverted
              ? 'text-[#FAF6EE]'
              : 'text-[#0B3E39] dark:text-[#FAF6EE]'
          }`}
          style={{ letterSpacing: '0.07em' }}
        >
          PAWTOPIA
        </span>
        {variant === 'full' && (
          <span
            className={`font-bold tracking-widest uppercase mt-0.5 sm:mt-1 transition-colors duration-200 whitespace-nowrap ${
              currentSize.sub
            } ${
              inverted
                ? 'text-[#FAF6EE]/80'
                : 'text-[#0B3E39]/80 dark:text-teal-200/90'
            }`}
            style={{ letterSpacing: '0.18em' }}
          >
            A Better World For Every Paw
          </span>
        )}
      </div>
    </div>
  );
};
