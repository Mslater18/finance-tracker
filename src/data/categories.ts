import { CategoryDef } from '../types';

export const DEFAULT_EXPENSE_CATEGORIES: CategoryDef[] = [
  { id: 'cat_food', name: 'Food & Dining', type: 'expense', color: '#F97316', iconName: 'Utensils' },
  { id: 'cat_groceries', name: 'Groceries', type: 'expense', color: '#10B981', iconName: 'ShoppingCart' },
  { id: 'cat_housing', name: 'Housing & Rent', type: 'expense', color: '#6366F1', iconName: 'Home' },
  { id: 'cat_utilities', name: 'Utilities & Bills', type: 'expense', color: '#0EA5E9', iconName: 'Zap' },
  { id: 'cat_transport', name: 'Transportation', type: 'expense', color: '#EAB308', iconName: 'Car' },
  { id: 'cat_shopping', name: 'Shopping', type: 'expense', color: '#EC4899', iconName: 'ShoppingBag' },
  { id: 'cat_health', name: 'Health & Fitness', type: 'expense', color: '#14B8A6', iconName: 'Activity' },
  { id: 'cat_entertainment', name: 'Entertainment', type: 'expense', color: '#8B5CF6', iconName: 'Film' },
  { id: 'cat_tech', name: 'Tech & Software', type: 'expense', color: '#3B82F6', iconName: 'Laptop' },
  { id: 'cat_travel', name: 'Travel & Trips', type: 'expense', color: '#F43F5E', iconName: 'Plane' },
  { id: 'cat_personal', name: 'Personal Care', type: 'expense', color: '#A855F7', iconName: 'Smile' },
  { id: 'cat_education', name: 'Education', type: 'expense', color: '#06B6D4', iconName: 'GraduationCap' },
  { id: 'cat_other_exp', name: 'Other Expense', type: 'expense', color: '#64748B', iconName: 'MoreHorizontal' },
];

export const DEFAULT_INCOME_CATEGORIES: CategoryDef[] = [
  { id: 'cat_salary', name: 'Salary', type: 'income', color: '#10B981', iconName: 'Briefcase' },
  { id: 'cat_freelance', name: 'Freelance & Consulting', type: 'income', color: '#3B82F6', iconName: 'Code' },
  { id: 'cat_investments', name: 'Dividends & Capital', type: 'income', color: '#8B5CF6', iconName: 'TrendingUp' },
  { id: 'cat_cashback', name: 'Refunds & Cashback', type: 'income', color: '#F59E0B', iconName: 'RotateCcw' },
  { id: 'cat_other_inc', name: 'Other Income', type: 'income', color: '#64748B', iconName: 'PlusCircle' },
];

export const ALL_CATEGORIES = [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES];

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar (USD)', rateAgainstUSD: 1 },
  { code: 'EUR', symbol: '€', name: 'Euro (EUR)', rateAgainstUSD: 0.92 },
  { code: 'GBP', symbol: '£', name: 'British Pound (GBP)', rateAgainstUSD: 0.79 },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CAD)', rateAgainstUSD: 1.37 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (AUD)', rateAgainstUSD: 1.52 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (JPY)', rateAgainstUSD: 153.5 },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc (CHF)', rateAgainstUSD: 0.89 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (INR)', rateAgainstUSD: 83.4 },
];

export const PAYMENT_METHODS = [
  'Credit Card',
  'Debit Card',
  'Apple Pay',
  'Cash',
  'Bank Transfer',
  'PayPal',
  'Other',
] as const;
