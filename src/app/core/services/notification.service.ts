import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';

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
    private apiUrl = '/api/notifications';

    unreadCount = signal(0);
    notifications = signal<Notification[]>([]);

    getNotifications(): Observable<Notification[]> {
        return this.http.get<any>(this.apiUrl).pipe(
            map(res => res.data),
            tap(data => this.notifications.set(data))
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
