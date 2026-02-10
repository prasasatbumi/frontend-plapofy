import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LayoutComponent } from '../../core/components/layout/layout.component';
import { LucideAngularModule, Calculator, DollarSign, Calendar, Percent, CreditCard, CheckCircle } from 'lucide-angular';
import { PlafondService, Plafond } from '../../core/services/plafond.service';
import { LoanService, LoanSimulationResponse } from '../../core/services/loan.service';
import { ProfileService } from '../../core/services/profile.service';
import { Branch } from '../../core/services/branch.service';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MasterActions } from '../../core/store/master/master.actions';
import { selectAllBranches, selectAllPlafonds } from '../../core/store/master/master.selectors';
import { ProfileActions } from '../../core/store/profile/profile.actions';
import { selectKycStatus } from '../../core/store/profile/profile.selectors';

@Component({
  selector: 'app-loan-simulation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LayoutComponent, LucideAngularModule],
  template: `
    <app-layout>
      <div class="mb-8">
         <h1 class="text-2xl font-bold text-gray-900">Loan Simulation</h1>
         <p class="text-gray-500 mt-1">Calculate your estimated monthly installments and fees.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Simulation Form -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
          <h2 class="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <lucide-icon [img]="Calculator" class="w-5 h-5 text-blue-600"></lucide-icon>
            Simulation Parameters
          </h2>
          
          <form [formGroup]="simForm" (ngSubmit)="calculate()" class="space-y-6">
            <!-- Product Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Loan Product</label>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                @for (p of plafonds(); track p.id) {
                  <div 
                    (click)="selectPlafond(p)"
                    class="cursor-pointer border rounded-lg p-4 transition-all"
                    [class.border-blue-500]="selectedPlafond()?.id === p.id"
                    [class.bg-blue-50]="selectedPlafond()?.id === p.id"
                    [class.border-gray-200]="selectedPlafond()?.id !== p.id">
                    <div class="font-semibold text-gray-900">{{ p.name }}</div>
                    <div class="text-xs text-gray-500 mt-1">Up to {{ p.maxAmount | currency:'IDR':'symbol':'1.0-0' }}</div>
                  </div>
                }
              </div>
            </div>

            @if (selectedPlafond()) {
              <!-- Amount Input -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Loan Amount (IDR)</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span class="text-gray-500 font-semibold">Rp</span>
                  </div>
                  <input formControlName="amount" type="number" 
                    class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-medium"
                    placeholder="e.g. 5000000">
                </div>
                 @if (simForm.get('amount')?.invalid && simForm.get('amount')?.touched) {
                  <p class="text-xs text-red-500 mt-1">
                    Amount must be up to {{ selectedPlafond()?.maxAmount | number }}
                  </p>
                }
              </div>

              <!-- Tenor Selection -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tenor (Months)</label>
                <div class="flex flex-wrap gap-2">
                  @for (interest of selectedPlafond()!.interests; track interest.tenor) {
                    <button type="button" 
                      (click)="simForm.patchValue({ tenor: interest.tenor })"
                      class="px-4 py-2 rounded-lg border text-sm font-medium transition-colors"
                      [class.bg-blue-600]="simForm.get('tenor')?.value === interest.tenor"
                      [class.text-white]="simForm.get('tenor')?.value === interest.tenor"
                      [class.border-blue-600]="simForm.get('tenor')?.value === interest.tenor"
                      [class.bg-white]="simForm.get('tenor')?.value !== interest.tenor"
                      [class.text-gray-700]="simForm.get('tenor')?.value !== interest.tenor">
                      {{ interest.tenor }} Months
                    </button>
                  }
                </div>
              </div>

              <button type="submit" 
                [disabled]="simForm.invalid || isLoading()"
                class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
                @if (isLoading()) {
                   <lucide-icon [img]="Calculator" class="w-4 h-4 animate-spin"></lucide-icon>
                   Calculating...
                } @else {
                   Calculate Simulation
                }
              </button>
            }
          </form>
        </div>

        <!-- Result Card -->
        @if (result(); as res) {
          <div class="bg-gradient-to-br from-blue-900 to-indigo-900 text-white rounded-xl shadow-lg p-6 h-fit">
            <h2 class="text-lg font-semibold mb-6 flex items-center gap-2">
              <lucide-icon [img]="CheckCircle" class="w-5 h-5 text-green-400"></lucide-icon>
              Simulation Result
            </h2>

            <div class="space-y-6">
              <!-- Main Result -->
              <div class="text-center p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <p class="text-blue-200 text-sm mb-1">Estimated Monthly Installment</p>
                <div class="text-3xl font-bold">{{ res.monthlyInstallment | currency:'IDR':'symbol':'1.0-0' }}</div>
                <div class="text-xs text-blue-300 mt-1">for {{ res.tenorMonth }} months</div>
              </div>

              <!-- Breakdown -->
              <div class="space-y-3 text-sm">
                <div class="flex justify-between items-center py-2 border-b border-white/10">
                  <span class="text-blue-200">Requested Amount</span>
                  <span class="font-medium">{{ res.requestedAmount | currency:'IDR':'symbol':'1.0-0' }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-white/10">
                  <span class="text-blue-200">Interest Rate</span>
                  <span class="font-medium">{{ res.interestRate }}% / month</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-white/10">
                  <span class="text-blue-200">Total Interest</span>
                  <span class="font-medium">{{ res.totalInterest | currency:'IDR':'symbol':'1.0-0' }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-white/10">
                  <span class="text-blue-200">Total Payment</span>
                  <span class="font-medium">{{ res.totalPayment | currency:'IDR':'symbol':'1.0-0' }}</span>
                </div>
                 <div class="flex justify-between items-center py-2 border-b border-white/10">
                  <span class="text-blue-200">Admin Fee</span>
                  <span class="font-medium text-orange-300">- {{ res.adminFee | currency:'IDR':'symbol':'1.0-0' }}</span>
                </div>
                <div class="pt-2">
                  <div class="flex justify-between items-center font-bold text-lg">
                    <span class="text-green-400">Net Disbursement</span>
                    <span>{{ res.netDisbursement | currency:'IDR':'symbol':'1.0-0' }}</span>
                  </div>
                  <p class="text-xs text-blue-300 mt-1 text-right">Amount you will receive</p>
                </div>
              </div>

              <!-- Apply Button -->
  <button (click)="initiateApplication()" class="w-full bg-white text-blue-900 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors mt-4">
                  Apply for this Loan
               </button>
            </div>
          </div>
        } @else if (!selectedPlafond()) {
           <div class="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500 flex flex-col items-center justify-center">
             <lucide-icon [img]="CreditCard" class="w-12 h-12 mb-4 text-gray-400"></lucide-icon>
             <p class="font-medium">Select a loan product to start simulation</p>
           </div>
        }
      </div>

      <!-- Application Modal -->
      @if (showApplicationModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div class="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                <div class="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 class="text-lg font-bold text-gray-900">Finalize Application</h2>
                    <button (click)="showApplicationModal.set(false)" class="text-gray-400 hover:text-gray-600"><lucide-icon [img]="CheckCircle" class="w-5 h-5 rotate-45"></lucide-icon></button>
                </div>
                
                <form [formGroup]="appForm" (ngSubmit)="submitApplication()" class="p-6 space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Select Branch</label>
                        <select formControlName="branchId" class="w-full px-4 py-2 border rounded-lg">
                            <option [ngValue]="null">-- Select Branch --</option>
                            @for (b of branches(); track b.id) {
                                <option [value]="b.id">{{ b.name }}</option>
                            }
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Purpose of Loan</label>
                        <textarea formControlName="purpose" rows="3" class="w-full px-4 py-2 border rounded-lg"></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                        <input type="text" formControlName="businessType" class="w-full px-4 py-2 border rounded-lg">
                    </div>

                    <div class="pt-4 flex justify-end gap-2">
                        <button type="button" (click)="showApplicationModal.set(false)" class="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">Cancel</button>
                        <button type="submit" [disabled]="appForm.invalid || isSubmitting()" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                            {{ isSubmitting() ? 'Submitting...' : 'Submit Application' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      }
    </app-layout>
  `
})
export class LoanSimulationComponent implements OnInit {
  private loanService = inject(LoanService);
  // private profileService = inject(ProfileService); // Removed
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private store = inject(Store);

  // Icons
  readonly Calculator = Calculator;
  readonly DollarSign = DollarSign;
  readonly Calendar = Calendar;
  readonly Percent = Percent;
  readonly CreditCard = CreditCard;
  readonly CheckCircle = CheckCircle;

  plafonds = this.store.selectSignal(selectAllPlafonds);
  selectedPlafond = signal<Plafond | null>(null);
  result = signal<LoanSimulationResponse | null>(null);
  isLoading = signal(false);

  simForm = this.fb.group({
    amount: [0, [Validators.required, Validators.min(1)]],
    tenor: [0, [Validators.required, Validators.min(1)]]
  });

  // Application Logic
  showApplicationModal = signal(false);
  branches = this.store.selectSignal(selectAllBranches);
  kycStatus = this.store.selectSignal(selectKycStatus);
  isSubmitting = signal(false);

  appForm = this.fb.group({
    branchId: [null, Validators.required],
    purpose: ['', Validators.required],
    businessType: ['', Validators.required]
  });

  ngOnInit() {
    this.store.dispatch(MasterActions.loadPlafonds());
    this.store.dispatch(MasterActions.loadBranches());
    this.store.dispatch(ProfileActions.loadProfile()); // Ensure profile/KYC is loaded
  }

  // Legacy load methods removed.

  selectPlafond(p: Plafond) {
    this.selectedPlafond.set(p);
    this.result.set(null);

    // Update validators based on plafond limits (minAmount deprecated, use 0)
    this.simForm.get('amount')?.setValidators([
      Validators.required,
      Validators.min(1), // Minimum 1 since minAmount is deprecated
      Validators.max(p.maxAmount)
    ]);
    this.simForm.get('amount')?.updateValueAndValidity();

    // Reset tenor to first available if not valid
    const currentTenor = this.simForm.get('tenor')?.value;
    const validTenors = p.interests.map(i => i.tenor);
    if (!validTenors.includes(currentTenor || 0)) {
      this.simForm.patchValue({ tenor: validTenors[0] });
    }
  }

  calculate() {
    if (this.simForm.invalid || !this.selectedPlafond()) return;

    this.isLoading.set(true);
    const req = {
      plafondId: this.selectedPlafond()!.id,
      amount: this.simForm.value.amount!,
      tenorMonth: this.simForm.value.tenor!
    };

    this.loanService.simulateLoan(req).subscribe({
      next: (res) => {
        this.result.set(res);
        this.isLoading.set(false);
      },
      error: (err) => {
        alert('Simulation failed: ' + (err.error?.message || 'Unknown error'));
        this.isLoading.set(false);
      }
    });
  }

  initiateApplication() {
    const status = this.kycStatus();

    if (status === 'VERIFIED') {
      this.showApplicationModal.set(true);
    } else if (status === 'PENDING') {
      alert('Cannot apply: Your KYC is currently under review.');
    } else {
      if (confirm('You must complete KYC verification before applying. Go to Profile?')) {
        this.router.navigate(['/profile']);
      }
    }
  }

  submitApplication() {
    if (this.appForm.invalid) return;
    this.isSubmitting.set(true);

    const req = {
      plafondId: this.selectedPlafond()!.id,
      amount: this.simForm.value.amount,
      tenor: this.simForm.value.tenor,
      branchId: this.appForm.value.branchId,
      purpose: this.appForm.value.purpose,
      businessType: this.appForm.value.businessType
    };

    this.loanService.submitLoan(req).subscribe({
      next: (res) => {
        alert('Loan Application Submitted successfully! ID: ' + res.id);
        this.isSubmitting.set(false);
        this.showApplicationModal.set(false);
        this.router.navigate(['/loans']);
      },
      error: (err) => {
        alert('Submission failed: ' + (err.error?.message || 'Unknown error'));
        this.isSubmitting.set(false);
      }
    });
  }
}
