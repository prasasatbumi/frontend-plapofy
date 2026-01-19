import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Loan {
    id: number;
    amount: number;
    tenor: number;
    interestRate: number;
    monthlyInstallment: number;
    currentStatus: string;
    createdAt: string;
    applicant: {
        id: number;
        username: string;
        email: string;
    };
    plafond: {
        name: string;
        maxAmount: number;
    };
    branch?: {
        id: number;
        code: string;
        name: string;
    };
    // KYC Fields
    purpose?: string;
    businessType?: string;
    kycStatus?: string;
    ktpImagePath?: string;
    selfieImagePath?: string;
    npwpImagePath?: string;
    businessLicenseImagePath?: string;
    // New fields from backend
    disbursedAt?: string;
    nextDueDate?: string;
    remainingTenor?: number;
}

@Injectable({
    providedIn: 'root'
})
export class LoanService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/loans`;

    getLoans(branchId?: number): Observable<Loan[]> {
        let params = new HttpParams();
        if (branchId) {
            params = params.set('branchId', branchId.toString());
        }
        return this.http.get<any>(this.apiUrl, { params }).pipe(map(res => res.data));
    }

    reviewLoan(id: number): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${id}/review`, {});
    }

    approveLoan(id: number): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${id}/approve`, {});
    }

    disburseLoan(id: number): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${id}/disburse`, {});
    }

    rejectLoan(id: number, remarks?: string): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${id}/reject`, { remarks });
    }

    submitLoan(request: any): Observable<Loan> {
        return this.http.post<any>(this.apiUrl, request).pipe(map(res => res.data));
    }

    simulateLoan(request: LoanSimulationRequest): Observable<LoanSimulationResponse> {
        return this.http.post<any>(`${this.apiUrl}/simulate`, request).pipe(map(res => res.data));
    }
}

export interface LoanSimulationRequest {
    plafondId: number;
    amount: number;
    tenorMonth: number;
}

export interface LoanSimulationResponse {
    requestedAmount: number;
    tenorMonth: number;
    interestRate: number;
    monthlyInstallment: number;
    totalInterest: number;
    totalPayment: number;
    adminFee: number;
    netDisbursement: number;
    plafondName: string;
}
