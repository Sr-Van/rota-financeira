import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { BottomNavComponent } from './shared/bottom-nav/bottom-nav.component';
import { ToastComponent } from './shared/toast/toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BottomNavComponent, ToastComponent],
  template: `
    <router-outlet></router-outlet>
    @if (showNav()) {
      <app-bottom-nav></app-bottom-nav>
    }
    <app-toast></app-toast>
  `,
  styleUrl: './app.css'
})
export class App implements OnInit {
  #router = inject(Router);
  showNav = signal(true);

  ngOnInit() {
    this.syncNav();
    this.#router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => this.syncNav());
  }

  private syncNav() {
    this.showNav.set(this.#router.url !== '/');
  }
}
