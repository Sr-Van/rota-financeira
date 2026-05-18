import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TransactionService } from './transaction.service';

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

describe('TransactionService', () => {
  let service: TransactionService;

  beforeEach(() => {
    mockLocalStorage.clear();
    TestBed.configureTestingModule({ providers: [TransactionService] });
    service = TestBed.inject(TransactionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with empty transactions', () => {
    expect(service.getAll()).toHaveLength(0);
    expect(service.totalIncome()).toBe(0);
    expect(service.totalExpense()).toBe(0);
    expect(service.balance()).toBe(0);
  });

  it('should add an income transaction', () => {
    service.add('income', 'Corrida Centro', 25.50, '2026-05-16');
    const transactions = service.getAll();
    expect(transactions).toHaveLength(1);
    expect(transactions[0].type).toBe('income');
    expect(transactions[0].description).toBe('Corrida Centro');
    expect(transactions[0].amount).toBe(25.50);
    expect(transactions[0].date).toBe('2026-05-16');
    expect(transactions[0].id).toBeDefined();
    expect(transactions[0].createdAt).toBeDefined();
  });

  it('should add an expense transaction', () => {
    service.add('expense', 'Gasolina', 150.00, '2026-05-16');
    const transactions = service.getAll();
    expect(transactions).toHaveLength(1);
    expect(transactions[0].type).toBe('expense');
    expect(transactions[0].amount).toBe(150.00);
  });

  it('should calculate totals correctly', () => {
    service.add('income', 'Corrida A', 100, '2026-05-16');
    service.add('income', 'Corrida B', 50, '2026-05-16');
    service.add('expense', 'Gasolina', 80, '2026-05-16');

    expect(service.totalIncome()).toBe(150);
    expect(service.totalExpense()).toBe(80);
    expect(service.balance()).toBe(70);
  });

  it('should delete a transaction by id', () => {
    service.add('income', 'Corrida', 50, '2026-05-16');
    const id = service.getAll()[0].id;
    service.delete(id);
    expect(service.getAll()).toHaveLength(0);
  });

  it('should persist transactions to localStorage', () => {
    service.add('income', 'Corrida', 30, '2026-05-16');
    const stored = mockLocalStorage.getItem('rota-financeira-transactions');
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].description).toBe('Corrida');
  });

  it('should load transactions from localStorage on init', () => {
    const mockData = [
      { id: 'test-1', type: 'income', description: 'Corrida', amount: 40, date: '2026-05-16', createdAt: '2026-05-16T10:00:00Z' },
    ];
    mockLocalStorage.setItem('rota-financeira-transactions', JSON.stringify(mockData));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [TransactionService] });
    const freshService = TestBed.inject(TransactionService);

    expect(freshService.getAll()).toHaveLength(1);
    expect(freshService.getAll()[0].description).toBe('Corrida');
  });

  it('should handle corrupted localStorage data', () => {
    mockLocalStorage.setItem('rota-financeira-transactions', 'invalid-json');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [TransactionService] });
    const freshService = TestBed.inject(TransactionService);

    expect(freshService.getAll()).toHaveLength(0);
  });
});
