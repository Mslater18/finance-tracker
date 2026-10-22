import React, { useState, useMemo } from 'react';
import { BarChart3, PieChart, TrendingUp, DollarSign, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Transaction, CurrencyConfig } from '../types';
import { formatCurrency } from '../utils/format';
import { CategoryIcon } from './CategoryIcon';
import { ALL_CATEGORIES } from '../data/categories';

interface AnalyticsViewProps {
  transactions: Transaction[];
  currency: CurrencyConfig;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ transactions, currency }) => {
  const [timeframe, setTimeframe] = useState<'this_month' | 'last_month' | 'last_90' | 'all'>('this_month');
  const [hoveredDay, setHoveredDay] = useState<{ day: number; amount: number; dateStr: string } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const curMonthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

  const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const prevMonthPrefix = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(now.getDate() - 90);
  const ninetyDaysStr = ninetyDaysAgo.toISOString().split('T')[0];

  // Filtered dataset according to timeframe
  const periodTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (timeframe === 'this_month') return t.date.startsWith(curMonthPrefix);
      if (timeframe === 'last_month') return t.date.startsWith(prevMonthPrefix);
      if (timeframe === 'last_90') return t.date >= ninetyDaysStr;
      return true;
    });
  }, [transactions, timeframe, curMonthPrefix, prevMonthPrefix, ninetyDaysStr]);

  // Calculations
  const {
    totalExpenses,
    totalIncome,
    categoryBreakdown,
    merchantBreakdown,
    paymentMethodBreakdown,
    dailySpending,
    daysInMonth,
  } = useMemo(() => {
    let exp = 0;
    let inc = 0;
    const catMap: Record<string, { amount: number; count: number }> = {};
    const merchMap: Record<string, { amount: number; count: number; category: string }> = {};
    const pmMap: Record<string, number> = {};
    const dailyMap: Record<number, number> = {};

    const targetMonth = timeframe === 'last_month' ? prevMonthDate.getMonth() : currentMonth;
    const targetYear = timeframe === 'last_month' ? prevMonthDate.getFullYear() : currentYear;
    const daysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();

    for (let i = 1; i <= daysInTargetMonth; i++) {
      dailyMap[i] = 0;
    }

    periodTransactions.forEach((t) => {
      if (t.type === 'expense') {
        exp += t.amount;
        // Category
        if (!catMap[t.category]) catMap[t.category] = { amount: 0, count: 0 };
        catMap[t.category].amount += t.amount;
        catMap[t.category].count += 1;

        // Merchant
        if (!merchMap[t.merchant]) merchMap[t.merchant] = { amount: 0, count: 0, category: t.category };
        merchMap[t.merchant].amount += t.amount;
        merchMap[t.merchant].count += 1;

        // Payment Method
        pmMap[t.paymentMethod] = (pmMap[t.paymentMethod] || 0) + t.amount;

        // Daily
        const [y, m, d] = t.date.split('-').map(Number);
        if (m === targetMonth + 1 && dailyMap[d] !== undefined) {
          dailyMap[d] += t.amount;
        }
      } else if (t.type === 'income') {
        inc += t.amount;
      }
    });

    const sortedCategories = Object.entries(catMap)
      .map(([name, data]) => ({
        name,
        amount: data.amount,
        count: data.count,
        percent: exp > 0 ? (data.amount / exp) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const sortedMerchants = Object.entries(merchMap)
      .map(([name, data]) => ({
        name,
        amount: data.amount,
        count: data.count,
        category: data.category,
        percent: exp > 0 ? (data.amount / exp) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);

    const sortedPaymentMethods = Object.entries(pmMap)
      .map(([method, amount]) => ({
        method,
        amount,
        percent: exp > 0 ? (amount / exp) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      totalExpenses: exp,
      totalIncome: inc,
      categoryBreakdown: sortedCategories,
      merchantBreakdown: sortedMerchants,
      paymentMethodBreakdown: sortedPaymentMethods,
      dailySpending: dailyMap,
      daysInMonth: daysInTargetMonth,
    };
  }, [periodTransactions, timeframe, currentMonth, currentYear, prevMonthDate]);

  // Max daily spend for scaling the bar chart
  const maxDaily = useMemo(() => {
    let max = 1;
    Object.values(dailySpending).forEach((val) => {
      if (val > max) max = val;
    });
    return max;
  }, [dailySpending]);

  const dailyAvg = totalExpenses / Math.max(1, daysInMonth);

  return (
    <div className="space-y-6">
      
      {/* Header and Timeframe Filter */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Financial Analytics & Insights
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Visualize your spending patterns, cashflow balance, and top merchant drains.
          </p>
        </div>

        {/* Timeframe switch */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setTimeframe('this_month')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              timeframe === 'this_month' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setTimeframe('last_month')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              timeframe === 'last_month' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last Month
          </button>
          <button
            onClick={() => setTimeframe('last_90')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              timeframe === 'last_90' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            90 Days
          </button>
          <button
            onClick={() => setTimeframe('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              timeframe === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Cash Flow Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 uppercase font-semibold">
            <span>Period Outflow</span>
            <ArrowDownRight size={16} className="text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900">
            {formatCurrency(totalExpenses, currency)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {periodTransactions.filter((t) => t.type === 'expense').length} expense transactions
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 uppercase font-semibold">
            <span>Period Inflow</span>
            <ArrowUpRight size={16} className="text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-600">
            {formatCurrency(totalIncome, currency)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {periodTransactions.filter((t) => t.type === 'income').length} deposits & earnings
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 uppercase font-semibold">
            <span>Net Cash Flow</span>
            <DollarSign size={16} className="text-slate-700" />
          </div>
          <div className={`mt-2 text-2xl font-bold font-mono ${totalIncome - totalExpenses >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
            {formatCurrency(totalIncome - totalExpenses, currency)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Savings rate: {totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* Daily Spending Trend Chart */}
      {(timeframe === 'this_month' || timeframe === 'last_month') && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Daily Expense Distribution ({timeframe === 'this_month' ? 'This Month' : 'Last Month'})
              </h3>
              <p className="text-xs text-slate-500">
                Daily expenditure across all {daysInMonth} days of the billing period
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-semibold text-slate-700">
                Avg: {formatCurrency(dailyAvg, currency)} / day
              </span>
            </div>
          </div>

          {/* Interactive SVG Bar Chart */}
          <div className="relative pt-6 pb-2">
            
            {/* Tooltip on hover */}
            {hoveredDay && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] font-mono py-1 px-2.5 rounded-lg shadow-md z-10 pointer-events-none whitespace-nowrap">
                Day {hoveredDay.day}: {formatCurrency(hoveredDay.amount, currency)}
              </div>
            )}

            <div className="h-44 w-full flex items-end gap-1.5 sm:gap-2">
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const amount = dailySpending[day] || 0;
                const heightPercent = maxDaily > 0 ? (amount / maxDaily) * 100 : 0;
                const isSelected = hoveredDay?.day === day;

                return (
                  <div
                    key={day}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                    onMouseEnter={() => setHoveredDay({ day, amount, dateStr: `Day ${day}` })}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    <div
                      className={`w-full rounded-t transition-all duration-150 ${
                        amount === 0
                          ? 'bg-slate-100 h-1'
                          : isSelected
                          ? 'bg-slate-900'
                          : amount > dailyAvg * 1.5
                          ? 'bg-rose-400 hover:bg-rose-500'
                          : 'bg-slate-700 hover:bg-slate-900'
                      }`}
                      style={{ height: amount > 0 ? `${Math.max(6, heightPercent)}%` : '4px' }}
                    />
                    <span className="text-[10px] text-slate-400 font-mono mt-2 hidden sm:block">
                      {day % 5 === 0 || day === 1 ? day : ''}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Daily average horizontal guide line */}
            <div
              className="absolute left-0 right-0 border-b border-dashed border-slate-300 pointer-events-none"
              style={{
                bottom: `${(dailyAvg / maxDaily) * 100 * 0.75 + 28}px`,
              }}
            >
              <span className="text-[10px] text-slate-400 bg-white px-1 -top-2.5 right-0 absolute font-mono">
                avg
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Two Column Section: Category Distribution & Top Merchants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Spending Breakdown */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Category Spending</h3>
              <p className="text-xs text-slate-500">Expenditure share by budget sector</p>
            </div>
            <span className="text-xs font-mono font-medium text-slate-500">
              {categoryBreakdown.length} active categories
            </span>
          </div>

          <div className="space-y-3.5 mt-2">
            {categoryBreakdown.map((cat) => {
              return (
                <div key={cat.name} className="group">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2">
                      <CategoryIcon categoryName={cat.name} size={13} className="w-6 h-6" />
                      <span className="font-semibold text-slate-800">{cat.name}</span>
                      <span className="text-slate-400 text-[11px] font-mono">({cat.count} txns)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">
                        {formatCurrency(cat.amount, currency)}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px] w-9 text-right">
                        {Math.round(cat.percent)}%
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-slate-800 group-hover:bg-slate-900 transition-all duration-300"
                      style={{ width: `${cat.percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Merchants Leaderboard & Payment Methods */}
        <div className="space-y-6">
          
          {/* Top Merchants */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Top Payees & Merchants</h3>
                <p className="text-xs text-slate-500">Highest volume commercial recipients</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {merchantBreakdown.map((m, idx) => (
                <div key={m.name} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-slate-400 font-semibold w-4">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-semibold text-slate-900 block truncate max-w-[180px]">
                        {m.name}
                      </span>
                      {/* Zero-pill metadata per constitution */}
                      <span className="text-[11px] text-slate-400">
                        {m.category} · {m.count} order{m.count > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-900 block">
                      {formatCurrency(m.amount, currency)}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {Math.round(m.percent)}% of total
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method Distribution */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Payment Method Breakdown
            </h3>
            <p className="text-xs text-slate-500 mb-4">Channels used to settle payments</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {paymentMethodBreakdown.map((pm) => (
                <div key={pm.method} className="bg-slate-50 border border-slate-200/60 rounded-xl p-3">
                  <span className="text-xs font-semibold text-slate-700 block truncate">
                    {pm.method}
                  </span>
                  <div className="mt-1 font-mono font-bold text-sm text-slate-900">
                    {formatCurrency(pm.amount, currency)}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {Math.round(pm.percent)}% of spend
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
