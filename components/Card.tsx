
import React, { ReactNode } from 'react';

// FIX: Extend HTMLAttributes to allow passing standard HTML props like 'id'.
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-white dark:bg-slate-800 shadow-md rounded-xl p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
