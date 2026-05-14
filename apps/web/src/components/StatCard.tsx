import React from 'react';
import { useNavigate } from 'react-router-dom';

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: string;
  icon: string;
  color?: string;
  route?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, trend, icon, color = '#d0bcff', route }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => route && navigate(route)}
      className={`glass-card p-6 flex flex-col justify-between h-[180px] group ${route ? 'cursor-pointer' : ''}`}
    >
      {/* Decorative glow */}
      <div
        className="absolute -top-14 -right-14 w-36 h-36 rounded-full opacity-[0.12] pointer-events-none transition-all duration-500 group-hover:opacity-25 group-hover:scale-150"
        style={{ backgroundColor: color, filter: 'blur(50px)' }}
      ></div>

      {/* Header row */}
      <div className="flex justify-between items-start">
        <span className="text-sm font-semibold text-on-surface-variant/70">{label}</span>
        <span
          className="material-symbols-outlined p-2 rounded-xl text-[22px]"
          style={{ color, backgroundColor: `${color}1A` }}
        >
          {icon}
        </span>
      </div>

      {/* Value + trend */}
      <div className="flex flex-col">
        <span className="text-4xl font-extrabold tracking-tighter leading-none mb-1">{value}</span>
        {trend && (
          <div
            className="flex items-center gap-1 text-xs"
            style={{ color: trend.includes('+') || trend.includes('Today') ? '#d0bcff' : '#ffb869' }}
          >
            <span className="material-symbols-outlined text-base">
              {trend.includes('+') ? 'trending_up' : 'info'}
            </span>
            <span className="font-medium">{trend}</span>
          </div>
        )}
      </div>

      {/* Hover arrow */}
      {route && (
        <span className="material-symbols-outlined absolute bottom-4 right-4 text-on-surface-variant/0 group-hover:text-on-surface-variant/40 transition-all text-[18px]">arrow_forward</span>
      )}
    </div>
  );
};

export default StatCard;
