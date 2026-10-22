import React from 'react';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingDown, Target, CreditCard } from 'lucide-react';
import { CurrencyConfig } from '../types';
import { formatCurrency } from '../utils/format';

interface SummaryKPIsProps {
  metrics: {
    thisMonthExpenses: number;
    thisMonthIncome: number;
    netThisMonth: number;
    prevMonthExpenses: number;
    prevMonthIncome: number;
    dailyAverage: number;
    projectedMonthEnd: number;
    totalBudget: number;
    budgetUsedPercent: number;
    monthlySubscriptionsCost: number;
    daysRemaining: number;
  };
  currency: CurrencyConfig;
  onNavigateToBudgets: () => void;
  onNavigateToSubscriptions: () => void;
}

export const SummaryKPIs: React.FC<SummaryKPIsProps> = ({
  metrics,
  currency,
  onNavigateToBudgets,
  onNavigateToSubscriptions,
}) => {
  const expenseDiff = metrics.prevMonthExpenses > 0
    ? ((metrics.thisMonthExpenses - metrics.prevMonthExpenses) / metrics.prevMonthExpenses) * 100
    : 0;

  const remainingBudget = Math.max(0, metrics.totalBudget - metrics.thisMonthExpenses);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Net Cash Flow */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Net Cash Flow
          </span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <Wallet size={16} />
          </div>
        </div>

        <div className="mt-3">
          <div className={`text-2xl font-bold font-mono tracking-tight ${
            metrics.netThisMonth >= 0 ? 'text-slate-900' : 'text-rose-600'
          }`}>
            {formatCurrency(metrics.netThisMonth, currency)}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
            <span>Inflow: {formatCurrency(metrics.thisMonthIncome, currency)}</span>
            <span aria-hidden="true">·</span>
            <span>Outflow: {formatCurrency(metrics.thisMonthExpenses, currency)}</span>
          </div>
        </div>
      </div>

      {/* 2. Monthly Expenses */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Month Expenses
          </span>
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <TrendingDown size={16} />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-2xl font-bold font-mono tracking-tight text-slate-900">
            {formatCurrency(metrics.thisMonthExpenses, currency)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <span>Daily avg:</span>
            <span className="font-mono font-medium text-slate-700">
              {formatCurrency(metrics.dailyAverage, currency)}/day
            </span>
            <span aria-hidden="true">·</span>
            <span>Est: {formatCurrency(metrics.projectedMonthEnd, currency)}</span>
          </div>
        </div>
      </div>

      {/* 3. Budget Status */}
      <div 
        onClick={onNavigateToBudgets}
        className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase group-hover:text-slate-700 transition-colors">
            Monthly Budget
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Target size={16} />
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900">
              {Math.round(metrics.budgetUsedPercent)}%
            </span>
            <span className="text-xs font-mono text-slate-500">
              {formatCurrency(remainingBudget, currency)} left
            </span>
          </div>

          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                metrics.budgetUsedPercent > 100
                  ? 'bg-rose-500'
                  : metrics.budgetUsedPercent > 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, metrics.budgetUsedPercent)}%` }}
            />
          </div>
          <div className="mt-1.5 text-[11px] text-slate-400">
            {metrics.daysRemaining} days remaining in month
          </div>
        </div>
      </div>

      {/* 4. Subscriptions & Fixed Run-rate */}
      <div 
        onClick={onNavigateToSubscriptions}
        className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase group-hover:text-slate-700 transition-colors">
            Subscriptions Run-Rate
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <CreditCard size={16} />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-2xl font-bold font-mono tracking-tight text-slate-900">
            {formatCurrency(metrics.monthlySubscriptionsCost, currency)}
            <span className="text-xs font-normal text-slate-500 ml-1">/mo</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <span>Annualized:</span>
            <span className="font-mono font-medium text-slate-700">
              {formatCurrency(metrics.monthlySubscriptionsCost * 12, currency)}/yr
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
