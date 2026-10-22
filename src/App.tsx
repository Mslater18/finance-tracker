/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useExpenses } from './hooks/useExpenses';
import { Header, ActiveTab } from './components/Header';
import { SummaryKPIs } from './components/SummaryKPIs';
import { QuickAddBar } from './components/QuickAddBar';
import { TransactionList } from './components/TransactionList';
import { BudgetsView } from './components/BudgetsView';
import { SubscriptionsView } from './components/SubscriptionsView';
import { AnalyticsView } from './components/AnalyticsView';
import { TransactionFormModal } from './components/TransactionFormModal';
import { BillSplitModal } from './components/BillSplitModal';
import { ImportExportModal } from './components/ImportExportModal';
import { Transaction } from './types';
import { ArrowRight, Plus, RefreshCw, Target } from 'lucide-react';
import { formatCurrency } from './utils/format';

export default function App() {
  const {
    transactions,
    budgets,
    subscriptions,
    currency,
    setCurrency,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    duplicateTransaction,
    deleteMultiple,
    toggleCleared,
    setCategoryBudget,
    addSubscription,
    deleteSubscription,
    toggleSubscriptionActive,
    logSubscriptionPaid,
    resetAllData,
    clearAllData,
    importTransactions,
    metrics,
  } = useExpenses();

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSplitBillModalOpen, setIsSplitBillModalOpen] = useState(false);

  // Keyboard shortcut: Cmd/Ctrl + K or N to open new entry
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setEditingTransaction(null);
        setIsTransactionModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenNew = () => {
    setEditingTransaction(null);
    setIsTransactionModalOpen(true);
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsTransactionModalOpen(true);
  };

  const handleSaveTransaction = (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, data);
    } else {
      addTransaction(data);
    }
  };

  const handleLogSplitBillShare = (amount: number, merchant: string, notes: string) => {
    addTransaction({
      type: 'expense',
      amount,
      merchant,
      category: 'Food & Dining',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Credit Card',
      notes,
      tags: ['SplitBill'],
      cleared: true,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      
      {/* Top Bar Navigation */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewTransaction={handleOpenNew}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        currency={currency}
        onCurrencyChange={setCurrency}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* KPI Cards Strip */}
            <SummaryKPIs
              metrics={metrics}
              currency={currency}
              onNavigateToBudgets={() => setActiveTab('budgets')}
              onNavigateToSubscriptions={() => setActiveTab('subscriptions')}
            />

            {/* Quick Logging Bar */}
            <QuickAddBar
              currency={currency}
              onQuickAdd={addTransaction}
              onOpenSplitBill={() => setIsSplitBillModalOpen(true)}
              onOpenCustomModal={handleOpenNew}
            />

            {/* Two-Column Grid: Recent Transactions & Budget / Subscription preview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left 2 Cols: Recent Transactions */}
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Recent Activity
                    </h3>
                    <p className="text-xs text-slate-500">
                      Latest cash movements across your accounts
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('ledger')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 group"
                  >
                    <span>View all {transactions.length} records</span>
                    <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                <TransactionList
                  transactions={transactions.slice(0, 7)}
                  currency={currency}
                  onEdit={handleOpenEdit}
                  onDelete={deleteTransaction}
                  onDuplicate={duplicateTransaction}
                  onToggleCleared={toggleCleared}
                  onDeleteMultiple={deleteMultiple}
                  onNewTransaction={handleOpenNew}
                />
              </div>

              {/* Right Col: Category Targets & Recurring Subscriptions */}
              <div className="space-y-6">
                
                {/* Category Targets Card */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Target size={15} className="text-amber-500" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Monthly Category Targets
                      </h4>
                    </div>
                    <button
                      onClick={() => setActiveTab('budgets')}
                      className="text-xs font-medium text-slate-500 hover:text-slate-900"
                    >
                      Manage
                    </button>
                  </div>

                  <div className="space-y-3">
                    {budgets.slice(0, 4).map((b) => {
                      const spent = metrics.expensesByCategory[b.category] || 0;
                      const percent = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;
                      return (
                        <div key={b.category}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-medium text-slate-700 truncate max-w-[140px]">
                              {b.category}
                            </span>
                            <span className="font-mono text-slate-500 text-[11px]">
                              {formatCurrency(spent, currency)} / {formatCurrency(b.monthlyLimit, currency)}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                percent > 100 ? 'bg-rose-500' : percent > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, percent)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Active Subscriptions Card */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <RefreshCw size={15} className="text-blue-500" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Upcoming Subscriptions
                      </h4>
                    </div>
                    <button
                      onClick={() => setActiveTab('subscriptions')}
                      className="text-xs font-medium text-slate-500 hover:text-slate-900"
                    >
                      View all ({subscriptions.length})
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 text-xs">
                    {subscriptions.filter((s) => s.active).slice(0, 4).map((sub) => (
                      <div key={sub.id} className="py-2.5 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-800 block truncate max-w-[130px]">
                            {sub.name}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Renews day {sub.billingDay}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-slate-900">
                          {formatCurrency(sub.amount, currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* LEDGER TAB */}
        {activeTab === 'ledger' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  Transaction Ledger
                </h2>
                <p className="text-xs text-slate-500">
                  Search, filter, categorize, and audit all financial transactions
                </p>
              </div>

              <button
                onClick={handleOpenNew}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all"
              >
                <Plus size={14} />
                <span>Record Entry</span>
              </button>
            </div>

            <TransactionList
              transactions={transactions}
              currency={currency}
              onEdit={handleOpenEdit}
              onDelete={deleteTransaction}
              onDuplicate={duplicateTransaction}
              onToggleCleared={toggleCleared}
              onDeleteMultiple={deleteMultiple}
              onNewTransaction={handleOpenNew}
            />
          </div>
        )}

        {/* BUDGETS TAB */}
        {activeTab === 'budgets' && (
          <BudgetsView
            budgets={budgets}
            transactions={transactions}
            currency={currency}
            onUpdateBudget={setCategoryBudget}
          />
        )}

        {/* SUBSCRIPTIONS TAB */}
        {activeTab === 'subscriptions' && (
          <SubscriptionsView
            subscriptions={subscriptions}
            currency={currency}
            onAddSubscription={addSubscription}
            onDeleteSubscription={deleteSubscription}
            onToggleActive={toggleSubscriptionActive}
            onLogPaid={logSubscriptionPaid}
          />
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <AnalyticsView
            transactions={transactions}
            currency={currency}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">FinLedger</span>
            <span aria-hidden="true">·</span>
            <span>Personal & Business Expense Tracker</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="hover:text-slate-900 transition-colors"
            >
              Export CSV & Backup
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsSplitBillModalOpen(true)}
              className="hover:text-slate-900 transition-colors"
            >
              Split Bill Tool
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={handleOpenNew}
              className="hover:text-slate-900 transition-colors"
            >
              New Transaction
            </button>
          </div>
        </div>
      </footer>

      {/* Transaction Modal */}
      <TransactionFormModal
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        initialData={editingTransaction}
        currency={currency}
      />

      {/* Bill Split Calculator Modal */}
      <BillSplitModal
        isOpen={isSplitBillModalOpen}
        onClose={() => setIsSplitBillModalOpen(false)}
        currency={currency}
        onLogShare={handleLogSplitBillShare}
      />

      {/* Import / Export Settings Modal */}
      <ImportExportModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        transactions={transactions}
        budgets={budgets}
        subscriptions={subscriptions}
        currency={currency}
        onResetDemo={resetAllData}
        onClearAll={clearAllData}
        onImportBackup={(data) => {
          if (data.transactions) importTransactions(data.transactions, true);
        }}
      />

    </div>
  );
}
