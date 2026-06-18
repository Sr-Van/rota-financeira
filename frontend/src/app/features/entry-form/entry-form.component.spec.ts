import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter, Routes } from '@angular/router';
import { EntryFormComponent } from './entry-form.component';
import { TransactionService } from '../../core/services/transaction.service';

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
  let transactionService: TransactionService;

  beforeEach(async () => {
    mockLocalStorage.clear();
    await TestBed.configureTestingModule({
      imports: [EntryFormComponent, ReactiveFormsModule],
      providers: [provideRouter([{ path: 'dashboard', redirectTo: '', pathMatch: 'full' }])],
    }).compileComponents();

    fixture = TestBed.createComponent(EntryFormComponent);
    component = fixture.componentInstance;
    transactionService = TestBed.inject(TransactionService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with income as selected type', () => {
    expect(component.selectedType).toBe('income');
  });

  it('should initialize form with default values', () => {
    expect(component.form.get('description')?.value).toBe('');
    expect(component.form.get('amount')?.value).toBe('');
    expect(component.form.get('date')?.value).toBeDefined();
  });

  it('should have invalid form when empty', () => {
    expect(component.form.valid).toBe(false);
  });

  it('should mark description invalid when empty', () => {
    const control = component.form.get('description');
    control?.markAsTouched();
    expect(control?.invalid).toBe(true);
  });

  it('should mark amount invalid when zero', () => {
    component.form.patchValue({ amount: 0 });
    const control = component.form.get('amount');
    control?.markAsTouched();
    expect(control?.invalid).toBe(true);
  });

  it('should mark amount invalid when negative', () => {
    component.form.patchValue({ amount: -5 });
    const control = component.form.get('amount');
    control?.markAsTouched();
    expect(control?.invalid).toBe(true);
  });

  it('should have valid form with correct data', () => {
    component.form.patchValue({
      description: 'Corrida Centro',
      amount: 25.50,
      date: '2026-05-16',
    });
    expect(component.form.valid).toBe(true);
  });

  it('should change selected type to expense', () => {
    component.setType('expense');
    expect(component.selectedType).toBe('expense');
  });

  it('should add income transaction on submit', () => {
    component.form.patchValue({
      description: 'Corrida Aeroporto',
      amount: 45.00,
      date: '2026-05-16',
    });
    component.onSubmit();
    const transactions = transactionService.getAll();
    expect(transactions).toHaveLength(1);
    expect(transactions[0].type).toBe('income');
    expect(transactions[0].amount).toBe(45.00);
  });

  it('should add expense transaction on submit', () => {
    component.setType('expense');
    component.form.patchValue({
      description: 'Gasolina',
      amount: 150.00,
      date: '2026-05-16',
    });
    component.onSubmit();
    const transactions = transactionService.getAll();
    expect(transactions).toHaveLength(1);
    expect(transactions[0].type).toBe('expense');
  });

  it('should reset form after successful submit', () => {
    component.form.patchValue({
      description: 'Corrida',
      amount: 20,
      date: '2026-05-16',
    });
    component.onSubmit();
    expect(component.form.get('description')?.value).toBeNull();
    expect(component.form.get('amount')?.value).toBeNull();
  });

  it('should not submit when form is invalid', () => {
    component.onSubmit();
    expect(transactionService.getAll()).toHaveLength(0);
  });
});
