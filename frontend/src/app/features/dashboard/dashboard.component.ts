import { Component, inject, signal, computed } from '@angular/core';
import { TransactionService } from '../../core/services/transaction.service';
import { ToastService } from '../../shared/toast/toast.service';
import { Transaction, TransactionFilter } from '../../models/transaction.type';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  private transactionService = inject(TransactionService);
  private toastService = inject(ToastService);

  filter = signal<TransactionFilter>('day');

  private filteredTransactions = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.transactionService.getByFilter(this.filter(), today);
  });

  get transactions(): Transaction[] {
    return this.filteredTransactions();
  }

  get totalIncome(): number {
    return this.filteredTransactions()
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  get totalExpense(): number {
    return this.filteredTransactions()
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  get balance(): number {
    return this.totalIncome - this.totalExpense;
  }

  setFilter(e: Event): void {
    const value = (e.target as HTMLSelectElement).value;
    if (this.isValidFilter(value)) {
      this.filter.set(value);
    }
  }

  deleteTransaction(id: string): void {
    this.transactionService.delete(id);
    this.toastService.show('Transacao excluida com sucesso.');
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  }

  private isValidFilter(filter: string): filter is TransactionFilter {
    return ['day', 'week', 'month', 'year'].includes(filter);
  }
}
