import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthActions } from './core/store/auth/auth.actions';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent],
  template: `
    <app-toast />
    <router-outlet />
  `,
  styles: [],
})
export class AppComponent implements OnInit {
  title = 'Plapofy';
  private store = inject(Store);

  ngOnInit() {
    this.store.dispatch(AuthActions.loadUserFromStorage());
  }
}
