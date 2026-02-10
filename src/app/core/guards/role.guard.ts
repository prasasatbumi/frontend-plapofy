import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from '../store/auth/auth.selectors';
import { map, take } from 'rxjs';

export const roleGuard: CanActivateFn = (route, state) => {
    const store = inject(Store);
    const router = inject(Router);
    const requiredRoles = route.data['roles'] as Array<string>;

    return store.select(selectCurrentUser).pipe(
        take(1),
        map(user => {
            if (!user) {
                router.navigate(['/login']);
                return false;
            }

            if (!requiredRoles || requiredRoles.length === 0) {
                return true;
            }

            const hasRole = user.roles.some(r => requiredRoles.includes(r));
            if (hasRole) {
                return true;
            }

            router.navigate(['/login']);
            return false;
        })
    );
};
