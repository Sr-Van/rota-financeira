import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
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

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let transactionService: TransactionService;

  beforeEach(async () => {
    mockLocalStorage.clear();
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    transactionService = TestBed.inject(TransactionService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show empty transactions initially', () => {
    expect(component.transactions).toHaveLength(0);
  });

  it('should show zero totals initially', () => {
    expect(component.totalIncome).toBe(0);
    expect(component.totalExpense).toBe(0);
    expect(component.balance).toBe(0);
  });

  it('should reflect transactions from service', () => {
    const today = new Date().toISOString().split('T')[0];
    transactionService.add('income', 'Corrida A', 100, today);
    transactionService.add('expense', 'Gasolina', 50, today);
    fixture.detectChanges();

    expect(component.transactions).toHaveLength(2);
    expect(component.totalIncome).toBe(100);
    expect(component.totalExpense).toBe(50);
    expect(component.balance).toBe(50);
  });

  it('should delete transaction when called', () => {
    const today = new Date().toISOString().split('T')[0];
    transactionService.add('income', 'Corrida', 30, today);
    const id = transactionService.getAll()[0].id;
    component.deleteTransaction(id);
    fixture.detectChanges();

    expect(component.transactions).toHaveLength(0);
  });

  it('should format currency in BRL', () => {
    expect(component.formatCurrency(1234.56)).toBe('R$\u00a01.234,56');
    expect(component.formatCurrency(0)).toBe('R$\u00a00,00');
  });

  it('should format date in pt-BR', () => {
    expect(component.formatDate('2026-05-16')).toBe('16/05/2026');
  });
});
