import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const token = authService.getToken();

    let headers: any = {};

    if (environment.useNgrok) {
        headers['ngrok-skip-browser-warning'] = 'true';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    req = req.clone({
        setHeaders: headers
    });

    return next(req);
};
