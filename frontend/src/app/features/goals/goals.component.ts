import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { TransactionService } from '../../core/services/transaction.service';
import { Goals } from '../../models/goals.type';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './goals.component.html',
})
export class GoalsComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private transactionService = inject(TransactionService);
  private destroy$ = new Subject<void>();

  daysWorked = 0;
  monthlyGross = 0;
  weeklyGross = 0;
  saved = false;

  form = this.fb.nonNullable.group({
    dailyGross: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    const config = this.transactionService.getConfig();
    this.daysWorked = config?.daysWorked ?? 0;

    const goals = this.transactionService.getGoals();
    if (goals) {
      this.form.patchValue({ dailyGross: goals.dailyGross });
      this.calculateDerived(goals.dailyGross);
    }

    this.form.controls.dailyGross.valueChanges
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((value) => {
        this.calculateDerived(value);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private calculateDerived(daily: number): void {
    this.monthlyGross = daily * this.daysWorked;
    this.weeklyGross = this.daysWorked > 0 ? this.monthlyGross / 4 : 0;
  }

  save(): void {
    if (this.form.invalid) return;
    const daily = this.form.controls.dailyGross.value;
    this.calculateDerived(daily);
    const goals: Goals = {
      dailyGross: daily,
      weeklyGross: this.weeklyGross,
      monthlyGross: this.monthlyGross,
    };
    this.transactionService.saveGoals(goals);
    this.saved = true;
    setTimeout(() => (this.saved = false), 2000);
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
