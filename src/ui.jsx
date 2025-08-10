// Reusable UI components (orange theme)
import React from 'react';

export const NavLink = ({ icon: Icon, label, active = false, onClick }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${active ? 'bg-orange-600 text-white' : 'text-orange-900 hover:bg-orange-100'}`}
  >
    {Icon && <Icon className="w-4 h-4" />}
    <span className="font-medium">{label}</span>
  </button>
);

export const Chip = ({ children, className = '' }) => (
  <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs bg-orange-50 text-orange-700 border border-orange-200 ${className}`}>
    {children}
  </span>
);

export const TogglePill = ({ label, checked, onChange }) => (
  <label className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white/70 border border-orange-200 hover:border-orange-300 cursor-pointer select-none">
    <span className="text-sm text-orange-900">{label}</span>
    <input
      type="checkbox"
      className="accent-orange-600 w-4 h-4"
      checked={checked}
      onChange={onChange}
    />
  </label>
);

export const CategoryRow = ({ color, icon: Icon, label, count, checked, onToggle }) => (
  <button
    onClick={onToggle}
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-orange-50 ${checked ? 'bg-orange-50' : ''}`}
  >
    <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
    {Icon && <Icon className="w-4 h-4 text-orange-900" />}
    <span className="flex-1 text-sm text-orange-900">{label}</span>
    {typeof count !== 'undefined' && <span className="text-xs text-orange-700">{count}</span>}
  </button>
);

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon: Icon,
  iconPosition = 'left',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed';
  const variantClasses = {
    primary: 'bg-orange-600 text-white hover:bg-orange-700 active:bg-orange-800 shadow-sm',
    secondary: 'bg-white/90 border border-orange-200 text-orange-900 hover:bg-orange-50 active:bg-orange-100',
    outline: 'bg-transparent border border-orange-200 text-orange-700 hover:bg-orange-50 active:bg-orange-100'
  };
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base'
  };
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
      {children}
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
    </button>
  );
};

export const Card = ({ children, className = '', title, icon: Icon, action }) => (
  <section className={`bg-white/90 backdrop-blur border border-orange-200 rounded-2xl shadow-sm p-4 ${className}`}>
    {(title || action) && (
      <div className="flex items-center justify-between mb-3">
        {title && (
          <h2 className="font-semibold flex items-center gap-2 text-orange-900 text-sm">
            {Icon && <Icon className="w-4 h-4" />}
            {title}
          </h2>
        )}
        {action}
      </div>
    )}
    {children}
  </section>
);

export const Panel = ({ children, className = '' }) => (
  <div className={`space-y-4 ${className}`}>{children}</div>
);

export default {
  NavLink,
  Chip,
  TogglePill,
  CategoryRow,
  Button,
  Card,
  Panel,
};
