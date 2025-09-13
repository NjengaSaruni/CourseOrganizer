import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageLayoutComponent } from '../../shared/page-layout/page-layout.component';
import { CommunicationService, ClassRepRole, User, Class } from '../../core/communication.service';

@Component({
  selector: 'app-class-rep-management',
  standalone: true,
  imports: [CommonModule, FormsModule, PageLayoutComponent],
  template: `
    <app-page-layout 
      pageTitle="Class Representative Management" 
      pageSubtitle="Manage Class Representatives and their permissions"
      [isSidebarOpen]="isSidebarOpen"
      (sidebarToggle)="onSidebarToggle($event)">
      
      <!-- Header Section -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Class Representative Management</h1>
            <p class="text-lg text-gray-600">Assign and manage Class Representatives for each class</p>
          </div>
          <button 
            (click)="openAssignModal()"
            class="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">
            <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Assign Class Rep
          </button>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white border border-gray-200 rounded-2xl p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Active Class Reps</p>
              <p class="text-2xl font-bold text-gray-900">{{ activeClassRepsCount }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white border border-gray-200 rounded-2xl p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Classes</p>
              <p class="text-2xl font-bold text-gray-900">{{ classes.length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white border border-gray-200 rounded-2xl p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
              <svg class="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Students</p>
              <p class="text-2xl font-bold text-gray-900">{{ totalStudentsCount }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Class Representatives List -->
      <div class="bg-white border border-gray-200 rounded-3xl overflow-hidden">
        <div class="px-8 py-6 border-b border-gray-100">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-semibold text-gray-900">Class Representatives</h2>
              <p class="text-sm text-gray-600 mt-1">Manage Class Representatives and their permissions</p>
            </div>
            <div class="flex items-center space-x-4">
              <div class="flex items-center space-x-2">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-sm font-medium text-gray-700">{{ activeClassRepsCount }} active</span>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span class="text-sm font-medium text-gray-700">{{ inactiveClassRepsCount }} inactive</span>
              </div>
            </div>
          </div>
        </div>

        <div class="p-8">
          <!-- Empty State -->
          <div *ngIf="(!classReps || classReps.length === 0) && !loading" class="text-center py-16">
            <div class="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg class="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">No Class Representatives</h3>
            <p class="text-gray-600 max-w-md mx-auto mb-6">No Class Representatives have been assigned yet. Click the button above to assign your first Class Representative.</p>
          </div>

          <!-- Loading State -->
          <div *ngIf="loading" class="text-center py-16">
            <div class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading Class Representatives...
            </div>
          </div>

          <!-- Class Rep Cards -->
          <div *ngIf="classReps && classReps.length > 0 && !loading" class="space-y-6">
            <div *ngFor="let classRep of classReps" 
                 class="bg-gray-50 border border-gray-200 rounded-2xl p-6 hover:bg-gray-100 transition-colors">
              
              <!-- Class Rep Header -->
              <div class="flex items-start justify-between mb-6">
                <div class="flex items-center space-x-4">
                  <div class="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <svg class="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 class="text-lg font-semibold text-gray-900">{{ classRep.user_name }}</h4>
                    <p class="text-sm text-gray-600">{{ classRep.user_registration_number }}</p>
                    <p class="text-sm text-gray-600">{{ classRep.student_class_name }}</p>
                  </div>
                </div>
                
                <div class="flex items-center space-x-3">
                  <span [class]="classRep.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                        class="inline-flex items-center px-3 py-1 rounded-xl text-sm font-medium">
                    <div [class]="classRep.is_active ? 'bg-green-500' : 'bg-gray-400'"
                         class="w-2 h-2 rounded-full mr-2"></div>
                    {{ classRep.is_active ? 'Active' : 'Inactive' }}
                  </span>
                  
                  <div class="flex space-x-2">
                    <button 
                      (click)="editPermissions(classRep)"
                      class="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                    
                    <button 
                      (click)="toggleClassRepStatus(classRep)"
                      [class]="classRep.is_active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'"
                      class="p-2 transition-colors">
                      <svg *ngIf="classRep.is_active" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                      </svg>
                      <svg *ngIf="!classRep.is_active" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    
                    <button 
                      (click)="deleteClassRep(classRep)"
                      class="p-2 text-gray-400 hover:text-red-600 transition-colors">
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Permissions -->
              <div class="mb-4">
                <h5 class="text-sm font-medium text-gray-700 mb-3">Permissions</h5>
                <div class="flex flex-wrap gap-2">
                  <span *ngFor="let permission of classRep.permissions_display" 
                        class="inline-flex items-center px-3 py-1 rounded-xl text-sm font-medium bg-blue-100 text-blue-800">
                    {{ permission }}
                  </span>
                  <span *ngIf="classRep.permissions.length === 0" 
                        class="text-sm text-gray-500 italic">No permissions assigned</span>
                </div>
              </div>
              
              <!-- Assignment Info -->
              <div class="flex items-center justify-between text-xs text-gray-500">
                <div class="flex items-center space-x-2">
                  <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Assigned: {{ formatDate(classRep.assigned_at) }} by {{ classRep.assigned_by_name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Assign Class Rep Modal -->
      <div *ngIf="showAssignModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-2xl bg-white">
          <div class="mt-3">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Assign Class Representative</h3>
              <button (click)="closeAssignModal()" class="text-gray-400 hover:text-gray-600">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form (ngSubmit)="assignClassRep()" #assignForm="ngForm">
              <div class="space-y-4">
                <!-- Class Selection -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Class</label>
                  <select [(ngModel)]="newClassRep.student_class" name="student_class" required 
                          class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select a class</option>
                    <option *ngFor="let classItem of classes" [value]="classItem.id">
                      {{ classItem.display_name }}
                    </option>
                  </select>
                </div>
                
                <!-- Student Selection -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Student</label>
                  <select [(ngModel)]="newClassRep.user" name="user" required 
                          class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select a student</option>
                    <option *ngFor="let student of filteredStudents" [value]="student.id">
                      {{ student.full_name }} ({{ student.registration_number }})
                    </option>
                  </select>
                </div>
                
                <!-- Permissions -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                  <div class="space-y-2">
                    <label *ngFor="let permission of availablePermissions" class="flex items-center">
                      <input type="checkbox" 
                             [value]="permission"
                             (change)="togglePermission(permission, $event)"
                             class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                      <span class="ml-2 text-sm text-gray-700">{{ getPermissionDisplayName(permission) }}</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div class="flex items-center justify-end space-x-3 mt-6">
                <button type="button" 
                        (click)="closeAssignModal()"
                        class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" 
                        [disabled]="!assignForm.form.valid || selectedPermissions.length === 0"
                        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  Assign Class Rep
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Edit Permissions Modal -->
      <div *ngIf="showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-2xl bg-white">
          <div class="mt-3">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Edit Permissions</h3>
              <button (click)="closeEditModal()" class="text-gray-400 hover:text-gray-600">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div class="mb-4">
              <p class="text-sm text-gray-600">Editing permissions for:</p>
              <p class="text-lg font-semibold text-gray-900">{{ editingClassRep?.user_name }}</p>
              <p class="text-sm text-gray-600">{{ editingClassRep?.student_class_name }}</p>
            </div>
            
            <form (ngSubmit)="updatePermissions()" #editForm="ngForm">
              <div class="space-y-2">
                <label *ngFor="let permission of availablePermissions" class="flex items-center">
                  <input type="checkbox" 
                         [value]="permission"
                         [checked]="editingPermissions.includes(permission)"
                         (change)="toggleEditingPermission(permission, $event)"
                         class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                  <span class="ml-2 text-sm text-gray-700">{{ getPermissionDisplayName(permission) }}</span>
                </label>
              </div>
              
              <div class="flex items-center justify-end space-x-3 mt-6">
                <button type="button" 
                        (click)="closeEditModal()"
                        class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" 
                        [disabled]="editingPermissions.length === 0"
                        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  Update Permissions
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </app-page-layout>
  `,
  styles: []
})
export class ClassRepManagementComponent implements OnInit {
  classReps: ClassRepRole[] = [];
  students: User[] = [];
  classes: Class[] = [];
  loading = false;
  isSidebarOpen = false;
  
  // Modal states
  showAssignModal = false;
  showEditModal = false;
  
  // Form data
  newClassRep: Partial<ClassRepRole> = {
    student_class: undefined,
    user: undefined,
    permissions: [],
    is_active: true
  };
  
  editingClassRep: ClassRepRole | null = null;
  editingPermissions: string[] = [];
  selectedPermissions: string[] = [];
  availablePermissions: string[] = [];

  constructor(
    private communicationService: CommunicationService,
    private cdr: ChangeDetectorRef
  ) {
    this.availablePermissions = this.communicationService.getAvailablePermissions();
  }

  ngOnInit(): void {
    this.loadData();
  }

  onSidebarToggle(isOpen: boolean): void {
    this.isSidebarOpen = isOpen;
  }

  private   loadData(): void {
    this.loading = true;
    
    // Ensure arrays are always initialized
    this.classReps = [];
    this.students = [];
    this.classes = [];
    
    // Load all data in parallel
    Promise.all([
      this.communicationService.getClassReps().toPromise().catch(err => {
        console.error('Error loading class reps:', err);
        return [];
      }),
      this.communicationService.getStudents('approved').toPromise().catch(err => {
        console.error('Error loading students:', err);
        return [];
      }),
      this.communicationService.getClasses().toPromise().catch(err => {
        console.error('Error loading classes:', err);
        return [];
      })
    ]).then(([classReps, students, classes]) => {
      // Handle different response formats
      const parseResponse = (data: any): any[] => {
        if (Array.isArray(data)) {
          return data;
        }
        if (data && Array.isArray(data.results)) {
          return data.results;
        }
        if (data && Array.isArray(data.data)) {
          return data.data;
        }
        return [];
      };
      
      this.classReps = parseResponse(classReps);
      this.students = parseResponse(students);
      this.classes = parseResponse(classes);
      
      this.loading = false;
      this.cdr.detectChanges();
    }).catch(error => {
      console.error('Error loading data:', error);
      // Ensure arrays are still initialized even on complete failure
      this.classReps = [];
      this.students = [];
      this.classes = [];
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  get filteredStudents(): User[] {
    if (!Array.isArray(this.students)) {
      return [];
    }
    
    if (!this.newClassRep.student_class) {
      return this.students.filter(student => student.user_type === 'student');
    }
    
    return this.students.filter(student => {
      if (student.user_type !== 'student') {
        return false;
      }
      
      // Handle both object and ID formats for student_class
      const studentClassId = typeof student.student_class === 'object' && student.student_class !== null
        ? (student.student_class as Class).id 
        : student.student_class as number;
      
      return studentClassId === this.newClassRep.student_class;
    });
  }

  get activeClassRepsCount(): number {
    if (!Array.isArray(this.classReps)) {
      return 0;
    }
    return this.classReps.filter(rep => rep.is_active).length;
  }

  get inactiveClassRepsCount(): number {
    if (!Array.isArray(this.classReps)) {
      return 0;
    }
    return this.classReps.filter(rep => !rep.is_active).length;
  }

  get totalStudentsCount(): number {
    if (!Array.isArray(this.students)) {
      return 0;
    }
    return this.students.filter(student => student.user_type === 'student').length;
  }

  openAssignModal(): void {
    // Auto-populate with default class
    this.newClassRep = {
      student_class: undefined,
      user: undefined,
      permissions: [],
      is_active: true
    };
    this.selectedPermissions = [];
    
    // Get default class and auto-populate
    this.communicationService.getDefaultClass().subscribe({
      next: (defaultClass) => {
        this.newClassRep.student_class = defaultClass.id;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching default class:', error);
      }
    });
    
    this.showAssignModal = true;
  }

  closeAssignModal(): void {
    this.showAssignModal = false;
    this.newClassRep = {
      student_class: undefined,
      user: undefined,
      permissions: [],
      is_active: true
    };
    this.selectedPermissions = [];
  }

  openEditModal(classRep: ClassRepRole): void {
    this.editingClassRep = classRep;
    this.editingPermissions = [...classRep.permissions];
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingClassRep = null;
    this.editingPermissions = [];
  }

  togglePermission(permission: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      if (!this.selectedPermissions.includes(permission)) {
        this.selectedPermissions.push(permission);
      }
    } else {
      this.selectedPermissions = this.selectedPermissions.filter(p => p !== permission);
    }
  }

  toggleEditingPermission(permission: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      if (!this.editingPermissions.includes(permission)) {
        this.editingPermissions.push(permission);
      }
    } else {
      this.editingPermissions = this.editingPermissions.filter(p => p !== permission);
    }
  }

  assignClassRep(): void {
    if (!this.newClassRep.user || !this.newClassRep.student_class || this.selectedPermissions.length === 0) {
      return;
    }

    const classRepData: Partial<ClassRepRole> = {
      user: this.newClassRep.user,
      student_class: this.newClassRep.student_class,
      permissions: this.selectedPermissions,
      is_active: true
    };

    this.communicationService.createClassRep(classRepData).subscribe({
      next: (response) => {
        this.loadData();
        this.closeAssignModal();
        console.log('Class Rep assigned successfully:', response);
      },
      error: (error) => {
        console.error('Error assigning Class Rep:', error);
      }
    });
  }

  updatePermissions(): void {
    if (!this.editingClassRep || this.editingPermissions.length === 0) {
      return;
    }

    this.communicationService.updateClassRepPermissions(this.editingClassRep.user, this.editingPermissions).subscribe({
      next: (response) => {
        this.loadData();
        this.closeEditModal();
        console.log('Permissions updated successfully:', response);
      },
      error: (error) => {
        console.error('Error updating permissions:', error);
      }
    });
  }

  toggleClassRepStatus(classRep: ClassRepRole): void {
    const updatedData = {
      ...classRep,
      is_active: !classRep.is_active
    };

    this.communicationService.updateClassRep(classRep.id, updatedData).subscribe({
      next: (response) => {
        this.loadData();
        console.log('Class Rep status updated:', response);
      },
      error: (error) => {
        console.error('Error updating Class Rep status:', error);
      }
    });
  }

  deleteClassRep(classRep: ClassRepRole): void {
    if (confirm(`Are you sure you want to remove ${classRep.user_name} as Class Representative?`)) {
      this.communicationService.deleteClassRep(classRep.id).subscribe({
        next: () => {
          this.loadData();
          console.log('Class Rep deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting Class Rep:', error);
        }
      });
    }
  }

  editPermissions(classRep: ClassRepRole): void {
    this.openEditModal(classRep);
  }

  getPermissionDisplayName(permission: string): string {
    return this.communicationService.getPermissionDisplayName(permission);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}
