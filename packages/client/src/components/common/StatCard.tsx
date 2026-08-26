import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive?: boolean;
    label?: string;
  };
  subtitle?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  subtitle,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className="h-10 w-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <h4 className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</h4>
        
        {trend && (
          <div
            className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
              trend.isPositive !== false
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-rose-50 text-rose-700'
            }`}
          >
            {trend.isPositive !== false ? (
              <TrendingUp className="h-3.5 w-3.5 mr-1" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 mr-1" />
            )}
            {trend.value > 0 ? `+${trend.value}%` : `${trend.value}%`}
          </div>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-400 font-medium">{subtitle}</p>
      )}
    </div>
  );
};
