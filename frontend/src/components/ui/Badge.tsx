import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'secondary';
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'primary',
  size = 'sm',
  pulse = false,
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center gap-1.5 font-medium rounded-full border transition-colors';

  const variants = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    info: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    secondary: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    outline: 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-transparent',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  const pulseColors = {
    primary: 'bg-primary',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-sky-500',
    secondary: 'bg-slate-400',
    outline: 'bg-slate-400',
  };

  return (
    <div className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", pulseColors[variant])}></span>
          <span className={cn("relative inline-flex rounded-full h-2 w-2", pulseColors[variant])}></span>
        </span>
      )}
      {children}
    </div>
  );
};
