import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DailyCloseService } from './daily-close.service';

const mockLocalStorage = {
  _data: {} as Record<string, string>,
  getItem(key: string): string | null {
    return this._data[key] || null;
  },
  setItem(key: string, value: string): void {
    this._data[key] = value;
  },
  clear(): void {
    this._data = {};
  },
  removeItem(key: string): void {
    delete this._data[key];
  },
};

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('DailyCloseService', () => {
  let service: DailyCloseService;

  beforeEach(() => {
    mockLocalStorage.clear();
    TestBed.configureTestingModule({ providers: [DailyCloseService] });
    service = TestBed.inject(DailyCloseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start empty', () => {
    expect(service.getAll()).toHaveLength(0);
    expect(service.totalIncome()).toBe(0);
    expect(service.totalFuelCost()).toBe(0);
  });

  it('should save a daily close', () => {
    service.save({
      date: '2026-05-16',
      totalEarnings: 200,
      kmDriven: 100,
      hoursWorked: 8,
      rideCount: 12,
      fuelCost: 5.5,
      vehicleConsumption: 12,
    });
    const all = service.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].totalEarnings).toBe(200);
    expect(all[0].fuelCost).toBe(5.5);
    expect(all[0].id).toBeDefined();
    expect(all[0].createdAt).toBeDefined();
  });

  it('should compute total income', () => {
    service.save({ date: '2026-05-16', totalEarnings: 100, kmDriven: 50, hoursWorked: 5, rideCount: 8, fuelCost: 5, vehicleConsumption: 10 });
    service.save({ date: '2026-05-17', totalEarnings: 150, kmDriven: 60, hoursWorked: 6, rideCount: 10, fuelCost: 5, vehicleConsumption: 10 });
    expect(service.totalIncome()).toBe(250);
  });

  it('should delete a daily close by id', () => {
    service.save({ date: '2026-05-16', totalEarnings: 100, kmDriven: 50, hoursWorked: 5, rideCount: 8, fuelCost: 5, vehicleConsumption: 10 });
    const id = service.getAll()[0].id;
    service.delete(id);
    expect(service.getAll()).toHaveLength(0);
  });

  it('should filter by day', () => {
    service.save({ date: '2026-05-16', totalEarnings: 100, kmDriven: 50, hoursWorked: 5, rideCount: 8, fuelCost: 5, vehicleConsumption: 10 });
    service.save({ date: '2026-05-17', totalEarnings: 200, kmDriven: 60, hoursWorked: 6, rideCount: 10, fuelCost: 5, vehicleConsumption: 10 });
    expect(service.getByFilter('day', '2026-05-16')).toHaveLength(1);
    expect(service.getByFilter('day', '2026-05-17')).toHaveLength(1);
    expect(service.getByFilter('day', '2026-05-18')).toHaveLength(0);
  });

  it('should persist to localStorage', () => {
    service.save({ date: '2026-05-16', totalEarnings: 100, kmDriven: 50, hoursWorked: 5, rideCount: 8, fuelCost: 5, vehicleConsumption: 10 });
    const stored = mockLocalStorage.getItem('rota-financeira-daily-closes');
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].totalEarnings).toBe(100);
  });

  it('should handle corrupted localStorage data', () => {
    mockLocalStorage.setItem('rota-financeira-daily-closes', 'invalid-json');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [DailyCloseService] });
    const freshService = TestBed.inject(DailyCloseService);
    expect(freshService.getAll()).toHaveLength(0);
  });
});
