import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../../core/components/layout/layout.component';
import { LucideAngularModule, Building2, Plus, Pencil, Trash2, X, Check, MapPin, Users, BarChart } from 'lucide-angular';
import { BranchService, Branch } from '../../core/services/branch.service';

@Component({
  selector: 'app-branch-management',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent, LucideAngularModule],
  template: `
    <app-layout>
      <div class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Branch Management</h1>
          <p class="text-gray-500 mt-1">Manage branch offices for loan processing.</p>
        </div>
        
        <div class="flex gap-2">
            <!-- Search Bar -->
            <div class="relative">
                <lucide-icon [name]="'search'" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"></lucide-icon>
                <input 
                    type="text" 
                    [value]="searchQuery()"
                    (input)="searchQuery.set($any($event.target).value)"
                    placeholder="Search branches..." 
                    class="pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-64"
                >
            </div>

            <button (click)="openModal()" 
            class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <lucide-icon [img]="Plus" class="w-4 h-4"></lucide-icon>
            Add New Branch
            </button>
        </div>
      </div>

      <!-- Branch Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (branch of filteredBranches(); track branch.id) {
          <div (click)="viewDetails(branch)" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer group">
            <div class="flex justify-between items-start mb-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-purple-50 group-hover:bg-purple-100 flex items-center justify-center transition-colors">
                  <lucide-icon [img]="Building2" class="w-6 h-6 text-purple-600"></lucide-icon>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 uppercase group-hover:text-blue-600 transition-colors">{{ branch.name }}</h3>
                  <span class="text-xs text-gray-500">ID: {{ branch.id }}</span>
                </div>
              </div>
              <div class="flex gap-1" (click)="$event.stopPropagation()">
                <button (click)="editBranch(branch)" class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <lucide-icon [img]="Pencil" class="w-4 h-4"></lucide-icon>
                </button>
                <button (click)="deleteBranch(branch)" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <lucide-icon [img]="Trash2" class="w-4 h-4"></lucide-icon>
                </button>
              </div>
            </div>
            
            <div class="space-y-3 pt-2 border-t border-gray-50">
                <div class="flex items-start gap-2 text-sm text-gray-600">
                    <lucide-icon [img]="Users" class="w-4 h-4 mt-0.5 text-blue-500"></lucide-icon>
                    <div>
                        <span class="text-xs font-semibold text-gray-500 uppercase block mb-0.5">Branch Manager</span>
                        <div class="font-medium text-gray-900">
                            @if (branch.branchManagers && branch.branchManagers.length > 0) {
                                <div class="flex -space-x-2 overflow-hidden">
                                    @for(bm of branch.branchManagers; track bm.username) {
                                        <div class="inline-block h-6 w-6 rounded-full bg-blue-100 ring-2 ring-white text-[10px] flex items-center justify-center text-blue-800 font-bold" title="{{bm.username}}">
                                            {{ bm.username.charAt(0).toUpperCase() }}
                                        </div>
                                    }
                                </div>
                            } @else {
                                <span class="text-gray-400 italic">Not Assigned</span>
                            }
                        </div>
                    </div>
                </div>

                <div class="flex items-center gap-2 text-sm text-gray-600">
                    <lucide-icon [img]="BarChart" class="w-4 h-4 text-green-500"></lucide-icon>
                    <div>
                        <span class="text-xs font-semibold text-gray-500 uppercase">Marketing Staff: </span>
                        <span class="font-medium text-gray-900 ml-1">{{ branch.marketingStaff?.length || 0 }}</span>
                    </div>
                </div>
            </div>

            <div class="space-y-2 text-sm mt-4 pt-4 border-t border-gray-100">
              <div class="flex items-center gap-2 text-gray-600">
                <span class="font-medium text-gray-500">Code:</span>
                <span class="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono">{{ branch.code }}</span>
              </div>
              @if (branch.address) {
                <div class="flex items-start gap-2 text-gray-600">
                  <lucide-icon [img]="MapPin" class="w-4 h-4 mt-0.5 text-gray-400"></lucide-icon>
                  <span class="line-clamp-1">{{ branch.address }}</span>
                </div>
              }
            </div>
          </div>
        }
      </div>

      @if (filteredBranches().length === 0 && !isLoading()) {
        <div class="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
           <lucide-icon [name]="'search'" class="w-12 h-12 mx-auto mb-4 text-gray-400"></lucide-icon>
           <p>No branches found matching your search.</p>
        </div>
      }

      <!-- Edit/Create Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" (click)="closeModal()">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4" (click)="$event.stopPropagation()">
            <div class="flex justify-between items-center p-6 border-b">
              <h2 class="text-lg font-semibold text-gray-900">
                {{ editingBranch() ? 'Edit Branch' : 'Add New Branch' }}
              </h2>
              <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600">
                <lucide-icon [img]="X" class="w-5 h-5"></lucide-icon>
              </button>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Branch Code *</label>
                <input [(ngModel)]="formData.code" type="text" 
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., CIP" maxlength="10">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Branch Name *</label>
                <input [(ngModel)]="formData.name" type="text" 
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Ciputat">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea [(ngModel)]="formData.address" rows="2"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Full address"></textarea>
              </div>
            </div>
            <div class="flex justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-2xl">
              <button (click)="closeModal()" class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                Cancel
              </button>
              <button (click)="saveBranch()" [disabled]="isSaving()"
                class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                <lucide-icon [img]="Check" class="w-4 h-4"></lucide-icon>
                {{ editingBranch() ? 'Update' : 'Create' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Detailed Info Modal -->
      @if (selectedBranchDetails()) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]" (click)="closeDetailsModal()">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden max-h-[90vh] flex flex-col" (click)="$event.stopPropagation()">
                <!-- Header -->
                <div class="p-6 border-b flex justify-between items-start bg-gray-50">
                    <div>
                        <div class="flex items-center gap-3 mb-1">
                            <div class="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                                <lucide-icon [img]="Building2" class="w-5 h-5"></lucide-icon>
                            </div>
                            <div>
                                <h2 class="text-xl font-bold text-gray-900">{{ selectedBranchDetails()!.name }}</h2>
                                <span class="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs font-mono">{{ selectedBranchDetails()!.code }}</span>
                            </div>
                        </div>
                        <p class="text-gray-500 text-sm mt-2 ml-13 flex items-center gap-1">
                            <lucide-icon [img]="MapPin" class="w-3 h-3"></lucide-icon>
                            {{ selectedBranchDetails()!.address || 'No Address Provided' }}
                        </p>
                    </div>
                    <button (click)="closeDetailsModal()" class="text-gray-400 hover:text-gray-600 bg-white rounded-full p-2 border hover:bg-gray-50 transition-colors">
                        <lucide-icon [img]="X" class="w-5 h-5"></lucide-icon>
                    </button>
                </div>

                <!-- Content -->
                <div class="p-6 overflow-y-auto space-y-8">
                    
                    <!-- Branch Manager Section -->
                    <div>
                        <div class="flex items-center gap-2 mb-4">
                            <lucide-icon [img]="Users" class="w-5 h-5 text-blue-600"></lucide-icon>
                            <h3 class="text-lg font-semibold text-gray-900">Branch Manager</h3>
                        </div>
                        
                        @if (selectedBranchDetails()!.branchManagers?.length) {
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                @for (bm of selectedBranchDetails()!.branchManagers; track bm.username) {
                                    <div class="flex items-start gap-4 p-4 rounded-xl border border-blue-100 bg-blue-50/50">
                                        <div class="w-10 h-10 rounded-full bg-white text-blue-600 font-bold flex items-center justify-center border border-blue-100 shadow-sm">
                                            {{ bm.username.charAt(0).toUpperCase() }}
                                        </div>
                                        <div>
                                            <div class="font-semibold text-gray-900">{{ bm.username }}</div>
                                            <div class="text-xs text-gray-500 mb-1">{{ bm.email }}</div>
                                            <div class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-blue-100 text-xs text-blue-700">
                                                <span>Work Duration:</span>
                                                <span class="font-bold">{{ getDuration(bm.joinedAt) }}</span>
                                            </div>
                                        </div>
                                    </div>
                                }
                            </div>
                        } @else {
                            <div class="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500">
                                No Branch Manager Assigned
                            </div>
                        }
                    </div>

                    <!-- Marketing Staff Section -->
                     <div>
                        <div class="flex items-center gap-2 mb-4">
                            <lucide-icon [img]="BarChart" class="w-5 h-5 text-green-600"></lucide-icon>
                            <h3 class="text-lg font-semibold text-gray-900">Marketing Team ({{ selectedBranchDetails()!.marketingStaff?.length || 0 }})</h3>
                        </div>

                        @if (selectedBranchDetails()!.marketingStaff?.length) {
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                @for (staff of selectedBranchDetails()!.marketingStaff; track staff.username) {
                                    <div class="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-green-200 hover:bg-green-50/30 transition-colors">
                                        <div class="w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold flex items-center justify-center text-xs">
                                            {{ staff.username.charAt(0).toUpperCase() }}
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <div class="font-medium text-gray-900 truncate">{{ staff.username }}</div>
                                            <div class="text-xs text-gray-500 truncate">{{ staff.email }}</div>
                                            <div class="mt-1 text-xs text-gray-400 flex items-center gap-1">
                                                <span>Joined: {{ getDuration(staff.joinedAt) }} ago</span>
                                            </div>
                                        </div>
                                    </div>
                                }
                            </div>
                        } @else {
                             <div class="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500">
                                No Marketing Staff Assigned
                            </div>
                        }
                     </div>

                </div>
            </div>
        </div>
      }
    </app-layout>
  `
})
export class BranchManagementComponent implements OnInit {
  private branchService = inject(BranchService);

  // Icons
  readonly Building2 = Building2;
  readonly Plus = Plus;
  readonly Pencil = Pencil;
  readonly Trash2 = Trash2;
  readonly X = X;
  readonly Check = Check;
  readonly MapPin = MapPin;
  readonly Users = Users;
  readonly BarChart = BarChart;

  branches = signal<Branch[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  showModal = signal(false);
  editingBranch = signal<Branch | null>(null);

  formData = {
    code: '',
    name: '',
    address: ''
  };

  searchQuery = signal('');
  selectedBranchDetails = signal<Branch | null>(null);

  filteredBranches = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    return this.branches().filter(b =>
      b.name.toLowerCase().includes(query) ||
      b.code.toLowerCase().includes(query)
    );
  });

  ngOnInit() {
    this.loadBranches();
  }

  loadBranches() {
    this.isLoading.set(true);
    this.branchService.getBranches().subscribe({
      next: (data) => {
        this.branches.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  viewDetails(branch: Branch) {
    this.selectedBranchDetails.set(branch);
  }

  closeDetailsModal() {
    this.selectedBranchDetails.set(null);
  }

  getDuration(isoDate: string): string {
    if (!isoDate) return 'N/A';
    const start = new Date(isoDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) return `${diffDays} days`;
    const months = Math.floor(diffDays / 30);
    if (months < 12) return `${months} months`;
    const years = Math.floor(months / 12);
    return `${years} years`;
  }

  openModal() {
    this.formData = { code: '', name: '', address: '' };
    this.editingBranch.set(null);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingBranch.set(null);
  }

  editBranch(branch: Branch) {
    this.formData = {
      code: branch.code,
      name: branch.name,
      address: branch.address || ''
    };
    this.editingBranch.set(branch);
    this.showModal.set(true);
  }

  saveBranch() {
    if (!this.formData.code || !this.formData.name) {
      alert('Code and Name are required');
      return;
    }

    this.isSaving.set(true);
    const branch = this.editingBranch();

    if (branch) {
      this.branchService.updateBranch(branch.id, this.formData).subscribe({
        next: () => {
          this.loadBranches();
          this.closeModal();
          this.isSaving.set(false);
        },
        error: (err) => {
          alert('Failed to update: ' + (err.error?.message || 'Unknown error'));
          this.isSaving.set(false);
        }
      });
    } else {
      this.branchService.createBranch(this.formData).subscribe({
        next: () => {
          this.loadBranches();
          this.closeModal();
          this.isSaving.set(false);
        },
        error: (err) => {
          alert('Failed to create: ' + (err.error?.message || 'Unknown error'));
          this.isSaving.set(false);
        }
      });
    }
  }

  deleteBranch(branch: Branch) {
    if (confirm(`Delete branch "${branch.name}"?`)) {
      this.branchService.deleteBranch(branch.id).subscribe({
        next: () => this.loadBranches(),
        error: (err) => alert('Failed to delete: ' + (err.error?.message || 'Unknown error'))
      });
    }
  }
}
