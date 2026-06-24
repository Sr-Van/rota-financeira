import { Injectable, signal, computed } from '@angular/core';
import { Transaction, TransactionFilter, TransactionType, DailyClose } from '../../models/transaction.type';
import {
  DriverConfig,
  DailyCosts,
  FixedCostPerKm,
  VariableCostsPerKm,
  CombinedCosts,
  VehicleType,
} from '../../models/driver-config.type';

const STORAGE_KEY = 'rota-financeira-transactions';
const DAILY_CLOSE_KEY = 'rota-financeira-daily-closes';
const CONFIG_STORAGE_KEY = 'rota-financeira-driver-config';

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

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

  saveDailyClose(data: {
    date: string;
    kmDriven: number;
    hoursWorked: number;
    rideCount: number;
    vehicleConsumption: number;
  }): void {
    const dailyClose: DailyClose = {
      id: crypto.randomUUID(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    const stored = this.loadDailyClosesFromStorage();
    stored.push(dailyClose);
    localStorage.setItem(DAILY_CLOSE_KEY, JSON.stringify(stored));
  }

  private loadDailyClosesFromStorage(): DailyClose[] {
    try {
      const data = localStorage.getItem(DAILY_CLOSE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
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

  saveConfig(config: DriverConfig): void {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  }

  getConfig(): DriverConfig | null {
    try {
      const data = localStorage.getItem(CONFIG_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  calculateDailyCosts(config: DriverConfig): DailyCosts {
    const dailyInstallment = round(config.vehicleInstallment / config.daysWorked);
    const dailyInsurance = round(config.insurance / config.daysWorked);
    const dailyIpva = round(config.ipva / 12 / config.daysWorked);
    const totalDaily = round(dailyInstallment + dailyInsurance + dailyIpva);
    const dailyPerKm = round(totalDaily / (config.estimatedKm / config.daysWorked));
    return { dailyInstallment, dailyInsurance, dailyIpva, totalDaily, dailyPerKm };
  }

  calculateFixedCostPerKm(config: DriverConfig): FixedCostPerKm {
    const monthlyTotal = round(config.vehicleInstallment + config.insurance + config.ipva / 12);
    const costPerKm = round(monthlyTotal / config.estimatedKm);
    return { monthlyTotal, costPerKm };
  }

  calculateVariableCostsPerKm(config: DriverConfig): VariableCostsPerKm {
    let fuelCostPerKm: number;
    let kmPerLiterEquivalent: number | undefined;

    if (config.vehicleType === 'electric') {
      fuelCostPerKm = round((config.batteryCapacity / config.totalAutonomy) * config.kwhPrice);
      kmPerLiterEquivalent = this.calculateKmPerLiterEquivalent(fuelCostPerKm, config.gasolinePrice);
    } else {
      fuelCostPerKm = round(config.fuelPrice / config.fuelConsumption);
    }

    const reviewCostPerKm = round(config.reviewCost / config.reviewInterval);
    const tireCostPerKm = round(config.tireCost / config.tireLongevity);
    const maintenanceCostPerKm = round(config.maintenanceReserve / config.estimatedKm);
    const totalVariableCostPerKm = round(
      fuelCostPerKm + reviewCostPerKm + tireCostPerKm + maintenanceCostPerKm,
    );
    return {
      fuelCostPerKm,
      reviewCostPerKm,
      tireCostPerKm,
      maintenanceCostPerKm,
      totalVariableCostPerKm,
      ...(kmPerLiterEquivalent !== undefined && { kmPerLiterEquivalent }),
    };
  }

  calculateKmPerLiterEquivalent(fuelCostPerKm: number, gasolinePrice: number): number {
    if (!gasolinePrice || gasolinePrice <= 0) return 0;
    const costPer100km = fuelCostPerKm * 100;
    const equivalentLiters = costPer100km / gasolinePrice;
    if (equivalentLiters <= 0) return 0;
    return round(100 / equivalentLiters);
  }

  calculateCombinedCosts(fixed: FixedCostPerKm, variable: VariableCostsPerKm): CombinedCosts {
    return {
      fixedCostPerKm: fixed.costPerKm,
      variableCostPerKm: variable.totalVariableCostPerKm,
      totalCostPerKm: round(fixed.costPerKm + variable.totalVariableCostPerKm),
    };
  }

  calculateMinimumGainPerKm(totalCostPerKm: number): number {
    return round(totalCostPerKm / 0.5);
  }

  calculateIdealGainPerKm(totalCostPerKm: number): number {
    return round(totalCostPerKm / 0.4);
  }
}
