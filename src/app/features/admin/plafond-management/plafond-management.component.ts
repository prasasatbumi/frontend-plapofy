import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Edit, Save, X, Plus, Trash2, Search } from 'lucide-angular';
import { PlafondService, Plafond, ProductInterest } from '../../../core/services/plafond.service';
import { LayoutComponent } from '../../../core/components/layout/layout.component';

@Component({
  selector: 'app-plafond-management',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, LayoutComponent],
  template: `
    <app-layout>
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">Plafond Products</h2>
              <p class="text-gray-500 mt-1">Manage credit limits and interest rates.</p>
            </div>
            <button (click)="openCreateModal()" class="flex items-center justify-center bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors">
                <lucide-icon [img]="Plus" class="w-4 h-4 mr-2"></lucide-icon>
                Add New Plafond
            </button>
          </div>

          <!-- Search & Toolkit -->
          <div class="flex flex-col md:flex-row gap-4">
              <!-- Search Bar -->
              <div class="relative flex-1">
                  <lucide-icon [img]="Search" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"></lucide-icon>
                  <input 
                      [ngModel]="searchQuery()"
                      (ngModelChange)="searchQuery.set($event)"
                      type="text" 
                      placeholder="Search by package name or code..." 
                      class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
              </div>
          </div>

          <!-- Plafond Table -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                            <th class="px-6 py-4">Name</th>
                            <th class="px-6 py-4">Code</th>
                            <th class="px-6 py-4">Credit Limit</th>
                            <th class="px-6 py-4">Interest Rates</th>
                            <th class="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <tr *ngFor="let p of filteredPlafonds()" class="hover:bg-gray-50/50 transition-colors">
                            <td class="px-6 py-4">
                                <div class="font-medium text-gray-900">{{ p.name }}</div>
                                <div class="text-xs text-gray-500 truncate max-w-[200px]">{{ p.description }}</div>
                            </td>
                            <td class="px-6 py-4">
                                <span class="bg-gray-100 px-2 py-1 rounded text-xs font-mono text-gray-600">{{ p.code }}</span>
                            </td>
                            <td class="px-6 py-4 text-sm font-medium text-gray-700">
                                {{ p.maxAmount | currency:'Rp ':'symbol':'1.0-0' }}
                            </td>
                            <td class="px-6 py-4">
                                 <div class="flex flex-wrap gap-1">
                                    <span *ngFor="let i of p.interests" class="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs border border-blue-100">
                                        {{ i.tenor }}mo: {{ i.interestRate }}%
                                    </span>
                                 </div>
                            </td>
                            <td class="px-6 py-4 text-right">
                                 <button (click)="openEditModal(p)" class="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mr-1" title="Edit Package">
                                    <lucide-icon [img]="Edit" class="w-4 h-4"></lucide-icon>
                                </button>
                                <button (click)="deletePlafond(p)" class="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Package">
                                    <lucide-icon [img]="Trash2" class="w-4 h-4"></lucide-icon>
                                </button>
                            </td>
                        </tr>
                        <tr *ngIf="filteredPlafonds().length === 0">
                            <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                                No plafond products found.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
          </div>

          <!-- Edit Modal -->
          <div *ngIf="isModalOpen()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div class="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <div class="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                <h3 class="text-xl font-bold text-gray-900">{{ editingPlafond() ? 'Edit Plafond: ' + editingPlafond()?.name : 'Create New Plafond' }}</h3>
                 <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600">
                  <lucide-icon [img]="X" class="w-6 h-6"></lucide-icon>
                </button>
              </div>
              
              <div class="p-6 space-y-6">
                <div class="grid md:grid-cols-2 gap-4">
                   <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input [(ngModel)]="editForm.name" class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                   </div>
                   <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Code</label>
                      <!-- Helper: Code editable only if creating new (conceptually), but API might not support create yet. Allowing edit for now if needed or disabled if existing. -->
                      <input [(ngModel)]="editForm.code" [disabled]="!!editingPlafond()" class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed">
                   </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea [(ngModel)]="editForm.description" rows="2" class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
                </div>

                 <div>
                   <label class="block text-sm font-medium text-gray-700 mb-1">Credit Limit</label>
                   <div class="relative">
                     <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rp</span>
                     <input type="number" [(ngModel)]="editForm.maxAmount" class="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                   </div>
                 </div>

                <div>
                    <div class="flex justify-between items-center mb-2">
                        <label class="block text-sm font-medium text-gray-700">Interest Rates</label>
                         <button (click)="addInterest()" class="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
                            <lucide-icon [img]="Plus" class="w-4 h-4"></lucide-icon> Add Rate
                         </button>
                    </div>
                    <div class="space-y-2">
                        <div *ngFor="let int of editForm.interests; let i = index" class="flex items-center gap-3">
                            <div class="flex-1">
                                 <input type="number" [(ngModel)]="int.tenor" placeholder="Tenor (mos)" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                            </div>
                            <div class="flex-1 relative">
                                 <input type="number" [(ngModel)]="int.interestRate" placeholder="Rate (%)" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                                 <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                            </div>
                            <button (click)="removeInterest(i)" class="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                                <lucide-icon [img]="Trash2" class="w-4 h-4"></lucide-icon>
                            </button>
                        </div>
                    </div>
                </div>

              </div>
              
              <div class="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-3xl">
                <button (click)="closeModal()" class="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
                <button (click)="savePlafond()" [disabled]="isSaving()" class="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                     <lucide-icon [img]="Save" class="w-4 h-4"></lucide-icon>
                     {{ isSaving() ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </div>
          </div>
        </div>
    </app-layout>
  `
})
export class PlafondManagementComponent {
  private plafondService = inject(PlafondService);

  // Icons
  readonly Edit = Edit;
  readonly Save = Save;
  readonly X = X;
  readonly Plus = Plus;
  readonly Trash2 = Trash2;
  readonly Search = Search;

  plafonds = signal<Plafond[]>([]);
  searchQuery = signal('');

  // Computed Filter
  filteredPlafonds = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const list = this.plafonds();
    if (!query) return list;
    return list.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.code.toLowerCase().includes(query)
    );
  });

  isModalOpen = signal(false);
  isSaving = signal(false);
  editingPlafond = signal<Plafond | null>(null);

  editForm: any = {
    name: '',
    code: '',
    description: '',
    maxAmount: 0,
    interests: []
  };

  constructor() {
    this.loadPlafonds();
  }

  loadPlafonds() {
    this.plafondService.getPlafonds().subscribe({
      next: (data) => this.plafonds.set(data),
      error: (err) => console.error('Failed to load plafonds', err)
    });
  }

  openCreateModal() {
    this.editingPlafond.set(null);
    this.editForm = {
      name: '',
      code: '',
      description: '',
      maxAmount: 0,
      interests: [{ tenor: 12, interestRate: 5 }]
    };
    this.isModalOpen.set(true);
  }

  openEditModal(p: Plafond) {
    this.editingPlafond.set(p);
    this.editForm = JSON.parse(JSON.stringify(p));
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingPlafond.set(null);
  }

  addInterest() {
    this.editForm.interests.push({ tenor: 0, interestRate: 0 });
  }

  removeInterest(index: number) {
    this.editForm.interests.splice(index, 1);
  }

  deletePlafond(plafond: Plafond) {
    if (confirm(`Are you sure you want to delete ${plafond.name}? This action cannot be undone.`)) {
      this.plafondService.deletePlafond(plafond.id).subscribe({
        next: () => {
          this.plafonds.update(list => list.filter(p => p.id !== plafond.id));
        },
        error: (err) => {
          console.error('Failed to delete plafond', err);
          alert('Failed to delete package.');
        }
      });
    }
  }

  savePlafond() {
    const id = this.editingPlafond()?.id;

    // Handle Update
    if (id) {
      this.isSaving.set(true);
      this.plafondService.updatePlafond(id, this.editForm).subscribe({
        next: (updated) => {
          this.plafonds.update(list => list.map(p => p.id === id ? updated : p));
          this.isSaving.set(false);
          this.closeModal();
        },
        error: (err) => {
          console.error('Failed to update plafond', err);
          this.isSaving.set(false);
          alert('Failed to save changes');
        }
      });
    } else {
      // Create New
      this.isSaving.set(true);
      this.plafondService.createPlafond(this.editForm).subscribe({
        next: (created) => {
          this.plafonds.update(list => [...list, created]);
          this.isSaving.set(false);
          this.closeModal();
        },
        error: (err) => {
          console.error('Failed to create plafond', err);
          this.isSaving.set(false);
          alert('Failed to create new package. Please try again.');
        }
      });
    }
  }
}
