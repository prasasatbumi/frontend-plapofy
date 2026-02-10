import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from '../../services/auth.service';
import { AuthActions } from './auth.actions';
import { catchError, map, exhaustMap, tap, of } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class AuthEffects {
    private actions$ = inject(Actions);
    private authService = inject(AuthService);
    private router = inject(Router);

    login$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.login),
            exhaustMap(({ request }) =>
                this.authService.login(request).pipe(
                    map((response) => AuthActions.loginSuccess({ response })),
                    catchError((error) => of(AuthActions.loginFailure({ error: error.message || 'Login Failed' })))
                )
            )
        )
    );

    loginSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AuthActions.loginSuccess),
                tap(() => {
                    const currentUrl = this.router.url;
                    // Only redirect if on login or register page (or root/landing if intended, but user requested not to)
                    if (currentUrl.includes('/login') || currentUrl.includes('/register')) {
                        this.router.navigate(['/dashboard']);
                    }
                })
            ),
        { dispatch: false }
    );

    logout$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AuthActions.logout),
                tap(() => {
                    this.authService.logout();
                    this.router.navigate(['/login']);
                })
            ),
        { dispatch: false }
    );

    // Init Effect to load user from local storage into NgRx state (if not already handled by Service)
    // Since AuthService already reads from Storage, we might just want to sync it.
    // Actually, AuthService.currentUser is a Signal.
    // For migration, we want Store to be the source of truth.
    // We should read from localStorage here and dispatch LoginSuccess if found.

    init$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.loadUserFromStorage),
            map(() => {
                const storedUser = localStorage.getItem('user_session');
                if (storedUser) {
                    return AuthActions.loginSuccess({ response: JSON.parse(storedUser) });
                }
                return { type: '[Auth] No User Found' }; // No-op action
            })
        )
    );
}
