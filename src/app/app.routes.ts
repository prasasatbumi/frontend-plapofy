import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent)
    },
    {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [authGuard]
    },
    { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
    {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
    },
    {
        path: 'analytics',
        loadComponent: () => import('./features/dashboard/analytical-dashboard.component').then(m => m.AnalyticalDashboardComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ROLE_SUPER_ADMIN', 'ROLE_MARKETING', 'ROLE_BRANCH_MANAGER', 'ROLE_BACK_OFFICE'] }
    },
    {
        path: 'loans',
        loadComponent: () => import('./features/loans/loan-application.component').then(m => m.LoanApplicationComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ROLE_SUPER_ADMIN', 'ROLE_MARKETING', 'ROLE_BRANCH_MANAGER', 'ROLE_BACK_OFFICE', 'ROLE_NASABAH'] }
    },
    {
        path: 'simulation',
        loadComponent: () => import('./features/simulation/loan-simulation.component').then(m => m.LoanSimulationComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ROLE_NASABAH', 'ROLE_SUPER_ADMIN'] }
    },
    { path: 'dashboard', redirectTo: 'analytics', pathMatch: 'full' },
    {
        path: 'users',
        loadComponent: () => import('./features/users/user-management.component').then(m => m.UserManagementComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ROLE_SUPER_ADMIN'] }
    },

    {
        path: 'branches',
        loadComponent: () => import('./features/branches/branch-management.component').then(m => m.BranchManagementComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ROLE_SUPER_ADMIN'] }
    },
    {
        path: 'admin/plafonds',
        loadComponent: () => import('./features/admin/plafond-management/plafond-management.component').then(m => m.PlafondManagementComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ROLE_SUPER_ADMIN'] }
    },

    {
        path: '**',
        loadComponent: () => import('./core/components/not-found/not-found.component').then(m => m.NotFoundComponent)
    }
];
