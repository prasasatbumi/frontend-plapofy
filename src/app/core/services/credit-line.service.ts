import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CreditLine {
    id: number;
    customer: {
        id: number;
        username: string;
        email: string;
    };
    plafond: {
        id: number;
        name: string;
    };
    tier: string;
    requestedAmount: number;
    approvedLimit: number;
    availableBalance: number;
    interestRate: number;
    status: 'APPLIED' | 'REVIEWED' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'BLOCKED';
    startDate?: string;
    endDate?: string;
    createdAt: string;
    latitude?: number;
    longitude?: number;
}

export interface ApproveCreditRequest {
    approvedLimit: number;
    tier: string;
    interestRate: number;
}

export interface TransitionRequest {
    notes?: string;
}

@Injectable({
    providedIn: 'root'
})
export class CreditLineService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/credit-lines`;

    listAll(): Observable<CreditLine[]> {
        return this.http.get<any>(this.apiUrl).pipe(
            map(res => res.data)
        );
    }

    // Helper to extract data if needed, but for now assuming interceptor or direct map
    // Actually, I'll check LoanService.

    review(id: number, notes?: string): Observable<CreditLine> {
        return this.http.patch<CreditLine>(`${this.apiUrl}/${id}/review`, { notes });
    }

    approve(id: number, request: ApproveCreditRequest): Observable<CreditLine> {
        return this.http.patch<CreditLine>(`${this.apiUrl}/${id}/approve`, request);
    }

    reject(id: number, notes?: string): Observable<CreditLine> {
        return this.http.patch<CreditLine>(`${this.apiUrl}/${id}/reject`, { notes });
    }
}
