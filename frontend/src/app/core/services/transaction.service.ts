import { Injectable, signal, computed } from '@angular/core';
import { Transaction, TransactionFilter, TransactionType } from '../../models/transaction.type';

const STORAGE_KEY = 'rota-financeira-transactions';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private transactions = signal<Transaction[]>(this.loadFromStorage());

  totalIncome = computed(() =>
    this.transactions()
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0),
  );

  totalExpense = computed(() =>
    this.transactions()
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0),
  );

  balance = computed(() => this.totalIncome() - this.totalExpense());

  getAll(): Transaction[] {
    return this.transactions();
  }

  getByFilter(filter: TransactionFilter, referenceDate: string): Transaction[] {
    const list = this.transactions();
    if (!list.length || !referenceDate) return [];

    return list.filter((t) => {
      switch (filter) {
        case 'day':
          return t.date === referenceDate;
        case 'week':
          return this.getWeekStart(t.date) === this.getWeekStart(referenceDate);
        case 'month':
          return t.date.substring(0, 7) === referenceDate.substring(0, 7);
        case 'year':
          return t.date.substring(0, 4) === referenceDate.substring(0, 4);
        default:
          return false;
      }
    });
  }

  private getWeekStart(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date);
    monday.setDate(diff);
    return monday.toISOString().split('T')[0];
  }

  add(type: TransactionType, description: string, amount: number, date: string): void {
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      type,
      description,
      amount,
      date,
      createdAt: new Date().toISOString(),
    };
    this.transactions.update((list) => [transaction, ...list]);
    this.saveToStorage();
  }

  delete(id: string): void {
    this.transactions.update((list) => list.filter((t) => t.id !== id));
    this.saveToStorage();
  }

  private loadFromStorage(): Transaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.transactions()));
  }
}
