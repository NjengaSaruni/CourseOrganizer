import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CourseService, Course } from '../../core/course.service';
import { CourseContentService } from '../../core/course-content.service';
import { AuthService } from '../../core/auth.service';
import { PageLayoutComponent } from '../../shared/page-layout/page-layout.component';
import { MaterialsFormComponent } from '../course-content-manager/forms/materials-form.component';
import { RecordingsFormComponent } from '../course-content-manager/forms/recordings-form.component';
import { CourseOutlineFormComponent } from '../course-content-manager/forms/course-outline-form.component';
import { PastPapersFormComponent } from '../course-content-manager/forms/past-papers-form.component';
import { AssignmentsFormComponent } from '../course-content-manager/forms/assignments-form.component';
import { ButtonComponent } from '../../shared/button/button.component';

export type ManagementTab = 'materials' | 'recordings' | 'outlines' | 'past-papers' | 'assignments' | 'manage';

interface UploadedItem {
  id?: number;
  title: string;
  type: ManagementTab;
  course_name: string;
  uploaded_at: Date;
  status: 'success' | 'error' | 'uploading';
}

interface ManageContentItem {
  id: number;
  title: string;
  type: 'outline' | 'past-paper' | 'material' | 'assignment' | 'recording';
  course_name: string;
  created_at: string;
  file_url?: string;
}

@Component({
  selector: 'app-content-management-hub',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    PageLayoutComponent,
    MaterialsFormComponent,
    RecordingsFormComponent,
    CourseOutlineFormComponent,
    PastPapersFormComponent,
    AssignmentsFormComponent,
    ButtonComponent
  ],
  templateUrl: './content-management-hub.component.html',
  styleUrls: ['./content-management-hub.component.css']
})

export class ContentManagementHubComponent implements OnInit {
  // State
  activeTab: ManagementTab = 'materials';
  courses: Course[] = [];
  loading = false;
  error = '';
  successMessage = '';
  
  // Tips visibility
  showTips = true;
  
  // Recent uploads tracking
  recentUploads: UploadedItem[] = [];
  
  // Content management
  managedContent: ManageContentItem[] = [];
  selectedCourseForManage: number | null = null;
  loadingContent = false;
  itemToDelete: ManageContentItem | null = null;
  showDeleteConfirm = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private courseService: CourseService,
    private contentService: CourseContentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Check authorization
    const user = this.authService.getCurrentUser();
    if (!user || (!user.is_admin && !user.can_upload_content)) {
      this.router.navigate(['/login']);
      return;
    }

    // Load tips visibility preference from localStorage
    const savedTipsPreference = localStorage.getItem('contentManagementTipsVisible');
    if (savedTipsPreference !== null) {
      this.showTips = savedTipsPreference === 'true';
    }

    // Handle tab query parameter
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.activeTab = params['tab'] as ManagementTab;
      }
    });

    this.loadCourses();
  }

  loadCourses(): void {
    this.loading = true;
    this.courseService.getCourses().subscribe({
      next: (courses: Course[]) => {
        this.courses = courses;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error loading courses:', error);
        this.error = 'Failed to load courses. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  switchTab(tab: ManagementTab): void {
    this.activeTab = tab;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge'
    });
    
    // Load content if switching to manage tab
    if (tab === 'manage' && this.selectedCourseForManage) {
      this.loadContentForCourse(this.selectedCourseForManage);
    }
  }

  loadContentForCourse(courseId: number): void {
    this.selectedCourseForManage = courseId;
    this.loadingContent = true;
    this.managedContent = [];

    const course = this.courses.find(c => c.id === courseId);
    const courseName = course?.name || 'Unknown Course';

    // Load all content types
    Promise.all([
      this.contentService.getCourseOutlines(courseId).toPromise(),
      this.contentService.getPastPapers(courseId).toPromise(),
      this.contentService.getMaterials(courseId).toPromise(),
      this.contentService.getAssignments(courseId).toPromise()
    ]).then(([outlines, papers, materials, assignments]) => {
      // Map outlines
      (outlines || []).forEach((item: any) => {
        this.managedContent.push({
          id: item.id,
          title: item.title || 'Course Outline',
          type: 'outline',
          course_name: courseName,
          created_at: item.created_at,
          file_url: item.file_url
        });
      });

      // Map past papers
      (papers || []).forEach((item: any) => {
        this.managedContent.push({
          id: item.id,
          title: item.title || 'Past Paper',
          type: 'past-paper',
          course_name: courseName,
          created_at: item.created_at,
          file_url: item.file_url
        });
      });

      // Map materials
      (materials || []).forEach((item: any) => {
        this.managedContent.push({
          id: item.id,
          title: item.title || 'Material',
          type: 'material',
          course_name: courseName,
          created_at: item.created_at,
          file_url: item.file_url
        });
      });

      // Map assignments
      (assignments || []).forEach((item: any) => {
        this.managedContent.push({
          id: item.id,
          title: item.title || 'Assignment',
          type: 'assignment',
          course_name: courseName,
          created_at: item.created_at,
          file_url: item.file_url
        });
      });

      this.loadingContent = false;
      this.cdr.detectChanges();
    }).catch(error => {
      console.error('Error loading content:', error);
      this.error = 'Failed to load content. Please try again.';
      this.loadingContent = false;
      this.cdr.detectChanges();
    });
  }

  confirmDelete(item: ManageContentItem): void {
    this.itemToDelete = item;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.itemToDelete = null;
    this.showDeleteConfirm = false;
  }

  deleteContent(): void {
    if (!this.itemToDelete) return;

    const item = this.itemToDelete;
    let deleteObservable;

    switch (item.type) {
      case 'outline':
        deleteObservable = this.contentService.deleteCourseOutline(item.id);
        break;
      case 'past-paper':
        deleteObservable = this.contentService.deletePastPaper(item.id);
        break;
      case 'material':
        deleteObservable = this.contentService.deleteMaterial(item.id);
        break;
      case 'assignment':
        deleteObservable = this.contentService.deleteAssignment(item.id);
        break;
      default:
        this.error = 'Unknown content type';
        this.cancelDelete();
        return;
    }

    deleteObservable.subscribe({
      next: () => {
        this.successMessage = `Successfully deleted "${item.title}"`;
        this.managedContent = this.managedContent.filter(c => c.id !== item.id);
        this.cancelDelete();
        this.cdr.detectChanges();
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 5000);
      },
      error: (error: any) => {
        console.error('Error deleting content:', error);
        this.error = 'Failed to delete content. Please try again.';
        this.cancelDelete();
        this.cdr.detectChanges();
      }
    });
  }

  getContentTypeLabel(type: string): string {
    const labels: {[key: string]: string} = {
      'outline': 'Course Outline',
      'past-paper': 'Past Paper',
      'material': 'Material',
      'assignment': 'Assignment',
      'recording': 'Recording'
    };
    return labels[type] || type;
  }

  getContentTypeBadgeClass(type: string): string {
    const classes: {[key: string]: string} = {
      'outline': 'bg-purple-100 text-purple-800',
      'past-paper': 'bg-blue-100 text-blue-800',
      'material': 'bg-green-100 text-green-800',
      'assignment': 'bg-red-100 text-red-800',
      'recording': 'bg-yellow-100 text-yellow-800'
    };
    return classes[type] || 'bg-gray-100 text-gray-800';
  }

  onContentUploaded(event: any): void {
    // Handle successful content upload from child forms
    console.log('Content uploaded:', event);
    
    // Show success message
    this.successMessage = `Successfully uploaded "${event.title}" for ${event.course_name}`;
    this.error = ''; // Clear any previous errors
    
    // Add to recent uploads
    const newUpload: UploadedItem = {
      id: event.id,
      title: event.title,
      type: this.activeTab,
      course_name: event.course_name || 'Unknown Course',
      uploaded_at: new Date(),
      status: 'success'
    };
    
    this.recentUploads.unshift(newUpload);
    
    // Keep only the last 10 uploads
    if (this.recentUploads.length > 10) {
      this.recentUploads = this.recentUploads.slice(0, 10);
    }
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      this.successMessage = '';
      this.cdr.detectChanges();
    }, 5000);
    
    this.cdr.detectChanges();
  }

  onUploadError(event: any): void {
    // Handle upload error from child forms
    console.error('Upload error:', event);
    this.error = event.message || event || 'An error occurred during upload.';
    this.successMessage = ''; // Clear any success messages
    
    // Clear error after 5 seconds
    setTimeout(() => {
      this.error = '';
      this.cdr.detectChanges();
    }, 5000);
  }

  getTabIcon(tab: ManagementTab): string {
    const icons: {[key in ManagementTab]: string} = {
      'materials': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      'recordings': 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
      'outlines': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      'past-papers': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      'assignments': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      'manage': 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
    };
    return icons[tab];
  }

  getTabColor(tab: ManagementTab): string {
    const colors: {[key in ManagementTab]: string} = {
      'materials': 'orange',
      'recordings': 'green',
      'outlines': 'blue',
      'past-papers': 'purple',
      'assignments': 'red',
      'manage': 'gray'
    };
    return colors[tab];
  }

  clearRecentUploads(): void {
    this.recentUploads = [];
  }

  toggleTips(): void {
    this.showTips = !this.showTips;
    // Save preference to localStorage
    localStorage.setItem('contentManagementTipsVisible', this.showTips.toString());
  }
}
