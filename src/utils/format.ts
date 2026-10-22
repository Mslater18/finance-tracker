import { CurrencyConfig, Transaction } from '../types';
import { ALL_CATEGORIES, CURRENCIES, PAYMENT_METHODS } from '../data/categories';

export function formatCurrency(amount: number, currency: CurrencyConfig = CURRENCIES[0]): string {
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);
  const formattedNumber = absVal.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const withSymbol = currency.code === 'JPY' 
    ? `${currency.symbol}${Math.round(absVal).toLocaleString('en-US')}` 
    : `${currency.symbol}${formattedNumber}`;

  return isNegative ? `-${withSymbol}` : withSymbol;
}

export function formatDateRelative(dateStr: string): string {
  if (!dateStr) return '';
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (dateStr === todayStr) return 'Today';
  if (dateStr === yesterdayStr) return 'Yesterday';

  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: year !== now.getFullYear() ? 'numeric' : undefined });
}

export function formatFullDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

export function parseQuickExpense(text: string): Partial<Transaction> | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  // Find amount: $45, 45.50, 45, etc.
  const amountMatch = trimmed.match(/\$?(\d+(?:\.\d{1,2})?)/);
  if (!amountMatch) return null;

  const amount = parseFloat(amountMatch[1]);
  let remaining = trimmed.replace(amountMatch[0], '').replace(/\s+/g, ' ').trim();

  // Check for relative dates
  let date = new Date().toISOString().split('T')[0];
  if (/\byesterday\b/i.test(remaining)) {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    date = d.toISOString().split('T')[0];
    remaining = remaining.replace(/\byesterday\b/gi, '').trim();
  } else if (/\btoday\b/i.test(remaining)) {
    remaining = remaining.replace(/\btoday\b/gi, '').trim();
  }

  // Detect category keywords
  let matchedCategory = 'Other Expense';
  const lowerRemaining = remaining.toLowerCase();

  const categoryKeywordMap: Record<string, string[]> = {
    'Food & Dining': ['coffee', 'cafe', 'dinner', 'lunch', 'breakfast', 'restaurant', 'burger', 'pizza', 'sushi', 'eat', 'meal', 'drink', 'bar'],
    'Groceries': ['grocery', 'groceries', 'market', 'trader joe', 'whole foods', 'safeway', 'costco', 'supermarket', 'walmart', 'food'],
    'Transportation': ['uber', 'lyft', 'taxi', 'gas', 'fuel', 'metro', 'subway', 'bus', 'train', 'parking', 'toll', 'transit'],
    'Housing & Rent': ['rent', 'mortgage', 'lease', 'apartment', 'landlord'],
    'Utilities & Bills': ['electric', 'water', 'internet', 'wifi', 'utility', 'gas bill', 'power', 'phone', 'verizon', 'att'],
    'Shopping': ['amazon', 'clothes', 'shoes', 'uniqlo', 'target', 'order', 'store', 'shop'],
    'Health & Fitness': ['gym', 'fitness', 'doctor', 'pharmacy', 'medicine', 'hospital', 'dentist', 'yoga'],
    'Entertainment': ['movie', 'cinema', 'concert', 'game', 'tickets', 'theatre', 'show'],
    'Tech & Software': ['software', 'subscription', 'apple', 'google', 'cloud', 'aws', 'github', 'spotify', 'netflix'],
    'Salary': ['salary', 'paycheck', 'payroll', 'wages'],
    'Freelance & Consulting': ['client', 'contract', 'freelance', 'consulting'],
  };

  for (const [catName, keywords] of Object.entries(categoryKeywordMap)) {
    if (keywords.some((kw) => lowerRemaining.includes(kw))) {
      matchedCategory = catName;
      break;
    }
  }

  // Determine type
  const isIncome = matchedCategory === 'Salary' || matchedCategory === 'Freelance & Consulting' || /\bincome|deposit|refund|paycheck\b/i.test(trimmed);

  // Clean remaining to extract merchant/payee
  let merchant = remaining
    .replace(/^at\s+/i, '')
    .replace(/\s+for\s+/i, ' - ')
    .trim();

  if (!merchant) {
    merchant = matchedCategory;
  } else {
    // Capitalize first letter of each word
    merchant = merchant
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  return {
    amount,
    date,
    category: matchedCategory,
    merchant,
    type: isIncome ? 'income' : 'expense',
    paymentMethod: 'Credit Card',
  };
}

export function exportToCSV(transactions: Transaction[], currency: CurrencyConfig): string {
  const headers = ['ID', 'Date', 'Type', 'Category', 'Merchant', `Amount (${currency.code})`, 'Payment Method', 'Tags', 'Notes'];
  const rows = transactions.map((t) => [
    t.id,
    t.date,
    t.type,
    `"${(t.category || '').replace(/"/g, '""')}"`,
    `"${(t.merchant || '').replace(/"/g, '""')}"`,
    t.amount.toFixed(2),
    `"${(t.paymentMethod || '').replace(/"/g, '""')}"`,
    `"${(t.tags || []).join('; ').replace(/"/g, '""')}"`,
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function downloadFile(content: string, fileName: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
