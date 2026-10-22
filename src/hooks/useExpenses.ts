import { useState, useEffect, useMemo, useCallback } from 'react';
import { Transaction, CategoryBudget, Subscription, CurrencyConfig } from '../types';
import { INITIAL_TRANSACTIONS, INITIAL_BUDGETS, INITIAL_SUBSCRIPTIONS } from '../data/initialData';
import { CURRENCIES } from '../data/categories';

const STORAGE_KEYS = {
  TRANSACTIONS: 'finledger_transactions_v2',
  BUDGETS: 'finledger_budgets_v2',
  SUBSCRIPTIONS: 'finledger_subscriptions_v2',
  CURRENCY: 'finledger_currency_v2',
};

export function useExpenses() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading transactions from localStorage', e);
    }
    return INITIAL_TRANSACTIONS;
  });

  const [budgets, setBudgets] = useState<CategoryBudget[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading budgets from localStorage', e);
    }
    return INITIAL_BUDGETS;
  });

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading subscriptions from localStorage', e);
    }
    return INITIAL_SUBSCRIPTIONS;
  });

  const [currency, setCurrencyState] = useState<CurrencyConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENCY);
      if (saved) {
        const found = CURRENCIES.find((c) => c.code === saved);
        if (found) return found;
      }
    } catch (e) {
      console.error('Error loading currency', e);
    }
    return CURRENCIES[0];
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    } catch (e) {
      console.error('Failed to save budgets', e);
    }
  }, [budgets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions));
    } catch (e) {
      console.error('Failed to save subscriptions', e);
    }
  }, [subscriptions]);

  const setCurrency = useCallback((code: string) => {
    const found = CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
    setCurrencyState(found);
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENCY, found.code);
    } catch (e) {
      console.error('Failed to save currency', e);
    }
  }, []);

  // CRUD for transactions
  const addTransaction = useCallback((tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);
    return newTx;
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const duplicateTransaction = useCallback((id: string) => {
    setTransactions((prev) => {
      const existing = prev.find((t) => t.id === id);
      if (!existing) return prev;
      const dup: Transaction = {
        ...existing,
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      };
      return [dup, ...prev];
    });
  }, []);

  const deleteMultiple = useCallback((ids: string[]) => {
    const idSet = new Set(ids);
    setTransactions((prev) => prev.filter((t) => !idSet.has(t.id)));
  }, []);

  const toggleCleared = useCallback((id: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, cleared: !t.cleared } : t))
    );
  }, []);

  // Budgets
  const setCategoryBudget = useCallback((category: string, monthlyLimit: number) => {
    setBudgets((prev) => {
      const idx = prev.findIndex((b) => b.category.toLowerCase() === category.toLowerCase());
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], monthlyLimit };
        return copy;
      }
      return [...prev, { category, monthlyLimit }];
    });
  }, []);

  // Subscriptions
  const addSubscription = useCallback((sub: Omit<Subscription, 'id'>) => {
    const newSub: Subscription = {
      ...sub,
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    };
    setSubscriptions((prev) => [...prev, newSub]);
    return newSub;
  }, []);

  const updateSubscription = useCallback((id: string, updates: Partial<Subscription>) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  }, []);

  const deleteSubscription = useCallback((id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const toggleSubscriptionActive = useCallback((id: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  }, []);

  const logSubscriptionPaid = useCallback((subId: string) => {
    const sub = subscriptions.find((s) => s.id === subId);
    if (!sub) return;
    const today = new Date().toISOString().split('T')[0];
    addTransaction({
      type: 'expense',
      amount: sub.amount,
      date: today,
      category: sub.category,
      merchant: sub.name,
      notes: `Recurring ${sub.frequency} subscription`,
      paymentMethod: sub.paymentMethod,
      tags: ['Subscription', 'Recurring'],
      cleared: true,
      recurringId: sub.id,
    });
    updateSubscription(subId, { lastBilledDate: today });
  }, [subscriptions, addTransaction, updateSubscription]);

  // Reset & Clear
  const resetAllData = useCallback(() => {
    setTransactions(INITIAL_TRANSACTIONS);
    setBudgets(INITIAL_BUDGETS);
    setSubscriptions(INITIAL_SUBSCRIPTIONS);
    setCurrencyState(CURRENCIES[0]);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.BUDGETS);
    localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTIONS);
    localStorage.removeItem(STORAGE_KEYS.CURRENCY);
  }, []);

  const clearAllData = useCallback(() => {
    setTransactions([]);
    setBudgets([]);
    setSubscriptions([]);
  }, []);

  const importTransactions = useCallback((newTxs: Transaction[], replace: boolean = false) => {
    setTransactions((prev) => (replace ? newTxs : [...newTxs, ...prev]));
  }, []);

  // Current month metrics
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const currentDay = now.getDate();

  const metrics = useMemo(() => {
    const curMonthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const prevMonthPrefix = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

    let thisMonthExpenses = 0;
    let thisMonthIncome = 0;
    let prevMonthExpenses = 0;
    let prevMonthIncome = 0;
    let totalAllTimeExpenses = 0;
    let totalAllTimeIncome = 0;

    const expensesByCategory: Record<string, number> = {};
    const expensesByDate: Record<string, number> = {};

    transactions.forEach((tx) => {
      if (tx.type === 'expense') {
        totalAllTimeExpenses += tx.amount;
        if (tx.date.startsWith(curMonthPrefix)) {
          thisMonthExpenses += tx.amount;
          expensesByCategory[tx.category] = (expensesByCategory[tx.category] || 0) + tx.amount;
          expensesByDate[tx.date] = (expensesByDate[tx.date] || 0) + tx.amount;
        } else if (tx.date.startsWith(prevMonthPrefix)) {
          prevMonthExpenses += tx.amount;
        }
      } else if (tx.type === 'income') {
        totalAllTimeIncome += tx.amount;
        if (tx.date.startsWith(curMonthPrefix)) {
          thisMonthIncome += tx.amount;
        } else if (tx.date.startsWith(prevMonthPrefix)) {
          prevMonthIncome += tx.amount;
        }
      }
    });

    const netThisMonth = thisMonthIncome - thisMonthExpenses;
    const dailyAverage = currentDay > 0 ? thisMonthExpenses / currentDay : 0;
    const projectedMonthEnd = dailyAverage * daysInMonth;

    // Total monthly budget
    const totalBudget = budgets.reduce((acc, b) => acc + b.monthlyLimit, 0);
    const budgetUsedPercent = totalBudget > 0 ? (thisMonthExpenses / totalBudget) * 100 : 0;

    // Active subscriptions monthly cost
    const monthlySubscriptionsCost = subscriptions.reduce((acc, sub) => {
      if (!sub.active) return acc;
      if (sub.frequency === 'weekly') return acc + sub.amount * 4.33;
      if (sub.frequency === 'monthly') return acc + sub.amount;
      if (sub.frequency === 'quarterly') return acc + sub.amount / 3;
      if (sub.frequency === 'annual') return acc + sub.amount / 12;
      return acc;
    }, 0);

    return {
      thisMonthExpenses,
      thisMonthIncome,
      netThisMonth,
      prevMonthExpenses,
      prevMonthIncome,
      dailyAverage,
      projectedMonthEnd,
      totalBudget,
      budgetUsedPercent,
      monthlySubscriptionsCost,
      expensesByCategory,
      expensesByDate,
      daysInMonth,
      currentDay,
      daysRemaining: Math.max(0, daysInMonth - currentDay),
      totalAllTimeExpenses,
      totalAllTimeIncome,
    };
  }, [transactions, budgets, subscriptions, currentYear, currentMonth, currentDay, daysInMonth]);

  return {
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
    updateSubscription,
    deleteSubscription,
    toggleSubscriptionActive,
    logSubscriptionPaid,
    resetAllData,
    clearAllData,
    importTransactions,
    metrics,
  };
}
