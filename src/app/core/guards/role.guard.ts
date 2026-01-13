import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
        router.navigate(['/login']);
        return false;
    }

    const user = authService.currentUser();
    const requiredRoles = route.data['roles'] as Array<string>;
    console.log('RoleGuard Debug:', {
        path: route.url[0].path,
        requiredRoles,
        userRoles: user?.roles
    });

    if (!requiredRoles || requiredRoles.length === 0) {
        return true;
    }

    const hasRole = user?.roles.some(r => requiredRoles.includes(r));
    console.log('RoleGuard Check:', { hasRole });

    if (hasRole) {
        return true;
    }

    // Redirect to login or unauthorized page
    router.navigate(['/login']);
    return false;
};
