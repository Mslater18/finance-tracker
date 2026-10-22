import React from 'react';
import { Plus, SlidersHorizontal, DollarSign } from 'lucide-react';
import { CurrencyConfig } from '../types';
import { CURRENCIES } from '../data/categories';

export type ActiveTab = 'overview' | 'ledger' | 'budgets' | 'subscriptions' | 'analytics';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onNewTransaction: () => void;
  onOpenSettings: () => void;
  currency: CurrencyConfig;
  onCurrencyChange: (code: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onNewTransaction,
  onOpenSettings,
  currency,
  onCurrencyChange,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold tracking-tight text-lg shadow-sm">
            <DollarSign className="w-5 h-5 text-emerald-400 stroke-[2.5]" />
          </div>
          <button
            onClick={() => onTabChange('overview')}
            className="text-lg font-bold tracking-tight text-slate-900 hover:text-slate-800 transition-colors whitespace-nowrap text-left"
          >
            FinLedger
          </button>
        </div>

        {/* Zone 2: Navigation Links (Single-line, unboxed, subtle active state) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <button
            onClick={() => onTabChange('overview')}
            className={`whitespace-nowrap pb-0.5 transition-colors ${
              activeTab === 'overview'
                ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onTabChange('ledger')}
            className={`whitespace-nowrap pb-0.5 transition-colors ${
              activeTab === 'ledger'
                ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Ledger & Transactions
          </button>
          <button
            onClick={() => onTabChange('budgets')}
            className={`whitespace-nowrap pb-0.5 transition-colors ${
              activeTab === 'budgets'
                ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Budgets
          </button>
          <button
            onClick={() => onTabChange('subscriptions')}
            className={`whitespace-nowrap pb-0.5 transition-colors ${
              activeTab === 'subscriptions'
                ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Subscriptions
          </button>
          <button
            onClick={() => onTabChange('analytics')}
            className={`whitespace-nowrap pb-0.5 transition-colors ${
              activeTab === 'analytics'
                ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Analytics & Reports
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Currency selector */}
          <div className="relative">
            <select
              value={currency.code}
              onChange={(e) => onCurrencyChange(e.target.value)}
              className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold py-2 pl-3 pr-7 rounded-lg cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1"
              aria-label="Select currency"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Data backup, import & export"
            aria-label="Data backup and settings"
          >
            <SlidersHorizontal size={18} />
          </button>

          <button
            onClick={onNewTransaction}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm hover:shadow transition-all whitespace-nowrap active:scale-[0.98]"
          >
            <Plus size={15} className="stroke-[2.5]" />
            <span>New Entry</span>
          </button>
        </div>

      </div>

      {/* Mobile subnavigation bar for small screens */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-100 px-2 py-2.5 overflow-x-auto text-xs font-medium text-slate-600 bg-white">
        <button
          onClick={() => onTabChange('overview')}
          className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
            activeTab === 'overview' ? 'bg-slate-900 text-white font-semibold' : 'hover:text-slate-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => onTabChange('ledger')}
          className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
            activeTab === 'ledger' ? 'bg-slate-900 text-white font-semibold' : 'hover:text-slate-900'
          }`}
        >
          Ledger
        </button>
        <button
          onClick={() => onTabChange('budgets')}
          className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
            activeTab === 'budgets' ? 'bg-slate-900 text-white font-semibold' : 'hover:text-slate-900'
          }`}
        >
          Budgets
        </button>
        <button
          onClick={() => onTabChange('subscriptions')}
          className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
            activeTab === 'subscriptions' ? 'bg-slate-900 text-white font-semibold' : 'hover:text-slate-900'
          }`}
        >
          Subscriptions
        </button>
        <button
          onClick={() => onTabChange('analytics')}
          className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
            activeTab === 'analytics' ? 'bg-slate-900 text-white font-semibold' : 'hover:text-slate-900'
          }`}
        >
          Analytics
        </button>
      </div>
    </header>
  );
};
