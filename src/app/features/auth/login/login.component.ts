import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Eye, EyeOff, Lock, User, MonitorCheck } from 'lucide-angular';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../../core/store/auth/auth.actions';
import { selectAuthError, selectAuthLoading } from '../../../core/store/auth/auth.selectors';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, RouterModule],
    template: `
    <div class="min-h-screen flex w-full">
      <!-- Left Section: Branding (Hidden on mobile) -->
      <div class="hidden lg:flex w-1/2 bg-blue-900 relative overflow-hidden items-center justify-center">
        <!-- Abstract Background Pattern -->
        <div class="absolute inset-0 opacity-10">
            <svg class="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
            </svg>
        </div>
        
        <div class="relative z-10 text-white text-center p-12">
            <div class="mb-6 flex justify-center">
                <lucide-icon [img]="MonitorCheck" class="w-20 h-20 text-blue-300"></lucide-icon>
            </div>
            <h1 class="text-5xl font-bold mb-4 tracking-tight">Plapofy</h1>
            <p class="text-xl text-blue-200 font-light">Smart Loan Origination System</p>
            <p class="mt-8 text-sm text-blue-400 max-w-md mx-auto">
                Accelerate your lending process with AI-driven insights and automated workflows.
            </p>
        </div>
      </div>

      <!-- Right Section: Login Form -->
      <div class="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-8">
        <div class="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <!-- Mobile Logo (Visible only on mobile) -->
            <div class="lg:hidden text-center mb-8">
                <h1 class="text-3xl font-bold text-blue-900">Plapofy</h1>
                <p class="text-gray-500 text-sm">Sign in to continue</p>
            </div>

            <div class="text-center mb-10 hidden lg:block">
                <h2 class="text-3xl font-bold text-gray-900">Welcome Back</h2>
                <p class="text-gray-500 mt-2">Enter your credentials to access your account</p>
            </div>

            <!-- Error Alert -->
            <div *ngIf="errorMessage()" class="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r flex items-center">
                <span class="font-medium mr-2">Error:</span> {{ errorMessage() }}
            </div>

            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
                <!-- Username Field -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Username</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <lucide-icon [img]="User" class="h-5 w-5 text-gray-400"></lucide-icon>
                        </div>
                        <input 
                            type="text" 
                            formControlName="username"
                            class="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                            placeholder="Enter your username"
                            [ngClass]="{'border-red-300 bg-red-50': isFieldInvalid('username')}"
                        >
                    </div>
                    <div *ngIf="isFieldInvalid('username')" class="text-red-500 text-xs mt-1">
                        Username is required
                    </div>
                </div>

                <!-- Password Field -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <lucide-icon [img]="Lock" class="h-5 w-5 text-gray-400"></lucide-icon>
                        </div>
                        <input 
                            [type]="showPassword() ? 'text' : 'password'" 
                            formControlName="password"
                            class="pl-10 pr-10 w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                            placeholder="Enter your password"
                            [ngClass]="{'border-red-300 bg-red-50': isFieldInvalid('password')}"
                        >
                        <button 
                            type="button"
                            (click)="togglePassword()"
                            class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                            <lucide-icon [img]="showPassword() ? EyeOff : Eye" class="h-5 w-5"></lucide-icon>
                        </button>
                    </div>
                    <div *ngIf="isFieldInvalid('password')" class="text-red-500 text-xs mt-1">
                        Password is required
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center justify-between text-sm">
                    <label class="flex items-center">
                        <input type="checkbox" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                        <span class="ml-2 text-gray-600">Remember me</span>
                    </label>
                    <a routerLink="/forgot-password" class="font-medium text-blue-600 hover:text-blue-500 hover:underline">Forgot password?</a>
                </div>

                <!-- Submit Button -->
                <button 
                    type="submit" 
                    [disabled]="loginForm.invalid || isLoading()"
                    class="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    <span *ngIf="isLoading()">
                        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                    </span>
                    <span *ngIf="!isLoading()">Sign In</span>
                </button>
            </form>

            <div class="mt-8 text-center text-sm text-gray-500">
                <p>Don't have an account? <a href="#" class="font-medium text-blue-600 hover:text-blue-500">Contact Support</a></p>
            </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
    private fb = inject(FormBuilder);
    private store = inject(Store);

    // Icons
    readonly Eye = Eye;
    readonly EyeOff = EyeOff;
    readonly Lock = Lock;
    readonly User = User;
    readonly MonitorCheck = MonitorCheck; // Using MonitorCheck as a logo placeholder

    loginForm = this.fb.group({
        username: ['', [Validators.required]],
        password: ['', [Validators.required]]
    });

    isLoading = this.store.selectSignal(selectAuthLoading);
    errorMessage = this.store.selectSignal(selectAuthError);
    showPassword = signal(false);

    togglePassword() {
        this.showPassword.update(val => !val);
    }

    isFieldInvalid(field: string): boolean {
        const control = this.loginForm.get(field);
        return !!(control && control.invalid && (control.dirty || control.touched));
    }

    onSubmit() {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        const formValue = this.loginForm.getRawValue();
        const credentials = {
            username: formValue.username || '',
            password: formValue.password || ''
        };

        this.store.dispatch(AuthActions.login({ request: credentials }));
    }
}
