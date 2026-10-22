import React, { useState } from 'react';
import { Target, Plus, Edit2, AlertCircle, CheckCircle2, TrendingUp, X } from 'lucide-react';
import { CategoryBudget, CurrencyConfig, Transaction } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { formatCurrency } from '../utils/format';
import { DEFAULT_EXPENSE_CATEGORIES } from '../data/categories';

interface BudgetsViewProps {
  budgets: CategoryBudget[];
  transactions: Transaction[];
  currency: CurrencyConfig;
  onUpdateBudget: (category: string, amount: number) => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  budgets,
  transactions,
  currency,
  onUpdateBudget,
}) => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCategory, setNewCategory] = useState(DEFAULT_EXPENSE_CATEGORIES[0].name);
  const [newAmount, setNewAmount] = useState('200');

  // Calculate current month spending per category
  const now = new Date();
  const curMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate();
  const daysRemaining = Math.max(1, daysInMonth - currentDay);

  const spendingByCategory: Record<string, number> = {};
  let totalSpentInBudgetedCategories = 0;

  transactions.forEach((tx) => {
    if (tx.type === 'expense' && tx.date.startsWith(curMonthPrefix)) {
      spendingByCategory[tx.category] = (spendingByCategory[tx.category] || 0) + tx.amount;
    }
  });

  const totalMonthlyBudget = budgets.reduce((acc, b) => acc + b.monthlyLimit, 0);
  budgets.forEach((b) => {
    totalSpentInBudgetedCategories += spendingByCategory[b.category] || 0;
  });

  const totalRemaining = Math.max(0, totalMonthlyBudget - totalSpentInBudgetedCategories);
  const overallPercent = totalMonthlyBudget > 0 ? (totalSpentInBudgetedCategories / totalMonthlyBudget) * 100 : 0;

  const handleStartEdit = (category: string, currentLimit: number) => {
    setEditingCategory(category);
    setEditAmount(currentLimit.toString());
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    const val = parseFloat(editAmount);
    if (!isNaN(val) && val >= 0) {
      onUpdateBudget(editingCategory, val);
    }
    setEditingCategory(null);
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newAmount);
    if (!isNaN(val) && val >= 0) {
      onUpdateBudget(newCategory, val);
    }
    setIsAddingNew(false);
  };

  // Find unbudgeted expense categories
  const existingCategories = new Set(budgets.map((b) => b.category));
  const availableCategories = DEFAULT_EXPENSE_CATEGORIES.filter((c) => !existingCategories.has(c.name));

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Summary Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              <Target size={14} className="text-amber-500" />
              <span>Monthly Budget Allocation</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              {formatCurrency(totalSpentInBudgetedCategories, currency)}
              <span className="text-sm font-normal text-slate-500 ml-1.5">
                of {formatCurrency(totalMonthlyBudget, currency)} budget limit
              </span>
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span>{Math.round(overallPercent)}% utilized</span>
              <span aria-hidden="true">·</span>
              <span>{formatCurrency(totalRemaining, currency)} remaining for next {daysRemaining} days</span>
              <span aria-hidden="true">·</span>
              <span>Run-rate: {formatCurrency(totalRemaining / daysRemaining, currency)} / day</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {availableCategories.length > 0 && (
              <button
                onClick={() => setIsAddingNew(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all"
              >
                <Plus size={14} />
                <span>Add Category Budget</span>
              </button>
            )}
          </div>
        </div>

        {/* Global progress meter */}
        <div className="mt-5 w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              overallPercent > 100
                ? 'bg-rose-500'
                : overallPercent > 80
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, overallPercent)}%` }}
          />
        </div>
      </div>

      {/* Add New Budget Category Inline Form */}
      {isAddingNew && (
        <form onSubmit={handleSaveNew} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-3 flex-1 min-w-[280px]">
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="py-1.5 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              {availableCategories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            <div className="relative flex-1 max-w-[180px]">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">
                {currency.symbol}
              </span>
              <input
                type="number"
                min="1"
                step="10"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                placeholder="Monthly limit"
                className="w-full pl-7 pr-3 py-1.5 text-xs font-mono font-bold bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
            >
              Save Budget
            </button>
          </div>
        </form>
      )}

      {/* Category Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.map((b) => {
          const spent = spendingByCategory[b.category] || 0;
          const remaining = b.monthlyLimit - spent;
          const percent = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;
          const isOver = remaining < 0;
          const isWarning = !isOver && percent >= 80;
          const dailyAllowance = Math.max(0, remaining / daysRemaining);

          return (
            <div
              key={b.category}
              className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <CategoryIcon categoryName={b.category} size={16} className="w-8 h-8" />
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 leading-tight">
                        {b.category}
                      </h4>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Limit: {formatCurrency(b.monthlyLimit, currency)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartEdit(b.category, b.monthlyLimit)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Change monthly limit"
                  >
                    <Edit2 size={13} />
                  </button>
                </div>

                {/* Spending Figures */}
                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <span className="text-xl font-bold font-mono text-slate-900">
                      {formatCurrency(spent, currency)}
                    </span>
                    <span className="text-xs text-slate-400 font-mono ml-1">spent</span>
                  </div>
                  <span
                    className={`text-xs font-mono font-semibold ${
                      isOver ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-slate-500'
                    }`}
                  >
                    {isOver ? `Over by ${formatCurrency(Math.abs(remaining), currency)}` : `${formatCurrency(remaining, currency)} left`}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-2 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, percent)}%` }}
                  />
                </div>
              </div>

              {/* Footer info: allowance or warning */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">
                  {Math.round(percent)}% used
                </span>
                <span className="font-mono text-slate-600">
                  {!isOver ? `~${formatCurrency(dailyAllowance, currency)}/day` : 'Exceeded target'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Budget Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                Adjust Budget: {editingCategory}
              </h3>
              <button
                onClick={() => setEditingCategory(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Monthly Limit
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-base font-semibold">
                    {currency.symbol}
                  </span>
                  <input
                    type="number"
                    step="5"
                    min="0"
                    required
                    autoFocus
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-lg font-mono font-bold border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm"
                >
                  Update Limit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
