import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, LayoutDashboard, Users, LogOut, Menu, X, User, PieChart, FileText, Shield, LayoutGrid, Lock, Calculator, Building2 } from 'lucide-angular';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../../core/store/auth/auth.actions';
import { selectCurrentUser } from '../../../core/store/auth/auth.selectors';
import { NotificationCenterComponent } from '../notification-center/notification-center.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, NotificationCenterComponent],
  template: `
    <div class="flex h-screen bg-gray-50">
      <!-- Sidebar (Desktop) -->
      <aside class="hidden md:flex flex-col w-64 bg-blue-900 text-white transition-all duration-300">
        <div class="p-6 border-b border-blue-800">
          <div class="flex items-center gap-2 mb-1">
             <h1 class="text-2xl font-bold tracking-tight">Plapofy</h1>
          </div>
          <p class="text-blue-300 text-xs text-xs mt-1">Loan Management System</p>
        </div>
        
        <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
          @if (isInternal()) {
          <a routerLink="/analytics" routerLinkActive="bg-blue-800 text-white" class="flex items-center px-4 py-3 text-blue-100 hover:bg-blue-800 hover:text-white rounded-lg transition-colors group">
            <lucide-icon [img]="PieChart" class="w-5 h-5 mr-3"></lucide-icon>
            <span class="font-medium">Analytical</span>
          </a>
          }

          <!-- Loan Applications (For Internal & Nasabah) -->
          @if (isInternal() || isNasabah()) {
            <a routerLink="/loans" routerLinkActive="bg-blue-800 text-white" class="flex items-center px-4 py-3 text-blue-100 hover:bg-blue-800 hover:text-white rounded-lg transition-colors group">
                <lucide-icon [img]="FileText" class="w-5 h-5 mr-3"></lucide-icon>
                <span class="font-medium">Applications</span>
            </a>
          }

          <!-- Simulation (Nasabah & Super Admin) -->
          @if (isNasabah() || isAdmin()) {
            <a routerLink="/simulation" routerLinkActive="bg-blue-800 text-white" class="flex items-center px-4 py-3 text-blue-100 hover:bg-blue-800 hover:text-white rounded-lg transition-colors group">
                <lucide-icon [img]="Calculator" class="w-5 h-5 mr-3"></lucide-icon>
                <span class="font-medium">Simulation</span>
            </a>
          }

          @if (isAdmin()) {
            <div class="pt-4 mt-4 border-t border-blue-800">
              <p class="px-4 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">Admin</p>
            </div>
            <a routerLink="/users" routerLinkActive="bg-blue-800 text-white" class="flex items-center px-4 py-3 text-blue-100 hover:bg-blue-800 hover:text-white rounded-lg transition-colors group">
                <lucide-icon [img]="Users" class="w-5 h-5 mr-3"></lucide-icon>
                <span class="font-medium">User Management</span>
            </a>
            <a routerLink="/branches" routerLinkActive="bg-blue-800 text-white" class="flex items-center px-4 py-3 text-blue-100 hover:bg-blue-800 hover:text-white rounded-lg transition-colors group">
                <lucide-icon [img]="Building2" class="w-5 h-5 mr-3"></lucide-icon>
                <span class="font-medium">Branches</span>
            </a>
            <a routerLink="/admin/plafonds" routerLinkActive="bg-blue-800 text-white" class="flex items-center px-4 py-3 text-blue-100 hover:bg-blue-800 hover:text-white rounded-lg transition-colors group">
                <lucide-icon [img]="LayoutGrid" class="w-5 h-5 mr-3"></lucide-icon>
                <span class="font-medium">Loan Packages</span>
            </a>
          }
        </nav>

        <div class="p-4 border-t border-blue-800">
          <a routerLink="/profile" class="flex items-center px-4 py-3 mb-2 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer group">
             <div class="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center mr-3 group-hover:bg-blue-600 transition-colors">
                 <lucide-icon [img]="User" class="w-4 h-4 text-white"></lucide-icon>
             </div>
             <div class="overflow-hidden">
                <p class="text-sm font-medium text-white group-hover:text-blue-100 transition-colors truncate">{{ username() }}</p>
                <p class="text-xs text-blue-300 truncate">{{ userRole() }}</p>
             </div>
          </a>
          <button (click)="logout()" class="w-full flex items-center px-4 py-2 text-red-300 hover:text-red-100 hover:bg-red-900/30 rounded-lg transition-colors text-sm">
            <lucide-icon [img]="LogOut" class="w-4 h-4 mr-3"></lucide-icon>
            Sign Out
          </button>
        </div>
      </aside>

      <!-- Mobile Header & Main Content -->
      <div class="flex-1 flex flex-col overflow-hidden bg-gray-50/50">
        <!-- Mobile Header -->
        <header class="md:hidden bg-white shadow-sm h-16 flex items-center justify-between px-4 z-20">
            <h1 class="text-xl font-bold text-blue-900">Plapofy</h1>
            <div class="flex items-center gap-2">
                <app-notification-center></app-notification-center>
                <button (click)="toggleSidebar()" class="text-gray-600 focus:outline-none">
                    <lucide-icon [img]="isSidebarOpen() ? X : Menu" class="w-6 h-6"></lucide-icon>
                </button>
            </div>
        </header>

        <!-- Desktop Header (Top Bar) -->
        <header class="hidden md:flex bg-white shadow-sm h-16 items-center justify-between px-8 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-800">Welcome, {{ username() }}</h2>
            <div class="flex items-center gap-4">
                <app-notification-center></app-notification-center>
            </div>
        </header>

        <!-- Mobile Sidebar Overlay -->
        @if (isSidebarOpen()) {
            <div class="fixed inset-0 z-10 bg-black/50 md:hidden" (click)="toggleSidebar()"></div>
            <aside class="fixed inset-y-0 left-0 z-20 w-64 bg-blue-900 text-white transform transition-transform duration-300 md:hidden"
                   [class.translate-x-0]="isSidebarOpen()"
                   [class.-translate-x-full]="!isSidebarOpen()">
                <div class="p-6 border-b border-blue-800 flex justify-between items-center">
                    <div>
                        <h1 class="text-xl font-bold">Plapofy</h1>
                        <p class="text-blue-300 text-xs">Menu</p>
                    </div>
                    <button (click)="toggleSidebar()" class="text-blue-300"><lucide-icon [img]="X" class="w-5 h-5"></lucide-icon></button>
                </div>
                <!-- Mobile Nav Items (Same as Desktop) -->
                <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
                    @if (isInternal()) {
                    <a routerLink="/analytics" (click)="toggleSidebar()" routerLinkActive="bg-blue-800 text-white" class="flex items-center px-4 py-3 text-blue-100 hover:bg-blue-800 hover:text-white rounded-lg transition-colors">
                        <lucide-icon [img]="PieChart" class="w-5 h-5 mr-3"></lucide-icon>
                        Analytical
                    </a>
                    <a routerLink="/loans" (click)="toggleSidebar()" routerLinkActive="bg-blue-800 text-white" class="flex items-center px-4 py-3 text-blue-100 hover:bg-blue-800 hover:text-white rounded-lg transition-colors">
                        <lucide-icon [img]="FileText" class="w-5 h-5 mr-3"></lucide-icon>
                        Applications
                    </a>
                    }
                    @if (isAdmin()) {
                        <div class="pt-4 mt-2 px-4">
                             <p class="text-[0.65rem] font-bold text-blue-400/80 uppercase tracking-widest">Admin</p>
                        </div>
                        <a routerLink="/users" (click)="toggleSidebar()" routerLinkActive="bg-blue-800 text-white" class="flex items-center px-4 py-3 text-blue-100 hover:bg-blue-800 hover:text-white rounded-lg transition-colors">
                            <lucide-icon [img]="Users" class="w-5 h-5 mr-3"></lucide-icon>
                            Users
                        </a>
                        <a routerLink="/branches" (click)="toggleSidebar()" routerLinkActive="bg-blue-800 text-white" class="flex items-center px-4 py-3 text-blue-100 hover:bg-blue-800 hover:text-white rounded-lg transition-colors">
                            <lucide-icon [img]="Building2" class="w-5 h-5 mr-3"></lucide-icon>
                            Branches
                        </a>
                        <a routerLink="/admin/plafonds" (click)="toggleSidebar()" routerLinkActive="bg-blue-800 text-white" class="flex items-center px-4 py-3 text-blue-100 hover:bg-blue-800 hover:text-white rounded-lg transition-colors">
                            <lucide-icon [img]="LayoutGrid" class="w-5 h-5 mr-3"></lucide-icon>
                            Loan Packages
                        </a>
                    }
                </nav>
                <div class="p-4 border-t border-blue-800">
                    <button (click)="logout()" class="w-full flex items-center px-4 py-2 text-red-300">
                        <lucide-icon [img]="LogOut" class="w-4 h-4 mr-3"></lucide-icon>
                        Sign Out
                    </button>
                </div>
            </aside>
        }

        <!-- Main Content Area -->
        <main class="flex-1 overflow-auto p-6 md:p-8 bg-gray-50">
            <ng-content></ng-content>
        </main>
      </div>
    </div>
  `
})
export class LayoutComponent {
  private store = inject(Store);

  // Icons
  readonly LayoutDashboard = LayoutDashboard;
  readonly PieChart = PieChart;
  readonly FileText = FileText;
  readonly Users = Users;
  readonly LogOut = LogOut;
  readonly Menu = Menu;
  readonly X = X;
  readonly User = User;
  readonly Shield = Shield;
  readonly LayoutGrid = LayoutGrid;
  readonly Lock = Lock;
  readonly Calculator = Calculator;
  readonly Building2 = Building2;

  isSidebarOpen = signal(false);
  currentUser = this.store.selectSignal(selectCurrentUser);

  // Use computed or simple signal access if AuthService exposes signals
  isAdmin = computed(() => {
    const roles = this.currentUser()?.roles || [];
    return roles.includes('ROLE_SUPER_ADMIN');
  });

  isInternal = computed(() => {
    const roles = this.currentUser()?.roles || [];
    const internalRoles = ['ROLE_SUPER_ADMIN', 'ROLE_MARKETING', 'ROLE_BRANCH_MANAGER', 'ROLE_BACK_OFFICE'];
    return roles.some(r => internalRoles.includes(r));
  });

  isNasabah = computed(() => {
    const roles = this.currentUser()?.roles || [];
    return roles.includes('ROLE_NASABAH');
  });

  username = computed(() => this.currentUser()?.username || 'User');

  userRole = computed(() => {
    const roles = this.currentUser()?.roles || [];
    if (roles.includes('ROLE_SUPER_ADMIN')) return 'Super Admin';
    if (roles.includes('ROLE_BRANCH_MANAGER')) return 'Branch Manager';
    if (roles.includes('ROLE_MARKETING')) return 'Marketing';
    if (roles.includes('ROLE_BACK_OFFICE')) return 'Back Office';
    return 'Nasabah';
  });

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  logout() {
    this.store.dispatch(AuthActions.logout());
  }
}
