import { Injectable } from '@angular/core';
import { DailyClose } from '../../models/transaction.type';
import { DriverConfig } from '../../models/driver-config.type';
import { Goals } from '../../models/goals.type';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly DAILY_CLOSES_KEY = 'rota-financeira-daily-closes';
  private readonly CONFIG_KEY = 'rota-financeira-driver-config';
  private readonly GOALS_KEY = 'rota-financeira-goals';

  getDailyCloses(): DailyClose[] {
    return this.load<DailyClose>(this.DAILY_CLOSES_KEY);
  }

  saveDailyClose(data: Omit<DailyClose, 'id' | 'createdAt'>): DailyClose {
    const dailyClose: DailyClose = {
      id: crypto.randomUUID(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    const stored = this.getDailyCloses();
    stored.push(dailyClose);
    this.save(this.DAILY_CLOSES_KEY, stored);
    return dailyClose;
  }

  deleteDailyClose(id: string): void {
    const stored = this.getDailyCloses().filter((d) => d.id !== id);
    this.save(this.DAILY_CLOSES_KEY, stored);
  }

  getConfig(): DriverConfig | null {
    return this.loadOne<DriverConfig>(this.CONFIG_KEY);
  }

  saveConfig(config: DriverConfig): void {
    this.save(this.CONFIG_KEY, config);
  }

  getGoals(): Goals | null {
    return this.loadOne<Goals>(this.GOALS_KEY);
  }

  saveGoals(goals: Goals): void {
    this.save(this.GOALS_KEY, goals);
  }

  private load<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private loadOne<T>(key: string): T | null {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private save(key: string, value: unknown): void {
    localStorage.setItem(key, JSON.stringify(value));
  }
}
