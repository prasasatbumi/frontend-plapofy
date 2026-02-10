import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const authService = inject(AuthService);
    const toastService = inject(ToastService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                // Token expired or invalid
                authService.logout(); // Clear token and user signal
                router.navigate(['/auth/login']);
                toastService.error('Sesi habis. Login ulang yuk untuk melanjutkan.');
            } else if (error.status === 403) {
                toastService.error('Ups, Anda tidak bisa akses halaman ini.');
            } else if (error.status === 0) {
                toastService.error('Koneksi terputus. Cek internet kamu dulu ya.');
            } else if (error.status >= 500) {
                toastService.error('Ada gangguan di sistem. Coba refresh atau tunggu sebentar.');
            } else if (error.error && error.error.message) {
                // Use backend provided friendly message if available
                toastService.error(error.error.message);
            } else {
                toastService.error('Terjadi kesalahan. Silakan coba lagi.');
            }

            return throwError(() => error);
        })
    );
};
