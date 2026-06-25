import { Injectable } from '@angular/core';
import { DriverConfig } from '../../models/driver-config.type';
import { Goals } from '../../models/goals.type';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly CONFIG_KEY = 'rota-financeira-driver-config';
  private readonly GOALS_KEY = 'rota-financeira-goals';

  saveConfig(config: DriverConfig): void {
    localStorage.setItem(this.CONFIG_KEY, JSON.stringify(config));
  }

  getConfig(): DriverConfig | null {
    try {
      const data = localStorage.getItem(this.CONFIG_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  saveGoals(goals: Goals): void {
    localStorage.setItem(this.GOALS_KEY, JSON.stringify(goals));
  }

  getGoals(): Goals | null {
    try {
      const data = localStorage.getItem(this.GOALS_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }
}
