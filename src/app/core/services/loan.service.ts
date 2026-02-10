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
    history?: any[];
    // Location data
    latitude?: number;
    longitude?: number;
}

@Injectable({
    providedIn: 'root'
})
export class LoanService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/credit-lines`; // Updated to fetch Credit Lines

    getLoans(branchId?: number): Observable<Loan[]> {
        let params = new HttpParams();
        if (branchId) {
            params = params.set('branchId', branchId.toString());
        }
        return this.http.get<any>(this.apiUrl, { params }).pipe(map(res => {
            return res.data.map((cl: any) => ({
                id: cl.id,
                amount: cl.requestedAmount || cl.approvedLimit || 0,
                tenor: 6, // Default or placeholder
                interestRate: cl.interestRate || 0,
                monthlyInstallment: 0,
                currentStatus: this.mapStatus(cl.status),
                createdAt: cl.createdAt,
                applicant: {
                    id: cl.customer.id,
                    username: cl.customer.username,
                    email: cl.customer.email
                },
                plafond: {
                    name: cl.plafond?.name || 'Unknown',
                    maxAmount: cl.plafond?.maxAmount || 0
                },
                branch: cl.branch,
                // Map KYC Fields if available in nested customer object
                purpose: 'Plafond Application',
                businessType: cl.customer.customer?.businessType,
                ktpImagePath: cl.customer.customer?.ktpImagePath,
                selfieImagePath: cl.customer.customer?.selfieImagePath,
                history: cl.approvals || [],
                // Location data
                latitude: cl.latitude ? parseFloat(cl.latitude) : undefined,
                longitude: cl.longitude ? parseFloat(cl.longitude) : undefined
            }));
        }));
    }

    private mapStatus(status: string): string {
        // Map Backend CreditLineStatus to Frontend LoanStatus
        switch (status) {
            case 'APPLIED': return 'SUBMITTED';
            case 'REVIEWED': return 'REVIEWED';
            case 'APPROVED': return 'APPROVED';
            case 'ACTIVE': return 'DISBURSED'; // ACTIVE means the Line is Ready (Completed flow for Admin)
            case 'REJECTED': return 'REJECTED';
            default: return status;
        }
    }

    reviewLoan(id: number, remarks?: string): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${id}/review`, { remarks });
    }

    approveLoan(id: number, amount: number, remarks?: string): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${id}/approve`, { approvedLimit: amount, remarks });
    }

    // Back Office: Activate credit line (change status to ACTIVE without disbursing)
    activateLoan(id: number, remarks?: string): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${id}/activate`, { remarks });
    }

    // Customer: Request actual fund disbursement
    disburseLoan(id: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/${id}/disburse`, {});
    }

    rejectLoan(id: number, remarks?: string): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${id}/reject`, { remarks });
    }

    getCustomerHistory(customerId: number): Observable<any[]> {
        return this.http.get<any>(`${this.apiUrl}/customer/${customerId}`).pipe(
            map(res => res.data)
        );
    }

    submitLoan(request: any): Observable<Loan> {
        return this.http.post<any>(this.apiUrl, request).pipe(map(res => res.data));
    }

    simulateLoan(request: LoanSimulationRequest): Observable<LoanSimulationResponse> {
        return this.http.post<any>(`${environment.apiUrl}/loans/simulate`, request).pipe(map(res => res.data));
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
