import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  text: string;
  type: 'success' | 'error';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly message = signal<ToastMessage | null>(null);
  private timeout: ReturnType<typeof setTimeout> | null = null;

  show(text: string, type: 'success' | 'error' = 'success'): void {
    if (this.timeout) clearTimeout(this.timeout);
    this.message.set({ text, type });
    this.timeout = setTimeout(() => this.message.set(null), 2500);
  }
}
