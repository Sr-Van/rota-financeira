import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TransactionService } from '../../core/services/transaction.service';
import { ToastService } from '../../shared/toast/toast.service';
import { TransactionType } from '../../models/transaction.type';

@Component({
  selector: 'app-entry-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './entry-form.component.html',
})
export class EntryFormComponent {
  form: FormGroup;
  selectedType: TransactionType = 'income';
  private toastService = inject(ToastService);

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService,
  ) {
    this.form = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(2)]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      date: [new Date().toISOString().split('T')[0], [Validators.required]],
    });
  }

  setType(type: TransactionType): void {
    this.selectedType = type;
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const { description, amount, date } = this.form.value;
    this.transactionService.add(this.selectedType, description, parseFloat(amount), date);
    this.form.reset({ date: new Date().toISOString().split('T')[0] });
    this.toastService.show('Transacao cadastrada com sucesso.');
  }
}
