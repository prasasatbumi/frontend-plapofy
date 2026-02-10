import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ProductInterest {
    tenor: number;
    interestRate: number;
}

export interface Plafond {
    id: number;
    code: string;
    name: string;
    description: string;
    minAmount?: number; // Deprecated - use maxAmount (Credit Limit)
    maxAmount: number;  // Credit Limit
    interests: ProductInterest[];
}

@Injectable({
    providedIn: 'root'
})
export class PlafondService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/plafonds`;

    getPlafonds(): Observable<Plafond[]> {
        return this.http.get<any>(this.apiUrl).pipe(map(res => res.data));
    }

    updatePlafond(id: number, data: Partial<Plafond>): Observable<Plafond> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, data).pipe(map(res => res.data));
    }

    createPlafond(data: Partial<Plafond>): Observable<Plafond> {
        return this.http.post<any>(this.apiUrl, data).pipe(map(res => res.data));
    }

    deletePlafond(id: number): Observable<void> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(map(res => res.data));
    }
}
