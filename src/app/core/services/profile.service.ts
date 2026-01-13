import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface CustomerProfile {
    id: number;
    fullName: string;
    phoneNumber: string;
    dateOfBirth?: string;
    address?: string;
    user: {
        id: number;
        email: string;
        username: string;
    };
}

@Injectable({
    providedIn: 'root'
})
export class ProfileService {
    private http = inject(HttpClient);
    private apiUrl = '/api/profile';

    getProfile(): Observable<CustomerProfile> {
        return this.http.get<any>(this.apiUrl).pipe(map(res => res.data));
    }

    updateProfile(profile: Partial<CustomerProfile>): Observable<CustomerProfile> {
        return this.http.put<any>(this.apiUrl, profile).pipe(map(res => res.data));
    }

    checkCompleteness(): Observable<{ complete: boolean, missingFields: string[] }> {
        return this.http.get<any>(`${this.apiUrl}/check-complete`).pipe(map(res => res.data));
    }
}
