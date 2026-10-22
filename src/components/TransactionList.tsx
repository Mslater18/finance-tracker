import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Trash2,
  Copy,
  Edit2,
  CheckCircle2,
  Circle,
  Plus,
  ArrowUpDown,
  MoreVertical,
} from 'lucide-react';
import { Transaction, CurrencyConfig } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { formatCurrency, formatDateRelative, exportToCSV, downloadFile } from '../utils/format';
import { ALL_CATEGORIES, PAYMENT_METHODS } from '../data/categories';

interface TransactionListProps {
  transactions: Transaction[];
  currency: CurrencyConfig;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleCleared: (id: string) => void;
  onDeleteMultiple: (ids: string[]) => void;
  onNewTransaction: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  currency,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleCleared,
  onDeleteMultiple,
  onNewTransaction,
}) => {
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState<'all' | 'this_month' | 'last_month' | 'last_90' | 'this_year'>('this_month');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc' | 'merchant_asc'>('date_desc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Date ranges
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const curMonthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  
  const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const prevMonthPrefix = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(now.getDate() - 90);
  const ninetyDaysStr = ninetyDaysAgo.toISOString().split('T')[0];

  const thisYearPrefix = `${currentYear}-`;

  // Filtering & Sorting
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Search
        if (search.trim()) {
          const query = search.toLowerCase();
          const matchMerchant = tx.merchant.toLowerCase().includes(query);
          const matchCategory = tx.category.toLowerCase().includes(query);
          const matchNotes = (tx.notes || '').toLowerCase().includes(query);
          const matchTags = (tx.tags || []).some((t) => t.toLowerCase().includes(query));
          if (!matchMerchant && !matchCategory && !matchNotes && !matchTags) return false;
        }

        // Period
        if (period === 'this_month' && !tx.date.startsWith(curMonthPrefix)) return false;
        if (period === 'last_month' && !tx.date.startsWith(prevMonthPrefix)) return false;
        if (period === 'last_90' && tx.date < ninetyDaysStr) return false;
        if (period === 'this_year' && !tx.date.startsWith(thisYearPrefix)) return false;

        // Type
        if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

        // Category
        if (categoryFilter !== 'all' && tx.category !== categoryFilter) return false;

        // Payment Method
        if (paymentFilter !== 'all' && tx.paymentMethod !== paymentFilter) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') return b.date.localeCompare(a.date);
        if (sortBy === 'date_asc') return a.date.localeCompare(b.date);
        if (sortBy === 'amount_desc') return b.amount - a.amount;
        if (sortBy === 'amount_asc') return a.amount - b.amount;
        if (sortBy === 'merchant_asc') return a.merchant.localeCompare(b.merchant);
        return 0;
      });
  }, [
    transactions,
    search,
    period,
    typeFilter,
    categoryFilter,
    paymentFilter,
    sortBy,
    curMonthPrefix,
    prevMonthPrefix,
    ninetyDaysStr,
    thisYearPrefix,
  ]);

  // Aggregate stats of filtered
  const filteredStats = useMemo(() => {
    let expenseTotal = 0;
    let incomeTotal = 0;
    filteredTransactions.forEach((t) => {
      if (t.type === 'expense') expenseTotal += t.amount;
      else if (t.type === 'income') incomeTotal += t.amount;
    });
    return {
      count: filteredTransactions.length,
      expenseTotal,
      incomeTotal,
      net: incomeTotal - expenseTotal,
    };
  }, [filteredTransactions]);

  const handleSelectAll = () => {
    if (selectedIds.length === filteredTransactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTransactions.map((t) => t.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} transactions?`)) {
      onDeleteMultiple(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleExportCSV = () => {
    const csvData = exportToCSV(filteredTransactions, currency);
    downloadFile(csvData, `finledger-transactions-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
      
      {/* Top Filter and Search Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 space-y-3.5">
        
        {/* Row 1: Search & Period buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search payee, tag, notes, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Interactive Period Segmented Control (Buttons per design constitution) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto shrink-0">
            <button
              onClick={() => setPeriod('this_month')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                period === 'this_month'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setPeriod('last_month')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                period === 'last_month'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last Month
            </button>
            <button
              onClick={() => setPeriod('last_90')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                period === 'last_90'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              90 Days
            </button>
            <button
              onClick={() => setPeriod('this_year')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                period === 'this_year'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Year
            </button>
            <button
              onClick={() => setPeriod('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                period === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Time
            </button>
          </div>

        </div>

        {/* Row 2: Secondary Filters (Type, Category, Method, Sort, Export) */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 text-xs">
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Type selector */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="py-1.5 px-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="all">All Types</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
            </select>

            {/* Category selector */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-1.5 px-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-900 max-w-[150px] truncate"
            >
              <option value="all">All Categories</option>
              {ALL_CATEGORIES.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Payment method selector */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="py-1.5 px-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="all">All Payment Methods</option>
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm} value={pm}>
                  {pm}
                </option>
              ))}
            </select>

            {/* Sort selector */}
            <div className="flex items-center gap-1.5 pl-1 text-slate-500">
              <ArrowUpDown size={13} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="py-1.5 px-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="date_desc">Date (Newest first)</option>
                <option value="date_asc">Date (Oldest first)</option>
                <option value="amount_desc">Amount (Highest)</option>
                <option value="amount_asc">Amount (Lowest)</option>
                <option value="merchant_asc">Merchant (A to Z)</option>
              </select>
            </div>
          </div>

          {/* Action buttons on right */}
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-semibold transition-colors"
              >
                <Trash2 size={13} />
                <span>Delete {selectedIds.length}</span>
              </button>
            )}

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>
          </div>

        </div>

        {/* Row 3: Filter Summary Strip (Zero-pill text metadata per constitution) */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Showing {filteredStats.count} entries</span>
            <span aria-hidden="true">·</span>
            <span>Expenses: <strong className="font-mono text-slate-700">{formatCurrency(filteredStats.expenseTotal, currency)}</strong></span>
            {filteredStats.incomeTotal > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span>Income: <strong className="font-mono text-emerald-700">{formatCurrency(filteredStats.incomeTotal, currency)}</strong></span>
              </>
            )}
          </div>
          {(search || categoryFilter !== 'all' || paymentFilter !== 'all' || typeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setCategoryFilter('all');
                setPaymentFilter('all');
                setTypeFilter('all');
              }}
              className="text-slate-500 hover:text-slate-900 underline underline-offset-2"
            >
              Reset filters
            </button>
          )}
        </div>

      </div>

      {/* Table / Ledger Rows */}
      {filteredTransactions.length === 0 ? (
        <div className="py-16 text-center px-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <Filter size={20} />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">No matching transactions found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Try adjusting your search criteria, clearing the category filters, or record a new transaction.
          </p>
          <button
            onClick={onNewTransaction}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Plus size={14} />
            <span>Record New Expense</span>
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="py-3 pl-4 pr-2 w-8">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === filteredTransactions.length}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                    aria-label="Select all rows"
                  />
                </th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Transaction</th>
                <th className="py-3 px-3 hidden sm:table-cell">Category</th>
                <th className="py-3 px-3 hidden md:table-cell">Payment Method</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 pr-4 pl-2 text-right w-12">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {filteredTransactions.map((tx) => {
                const isSelected = selectedIds.includes(tx.id);
                return (
                  <tr
                    key={tx.id}
                    className={`hover:bg-slate-50/80 transition-colors group ${
                      isSelected ? 'bg-slate-50' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 pl-4 pr-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(tx.id)}
                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                        aria-label={`Select transaction ${tx.merchant}`}
                      />
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3 whitespace-nowrap text-slate-600 font-mono">
                      {formatDateRelative(tx.date)}
                    </td>

                    {/* Payee / Merchant & Zero-Pill Meta */}
                    <td className="py-3 px-3 max-w-xs">
                      <div className="flex items-center gap-2.5">
                        <CategoryIcon categoryName={tx.category} size={15} className="w-7 h-7" />
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 truncate">
                            {tx.merchant}
                          </div>
                          {/* Zero-pill metadata per constitution (clean text with separators) */}
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5 truncate">
                            <span className="sm:hidden">{tx.category}</span>
                            <span className="sm:hidden" aria-hidden="true">·</span>
                            <span>{tx.notes || (tx.tags && tx.tags.length > 0 ? `#${tx.tags.join(', #')}` : tx.paymentMethod)}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category Column (Tablet+) */}
                    <td className="py-3 px-3 hidden sm:table-cell text-slate-700 whitespace-nowrap">
                      {tx.category}
                    </td>

                    {/* Payment Method (Desktop+) */}
                    <td className="py-3 px-3 hidden md:table-cell text-slate-600 whitespace-nowrap font-mono">
                      {tx.paymentMethod}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <span
                        className={`font-mono font-bold text-sm tabular-nums ${
                          tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {formatCurrency(tx.amount, currency)}
                      </span>
                    </td>

                    {/* Row Actions */}
                    <td className="py-3 pr-4 pl-2 text-right relative">
                      <div className="flex items-center justify-end gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(tx)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                          title="Edit transaction"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => onDuplicate(tx.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                          title="Duplicate transaction"
                        >
                          <Copy size={13} />
                        </button>
                        <button
                          onClick={() => onDelete(tx.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
