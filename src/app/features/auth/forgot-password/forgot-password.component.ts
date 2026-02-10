import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LucideAngularModule, Mail, ArrowLeft, Send } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div class="p-8">
          <div class="text-center mb-8">
            <h1 class="text-2xl font-bold text-gray-900">Forgot Password?</h1>
            <p class="text-gray-500 mt-2">Enter your email address to reset your password.</p>
          </div>

          @if (successMessage()) {
            <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-center">
              <p>{{ successMessage() }}</p>
              <button routerLink="/login" class="text-sm font-semibold underline mt-2">Back to Login</button>
            </div>
          } @else {
            <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()" class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <lucide-icon [img]="Mail" class="w-5 h-5 text-gray-400"></lucide-icon>
                  </div>
                  <input formControlName="email" type="email" 
                    class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email">
                </div>
                @if (forgotForm.get('email')?.invalid && forgotForm.get('email')?.touched) {
                  <p class="text-xs text-red-500 mt-1">Please enter a valid email address</p>
                }
              </div>

              @if (errorMessage()) {
                <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {{ errorMessage() }}
                </div>
              }

              <button type="submit" 
                [disabled]="forgotForm.invalid || isLoading()"
                class="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                @if (isLoading()) {
                  <span>Sending...</span>
                } @else {
                  <span>Send Reset Link</span>
                  <lucide-icon [img]="Send" class="w-4 h-4"></lucide-icon>
                }
              </button>
            </form>
          }

          <div class="mt-8 text-center">
            <a routerLink="/login" class="text-sm text-gray-600 hover:text-blue-600 flex items-center justify-center gap-1 transition-colors">
              <lucide-icon [img]="ArrowLeft" class="w-4 h-4"></lucide-icon>
              Back to Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService); // Inject AuthService

  // Icons
  readonly Mail = Mail;
  readonly ArrowLeft = ArrowLeft;
  readonly Send = Send;

  forgotForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  isLoading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  onSubmit() {
    if (this.forgotForm.invalid) return;
    this.isLoading.set(true);
    this.errorMessage.set('');

    const email = this.forgotForm.value.email!;

    this.authService.forgotPassword(email).subscribe({
      next: (response) => {
        this.successMessage.set(response.message || 'Password reset instructions have been sent to your email.');
        this.isLoading.set(false);
      },
      error: (err) => {
        const msg = err.error?.message || 'Failed to send reset link. Please try again.';
        this.errorMessage.set(msg);
        this.isLoading.set(false);
      }
    });
  }
}
