export type TransactionType = 'income' | 'expense';
export type TransactionFilter = 'day' | 'week' | 'month' | 'year';

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  date: string;
  createdAt: string;
}
