import { Component, inject, signal, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TransactionService } from '../../core/services/transaction.service';
import { ToastService } from '../../shared/toast/toast.service';
import { Transaction, TransactionFilter } from '../../models/transaction.type';
import { DailyCosts } from '../../models/driver-config.type';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  private transactionService = inject(TransactionService);
  private toastService = inject(ToastService);

  filter = signal<TransactionFilter>('day');
  customDate = signal<string>('');
  showDatePicker = signal(false);

  dailyFixedCosts: DailyCosts | null = null;

  constructor() {
    const config = this.transactionService.getConfig();
    if (config) {
      this.dailyFixedCosts = this.transactionService.calculateDailyCosts(config);
    }
  }

  get showFixedCosts(): boolean {
    return this.filter() === 'day' && !this.customDate() && this.dailyFixedCosts !== null;
  }

  private filteredTransactions = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    if (this.customDate()) {
      return this.transactionService.getByFilter('day', this.customDate());
    }
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

  setFilter(filter: TransactionFilter): void {
    this.filter.set(filter);
    this.customDate.set('');
    this.showDatePicker.set(false);
  }

  setCustomDate(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (value) {
      this.customDate.set(value);
      this.filter.set('day');
    }
  }

  toggleDatePicker(): void {
    this.showDatePicker.update((v) => !v);
    if (!this.showDatePicker()) {
      this.customDate.set('');
    }
  }

  addFixedCosts(): void {
    if (!this.dailyFixedCosts) return;

    const today = new Date().toISOString().split('T')[0];
    this.transactionService.add('expense', 'Financiamento', this.dailyFixedCosts.dailyInstallment, today);
    this.transactionService.add('expense', 'Seguro', this.dailyFixedCosts.dailyInsurance, today);
    this.transactionService.add('expense', 'IPVA', this.dailyFixedCosts.dailyIpva, today);
    this.toastService.show('Custos fixos lancados como saida.');
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
}
