import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { EntryFormComponent } from '../entry-form/entry-form.component';

@Component({
  selector: 'app-entry-modal',
  standalone: true,
  imports: [EntryFormComponent],
  template: `
    <div class="fixed inset-0 z-40 bg-fg/50" (click)="close()"></div>
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      <div class="bg-card rounded-xl shadow-xl w-full max-w-lg p-4 md:p-6 pointer-events-auto max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-fg">Novo Lancamento</h2>
          <button (click)="close()" class="text-fg-muted hover:text-fg p-1 rounded-md transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <app-entry-form embedded />
      </div>
    </div>
  `,
})
export class EntryModalComponent {
  private router = inject(Router);

  close(): void {
    this.router.navigate(['/dashboard']);
  }
}
