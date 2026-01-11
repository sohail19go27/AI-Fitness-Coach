import React from 'react';
import { cn } from '../../lib/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = ({ className, ...props }) => {
  return (
    <input
      className={cn('w-full rounded-md border border-white/6 bg-transparent px-3 py-2 text-sm text-primary placeholder:text-muted focus:ring-2 focus:ring-white/10 focus:outline-none', className)}
      {...props}
    />
  );
};

export default Input;
