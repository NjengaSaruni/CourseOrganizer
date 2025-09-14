import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommunicationService, ClassRepRole, Announcement } from '../../core/communication.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-white border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-6">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Class Announcements</h1>
              <p class="mt-1 text-sm text-gray-600">Manage announcements for your class</p>
            </div>
            <button 
              (click)="openCreateModal()" 
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Create Announcement
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Class Rep Status -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-9 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 9h6m-6 4h6m-6 4h4"/>
                </svg>
              </div>
            </div>
            <div class="ml-4 flex-1">
              <h3 class="text-lg font-semibold text-gray-900">
                {{ classRepRole ? 'Class Representative - ' + classRepRole.student_class_name : 'Student Access' }}
              </h3>
              <p class="text-sm text-gray-600">
                {{ classRepRole ? 'You have permission to send announcements to your class' : 'You can access announcements (testing mode)' }}
              </p>
            </div>
            <div class="flex items-center space-x-4">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                {{ classRepRole ? 'Active' : 'Testing' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Announcements List -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900">Recent Announcements</h2>
            <p class="text-sm text-gray-600 mt-1">Manage your class announcements</p>
          </div>

          <div class="p-6">
            <div *ngIf="loading" class="flex justify-center items-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span class="ml-3 text-gray-600">Loading announcements...</span>
            </div>

            <div *ngIf="!loading && announcements.length === 0" class="text-center py-12">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-9 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 9h6m-6 4h6m-6 4h4"/>
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">No announcements yet</h3>
              <p class="mt-1 text-sm text-gray-500">Get started by creating your first announcement.</p>
              <div class="mt-6">
                <button 
                  (click)="openCreateModal()" 
                  class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  Create Announcement
                </button>
              </div>
            </div>

            <div *ngIf="!loading && announcements.length > 0" class="space-y-4">
              <div 
                *ngFor="let announcement of announcements" 
                class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center space-x-3 mb-2">
                      <h3 class="text-lg font-semibold text-gray-900">{{ announcement.title }}</h3>
                      <span 
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [ngClass]="{
                          'bg-green-100 text-green-800': announcement.priority === 'low',
                          'bg-blue-100 text-blue-800': announcement.priority === 'normal',
                          'bg-yellow-100 text-yellow-800': announcement.priority === 'high',
                          'bg-red-100 text-red-800': announcement.priority === 'urgent'
                        }">
                        {{ announcement.priority | titlecase }}
                      </span>
                      <span *ngIf="announcement.is_pinned" 
                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/>
                        </svg>
                        Pinned
                      </span>
                    </div>
                    <p class="text-gray-700 mb-3">{{ announcement.content }}</p>
                    <div class="flex items-center text-sm text-gray-500">
                      <span>Created {{ announcement.created_at ? formatDate(announcement.created_at) : 'Unknown' }}</span>
                      <span *ngIf="announcement.expires_at" class="ml-4">
                        Expires {{ formatDate(announcement.expires_at) }}
                      </span>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2 ml-4">
                    <button 
                      (click)="editAnnouncement(announcement)" 
                      class="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button 
                      (click)="deleteAnnouncement(announcement)" 
                      class="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Create/Edit Announcement Modal -->
      <div *ngIf="showModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
          <div class="mt-3">
            <!-- Modal Header -->
            <div class="flex items-center justify-between pb-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">
                {{ editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement' }}
              </h3>
              <button 
                (click)="closeModal()" 
                class="text-gray-400 hover:text-gray-600 transition-colors">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Modal Body -->
            <form (ngSubmit)="saveAnnouncement()" class="mt-6 space-y-6">
              <!-- Title -->
              <div>
                <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input 
                  type="text" 
                  id="title" 
                  [(ngModel)]="newAnnouncement.title" 
                  name="title"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter announcement title"
                  required>
              </div>

              <!-- Content -->
              <div>
                <label for="content" class="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea 
                  id="content" 
                  [(ngModel)]="newAnnouncement.content" 
                  name="content"
                  rows="6"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter announcement content"
                  required></textarea>
              </div>

              <!-- Priority -->
              <div>
                <label for="priority" class="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select 
                  id="priority" 
                  [(ngModel)]="newAnnouncement.priority" 
                  name="priority"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <!-- Options -->
              <div class="flex items-center space-x-6">
                <label class="flex items-center">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="newAnnouncement.is_pinned" 
                    name="is_pinned"
                    class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                  <span class="ml-2 text-sm text-gray-700">Pin this announcement</span>
                </label>
              </div>

              <!-- Expiry Date -->
              <div>
                <label for="expires_at" class="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date (Optional)
                </label>
                <input 
                  type="datetime-local" 
                  id="expires_at" 
                  [(ngModel)]="expiryDateString" 
                  name="expires_at"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              </div>

              <!-- Attachment -->
              <div>
                <label for="attachment" class="block text-sm font-medium text-gray-700 mb-2">
                  Attachment (Optional)
                </label>
                <input 
                  type="file" 
                  id="attachment" 
                  (change)="onFileSelected($event)"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              </div>

              <!-- Modal Footer -->
              <div class="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                <button 
                  type="button" 
                  (click)="closeModal()" 
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  [disabled]="submitting"
                  class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  {{ submitting ? 'Saving...' : (editingAnnouncement ? 'Update' : 'Create') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AnnouncementsComponent implements OnInit {
  classRepRole: ClassRepRole | null = null;
  announcements: Announcement[] = [];
  loading = true;
  submitting = false;
  showModal = false;
  editingAnnouncement: Announcement | null = null;
  
  newAnnouncement: Partial<Announcement> = {
    title: '',
    content: '',
    priority: 'normal',
    is_pinned: false,
    expires_at: null,
    attachment: null
  };

  selectedFile: File | null = null;

  expiryDateString = '';

  constructor(
    private communicationService: CommunicationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadClassRepRole();
    this.loadAnnouncements();
  }

  loadClassRepRole(): void {
    this.communicationService.getClassRepRole().subscribe({
      next: (role) => {
        this.classRepRole = role;
        console.log('Class rep role loaded:', role);
        if (!role || !role.permissions.includes('send_announcements')) {
          // For now, just log the error - in production, you might want to redirect
          console.warn('User does not have permission to send announcements, but allowing access for testing');
        }
      },
      error: (error) => {
        console.error('Error loading class rep role:', error);
        // For testing, continue even if we can't load the role
        console.warn('Continuing without class rep role for testing purposes');
      }
    });
  }

  loadAnnouncements(): void {
    this.loading = true;
    this.communicationService.getAnnouncements().subscribe({
      next: (announcements) => {
        this.announcements = announcements;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading announcements:', error);
        this.loading = false;
        // For now, show empty state on error
        this.announcements = [];
      }
    });
  }

  openCreateModal(): void {
    this.editingAnnouncement = null;
    this.newAnnouncement = {
      title: '',
      content: '',
      priority: 'normal',
      is_pinned: false,
      expires_at: null,
      attachment: null
    };
    this.selectedFile = null;
    this.expiryDateString = '';
    this.showModal = true;
  }

  editAnnouncement(announcement: Announcement): void {
    this.editingAnnouncement = announcement;
    this.newAnnouncement = { ...announcement };
    this.expiryDateString = announcement.expires_at ? this.formatDateForInput(announcement.expires_at) : '';
    this.selectedFile = null;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingAnnouncement = null;
    this.newAnnouncement = {
      title: '',
      content: '',
      priority: 'normal',
      is_pinned: false,
      expires_at: null,
      attachment: null
    };
    this.selectedFile = null;
    this.expiryDateString = '';
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  saveAnnouncement(): void {
    if (!this.newAnnouncement.title || !this.newAnnouncement.content) {
      return;
    }

    this.submitting = true;

    // Convert expiry date string to ISO format
    if (this.expiryDateString) {
      this.newAnnouncement.expires_at = new Date(this.expiryDateString).toISOString();
    } else {
      this.newAnnouncement.expires_at = null;
    }

    // Create a clean announcement object without file references
    const announcementData: Announcement = {
      ...this.newAnnouncement,
      attachment: null // TODO: Handle file uploads properly
    } as Announcement;

    const saveOperation = this.editingAnnouncement 
      ? this.communicationService.updateAnnouncement(this.editingAnnouncement.id!, announcementData)
      : this.communicationService.createAnnouncement(announcementData);

    saveOperation.subscribe({
      next: (announcement) => {
        if (this.editingAnnouncement) {
          // Update existing announcement in the list
          const index = this.announcements.findIndex(a => a.id === this.editingAnnouncement!.id);
          if (index !== -1) {
            this.announcements[index] = announcement;
          }
        } else {
          // Add new announcement to the list
          this.announcements.unshift(announcement);
        }
        this.submitting = false;
        this.closeModal();
      },
      error: (error) => {
        console.error('Error saving announcement:', error);
        this.submitting = false;
        // TODO: Show error message to user
      }
    });
  }

  deleteAnnouncement(announcement: Announcement): void {
    if (confirm('Are you sure you want to delete this announcement?')) {
      this.communicationService.deleteAnnouncement(announcement.id!).subscribe({
        next: () => {
          const index = this.announcements.findIndex(a => a.id === announcement.id);
          if (index !== -1) {
            this.announcements.splice(index, 1);
          }
        },
        error: (error) => {
          console.error('Error deleting announcement:', error);
          // TODO: Show error message to user
        }
      });
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}
