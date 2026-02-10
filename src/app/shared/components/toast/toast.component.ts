import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <div *ngFor="let toast of toastService.toasts()"
           class="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[300px] animate-slide-in"
           [ngClass]="{
             'bg-green-100 text-green-800 border border-green-200': toast.type === 'success',
             'bg-red-100 text-red-800 border border-red-200': toast.type === 'error',
             'bg-blue-100 text-blue-800 border border-blue-200': toast.type === 'info'
           }">
        
        <!-- Icons based on type -->
        <i-lucide *ngIf="toast.type === 'success'" name="check-circle" class="w-5 h-5"></i-lucide>
        <i-lucide *ngIf="toast.type === 'error'" name="alert-circle" class="w-5 h-5"></i-lucide>
        <i-lucide *ngIf="toast.type === 'info'" name="info" class="w-5 h-5"></i-lucide>

        <span class="flex-1 font-medium text-sm">{{ toast.message }}</span>

        <button (click)="toastService.remove(toast.id)" class="hover:opacity-70">
          <i-lucide name="x" class="w-4 h-4"></i-lucide>
        </button>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .animate-slide-in {
      animation: slideIn 0.3s ease-out;
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
