import React, { useState, useEffect } from 'react';
import { X, Sparkles, Tag as TagIcon, Calendar, CreditCard, Store, AlignLeft } from 'lucide-react';
import { Transaction, TransactionType, PaymentMethod, CurrencyConfig } from '../types';
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES, PAYMENT_METHODS } from '../data/categories';
import { CategoryIcon } from './CategoryIcon';
import { parseQuickExpense } from '../utils/format';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  initialData?: Transaction | null;
  currency: CurrencyConfig;
}

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  currency,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<string>('Food & Dining');
  const [merchant, setMerchant] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Credit Card');
  const [notes, setNotes] = useState<string>('');
  const [tagsInput, setTagsInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [quickInput, setQuickInput] = useState<string>('');
  const [quickFeedback, setQuickFeedback] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmount(initialData.amount.toString());
      setDate(initialData.date);
      setCategory(initialData.category);
      setMerchant(initialData.merchant);
      setPaymentMethod(initialData.paymentMethod);
      setNotes(initialData.notes || '');
      setTags(initialData.tags || []);
      setTagsInput('');
    } else {
      setType('expense');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setCategory('Food & Dining');
      setMerchant('');
      setPaymentMethod('Credit Card');
      setNotes('');
      setTags([]);
      setTagsInput('');
      setQuickInput('');
      setQuickFeedback('');
    }
  }, [initialData, isOpen]);

  // Update default category when type changes
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'income') {
      setCategory('Salary');
    } else {
      setCategory('Food & Dining');
    }
  };

  const handleQuickParse = () => {
    if (!quickInput.trim()) return;
    const parsed = parseQuickExpense(quickInput);
    if (parsed) {
      if (parsed.amount) setAmount(parsed.amount.toString());
      if (parsed.date) setDate(parsed.date);
      if (parsed.category) setCategory(parsed.category);
      if (parsed.merchant) setMerchant(parsed.merchant);
      if (parsed.type) setType(parsed.type);
      if (parsed.paymentMethod) setPaymentMethod(parsed.paymentMethod as PaymentMethod);
      setQuickFeedback('Parsed successfully!');
      setTimeout(() => setQuickFeedback(''), 2500);
    } else {
      setQuickFeedback('Could not extract amount. E.g. "Lunch $15 at Sweetgreen"');
      setTimeout(() => setQuickFeedback(''), 3500);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = tagsInput.trim().replace(/^#/, '');
      if (trimmed && !tags.includes(trimmed)) {
        setTags([...tags, trimmed]);
        setTagsInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid amount greater than zero');
      return;
    }
    if (!merchant.trim()) {
      alert('Please enter a merchant or payee');
      return;
    }

    onSave({
      type,
      amount: numAmount,
      date,
      category,
      merchant: merchant.trim(),
      paymentMethod,
      notes: notes.trim(),
      tags,
      cleared: true,
      recurringId: initialData?.recurringId,
    });
    onClose();
  };

  if (!isOpen) return null;

  const currentCategories = type === 'expense' ? DEFAULT_EXPENSE_CATEGORIES : DEFAULT_INCOME_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 id="modal-title" className="text-base font-bold text-slate-900">
            {initialData ? 'Edit Entry' : 'New Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Natural Language Quick Input (Only on Add mode) */}
        {!initialData && (
          <div className="bg-slate-50 px-6 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-amber-500 shrink-0" />
              <input
                type="text"
                placeholder='Quick paste e.g. "Dinner $42 at Osteria yesterday"'
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleQuickParse())}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <button
                type="button"
                onClick={handleQuickParse}
                className="px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg shrink-0 transition-colors"
              >
                Auto-fill
              </button>
            </div>
            {quickFeedback && (
              <p className="text-[11px] text-slate-500 mt-1 pl-6">{quickFeedback}</p>
            )}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Segmented Type Switcher */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                type === 'expense'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                type === 'income'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Income
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Amount
            </label>
            <div className="relative rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-slate-900 focus-within:border-transparent transition-all overflow-hidden bg-slate-50/50">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-mono text-xl font-medium">
                {currency.symbol}
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                required
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-2xl font-bold font-mono tracking-tight text-slate-900 placeholder:text-slate-300 bg-transparent focus:outline-none"
              />
            </div>
          </div>

          {/* Merchant / Payee & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {type === 'expense' ? 'Merchant / Payee' : 'Source / Employer'}
              </label>
              <div className="relative">
                <Store size={15} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder={type === 'expense' ? 'e.g. Whole Foods' : 'e.g. Acme Corp'}
                  required
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full py-2 px-3 text-xs border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
              >
                {currentCategories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date
              </label>
              <div className="relative">
                <Calendar size={15} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Method
              </label>
              <div className="relative">
                <CreditCard size={15} className="absolute left-3 top-3 text-slate-400" />
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tags (press Enter to add)
            </label>
            <div className="flex flex-wrap items-center gap-1.5 p-2 border border-slate-200 rounded-lg bg-white min-h-[38px]">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs text-slate-700 bg-slate-100 rounded px-2 py-0.5"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-600 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder={tags.length === 0 ? "e.g. TaxDeductible, Travel" : ""}
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="flex-1 min-w-[120px] text-xs text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-none py-0.5"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notes (Optional)
            </label>
            <div className="relative">
              <AlignLeft size={15} className="absolute left-3 top-3 text-slate-400" />
              <textarea
                rows={2}
                placeholder="Add receipt notes, purpose, or split details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all active:scale-[0.98]"
            >
              {initialData ? 'Save Changes' : 'Record Entry'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
