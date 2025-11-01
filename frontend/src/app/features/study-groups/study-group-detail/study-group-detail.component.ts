import { Component, inject, signal, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GroupworkService, StudyGroup, StudyGroupMembership, GroupMeeting, GroupMaterial } from '../../../core/groupwork.service';
import { ChatService } from '../../../core/chat.service';
import { PageLayoutComponent } from '../../../shared/page-layout/page-layout.component';
import { ButtonComponent } from '../../../shared/button/button.component';
import { ChatAutocompleteComponent, AutocompleteItem } from '../../../shared/chat-autocomplete/chat-autocomplete.component';
import { ChatMessageRendererComponent } from '../../../shared/chat-message-renderer/chat-message-renderer.component';
import { getActiveReference, insertReference } from '../../../core/message-parser.util';
import { SafeUrlPipe } from '../../../shared/safe-url.pipe';

@Component({
  selector: 'app-study-group-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, PageLayoutComponent, ButtonComponent, ChatAutocompleteComponent, ChatMessageRendererComponent, SafeUrlPipe],
  template: `
    <app-page-layout [pageTitle]="group()?.name || 'Study Group'" [pageSubtitle]="group()?.description || ''">
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-white border-b border-gray-200">
        <div class="max-w-6xl mx-auto px-4 sm:px-6">
          <div class="py-6">
            <div class="flex items-center justify-between">
              <div>
                <app-button 
                  variant="ghost"
                  size="sm"
                  (clicked)="goBack()"
                  iconLeft='<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>'>
                  Back to Study Groups
                </app-button>
                <h1 class="text-3xl font-bold text-gray-900 mt-2">{{ group()?.name || 'Loading...' }}</h1>
                <p class="text-gray-600 mt-2">{{ group()?.description || '' }}</p>
              </div>
              <div class="flex items-center space-x-3">
                <span *ngIf="group()?.is_private" class="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                  Private
                </span>
                <span *ngIf="!group()?.is_private" class="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                  Public
                </span>

                <!-- Top App Bar Chat Toggle -->
                <div class="ml-4 inline-flex items-center">
                  <app-button 
                    variant="primary"
                    (clicked)="openChatPanel()">
                    <span class="w-2 h-2 rounded-full mr-2" [class]="chatConnected ? 'bg-green-300' : 'bg-red-300'"></span>
                    Chat
                  </app-button>
                </div>
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
                <app-button 
                  (clicked)="showCreateMeeting = !showCreateMeeting">
                  Schedule Meeting
                </app-button>
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
                  <app-button 
                    size="lg"
                    (clicked)="createMeeting()"
                    [disabled]="!newMeeting.title.trim() || creatingMeeting()"
                    [loading]="creatingMeeting()"
                    loadingText="Creating...">
                    Create Meeting
                  </app-button>
                  <app-button 
                    variant="secondary"
                    size="lg"
                    (clicked)="showCreateMeeting = false">
                    Cancel
                  </app-button>
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
                      <app-button 
                        *ngIf="meeting.platform === 'jitsi' && meeting.video_join_url"
                        variant="primary"
                        (clicked)="joinMeeting(meeting)">
                        Join Meeting
                      </app-button>
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
        <div class="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-start justify-between min-h-0">
          <div class="flex-1 min-w-0">
            <h3 class="text-xl font-semibold text-gray-900 break-words leading-tight max-h-16 overflow-hidden">
              {{ group()?.name || 'Group Chat' }}
            </h3>
            <div class="flex items-center gap-2 text-xs text-gray-600 mt-1">
              <span class="w-2 h-2 rounded-full" [class]="chatConnected ? 'bg-green-500' : 'bg-red-500'"></span>
              <span>{{ chatConnected ? 'Connected' : 'Connecting...' }}</span>
              <span class="ml-3">Online: {{ onlineCount() }}</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <!-- Tab Switcher -->
            <div class="hidden md:flex rounded-lg bg-gray-100 p-1 mr-3">
              <button 
                (click)="switchTab('chat')"
                [class]="currentTab === 'chat' ? 'px-3 py-1.5 text-sm rounded-md bg-white shadow font-medium text-gray-900' : 'px-3 py-1.5 text-sm rounded-md text-gray-600 hover:text-gray-900'">
                Chat
              </button>
              <button 
                (click)="switchTab('materials')"
                [class]="currentTab === 'materials' ? 'px-3 py-1.5 text-sm rounded-md bg-white shadow font-medium text-gray-900' : 'px-3 py-1.5 text-sm rounded-md text-gray-600 hover:text-gray-900'">
                Materials
              </button>
            </div>
            <app-button 
              variant="secondary"
              size="sm"
              (clicked)="closeChatPanel()">
              Close
            </app-button>
          </div>
        </div>

        <!-- Body -->
        <div class="flex-1 flex flex-col min-h-0">
          <!-- CHAT TAB -->
          <ng-container *ngIf="currentTab === 'chat'">
            <!-- Messages Container -->
            <div id="messagesContainer" class="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3 min-h-0">
            <div *ngFor="let m of chatLog; trackBy: trackByMessage" 
                 class="group relative">
              <!-- Message with hover actions -->
              <div class="flex items-start space-x-3 p-3 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01]">
                <!-- Profile Picture or Initials -->
                <div class="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden bg-blue-100 flex items-center justify-center">
                  <img *ngIf="m.profile_picture" 
                       [src]="m.profile_picture" 
                       [alt]="m.from"
                       class="w-full h-full object-cover">
                  <span *ngIf="!m.profile_picture" class="text-xs font-medium text-blue-700">{{ getInitials(m.from) }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-2 mb-1">
                    <span class="text-sm font-medium text-gray-900">{{ m.from }}</span>
                    <span class="text-xs text-gray-500">{{ formatMessageTime(m.timestamp) }}</span>
                  </div>
                  
                  <!-- Reply indicator if this is a reply -->
                  <div *ngIf="m.reply_to" class="mb-2 p-2 bg-gray-100 rounded-xl border-l-4 border-blue-400">
                    <div class="flex items-center space-x-2 mb-1">
                      <svg class="w-3 h-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
                      </svg>
                      <span class="text-xs font-medium text-blue-600">{{ m.reply_to.sender_name }}</span>
                    </div>
                    <p class="text-xs text-gray-600 line-clamp-2">{{ truncateText(m.reply_to.body, 60) }}</p>
                  </div>
                  
                  <!-- Render message with references -->
                  <div class="text-sm text-gray-800 break-words">
                    <app-chat-message-renderer 
                      [message]="m.body"
                      (mentionClicked)="onMentionClicked($event)"
                      (materialClicked)="onMaterialClicked($event)"
                      (topicClicked)="onTopicClicked($event)">
                    </app-chat-message-renderer>
                  </div>
                </div>
                
                <!-- Hover Action Buttons (Apple-style) -->
                <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-1">
                  <!-- Reply Button - Only show for messages with valid IDs -->
                  <button 
                    *ngIf="m.id && typeof m.id === 'number'"
                    (click)="replyToMessage(m)"
                    class="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-gray-50 hover:scale-110 active:scale-95 transition-all"
                    title="Reply to message">
                    <svg class="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
                    </svg>
                  </button>
                  
                  <!-- Delete Button - Only show for user's own messages or if user is admin -->
                  <button 
                    *ngIf="canDeleteMessage(m)"
                    (click)="deleteMessage(m)"
                    class="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-red-50 hover:scale-110 active:scale-95 transition-all"
                    title="Delete message">
                    <svg class="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div *ngIf="chatLog.length === 0" class="text-center py-12 text-gray-500">No messages yet. Start the conversation!</div>
          </div>

          <!-- Reply Preview (Apple-style) -->
          <div *ngIf="replyingTo && showReplyPreview" 
               class="flex-shrink-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-200 p-4 animate-in slide-in-from-bottom-2 duration-300">
            <div class="flex items-start space-x-3">
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-1">
                  <svg class="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
                  </svg>
                  <span class="text-sm font-medium text-blue-700">Replying to {{ replyingTo.from }}</span>
                </div>
                <div class="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-blue-200">
                  <p class="text-sm text-gray-700 line-clamp-2">{{ truncateText(replyingTo.body, 80) }}</p>
                </div>
              </div>
              <app-button 
                variant="ghost"
                size="sm"
                (clicked)="cancelReply()"
                iconLeft='<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>'>
              </app-button>
            </div>
          </div>

          <!-- Typing Indicator (sticky) -->
          <div *ngIf="typingIndicator()" class="px-4 py-2 text-xs text-gray-600 flex items-center gap-2 bg-gray-50 border-t border-gray-200">
            <span class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            <span>{{ typingIndicator() }}</span>
          </div>

          <!-- Message Input (sticky at bottom) -->
          <div class="flex-shrink-0 p-4 bg-white border-t border-gray-200 relative">
            <!-- Autocomplete -->
            <app-chat-autocomplete
              #autocomplete
              [groupId]="currentGroupId!"
              [show]="showAutocomplete"
              [type]="autocompleteType"
              [query]="autocompleteQuery"
              (itemSelected)="onAutocompleteSelect($event)"
              (cancel)="closeAutocomplete()">
            </app-chat-autocomplete>
            
            <div class="flex gap-2">
              <div class="flex-1 relative">
                <input 
                  #chatInput
                  [(ngModel)]="chatMessage"
                  (input)="onMessageInput()"
                  (keydown)="onMessageKeydown($event)"
                  (keydown.enter)="sendChat()"
                  [placeholder]="replyingTo ? 'Reply to ' + replyingTo.from + '...' : 'Type @ for mentions, [[ for materials, # for topics...'" 
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  [disabled]="!chatConnected" />
              </div>
              <app-button 
                variant="primary"
                size="lg"
                (clicked)="sendChat()"
                [disabled]="!chatMessage.trim() || !chatConnected || isSending"
                [loading]="isSending"
                loadingText="Sending"
                iconLeft='<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>'>
                Send
              </app-button>
            </div>
          </div>
          </ng-container>

          <!-- MATERIALS TAB -->
          <ng-container *ngIf="currentTab === 'materials'">
            <div class="flex-1 flex flex-col min-h-0 relative">
              <!-- Hidden File Input -->
              <input 
                #fileInput
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.mp4,.avi,.mov,.wmv"
                (change)="onFilesSelected($event)"
                class="hidden" />

              <!-- Materials List -->
              <div class="flex-1 overflow-y-auto p-6 bg-gray-50">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold text-gray-900">Group Materials</h3>
                  <span class="text-sm text-gray-600">{{ materials().length }} {{ materials().length === 1 ? 'file' : 'files' }}</span>
                </div>
                
                <!-- Empty State -->
                <div *ngIf="materials().length === 0" class="text-center py-16">
                  <div class="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <svg class="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">No materials yet</h3>
                  <p class="text-gray-600 mb-6">Upload files, documents, images, or videos to share with your group</p>
                  <button 
                    (click)="triggerFileInput()"
                    class="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl">
                    <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                    </svg>
                    Upload Files
                  </button>
                </div>

                <!-- Materials Grouped by Type -->
                <div *ngIf="materials().length > 0" class="space-y-8">
                  <!-- Images Section -->
                  <div *ngIf="getMaterialsByType('image').length > 0">
                    <div class="flex items-center justify-between mb-4">
                      <h4 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <svg class="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        Images ({{ getMaterialsByType('image').length }})
                      </h4>
                    </div>
                    <!-- Image Grid -->
                    <div class="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      <div *ngFor="let material of getMaterialsByType('image')"
                           class="group relative aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-gray-400 transition-all"
                           (click)="imagePreviewId = material.id">
                        <img [src]="material.file_url_full || material.file_url"
                             [alt]="material.title"
                             class="w-full h-full object-cover"
                             (error)="$event.target.style.display='none'">
                        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                        <div class="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <p class="text-xs text-white font-medium truncate">{{ material.title }}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- PDFs Section -->
                  <div *ngIf="getMaterialsByType('pdf').length > 0">
                    <div class="flex items-center justify-between mb-4">
                      <h4 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <svg class="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                        </svg>
                        PDF Documents ({{ getMaterialsByType('pdf').length }})
                      </h4>
                    </div>
                    <div class="space-y-4">
                      <div *ngFor="let material of getMaterialsByType('pdf')"
                           class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        <!-- PDF Header -->
                        <div class="p-4 border-b border-gray-200">
                          <div class="flex items-start justify-between">
                            <div class="flex-1 min-w-0">
                              <h5 class="text-base font-semibold text-gray-900 mb-1">{{ material.title }}</h5>
                              <p *ngIf="material.description" class="text-sm text-gray-600 mb-2 line-clamp-2">{{ material.description }}</p>
                              <div class="flex items-center text-xs text-gray-500">
                                <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                </svg>
                                <span>{{ material.uploaded_by_name }}</span>
                                <span class="mx-2">•</span>
                                <span>{{ material.created_at | date:'short' }}</span>
                              </div>
                            </div>
                            <div class="ml-4 flex gap-2">
                              <app-button 
                                variant="primary"
                                size="sm"
                                (clicked)="expandedPdfId = expandedPdfId === material.id ? null : material.id"
                                [iconLeft]="getPdfToggleIcon(material.id)">
                                {{ expandedPdfId === material.id ? 'Collapse' : 'View' }}
                              </app-button>
                              <a [href]="material.file_url_full || material.file_url"
                                 target="_blank"
                                 rel="noopener"
                                 class="inline-flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                                </svg>
                                Open
                              </a>
                              <app-button 
                                variant="ghost"
                                size="sm"
                                (clicked)="deleteMaterial(material.id)"
                                iconLeft='<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>'>
                                Delete
                              </app-button>
                            </div>
                          </div>
                        </div>
                        <!-- PDF Viewer (Inline) -->
                        <div *ngIf="expandedPdfId === material.id" class="border-t border-gray-200">
                          <div class="h-[70vh] bg-gray-50">
                            <iframe *ngIf="getMaterialFileUrl(material)"
                                    [src]="getMaterialFileUrl(material) | safeUrl"
                                    class="w-full h-full border-0"
                                    title="PDF Viewer - {{ material.title }}"></iframe>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Other Document Types Section -->
                  <div *ngIf="getMaterialsByType('doc').length > 0 || getMaterialsByType('ppt').length > 0">
                    <div class="flex items-center justify-between mb-4">
                      <h4 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <svg class="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        Documents ({{ getMaterialsByType('doc').length + getMaterialsByType('ppt').length }})
                      </h4>
                    </div>
                    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div *ngFor="let material of getMaterialsByType('doc').concat(getMaterialsByType('ppt'))"
                           class="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-200">
                        <div class="flex items-start space-x-3 mb-3">
                          <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <svg class="w-5 h-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" [innerHTML]="getMaterialIcon(material.material_type)"></svg>
                          </div>
                          <div class="flex-1 min-w-0">
                            <h5 class="text-sm font-semibold text-gray-900 truncate">{{ material.title }}</h5>
                            <p class="text-xs text-gray-600">{{ getMaterialTypeLabel(material.material_type) }}</p>
                          </div>
                        </div>
                        <p *ngIf="material.description" class="text-sm text-gray-600 mb-3 line-clamp-2">{{ material.description }}</p>
                        <div class="flex items-center text-xs text-gray-500 mb-3">
                          <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                          </svg>
                          <span>{{ material.uploaded_by_name }}</span>
                          <span class="mx-2">•</span>
                          <span>{{ material.created_at | date:'short' }}</span>
                        </div>
                        <div class="flex gap-2">
                          <a [href]="material.file_url_full || material.file_url"
                             target="_blank"
                             rel="noopener"
                             class="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                            </svg>
                            Download
                          </a>
                          <app-button 
                            variant="ghost"
                            size="sm"
                            (clicked)="deleteMaterial(material.id)"
                            iconLeft='<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>'>
                            Delete
                          </app-button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Videos Section -->
                  <div *ngIf="getMaterialsByType('video').length > 0">
                    <div class="flex items-center justify-between mb-4">
                      <h4 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <svg class="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                        </svg>
                        Videos ({{ getMaterialsByType('video').length }})
                      </h4>
                    </div>
                    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div *ngFor="let material of getMaterialsByType('video')"
                           class="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-200">
                        <div class="flex items-start space-x-3 mb-3">
                          <div class="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                            <svg class="w-5 h-5 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" [innerHTML]="getMaterialIcon(material.material_type)"></svg>
                          </div>
                          <div class="flex-1 min-w-0">
                            <h5 class="text-sm font-semibold text-gray-900 truncate">{{ material.title }}</h5>
                            <p class="text-xs text-gray-600">Video</p>
                          </div>
                        </div>
                        <p *ngIf="material.description" class="text-sm text-gray-600 mb-3 line-clamp-2">{{ material.description }}</p>
                        <div class="flex items-center text-xs text-gray-500 mb-3">
                          <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                          </svg>
                          <span>{{ material.uploaded_by_name }}</span>
                          <span class="mx-2">•</span>
                          <span>{{ material.created_at | date:'short' }}</span>
                        </div>
                        <div class="flex gap-2">
                          <a [href]="material.file_url_full || material.file_url"
                             target="_blank"
                             rel="noopener"
                             class="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            Play
                          </a>
                          <app-button 
                            variant="ghost"
                            size="sm"
                            (clicked)="deleteMaterial(material.id)"
                            iconLeft='<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>'>
                            Delete
                          </app-button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Other Materials Section -->
                  <div *ngIf="getMaterialsByType('other').length > 0 || getMaterialsByType('notes').length > 0 || getMaterialsByType('assignment').length > 0">
                    <div class="flex items-center justify-between mb-4">
                      <h4 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <svg class="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        Other Files ({{ getMaterialsByType('other').length + getMaterialsByType('notes').length + getMaterialsByType('assignment').length }})
                      </h4>
                    </div>
                    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div *ngFor="let material of getMaterialsByType('other').concat(getMaterialsByType('notes')).concat(getMaterialsByType('assignment'))"
                           class="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-200">
                        <div class="flex items-start space-x-3 mb-3">
                          <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <svg class="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" [innerHTML]="getMaterialIcon(material.material_type)"></svg>
                          </div>
                          <div class="flex-1 min-w-0">
                            <h5 class="text-sm font-semibold text-gray-900 truncate">{{ material.title }}</h5>
                            <p class="text-xs text-gray-600">{{ getMaterialTypeLabel(material.material_type) }}</p>
                          </div>
                        </div>
                        <p *ngIf="material.description" class="text-sm text-gray-600 mb-3 line-clamp-2">{{ material.description }}</p>
                        <div class="flex items-center text-xs text-gray-500 mb-3">
                          <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                          </svg>
                          <span>{{ material.uploaded_by_name }}</span>
                          <span class="mx-2">•</span>
                          <span>{{ material.created_at | date:'short' }}</span>
                        </div>
                        <div class="flex gap-2">
                          <a [href]="material.file_url_full || material.file_url"
                             target="_blank"
                             rel="noopener"
                             class="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                            </svg>
                            Download
                          </a>
                          <app-button 
                            variant="ghost"
                            size="sm"
                            (clicked)="deleteMaterial(material.id)"
                            iconLeft='<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>'>
                            Delete
                          </app-button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Image Preview Modal -->
                <div *ngIf="imagePreviewId !== null && getMaterialById(imagePreviewId!)" 
                     class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                     (click)="imagePreviewId = null">
                  <div class="relative max-w-7xl max-h-full" (click)="$event.stopPropagation()">
                    <img *ngIf="getMaterialFileUrl(getMaterialById(imagePreviewId!)!)"
                         [src]="getMaterialFileUrl(getMaterialById(imagePreviewId!)!)"
                         [alt]="getMaterialById(imagePreviewId!)?.title"
                         class="max-w-full max-h-[90vh] object-contain rounded-lg">
                    <button 
                      (click)="imagePreviewId = null"
                      class="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                      <svg class="w-6 h-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                    <div class="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-4">
                      <h5 class="text-white font-semibold mb-1">{{ getMaterialById(imagePreviewId!)?.title }}</h5>
                      <p *ngIf="getMaterialById(imagePreviewId!)?.description" class="text-white/80 text-sm">{{ getMaterialById(imagePreviewId!)?.description }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Floating Action Button (FAB) for Upload -->
              <button 
                *ngIf="materials().length > 0"
                (click)="triggerFileInput()"
                class="absolute bottom-8 right-8 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center z-10"
                title="Upload files">
                <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                </svg>
              </button>

              <!-- Upload Dialog Modal -->
              <div *ngIf="showUploadDialog" 
                   class="absolute inset-0 bg-black/50 flex items-center justify-center z-20 p-4"
                   (click)="cancelUpload()">
                <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
                     (click)="$event.stopPropagation()">
                  <!-- Modal Header -->
                  <div class="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 class="text-xl font-bold text-gray-900">Upload Files</h3>
                    <button 
                      (click)="cancelUpload()"
                      class="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <svg class="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>

                  <!-- Modal Body -->
                  <div class="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
                    <!-- Selected Files Preview -->
                    <div class="mb-6">
                      <h4 class="text-sm font-medium text-gray-700 mb-3">Selected Files ({{ selectedFiles.length }})</h4>
                      <div class="space-y-2">
                        <div *ngFor="let file of selectedFiles; let i = index" 
                             class="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div class="flex items-center space-x-3 flex-1 min-w-0">
                            <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <svg class="w-5 h-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                              </svg>
                            </div>
                            <div class="flex-1 min-w-0">
                              <p class="text-sm font-medium text-gray-900 truncate">{{ file.name }}</p>
                              <p class="text-xs text-gray-600">{{ formatFileSize(file.size) }}</p>
                            </div>
                          </div>
                          <button 
                            (click)="removeSelectedFile(i)"
                            class="p-2 hover:bg-red-50 rounded-full transition-colors">
                            <svg class="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- Upload Options (Optional) -->
                    <div class="space-y-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Title (Optional)</label>
                        <input 
                          [(ngModel)]="newMaterial.title"
                          type="text"
                          placeholder="Add a title for these files"
                          class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        <p class="mt-1 text-xs text-gray-500">Leave empty to use file name</p>
                      </div>

                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                        <textarea 
                          [(ngModel)]="newMaterial.description"
                          placeholder="Add a description"
                          rows="2"
                          class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"></textarea>
                      </div>
                    </div>
                  </div>

                  <!-- Modal Footer -->
                  <div class="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                    <app-button 
                      variant="secondary"
                      (clicked)="cancelUpload()"
                      [disabled]="uploadingMaterial">
                      Cancel
                    </app-button>
                    <app-button 
                      variant="primary"
                      (clicked)="uploadSelectedFiles()"
                      [disabled]="selectedFiles.length === 0 || uploadingMaterial"
                      [loading]="uploadingMaterial"
                      [loadingText]="uploadingText">
                      Upload {{ selectedFiles.length }} {{ selectedFiles.length === 1 ? 'File' : 'Files' }}
                    </app-button>
                  </div>
                </div>
              </div>
            </div>
          </ng-container>
        </div>
      </div>
    </div>
  </div>
  `
})
export class StudyGroupDetailComponent implements OnInit, OnDestroy {
  @ViewChild('chatInput') chatInputElement!: ElementRef<HTMLInputElement>;
  @ViewChild('autocomplete') autocompleteComponent!: ChatAutocompleteComponent;
  
  private api = inject(GroupworkService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private chat = inject(ChatService);
  private cdr = inject(ChangeDetectorRef);

  group = signal<StudyGroup | null>(null);
  members = signal<StudyGroupMembership[]>([]);
  meetings = signal<GroupMeeting[]>([]);
  materials = signal<GroupMaterial[]>([]);
  loading = signal(true);
  creatingMeeting = signal(false);
  showCreateMeeting = false;
  showChat = true; // Start with chat visible by default
  chatPanelOpen = false;
  currentTab: 'chat' | 'materials' = 'chat'; // Current tab in chat panel
  chatMessage = '';
  chatLog: { from: string; body: string; timestamp?: Date; id?: number; profile_picture?: string | null; reply_to?: { id: number; sender_name: string; sender_profile_picture?: string | null; body: string; created_at: string } }[] = [];
  chatConnected = false;
  isSending = false;
  onlineUserIds = new Set<number>();
  typingUsers = new Map<number, string>();
  private typingNotifyTimeout: any = null;
  private typingClearTimeout: any = null;
  private subscriptions: Subscription[] = [];
  currentGroupId: number | null = null;
  
  // Reply functionality
  replyingTo: { id: number; from: string; body: string; timestamp?: Date; profile_picture?: string | null } | null = null;
  showReplyPreview = false;

  // Autocomplete state
  showAutocomplete = false;
  autocompleteType: 'user' | 'material' | 'topic' | null = null;
  autocompleteQuery = '';
  private autocompleteStart = 0;
  private autocompleteEnd = 0;

  newMeeting = {
    title: '',
    description: '',
    platform: 'jitsi' as 'jitsi' | 'physical',
    location: ''
  };

  // Materials upload state
  uploadingMaterial = false;
  uploadingText = 'Uploading...';
  selectedFiles: File[] = [];
  showUploadDialog = false;
  newMaterial = {
    title: '',
    description: '',
    material_type: 'pdf' as 'notes' | 'assignment' | 'video' | 'other' | 'pdf' | 'doc' | 'ppt' | 'image',
  };
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  // PDF viewer state
  expandedPdfId: number | null = null;
  imagePreviewId: number | null = null;

  ngOnInit() {
    // Subscribe to route parameter changes to handle navigation between groups
    const routeSub = this.route.paramMap.subscribe(params => {
      const groupId = params.get('id');
      if (groupId) {
        const gid = parseInt(groupId);
        
        // If navigating to a different group, disconnect from the old one first
        if (this.currentGroupId !== null && this.currentGroupId !== gid) {
          console.log(`🔄 Switching from group ${this.currentGroupId} to ${gid}`);
          this.chat.disconnect();
          this.resetChatState();
        }
        
        this.currentGroupId = gid;
        this.loadGroupDetails(gid);
        this.setupChatConnection(gid);
      }
    });
    this.subscriptions.push(routeSub);
  }

  private resetChatState() {
    this.chatLog = [];
    this.chatConnected = false;
    this.onlineUserIds.clear();
    this.typingUsers.clear();
    this.replyingTo = null;
    this.showReplyPreview = false;
    this.cdr.detectChanges();
  }

  private setupChatConnection(gid: number) {
    // Connect to WebSocket chat
    this.chat.connect(gid);
    
    // Subscribe to connection status
    const connectedSub = this.chat.connected$.subscribe(connected => {
      this.chatConnected = connected;
      this.cdr.detectChanges();
      console.log(`💡 Chat connection status: ${connected ? 'Connected' : 'Disconnected'} for group ${gid}`);
    });
    this.subscriptions.push(connectedSub);

    // Subscribe to incoming messages
    const messagesSub = this.chat.messages$.subscribe((msg: any) => {
      console.log('📨 Received WebSocket message:', msg);
      console.log('🖼️ Message profile picture:', { 
        has_picture: !!msg.sender_profile_picture, 
        url: msg.sender_profile_picture,
        sender: msg.sender_name
      });
      
      // Check if this is a duplicate message by body and sender (more aggressive detection)
      const isDuplicate = this.chatLog.some((existingMsg: any) => {
          const sameBody = existingMsg.body === msg.body;
          const sameSender = existingMsg.from === msg.sender_name;
          const withinTimeWindow = Math.abs((existingMsg.timestamp?.getTime() || 0) - new Date(msg.created_at || Date.now()).getTime()) < 30000; // Within 30 seconds
          
          return sameBody && sameSender && withinTimeWindow;
        });
        
        if (isDuplicate) {
          console.log('🚫 Skipping duplicate message:', {
            body: msg.body,
            sender: msg.sender_name,
            msg_reply_to: msg.reply_to,
            existing_messages: this.chatLog.length,
            chatLog: this.chatLog.map((m: any) => ({ body: m.body, from: m.from, reply_to: m.reply_to }))
          });
          return;
        }
        
        // Coalesce duplicates by client_id; otherwise append
        if (msg.client_id != null) {
          const idx = this.chatLog.findIndex((m: any) => (m as any).client_id === msg.client_id);
          if (idx >= 0) {
            // When updating an existing message, preserve reply_to from the original optimistic message
            const existingReplyTo = (this.chatLog as any)[idx].reply_to;
            const updated = { 
              ...this.chatLog[idx], 
              ...msg, 
              from: msg.sender_name,
              profile_picture: msg.sender_profile_picture,
              timestamp: new Date(msg.created_at || Date.now()), 
              status: 'sent',
              // Always preserve the existing reply_to from optimistic message
              reply_to: existingReplyTo || msg.reply_to
            } as any;
            (this.chatLog as any)[idx] = updated;
            console.log('🔄 Updated existing message by client_id:', {
              client_id: msg.client_id,
              updated: updated,
              had_reply_to: !!existingReplyTo,
              server_reply_to: !!msg.reply_to
            });
          } else {
            // Check if this might be a server confirmation of an optimistic message without client_id
            const optimisticIdx = this.chatLog.findIndex((m: any) => 
              m.body === msg.body && 
              m.from === msg.sender_name && 
              !m.id && // Optimistic messages don't have database IDs
              m.status === 'pending'
            );
            
            if (optimisticIdx >= 0) {
              // Update the optimistic message with server data
              const existingReplyTo = (this.chatLog as any)[optimisticIdx].reply_to;
              const updated = { 
                ...this.chatLog[optimisticIdx], 
                ...msg, 
                from: msg.sender_name,
                profile_picture: msg.sender_profile_picture,
                timestamp: new Date(msg.created_at || Date.now()), 
                status: 'sent',
                // Always preserve the existing reply_to from optimistic message
                reply_to: existingReplyTo || msg.reply_to
              } as any;
              (this.chatLog as any)[optimisticIdx] = updated;
              console.log('🔄 Updated optimistic message with server confirmation:', {
                original_reply_to: existingReplyTo,
                server_reply_to: msg.reply_to,
                final_reply_to: updated.reply_to
              });
            } else {
              const newMsg = { 
                from: msg.sender_name,
                profile_picture: msg.sender_profile_picture,
                body: msg.body, 
                timestamp: new Date(msg.created_at || Date.now()), 
                client_id: msg.client_id, 
                status: msg.status || 'sent',
                id: msg.id,
                reply_to: msg.reply_to
              } as any;
              this.chatLog.push(newMsg);
              console.log('➕ Added new message:', newMsg);
            }
          }
        } else {
          const newMsg = { 
            from: msg.sender_name,
            profile_picture: msg.sender_profile_picture,
            body: msg.body, 
            timestamp: new Date(msg.created_at || Date.now()),
            id: msg.id,
            reply_to: msg.reply_to
          };
          this.chatLog.push(newMsg);
          console.log('➕ Added new message (no client_id):', newMsg);
        }
        Promise.resolve().then(() => this.scrollToBottom());
        this.isSending = false;
        this.cdr.detectChanges();
      });
    this.subscriptions.push(messagesSub);

    // Presence events (join/leave/snapshot)
    const presenceSub = this.chat.presence$.subscribe((evt: any) => {
      if (evt.type === 'snapshot') {
        this.onlineUserIds = new Set(evt.users.map((u: any) => u.id));
        this.cdr.detectChanges();
        return;
      }
      if (evt.type === 'presence') {
        if (evt.action === 'join') this.onlineUserIds.add(evt.user.id);
        if (evt.action === 'leave') this.onlineUserIds.delete(evt.user.id);
        this.cdr.detectChanges();
      }
    });
    this.subscriptions.push(presenceSub);

    // Typing events
    const typingSub = this.chat.typing$.subscribe((evt: any) => {
      console.log('📝 Typing event received in study group:', {
        user: evt.user,
        isTyping: evt.is_typing,
        typingUsers: Array.from(this.typingUsers.entries())
      });
      
      if (evt.is_typing) {
        this.typingUsers.set(evt.user.id, evt.user.name);
        console.log('➕ Added typing user:', evt.user.name, 'Total typing:', this.typingUsers.size);
        // Clear typing after 4s if no further events
        if (this.typingClearTimeout) clearTimeout(this.typingClearTimeout);
        this.typingClearTimeout = setTimeout(() => {
          this.typingUsers.delete(evt.user.id);
          console.log('⏰ Cleared typing for:', evt.user.name, 'Remaining:', this.typingUsers.size);
          this.cdr.detectChanges();
        }, 4000);
      } else {
        this.typingUsers.delete(evt.user.id);
        console.log('➖ Removed typing user:', evt.user.name, 'Remaining:', this.typingUsers.size);
      }
      this.cdr.detectChanges();
    });
    this.subscriptions.push(typingSub);

    // Load persisted messages
    this.api.listMessages(gid, 50).subscribe({
      next: (msgs) => {
        console.log('📥 Loaded messages from API:', msgs);
        this.chatLog = msgs.map(m => ({ 
          from: m.sender_name,
          profile_picture: m.sender_profile_picture,
          body: m.body, 
          timestamp: new Date(m.created_at || Date.now()),
          id: m.id,
          reply_to: m.reply_to
        }));
        console.log('📝 Processed chat log:', this.chatLog);
        console.log('🖼️ Profile pictures in messages:', this.chatLog.map(m => ({ 
          sender: m.from, 
          has_picture: !!m.profile_picture,
          picture_url: m.profile_picture 
        })));
        this.cdr.detectChanges();
      },
      error: (err) => console.warn('Failed to load messages', err)
    });
  }

  ngOnDestroy() {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
    
    // Clear timeouts
    if (this.typingNotifyTimeout) clearTimeout(this.typingNotifyTimeout);
    if (this.typingClearTimeout) clearTimeout(this.typingClearTimeout);
    
    // Disconnect chat
    this.chat.disconnect();
    
    console.log('🧹 Component destroyed, cleaned up subscriptions and WebSocket connection');
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
    
    const replyData = this.replyingTo ? {
      id: this.replyingTo.id,
      sender_name: this.replyingTo.from,
      body: this.replyingTo.body,
      created_at: this.replyingTo.timestamp?.toISOString() || new Date().toISOString()
    } : undefined;
    
    console.log('📤 Sending message with reply data:', {
      message: this.chatMessage.trim(),
      replyData,
      replyingTo: this.replyingTo
    });
    
    this.chat.sendMessage(this.chatMessage.trim(), replyData);
    this.chatMessage = '';
    
    // Clear reply state
    this.cancelReply();
    
    // Stop typing when message sent
    this.chat.sendTyping(false);
    this.cdr.detectChanges();
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
    console.log('⌨️ Message input detected, sending typing notification');
    if (this.typingNotifyTimeout) clearTimeout(this.typingNotifyTimeout);
    this.chat.sendTyping(true);
    this.typingNotifyTimeout = setTimeout(() => {
      console.log('⏰ Stopping typing notification after 1.5s');
      this.chat.sendTyping(false);
    }, 1500);

    // Check for autocomplete triggers
    this.checkAutocomplete();
  }

  onMessageKeydown(event: KeyboardEvent) {
    if (this.showAutocomplete) {
      // Handle autocomplete navigation
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.autocompleteComponent?.moveSelection('up');
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.autocompleteComponent?.moveSelection('down');
      } else if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        this.autocompleteComponent?.selectCurrent();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        this.closeAutocomplete();
      }
    }
  }

  private checkAutocomplete() {
    if (!this.chatInputElement) {
      console.log('⚠️ No chatInputElement');
      return;
    }

    const input = this.chatInputElement.nativeElement;
    const cursorPosition = input.selectionStart || 0;
    
    console.log('🔍 Checking autocomplete:', {
      message: this.chatMessage,
      cursorPosition,
      groupId: this.currentGroupId
    });
    
    const activeRef = getActiveReference(this.chatMessage, cursorPosition);
    
    console.log('📋 Active reference:', activeRef);

    if (activeRef) {
      console.log('✅ Showing autocomplete:', activeRef);
      this.showAutocomplete = true;
      this.autocompleteType = activeRef.type;
      this.autocompleteQuery = activeRef.query;
      this.autocompleteStart = activeRef.start;
      this.autocompleteEnd = activeRef.end;
      this.cdr.detectChanges();
    } else {
      this.closeAutocomplete();
    }
  }

  onAutocompleteSelect(item: AutocompleteItem) {
    if (item.type === 'user' && item.id && item.name) {
      this.chatMessage = insertReference(
        this.chatMessage,
        this.autocompleteStart,
        this.autocompleteEnd,
        { type: 'user', userId: item.id, userName: item.name }
      );
    } else if (item.type === 'material' && item.id && item.title) {
      this.chatMessage = insertReference(
        this.chatMessage,
        this.autocompleteStart,
        this.autocompleteEnd,
        { type: 'material', materialId: item.id, materialTitle: item.title }
      );
    } else if (item.type === 'topic' && item.topic) {
      this.chatMessage = insertReference(
        this.chatMessage,
        this.autocompleteStart,
        this.autocompleteEnd,
        { type: 'topic', topic: item.topic }
      );
    }

    this.closeAutocomplete();
    
    // Focus back on input
    setTimeout(() => {
      this.chatInputElement?.nativeElement.focus();
    }, 0);
  }

  closeAutocomplete() {
    this.showAutocomplete = false;
    this.autocompleteType = null;
    this.autocompleteQuery = '';
    this.cdr.detectChanges();
  }

  onMentionClicked(event: { userId: number; userName: string }) {
    console.log('Mention clicked:', event);
    // You can implement navigation to user profile or other actions here
    // For now, we'll just log it
  }

  onMaterialClicked(event: { materialId: number; materialTitle: string }) {
    console.log('Material clicked:', event);
    // Navigate to the material or open it in a modal
    // You can implement this based on your material viewing setup
    alert(`Opening material: ${event.materialTitle}`);
  }

  onTopicClicked(event: { topic: string }) {
    console.log('Topic clicked:', event);
    // Filter messages by topic
    alert(`Filtering by topic: #${event.topic}`);
    // You can implement a filter feature here to show only messages with this topic
  }

  scrollToBottom() {
    // Scroll the messages container to bottom
    setTimeout(() => {
      const messagesContainer = document.getElementById('messagesContainer');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 100);
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

  // Reply functionality
  replyToMessage(message: any) {
    // Only allow replies to messages that have real database IDs
    if (!message.id || typeof message.id !== 'number') {
      console.warn('Cannot reply to message without valid ID:', message);
      return;
    }
    
    this.replyingTo = {
      id: message.id,
      from: message.from,
      body: message.body,
      timestamp: message.timestamp,
      profile_picture: message.profile_picture
    };
    this.showReplyPreview = true;
    this.cdr.detectChanges();
    
    console.log('💬 Started replying to message:', this.replyingTo);
    
    // Focus on input after animation
    setTimeout(() => {
      const input = document.querySelector('input[placeholder="Type a message..."]') as HTMLInputElement;
      if (input) {
        input.focus();
      }
    }, 100);
  }

  cancelReply() {
    this.replyingTo = null;
    this.showReplyPreview = false;
    this.cdr.detectChanges();
  }

  truncateText(text: string, maxLength: number = 50): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  // Message deletion functionality
  canDeleteMessage(message: any): boolean {
    if (!message.id || typeof message.id !== 'number') return false;
    
    // User can delete their own messages
    if (message.from === 'You') return true;
    
    // Check if current user is admin (you can implement this based on your user role system)
    // For now, we'll allow deletion of own messages only
    return false;
  }

  deleteMessage(message: any) {
    if (!message.id || !this.group()) return;
    
    if (confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      this.api.deleteMessage(this.group()!.id, message.id).subscribe({
        next: () => {
          // Remove message from chat log
          const index = this.chatLog.findIndex(m => m.id === message.id);
          if (index > -1) {
            this.chatLog.splice(index, 1);
            this.cdr.detectChanges();
          }
          console.log('Message deleted successfully');
        },
        error: (error) => {
          console.error('Failed to delete message:', error);
          alert('Failed to delete message. Please try again.');
        }
      });
    }
  }

  // ==================== MATERIALS TAB METHODS ====================
  
  switchTab(tab: 'chat' | 'materials') {
    this.currentTab = tab;
    if (tab === 'materials') {
      this.loadMaterials();
    }
    this.cdr.detectChanges();
  }

  loadMaterials() {
    if (!this.group()) return;
    
    this.api.listMaterials(this.group()!.id).subscribe({
      next: (materials) => {
        this.materials.set(materials);
        console.log('📚 Loaded materials:', materials);
      },
      error: (err) => console.error('Failed to load materials:', err)
    });
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFiles = Array.from(input.files);
      this.showUploadDialog = true;
      console.log('📎 Files selected:', this.selectedFiles.map(f => f.name));
      this.cdr.detectChanges();
    }
  }

  removeSelectedFile(index: number) {
    this.selectedFiles.splice(index, 1);
    if (this.selectedFiles.length === 0) {
      this.cancelUpload();
    }
    this.cdr.detectChanges();
  }

  triggerFileInput() {
    this.fileInput?.nativeElement.click();
  }

  cancelUpload() {
    this.selectedFiles = [];
    this.showUploadDialog = false;
    this.resetMaterialForm();
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
    this.cdr.detectChanges();
  }

  uploadSelectedFiles() {
    if (this.selectedFiles.length === 0 || this.uploadingMaterial) return;
    
    this.uploadingMaterial = true;
    this.uploadingText = `Uploading ${this.selectedFiles.length} ${this.selectedFiles.length === 1 ? 'file' : 'files'}...`;
    
    // Upload files sequentially
    const uploadPromises = this.selectedFiles.map((file, index) => {
      return new Promise<void>((resolve, reject) => {
        const formData = new FormData();
        
        // Use custom title if provided and only one file, otherwise use filename
        const title = this.selectedFiles.length === 1 && this.newMaterial.title.trim()
          ? this.newMaterial.title
          : file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        
        formData.append('title', title);
        
        if (this.newMaterial.description) {
          formData.append('description', this.newMaterial.description);
        }
        
        // Auto-detect material type from file extension
        const ext = file.name.split('.').pop()?.toLowerCase();
        let materialType: 'notes' | 'assignment' | 'video' | 'other' | 'pdf' | 'doc' | 'ppt' | 'image' = 'other';
        
        if (ext === 'pdf') materialType = 'pdf';
        else if (['doc', 'docx'].includes(ext || '')) materialType = 'doc';
        else if (['ppt', 'pptx'].includes(ext || '')) materialType = 'ppt';
        else if (['mp4', 'avi', 'mov', 'wmv', 'webm'].includes(ext || '')) materialType = 'video';
        else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) materialType = 'image';
        
        formData.append('material_type', materialType);
        formData.append('file', file);
        
        this.api.uploadMaterial(this.group()!.id, formData).subscribe({
          next: (material) => {
            console.log(`✅ Material ${index + 1}/${this.selectedFiles.length} uploaded:`, material);
            this.materials.set([material, ...this.materials()]);
            resolve();
          },
          error: (err) => {
            console.error(`Failed to upload ${file.name}:`, err);
            reject(err);
          }
        });
      });
    });
    
    // Wait for all uploads to complete
    Promise.all(uploadPromises)
      .then(() => {
        console.log('✅ All materials uploaded successfully');
        this.uploadingMaterial = false;
        this.cancelUpload();
        this.cdr.detectChanges();
      })
      .catch((err) => {
        console.error('Some uploads failed:', err);
        alert('Some files failed to upload. Please try again.');
        this.uploadingMaterial = false;
        this.cdr.detectChanges();
      });
  }

  resetMaterialForm() {
    this.newMaterial = {
      title: '',
      description: '',
      material_type: 'pdf',
    };
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  deleteMaterial(materialId: number | string) {
    if (!confirm('Are you sure you want to delete this material?')) return;
    
    // Convert string ID to number if needed (material IDs in DB are always numbers)
    const numericId = typeof materialId === 'string' ? parseInt(materialId) : materialId;
    
    this.api.deleteMaterial(this.group()!.id, numericId).subscribe({
      next: () => {
        console.log('🗑️ Material deleted');
        this.materials.set(this.materials().filter(m => m.id !== materialId));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to delete material:', err);
        alert('Failed to delete material. You may not have permission.');
      }
    });
  }

  getMaterialIcon(materialType: string): string {
    switch (materialType) {
      case 'pdf':
        return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>';
      case 'doc':
        return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>';
      case 'ppt':
        return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>';
      case 'video':
        return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>';
      case 'image':
        return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>';
      default:
        return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>';
    }
  }

  getMaterialTypeLabel(materialType: string): string {
    switch (materialType) {
      case 'pdf': return 'PDF Document';
      case 'doc': return 'Word Document';
      case 'ppt': return 'Presentation';
      case 'video': return 'Video';
      case 'image': return 'Image';
      case 'notes': return 'Notes';
      case 'assignment': return 'Assignment';
      default: return 'Other';
    }
  }

  downloadMaterial(material: GroupMaterial) {
    const url = material.file_url_full || material.file_url;
    if (url) {
      window.open(url, '_blank');
    } else {
      alert('No file available for download');
    }
  }

  getMaterialsByType(type: string): GroupMaterial[] {
    return this.materials().filter(m => m.material_type === type);
  }

  getMaterialById(id: number): GroupMaterial | undefined {
    return this.materials().find(m => m.id === id);
  }

  getPdfToggleIcon(materialId: number): string {
    if (this.expandedPdfId === materialId) {
      return '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg>';
    }
    return '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>';
  }

  getMaterialFileUrl(material: GroupMaterial): string {
    return material.file_url_full || material.file_url || '';
  }
}

