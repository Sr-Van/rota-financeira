import { Injectable, inject, signal, computed } from '@angular/core';
import { DailyClose, DailyCloseFilter } from '../../models/transaction.type';
import { ApiService } from './api.service';
import { getWeekStart } from '../utils/date.utils';

@Injectable({ providedIn: 'root' })
export class DailyCloseService {
  private api = inject(ApiService);
  private closes = signal<DailyClose[]>(this.api.getDailyCloses());

  getAll(): DailyClose[] {
    return this.closes();
  }

  getByFilter(filter: DailyCloseFilter, referenceDate: string): DailyClose[] {
    const list = this.closes();
    if (!list.length || !referenceDate) return [];

    return list.filter((d) => {
      switch (filter) {
        case 'day':
          return d.date === referenceDate;
        case 'week':
          return getWeekStart(d.date) === getWeekStart(referenceDate);
        case 'month':
          return d.date.substring(0, 7) === referenceDate.substring(0, 7);
        case 'year':
          return d.date.substring(0, 4) === referenceDate.substring(0, 4);
        default:
          return false;
      }
    });
  }

  save(data: Omit<DailyClose, 'id' | 'createdAt'>): void {
    const saved = this.api.saveDailyClose(data);
    this.closes.update((list) => [saved, ...list]);
  }

  delete(id: string): void {
    this.api.deleteDailyClose(id);
    this.closes.update((list) => list.filter((d) => d.id !== id));
  }

  totalIncome = computed(() =>
    this.closes().reduce((sum, d) => sum + d.totalEarnings, 0),
  );

  totalFuelCost = computed(() =>
    this.closes().reduce((sum, d) => sum + (d.kmDriven / d.vehicleConsumption) * d.fuelCost, 0),
  );
}
