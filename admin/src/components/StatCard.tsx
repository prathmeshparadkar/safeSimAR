import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  badge?: string;
  valueColor?: string;
  badgeColor?: 'green' | 'orange' | 'yellow' | 'red';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  badge,
  valueColor = 'text-slate-100',
  badgeColor = 'green',
}) => {
  const badgeClasses = {
    green: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40',
    orange: 'bg-orange-950/40 text-orange-400 border-orange-800/40',
    yellow: 'bg-amber-950/40 text-amber-400 border-amber-800/40',
    red: 'bg-red-950/40 text-red-400 border-red-800/40',
  }[badgeColor];

  return (
    <div className="bg-industrial-surface border border-industrial-border rounded-lg p-5 flex flex-col justify-between hover:border-slate-600 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          {label}
        </span>
        <div className="p-2 bg-industrial-elevated rounded-md text-slate-400 border border-industrial-border">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <span className={`text-2xl font-bold font-mono tracking-tight ${valueColor}`}>
          {value}
        </span>
        {badge && (
          <span className={`text-[11px] font-semibold font-mono px-2 py-0.5 rounded border ${badgeClasses}`}>
            {badge}
          </span>
        )}
      </div>

      {subtext && (
        <span className="text-xs text-slate-400 mt-2 block truncate">
          {subtext}
        </span>
      )}
    </div>
  );
};
