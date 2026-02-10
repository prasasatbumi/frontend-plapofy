import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectIsAuthenticated } from '../store/auth/auth.selectors';
import { map, take } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
    const store = inject(Store);
    const router = inject(Router);

    return store.select(selectIsAuthenticated).pipe(
        take(1),
        map(isAuth => {
            if (isAuth) {
                return true;
            }
            router.navigate(['/login']);
            return false;
        })
    );
};
