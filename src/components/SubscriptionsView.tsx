import React, { useState } from 'react';
import { CreditCard, Plus, Check, Clock, Trash2, Calendar, RefreshCw, X, AlertCircle } from 'lucide-react';
import { Subscription, CurrencyConfig, SubscriptionFrequency, PaymentMethod } from '../types';
import { formatCurrency } from '../utils/format';
import { CategoryIcon } from './CategoryIcon';
import { DEFAULT_EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../data/categories';

interface SubscriptionsViewProps {
  subscriptions: Subscription[];
  currency: CurrencyConfig;
  onAddSubscription: (sub: Omit<Subscription, 'id'>) => void;
  onDeleteSubscription: (id: string) => void;
  onToggleActive: (id: string) => void;
  onLogPaid: (id: string) => void;
}

export const SubscriptionsView: React.FC<SubscriptionsViewProps> = ({
  subscriptions,
  currency,
  onAddSubscription,
  onDeleteSubscription,
  onToggleActive,
  onLogPaid,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(DEFAULT_EXPENSE_CATEGORIES[0].name);
  const [frequency, setFrequency] = useState<SubscriptionFrequency>('monthly');
  const [billingDay, setBillingDay] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Credit Card');
  const [notes, setNotes] = useState('');
  const [loggedNotice, setLoggedNotice] = useState<string | null>(null);

  // Compute metrics
  const activeSubs = subscriptions.filter((s) => s.active);
  const monthlyCost = activeSubs.reduce((acc, sub) => {
    if (sub.frequency === 'weekly') return acc + sub.amount * 4.33;
    if (sub.frequency === 'monthly') return acc + sub.amount;
    if (sub.frequency === 'quarterly') return acc + sub.amount / 3;
    if (sub.frequency === 'annual') return acc + sub.amount / 12;
    return acc;
  }, 0);
  const annualCost = monthlyCost * 12;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid subscription amount');
      return;
    }
    if (!name.trim()) {
      alert('Please enter a service name');
      return;
    }

    onAddSubscription({
      name: name.trim(),
      amount: numAmount,
      category,
      frequency,
      billingDay: Number(billingDay),
      paymentMethod,
      active: true,
      notes: notes.trim(),
    });

    setIsModalOpen(false);
    setName('');
    setAmount('');
    setNotes('');
  };

  const handleQuickLog = (sub: Subscription) => {
    onLogPaid(sub.id);
    setLoggedNotice(`Logged ${sub.name} (${formatCurrency(sub.amount, currency)}) as paid today in your Ledger!`);
    setTimeout(() => setLoggedNotice(null), 3500);
  };

  const today = new Date().getDate();

  return (
    <div className="space-y-6">
      
      {/* Top Banner and Highlights */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              <RefreshCw size={14} className="text-blue-500" />
              <span>Recurring Subscriptions & Bills</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              {formatCurrency(monthlyCost, currency)}
              <span className="text-sm font-normal text-slate-500 ml-1.5">per month</span>
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span>{activeSubs.length} active subscriptions</span>
              <span aria-hidden="true">·</span>
              <span>Annualized run-rate: <strong className="font-mono text-slate-700">{formatCurrency(annualCost, currency)}/year</strong></span>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all"
          >
            <Plus size={14} />
            <span>Add Subscription</span>
          </button>
        </div>

        {loggedNotice && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 animate-in fade-in">
            <Check size={16} className="text-emerald-600 shrink-0" />
            <span>{loggedNotice}</span>
          </div>
        )}
      </div>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subscriptions.map((sub) => {
          // Days until billing day
          let daysUntil = sub.billingDay - today;
          if (daysUntil < 0) daysUntil += 30; // Approx next month

          const annualized = sub.frequency === 'weekly' ? sub.amount * 52 : sub.frequency === 'monthly' ? sub.amount * 12 : sub.frequency === 'quarterly' ? sub.amount * 4 : sub.amount;

          return (
            <div
              key={sub.id}
              className={`bg-white border rounded-xl p-5 shadow-xs flex flex-col justify-between transition-all ${
                sub.active ? 'border-slate-200/80 hover:border-slate-300' : 'border-slate-200/40 opacity-60 bg-slate-50/50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <CategoryIcon categoryName={sub.category} size={16} className="w-8 h-8" />
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 leading-tight">
                        {sub.name}
                      </h4>
                      {/* Zero-pill metadata per constitution */}
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                        <span>{sub.frequency}</span>
                        <span aria-hidden="true">·</span>
                        <span>Renews day {sub.billingDay}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteSubscription(sub.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Remove subscription"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* Amount display */}
                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <span className="text-xl font-bold font-mono text-slate-900">
                      {formatCurrency(sub.amount, currency)}
                    </span>
                    <span className="text-xs text-slate-400 font-mono ml-1">
                      /{sub.frequency === 'monthly' ? 'mo' : sub.frequency === 'annual' ? 'yr' : 'cycle'}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    ~{formatCurrency(annualized, currency)}/yr
                  </span>
                </div>

                {sub.notes && (
                  <p className="mt-2 text-xs text-slate-500 line-clamp-1">
                    {sub.notes}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onToggleActive(sub.id)}
                  className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
                    sub.active
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                  }`}
                >
                  {sub.active ? 'Active' : 'Paused'}
                </button>

                <button
                  onClick={() => handleQuickLog(sub)}
                  disabled={!sub.active}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors disabled:opacity-40"
                  title="Records this bill in your transactions as paid today"
                >
                  <Check size={12} />
                  <span>Log as Paid</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Subscription Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">
                New Recurring Subscription
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Service / Provider Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Netflix, Spotify, Gym, Cloud Hosting"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">
                      {currency.symbol}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      placeholder="15.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 text-xs font-mono font-semibold border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as SubscriptionFrequency)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    {DEFAULT_EXPENSE_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Billing Day (1-31)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={billingDay}
                    onChange={(e) => setBillingDay(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  {PAYMENT_METHODS.map((pm) => (
                    <option key={pm} value={pm}>
                      {pm}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Family plan, renewal date"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm"
                >
                  Save Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
