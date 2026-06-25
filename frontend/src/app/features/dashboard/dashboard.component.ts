import { Component, inject, signal, computed } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { TransactionService } from '../../core/services/transaction.service';
import { SettingsService } from '../../core/services/settings.service';
import { ToastService } from '../../shared/toast/toast.service';
import { Transaction, TransactionFilter } from '../../models/transaction.type';
import { getWeekStart, formatWeekRange, formatMonthLabel } from '../../core/utils/date.utils';

interface ProgressData {
  current: number;
  target: number;
  percentage: number;
  barWidth: number;
  label: string;
}

interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  private transactionService = inject(TransactionService);
  private settingsService = inject(SettingsService);
  private toastService = inject(ToastService);

  filter = signal<TransactionFilter>('day');
  referenceDate = signal<string>('');

  private filteredTransactions = computed(() => {
    const ref = this.referenceDate();
    if (ref) {
      return this.transactionService.getByFilter(this.filter(), ref);
    }
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

  availableWeeks = computed<SelectOption[]>(() => {
    const weeks = new Map<string, number>();
    for (const t of this.transactionService.getAll()) {
      const ws = getWeekStart(t.date);
      if (!weeks.has(ws)) {
        weeks.set(ws, new Date(ws + 'T00:00:00').getTime());
      }
    }
    const today = new Date().toISOString().split('T')[0];
    const currentWeekStart = getWeekStart(today);
    if (!weeks.has(currentWeekStart)) {
      weeks.set(currentWeekStart, new Date(currentWeekStart).getTime());
    }
    return Array.from(weeks.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([value]) => ({ value, label: formatWeekRange(value) }));
  });

  availableMonths = computed<SelectOption[]>(() => {
    const months = new Map<string, number>();
    for (const t of this.transactionService.getAll()) {
      const m = t.date.substring(0, 7);
      if (!months.has(m)) {
        months.set(m, new Date(m + '-01').getTime());
      }
    }
    const currentMonth = new Date().toISOString().split('T')[0].substring(0, 7);
    if (!months.has(currentMonth)) {
      months.set(currentMonth, new Date(currentMonth + '-01').getTime());
    }
    return Array.from(months.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([value]) => ({ value, label: formatMonthLabel(value) }));
  });

  progress = computed<ProgressData | null>(() => {
    const goals = this.settingsService.getGoals();
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
    const today = new Date().toISOString().split('T')[0];
    switch (filter) {
      case 'week':
        this.referenceDate.set(getWeekStart(today));
        break;
      case 'month':
        this.referenceDate.set(today.substring(0, 7));
        break;
      default:
        this.referenceDate.set('');
    }
  }

  setCustomDate(value: string): void {
    if (value) {
      this.referenceDate.set(value);
      this.filter.set('day');
    }
  }

  selectWeek(value: string): void {
    this.referenceDate.set(value);
  }

  selectMonth(value: string): void {
    this.referenceDate.set(value);
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
