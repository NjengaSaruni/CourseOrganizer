import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';

export interface AutocompleteItem {
  type: 'user' | 'material' | 'topic';
  id?: number | string;
  name?: string;
  title?: string;
  topic?: string;
  registration_number?: string;
  material_type?: string;
  profile_picture?: string | null;
  source?: 'group' | 'course';  // For materials: indicates if it's group-specific or class-wide
  uploaded_by?: string;  // For group materials: who uploaded it
}

@Component({
  selector: 'app-chat-autocomplete',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="show && items.length > 0" 
         class="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-64 overflow-y-auto z-50">
      <!-- Header -->
      <div class="px-4 py-2 border-b border-gray-200 bg-gray-100 sticky top-0">
        <p class="text-xs font-semibold text-gray-800">
          <ng-container [ngSwitch]="type">
            <span *ngSwitchCase="'user'">Mention a user</span>
            <span *ngSwitchCase="'material'">Reference a material</span>
            <span *ngSwitchCase="'topic'">Add a topic</span>
          </ng-container>
        </p>
      </div>
      
      <!-- Items List -->
      <div class="py-1">
        <div *ngFor="let item of items; let i = index"
             (click)="selectItem(item)"
             [class.bg-blue-50]="i === selectedIndex"
             class="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors flex items-center space-x-3">
          
          <!-- User Item -->
          <ng-container *ngIf="item.type === 'user'">
            <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img *ngIf="item.profile_picture" 
                   [src]="item.profile_picture" 
                   [alt]="item.name"
                   class="w-full h-full object-cover">
              <span *ngIf="!item.profile_picture" class="text-xs font-semibold text-blue-700">
                {{ getInitials(item.name!) }}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-900 truncate">{{ item.name }}</p>
              <p class="text-xs font-medium text-gray-600">{{ item.registration_number }}</p>
            </div>
            <div class="flex-shrink-0">
              <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-800">
                @
              </span>
            </div>
          </ng-container>
          
          <!-- Material Item -->
          <ng-container *ngIf="item.type === 'material'">
            <div class="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-orange-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-900 truncate">{{ item.title }}</p>
              <div class="flex items-center space-x-2">
                <p class="text-xs font-medium text-gray-600">{{ getMaterialTypeLabel(item.material_type!) }}</p>
                <span *ngIf="item.source === 'group'" class="text-xs font-medium text-blue-600">• Group</span>
                <span *ngIf="item.source === 'course'" class="text-xs font-medium text-purple-600">• Class</span>
              </div>
            </div>
            <div class="flex-shrink-0">
              <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-orange-100 text-orange-800">
                [[]]
              </span>
            </div>
          </ng-container>
          
          <!-- Topic Item -->
          <ng-container *ngIf="item.type === 'topic'">
            <div class="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/>
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-900">#{{ item.topic }}</p>
            </div>
            <div class="flex-shrink-0">
              <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-green-100 text-green-800">
                #
              </span>
            </div>
          </ng-container>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="px-4 py-2 border-t border-gray-200 bg-gray-100 text-xs text-gray-700">
        <div class="flex items-center justify-between">
          <span class="font-medium">↑↓ Navigate • ↵ Select • Esc Cancel</span>
          <span class="font-semibold">{{ items.length }} result{{ items.length !== 1 ? 's' : '' }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: relative;
    }
  `]
})
export class ChatAutocompleteComponent implements OnInit, OnDestroy, OnChanges {
  @Input() groupId!: number;
  @Input() show = false;
  @Input() type: 'user' | 'material' | 'topic' | null = null;
  @Input() query = '';
  
  @Output() itemSelected = new EventEmitter<AutocompleteItem>();
  @Output() cancel = new EventEmitter<void>();
  
  items: AutocompleteItem[] = [];
  selectedIndex = 0;
  
  private querySubject = new Subject<{ type: string; query: string }>();
  private subscription?: Subscription;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    console.log('🔧 ChatAutocomplete ngOnInit, groupId:', this.groupId);
    // Set up debounced search
    this.subscription = this.querySubject.pipe(
      debounceTime(300),
      distinctUntilChanged((a, b) => a.type === b.type && a.query === b.query),
      switchMap(({ type, query }) => {
        console.log('🔍 Fetching autocomplete:', { type, query, groupId: this.groupId });
        return this.fetchItems(type, query);
      })
    ).subscribe(items => {
      console.log('✅ Autocomplete results:', items);
      this.items = items;
      this.selectedIndex = 0;
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('🔄 ChatAutocomplete ngOnChanges:', {
      show: this.show,
      type: this.type,
      query: this.query,
      groupId: this.groupId,
      changes
    });
    
    if (this.show && this.type && this.groupId) {
      console.log('📤 Triggering autocomplete query');
      this.querySubject.next({ type: this.type, query: this.query });
    } else {
      console.log('❌ Clearing autocomplete');
      this.items = [];
      this.selectedIndex = 0;
    }
  }

  private fetchItems(type: string, query: string) {
    const url = `${environment.apiUrl}/study-groups/${this.groupId}/chat/autocomplete/`;
    console.log('🌐 Fetching from:', url, { type, q: query });
    return this.http.get<any[]>(url, {
      params: { type, q: query }
    }).pipe(
      map(items => {
        // Add type property to each item based on the query type
        const typedItems = items.map(item => ({
          ...item,
          type: type as 'user' | 'material' | 'topic'
        }));
        console.log('🔄 Transformed items:', typedItems);
        return typedItems;
      })
    );
  }

  selectItem(item: AutocompleteItem): void {
    this.itemSelected.emit(item);
    this.items = [];
    this.selectedIndex = 0;
  }

  moveSelection(direction: 'up' | 'down'): void {
    if (direction === 'up') {
      this.selectedIndex = Math.max(0, this.selectedIndex - 1);
    } else {
      this.selectedIndex = Math.min(this.items.length - 1, this.selectedIndex + 1);
    }
  }

  selectCurrent(): void {
    if (this.items.length > 0 && this.selectedIndex >= 0 && this.selectedIndex < this.items.length) {
      this.selectItem(this.items[this.selectedIndex]);
    }
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getMaterialTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'pdf': 'PDF Document',
      'doc': 'Word Document',
      'ppt': 'PowerPoint',
      'video': 'Video',
      'audio': 'Audio',
      'image': 'Image',
      'link': 'Link',
      'other': 'Other'
    };
    return labels[type] || type;
  }
}

