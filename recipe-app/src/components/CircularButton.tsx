'use client';

import React from 'react';

interface CircularButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'gray';
  disabled?: boolean;
  className?: string;
  title?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16'
};

const iconSizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8'
};

const variantClasses = {
  primary: 'bg-orange-350 hover:bg-gray-200 text-black',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800',
  success: 'bg-green-500 hover:bg-green-600 text-white',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
  warning: 'bg-yellow-500 hover:bg-yellow-600 text-black',
  gray: 'bg-gray-500 hover:bg-gray-600 text-white'
};

export default function CircularButton({
  onClick,
  children,
  size = 'md',
  variant = 'primary',
  disabled = false,
  className = '',
  title
}: CircularButtonProps) {
  const baseClasses = 'rounded-full shadow-[-3px_3px_4px_0_rgba(0,0,0,0.25)] transition-all duration-200 flex items-center justify-center cursor-pointer';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed hover:shadow-lg' : '';
  
  const sizeClass = sizeClasses[size];
  const variantClass = variantClasses[variant];
  
  const iconSizeClass = iconSizeClasses[size];
  
  const handleClick = () => {
    if (!disabled) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      title={title}
      className={`${baseClasses} ${sizeClass} ${variantClass} ${disabledClasses} ${className}`}
    >
      {React.isValidElement(children) && children.type === 'svg' 
        ? React.cloneElement(children as React.ReactElement<any>, { 
            className: `${iconSizeClass} ${(children as React.ReactElement<any>).props.className || ''}` 
          })
        : children
      }
    </button>
  );
}
