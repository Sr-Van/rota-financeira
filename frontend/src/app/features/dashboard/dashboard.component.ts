import { Component, inject, signal, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TransactionService } from '../../core/services/transaction.service';
import { ToastService } from '../../shared/toast/toast.service';
import { Transaction, TransactionFilter } from '../../models/transaction.type';
import { Goals } from '../../models/goals.type';

interface ProgressData {
  current: number;
  target: number;
  percentage: number;
  barWidth: number;
  label: string;
}

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

  progress = computed<ProgressData | null>(() => {
    const goals = this.transactionService.getGoals();
    if (!goals) return null;

    const currentFilter = this.filter();
    if (currentFilter === 'year') return null;

    const transactions = this.filteredTransactions();
    const actualIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    let target: number;
    let label: string;
    switch (currentFilter) {
      case 'day':
        target = goals.dailyGross;
        label = 'Diária';
        break;
      case 'week':
        target = goals.weeklyGross;
        label = 'Semanal';
        break;
      case 'month':
        target = goals.monthlyGross;
        label = 'Mensal';
        break;
      default:
        return null;
    }

    if (target <= 0) return null;

    const percentage = (actualIncome / target) * 100;
    return {
      current: actualIncome,
      target,
      percentage,
      barWidth: Math.min(percentage, 100),
      label,
    };
  });

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

  progressBarColor(pct: number): string {
    if (pct >= 100) return 'bg-income';
    if (pct >= 50) return 'bg-[#3B82F6]';
    return 'bg-alert';
  }
}
