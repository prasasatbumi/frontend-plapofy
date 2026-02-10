import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { UserService, User } from '../../core/services/user.service';
import { RoleService, Role } from '../../core/services/role.service';
import { LayoutComponent } from '../../core/components/layout/layout.component';
import { LucideAngularModule, Search, Plus, Trash2, User as UserIcon, X, Power, RefreshCw, Pencil, Building2, ChevronDown } from 'lucide-angular';
import { BranchService, Branch } from '../../core/services/branch.service';

@Component({
    selector: 'app-user-management',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, ReactiveFormsModule, LayoutComponent, LucideAngularModule, FormsModule],
    template: `
    <app-layout>
      <div class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h1 class="text-2xl font-bold text-gray-900">User Management</h1>
           <p class="text-gray-500 mt-1">Manage system users and access roles.</p>
        </div>
        <button (click)="openModal()" class="flex items-center justify-center bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors">
            <lucide-icon [img]="Plus" class="w-4 h-4 mr-2"></lucide-icon>
            Add New User
        </button>
      </div>

      <div class="mb-6 space-y-4">
        <!-- Search, Role & Branch Filters -->
        <div class="flex flex-col md:flex-row gap-4">
             <!-- Search Bar -->
            <div class="relative flex-1">
                <lucide-icon [img]="Search" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"></lucide-icon>
                <input 
                    [value]="searchQuery()"
                    (input)="searchQuery.set($any($event.target).value)"
                    type="text" 
                    placeholder="Search by username or email..." 
                    class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
            </div>

            <!-- Branch Filter (Custom Dropdown) -->
            <div class="w-full md:w-64 relative">
                <!-- Trigger Button -->
                <button 
                    (click)="toggleBranchDropdown()"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg flex items-center justify-between bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-left">
                    <span class="truncate block">{{ selectedBranchName() }}</span>
                    <lucide-icon [img]="ChevronDown" class="w-4 h-4 text-gray-500 transition-transform duration-200" [class.rotate-180]="isBranchDropdownOpen()"></lucide-icon>
                </button>

                <!-- Dropdown Panel -->
                @if (isBranchDropdownOpen()) {
                    <!-- Backdrop -->
                    <div class="fixed inset-0 z-10 cursor-default" (click)="closeBranchDropdown()"></div>
                    
                    <div class="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden flex flex-col max-h-64">
                         <!-- Search Input -->
                        <div class="p-2 border-b border-gray-100 flex items-center bg-gray-50">
                            <lucide-icon [img]="Search" class="w-4 h-4 text-gray-400 ml-1"></lucide-icon>
                            <input 
                                [value]="branchSearchQuery()"
                                (input)="branchSearchQuery.set($any($event.target).value)"
                                (keydown.enter)="selectFirstFilteredBranch()"
                                type="text" 
                                placeholder="Search branch..." 
                                class="w-full pl-2 pr-2 py-1 text-sm bg-transparent border-none focus:ring-0 focus:outline-none text-gray-700"
                                (click)="$event.stopPropagation()"
                                autofocus
                            >
                        </div>
                        
                        <!-- List -->
                        <div class="overflow-y-auto flex-1">
                            <button 
                                (click)="selectBranch(null)"
                                class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center justify-between"
                                [class.text-blue-600]="selectedBranchId() === null"
                                [class.bg-blue-50]="selectedBranchId() === null">
                                All Branches
                                @if (selectedBranchId() === null) { <span class="text-blue-600">✓</span> }
                            </button>
                            
                            @for (branch of filteredBranchList(); track branch.id) {
                                <button 
                                    (click)="selectBranch(branch)"
                                    class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center justify-between"
                                    [class.text-blue-600]="selectedBranchId() === branch.id"
                                    [class.bg-blue-50]="selectedBranchId() === branch.id">
                                    <span class="truncate">{{ branch.name }} <span class="text-gray-400 text-xs">({{ branch.code }})</span></span>
                                    @if (selectedBranchId() === branch.id) { <span class="text-blue-600">✓</span> }
                                </button>
                            }
                            @if (filteredBranchList().length === 0) {
                                <div class="px-4 py-3 text-center text-sm text-gray-500 italic">
                                    No branches found
                                </div>
                            }
                        </div>
                    </div>
                }
            </div>
        </div>

        <!-- Role Filters -->
        <div class="flex flex-wrap gap-2">
            <button (click)="filterRole.set(null)" 
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors border"
                [ngClass]="filterRole() === null ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'">
                All Users
            </button>
            <button (click)="filterRole.set('SUPER_ADMIN')" 
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors border"
                [ngClass]="filterRole() === 'SUPER_ADMIN' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'">
                Super Admin
            </button>
            <button (click)="filterRole.set('BRANCH_MANAGER')" 
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors border"
                [ngClass]="filterRole() === 'BRANCH_MANAGER' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'">
                Branch Manager
            </button>
             <button (click)="filterRole.set('MARKETING')" 
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors border"
                [ngClass]="filterRole() === 'MARKETING' ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'">
                Marketing
            </button>
            <button (click)="filterRole.set('BACK_OFFICE')" 
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors border"
                [ngClass]="filterRole() === 'BACK_OFFICE' ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'">
                Back Office
            </button>
            <button (click)="filterRole.set('NASABAH')" 
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors border"
                [ngClass]="filterRole() === 'NASABAH' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'">
                Nasabah
            </button>
        </div>
      </div>

      <!-- User Table -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                        <th class="px-6 py-4">ID</th>
                        <th class="px-6 py-4">User</th>
                        <th class="px-6 py-4">Role</th>
                        <th class="px-6 py-4">Branches</th>
                        <th class="px-6 py-4">Status</th>
                        <th class="px-6 py-4 text-right">Action</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    @for (user of filteredUsers(); track user.id) {
                    <tr class="hover:bg-gray-50/50 transition-colors">
                        <td class="px-6 py-4 font-mono text-xs text-gray-500">#{{ user.id }}</td>
                        <td class="px-6 py-4">
                            <div class="flex items-center">
                                <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 text-blue-700 font-bold text-xs">
                                    {{ user.username.charAt(0).toUpperCase() }}
                                </div>
                                <div>
                                    <div class="font-medium text-gray-900">{{ user.username }}</div>
                                    <div class="text-xs text-gray-500">{{ user.email }}</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-sm text-gray-600">
                            @for (role of user.roles; track role.id) {
                                <span class="bg-gray-100 px-2 py-1 rounded text-xs mr-1">{{ role.name }}</span>
                            }
                        </td>
                        <td class="px-6 py-4">
                            @if (needsBranches(user)) {
                                <div class="flex flex-wrap gap-1">
                                    @for (branch of user.branches || []; track branch.id) {
                                        <span class="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs">{{ branch.name }}</span>
                                    }
                                    @if (!user.branches || user.branches.length === 0) {
                                        <span class="text-gray-400 text-xs italic">No branches</span>
                                    }
                                    <button (click)="openBranchModal(user)" class="ml-1 p-1 text-purple-500 hover:bg-purple-50 rounded" title="Manage Branches">
                                        <lucide-icon [img]="Building2" class="w-3 h-3"></lucide-icon>
                                    </button>
                                </div>
                            } @else {
                                <span class="text-gray-400 text-xs">N/A</span>
                            }
                        </td>
                        <td class="px-6 py-4">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                [ngClass]="user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                                {{ user.isActive ? 'Active' : 'Inactive' }}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-right flex items-center justify-end gap-2">
                             <button (click)="openEditModal(user)" class="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                <lucide-icon [img]="Pencil" class="w-4 h-4"></lucide-icon>
                            </button>
                            @if (user.isActive) {
                                <button (click)="toggleStatus(user)" class="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Deactivate">
                                    <lucide-icon [img]="Power" class="w-4 h-4"></lucide-icon>
                                </button>
                            } @else {
                                <button (click)="toggleStatus(user)" class="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Reactivate">
                                    <lucide-icon [img]="RefreshCw" class="w-4 h-4"></lucide-icon>
                                </button>
                            }
                        </td>
                    </tr>
                    }
                    @if (filteredUsers().length === 0) {
                        <tr>
                            <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                                No users found matching the selected filter.
                            </td>
                        </tr>
                    }
                </tbody>
            </table>
        </div>
      </div>

      <!-- Add/Edit User Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div class="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 class="text-lg font-bold text-gray-900">{{ isEditMode() ? 'Edit User' : 'Add New User' }}</h2>
                    <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600"><lucide-icon [img]="X" class="w-5 h-5"></lucide-icon></button>
                </div>
                
                <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="p-6 space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input type="text" formControlName="username" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" (input)="cdr.markForCheck()">
                        @if (userForm.get('username')?.touched && userForm.get('username')?.invalid) {
                            <p class="text-xs text-red-500 mt-1">Username is required</p>
                        }
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" formControlName="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" (input)="cdr.markForCheck()">
                        @if (userForm.get('email')?.touched && userForm.get('email')?.invalid) {
                            <p class="text-xs text-red-500 mt-1">Please enter a valid email</p>
                        }
                    </div>
                    <div *ngIf="!isEditMode()">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input type="password" formControlName="password" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select formControlName="role" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" (change)="cdr.markForCheck()">
                            @if (roles().length === 0) {
                                <option value="" disabled>Loading roles...</option>
                            }
                            @for (role of roles(); track role.id) {
                                <option [value]="role.name">{{ role.name }}</option>
                            }
                        </select>
                    </div>

                    @if (shouldShowBranchSelection()) {
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Assign Branches</label>
                            <!-- Search Input for Form Branches -->
                            <div class="mb-2 relative">
                                <lucide-icon [img]="Search" class="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"></lucide-icon>
                                <input 
                                    [value]="formBranchSearchQuery()"
                                    (input)="formBranchSearchQuery.set($any($event.target).value)"
                                    type="text" 
                                    placeholder="Search branches..." 
                                    class="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                            </div>
                            <div class="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                                @if (filteredFormBranches().length === 0) {
                                    <p class="text-sm text-gray-500 italic">No branches found</p>
                                }
                                @for (branch of filteredFormBranches(); track branch.id) {
                                    <label class="flex items-center space-x-3 cursor-pointer p-2 hover:bg-white rounded-md transition-colors"
                                        [class.bg-white]="formBranchIds().includes(branch.id)"
                                        [class.shadow-sm]="formBranchIds().includes(branch.id)">
                                        <input type="checkbox" 
                                            [checked]="formBranchIds().includes(branch.id)"
                                            (change)="toggleFormBranchSelection(branch.id)"
                                            class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500">
                                        <span class="text-sm text-gray-700 select-none">{{ branch.name }}</span>
                                    </label>
                                }
                            </div>
                        </div>
                    }
                    <div>
                        <label class="flex items-center">
                            <input type="checkbox" formControlName="isActive" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                            <span class="ml-2 text-sm text-gray-600">Active</span>
                        </label>
                    </div>

                    <div class="pt-4 flex justify-end gap-3">
                        <button type="button" (click)="closeModal()" class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">Cancel</button>
                        <button type="submit" [disabled]="userForm.invalid" class="px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors disabled:opacity-50">
                            {{ isEditMode() ? 'Update User' : 'Save User' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      }

      <!-- Branch Assignment Modal -->
      @if (showBranchModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div class="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 class="text-lg font-bold text-gray-900">Assign Branches</h2>
                    <button (click)="closeBranchModal()" class="text-gray-400 hover:text-gray-600"><lucide-icon [img]="X" class="w-5 h-5"></lucide-icon></button>
                </div>
                <div class="p-6">
                    <p class="text-sm text-gray-600 mb-4">
                        Assign branches to <strong>{{ branchEditUser()?.username }}</strong>
                    </p>
                    
                     <!-- Search Input for Modal Branches -->
                    <div class="mb-4 relative">
                        <lucide-icon [img]="Search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"></lucide-icon>
                        <input 
                            [value]="modalBranchSearchQuery()"
                            (input)="modalBranchSearchQuery.set($any($event.target).value)"
                            type="text" 
                            placeholder="Search branches..." 
                            class="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        >
                    </div>

                    <div class="space-y-2 max-h-60 overflow-y-auto">
                        @if (filteredModalBranches().length === 0) {
                            <p class="text-sm text-center text-gray-500 py-4 italic">No branches found matching "{{ modalBranchSearchQuery() }}"</p>
                        }
                        @for (branch of filteredModalBranches(); track branch.id) {
                            <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                                [class.border-purple-500]="selectedBranchIds().includes(branch.id)"
                                [class.bg-purple-50]="selectedBranchIds().includes(branch.id)">
                                <input type="checkbox" 
                                    [checked]="selectedBranchIds().includes(branch.id)"
                                    (change)="toggleBranchSelection(branch.id)"
                                    class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500">
                                <div class="ml-3">
                                    <span class="font-medium text-gray-900">{{ branch.name }}</span>
                                    <span class="text-xs text-gray-500 ml-2">({{ branch.code }})</span>
                                </div>
                            </label>
                        }
                    </div>
                </div>
                <div class="p-6 border-t bg-gray-50 flex justify-end gap-3">
                    <button (click)="closeBranchModal()" class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                    <button (click)="saveBranchAssignment()" class="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
                        Save Assignment
                    </button>
                </div>
            </div>
        </div>
      }
    </app-layout>
  `
})
export class UserManagementComponent implements OnInit {
    private userService = inject(UserService);
    private roleService = inject(RoleService);
    private branchService = inject(BranchService);
    private fb = inject(FormBuilder);
    public cdr = inject(ChangeDetectorRef); // Inject CDR

    // ... existing properties ...

    // ... existing properties ...

    // ...

    ngOnInit() {
        this.loadUsers();
        this.loadRoles();
        this.loadBranches();

        // Watch role changes
        this.userForm.get('role')?.valueChanges.subscribe(role => {
            console.log('Role changed:', role); // Debug
            this.updateBranchSelectionVisibility(role);
        });

        // Watch form status changes to ensure button state updates (OnPush)
        this.userForm.statusChanges.subscribe(() => {
            this.cdr.markForCheck();
        });
    }

    updateBranchSelectionVisibility(role: string | null | undefined) {
        const show = role === 'MARKETING' || role === 'BRANCH_MANAGER';
        console.log('Update visibility:', show, 'for role:', role);
        this.showBranchSelection.set(show);
        this.cdr.markForCheck(); // Force check
    }
    readonly Plus = Plus;
    readonly Trash2 = Trash2;
    readonly Search = Search;
    readonly X = X;
    readonly Power = Power;
    readonly RefreshCw = RefreshCw;
    readonly Pencil = Pencil;
    readonly Building2 = Building2;
    readonly ChevronDown = ChevronDown;

    users = signal<User[]>([]);
    roles = signal<Role[]>([]);
    branches = signal<Branch[]>([]);
    showModal = signal(false);
    isEditMode = signal(false);
    selectedUserId = signal<number | null>(null);

    // Filter signals
    // Branch Filter Signals
    selectedBranchId = signal<number | null>(null);
    isBranchDropdownOpen = signal(false);
    branchSearchQuery = signal('');

    // Computed filtered branches for dropdown
    filteredBranchList = computed(() => {
        const query = this.branchSearchQuery().toLowerCase().trim();
        const branches = this.branches();
        if (!query) return branches;
        return branches.filter(b =>
            b.name.toLowerCase().includes(query) ||
            b.code.toLowerCase().includes(query)
        );
    });

    // Form Branch Search
    formBranchSearchQuery = signal('');
    filteredFormBranches = computed(() => {
        const query = this.formBranchSearchQuery().toLowerCase().trim();
        const branches = this.branches();
        if (!query) return branches;
        return branches.filter(b =>
            b.name.toLowerCase().includes(query) ||
            b.code.toLowerCase().includes(query)
        );
    });

    // Modal Branch Search
    modalBranchSearchQuery = signal('');
    filteredModalBranches = computed(() => {
        const query = this.modalBranchSearchQuery().toLowerCase().trim();
        const branches = this.branches();
        if (!query) return branches;
        return branches.filter(b =>
            b.name.toLowerCase().includes(query) ||
            b.code.toLowerCase().includes(query)
        );
    });

    // Helper to get selected branch name
    selectedBranchName = computed(() => {
        const id = this.selectedBranchId();
        if (!id) return 'All Branches';
        const branch = this.branches().find(b => b.id === id);
        return branch ? `${branch.name} (${branch.code})` : 'All Branches';
    });

    // Branch assignment modal
    showBranchModal = signal(false);
    branchEditUser = signal<User | null>(null);
    selectedBranchIds = signal<number[]>([]);

    // Signal for branch selection visibility in form
    showBranchSelection = signal(false);

    filterRole = signal<string | null>(null);
    searchQuery = signal<string>('');

    filteredUsers = computed(() => {
        const role = this.filterRole();
        const query = this.searchQuery().toLowerCase().trim();
        const users = this.users();

        return users.filter(u => {
            const matchesRole = !role || u.roles?.some(r => r.name === role);
            const matchesSearch = !query ||
                u.username.toLowerCase().includes(query) ||
                u.email.toLowerCase().includes(query);

            return matchesRole && matchesSearch;
        });
    });

    userForm = this.fb.group({
        username: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: [''], // Removed required initially, dynamic
        role: ['NASABAH', Validators.required],
        isActive: [true]
    });

    // Duplicates removed

    loadRoles() {
        this.roleService.getRoles().subscribe({
            next: (data: Role[]) => this.roles.set(data),
            error: (err: unknown) => console.error('Failed to load roles', err)
        });
    }

    // Branch Dropdown Actions
    toggleBranchDropdown() {
        this.isBranchDropdownOpen.update(v => !v);
        if (this.isBranchDropdownOpen()) {
            this.branchSearchQuery.set(''); // Reset search on open
        }
    }

    closeBranchDropdown() {
        this.isBranchDropdownOpen.set(false);
    }

    selectBranch(branch: Branch | null) {
        this.selectedBranchId.set(branch ? branch.id : null);
        this.closeBranchDropdown();
        this.loadUsers();
    }

    selectFirstFilteredBranch() {
        const list = this.filteredBranchList();
        if (list.length > 0) {
            this.selectBranch(list[0]);
        }
    }

    loadUsers() {
        const branchId = this.selectedBranchId();
        console.log('DEBUG: loadUsers called. Selected Branch ID:', branchId);
        this.userService.getUsers(branchId).subscribe({
            next: (data: User[]) => {
                console.log(`DEBUG: Loaded ${data.length} users from backend.`);
                this.users.set(data);
            },
            error: (err: unknown) => console.error('Failed to load users', err)
        });
    }

    loadBranches() {
        this.branchService.getBranches().subscribe({
            next: (data: Branch[]) => this.branches.set(data),
            error: (err: unknown) => console.error('Failed to load branches', err)
        });
    }

    needsBranches(user: User): boolean {
        return user.roles?.some(r => r.name === 'MARKETING' || r.name === 'BRANCH_MANAGER') ?? false;
    }

    openBranchModal(user: User) {
        this.branchEditUser.set(user);
        this.selectedBranchIds.set(user.branches?.map(b => b.id) || []);
        this.modalBranchSearchQuery.set(''); // Reset search
        this.showBranchModal.set(true);
    }

    closeBranchModal() {
        this.showBranchModal.set(false);
        this.branchEditUser.set(null);
    }

    toggleBranchSelection(branchId: number) {
        const current = this.selectedBranchIds();
        if (current.includes(branchId)) {
            this.selectedBranchIds.set(current.filter(id => id !== branchId));
        } else {
            this.selectedBranchIds.set([...current, branchId]);
        }
    }

    saveBranchAssignment() {
        const user = this.branchEditUser();
        if (!user) return;

        this.userService.assignBranches(user.id, this.selectedBranchIds()).subscribe({
            next: () => {
                this.loadUsers();
                this.closeBranchModal();
            },
            error: (err: unknown) => alert('Failed to assign branches')
        });
    }

    // Form branch selection
    formBranchIds = signal<number[]>([]);

    openModal() {
        this.isEditMode.set(false);
        this.selectedUserId.set(null);
        this.formBranchIds.set([]); // Reset branches
        this.formBranchSearchQuery.set(''); // Reset search
        this.userForm.reset({ isActive: true, role: 'NASABAH' });
        this.userForm.get('password')?.setValidators([Validators.required]);
        this.userForm.get('password')?.updateValueAndValidity();
        this.showModal.set(true);
    }

    openEditModal(user: User) {
        this.isEditMode.set(true);
        this.selectedUserId.set(user.id);
        this.formBranchSearchQuery.set(''); // Reset search

        // Flatten role for form
        const userRole = user.roles && user.roles.length > 0 ? user.roles[0].name : 'NASABAH';

        // Set existing branches
        this.formBranchIds.set(user.branches?.map(b => b.id) || []);

        this.userForm.patchValue({
            username: user.username,
            email: user.email,
            role: userRole,
            isActive: user.isActive,
            password: '' // Don't prefill password
        });

        this.userForm.get('password')?.clearValidators();
        this.userForm.get('password')?.updateValueAndValidity();

        this.showModal.set(true);
    }

    toggleFormBranchSelection(branchId: number) {
        const current = this.formBranchIds();
        if (current.includes(branchId)) {
            this.formBranchIds.set(current.filter(id => id !== branchId));
        } else {
            this.formBranchIds.set([...current, branchId]);
        }
    }

    shouldShowBranchSelection(): boolean {
        return this.showBranchSelection();
    }

    closeModal() {
        this.showModal.set(false);
        this.isEditMode.set(false);
        this.selectedUserId.set(null);
        this.formBranchIds.set([]);
        this.userForm.reset();
    }

    onSubmit() {
        console.log('Form submission started. Invalid:', this.userForm.invalid);
        if (this.userForm.invalid) {
            console.log('Invalid controls:', Object.keys(this.userForm.controls).filter(k => this.userForm.get(k)?.invalid));
            return;
        }

        const formValue = this.userForm.value;
        console.log('Form values extracted:', formValue);

        const userData: User = {
            id: this.selectedUserId() || 0,
            username: formValue.username!,
            email: formValue.email!,
            password: formValue.password || '', // Send empty string if empty, not undefined
            isActive: formValue.isActive!,
            roles: [{ id: 0, name: formValue.role! }]
        };

        // If edit mode and password empty, remove it so backend ignores it (if supported) 
        // OR let backend handle empty string as "no change"? 
        // UserServiceImpl: if (user.getPassword() != null && !user.getPassword().isEmpty()) { encode }
        // Wait, UserServiceImpl line 32 encodes WITHOUT checking isEmpty?
        // Ah, I need to check UserServiceImpl.
        // If I can't check, assume I should send what works.
        // If I send '', backend encodes hash of empty string.
        // If this is CREATE, hash of empty string is better than crash.
        // If this is UPDATE, hash of empty string overwrites password! BAD.

        if (this.isEditMode() && !userData.password) {
            delete userData.password; // Remove if empty on edit
        }

        // Attach branches if applicable
        if (this.shouldShowBranchSelection()) {
            userData.branches = this.formBranchIds().map(id => ({ id } as any));
        } else {
            userData.branches = [];
        }

        console.log('Submitting user:', userData);

        if (this.isEditMode() && this.selectedUserId()) {
            this.userService.updateUser(this.selectedUserId()!, userData).subscribe({
                next: () => {
                    this.userService.assignBranches(userData.id, this.formBranchIds()).subscribe(() => {
                        this.loadUsers();
                        this.closeModal();
                    });
                },
                error: (err: unknown) => alert('Failed to update user')
            });
        } else {
            this.userService.createUser(userData).subscribe({
                next: () => {
                    this.loadUsers();
                    this.closeModal();
                },
                error: (err: unknown) => {
                    console.error('Create user error:', err);
                    alert('Failed to create user');
                }
            });
        }
    }

    deleteUser(user: User) {
        if (!confirm(`Are you sure you want to deactivate/delete ${user.username}?`)) return;
        this.userService.deleteUser(user.id).subscribe({
            next: () => this.loadUsers(),
            error: (err: unknown) => alert('Failed to delete user')
        });
    }

    toggleStatus(user: User) {
        const newStatus = !user.isActive;
        const action = newStatus ? 'activate' : 'deactivate';
        if (!confirm(`Are you sure you want to ${action} ${user.username}?`)) return;

        this.userService.updateStatus(user.id, newStatus).subscribe({
            next: () => this.loadUsers(),
            error: (err: unknown) => alert(`Failed to ${action} user`)
        });
    }
}
