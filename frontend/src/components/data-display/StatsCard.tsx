import React from 'react';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  iconBgColor?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  change,
  changeType = 'neutral',
  icon,
  iconBgColor = 'bg-primary/10 text-primary',
}) => {
  return (
    <Card glass className="p-5 flex flex-col justify-between hover:border-primary/40 transition-all group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <h4 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            {value}
          </h4>
        </div>
        <div className={cn('p-3 rounded-2xl transition-transform group-hover:scale-110', iconBgColor)}>
          {icon}
        </div>
      </div>

      {(subtitle || change) && (
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 text-xs">
          {change && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-medium px-2 py-0.5 rounded-full',
                changeType === 'positive' && 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                changeType === 'negative' && 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
                changeType === 'neutral' && 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              )}
            >
              {changeType === 'positive' && <ArrowUpRight className="w-3 h-3" />}
              {changeType === 'negative' && <ArrowDownRight className="w-3 h-3" />}
              {changeType === 'neutral' && <Minus className="w-3 h-3" />}
              {change}
            </span>
          )}
          {subtitle && <span className="text-slate-500 dark:text-slate-400">{subtitle}</span>}
        </div>
      )}
    </Card>
  );
};
