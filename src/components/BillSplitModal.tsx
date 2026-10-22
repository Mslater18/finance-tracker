import React, { useState } from 'react';
import { X, Users, Calculator, ArrowRight, DollarSign, Percent } from 'lucide-react';
import { CurrencyConfig } from '../types';
import { formatCurrency } from '../utils/format';

interface BillSplitModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: CurrencyConfig;
  onLogShare: (amount: number, merchant: string, notes: string) => void;
}

export const BillSplitModal: React.FC<BillSplitModalProps> = ({
  isOpen,
  onClose,
  currency,
  onLogShare,
}) => {
  const [billAmount, setBillAmount] = useState<string>('');
  const [merchant, setMerchant] = useState<string>('');
  const [tipPercent, setTipPercent] = useState<number>(18);
  const [numPeople, setNumPeople] = useState<number>(2);

  if (!isOpen) return null;

  const baseBill = parseFloat(billAmount) || 0;
  const tipAmount = (baseBill * tipPercent) / 100;
  const totalBill = baseBill + tipAmount;
  const sharePerPerson = numPeople > 0 ? totalBill / numPeople : 0;
  const tipPerPerson = numPeople > 0 ? tipAmount / numPeople : 0;

  const handleLogMyShare = () => {
    if (sharePerPerson <= 0) return;
    onLogShare(
      Math.round(sharePerPerson * 100) / 100,
      merchant.trim() || 'Dining Out',
      `Split bill (${numPeople} ways: total ${formatCurrency(totalBill, currency)} incl ${tipPercent}% tip)`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator size={18} className="text-slate-800" />
            <h3 className="text-sm font-bold text-slate-900">
              Split Bill & Dining Calculator
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          
          {/* Bill Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Total Check / Bill Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-base font-semibold">
                {currency.symbol}
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                autoFocus
                value={billAmount}
                onChange={(e) => setBillAmount(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xl font-mono font-bold border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Restaurant / Venue */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Venue / Restaurant Name
            </label>
            <input
              type="text"
              placeholder="e.g. Osteria Morini, Blue Bottle"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Tip percentage tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tip Percentage
            </label>
            <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-100 rounded-xl">
              {[0, 10, 15, 18, 20].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setTipPercent(pct)}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    tipPercent === pct
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Number of People */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Number of People Splitting
              </label>
              <span className="text-xs font-mono font-semibold text-slate-900">
                {numPeople} {numPeople === 1 ? 'person' : 'people'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="15"
                value={numPeople}
                onChange={(e) => setNumPeople(parseInt(e.target.value) || 1)}
                className="w-full accent-slate-900 cursor-pointer"
              />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setNumPeople(Math.max(1, numPeople - 1))}
                  className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-bold flex items-center justify-center text-xs"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => setNumPeople(numPeople + 1)}
                  className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-bold flex items-center justify-center text-xs"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Summary Box */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Subtotal</span>
              <span className="font-mono text-slate-700">{formatCurrency(baseBill, currency)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Tip ({tipPercent}%)</span>
              <span className="font-mono text-slate-700">{formatCurrency(tipAmount, currency)}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Bill</span>
              <span className="font-mono">{formatCurrency(totalBill, currency)}</span>
            </div>
            <div className="flex items-center justify-between text-sm font-bold text-slate-900 pt-1">
              <span>Your Personal Share</span>
              <span className="font-mono text-emerald-600 text-lg">
                {formatCurrency(sharePerPerson, currency)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Close
            </button>
            <button
              type="button"
              disabled={sharePerPerson <= 0}
              onClick={handleLogMyShare}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              <span>Record My Share</span>
              <ArrowRight size={13} />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
