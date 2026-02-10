import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoanService, Loan } from '../../core/services/loan.service';
import { BranchService, Branch } from '../../core/services/branch.service';
import { LayoutComponent } from '../../core/components/layout/layout.component';
import { LucideAngularModule, PieChart, TrendingUp, Users, Wallet, Activity, Calendar, Filter, RefreshCw, CheckCircle2, XCircle, Clock, Banknote, Building2 } from 'lucide-angular';

type TimeRange = 'MONTHLY' | 'TRIWULAN' | 'SEMESTER' | 'YEARLY' | 'CUSTOM' | 'ALL';

@Component({
    selector: 'app-analytical-dashboard',
    standalone: true,
    imports: [CommonModule, LayoutComponent, LucideAngularModule, CurrencyPipe, DatePipe, FormsModule],
    template: `
    <app-layout>
      <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h1 class="text-2xl font-bold text-gray-900">Analytical Dashboard</h1>
            <p class="text-gray-500 mt-1">Loan volume and completion performance metrics.</p>
         </div>
         
         <div class="flex items-center gap-3">
             <button (click)="loadLoans()" 
                 class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                 [class.animate-spin]="isLoading()"
                 title="Refresh Data">
                 <lucide-icon [img]="RefreshCw" class="w-5 h-5"></lucide-icon>
             </button>
             
             <!-- Branch Filter -->
             <div class="bg-white p-1 rounded-lg border border-gray-200 shadow-sm flex items-center">
                 <div class="px-2 text-gray-400">
                     <lucide-icon [img]="Building2" class="w-4 h-4"></lucide-icon>
                 </div>
                 <select [ngModel]="selectedBranchId()" (ngModelChange)="onBranchChange($event)" 
                     class="px-2 py-1.5 text-sm font-medium text-gray-600 border-none focus:ring-0 bg-transparent cursor-pointer min-w-[150px]">
                     <option [ngValue]="null">All Branches</option>
                     @for (branch of branches(); track branch.id) {
                         <option [ngValue]="branch.id">{{ branch.name }}</option>
                     }
                 </select>
             </div>

             <div class="flex gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                <div class="p-1">
                    <select [ngModel]="timeRange()" (ngModelChange)="timeRange.set($event)" 
                        class="px-3 py-1.5 text-sm font-medium text-gray-600 rounded-md border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-transparent cursor-pointer">
                        <option value="ALL">All Time</option>
                        <option value="MONTHLY">Monthly</option>
                        <option value="TRIWULAN">Triwulan</option>
                        <option value="SEMESTER">Semester</option>
                        <option value="YEARLY">Yearly</option>
                        <option value="CUSTOM">Custom</option>
                    </select>
                </div>
                @if (timeRange() === 'CUSTOM') {
                    <div class="flex items-center gap-2 px-2 border-l border-gray-200">
                        <input type="date" [ngModel]="startDate()" (ngModelChange)="startDate.set($event)" class="text-sm border-none focus:ring-0 text-gray-600 bg-transparent">
                        <span class="text-gray-400">-</span>
                        <input type="date" [ngModel]="endDate()" (ngModelChange)="endDate.set($event)" class="text-sm border-none focus:ring-0 text-gray-600 bg-transparent">
                    </div>
                }
             </div>
         </div>
      </div>

      <!-- Volume-Based KPIs -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <!-- Total Volume -->
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
            <div class="flex items-center justify-between mb-4">
                <div class="p-3 bg-white/20 rounded-lg"><lucide-icon [img]="Wallet" class="w-6 h-6"></lucide-icon></div>
                <span class="text-sm font-medium bg-white/20 px-2 py-1 rounded">Total</span>
            </div>
            <p class="text-sm text-blue-100 mb-1">Total Loan Volume</p>
            <p class="text-2xl font-bold">{{ totalVolume() | currency:'IDR':'symbol':'1.0-0' }}</p>
            <p class="text-xs text-blue-200 mt-2">{{ filteredLoans().length }} applications</p>
        </div>

        <!-- Disbursed Volume -->
        <div class="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
            <div class="flex items-center justify-between mb-4">
                <div class="p-3 bg-white/20 rounded-lg"><lucide-icon [img]="Banknote" class="w-6 h-6"></lucide-icon></div>
                <span class="text-sm font-medium bg-white/20 px-2 py-1 rounded">Disbursed</span>
            </div>
            <p class="text-sm text-purple-100 mb-1">Disbursed Volume</p>
            <p class="text-2xl font-bold">{{ disbursedVolume() | currency:'IDR':'symbol':'1.0-0' }}</p>
            <p class="text-xs text-purple-200 mt-2">{{ disbursedCount() }} completed</p>
        </div>

        <!-- Completion Rate -->
        <div class="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
            <div class="flex items-center justify-between mb-4">
                <div class="p-3 bg-white/20 rounded-lg"><lucide-icon [img]="CheckCircle2" class="w-6 h-6"></lucide-icon></div>
                <span class="text-sm font-medium bg-white/20 px-2 py-1 rounded">Rate</span>
            </div>
            <p class="text-sm text-green-100 mb-1">Completion Rate</p>
            <p class="text-2xl font-bold">{{ completionRate() }}%</p>
            <p class="text-xs text-green-200 mt-2">of total applications</p>
        </div>

        <!-- Pending Volume -->
        <div class="bg-gradient-to-br from-amber-500 to-orange-500 p-6 rounded-xl shadow-lg text-white">
            <div class="flex items-center justify-between mb-4">
                <div class="p-3 bg-white/20 rounded-lg"><lucide-icon [img]="Clock" class="w-6 h-6"></lucide-icon></div>
                <span class="text-sm font-medium bg-white/20 px-2 py-1 rounded">Pending</span>
            </div>
            <p class="text-sm text-amber-100 mb-1">In Pipeline</p>
            <p class="text-2xl font-bold">{{ pendingVolume() | currency:'IDR':'symbol':'1.0-0' }}</p>
            <p class="text-xs text-amber-200 mt-2">{{ pendingCount() }} awaiting</p>
        </div>
      </div>

      <!-- Secondary Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div class="p-3 bg-indigo-50 rounded-lg text-indigo-600"><lucide-icon [img]="Users" class="w-5 h-5"></lucide-icon></div>
            <div>
                <p class="text-xs text-gray-500">Active Borrowers</p>
                <p class="text-lg font-bold text-gray-900">{{ activeBorrowers() }}</p>
            </div>
        </div>
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div class="p-3 bg-green-50 rounded-lg text-green-600"><lucide-icon [img]="TrendingUp" class="w-5 h-5"></lucide-icon></div>
            <div>
                <p class="text-xs text-gray-500">Approval Rate</p>
                <p class="text-lg font-bold text-gray-900">{{ approvalRate() }}%</p>
            </div>
        </div>
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div class="p-3 bg-red-50 rounded-lg text-red-600"><lucide-icon [img]="XCircle" class="w-5 h-5"></lucide-icon></div>
            <div>
                <p class="text-xs text-gray-500">Rejection Rate</p>
                <p class="text-lg font-bold text-gray-900">{{ rejectionRate() }}%</p>
            </div>
        </div>
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div class="p-3 bg-blue-50 rounded-lg text-blue-600"><lucide-icon [img]="PieChart" class="w-5 h-5"></lucide-icon></div>
            <div>
                <p class="text-xs text-gray-500">Avg. Loan Size</p>
                <p class="text-lg font-bold text-gray-900">{{ averageLoanSize() | currency:'IDR':'symbol':'1.0-0' }}</p>
            </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Volume by Status -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 class="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <lucide-icon [img]="Wallet" class="w-5 h-5 mr-2 text-gray-400"></lucide-icon>
                Volume by Status
            </h3>
            @if (filteredLoans().length > 0) {
            <div class="space-y-4">
                @for (stat of volumeByStatus(); track stat.label) {
                    <div>
                        <div class="flex justify-between text-sm mb-1">
                            <span class="font-medium text-gray-700">{{ stat.label }}</span>
                            <span class="text-gray-500">{{ stat.volume | currency:'IDR':'symbol':'1.0-0' }} ({{ stat.percentage }}%)</span>
                        </div>
                        <div class="w-full bg-gray-100 rounded-full h-3">
                            <div class="h-3 rounded-full transition-all duration-500" [ngClass]="stat.color" [style.width.%]="stat.percentage"></div>
                        </div>
                    </div>
                }
            </div>
            } @else {
                <div class="flex flex-col items-center justify-center h-48 text-gray-400">
                    <lucide-icon [img]="Filter" class="w-8 h-8 mb-2"></lucide-icon>
                    <p>No data for selected period</p>
                </div>
            }
        </div>

        <!-- Application Count by Status -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 class="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <lucide-icon [img]="PieChart" class="w-5 h-5 mr-2 text-gray-400"></lucide-icon>
                Applications by Status
            </h3>
            @if (filteredLoans().length > 0) {
            <div class="space-y-4">
                @for (stat of statusStats(); track stat.label) {
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div class="flex items-center gap-3">
                            <div class="w-3 h-3 rounded-full" [ngClass]="stat.color"></div>
                            <span class="font-medium text-gray-700">{{ stat.label }}</span>
                        </div>
                        <div class="flex items-center gap-4">
                            <span class="text-sm font-bold text-gray-900">{{ stat.count }}</span>
                            <span class="text-xs text-gray-500 bg-white px-2 py-1 rounded">{{ stat.percentage }}%</span>
                        </div>
                    </div>
                }
            </div>
            } @else {
                <div class="flex flex-col items-center justify-center h-48 text-gray-400">
                    <lucide-icon [img]="Filter" class="w-8 h-8 mb-2"></lucide-icon>
                    <p>No data for selected period</p>
                </div>
            }
        </div>
      </div>

      <!-- Completion Summary -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h3 class="text-lg font-bold text-gray-900 mb-6">Completion Summary</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center p-4 bg-gradient-to-b from-green-50 to-white rounded-xl border border-green-100">
                <p class="text-4xl font-bold text-green-600">{{ disbursedCount() }}</p>
                <p class="text-sm text-gray-500 mt-1">Completed Loans</p>
                <p class="text-lg font-semibold text-green-700 mt-2">{{ disbursedVolume() | currency:'IDR':'symbol':'1.0-0' }}</p>
            </div>
            <div class="text-center p-4 bg-gradient-to-b from-amber-50 to-white rounded-xl border border-amber-100">
                <p class="text-4xl font-bold text-amber-600">{{ inProgressCount() }}</p>
                <p class="text-sm text-gray-500 mt-1">In Progress</p>
                <p class="text-lg font-semibold text-amber-700 mt-2">{{ inProgressVolume() | currency:'IDR':'symbol':'1.0-0' }}</p>
            </div>
            <div class="text-center p-4 bg-gradient-to-b from-red-50 to-white rounded-xl border border-red-100">
                <p class="text-4xl font-bold text-red-600">{{ rejectedCount() }}</p>
                <p class="text-sm text-gray-500 mt-1">Rejected</p>
                <p class="text-lg font-semibold text-red-700 mt-2">{{ rejectedVolume() | currency:'IDR':'symbol':'1.0-0' }}</p>
            </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 class="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <lucide-icon [img]="Activity" class="w-5 h-5 mr-2 text-gray-400"></lucide-icon>
            Recent Completions
        </h3>
        <div class="space-y-4">
            @for (loan of recentCompletedLoans(); track loan.id) {
                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <span class="text-sm font-bold text-purple-600">{{ loan.applicant.username.charAt(0).toUpperCase() }}</span>
                        </div>
                        <div>
                            <p class="font-medium text-gray-900">{{ loan.applicant.username }}</p>
                            <p class="text-xs text-gray-500">{{ loan.createdAt | date:'medium' }}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="font-bold text-gray-900">{{ loan.amount | currency:'IDR':'symbol':'1.0-0' }}</p>
                        <span class="text-xs font-medium px-2 py-1 rounded bg-purple-100 text-purple-800">DISBURSED</span>
                    </div>
                </div>
            } @empty {
                <div class="text-center text-gray-500 py-8">No completed loans in this period.</div>
            }
        </div>
      </div>
    </app-layout>
  `
})
export class AnalyticalDashboardComponent implements OnInit {
    private loanService = inject(LoanService);
    private branchService = inject(BranchService);

    // Icons
    readonly PieChart = PieChart;
    readonly TrendingUp = TrendingUp;
    readonly Users = Users;
    readonly Wallet = Wallet;
    readonly Activity = Activity;
    readonly Calendar = Calendar;
    readonly Filter = Filter;
    readonly RefreshCw = RefreshCw;
    readonly CheckCircle2 = CheckCircle2;
    readonly XCircle = XCircle;
    readonly Clock = Clock;
    readonly Banknote = Banknote;
    readonly Building2 = Building2;

    loans = signal<Loan[]>([]);
    branches = signal<Branch[]>([]);
    isLoading = signal(false);
    timeRange = signal<TimeRange>('ALL');
    startDate = signal<string>('');
    endDate = signal<string>('');
    selectedBranchId = signal<number | null>(null);

    filteredLoans = computed(() => {
        const allLoans = this.loans();
        const range = this.timeRange();
        const branchId = this.selectedBranchId();
        const now = new Date();

        return allLoans.filter(loan => {
            // Branch Filter
            if (branchId !== null && loan.branch?.id !== branchId) {
                return false;
            }

            const loanDate = new Date(loan.createdAt);
            switch (range) {
                case 'MONTHLY': return loanDate.getMonth() === now.getMonth() && loanDate.getFullYear() === now.getFullYear();
                case 'TRIWULAN':
                    const cq = Math.floor((now.getMonth() + 3) / 3);
                    const lq = Math.floor((loanDate.getMonth() + 3) / 3);
                    return lq === cq && loanDate.getFullYear() === now.getFullYear();
                case 'SEMESTER':
                    const cs = now.getMonth() < 6 ? 1 : 2;
                    const ls = loanDate.getMonth() < 6 ? 1 : 2;
                    return ls === cs && loanDate.getFullYear() === now.getFullYear();
                case 'YEARLY': return loanDate.getFullYear() === now.getFullYear();
                case 'CUSTOM':
                    if (!this.startDate() || !this.endDate()) return true;
                    const s = new Date(this.startDate());
                    const e = new Date(this.endDate());
                    e.setHours(23, 59, 59, 999);
                    return loanDate >= s && loanDate <= e;
                default: return true;
            }
        });
    });

    // Volume Metrics
    totalVolume = computed(() => this.filteredLoans().reduce((acc, l) => acc + l.amount, 0));
    disbursedVolume = computed(() => this.filteredLoans().filter(l => l.currentStatus === 'DISBURSED').reduce((acc, l) => acc + l.amount, 0));
    pendingVolume = computed(() => this.filteredLoans().filter(l => ['SUBMITTED', 'REVIEWED', 'APPROVED'].includes(l.currentStatus)).reduce((acc, l) => acc + l.amount, 0));
    rejectedVolume = computed(() => this.filteredLoans().filter(l => l.currentStatus === 'REJECTED').reduce((acc, l) => acc + l.amount, 0));
    inProgressVolume = computed(() => this.filteredLoans().filter(l => ['SUBMITTED', 'REVIEWED', 'APPROVED'].includes(l.currentStatus)).reduce((acc, l) => acc + l.amount, 0));

    // Count Metrics
    disbursedCount = computed(() => this.filteredLoans().filter(l => l.currentStatus === 'DISBURSED').length);
    pendingCount = computed(() => this.filteredLoans().filter(l => ['SUBMITTED', 'REVIEWED', 'APPROVED'].includes(l.currentStatus)).length);
    rejectedCount = computed(() => this.filteredLoans().filter(l => l.currentStatus === 'REJECTED').length);
    inProgressCount = computed(() => this.filteredLoans().filter(l => ['SUBMITTED', 'REVIEWED', 'APPROVED'].includes(l.currentStatus)).length);
    activeBorrowers = computed(() => new Set(this.filteredLoans().map(l => l.applicant.username)).size);

    // Rate Metrics
    completionRate = computed(() => {
        const total = this.filteredLoans().length;
        return total ? Math.round((this.disbursedCount() / total) * 100) : 0;
    });
    approvalRate = computed(() => {
        const total = this.filteredLoans().length;
        const approved = this.filteredLoans().filter(l => ['APPROVED', 'DISBURSED'].includes(l.currentStatus)).length;
        return total ? Math.round((approved / total) * 100) : 0;
    });
    rejectionRate = computed(() => {
        const total = this.filteredLoans().length;
        return total ? Math.round((this.rejectedCount() / total) * 100) : 0;
    });
    averageLoanSize = computed(() => {
        const loans = this.filteredLoans();
        return loans.length ? Math.round(this.totalVolume() / loans.length) : 0;
    });

    // Volume by Status
    volumeByStatus = computed(() => {
        const loans = this.filteredLoans();
        const total = this.totalVolume() || 1;
        const statuses = ['SUBMITTED', 'REVIEWED', 'APPROVED', 'DISBURSED', 'REJECTED'];
        const colors: Record<string, string> = {
            SUBMITTED: 'bg-blue-500', REVIEWED: 'bg-yellow-500', APPROVED: 'bg-green-500',
            DISBURSED: 'bg-purple-500', REJECTED: 'bg-red-500'
        };
        return statuses.map(s => {
            const vol = loans.filter(l => l.currentStatus === s).reduce((a, l) => a + l.amount, 0);
            return { label: s, volume: vol, percentage: Math.round((vol / total) * 100), color: colors[s] };
        });
    });

    // Application Count by Status
    statusStats = computed(() => {
        const loans = this.filteredLoans();
        const total = loans.length || 1;
        const statuses = ['SUBMITTED', 'REVIEWED', 'APPROVED', 'DISBURSED', 'REJECTED'];
        const colors: Record<string, string> = {
            SUBMITTED: 'bg-blue-500', REVIEWED: 'bg-yellow-500', APPROVED: 'bg-green-500',
            DISBURSED: 'bg-purple-500', REJECTED: 'bg-red-500'
        };
        return statuses.map(s => {
            const count = loans.filter(l => l.currentStatus === s).length;
            return { label: s, count, percentage: Math.round((count / total) * 100), color: colors[s] };
        });
    });

    recentCompletedLoans = computed(() =>
        [...this.filteredLoans()]
            .filter(l => l.currentStatus === 'DISBURSED')
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5)
    );

    ngOnInit() {
        this.loadLoans();
        this.loadBranches();
        const today = new Date().toISOString().split('T')[0];
        this.startDate.set(today);
        this.endDate.set(today);
    }

    loadLoans() {
        this.isLoading.set(true);
        // Pass selectedBranchId for server-side filtering
        this.loanService.getLoans(this.selectedBranchId() || undefined).subscribe({
            next: (data) => { this.loans.set(data); this.isLoading.set(false); },
            error: (err) => { console.error('Failed', err); this.isLoading.set(false); }
        });
    }

    onBranchChange(branchId: any) {
        const id = branchId === 'null' ? null : branchId;
        this.selectedBranchId.set(id);
        this.loadLoans(); // Trigger reload from server
    }

    loadBranches() {
        this.branchService.getBranches().subscribe({
            next: (data) => this.branches.set(data),
            error: (err) => console.error('Failed to load branches', err)
        });
    }
}
