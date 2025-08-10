// Midnight Aarti Theme reusable components
import React from 'react';
import { Landmark } from 'lucide-react';

export const Diya = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 64 64" aria-hidden className={className}>
    <defs>
      <radialGradient id="flame" cx="50%" cy="35%" r="60%">
        <stop offset="0%" stopColor="#FFEAA7" />
        <stop offset="60%" stopColor="#FFC046" />
        <stop offset="100%" stopColor="#FF8F00" />
      </radialGradient>
      <linearGradient id="bowl" x1="0" x2="1">
        <stop offset="0%" stopColor="#6D28D9" />
        <stop offset="100%" stopColor="#4338CA" />
      </linearGradient>
    </defs>
    <ellipse cx="32" cy="45" rx="22" ry="8" fill="url(#bowl)" stroke="#C4B5FD" strokeWidth="1.2" />
    <path d="M32 12c-5 6-4 10 0 14 4-4 5-8 0-14z" fill="url(#flame)">
      <animate attributeName="opacity" values="0.9;1;0.9" dur="2.2s" repeatCount="indefinite" />
    </path>
  </svg>
);

export const MandalaBG = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.06]" viewBox="0 0 800 240" preserveAspectRatio="xMidYMid slice" aria-hidden>
    <g fill="none" stroke="#EAB308" strokeWidth="0.7">
      <circle cx="400" cy="120" r="90" />
      <circle cx="400" cy="120" r="120" />
      <circle cx="400" cy="120" r="150" />
      <path d="M400 30l18 36 40 6-29 28 7 40-36-19-36 19 7-40-29-28 40-6z" />
    </g>
  </svg>
);

export const NavPill = ({ icon: Icon, label, active = false, onClick }) => (
  <button onClick={onClick} className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-2xl transition-all ${active ? 'bg-indigo-700 text-amber-200 shadow' : 'text-indigo-50/90 hover:bg-indigo-800/60'}`}>
    <Icon className="w-4 h-4" />
    <span className="font-medium">{label}</span>
    {active && <span className="absolute inset-x-4 -bottom-1 h-0.5 bg-gradient-to-r from-amber-300 to-rose-300 rounded-full" />}
  </button>
);

export const Chip = ({ children }) => (
  <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs bg-amber-100/15 text-amber-200 border border-amber-300/30">{children}</span>
);

export const TogglePill = ({ label, checked, onChange }) => (
  <label className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-indigo-900/40 border border-indigo-300/20 hover:border-indigo-200/40 cursor-pointer">
    <span className="text-sm text-indigo-100">{label}</span>
    <input type="checkbox" className="accent-amber-400 w-4 h-4" checked={checked} onChange={onChange} />
  </label>
);

export const PlaceholderMapPanel = () => (
  <div className="absolute inset-0 grid place-items-center text-center p-6">
    <Diya className="w-10 h-10" />
    <h3 className="mt-3 text-xl font-semibold">Map Panel</h3>
    <p className="text-sm text-indigo-200/80 max-w-xl">Loading map…</p>
  </div>
);

export const SimpleCard = ({ title, children }) => (
  <div className="rounded-xl border border-indigo-300/25 bg-indigo-950/35 p-3">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 grid place-items-center rounded-lg bg-gradient-to-br from-amber-400 to-rose-400 text-indigo-950"><Landmark className="w-5 h-5" /></div>
      <div className="flex-1">
        <h3 className="font-semibold text-indigo-50 mb-1">{title}</h3>
        <div className="text-xs text-indigo-200/80 space-y-1">{children}</div>
      </div>
    </div>
  </div>
);

export default {};
