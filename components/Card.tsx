
import React, { ReactNode } from 'react';

// FIX: Extend HTMLAttributes to allow passing standard HTML props like 'id'.
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-white dark:bg-slate-800 shadow rounded-lg p-6 border border-slate-200 dark:border-slate-700 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;