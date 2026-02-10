import { Component, inject, signal, computed, OnInit, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Loan } from '../../core/services/loan.service';
import { Branch } from '../../core/services/branch.service';
import { AuthService } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../../core/components/layout/layout.component';
import { LucideAngularModule, Search, FileText, CheckCircle, XCircle, Eye, X } from 'lucide-angular';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { MasterActions } from '../../core/store/master/master.actions';
import { selectAllBranches } from '../../core/store/master/master.selectors';
import { LoanActions } from '../../core/store/loan/loan.actions';
import { selectFilteredLoans, selectSelectedLoan, selectLoanFilters } from '../../core/store/loan/loan.selectors';
import { map } from 'rxjs';
import { LoanService } from '../../core/services/loan.service';
import * as L from 'leaflet';

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
            <button (click)="refreshData()" class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Refresh Data">
                <lucide-icon name="refresh-cw" class="w-5 h-5"></lucide-icon>
            </button>

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
                    (input)="updateSearch($any($event.target).value)"
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
                (click)="setActiveTab(tab.id)"
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
                                <button (click)="approve(loan)" class="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1 rounded-full font-medium transition-colors">Approve</button>
                                <button (click)="reject(loan.id)" class="text-xs bg-red-100 text-red-800 hover:bg-red-200 px-3 py-1 rounded-full font-medium transition-colors">Reject</button>
                           }
                           @if (canActivate(loan)) {
                                <button (click)="activate(loan.id)" class="text-xs bg-green-100 text-green-800 hover:bg-green-200 px-3 py-1 rounded-full font-medium transition-colors">Activate</button>
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

      <!-- Details Modal - Side-by-Side Layout -->
      @if (selectedLoan()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div class="bg-white rounded-xl shadow-xl w-full max-w-5xl overflow-hidden max-h-[90vh] flex flex-col">
                <!-- Header -->
                <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-700">
                    <div>
                        <h2 class="text-lg font-bold text-white">Detail Pengajuan Kredit</h2>
                        <p class="text-blue-100 text-sm">#{{ selectedLoan()!.id }} - {{ selectedLoan()!.applicant.username }}</p>
                    </div>
                    <button (click)="closeModal()" class="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10">
                        <lucide-icon [img]="X" class="w-5 h-5"></lucide-icon>
                    </button>
                </div>
                
                <!-- Two Column Layout -->
                <div class="flex flex-1 overflow-hidden">
                    <!-- LEFT: Customer & Loan Data -->
                    <div class="flex-1 overflow-y-auto p-6 border-r border-gray-100">
                        
                        <!-- Tabs -->
                        <div class="flex space-x-4 mb-6 border-b">
                            <button (click)="setModalTab('details')" 
                                class="pb-2 text-sm font-medium transition-colors border-b-2"
                                [ngClass]="modalTab() === 'details' ? 'border-primary-600 text-blue-600 border-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'">
                                Informasi Debitur
                            </button>
                            <button (click)="setModalTab('history')"
                                class="pb-2 text-sm font-medium transition-colors border-b-2"
                                [ngClass]="modalTab() === 'history' ? 'border-primary-600 text-blue-600 border-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'">
                                Riwayat Pinjaman
                            </button>
                            <button (click)="setModalTab('status')"
                                class="pb-2 text-sm font-medium transition-colors border-b-2"
                                [ngClass]="modalTab() === 'status' ? 'border-primary-600 text-blue-600 border-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'">
                                Riwayat Pengajuan
                            </button>
                        </div>

                        <!-- TAB: Status (Application History) -->
                        @if (modalTab() === 'status') {
                             <div class="space-y-4">
                                <div class="bg-blue-50 p-3 rounded-lg flex gap-3 mb-4">
                                    <lucide-icon name="info" class="w-5 h-5 text-blue-600 shrink-0"></lucide-icon>
                                    <p class="text-xs text-blue-800">
                                        Catatan internal ini hanya visible untuk staff (Marketing, Branch Manager, Back Office).
                                        Customer hanya melihat alasan penolakan jika status REJECTED.
                                    </p>
                                </div>

                                @if (!selectedLoan()!.history || selectedLoan()!.history?.length === 0) {
                                    <div class="text-center py-8 text-gray-500">
                                        <p>Belum ada riwayat status.</p>
                                    </div>
                                } @else {
                                    <div class="relative pl-6 border-l-2 border-gray-200 ml-2 space-y-8">
                                        @for (log of selectedLoan()!.history; track log.id) {
                                            <div class="relative">
                                                 <div class="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white border-2 border-blue-500"></div>
                                                 
                                                 <div class="flex flex-col gap-1">
                                                     <div class="flex justify-between items-start">
                                                         <div>
                                                             <span class="font-bold text-gray-900 block">{{ log.actor?.username || 'System' }}</span>
                                                             <span class="text-xs text-gray-500 uppercase tracking-wide bg-gray-100 px-2 py-0.5 rounded">{{ log.role || 'Unknown Badge' }}</span>
                                                         </div>
                                                         <span class="text-xs text-gray-400">{{ log.createdAt | date:'medium' }}</span>
                                                     </div>
                                                     
                                                     <div class="flex items-center gap-2 mt-1">
                                                         <span class="text-sm font-semibold" 
                                                            [ngClass]="getStatusColor(log.status)">
                                                             {{ log.status }}
                                                         </span>
                                                     </div>

                                                     @if (log.remarks) {
                                                         <div class="mt-2 p-3 bg-gray-50 rounded text-sm text-gray-700 border border-gray-100 italic">
                                                             "{{ log.remarks }}"
                                                         </div>
                                                     }
                                                 </div>
                                            </div>
                                        }
                                    </div>
                                }
                             </div>
                        }

                        <!-- TAB: History -->
                        @if (modalTab() === 'history') {
                             <div class="space-y-4">
                                @if (isHistoryLoading()) {
                                    <div class="flex justify-center py-8">
                                        <lucide-icon name="loader-2" class="w-8 h-8 text-blue-500 animate-spin"></lucide-icon>
                                    </div>
                                } @else if (customerHistory().length === 0) {
                                    <div class="text-center py-8 text-gray-500">
                                        <p>Belum ada riwayat pinjaman sebelumnya.</p>
                                    </div>
                                } @else {
                                    @for (item of customerHistory(); track item.id) {
                                        <div class="p-4 border rounded-lg bg-gray-50 hover:bg-white hover:shadow-sm transition-all" [class.border-blue-200]="item.status === 'ACTIVE'">
                                            <div class="flex justify-between items-start mb-2">
                                                <div>
                                                    <span class="text-xs font-semibold px-2 py-0.5 rounded-full"
                                                        [ngClass]="getStatusColor(item.status)">
                                                        {{ item.status }}
                                                    </span>
                                                    <h4 class="font-medium text-gray-900 mt-1">{{ item.plafond?.name }}</h4>
                                                </div>
                                                <div class="text-right">
                                                    <div class="font-bold text-gray-900">{{ (item.approvedLimit || item.requestedAmount) | currency:'IDR':'symbol':'1.0-0' }}</div>
                                                    <div class="text-xs text-gray-500">{{ item.createdAt | date }}</div>
                                                </div>
                                            </div>
                                            
                                            <!-- Additional details if needed -->
                                            @if (item.status === 'REJECTED' && item.history?.[0]?.remarks) {
                                                 <div class="mt-2 p-2 bg-red-50 text-red-700 text-xs rounded border border-red-100">
                                                    Rejection Reason: {{ item.history[0].remarks }}
                                                 </div>
                                            }
                                        </div>
                                    }
                                }
                             </div>
                        }

                        <!-- TAB: Details -->
                        @if (modalTab() === 'details') {
                            <div class="space-y-6">
                        <!-- Applicant Info -->
                        <div>
                            <h3 class="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <lucide-icon name="user" class="w-4 h-4 text-blue-500"></lucide-icon>
                                Informasi Pemohon
                            </h3>
                            <div class="bg-gray-50 rounded-lg p-4">
                                <div class="grid grid-cols-2 gap-3 text-sm">
                                    <div><span class="text-gray-500">Nama:</span><br><span class="font-medium">{{ selectedLoan()!.applicant.username }}</span></div>
                                    <div><span class="text-gray-500">Email:</span><br><span class="font-medium">{{ selectedLoan()!.applicant.email }}</span></div>
                                    <div><span class="text-gray-500">Cabang:</span><br><span class="font-medium">{{ selectedLoan()!.branch?.name || '-' }}</span></div>
                                    <div><span class="text-gray-500">Tanggal Pengajuan:</span><br><span class="font-medium">{{ selectedLoan()!.createdAt | date:'medium' }}</span></div>
                                </div>
                            </div>
                        </div>

                        <!-- Loan Details -->
                        <div>
                            <h3 class="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <lucide-icon name="wallet" class="w-4 h-4 text-green-500"></lucide-icon>
                                Detail Pengajuan
                            </h3>
                            <div class="bg-gray-50 rounded-lg p-4">
                                <div class="grid grid-cols-2 gap-3 text-sm">
                                    <div><span class="text-gray-500">Jumlah:</span><br><span class="font-medium text-lg text-green-600">{{ selectedLoan()!.amount | currency:'IDR':'symbol':'1.0-0' }}</span></div>
                                    <div><span class="text-gray-500">Tenor:</span><br><span class="font-medium">{{ selectedLoan()!.tenor }} bulan</span></div>
                                    <div><span class="text-gray-500">Bunga:</span><br><span class="font-medium">{{ selectedLoan()!.interestRate }}% / tahun</span></div>
                                    <div><span class="text-gray-500">Cicilan:</span><br><span class="font-medium">{{ selectedLoan()!.monthlyInstallment | currency:'IDR':'symbol':'1.0-0' }}</span></div>
                                    <div class="col-span-2"><span class="text-gray-500">Status:</span> 
                                        <span class="px-2 py-0.5 rounded-full text-xs font-medium ml-1" [ngClass]="getStatusColor(selectedLoan()!.currentStatus)">{{ selectedLoan()!.currentStatus }}</span>
                                        <span class="px-2 py-0.5 rounded-full text-xs font-medium ml-1" [ngClass]="getKycStatusColor(selectedLoan()!.kycStatus)">KYC: {{ selectedLoan()!.kycStatus || 'N/A' }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- KYC Documents -->
                        <div>
                            <h3 class="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <lucide-icon name="file-image" class="w-4 h-4 text-purple-500"></lucide-icon>
                                Dokumen KYC
                            </h3>
                            <div class="grid grid-cols-2 gap-3">
                                @if (selectedLoan()!.ktpImagePath) {
                                    <div class="relative group">
                                        <p class="text-xs text-gray-500 mb-1">KTP</p>
                                        <img [src]="getImageUrl(selectedLoan()!.ktpImagePath)" 
                                             (click)="openImage(getImageUrl(selectedLoan()!.ktpImagePath))"
                                             alt="KTP" 
                                        class="rounded-lg border object-contain w-full bg-gray-100 cursor-zoom-in group-hover:opacity-90 transition-opacity max-h-48 h-auto">
                                    </div>
                                }
                                @if (selectedLoan()!.selfieImagePath) {
                                    <div class="relative group">
                                        <p class="text-xs text-gray-500 mb-1">Selfie + KTP</p>
                                        <img [src]="getImageUrl(selectedLoan()!.selfieImagePath)" 
                                             (click)="openImage(getImageUrl(selectedLoan()!.selfieImagePath))"
                                             alt="Selfie" 
                                             class="rounded-lg border object-contain w-full bg-gray-100 cursor-zoom-in group-hover:opacity-90 transition-opacity max-h-48 h-auto">
                                    </div>
                                }
                                @if (!selectedLoan()!.ktpImagePath && !selectedLoan()!.selfieImagePath) {
                                    <div class="col-span-2 text-center text-gray-400 py-6 bg-gray-50 rounded-lg text-sm">Tidak ada dokumen KYC</div>
                                }
                            </div>
                        </div>

                        <!-- Location Map -->
                        @if (selectedLoan()!.latitude && selectedLoan()!.longitude) {
                        <div>
                            <h3 class="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <lucide-icon name="map-pin" class="w-4 h-4 text-red-500"></lucide-icon>
                                Lokasi Pengajuan
                            </h3>
                            <div class="bg-gray-50 rounded-lg p-3">
                                <div class="text-xs text-gray-500 mb-2">
                                    <span>Lat: {{ selectedLoan()!.latitude?.toFixed(6) }}</span> | 
                                    <span>Long: {{ selectedLoan()!.longitude?.toFixed(6) }}</span>
                                </div>
                                <div #mapContainer id="location-map" class="h-48 w-full rounded-lg border border-gray-200"></div>
                            </div>
                        </div>
                        }
                        </div>
                        }
                    </div>

                    <!-- RIGHT: Actions Panel -->
                    <div class="w-80 bg-gray-50 p-6 overflow-y-auto flex flex-col">
                        <h3 class="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <lucide-icon name="settings-2" class="w-4 h-4 text-gray-500"></lucide-icon>
                            Aksi
                        </h3>
                        
                        <!-- Remarks Input -->
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                            <textarea 
                                [(ngModel)]="remarksInput"
                                placeholder="Masukkan catatan untuk customer..."
                                rows="4"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none bg-white"
                            ></textarea>
                            <p class="text-xs text-gray-400 mt-1">Wajib diisi untuk penolakan</p>
                        </div>
                        
                        <!-- Action Buttons -->
                        <div class="space-y-2 flex-1">
                            @if (canReview(selectedLoan()!)) {
                                <button (click)="reviewFromModal(selectedLoan()!.id)" 
                                    class="w-full px-4 py-2.5 text-sm font-medium bg-yellow-500 text-white hover:bg-yellow-600 rounded-lg transition-colors flex items-center justify-center gap-2">
                                    <lucide-icon name="eye" class="w-4 h-4"></lucide-icon>
                                    Review Pengajuan
                                </button>
                            }
                            @if (canApprove(selectedLoan()!)) {
                                <button (click)="approveFromModal(selectedLoan()!)" 
                                    class="w-full px-4 py-2.5 text-sm font-medium bg-green-500 text-white hover:bg-green-600 rounded-lg transition-colors flex items-center justify-center gap-2">
                                    <lucide-icon [img]="CheckCircle" class="w-4 h-4"></lucide-icon>
                                    Approve Pengajuan
                                </button>
                                <button (click)="rejectFromModal(selectedLoan()!.id)" 
                                    class="w-full px-4 py-2.5 text-sm font-medium bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors flex items-center justify-center gap-2">
                                    <lucide-icon [img]="XCircle" class="w-4 h-4"></lucide-icon>
                                    Tolak Pengajuan
                                </button>
                            }
                            @if (canActivate(selectedLoan()!)) {
                                <button (click)="activateFromModal(selectedLoan()!.id)"
                                    class="w-full px-4 py-2.5 text-sm font-medium bg-green-500 text-white hover:bg-green-600 rounded-lg transition-colors flex items-center justify-center gap-2">
                                    <lucide-icon [img]="CheckCircle" class="w-4 h-4"></lucide-icon>
                                    Aktifkan Credit Line
                                </button>
                            }
                        </div>
                        
                        <!-- Close Button -->
                        <button (click)="closeModal()" class="mt-4 w-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg border border-gray-300 transition-colors">
                            Tutup
                        </button>
                    </div>
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
export class LoanApplicationComponent implements OnInit, AfterViewChecked {
    private authService = inject(AuthService);
    private route = inject(ActivatedRoute);
    private store = inject(Store);
    private loanService = inject(LoanService);

    // Map
    @ViewChild('mapContainer') mapContainer!: ElementRef;
    private map: L.Map | null = null;
    private mapInitialized = false;

    // Icons
    readonly Search = Search;
    readonly FileText = FileText;
    readonly CheckCircle = CheckCircle;
    readonly XCircle = XCircle;
    readonly Eye = Eye;
    readonly X = X;

    // State Selectors
    branches = this.store.selectSignal(selectAllBranches);
    selectedLoan = this.store.selectSignal(selectSelectedLoan);
    filteredLoans = this.store.selectSignal(selectFilteredLoans);
    filters = this.store.selectSignal(selectLoanFilters); // To access current filter values

    currentUser = this.authService.currentUser;
    viewingImageUrl = signal<string | null>(null);
    remarksInput = '';  // For modal notes textarea

    // Derived State for UI
    selectedBranch = computed(() => this.filters().branchId);
    searchQuery = computed(() => this.filters().searchQuery);
    activeTab = computed(() => this.filters().statusTab);
    showBranchFilter = computed(() => {
        const user = this.currentUser();
        // Only Super Admin and Back Office typically filter all branches
        // Or if user has multiple branches assigned.
        return user?.roles.includes('ROLE_SUPER_ADMIN') || user?.roles.includes('ROLE_BACK_OFFICE');
    });

    // tabs definition remains same

    tabs = [
        { id: 'ALL', label: 'All Applications' },
        { id: 'SUBMITTED', label: 'Pending Review' },
        { id: 'REVIEWED', label: 'Pending Approval' },
        { id: 'APPROVED', label: 'To Disburse' },
        { id: 'DISBURSED', label: 'Completed' },
        { id: 'REJECTED', label: 'Rejected' }
    ];

    // filteredLoans computed removed (moved to selector)

    ngOnInit() {
        this.store.dispatch(MasterActions.loadBranches()); // Ensure branches are loaded
        this.store.dispatch(LoanActions.loadLoans({}));

        // Auto-fill search from URL query param
        this.route.queryParams.subscribe((params: any) => {
            if (params['search']) {
                this.updateSearch(params['search']);
                this.store.dispatch(LoanActions.loadLoans({})); // Force reload
            }
        });
    }

    ngAfterViewChecked() {
        const loan = this.selectedLoan();
        if (loan?.latitude && loan?.longitude && this.mapContainer && !this.mapInitialized) {
            this.initMap(loan.latitude, loan.longitude);
        }
    }

    private initMap(lat: number, lng: number) {
        if (this.map) {
            this.map.remove();
        }

        // Fix Leaflet default icon issue
        const iconDefault = L.icon({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
        L.Marker.prototype.options.icon = iconDefault;

        this.map = L.map(this.mapContainer.nativeElement).setView([lat, lng], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(this.map);
        L.marker([lat, lng]).addTo(this.map)
            .bindPopup('Lokasi Pengajuan')
            .openPopup();

        this.mapInitialized = true;

        // Invalidate size after a short delay for modal rendering
        setTimeout(() => {
            this.map?.invalidateSize();
        }, 200);
    }

    refreshData() {
        this.store.dispatch(LoanActions.loadLoans({}));
    }

    onBranchChange(branchId: any) {
        const id = branchId === 'null' ? null : branchId;
        this.store.dispatch(LoanActions.setBranchFilter({ branchId: id }));
    }

    updateSearch(query: string) {
        this.store.dispatch(LoanActions.setSearchQuery({ query }));
    }

    setActiveTab(tabId: string) {
        this.store.dispatch(LoanActions.setStatusTab({ tab: tabId }));
    }

    // State for modal tabs & history
    modalTab = signal<'details' | 'documents' | 'history' | 'status'>('details');
    customerHistory = signal<any[]>([]);
    isHistoryLoading = signal<boolean>(false);

    // --- Modal ---
    viewDetails(loan: Loan) {
        this.store.dispatch(LoanActions.selectLoan({ loan }));
        this.modalTab.set('details'); // Reset tab

        // Fetch history
        if (loan.applicant && loan.applicant.id) {
            this.isHistoryLoading.set(true);
            this.customerHistory.set([]); // Clear previous
            this.loanService.getCustomerHistory(loan.applicant.id).subscribe({
                next: (data: any[]) => {
                    this.customerHistory.set(data);
                    this.isHistoryLoading.set(false);
                },
                error: (err: any) => {
                    console.error('Failed to load history', err);
                    this.isHistoryLoading.set(false);
                }
            });
        }
    }

    setModalTab(tab: 'details' | 'documents' | 'history' | 'status') {
        this.modalTab.set(tab);
    }

    closeModal() {
        this.remarksInput = '';  // Clear remarks on close
        // Clean up map
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
        this.mapInitialized = false;
        this.store.dispatch(LoanActions.clearSelection());
    }

    // --- Modal Actions with Remarks ---
    reviewFromModal(id: number) {
        if (!confirm('Review pengajuan ini?')) return;
        this.store.dispatch(LoanActions.reviewLoan({ id, remarks: this.remarksInput || undefined }));
        this.closeModal();
    }

    approveFromModal(loan: Loan) {
        if (!confirm(`Approve pengajuan sebesar ${loan.amount}?`)) return;
        this.store.dispatch(LoanActions.approveLoan({ id: loan.id, amount: loan.amount, remarks: this.remarksInput || undefined }));
        this.closeModal();
    }

    rejectFromModal(id: number) {
        if (!this.remarksInput?.trim()) {
            alert('Harap masukkan alasan penolakan di kolom catatan.');
            return;
        }
        if (!confirm('Tolak pengajuan ini?')) return;
        this.store.dispatch(LoanActions.rejectLoan({ id, remarks: this.remarksInput }));
        this.closeModal();
    }

    activateFromModal(id: number) {
        if (!confirm('Aktifkan credit line ini? (Dana tidak akan dicairkan, hanya aktivasi)')) return;
        this.store.dispatch(LoanActions.activateLoan({ id }));
        this.closeModal();
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
        // Sanitize path: replace backslashes with forward slashes for Windows paths
        const cleanPath = path.replace(/\\/g, '/');
        // Ensure no double slash if path starts with /
        const finalPath = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;

        return `/api/files/${finalPath}`;
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

    canActivate(loan: Loan): boolean {
        // Back Office activates credit lines. Status APPROVED -> ACTIVE.
        return (this.hasRole('ROLE_BACK_OFFICE') || this.hasRole('ROLE_SUPER_ADMIN')) && loan.currentStatus === 'APPROVED';
    }

    // --- Actions ---

    // --- Actions ---

    review(id: number) {
        if (!confirm('Review this loan?')) return;
        this.store.dispatch(LoanActions.reviewLoan({ id }));
    }

    approve(loan: Loan) {
        if (!confirm(`Approve this loan for ${loan.amount}?`)) return;
        this.store.dispatch(LoanActions.approveLoan({ id: loan.id, amount: loan.amount }));
    }

    activate(id: number) {
        if (!confirm('Activate this credit line?')) return;
        this.store.dispatch(LoanActions.activateLoan({ id }));
    }

    reject(id: number) {
        const remarks = prompt('Enter rejection reason (optional):');
        if (!confirm('Reject this loan?')) return;
        this.store.dispatch(LoanActions.rejectLoan({ id, remarks: remarks || undefined }));
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
