import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  backgroundColor?: string;
  className?: string;
}

export default function Card({ 
  children, 
  backgroundColor = '', 
  className = '', 
  ...props
}: CardProps) {
  return (
    <div className={`${backgroundColor} rounded-3xl shadow-[-3px_3px_4px_0_rgba(0,0,0,0.25)] p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}
