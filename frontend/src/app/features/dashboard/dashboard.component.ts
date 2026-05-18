import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TransactionService } from '../../core/services/transaction.service';
import { Transaction } from '../../models/transaction.type';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  private transactionService = inject(TransactionService);

  get transactions(): Transaction[] {
    return this.transactionService.getAll();
  }

  get totalIncome(): number {
    return this.transactionService.totalIncome();
  }

  get totalExpense(): number {
    return this.transactionService.totalExpense();
  }

  get balance(): number {
    return this.transactionService.balance();
  }

  deleteTransaction(id: string): void {
    this.transactionService.delete(id);
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  }
}
