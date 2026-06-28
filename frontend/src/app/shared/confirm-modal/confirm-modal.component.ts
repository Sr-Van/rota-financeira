import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-fg/50" (click)="cancel.emit()"></div>
      <div class="relative bg-card rounded-xl shadow-xl w-full max-w-sm p-6 pointer-events-auto">
        <h3 class="text-lg font-semibold text-fg mb-2">{{ title() }}</h3>
        <p class="text-sm text-fg-muted mb-6">Tem certeza? Isso vai excluir todo o fechamento do dia {{ date() }}, incluindo faturamento, combustivel e custos fixos.</p>
        <div class="flex gap-3 justify-end">
          <button
            (click)="cancel.emit()"
            class="px-4 py-2 rounded-lg text-sm font-medium text-fg bg-surface hover:bg-border-line transition-colors"
          >
            Cancelar
          </button>
          <button
            (click)="confirm.emit()"
            class="px-4 py-2 rounded-lg text-sm font-medium text-white bg-expense hover:bg-expense-hover transition-colors"
          >
            Sim, excluir
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmModalComponent {
  title = input('Confirmar');
  date = input();
  message = input('Tem certeza?');
  confirm = output<void>();
  cancel = output<void>();
}
