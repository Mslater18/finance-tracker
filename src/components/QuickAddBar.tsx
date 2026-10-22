import React from 'react';
import { Coffee, Utensils, ShoppingCart, Fuel, Calculator, Plus } from 'lucide-react';
import { CurrencyConfig, Transaction } from '../types';
import { formatCurrency } from '../utils/format';

interface QuickAddBarProps {
  currency: CurrencyConfig;
  onQuickAdd: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onOpenSplitBill: () => void;
  onOpenCustomModal: () => void;
}

export const QuickAddBar: React.FC<QuickAddBarProps> = ({
  currency,
  onQuickAdd,
  onOpenSplitBill,
  onOpenCustomModal,
}) => {
  const today = new Date().toISOString().split('T')[0];

  const presets = [
    {
      label: 'Coffee',
      amount: 5.5,
      merchant: 'Local Coffee Bar',
      category: 'Food & Dining',
      icon: Coffee,
      color: '#F97316',
    },
    {
      label: 'Lunch',
      amount: 16.0,
      merchant: 'Lunch Cafe',
      category: 'Food & Dining',
      icon: Utensils,
      color: '#10B981',
    },
    {
      label: 'Groceries',
      amount: 55.0,
      merchant: 'Supermarket',
      category: 'Groceries',
      icon: ShoppingCart,
      color: '#06B6D4',
    },
    {
      label: 'Transport / Gas',
      amount: 30.0,
      merchant: 'Transit / Fuel',
      category: 'Transportation',
      icon: Fuel,
      color: '#EAB308',
    },
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Quick Log:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {presets.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.label}
                onClick={() =>
                  onQuickAdd({
                    type: 'expense',
                    amount: p.amount,
                    merchant: p.merchant,
                    category: p.category,
                    date: today,
                    paymentMethod: 'Credit Card',
                    cleared: true,
                    tags: ['QuickLog'],
                  })
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg text-xs font-medium text-slate-800 transition-colors group"
                title={`Quick log ${p.label} (${formatCurrency(p.amount, currency)})`}
              >
                <Icon size={13} style={{ color: p.color }} />
                <span>{p.label}</span>
                <span className="font-mono text-slate-500 text-[11px] group-hover:text-slate-900">
                  {formatCurrency(p.amount, currency)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSplitBill}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
        >
          <Calculator size={13} />
          <span>Split Bill Tool</span>
        </button>

        <button
          onClick={onOpenCustomModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus size={13} />
          <span>Custom Entry</span>
        </button>
      </div>
    </div>
  );
};
