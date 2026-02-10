import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Role {
    id: number;
    name: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

@Injectable({
    providedIn: 'root'
})
export class RoleService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/roles`;

    getRoles(): Observable<Role[]> {
        return this.http.get<ApiResponse<Role[]>>(this.apiUrl).pipe(
            map(response => response.data || [
                { id: 1, name: 'SUPER_ADMIN' },
                { id: 2, name: 'MARKETING' },
                { id: 3, name: 'BRANCH_MANAGER' },
                { id: 4, name: 'BACK_OFFICE' },
                { id: 5, name: 'NASABAH' }
            ])
        );
    }
}
