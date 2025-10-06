import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupworkService, StudyGroup, StudyGroupMembership, GroupMeeting } from '../../../core/groupwork.service';
import { ChatService } from '../../../core/chat.service';
import { PageLayoutComponent } from '../../../shared/page-layout/page-layout.component';

@Component({
  selector: 'app-study-group-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, PageLayoutComponent],
  template: `
    <app-page-layout [pageTitle]="group()?.name || 'Study Group'" [pageSubtitle]="group()?.description || ''">
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-white border-b border-gray-200">
        <div class="max-w-6xl mx-auto px-4 sm:px-6">
          <div class="py-6">
            <div class="flex items-center justify-between">
              <div>
                <button 
                  (click)="goBack()" 
                  class="flex items-center text-gray-600 hover:text-gray-900 mb-2">
                  <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                  </svg>
                  Back to Study Groups
                </button>
                <h1 class="text-3xl font-bold text-gray-900">{{ group()?.name || 'Loading...' }}</h1>
                <p class="text-gray-600 mt-2">{{ group()?.description || '' }}</p>
              </div>
              <div class="flex items-center space-x-3">
                <span *ngIf="group()?.is_private" class="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                  Private
                </span>
                <span *ngIf="!group()?.is_private" class="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                  Open
                </span>

                <!-- Top App Bar Chat Toggle -->
                <button 
                  (click)="openChatPanel()"
                  class="ml-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">
                  <span class="w-2 h-2 rounded-full" [class]="chatConnected ? 'bg-green-300' : 'bg-red-300'"></span>
                  Open Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <!-- Loading State -->
        <div *ngIf="loading()" class="text-center py-12">
          <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg class="animate-spin h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p class="text-gray-600">Loading group details...</p>
        </div>

        <!-- Group Not Found -->
        <div *ngIf="!loading() && !group()" class="text-center py-12">
          <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Group not found</h3>
          <p class="text-gray-600">The study group you're looking for doesn't exist or you don't have access to it.</p>
        </div>

        <!-- Group Content -->
        <div *ngIf="!loading() && group()" class="grid lg:grid-cols-3 gap-8">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-8">
            <!-- Group Info -->
            <div class="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4">Group Information</h2>
              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Course Focus</label>
                  <p class="text-gray-900">{{ group()?.course_name || 'No specific course' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Members</label>
                  <p class="text-gray-900">{{ group()?.members_count }} / {{ group()?.max_members }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Created</label>
                  <p class="text-gray-900">{{ formatDate(group()?.created_at) }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <p class="text-gray-900">{{ group()?.is_private ? 'Private Group' : 'Open Group' }}</p>
                </div>
              </div>
            </div>

            <!-- Meetings Section -->
            <div class="bg-white rounded-2xl border border-gray-200 p-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-bold text-gray-900">Meetings</h2>
                <button 
                  (click)="showCreateMeeting = !showCreateMeeting"
                  class="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-colors">
                  Schedule Meeting
                </button>
              </div>

              <!-- Create Meeting Form -->
              <div *ngIf="showCreateMeeting" class="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Create New Meeting</h3>
                <div class="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Meeting Title</label>
                    <input 
                      [(ngModel)]="newMeeting.title"
                      placeholder="Enter meeting title"
                      class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all" 
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                    <select 
                      [(ngModel)]="newMeeting.platform"
                      class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all">
                      <option value="jitsi">Jitsi Meet</option>
                      <option value="physical">Physical Meeting</option>
                    </select>
                  </div>
                </div>
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea 
                    [(ngModel)]="newMeeting.description"
                    placeholder="Meeting description (optional)"
                    rows="3"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"></textarea>
                </div>
                <div *ngIf="newMeeting.platform === 'physical'" class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input 
                    [(ngModel)]="newMeeting.location"
                    placeholder="Enter meeting location"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all" 
                  />
                </div>
                <div class="flex gap-3">
                  <button 
                    (click)="createMeeting()"
                    [disabled]="!newMeeting.title.trim() || creatingMeeting()"
                    class="px-6 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors">
                    <span *ngIf="!creatingMeeting()">Create Meeting</span>
                    <span *ngIf="creatingMeeting()" class="flex items-center">
                      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </span>
                  </button>
                  <button 
                    (click)="showCreateMeeting = false"
                    class="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-colors">
                    Cancel
                  </button>
                </div>
              </div>

              <!-- Meetings List -->
              <div class="space-y-4">
                <div *ngIf="meetings().length === 0" class="text-center py-8">
                  <div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <p class="text-gray-600">No meetings scheduled yet</p>
                </div>

                <div *ngFor="let meeting of meetings()" class="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ meeting.title }}</h3>
                      <p *ngIf="meeting.description" class="text-gray-600 mb-3">{{ meeting.description }}</p>
                      <div class="flex items-center space-x-4 text-sm text-gray-500">
                        <div class="flex items-center">
                          <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                          </svg>
                          {{ formatDate(meeting.scheduled_time) }}
                        </div>
                        <div class="flex items-center">
                          <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                          </svg>
                          {{ meeting.platform === 'jitsi' ? 'Jitsi Meet' : 'Physical Meeting' }}
                        </div>
                        <div *ngIf="meeting.location" class="flex items-center">
                          <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
                          {{ meeting.location }}
                        </div>
                      </div>
                    </div>
                    <div class="ml-4">
                      <button 
                        *ngIf="meeting.platform === 'jitsi' && meeting.video_join_url"
                        (click)="joinMeeting(meeting)"
                        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">
                        Join Meeting
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Resources Section (Placeholder) -->
            <div class="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4">Shared Resources</h2>
              <div class="text-center py-8">
                <div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                  </svg>
                </div>
                <p class="text-gray-600">Resource sharing coming soon</p>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-8">
            <!-- Members -->
            <div class="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4">Members ({{ members().length }})</h2>
              <div class="space-y-3">
                <div *ngFor="let member of members()" class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium text-gray-700">{{ getInitials(member.user_name) }}</span>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900">{{ member.user_name }}</p>
                    <p class="text-xs text-gray-500">{{ member.role === 'admin' ? 'Admin' : 'Member' }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Chat Section (sidebar) hidden in favor of top-level panel -->
            <div class="hidden"></div>
          </div>
        </div>
      </div>
    </div>
    </app-page-layout>

  <!-- Large Chat Panel -->
  <div *ngIf="chatPanelOpen" class="fixed inset-0 z-50">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/40" (click)="closeChatPanel()"></div>
    <!-- Panel -->
    <div class="absolute inset-0 md:inset-y-6 md:inset-x-6">
      <div class="h-full bg-white rounded-none md:rounded-2xl shadow-xl border border-gray-200 flex flex-col">
        <!-- Header -->
        <div class="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <h3 class="text-xl font-semibold text-gray-900">Group Chat</h3>
            <div class="flex items-center gap-2 text-xs text-gray-600">
              <span class="w-2 h-2 rounded-full" [class]="chatConnected ? 'bg-green-500' : 'bg-red-500'"></span>
              <span>{{ chatConnected ? 'Connected' : 'Connecting...' }}</span>
              <span class="ml-3">Online: {{ onlineCount() }}</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <!-- Future tabs stub -->
            <div class="hidden md:flex rounded-lg bg-gray-100 p-1 mr-3">
              <button class="px-3 py-1.5 text-sm rounded-md bg-white shadow">Chat</button>
              <button class="px-3 py-1.5 text-sm rounded-md text-gray-400" disabled>Materials (soon)</button>
            </div>
            <button (click)="closeChatPanel()" class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Close</button>
          </div>
        </div>

        <!-- Body -->
        <div class="flex-1 grid grid-rows-[1fr_auto_auto]">
          <!-- Messages -->
          <div class="overflow-auto p-4 bg-gray-50 space-y-3">
            <div *ngFor="let m of chatLog; trackBy: trackByMessage" class="flex items-start space-x-3 p-3 bg-white rounded-lg shadow-sm">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-xs font-medium text-blue-700">{{ getInitials(m.from) }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-2 mb-1">
                  <span class="text-sm font-medium text-gray-900">{{ m.from }}</span>
                  <span class="text-xs text-gray-500">{{ formatMessageTime(m.timestamp) }}</span>
                </div>
                <p class="text-sm text-gray-800 break-words">{{ m.body }}</p>
              </div>
            </div>
            <div *ngIf="chatLog.length === 0" class="text-center py-12 text-gray-500">No messages yet. Start the conversation!</div>
          </div>

          <!-- Typing -->
          <div *ngIf="typingIndicator()" class="px-4 py-2 text-xs text-gray-600 flex items-center gap-2">
            <span class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            <span>{{ typingIndicator() }}</span>
          </div>

          <!-- Composer -->
          <div class="p-4 border-t border-gray-200 flex gap-2">
            <input 
              [(ngModel)]="chatMessage"
              (input)="onMessageInput()"
              (keydown.enter)="sendChat()"
              placeholder="Type a message..." 
              class="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              [disabled]="!chatConnected" />
            <button 
              (click)="sendChat()"
              [disabled]="!chatMessage.trim() || !chatConnected || isSending"
              class="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center gap-2">
              <svg *ngIf="!isSending" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
              <svg *ngIf="isSending" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <span>{{ isSending ? 'Sending' : 'Send' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
})
export class StudyGroupDetailComponent implements OnInit, OnDestroy {
  private api = inject(GroupworkService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private chat = inject(ChatService);

  group = signal<StudyGroup | null>(null);
  members = signal<StudyGroupMembership[]>([]);
  meetings = signal<GroupMeeting[]>([]);
  loading = signal(true);
  creatingMeeting = signal(false);
  showCreateMeeting = false;
  showChat = true; // Start with chat visible by default
  chatPanelOpen = false;
  chatMessage = '';
  chatLog: { from: string; body: string; timestamp?: Date }[] = [];
  chatConnected = false;
  isSending = false;
  onlineUserIds = new Set<number>();
  typingUsers = new Map<number, string>();
  private typingNotifyTimeout: any = null;
  private typingClearTimeout: any = null;

  newMeeting = {
    title: '',
    description: '',
    platform: 'jitsi' as 'jitsi' | 'physical',
    location: ''
  };

  ngOnInit() {
    const groupId = this.route.snapshot.paramMap.get('id');
    if (groupId) {
      const gid = parseInt(groupId);
      this.loadGroupDetails(gid);
      
      // Connect to WebSocket chat
      this.chat.connect(gid);
      
      // Subscribe to connection status
      this.chat.connected$.subscribe(connected => {
        this.chatConnected = connected;
      });
 
      // Subscribe to incoming messages
      this.chat.messages$.subscribe((msg) => {
        this.chatLog.push({ 
          from: msg.sender_name, 
          body: msg.body, 
          timestamp: new Date() 
        });
        // Auto-scroll to bottom when new message arrives
        setTimeout(() => this.scrollToBottom(), 100);
        this.isSending = false;
      });

      // Presence events (join/leave/snapshot)
      this.chat.presence$.subscribe((evt: any) => {
        if (evt.type === 'snapshot') {
          this.onlineUserIds = new Set(evt.users.map((u: any) => u.id));
          return;
        }
        if (evt.type === 'presence') {
          if (evt.action === 'join') this.onlineUserIds.add(evt.user.id);
          if (evt.action === 'leave') this.onlineUserIds.delete(evt.user.id);
        }
      });

      // Typing events
      this.chat.typing$.subscribe((evt: any) => {
        if (evt.is_typing) {
          this.typingUsers.set(evt.user.id, evt.user.name);
          // Clear typing after 4s if no further events
          if (this.typingClearTimeout) clearTimeout(this.typingClearTimeout);
          this.typingClearTimeout = setTimeout(() => {
            this.typingUsers.delete(evt.user.id);
          }, 4000);
        } else {
          this.typingUsers.delete(evt.user.id);
        }
      });

      // Load persisted messages
      this.api.listMessages(gid, 50).subscribe({
        next: (msgs) => {
          this.chatLog = msgs.map(m => ({ 
            from: m.sender_name, 
            body: m.body, 
            timestamp: new Date(m.created_at || Date.now())
          }));
        },
        error: (err) => console.warn('Failed to load messages', err)
      });
    }
  }

  ngOnDestroy() {
    this.chat.disconnect();
  }

  loadGroupDetails(groupId: number) {
    this.loading.set(true);
    
    // Load group details, members, and meetings
    Promise.all([
      this.api.listGroups().toPromise(),
      this.api.members(groupId).toPromise(),
      this.api.meetings(groupId).toPromise()
    ]).then(([groups, members, meetings]) => {
      const group = groups?.find(g => g.id === groupId);
      this.group.set(group || null);
      this.members.set(members || []);
      this.meetings.set(meetings || []);
      this.loading.set(false);
    }).catch(error => {
      console.error('Error loading group details:', error);
      this.loading.set(false);
    });
  }

  sendChat() {
    if (!this.chatMessage.trim()) return;
    this.isSending = true;
    this.chat.sendMessage(this.chatMessage.trim());
    this.chatMessage = '';
    // Stop typing when message sent
    this.chat.sendTyping(false);
  }

  goBack() {
    this.router.navigate(['/study-groups']);
  }

  createMeeting() {
    if (!this.newMeeting.title.trim() || this.creatingMeeting()) return;
    
    this.creatingMeeting.set(true);
    const payload = {
      title: this.newMeeting.title,
      description: this.newMeeting.description || undefined,
      platform: this.newMeeting.platform,
      location: this.newMeeting.platform === 'physical' ? this.newMeeting.location : undefined
    };

    this.api.createMeeting(this.group()!.id, payload).subscribe({
      next: (meeting) => {
        this.meetings.set([...this.meetings(), meeting]);
        this.creatingMeeting.set(false);
        this.showCreateMeeting = false;
        this.resetMeetingForm();
      },
      error: (error) => {
        console.error('Error creating meeting:', error);
        this.creatingMeeting.set(false);
      }
    });
  }

  joinMeeting(meeting: GroupMeeting) {
    if (meeting.video_join_url) {
      window.open(meeting.video_join_url, '_blank');
    }
  }

  resetMeetingForm() {
    this.newMeeting = {
      title: '',
      description: '',
      platform: 'jitsi',
      location: ''
    };
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  toggleChat() {
    this.showChat = !this.showChat;
  }

  openChatPanel() {
    this.chatPanelOpen = true;
  }

  closeChatPanel() {
    this.chatPanelOpen = false;
  }

  onMessageInput() {
    // Debounced typing notifications
    if (this.typingNotifyTimeout) clearTimeout(this.typingNotifyTimeout);
    this.chat.sendTyping(true);
    this.typingNotifyTimeout = setTimeout(() => this.chat.sendTyping(false), 1500);
  }

  scrollToBottom() {
    // This will be handled by the template reference
    const chatContainer = document.querySelector('#chatContainer');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  trackByMessage(index: number, message: any): string {
    return `${message.from}-${message.body}-${message.timestamp}`;
  }

  onlineCount(): number {
    return this.onlineUserIds.size;
  }

  isOnline(userId: number): boolean {
    return this.onlineUserIds.has(userId);
  }

  typingIndicator(): string | null {
    if (this.typingUsers.size === 0) return null;
    const names = Array.from(this.typingUsers.values());
    if (names.length === 1) return `${names[0]} is typing...`;
    if (names.length === 2) return `${names[0]} and ${names[1]} are typing...`;
    return `${names[0]}, ${names[1]} and others are typing...`;
  }

  formatMessageTime(timestamp?: Date): string {
    if (!timestamp) return '';
    
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return timestamp.toLocaleDateString();
  }
}

