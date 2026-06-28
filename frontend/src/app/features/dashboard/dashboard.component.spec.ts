import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { DailyCloseService } from '../../core/services/daily-close.service';

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

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let dailyCloseService: DailyCloseService;

  beforeEach(async () => {
    mockLocalStorage.clear();
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    dailyCloseService = TestBed.inject(DailyCloseService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show empty entries initially', () => {
    expect(component.entries).toHaveLength(0);
  });

  it('should show zero totals initially', () => {
    expect(component.totalIncome).toBe(0);
    expect(component.totalExpense).toBe(0);
    expect(component.balance).toBe(0);
  });

  it('should show exploded entries from daily close', () => {
    const today = new Date().toISOString().split('T')[0];
    dailyCloseService.save({
      date: today,
      totalEarnings: 100,
      kmDriven: 50,
      hoursWorked: 5,
      rideCount: 8,
      fuelCost: 5,
      vehicleConsumption: 10,
    });
    fixture.detectChanges();

    expect(component.entries.length).toBeGreaterThanOrEqual(2);
    const incomeEntry = component.entries.find((e) => e.type === 'income');
    expect(incomeEntry).toBeDefined();
    expect(incomeEntry!.amount).toBe(100);
    expect(incomeEntry!.description).toBe('Faturamento');
  });

  it('should delete daily close when entry is deleted', () => {
    const today = new Date().toISOString().split('T')[0];
    dailyCloseService.save({
      date: today,
      totalEarnings: 100,
      kmDriven: 50,
      hoursWorked: 5,
      rideCount: 8,
      fuelCost: 5,
      vehicleConsumption: 10,
    });
    const entry = component.entries[0];
    component.confirmDelete(entry);
    component.executeDelete();
    fixture.detectChanges();

    expect(component.entries).toHaveLength(0);
  });

  it('should format currency in BRL', () => {
    expect(component.formatCurrency(1234.56)).toBe('R$\u00a01.234,56');
    expect(component.formatCurrency(0)).toBe('R$\u00a00,00');
  });

  it('should format date in pt-BR', () => {
    expect(component.formatDate('2026-05-16')).toBe('16/05/2026');
  });
});
