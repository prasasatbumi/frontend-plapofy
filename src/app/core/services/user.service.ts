import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
    id: number;
    username: string;
    email: string;
    password?: string;
    isActive: boolean;
    roles?: Role[];
    branches?: Branch[];
}

export interface Role {
    id: number;
    name: string;
}

export interface Branch {
    id: number;
    code: string;
    name: string;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/users`;

    getUsers(branchId?: number | null): Observable<User[]> {
        const params: any = {};
        if (branchId) {
            params.branchId = branchId;
        }
        return this.http.get<any>(this.apiUrl, { params }).pipe(map(res => res.data));
    }

    createUser(user: User): Observable<User> {
        return this.http.post<any>(this.apiUrl, user).pipe(map(res => res.data));
    }

    deleteUser(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }

    updateStatus(id: number, isActive: boolean): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${id}/status`, {}, { params: { isActive: isActive } });
    }

    updateUser(id: number, user: User): Observable<User> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, user).pipe(map(res => res.data));
    }

    assignBranches(userId: number, branchIds: number[]): Observable<User> {
        return this.http.patch<any>(`${this.apiUrl}/${userId}/branches`, { branchIds }).pipe(
            map(res => res.data)
        );
    }
}

