import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { LoanService, Loan } from '../../core/services/loan.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { LayoutComponent } from '../../core/components/layout/layout.component';
import { LucideAngularModule, Search, FileText, CheckCircle, Banknote, Clock, X, Eye, XCircle } from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LayoutComponent, LucideAngularModule, CurrencyPipe, DatePipe],
  template: `
    <app-layout>
      <div class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Loan Applications</h1>
          <p class="text-gray-500 mt-1">Manage and track loan applications across the pipeline.</p>
        </div>
        <div class="flex gap-2">
          <div class="relative">
            <lucide-icon [img]="Search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"></lucide-icon>
            <input type="text" placeholder="Search applicant..." class="pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-blue-50 rounded-lg text-blue-600"><lucide-icon [img]="FileText" class="w-5 h-5"></lucide-icon></div>
            <div><p class="text-sm text-gray-500">Total Loans</p><p class="text-xl font-bold">{{ loans().length }}</p></div>
          </div>
        </div>
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-yellow-50 rounded-lg text-yellow-600"><lucide-icon [img]="Clock" class="w-5 h-5"></lucide-icon></div>
            <div><p class="text-sm text-gray-500">Pending Review</p><p class="text-xl font-bold">{{ countByStatus('SUBMITTED') }}</p></div>
          </div>
        </div>
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-green-50 rounded-lg text-green-600"><lucide-icon [img]="CheckCircle" class="w-5 h-5"></lucide-icon></div>
            <div><p class="text-sm text-gray-500">Approved</p><p class="text-xl font-bold">{{ countByStatus('APPROVED') }}</p></div>
          </div>
        </div>
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-purple-50 rounded-lg text-purple-600"><lucide-icon [img]="Banknote" class="w-5 h-5"></lucide-icon></div>
            <div><p class="text-sm text-gray-500">Disbursed</p><p class="text-xl font-bold">{{ countByStatus('DISBURSED') }}</p></div>
          </div>
        </div>
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-red-50 rounded-lg text-red-600"><lucide-icon [img]="XCircle" class="w-5 h-5"></lucide-icon></div>
            <div><p class="text-sm text-gray-500">Rejected</p><p class="text-xl font-bold">{{ countByStatus('REJECTED') }}</p></div>
          </div>
        </div>
      </div>

      <!-- Loan Table -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                <th class="px-6 py-4">Applicant</th>
                <th class="px-6 py-4">Amount</th>
                <th class="px-6 py-4">Tenor</th>
                <th class="px-6 py-4">Date</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (loan of loans(); track loan.id) {
                <tr class="hover:bg-gray-50/50 transition-colors">
                  <td class="px-6 py-4">
                    <div class="font-medium text-gray-900">{{ loan.applicant.username }}</div>
                    <div class="text-xs text-gray-500">{{ loan.applicant.email }}</div>
                  </td>
                  <td class="px-6 py-4 font-medium">{{ loan.amount | currency:'IDR':'symbol':'1.0-0' }}</td>
                  <td class="px-6 py-4 text-sm">{{ loan.tenor }} bulan</td>
                  <td class="px-6 py-4 text-sm text-gray-500">{{ loan.createdAt | date:'mediumDate' }}</td>
                  <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      [ngClass]="getStatusColor(loan.currentStatus)">
                      {{ loan.currentStatus }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right flex items-center justify-end gap-2">
                    <button (click)="viewDetails(loan)" class="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                      <lucide-icon [img]="Eye" class="w-4 h-4"></lucide-icon>
                    </button>
                    @if (canReview(loan)) {
                      <button (click)="review(loan.id)" class="text-xs bg-yellow-100 text-yellow-800 hover:bg-yellow-200 px-3 py-1 rounded-full font-medium transition-colors">Review</button>
                    }
                    @if (canApprove(loan)) {
                      <button (click)="approve(loan.id)" class="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1 rounded-full font-medium transition-colors">Approve</button>
                      <button (click)="reject(loan.id)" class="text-xs bg-red-100 text-red-800 hover:bg-red-200 px-3 py-1 rounded-full font-medium transition-colors">Reject</button>
                    }
                    @if (canActivate(loan)) {
                      <button (click)="activate(loan.id)" class="text-xs bg-green-100 text-green-800 hover:bg-green-200 px-3 py-1 rounded-full font-medium transition-colors">Activate</button>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="px-6 py-12 text-center text-gray-400">
                    <div class="flex flex-col items-center">
                      <lucide-icon [img]="FileText" class="w-12 h-12 text-gray-300 mb-2"></lucide-icon>
                      <p>No loan applications found</p>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Details Modal -->
      @if (selectedLoan()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 class="text-lg font-bold text-gray-900">Loan Application Details</h2>
              <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600"><lucide-icon [img]="X" class="w-5 h-5"></lucide-icon></button>
            </div>

            <div class="p-6 space-y-6">
              <!-- Applicant Info -->
              <div>
                <h3 class="font-semibold text-gray-800 mb-2">Applicant</h3>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div><span class="text-gray-500">Username:</span> {{ selectedLoan()!.applicant.username }}</div>
                  <div><span class="text-gray-500">Email:</span> {{ selectedLoan()!.applicant.email }}</div>
                </div>
              </div>

              <!-- Loan Info -->
              <div>
                <h3 class="font-semibold text-gray-800 mb-2">Loan Details</h3>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div><span class="text-gray-500">Amount:</span> {{ selectedLoan()!.amount | currency:'IDR':'symbol':'1.0-0' }}</div>
                  <div><span class="text-gray-500">Tenor:</span> {{ selectedLoan()!.tenor }} bulan</div>
                  <div><span class="text-gray-500">Interest Rate:</span> {{ selectedLoan()!.interestRate }}%</div>
                  <div><span class="text-gray-500">Monthly Installment:</span> {{ selectedLoan()!.monthlyInstallment | currency:'IDR':'symbol':'1.0-0' }}</div>
                  <div><span class="text-gray-500">Purpose:</span> {{ selectedLoan()!.purpose || '-' }}</div>
                  <div><span class="text-gray-500">Business Type:</span> {{ selectedLoan()!.businessType || '-' }}</div>
                  <div><span class="text-gray-500">Status:</span>
                    <span class="px-2 py-0.5 rounded-full text-xs font-medium" [ngClass]="getStatusColor(selectedLoan()!.currentStatus)">{{ selectedLoan()!.currentStatus }}</span>
                  </div>
                  <div><span class="text-gray-500">KYC Status:</span>
                    <span class="px-2 py-0.5 rounded-full text-xs font-medium" [ngClass]="getKycStatusColor(selectedLoan()!.kycStatus)">{{ selectedLoan()!.kycStatus || 'N/A' }}</span>
                  </div>
                </div>
              </div>

              <!-- KYC Documents -->
              <div>
                <h3 class="font-semibold text-gray-800 mb-2">KYC Documents</h3>
                <div class="grid grid-cols-2 gap-4">
                  @if (selectedLoan()!.ktpImagePath) {
                    <div>
                      <p class="text-sm text-gray-500 mb-1">KTP</p>
                      <img [src]="'/api/files/' + selectedLoan()!.ktpImagePath" alt="KTP" class="rounded-lg border max-h-40 object-contain">
                    </div>
                  }
                  @if (selectedLoan()!.selfieImagePath) {
                    <div>
                      <p class="text-sm text-gray-500 mb-1">Selfie with KTP</p>
                      <img [src]="'/api/files/' + selectedLoan()!.selfieImagePath" alt="Selfie" class="rounded-lg border max-h-40 object-contain">
                    </div>
                  }
                  @if (selectedLoan()!.npwpImagePath) {
                    <div>
                      <p class="text-sm text-gray-500 mb-1">NPWP</p>
                      <img [src]="'/api/files/' + selectedLoan()!.npwpImagePath" alt="NPWP" class="rounded-lg border max-h-40 object-contain">
                    </div>
                  }
                  @if (selectedLoan()!.businessLicenseImagePath) {
                    <div>
                      <p class="text-sm text-gray-500 mb-1">Business License</p>
                      <img [src]="'/api/files/' + selectedLoan()!.businessLicenseImagePath" alt="License" class="rounded-lg border max-h-40 object-contain">
                    </div>
                  }
                  @if (!selectedLoan()!.ktpImagePath && !selectedLoan()!.selfieImagePath) {
                    <div class="col-span-2 text-center text-gray-400 py-4">No KYC documents uploaded</div>
                  }
                </div>
              </div>
            </div>

            <div class="p-6 border-t border-gray-100 flex justify-end gap-2">
              <button (click)="closeModal()" class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">Close</button>
            </div>
          </div>
        </div>
      }
    </app-layout>
  `
})
export class DashboardComponent implements OnInit {
  private loanService = inject(LoanService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  // Icons
  readonly Search = Search;
  readonly FileText = FileText;
  readonly CheckCircle = CheckCircle;
  readonly Banknote = Banknote;
  readonly Clock = Clock;
  readonly X = X;
  readonly Eye = Eye;
  readonly XCircle = XCircle;

  loans = signal<Loan[]>([]);
  selectedLoan = signal<Loan | null>(null);
  currentUser = this.authService.currentUser;

  ngOnInit() {
    this.loadLoans();

    // Subscribe to real-time notification updates
    this.notificationService.notificationReceived$.subscribe(() => {
      this.loadLoans();
    });
  }

  loadLoans() {
    this.loanService.getLoans().subscribe({
      next: (data) => this.loans.set(data),
      error: (err) => console.error('Failed to load loans', err)
    });
  }

  // --- Modal ---
  viewDetails(loan: Loan) {
    this.selectedLoan.set(loan);
  }

  closeModal() {
    this.selectedLoan.set(null);
  }

  // --- Role Based Actions ---

  private hasRole(role: string): boolean {
    return this.currentUser()?.roles.includes(role) || false;
  }

  canReview(loan: Loan): boolean {
    return this.hasRole('ROLE_MARKETING') && loan.currentStatus === 'SUBMITTED';
  }

  canApprove(loan: Loan): boolean {
    return this.hasRole('ROLE_BRANCH_MANAGER') && loan.currentStatus === 'REVIEWED';
  }

  canActivate(loan: Loan): boolean {
    // Back Office activates credit lines when status is APPROVED
    // This changes status to ACTIVE without creating a disbursement
    return this.hasRole('ROLE_BACK_OFFICE') && loan.currentStatus === 'APPROVED';
  }

  // --- Actions ---

  review(id: number) {
    if (!confirm('Review this loan?')) return;
    this.loanService.reviewLoan(id).subscribe(() => this.loadLoans());
  }

  approve(id: number) {
    const loan = this.loans().find(l => l.id === id);
    if (!loan) return;
    if (!confirm('Approve this loan?')) return;
    this.loanService.approveLoan(id, loan.amount).subscribe(() => this.loadLoans());
  }

  activate(id: number) {
    if (!confirm('Activate this credit line?')) return;
    this.loanService.activateLoan(id).subscribe(() => this.loadLoans());
  }

  reject(id: number) {
    const remarks = prompt('Enter rejection reason (optional):');
    if (!confirm('Reject this loan?')) return;
    this.loanService.rejectLoan(id, remarks || undefined).subscribe({
      next: () => this.loadLoans(),
      error: (err) => alert('Failed to reject: ' + (err.error?.message || 'Unknown error'))
    });
  }

  // --- Helpers ---

  countByStatus(status: string): number {
    return this.loans().filter(l => l.currentStatus === status).length;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'SUBMITTED': return 'bg-gray-100 text-gray-800';
      case 'REVIEWED': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'DISBURSED': return 'bg-purple-100 text-purple-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getKycStatusColor(status?: string): string {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'VERIFIED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
