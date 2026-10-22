export type TransactionType = 'expense' | 'income' | 'transfer';

export type PaymentMethod = 
  | 'Credit Card'
  | 'Debit Card'
  | 'Cash'
  | 'Bank Transfer'
  | 'Apple Pay'
  | 'PayPal'
  | 'Other';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // YYYY-MM-DD
  category: string;
  merchant: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  tags?: string[];
  cleared?: boolean;
  recurringId?: string;
  createdAt: string;
}

export interface CategoryDef {
  id: string;
  name: string;
  type: 'expense' | 'income';
  color: string;
  iconName: string;
}

export interface CategoryBudget {
  category: string;
  monthlyLimit: number;
}

export type SubscriptionFrequency = 'weekly' | 'monthly' | 'quarterly' | 'annual';

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  category: string;
  frequency: SubscriptionFrequency;
  billingDay: number; // 1-31
  paymentMethod: PaymentMethod;
  active: boolean;
  notes?: string;
  lastBilledDate?: string;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  rateAgainstUSD: number;
}

export interface FilterOptions {
  period: 'all' | 'this_month' | 'last_month' | 'last_90_days' | 'this_year' | 'custom';
  startDate?: string;
  endDate?: string;
  type: 'all' | 'expense' | 'income';
  category: string;
  paymentMethod: string;
  search: string;
  sortBy: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc' | 'merchant_asc';
}
