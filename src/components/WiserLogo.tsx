import React from 'react';

interface WiserLogoProps {
  className?: string;
  variant?: 'full' | 'icon';
}

export const WiserLogo: React.FC<WiserLogoProps> = ({ 
  className = "h-8 w-8", 
  variant = 'icon' 
}) => {
  return (
    <div className={className}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 500 500"
        className="w-full h-full"
      >
        <defs>
          <style>{`.cls-1{fill:#0071bb;}.cls-2{fill:#f15a24;}.cls-3{fill:#fff;}`}</style>
        </defs>
        <title>Wiser Logo</title>
        <g id="Blue">
          <g id="Icon-2" data-name="Icon">
            <circle className="cls-1" cx="250" cy="250" r="250"/>
            <polygon className="cls-2" points="399.32 162.06 327.98 162.06 363.65 249.7 399.32 162.06"/>
            <polygon className="cls-3" points="284.23 162.06 229.03 162.06 199.03 235.77 169.03 162.06 113.82 162.06 199.03 371.42 253.48 237.62 307.36 371.42 337.79 295.95 284.23 162.06"/>
          </g>
        </g>
      </svg>
    </div>
  );
};