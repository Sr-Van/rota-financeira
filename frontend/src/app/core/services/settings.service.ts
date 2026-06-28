import { Injectable } from '@angular/core';
import { DriverConfig } from '../../models/driver-config.type';
import { Goals } from '../../models/goals.type';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  constructor(private api: ApiService) {}

  saveConfig(config: DriverConfig): void {
    this.api.saveConfig(config);
  }

  getConfig(): DriverConfig | null {
    return this.api.getConfig();
  }

  saveGoals(goals: Goals): void {
    this.api.saveGoals(goals);
  }

  getGoals(): Goals | null {
    return this.api.getGoals();
  }
}
