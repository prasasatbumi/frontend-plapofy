import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Notification {
    id: number;
    type: string;
    message: string;
    createdAt: string;
    read: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/notifications`;

    unreadCount = signal(0);
    notifications = signal<Notification[]>([]);
    notificationReceived$ = new Subject<void>();
    private previousCount = 0;

    getNotifications(): Observable<Notification[]> {
        return this.http.get<any>(this.apiUrl).pipe(
            map(res => res.data),
            tap(data => {
                const prev = this.notifications().length;
                this.notifications.set(data);
                // Emit if count changed (new notification or one deleted)
                // ideally check for new IDs, but count diff is a good proxy for "new incoming"
                if (data.length !== prev) {
                    this.notificationReceived$.next();
                }
            })
        );
    }

    getUnreadCount(): Observable<number> {
        return this.http.get<any>(`${this.apiUrl}/unread/count`).pipe(
            map(res => res.data.count),
            tap(count => this.unreadCount.set(count))
        );
    }

    markAsRead(id: number): Observable<Notification> {
        return this.http.patch<any>(`${this.apiUrl}/${id}/read`, {}).pipe(
            map(res => res.data),
            tap(() => {
                this.unreadCount.update(c => Math.max(0, c - 1));
                this.notifications.update(list =>
                    list.map(n => n.id === id ? { ...n, read: true } : n)
                );
            })
        );
    }

    refreshAll(): void {
        this.getNotifications().subscribe();
        this.getUnreadCount().subscribe();
    }
}
