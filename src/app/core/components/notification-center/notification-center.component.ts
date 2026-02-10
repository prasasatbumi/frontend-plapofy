import { Component, inject, signal, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule, Bell, X, Check } from 'lucide-angular';
import { NotificationService, Notification } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
      <div class="relative">
        <!-- Bell Button -->
        <button (click)="toggleDropdown()" 
          class="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
          <lucide-icon [img]="Bell" class="w-5 h-5"></lucide-icon>
          @if (notificationService.unreadCount() > 0) {
            <span class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {{ notificationService.unreadCount() > 9 ? '9+' : notificationService.unreadCount() }}
            </span>
          }
        </button>

        <!-- Dropdown -->
        @if (isOpen()) {
          <div class="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
            <div class="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 class="font-bold text-gray-900">Notifications</h3>
              <button (click)="toggleDropdown()" class="p-1 text-gray-400 hover:text-gray-600 rounded">
                <lucide-icon [img]="X" class="w-4 h-4"></lucide-icon>
              </button>
            </div>
            
            <div class="max-h-80 overflow-y-auto">
              @for (notification of notificationService.notifications(); track notification.id) {
                <div 
                  (click)="handleNotificationClick(notification)"
                  class="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                  [class.bg-blue-50]="!notification.read">
                  <div class="flex items-start gap-3">
                    <div class="w-2 h-2 mt-2 rounded-full flex-shrink-0"
                      [class.bg-blue-500]="!notification.read"
                      [class.bg-gray-300]="notification.read"></div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm text-gray-900" [class.font-medium]="!notification.read">
                        {{ notification.message }}
                      </p>
                      <p class="text-xs text-gray-500 mt-1">{{ formatDate(notification.createdAt) }}</p>
                    </div>
                    @if (!notification.read) {
                      <button (click)="markAsRead(notification); $event.stopPropagation()" 
                        class="p-1 text-gray-400 hover:text-green-600 rounded">
                        <lucide-icon [img]="Check" class="w-4 h-4"></lucide-icon>
                      </button>
                    }
                  </div>
                </div>
              } @empty {
                <div class="p-8 text-center text-gray-500">
                  <lucide-icon [img]="Bell" class="w-8 h-8 mx-auto mb-2 opacity-50"></lucide-icon>
                  <p>No notifications yet</p>
                </div>
              }
            </div>
          </div>
        }
      </div>
    `
})
export class NotificationCenterComponent implements OnInit, OnDestroy {
  notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private elementRef = inject(ElementRef);
  private router = inject(Router);

  readonly Bell = Bell;
  readonly X = X;
  readonly Check = Check;

  isOpen = signal(false);
  private pollInterval: any;

  ngOnInit() {
    this.refreshIfAuthenticated();

    // Poll every 10 seconds
    this.pollInterval = setInterval(() => {
      this.refreshIfAuthenticated();
    }, 10000);
  }

  ngOnDestroy() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  private refreshIfAuthenticated() {
    if (this.authService.currentUser()) {
      this.notificationService.refreshAll();
    }
  }

  toggleDropdown() {
    this.isOpen.update(v => !v);
    if (this.isOpen()) {
      this.refreshIfAuthenticated();
    }
  }

  handleNotificationClick(notification: Notification) {
    this.markAsRead(notification);
    this.isOpen.set(false); // Close dropdown

    // Log the message for debugging
    console.log('Notification Click:', notification.message);

    // Try to extract ID (Prioritize formats used in backend: "ID: 123", "Loan 123", "Credit Line 123")
    const idMatch = notification.message.match(/(?:ID|Loan|Credit\s*Line|Application)(?:\s+ID)?[:\s]+(\d+)/i);

    if (idMatch) {
      console.log('ID extracted:', idMatch[1]);
      this.router.navigate(['/loans'], { queryParams: { search: idMatch[1] } });
      return;
    }

    // Fallback: try to extract username if ID not found
    const usernameMatch = notification.message.match(/from\s+(\w+)\s+(?:waiting|is ready)/i);
    if (usernameMatch) {
      console.log('Username extracted:', usernameMatch[1]);
      this.router.navigate(['/loans'], { queryParams: { search: usernameMatch[1] } });
      return;
    }

    // Default fallback
    this.router.navigate(['/loans']);
  }

  markAsRead(notification: Notification) {
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id).subscribe();
    }
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}
