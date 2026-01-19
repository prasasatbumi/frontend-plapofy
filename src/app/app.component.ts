import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthActions } from './core/store/auth/auth.actions';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
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
