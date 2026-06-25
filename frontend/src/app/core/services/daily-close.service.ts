import { Injectable } from '@angular/core';
import { DailyClose } from '../../models/transaction.type';

@Injectable({ providedIn: 'root' })
export class DailyCloseService {
  private readonly STORAGE_KEY = 'rota-financeira-daily-closes';

  save(data: Omit<DailyClose, 'id' | 'createdAt'>): void {
    const dailyClose: DailyClose = {
      id: crypto.randomUUID(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    const stored = this.getAll();
    stored.push(dailyClose);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stored));
  }

  getAll(): DailyClose[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }
}
