import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';

import { environment } from '../../../environments/environment';

// Matching Backend DTOs
export interface LoginRequest {
    username: string;
    password?: string;
}

export interface LoginResponse {
    token: string;
    username: string;
    userId: number;
    role: string;
    roles: string[];
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/auth`;

    // Signals for reactive state
    currentUser = signal<LoginResponse | null>(this.getUserFromStorage());

    login(credentials: LoginRequest): Observable<LoginResponse> {
        return this.http.post<ApiResponse<LoginResponse>>(`${this.apiUrl}/login`, credentials).pipe(
            map(response => response.data), // Extract data from ApiResponse
            tap((data: LoginResponse) => {
                this.saveSession(data);
            })
        );
    }

    logout(): void {
        localStorage.removeItem('user_session');
        this.currentUser.set(null);
    }

    isLoggedIn(): boolean {
        return !!this.currentUser();
    }

    getToken(): string | null {
        return this.currentUser()?.token || null;
    }

    forgotPassword(email: string): Observable<any> {
        return this.http.post<ApiResponse<any>>(`${this.apiUrl}/forgot-password`, { email });
    }

    resetPassword(data: any): Observable<any> {
        return this.http.post<ApiResponse<any>>(`${this.apiUrl}/reset-password`, data);
    }

    // --- Helper Methods ---

    private saveSession(data: LoginResponse): void {
        localStorage.setItem('user_session', JSON.stringify(data));
        this.currentUser.set(data);
    }

    private getUserFromStorage(): LoginResponse | null {
        const session = localStorage.getItem('user_session');
        return session ? JSON.parse(session) : null;
    }
}
