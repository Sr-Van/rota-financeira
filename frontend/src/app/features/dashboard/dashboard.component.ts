import { Component, inject, signal, computed } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { DailyCloseService } from '../../core/services/daily-close.service';
import { SettingsService } from '../../core/services/settings.service';
import { CostCalculationService } from '../../core/services/cost-calculation.service';
import { ToastService } from '../../shared/toast/toast.service';
import { ConfirmModalComponent } from '../../shared/confirm-modal/confirm-modal.component';
import { DailyClose, DailyCloseFilter } from '../../models/transaction.type';
import { getWeekStart, formatWeekRange, formatMonthLabel } from '../../core/utils/date.utils';

interface OperationalMetrics {
  totalKm: number;
  totalHours: number;
  totalRides: number;
  incomePerKm: number;
  incomePerHour: number;
  incomePerRide: number;
  costPercent: number;
  profitPercent: number;
}

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

interface DisplayEntry {
  id: string;
  date: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  closeId: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, RouterLink, ConfirmModalComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  private dailyCloseService = inject(DailyCloseService);
  private settingsService = inject(SettingsService);
  private costCalculation = inject(CostCalculationService);
  private toastService = inject(ToastService);

  filter = signal<DailyCloseFilter>('day');
  referenceDate = signal<string>('');
  pendingDelete = signal<DisplayEntry | null>(null);

  metrics = computed<OperationalMetrics>(() => {
    const closes = this.filteredCloses();
    const totalKm = closes.reduce((s, d) => s + d.kmDriven, 0);
    const totalHours = closes.reduce((s, d) => s + d.hoursWorked, 0);
    const totalRides = closes.reduce((s, d) => s + d.rideCount, 0);
    const income = this.totalIncome;
    const expense = this.totalExpense;
    return {
      totalKm,
      totalHours,
      totalRides,
      incomePerKm: totalKm > 0 ? income / totalKm : 0,
      incomePerHour: totalHours > 0 ? income / totalHours : 0,
      incomePerRide: totalRides > 0 ? income / totalRides : 0,
      costPercent: income > 0 ? (expense / income) * 100 : 0,
      profitPercent: income > 0 ? ((income - expense) / income) * 100 : 0,
    };
  });

  private filteredCloses = computed(() => {
    const ref = this.referenceDate();
    if (ref) {
      return this.dailyCloseService.getByFilter(this.filter(), ref);
    }
    const today = new Date().toISOString().split('T')[0];
    return this.dailyCloseService.getByFilter(this.filter(), today);
  });

  private displayEntries = computed<DisplayEntry[]>(() => {
    const config = this.settingsService.getConfig();
    const dailyCosts = config ? this.costCalculation.calculateDailyCosts(config) : null;

    const entries: DisplayEntry[] = [];
    for (const dc of this.filteredCloses()) {
      entries.push({
        id: `income-${dc.id}`,
        date: dc.date,
        type: 'income',
        description: 'Faturamento',
        amount: dc.totalEarnings,
        closeId: dc.id,
      });

      const fuelAmount = dc.kmDriven / dc.vehicleConsumption * dc.fuelCost;
      entries.push({
        id: `fuel-${dc.id}`,
        date: dc.date,
        type: 'expense',
        description: 'Combustivel/Energia',
        amount: fuelAmount,
        closeId: dc.id,
      });

      if (dailyCosts) {
        entries.push(
          {
            id: `installment-${dc.id}`,
            date: dc.date,
            type: 'expense',
            description: 'Custo Fixo - Parcela Veiculo',
            amount: dailyCosts.dailyInstallment,
            closeId: dc.id,
          },
          {
            id: `insurance-${dc.id}`,
            date: dc.date,
            type: 'expense',
            description: 'Custo Fixo - Seguro',
            amount: dailyCosts.dailyInsurance,
            closeId: dc.id,
          },
          {
            id: `ipva-${dc.id}`,
            date: dc.date,
            type: 'expense',
            description: 'Custo Fixo - IPVA',
            amount: dailyCosts.dailyIpva,
            closeId: dc.id,
          },
        );
      }
    }
    return entries;
  });

  get entries(): DisplayEntry[] {
    return this.displayEntries();
  }

  get totalIncome(): number {
    return this.displayEntries()
      .filter((e) => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0);
  }

  get totalExpense(): number {
    return this.displayEntries()
      .filter((e) => e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);
  }

  get balance(): number {
    return this.totalIncome - this.totalExpense;
  }

  availableWeeks = computed<SelectOption[]>(() => {
    const weeks = new Map<string, number>();
    for (const d of this.dailyCloseService.getAll()) {
      const ws = getWeekStart(d.date);
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
    for (const d of this.dailyCloseService.getAll()) {
      const m = d.date.substring(0, 7);
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

    const actualIncome = this.displayEntries()
      .filter((e) => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0);

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

  setFilter(filter: DailyCloseFilter): void {
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

  confirmDelete(entry: DisplayEntry): void {
    this.pendingDelete.set(entry);
  }

  executeDelete(): void {
    const entry = this.pendingDelete();
    if (!entry) return;
    this.dailyCloseService.delete(entry.closeId);
    this.pendingDelete.set(null);
    this.toastService.show('Fechamento excluido com sucesso.');
  }

  cancelDelete(): void {
    this.pendingDelete.set(null);
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
