import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CourseService, Course } from '../../core/course.service';
import { CourseContentService } from '../../core/course-content.service';
import { AuthService } from '../../core/auth.service';
import { PageLayoutComponent } from '../../shared/page-layout/page-layout.component';

export type TabType = 'all' | 'materials' | 'recordings' | 'timeline' | 'assignments';

export interface ContentItem {
  id: number;
  title: string;
  description: string;
  type: 'material' | 'recording' | 'timeline' | 'assignment' | 'outline' | 'past_paper';
  file_url?: string;
  uploaded_by_name: string;
  created_at: string;
  course_name: string;
  date?: string; // For timeline items
  due_date?: string; // For assignments
  duration?: string; // For recordings
  material_type?: string;
  exam_type?: string;
  view_count?: number;
  download_count?: number;
}

@Component({
  selector: 'app-learning-hub',
  standalone: true,
  imports: [CommonModule, FormsModule, PageLayoutComponent],
  templateUrl: './learning-hub.component.html',
  styleUrls: ['./learning-hub.component.css']
})
export class LearningHubComponent implements OnInit {
  // State
  activeTab: TabType = 'all';
  courses: Course[] = [];
  selectedCourseId: number | null = null;
  selectedCourse: Course | null = null;
  isSidebarOpen = false;
  isLoading = true;
  error: string | null = null;

  // Content
  allContent: ContentItem[] = [];
  filteredContent: ContentItem[] = [];
  recentlyViewed: ContentItem[] = [];
  newContent: ContentItem[] = [];

  // Filters
  searchQuery = '';
  viewMode: 'grid' | 'list' = 'grid';
  sortBy: 'date' | 'title' | 'views' = 'date';
  
  constructor(
    private courseService: CourseService,
    private contentService: CourseContentService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Check for tab parameter in URL
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.activeTab = params['tab'] as TabType;
      }
      if (params['course']) {
        this.selectedCourseId = parseInt(params['course'], 10);
      }
    });

    // Set responsive default view mode
    this.setDefaultViewMode();
    
    if (this.authService.isAuthenticated()) {
      this.loadCourses();
    } else {
      this.isLoading = false;
    }
  }

  private setDefaultViewMode(): void {
    const screenWidth = window.innerWidth;
    this.viewMode = screenWidth < 768 ? 'list' : 'grid';
  }

  onSidebarToggle(isOpen: boolean): void {
    this.isSidebarOpen = isOpen;
  }

  loadCourses(): void {
    this.isLoading = true;
    this.courseService.getCourses().subscribe({
      next: (courses: Course[]) => {
        this.courses = courses;
        
        // Auto-select course if there's only one or from URL param
        if (this.selectedCourseId) {
          const course = courses.find((c: Course) => c.id === this.selectedCourseId);
          if (course) {
            this.selectCourse(course);
          }
        } else if (courses.length === 1) {
          this.selectCourse(courses[0]);
        } else {
          this.isLoading = false;
        }
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error loading courses:', error);
        this.error = 'Failed to load courses';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  selectCourse(course: Course): void {
    this.selectedCourse = course;
    this.selectedCourseId = course.id;
    
    // Update URL without navigating
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { course: course.id, tab: this.activeTab },
      queryParamsHandling: 'merge'
    });

    this.loadAllContent();
  }

  loadAllContent(): void {
    if (!this.selectedCourseId) return;
    
    this.isLoading = true;
    this.error = null;
    this.allContent = [];

    // Load all content types using the course-materials service approach
    this.loadCourseMaterials();
  }

  private loadCourseMaterials(): void {
    if (!this.selectedCourseId) return;

    // Use the CourseContentService to load timeline data which includes all content types
    this.contentService.getCourseTimeline(this.selectedCourseId).subscribe({
      next: (response) => {
        // Convert timeline response to ContentItems
        const items: ContentItem[] = [];

        // Process timeline lessons and their content
        if (response.timeline && Array.isArray(response.timeline)) {
          response.timeline.forEach(lesson => {
            if (lesson.content && Array.isArray(lesson.content)) {
              lesson.content.forEach((contentItem: any) => {
                // Backend returns items in format: { type: 'course_outline', data: {...} }
                // OR directly as content objects for old timeline items
                const content = contentItem.data || contentItem;
                const contentType = contentItem.type || content.content_type;
                
                // Map content type to our internal format
                let mappedType: 'material' | 'recording' | 'timeline' | 'assignment' | 'outline' | 'past_paper' = 'material';
                if (contentType === 'course_outline') mappedType = 'outline';
                else if (contentType === 'past_paper') mappedType = 'past_paper';
                else if (contentType === 'assignment') mappedType = 'assignment';
                else if (contentType === 'material') mappedType = 'material';
                else if (contentType === 'old_content') mappedType = this.mapContentType(content.content_type);
                else mappedType = this.mapContentType(contentType);

                items.push({
                  id: content.id,
                  title: content.title || content.topic || 'Untitled',
                  description: content.description || content.topic || '',
                  type: mappedType,
                  file_url: content.file_url || content.file,
                  uploaded_by_name: content.uploaded_by_name || 'Unknown',
                  created_at: content.created_at || lesson.lesson_date,
                  course_name: this.selectedCourse?.name || '',
                  date: lesson.lesson_date,
                  duration: content.duration_display || content.duration,
                  view_count: content.view_count,
                  download_count: content.download_count,
                  material_type: content.material_type,
                  exam_type: content.exam_type,
                  due_date: content.due_date
                });
              });
            }
          });
        }

        // Timeline already includes all content types, so just finalize
        // No need to load additional materials separately
        this.finalizeContent(items);
      },
      error: (error) => {
        console.error('Error loading timeline:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Removed separate loading methods - timeline endpoint now includes all content types

  private finalizeContent(items: ContentItem[]): void {
    // Deduplicate items using multiple strategies
    const uniqueItems = new Map<string, ContentItem>();
    
    items.forEach(item => {
      // Try multiple keys for deduplication
      const idKey = item.id ? `${item.type}-${item.id}` : null;
      const urlKey = item.file_url ? `url-${item.file_url}` : null;
      
      // Check if we already have this item (by ID or URL)
      let isDuplicate = false;
      let existingKey: string | null = null;
      
      if (idKey && uniqueItems.has(idKey)) {
        isDuplicate = true;
        existingKey = idKey;
      } else if (urlKey) {
        // Check if any existing item has the same URL
        for (const [key, existingItem] of uniqueItems.entries()) {
          if (existingItem.file_url && existingItem.file_url === item.file_url) {
            isDuplicate = true;
            existingKey = key;
            break;
          }
        }
      }
      
      if (!isDuplicate) {
        // First time seeing this item
        const key = idKey || urlKey || `temp-${uniqueItems.size}`;
        uniqueItems.set(key, item);
      } else if (existingKey) {
        // We have a duplicate - keep the better one
        const existing = uniqueItems.get(existingKey);
        if (existing) {
          // Prefer items with proper titles over generic ones
          const genericTitles = ['Untitled', 'Course Outline', 'Past Paper', 'Material', 'Assignment', 'Recording'];
          const existingIsGeneric = genericTitles.includes(existing.title);
          const newIsGeneric = genericTitles.includes(item.title);
          
          if (existingIsGeneric && !newIsGeneric) {
            // Replace generic with specific
            uniqueItems.set(existingKey, item);
          } else if (!existingIsGeneric && newIsGeneric) {
            // Keep existing specific title
            // Do nothing
          } else if (existing.uploaded_by_name === 'Unknown' && item.uploaded_by_name !== 'Unknown') {
            // Replace unknown uploader with known one
            uniqueItems.set(existingKey, item);
          }
        }
      }
    });
    
    this.allContent = Array.from(uniqueItems.values());
    this.filterContent();
    this.loadRecentlyViewed();
    this.loadNewContent();
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  private mapContentType(contentType: string): 'material' | 'recording' | 'timeline' | 'assignment' | 'outline' | 'past_paper' {
    const type = contentType?.toLowerCase() || '';
    if (type.includes('video') || type.includes('recording')) return 'recording';
    if (type.includes('assignment')) return 'assignment';
    if (type.includes('outline')) return 'outline';
    if (type.includes('past') || type.includes('exam')) return 'past_paper';
    if (type.includes('slide') || type.includes('document') || type.includes('pdf')) return 'material';
    return 'timeline';
  }

  switchTab(tab: TabType): void {
    this.activeTab = tab;
    
    // Update URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge'
    });

    this.filterContent();
  }

  filterContent(): void {
    let filtered = [...this.allContent];

    // Filter by active tab
    if (this.activeTab !== 'all') {
      if (this.activeTab === 'materials') {
        filtered = filtered.filter(item => 
          item.type === 'material' || item.type === 'outline' || item.type === 'past_paper'
        );
      } else if (this.activeTab === 'recordings') {
        filtered = filtered.filter(item => item.type === 'recording');
      } else if (this.activeTab === 'timeline') {
        filtered = filtered.filter(item => item.type === 'timeline');
      } else if (this.activeTab === 'assignments') {
        filtered = filtered.filter(item => item.type === 'assignment');
      }
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      if (this.sortBy === 'date') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (this.sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (this.sortBy === 'views') {
        return (b.view_count || 0) - (a.view_count || 0);
      }
      return 0;
    });

    this.filteredContent = filtered;
  }

  onSearch(): void {
    this.filterContent();
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  changeSortBy(sortBy: 'date' | 'title' | 'views'): void {
    this.sortBy = sortBy;
    this.filterContent();
  }

  private loadRecentlyViewed(): void {
    // Load from localStorage or API
    const stored = localStorage.getItem('recentlyViewed');
    if (stored) {
      try {
        const ids = JSON.parse(stored);
        this.recentlyViewed = this.allContent.filter(item => ids.includes(item.id)).slice(0, 3);
      } catch (e) {
        this.recentlyViewed = [];
      }
    }
  }

  private loadNewContent(): void {
    // Content added in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    this.newContent = this.allContent.filter(item => {
      const itemDate = new Date(item.created_at);
      return itemDate > sevenDaysAgo;
    }).slice(0, 4);
  }

  viewContent(item: ContentItem): void {
    // Track in recently viewed
    this.trackRecentlyViewed(item.id);

    // Navigate or open based on content type
    if (item.file_url) {
      if (item.type === 'recording') {
        // Open video player
        window.open(item.file_url, '_blank');
      } else {
        // Open document viewer or download
        window.open(item.file_url, '_blank');
      }
    }
  }

  downloadContent(item: ContentItem): void {
    if (item.file_url) {
      window.open(item.file_url, '_blank');
    }
  }

  private trackRecentlyViewed(itemId: number): void {
    const stored = localStorage.getItem('recentlyViewed');
    let ids: number[] = [];
    
    if (stored) {
      try {
        ids = JSON.parse(stored);
      } catch (e) {
        ids = [];
      }
    }

    // Add to beginning, remove duplicates, keep max 10
    ids = [itemId, ...ids.filter(id => id !== itemId)].slice(0, 10);
    localStorage.setItem('recentlyViewed', JSON.stringify(ids));
    
    this.loadRecentlyViewed();
  }

  clearCourseSelection(): void {
    this.selectedCourse = null;
    this.selectedCourseId = null;
    this.allContent = [];
    this.filteredContent = [];
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {}
    });
  }

  getContentIcon(item: ContentItem): string {
    switch (item.type) {
      case 'material':
      case 'outline':
        return '📄';
      case 'recording':
        return '🎥';
      case 'timeline':
        return '📚';
      case 'assignment':
        return '📝';
      case 'past_paper':
        return '📋';
      default:
        return '📄';
    }
  }

  getContentTypeBadgeClass(item: ContentItem): string {
    switch (item.type) {
      case 'material':
      case 'outline':
        return 'bg-purple-100 text-purple-800';
      case 'recording':
        return 'bg-green-100 text-green-800';
      case 'timeline':
        return 'bg-indigo-100 text-indigo-800';
      case 'assignment':
        return 'bg-orange-100 text-orange-800';
      case 'past_paper':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getContentTypeDisplay(item: ContentItem): string {
    switch (item.type) {
      case 'material':
        return item.material_type || 'Material';
      case 'outline':
        return 'Course Outline';
      case 'recording':
        return 'Recording';
      case 'timeline':
        return 'Lesson Content';
      case 'assignment':
        return 'Assignment';
      case 'past_paper':
        return item.exam_type || 'Past Paper';
      default:
        return 'Content';
    }
  }
}


