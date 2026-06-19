import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CostsComponent } from './costs.component';

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

function setValidFormValues(component: CostsComponent): void {
  component.form.patchValue({
    vehicleInstallment: 1200,
    insurance: 300,
    ipva: 2400,
    daysWorked: 22,
    estimatedKm: 3000,
    desiredSalary: 5000,
    fuelPrice: 5.89,
    fuelConsumption: 12.5,
    reviewCost: 500,
    reviewInterval: 10000,
    tireCost: 2000,
    tireLongevity: 60000,
    maintenanceReserve: 200,
  });
}

describe('CostsComponent', () => {
  let component: CostsComponent;
  let fixture: ComponentFixture<CostsComponent>;

  beforeEach(async () => {
    mockLocalStorage.clear();
    await TestBed.configureTestingModule({
      imports: [CostsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CostsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values when no config saved', () => {
    expect(component.form.get('vehicleInstallment')?.value).toBe('');
    expect(component.form.get('insurance')?.value).toBe('');
    expect(component.form.get('ipva')?.value).toBe('');
    expect(component.form.get('daysWorked')?.value).toBe('');
    expect(component.form.get('estimatedKm')?.value).toBe('');
    expect(component.form.get('desiredSalary')?.value).toBe('');
    expect(component.form.get('fuelPrice')?.value).toBe('');
    expect(component.form.get('fuelConsumption')?.value).toBe('');
    expect(component.form.get('reviewCost')?.value).toBe('');
    expect(component.form.get('tireCost')?.value).toBe('');
    expect(component.form.get('maintenanceReserve')?.value).toBe('');
  });

  it('should pre-fill form when config exists in localStorage', async () => {
    const savedConfig = {
      vehicleInstallment: 1000,
      insurance: 200,
      ipva: 1800,
      daysWorked: 20,
      estimatedKm: 2500,
      desiredSalary: 4000,
      fuelPrice: 5.50,
      fuelConsumption: 11,
      reviewCost: 400,
      reviewInterval: 10000,
      tireCost: 1800,
      tireLongevity: 60000,
      maintenanceReserve: 150,
    };
    mockLocalStorage.setItem('rota-financeira-driver-config', JSON.stringify(savedConfig));

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [CostsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CostsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();

    expect(Number(component.form.get('vehicleInstallment')?.value)).toBe(1000);
    expect(Number(component.form.get('insurance')?.value)).toBe(200);
    expect(Number(component.form.get('ipva')?.value)).toBe(1800);
    expect(Number(component.form.get('daysWorked')?.value)).toBe(20);
    expect(Number(component.form.get('estimatedKm')?.value)).toBe(2500);
    expect(Number(component.form.get('desiredSalary')?.value)).toBe(4000);
    expect(Number(component.form.get('fuelPrice')?.value)).toBe(5.50);
    expect(Number(component.form.get('fuelConsumption')?.value)).toBe(11);
    expect(Number(component.form.get('reviewCost')?.value)).toBe(400);
    expect(Number(component.form.get('tireCost')?.value)).toBe(1800);
    expect(Number(component.form.get('maintenanceReserve')?.value)).toBe(150);
  });

  it('should validate vehicleInstallment as required', () => {
    const control = component.form.get('vehicleInstallment')!;
    expect(control.valid).toBe(false);
    control.setValue(500);
    expect(control.valid).toBe(true);
  });

  it('should validate insurance as required', () => {
    const control = component.form.get('insurance')!;
    expect(control.valid).toBe(false);
    control.setValue(200);
    expect(control.valid).toBe(true);
  });

  it('should validate ipva as required', () => {
    const control = component.form.get('ipva')!;
    expect(control.valid).toBe(false);
    control.setValue(2400);
    expect(control.valid).toBe(true);
  });

  it('should validate daysWorked between 1 and 31', () => {
    const control = component.form.get('daysWorked')!;
    control.setValue(0);
    expect(control.valid).toBe(false);
    control.setValue(32);
    expect(control.valid).toBe(false);
    control.setValue(22);
    expect(control.valid).toBe(true);
  });

  it('should validate estimatedKm as required', () => {
    const control = component.form.get('estimatedKm')!;
    expect(control.valid).toBe(false);
    control.setValue(3000);
    expect(control.valid).toBe(true);
  });

  it('should validate desiredSalary as required', () => {
    const control = component.form.get('desiredSalary')!;
    expect(control.valid).toBe(false);
    control.setValue(5000);
    expect(control.valid).toBe(true);
  });

  it('should have invalid form when all fields are empty', () => {
    expect(component.form.valid).toBe(false);
  });

  it('should have valid form with correct data', () => {
    setValidFormValues(component);
    expect(component.form.valid).toBe(true);
  });

  it('should calculate daily costs on valid form change', () => {
    expect(component.dailyCosts).toBeNull();
    setValidFormValues(component);
    expect(component.dailyCosts).not.toBeNull();
    expect(component.dailyCosts!.dailyInstallment).toBeGreaterThan(0);
    expect(component.dailyCosts!.dailyInsurance).toBeGreaterThan(0);
    expect(component.dailyCosts!.dailyIpva).toBeGreaterThan(0);
    expect(component.dailyCosts!.totalDaily).toBeGreaterThan(0);
  });

  it('should calculate fixed cost per km on valid form change', () => {
    expect(component.fixedCostPerKm).toBeNull();
    setValidFormValues(component);
    expect(component.fixedCostPerKm).not.toBeNull();
    expect(component.fixedCostPerKm!.monthlyTotal).toBeGreaterThan(0);
    expect(component.fixedCostPerKm!.costPerKm).toBeGreaterThan(0);
  });

  it('should calculate variable costs per km on valid form change', () => {
    expect(component.variableCostsPerKm).toBeNull();
    setValidFormValues(component);
    expect(component.variableCostsPerKm).not.toBeNull();
    expect(component.variableCostsPerKm!.fuelCostPerKm).toBeGreaterThan(0);
    expect(component.variableCostsPerKm!.totalVariableCostPerKm).toBeGreaterThan(0);
  });

  it('should calculate daily costs correctly', () => {
    setValidFormValues(component);
    const dc = component.dailyCosts!;
    expect(dc.dailyInstallment).toBeCloseTo(54.55, 1);
    expect(dc.dailyInsurance).toBeCloseTo(13.64, 1);
    expect(dc.dailyIpva).toBeCloseTo(9.09, 1);
    expect(dc.totalDaily).toBeCloseTo(77.27, 1);
  });

  it('should calculate fixed cost per km correctly', () => {
    setValidFormValues(component);
    const ckm = component.fixedCostPerKm!;
    expect(ckm.monthlyTotal).toBeCloseTo(1700, 0);
    expect(ckm.costPerKm).toBeCloseTo(0.57, 1);
  });

  it('should save config on submit', () => {
    setValidFormValues(component);
    component.onSubmit();
    const stored = mockLocalStorage.getItem('rota-financeira-driver-config');
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.vehicleInstallment).toBe(1200);
    expect(parsed.daysWorked).toBe(22);
  });

  it('should format currency in BRL', () => {
    const formatted = component.formatCurrency(1234.56);
    expect(formatted).toContain('1.234,56');
  });

  it('should not submit when form is invalid', () => {
    component.onSubmit();
    const stored = mockLocalStorage.getItem('rota-financeira-driver-config');
    expect(stored).toBeNull();
  });
});
