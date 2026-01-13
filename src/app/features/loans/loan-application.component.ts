import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { LoanService, Loan } from '../../core/services/loan.service';
import { BranchService, Branch } from '../../core/services/branch.service';
import { AuthService } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../../core/components/layout/layout.component';
import { LucideAngularModule, Search, FileText, CheckCircle, XCircle, Eye, X } from 'lucide-angular';

@Component({
    selector: 'app-loan-application',
    standalone: true,
    imports: [CommonModule, LayoutComponent, LucideAngularModule, CurrencyPipe, DatePipe, FormsModule],
    template: `
    <app-layout>
      <div class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h1 class="text-2xl font-bold text-gray-900">Loan Applications</h1>
           <p class="text-gray-500 mt-1">Process and manage loan requests.</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-2">
            <!-- Branch Filter -->
            <div class="relative min-w-[200px]" *ngIf="showBranchFilter()">
                <select 
                    [ngModel]="selectedBranch()"
                    (ngModelChange)="onBranchChange($event)"
                    class="w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white">
                    <option [ngValue]="null">All Branches</option>
                    @for (branch of branches(); track branch.id) {
                        <option [ngValue]="branch.id">{{ branch.name }}</option>
                    }
                </select>
                <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <lucide-icon name="chevron-down" class="w-4 h-4 text-gray-400"></lucide-icon>
                </div>
            </div>

            <!-- Search -->
            <div class="relative">
                <lucide-icon [img]="Search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"></lucide-icon>
                <input 
                    type="text" 
                    [value]="searchQuery()"
                    (input)="searchQuery.set($any($event.target).value)"
                    placeholder="Search applicant..." 
                    class="pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-64"
                >
            </div>
        </div>
      </div>

      <!-- Filters Tabs -->
      <div class="flex space-x-1 mb-6 border-b border-gray-200">
        @for (tab of tabs; track tab.id) {
            <button 
                (click)="activeTab.set(tab.id)"
                class="px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200"
                [ngClass]="activeTab() === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'">
                {{ tab.label }}
            </button>
        }
      </div>

      <!-- Loan Table -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                        <th class="px-6 py-4">ID</th>
                        <th class="px-6 py-4">Branch</th>
                        <th class="px-6 py-4">Applicant</th>
                        <th class="px-6 py-4">Amount</th>
                        <th class="px-6 py-4">Tenor</th>
                        <th class="px-6 py-4">Date</th>
                        <th class="px-6 py-4">Status</th>
                        <th class="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    @for (loan of filteredLoans(); track loan.id) {
                    <tr class="hover:bg-gray-50/50 transition-colors">
                        <td class="px-6 py-4 font-mono text-xs text-gray-500">#{{ loan.id }}</td>
                        <td class="px-6 py-4">
                            <span *ngIf="loan.branch" class="inline-flex items-center px-2 py-1 rounded bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100">
                                {{ loan.branch.name }}
                            </span>
                            <span *ngIf="!loan.branch" class="text-gray-400 text-xs">-</span>
                        </td>
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
                            <!-- View Details Button -->
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
                           @if (canDisburse(loan)) {
                                <button (click)="disburse(loan.id)" class="text-xs bg-purple-100 text-purple-800 hover:bg-purple-200 px-3 py-1 rounded-full font-medium transition-colors">Disburse</button>
                                <button (click)="reject(loan.id)" class="text-xs bg-red-100 text-red-800 hover:bg-red-200 px-3 py-1 rounded-full font-medium transition-colors">Reject</button>
                           }
                        </td>
                    </tr>
                    } @empty {
                    <tr>
                        <td colspan="7" class="px-6 py-12 text-center text-gray-400">
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
                            <div><span class="text-gray-500">Branch:</span> <span class="font-medium text-gray-900">{{ selectedLoan()!.branch?.name || '-' }}</span></div>
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
                                    <img [src]="getImageUrl(selectedLoan()!.ktpImagePath)" 
                                         (click)="openImage(getImageUrl(selectedLoan()!.ktpImagePath))"
                                         alt="KTP" 
                                         class="rounded-lg border max-h-40 object-contain w-full bg-gray-50 cursor-zoom-in hover:opacity-90 transition-opacity">
                                </div>
                            }
                            @if (selectedLoan()!.selfieImagePath) {
                                <div>
                                    <p class="text-sm text-gray-500 mb-1">Selfie with KTP</p>
                                    <img [src]="getImageUrl(selectedLoan()!.selfieImagePath)" 
                                         (click)="openImage(getImageUrl(selectedLoan()!.selfieImagePath))"
                                         alt="Selfie" 
                                         class="rounded-lg border max-h-40 object-contain w-full bg-gray-50 cursor-zoom-in hover:opacity-90 transition-opacity">
                                </div>
                            }
                            @if (selectedLoan()!.npwpImagePath) {
                                <div>
                                    <p class="text-sm text-gray-500 mb-1">NPWP</p>
                                    <img [src]="getImageUrl(selectedLoan()!.npwpImagePath)" 
                                         (click)="openImage(getImageUrl(selectedLoan()!.npwpImagePath))"
                                         alt="NPWP" 
                                         class="rounded-lg border max-h-40 object-contain w-full bg-gray-50 cursor-zoom-in hover:opacity-90 transition-opacity">
                                </div>
                            }
                            @if (selectedLoan()!.businessLicenseImagePath) {
                                <div>
                                    <p class="text-sm text-gray-500 mb-1">Business License</p>
                                    <img [src]="getImageUrl(selectedLoan()!.businessLicenseImagePath)" 
                                         (click)="openImage(getImageUrl(selectedLoan()!.businessLicenseImagePath))"
                                         alt="License" 
                                         class="rounded-lg border max-h-40 object-contain w-full bg-gray-50 cursor-zoom-in hover:opacity-90 transition-opacity">
                                </div>
                            }
                            @if (!selectedLoan()!.ktpImagePath && !selectedLoan()!.selfieImagePath) {
                                <div class="col-span-2 text-center text-gray-400 py-4 bg-gray-50 rounded-lg">No KYC documents uploaded</div>
                            }
                        </div>
                    </div>
                </div>

                <div class="p-6 border-t border-gray-100 flex justify-end gap-2">
                    <button (click)="closeModal()" class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg border transition-colors">Close</button>
                </div>
            </div>
        </div>
      }

      <!-- Image Lightbox -->
      @if (viewingImageUrl()) {
        <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm transition-all" (click)="closeImage()">
            <button class="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                <lucide-icon [img]="X" class="w-8 h-8"></lucide-icon>
            </button>
            <img [src]="viewingImageUrl()" 
                 class="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" 
                 (click)="$event.stopPropagation()"
                 alt="Full size document">
        </div>
      }
    </app-layout>
  `
})
export class LoanApplicationComponent implements OnInit {
    private loanService = inject(LoanService);
    private branchService = inject(BranchService);
    private authService = inject(AuthService);

    // Icons
    readonly Search = Search;
    readonly FileText = FileText;
    readonly CheckCircle = CheckCircle;
    readonly XCircle = XCircle;
    readonly Eye = Eye;
    readonly X = X;

    loans = signal<Loan[]>([]);
    branches = signal<Branch[]>([]);
    selectedLoan = signal<Loan | null>(null);
    currentUser = this.authService.currentUser;

    selectedBranch = signal<number | null>(null);
    showBranchFilter = computed(() => {
        const user = this.currentUser();
        // Only Super Admin and Back Office typically filter all branches
        // Or if user has multiple branches assigned.
        return user?.roles.includes('ROLE_SUPER_ADMIN') || user?.roles.includes('ROLE_BACK_OFFICE');
    });

    searchQuery = signal('');
    activeTab = signal('ALL');
    viewingImageUrl = signal<string | null>(null);

    tabs = [
        { id: 'ALL', label: 'All Applications' },
        { id: 'SUBMITTED', label: 'Pending Review' },
        { id: 'REVIEWED', label: 'Pending Approval' },
        { id: 'APPROVED', label: 'To Disburse' },
        { id: 'DISBURSED', label: 'Completed' },
        { id: 'REJECTED', label: 'Rejected' }
    ];

    filteredLoans = computed(() => {
        const query = this.searchQuery().toLowerCase().trim();
        const tab = this.activeTab();
        let loans = this.loans();

        // 1. Filter by Tab
        if (tab !== 'ALL') {
            loans = loans.filter(l => l.currentStatus === tab);
        }

        // 2. Filter by Search Query
        if (query) {
            loans = loans.filter(l =>
                l.applicant.username.toLowerCase().includes(query) ||
                l.applicant.email.toLowerCase().includes(query) ||
                l.branch?.name.toLowerCase().includes(query)
            );
        }

        return loans;
    });

    ngOnInit() {
        this.loadBranches();
        this.loadLoans();
    }

    loadBranches() {
        if (this.showBranchFilter()) {
            this.branchService.getBranches().subscribe({
                next: (data) => this.branches.set(data),
                error: (err) => console.error('Failed to load branches', err)
            });
        }
    }

    loadLoans() {
        this.loanService.getLoans(this.selectedBranch() || undefined).subscribe({
            next: (data) => this.loans.set(data),
            error: (err) => console.error('Failed to load loans', err)
        });
    }

    onBranchChange(branchId: any) {
        // Handle "All Branches" (null/undefined)
        // Note: ngValue null might come as string "null" depending on binding, but [ngValue] usually handles it correctly? 
        // Let's ensure type safety
        const id = branchId === 'null' ? null : branchId;
        this.selectedBranch.set(id);
        this.loadLoans();
    }

    // --- Modal ---
    viewDetails(loan: Loan) {
        this.selectedLoan.set(loan);
    }

    closeModal() {
        this.selectedLoan.set(null);
    }

    openImage(url: string) {
        this.viewingImageUrl.set(url);
    }

    closeImage() {
        this.viewingImageUrl.set(null);
    }

    getImageUrl(path?: string): string {
        if (!path) return '';
        if (path.startsWith('/assets/') || path.startsWith('assets/')) {
            return path;
        }
        return `/api/files/${path}`;
    }

    // --- Role Based Actions ---

    private hasRole(role: string): boolean {
        return this.currentUser()?.roles.includes(role) || false;
    }

    canReview(loan: Loan): boolean {
        return (this.hasRole('ROLE_MARKETING') || this.hasRole('ROLE_SUPER_ADMIN')) && loan.currentStatus === 'SUBMITTED';
    }

    canApprove(loan: Loan): boolean {
        return (this.hasRole('ROLE_BRANCH_MANAGER') || this.hasRole('ROLE_SUPER_ADMIN')) && loan.currentStatus === 'REVIEWED';
    }

    canDisburse(loan: Loan): boolean {
        return (this.hasRole('ROLE_BACK_OFFICE') || this.hasRole('ROLE_SUPER_ADMIN')) && loan.currentStatus === 'APPROVED';
    }

    // --- Actions ---

    review(id: number) {
        if (!confirm('Review this loan?')) return;
        this.loanService.reviewLoan(id).subscribe(() => this.loadLoans());
    }

    approve(id: number) {
        if (!confirm('Approve this loan?')) return;
        this.loanService.approveLoan(id).subscribe(() => this.loadLoans());
    }

    disburse(id: number) {
        if (!confirm('Disburse this loan?')) return;
        this.loanService.disburseLoan(id).subscribe(() => this.loadLoans());
    }

    reject(id: number) {
        const remarks = prompt('Enter rejection reason (optional):');
        if (!confirm('Reject this loan?')) return;
        this.loanService.rejectLoan(id, remarks || undefined).subscribe({
            next: () => this.loadLoans(),
            error: (err) => alert('Failed to reject: ' + (err.error?.message || 'Unknown error'))
        });
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
