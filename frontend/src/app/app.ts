import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BottomNavComponent } from './shared/bottom-nav/bottom-nav.component';
import { ToastComponent } from './shared/toast/toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BottomNavComponent, ToastComponent],
  template: `
    <router-outlet></router-outlet>
    <app-bottom-nav></app-bottom-nav>
    <app-toast></app-toast>
  `,
  styleUrl: './app.css'
})
export class App {}
