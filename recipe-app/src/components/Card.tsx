import React from 'react';

interface CardProps {
  children?: React.ReactNode;
  backgroundColor?: string;
  className?: string;
}

export default function Card({ 
  children, 
  backgroundColor = '', 
  className = '' 
}: CardProps) {
  return (
    <div className={`${backgroundColor} rounded-3xl shadow-lg p-6 ${className}`}>
      {children}
    </div>
  );
}
