import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter, Routes } from '@angular/router';
import { EntryFormComponent } from './entry-form.component';

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

describe('EntryFormComponent', () => {
  let component: EntryFormComponent;
  let fixture: ComponentFixture<EntryFormComponent>;

  beforeEach(async () => {
    mockLocalStorage.clear();
    await TestBed.configureTestingModule({
      imports: [EntryFormComponent, ReactiveFormsModule],
      providers: [provideRouter([{ path: 'dashboard', redirectTo: '', pathMatch: 'full' }])],
    }).compileComponents();

    fixture = TestBed.createComponent(EntryFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default date', () => {
    expect(component.form.get('date')?.value).toBeDefined();
  });

  it('should have invalid form when empty', () => {
    expect(component.form.valid).toBe(false);
  });

  it('should have valid form with complete data', () => {
    component.form.patchValue({
      totalEarnings: '200',
      kmDriven: '100',
      hoursWorked: '8',
      rideCount: '12',
      fuelCost: '5.5',
      vehicleConsumption: '12',
      date: '2026-05-16',
    });
    expect(component.form.valid).toBe(true);
  });

  it('should save daily close on submit', () => {
    component.form.patchValue({
      totalEarnings: '200',
      kmDriven: '100',
      hoursWorked: '8',
      rideCount: '12',
      fuelCost: '5.5',
      vehicleConsumption: '12',
      date: '2026-05-16',
    });
    component.onSubmit();
    const stored = JSON.parse(mockLocalStorage.getItem('rota-financeira-daily-closes')!);
    expect(stored).toHaveLength(1);
    expect(stored[0].totalEarnings).toBe(200);
    expect(stored[0].fuelCost).toBe(5.5);
  });

  it('should not submit when form is invalid', () => {
    component.onSubmit();
    const stored = mockLocalStorage.getItem('rota-financeira-daily-closes');
    expect(stored).toBeNull();
  });

  it('should reset form after successful submit', () => {
    component.form.patchValue({
      totalEarnings: '200',
      kmDriven: '100',
      hoursWorked: '8',
      rideCount: '12',
      fuelCost: '5.5',
      vehicleConsumption: '12',
      date: '2026-05-16',
    });
    component.onSubmit();
    expect(component.form.get('totalEarnings')?.value).toBeNull();
    expect(component.form.get('kmDriven')?.value).toBeNull();
  });
});
