import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export default function Button({ 
  variant = 'primary', 
  fullWidth = false,
  className = '',
  children,
  ...props 
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-blue-50 text-blue-700 hover:bg-blue-100'
  };
  const widthClass = fullWidth ? 'w-full' : '';
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    widthClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
}
