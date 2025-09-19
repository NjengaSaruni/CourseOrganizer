import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PageLayoutComponent } from '../../shared/page-layout/page-layout.component';
import { SafeUrlPipe } from '../../shared/safe-url.pipe';

interface MaterialInfo {
  title: string;
  courseName: string;
  courseCode: string;
  materialType: string;
  uploadedBy: string;
  uploadDate: string;
  description?: string;
}

@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  imports: [CommonModule, RouterModule, PageLayoutComponent, SafeUrlPipe],
  template: `
    <app-page-layout 
      [pageTitle]="materialInfo?.title || 'Document Viewer'" 
      [pageSubtitle]="getPageSubtitle()"
      [isSidebarOpen]="false"
      (sidebarToggle)="{}">
      
      <!-- Material Information Header -->
      <div *ngIf="materialInfo" class="bg-white border border-gray-200 rounded-2xl mb-6 overflow-hidden">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ materialInfo.title }}</h1>
              <div class="flex items-center space-x-4 text-gray-600 mb-3">
                <span class="font-medium">{{ materialInfo.courseCode }}</span>
                <span>•</span>
                <span>{{ materialInfo.courseName }}</span>
                <span>•</span>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ materialInfo.materialType }}
                </span>
              </div>
              <p *ngIf="materialInfo.description" class="text-gray-700 mb-4">{{ materialInfo.description }}</p>
              <div class="flex items-center text-sm text-gray-500">
                <span>Uploaded by {{ materialInfo.uploadedBy }}</span>
                <span class="mx-2">•</span>
                <span>{{ formatDate(materialInfo.uploadDate) }}</span>
              </div>
            </div>
            <div class="ml-6 flex space-x-2">
              <a [href]="decodedUrl" target="_blank" rel="noopener" 
                 class="flex items-center px-4 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
                Open in new tab
              </a>
              <a [href]="decodedUrl" download 
                 class="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Download
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- PDF Viewer -->
      <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div class="h-[80vh]">
          <iframe *ngIf="decodedUrl" [src]="decodedUrl | safeUrl" class="w-full h-full border-0" title="PDF Viewer"></iframe>
          <div *ngIf="!decodedUrl" class="h-full flex items-center justify-center text-gray-600">
            <div class="text-center">
              <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <p class="text-lg font-medium text-gray-900 mb-2">Missing or invalid PDF URL</p>
              <p class="text-gray-500">Please check the link and try again.</p>
            </div>
          </div>
        </div>
      </div>
    </app-page-layout>
  `,
  styles: []
})
export class PdfViewerComponent implements OnInit {
  decodedUrl: string = '';
  materialInfo: MaterialInfo | null = null;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    const url = this.route.snapshot.queryParamMap.get('url');
    if (!url) return;
    
    try {
      this.decodedUrl = decodeURIComponent(url);
    } catch {
      this.decodedUrl = url;
    }

    // Parse material information from query parameters
    this.parseMaterialInfo();
  }

  private parseMaterialInfo(): void {
    const params = this.route.snapshot.queryParams;
    
    if (params['title'] || params['courseName']) {
      this.materialInfo = {
        title: decodeURIComponent(params['title'] || 'Untitled Document'),
        courseName: decodeURIComponent(params['courseName'] || 'Unknown Course'),
        courseCode: decodeURIComponent(params['courseCode'] || ''),
        materialType: decodeURIComponent(params['materialType'] || 'Document'),
        uploadedBy: decodeURIComponent(params['uploadedBy'] || 'Unknown'),
        uploadDate: params['uploadDate'] || new Date().toISOString(),
        description: params['description'] ? decodeURIComponent(params['description']) : undefined
      };
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getPageSubtitle(): string {
    if (this.materialInfo) {
      return `${this.materialInfo.courseCode} - ${this.materialInfo.courseName}`;
    }
    return 'View PDF documents in-app';
  }
}


