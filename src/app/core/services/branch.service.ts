import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Branch {
    id: number;
    code: string;
    name: string;
    address?: string;
    branchManagers?: Staff[];
    marketingStaff?: Staff[];
    marketingCount?: number;
}

export interface Staff {
    username: string;
    email: string;
    joinedAt: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

@Injectable({
    providedIn: 'root'
})
export class BranchService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/branches`;

    getBranches(): Observable<Branch[]> {
        return this.http.get<ApiResponse<Branch[]>>(this.apiUrl).pipe(
            map(response => response.data)
        );
    }

    getBranchById(id: number): Observable<Branch> {
        return this.http.get<ApiResponse<Branch>>(`${this.apiUrl}/${id}`).pipe(
            map(response => response.data)
        );
    }

    createBranch(branch: Partial<Branch>): Observable<Branch> {
        return this.http.post<ApiResponse<Branch>>(this.apiUrl, branch).pipe(
            map(response => response.data)
        );
    }

    updateBranch(id: number, branch: Partial<Branch>): Observable<Branch> {
        return this.http.put<ApiResponse<Branch>>(`${this.apiUrl}/${id}`, branch).pipe(
            map(response => response.data)
        );
    }

    deleteBranch(id: number): Observable<void> {
        return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`).pipe(
            map(() => void 0)
        );
    }
}
