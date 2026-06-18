import { Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    @if (toastService.message(); as msg) {
      <div
        class="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-sm text-center transition-all"
        style="margin-bottom: env(safe-area-inset-bottom, 0px);"
      >
        <div
          class="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-white shadow-lg"
          [class.bg-income]="msg.type === 'success'"
          [class.bg-expense]="msg.type === 'error'"
        >
          @if (msg.type === 'success') {
            <svg xmlns="http://www.w3.org/2000/svg" class="size-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          } @else {
            <svg xmlns="http://www.w3.org/2000/svg" class="size-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          }
          {{ msg.text }}
        </div>
      </div>
    }
  `,
})
export class ToastComponent {
  protected toastService = inject(ToastService);
}
