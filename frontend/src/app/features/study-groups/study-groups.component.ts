import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GroupworkService, StudyGroup } from '../../core/groupwork.service';

@Component({
  selector: 'app-study-groups',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-white border-b border-gray-200">
        <div class="max-w-6xl mx-auto px-4 sm:px-6">
          <div class="py-6">
            <h1 class="text-3xl font-bold text-gray-900">Study Groups</h1>
            <p class="text-gray-600 mt-2">Collaborate with classmates and organize study sessions</p>
          </div>
        </div>
      </div>

      <div class="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <!-- Search and Filter -->
        <div class="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <div class="flex flex-col sm:flex-row gap-4 items-center">
            <div class="flex-1">
              <input 
                [ngModel]="query()" 
                (ngModelChange)="query.set($event)" 
                placeholder="Search study groups..." 
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all" 
              />
            </div>
            <div class="flex gap-3">
              <button 
                (click)="refresh()" 
                class="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-colors">
                Search
              </button>
              <button 
                (click)="toggleCreateForm()" 
                class="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-medium transition-colors flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                Create Group
              </button>
            </div>
          </div>
        </div>

        <!-- Create Group Section (Collapsible) -->
        <div *ngIf="showCreateForm()" class="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Create Study Group</h2>
            <button 
              (click)="toggleCreateForm()" 
              class="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <svg class="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
              <input 
                [ngModel]="newName()" 
                (ngModelChange)="newName.set($event)" 
                placeholder="Enter group name" 
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all" 
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <input 
                [ngModel]="newDesc()" 
                (ngModelChange)="newDesc.set($event)" 
                placeholder="Optional description" 
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all" 
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Course Focus</label>
              <select 
                [ngModel]="selectedCourseId()" 
                (ngModelChange)="selectedCourseId.set($event)" 
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all">
                <option [ngValue]="null">No specific course</option>
                <option *ngFor="let c of myCourses()" [ngValue]="c.id">{{ c.code }} - {{ c.name }}</option>
              </select>
            </div>
            <div class="flex items-end">
              <label class="flex items-center space-x-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  [ngModel]="isPrivate()" 
                  (ngModelChange)="isPrivate.set($event)" 
                  class="w-5 h-5 text-gray-900 border-gray-300 rounded focus:ring-gray-900" 
                />
                <span class="text-sm font-medium text-gray-700">Private group</span>
              </label>
            </div>
          </div>
          
          <button 
            (click)="create()" 
            [disabled]="!newName().trim() || creating()"
            class="px-8 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors">
            <span *ngIf="!creating()">Create Group</span>
            <span *ngIf="creating()" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </span>
          </button>
        </div>

        <!-- Groups List -->
        <div class="space-y-4">
          <div *ngIf="groups().length === 0 && !loading()" class="text-center py-12">
            <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">No study groups found</h3>
            <p class="text-gray-600">Create your first study group to get started!</p>
          </div>

          <div *ngFor="let g of groups()" class="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center mb-3">
                  <h3 class="text-xl font-bold text-gray-900 mr-3">{{ g.name }}</h3>
                  <span *ngIf="g.is_private" class="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                    Private
                  </span>
                  <span *ngIf="!g.is_private" class="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    Open
                  </span>
                </div>
                
                <p *ngIf="g.description" class="text-gray-600 mb-3">{{ g.description }}</p>
                
                <div class="flex items-center space-x-4 text-sm text-gray-500">
                  <div class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                    {{ g.members_count }} members
                  </div>
                  <div *ngIf="g.course_name" class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                    </svg>
                    {{ g.course_name }}
                  </div>
                </div>
              </div>
              
              <div class="flex items-center space-x-3 ml-6">
                <!-- Join Button (for non-members) -->
                <button 
                  *ngIf="!isMemberOfGroup(g.id)"
                  (click)="join(g)" 
                  [disabled]="joiningGroup() === g.id"
                  class="px-6 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors">
                  <span *ngIf="joiningGroup() !== g.id">Join Group</span>
                  <span *ngIf="joiningGroup() === g.id" class="flex items-center">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Joining...
                  </span>
                </button>
                
                <!-- View Group Button (for members) -->
                <button 
                  *ngIf="isMemberOfGroup(g.id)"
                  (click)="viewGroup(g)" 
                  class="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-colors">
                  View Group
                </button>
                
                <!-- Leave Button (for members) -->
                <button 
                  *ngIf="isMemberOfGroup(g.id)"
                  (click)="leave(g)" 
                  [disabled]="leavingGroup() === g.id"
                  class="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors">
                  <span *ngIf="leavingGroup() !== g.id">Leave</span>
                  <span *ngIf="leavingGroup() === g.id" class="flex items-center">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Leaving...
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading()" class="text-center py-12">
          <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg class="animate-spin h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p class="text-gray-600">Loading study groups...</p>
        </div>
      </div>
    </div>
  `
})
export class StudyGroupsComponent {
  private api = inject(GroupworkService);
  private router = inject(Router);

  groups = signal<StudyGroup[]>([]);
  query = signal('');
  newName = signal('');
  newDesc = signal('');
  isPrivate = signal(false);
  myCourses = signal<any[]>([]);
  selectedCourseId = signal<number | null>(null);
  loading = signal(false);
  creating = signal(false);
  joiningGroup = signal<number | null>(null);
  leavingGroup = signal<number | null>(null);
  showCreateForm = signal(false);
  myGroupIds = signal<number[]>([]);

  ngOnInit() {
    this.loadGroups();
    this.loadCourses();
    this.loadMyGroups();
  }

  loadGroups() {
    this.loading.set(true);
    this.api.listGroups(this.query()).subscribe({
      next: (gs) => {
        this.groups.set(gs);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading groups:', error);
        this.loading.set(false);
      }
    });
  }

  loadCourses() {
    this.api.listMyCourses().subscribe({
      next: (data) => this.myCourses.set(data.courses || []),
      error: (error) => console.error('Error loading courses:', error)
    });
  }

  loadMyGroups() {
    this.api.myGroups().subscribe({
      next: (groups) => {
        const groupIds = groups.map(g => g.id);
        this.myGroupIds.set(groupIds);
      },
      error: (error) => console.error('Error loading my groups:', error)
    });
  }

  refresh() {
    this.loadGroups();
    this.loadMyGroups();
  }

  create() {
    const name = this.newName().trim();
    if (!name || this.creating()) return;
    
    this.creating.set(true);
    const payload: any = { 
      name, 
      description: this.newDesc().trim() || undefined, 
      is_private: this.isPrivate() || undefined 
    };
    if (this.selectedCourseId()) payload.course = this.selectedCourseId();
    
    this.api.createGroup(payload).subscribe({
      next: () => {
        this.newName.set('');
        this.newDesc.set('');
        this.isPrivate.set(false);
        this.selectedCourseId.set(null);
        this.creating.set(false);
        this.showCreateForm.set(false);
        this.refresh();
      },
      error: (error) => {
        console.error('Error creating group:', error);
        this.creating.set(false);
        // TODO: Show error message to user
      }
    });
  }

  join(g: StudyGroup) {
    if (this.joiningGroup() === g.id) return;
    
    this.joiningGroup.set(g.id);
    this.api.requestJoin(g.id).subscribe({
      next: (response) => {
        console.log('Join response:', response);
        this.joiningGroup.set(null);
        this.refresh();
        // TODO: Show success message to user
      },
      error: (error) => {
        console.error('Error joining group:', error);
        this.joiningGroup.set(null);
        // TODO: Show error message to user
      }
    });
  }

  toggleCreateForm() {
    this.showCreateForm.set(!this.showCreateForm());
  }

  isMemberOfGroup(groupId: number): boolean {
    return this.myGroupIds().includes(groupId);
  }

  leave(g: StudyGroup) {
    if (this.leavingGroup() === g.id) return;
    
    this.leavingGroup.set(g.id);
    this.api.leaveGroup(g.id).subscribe({
      next: (response) => {
        console.log('Leave response:', response);
        this.leavingGroup.set(null);
        this.refresh();
        // TODO: Show success message to user
      },
      error: (error) => {
        console.error('Error leaving group:', error);
        this.leavingGroup.set(null);
        // TODO: Show error message to user
      }
    });
  }

  viewGroup(g: StudyGroup) {
    this.router.navigate(['/study-groups', g.id]);
  }
}


