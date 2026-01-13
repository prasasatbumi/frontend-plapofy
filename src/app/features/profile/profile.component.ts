import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LayoutComponent } from '../../core/components/layout/layout.component';
import { LucideAngularModule, User, Phone, MapPin, Calendar, Save, AlertCircle } from 'lucide-angular';
import { ProfileService, CustomerProfile } from '../../core/services/profile.service';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, LayoutComponent, LucideAngularModule],
    template: `
    <app-layout>
      <div class="mb-8">
         <h1 class="text-2xl font-bold text-gray-900">My Profile</h1>
         <p class="text-gray-500 mt-1">Manage your personal information.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Profile Card -->
        <div class="lg:col-span-1">
           <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
             <div class="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-4 text-blue-600">
               <lucide-icon [img]="User" class="w-12 h-12"></lucide-icon>
             </div>
             <h2 class="text-xl font-bold text-gray-900">{{ profile()?.fullName || profile()?.user?.username }}</h2>
             <p class="text-sm text-gray-500">{{ profile()?.user?.email }}</p>
             <div class="mt-4 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wide">
                Active Customer
             </div>
           </div>
           
           @if (missingFields().length > 0) {
             <div class="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4">
               <div class="flex items-start gap-2 text-orange-800">
                 <lucide-icon [img]="AlertCircle" class="w-5 h-5 flex-shrink-0 mt-0.5"></lucide-icon>
                 <div>
                   <h4 class="font-bold text-sm">Action Required</h4>
                   <p class="text-xs mt-1 text-orange-700">Please complete the following details to apply for a loan:</p>
                   <ul class="list-disc list-inside mt-2 text-xs text-orange-700">
                     @for (field of missingFields(); track field) {
                       <li class="capitalize">{{ field.replace('_', ' ') }}</li>
                     }
                   </ul>
                 </div>
               </div>
             </div>
           }
        </div>

        <!-- Edit Form -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 class="font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
               <lucide-icon [img]="User" class="w-5 h-5 text-gray-400"></lucide-icon>
               Personal Details
            </h3>
            
            <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="space-y-6">
               <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Full Name -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input formControlName="fullName" type="text" 
                      class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  </div>
                  
                  <!-- Phone Number -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                         <lucide-icon [img]="Phone" class="w-4 h-4 text-gray-400"></lucide-icon>
                      </div>
                      <input formControlName="phoneNumber" type="text" placeholder="08xxxxxxxx"
                        class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                  </div>

                  <!-- Date of Birth -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <div class="relative">
                       <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                         <lucide-icon [img]="Calendar" class="w-4 h-4 text-gray-400"></lucide-icon>
                      </div>
                      <input formControlName="dateOfBirth" type="date" 
                        class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                  </div>
               </div>

               <!-- Address -->
               <div>
                 <label class="block text-sm font-medium text-gray-700 mb-1">Detailed Address</label>
                 <div class="relative">
                     <div class="absolute top-3 left-3 pointer-events-none">
                         <lucide-icon [img]="MapPin" class="w-4 h-4 text-gray-400"></lucide-icon>
                     </div>
                     <textarea formControlName="address" rows="3" 
                       class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
                 </div>
               </div>

               <div class="flex justify-end pt-4">
                 <button type="submit" 
                   [disabled]="profileForm.invalid || isLoading()"
                   class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center font-medium shadow-sm shadow-blue-200">
                   @if (isLoading()) {
                      <span>Saving...</span>
                   } @else {
                      <lucide-icon [img]="Save" class="w-4 h-4 mr-2"></lucide-icon>
                      Save Changes
                   }
                 </button>
               </div>
            </form>
          </div>
        </div>
      </div>
    </app-layout>
  `
})
export class ProfileComponent implements OnInit {
    private profileService = inject(ProfileService);
    private fb = inject(FormBuilder);

    // Icons
    readonly User = User;
    readonly Phone = Phone;
    readonly MapPin = MapPin;
    readonly Calendar = Calendar;
    readonly Save = Save;
    readonly AlertCircle = AlertCircle;

    profile = signal<CustomerProfile | null>(null);
    missingFields = signal<string[]>([]);
    isLoading = signal(false);

    profileForm = this.fb.group({
        fullName: ['', Validators.required],
        phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
        dateOfBirth: [''],
        address: ['']
    });

    ngOnInit() {
        this.loadProfile();
        this.checkCompleteness();
    }

    loadProfile() {
        this.profileService.getProfile().subscribe({
            next: (data) => {
                this.profile.set(data);
                this.profileForm.patchValue({
                    fullName: data.fullName,
                    phoneNumber: data.phoneNumber,
                    dateOfBirth: data.dateOfBirth,
                    address: data.address
                });
            },
            error: (err) => console.error('Failed to load profile', err)
        });
    }

    checkCompleteness() {
        this.profileService.checkCompleteness().subscribe(res => {
            this.missingFields.set(res.missingFields);
        });
    }

    saveProfile() {
        if (this.profileForm.invalid) return;
        this.isLoading.set(true);
        const data = this.profileForm.value;

        this.profileService.updateProfile(data as Partial<CustomerProfile>).subscribe({
            next: (res) => {
                this.profile.set(res);
                this.checkCompleteness();
                alert('Profile updated successfully!');
                this.isLoading.set(false);
            },
            error: (err) => {
                alert('Failed to update profile: ' + (err.error?.message || 'Unknown error'));
                this.isLoading.set(false);
            }
        });
    }
}
