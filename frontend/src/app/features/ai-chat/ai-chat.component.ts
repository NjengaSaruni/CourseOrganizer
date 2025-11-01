import { Component, OnInit, signal, computed, ViewChild, ElementRef, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AiChatService, ChatConversation, ChatMessage } from '../../core/ai-chat.service';
import { AuthService } from '../../core/auth.service';
import { CourseService } from '../../core/course.service';
import { PageLayoutComponent } from '../../shared/page-layout/page-layout.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { MarkdownPipe } from '../../shared/markdown.pipe';

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, PageLayoutComponent, ButtonComponent, MarkdownPipe],
  template: `
    <app-page-layout 
      [pageTitle]="conversation()?.title || 'AI Assistant'"
      [pageSubtitle]="conversation()?.course ? 'Ask questions about your course' : 'Chat with your AI learning assistant'">
      
      <div class="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <!-- Course Selector (if no course specified) -->
        <div *ngIf="!selectedCourseId && !courseId" class="mb-6 bg-white rounded-2xl border border-gray-200 p-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">Select Course (Optional)</label>
          <select 
            [(ngModel)]="selectedCourseId"
            (change)="onCourseChange()"
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent">
            <option value="">General Questions</option>
            <option *ngFor="let course of (courses || [])" [value]="course.id">
              {{ course.code }} - {{ course.name }}
            </option>
          </select>
        </div>

        <!-- Conversation List Sidebar -->
        <div class="grid lg:grid-cols-4 gap-6">
          <!-- Conversations List -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-2xl border border-gray-200 p-4">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900">Conversations</h3>
                <app-button 
                  variant="primary"
                  size="sm"
                  (clicked)="createNewConversation()"
                  iconLeft='<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>'>
                  New
                </app-button>
              </div>
              
              <div class="space-y-2 max-h-[600px] overflow-y-auto">
                <div 
                  *ngFor="let conv of conversationsList()"
                  (click)="loadConversation(conv.id)"
                  class="p-3 rounded-xl cursor-pointer transition-colors"
                  [class.bg-gray-100]="conversation()?.id === conv.id"
                  [class.hover:bg-gray-50]="conversation()?.id !== conv.id">
                  <h4 class="text-sm font-medium text-gray-900 truncate">{{ conv.title || 'Untitled' }}</h4>
                  <p class="text-xs text-gray-500 mt-1">{{ conv.message_count || 0 }} messages</p>
                  <p class="text-xs text-gray-400 mt-1">{{ formatDate(conv.updated_at) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Chat Area -->
          <div class="lg:col-span-3">
            <div class="bg-white rounded-2xl border border-gray-200 flex flex-col" style="height: 70vh;">
              <!-- Chat Header -->
              <div class="px-6 py-4 border-b border-gray-200">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900">
                      {{ conversation()?.title || 'New Conversation' }}
                    </h3>
                    <p *ngIf="conversation()?.course" class="text-sm text-gray-600">
                      Course: {{ getCourseName(conversation()!.course!) }}
                    </p>
                  </div>
                  <app-button 
                    variant="ghost"
                    size="sm"
                    (clicked)="deleteConversation()"
                    *ngIf="conversation()"
                    iconLeft='<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>'>
                    Delete
                  </app-button>
                </div>
              </div>

              <!-- Messages Container -->
              <div 
                #messagesContainer
                class="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                
                <!-- Empty State -->
                <div *ngIf="messagesList().length === 0" class="text-center py-12">
                  <div class="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <svg class="w-10 h-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                  </div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">Start a conversation</h3>
                  <p class="text-gray-600 mb-6">Ask questions about your courses, materials, or concepts</p>
                  <div class="space-y-2">
                    <button 
                      *ngFor="let suggestion of (suggestions || [])"
                      (click)="sendSuggestion(suggestion)"
                      class="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm text-gray-700">
                      {{ suggestion }}
                    </button>
                  </div>
                </div>

                <!-- Messages -->
                <div *ngFor="let msg of messagesList()" 
                     class="flex items-start space-x-3"
                     [class.flex-row-reverse]="msg.role === 'user'"
                     [class.space-x-reverse]="msg.role === 'user'">
                  
                  <!-- Avatar -->
                  <div class="flex-shrink-0">
                    <div *ngIf="msg.role === 'user'" 
                         class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span class="text-xs font-medium text-indigo-700">You</span>
                    </div>
                    <div *ngIf="msg.role === 'assistant'"
                         class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <svg class="w-5 h-5 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                      </svg>
                    </div>
                  </div>

                  <!-- Message Content -->
                  <div 
                    class="max-w-[80%] rounded-2xl p-4"
                    [class.bg-indigo-600]="msg.role === 'user'"
                    [class.text-white]="msg.role === 'user'"
                    [class.bg-white]="msg.role === 'assistant'"
                    [class.text-gray-900]="msg.role === 'assistant'"
                    [class.border]="msg.role === 'assistant'"
                    [class.border-gray-200]="msg.role === 'assistant'">
                    
                    <!-- Message Text -->
                    <div *ngIf="msg.role === 'user'" class="whitespace-pre-wrap break-words">{{ msg.content }}</div>
                    <div *ngIf="msg.role === 'assistant'" 
                         class="markdown-content break-words"
                         [innerHTML]="msg.content | markdown"></div>
                    
                    <!-- Tool Calls Indicator -->
                    <div *ngIf="msg.metadata?.tool_calls?.length > 0" 
                         class="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
                      <p>Used {{ msg.metadata.tool_calls.length }} tool(s)</p>
                    </div>
                    
                    <!-- Timestamp -->
                    <div class="text-xs mt-2 opacity-70">
                      {{ formatTime(msg.created_at) }}
                    </div>
                  </div>
                </div>

                <!-- Typing Indicator -->
                <div *ngIf="isTyping()" class="flex items-start space-x-3">
                  <div class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <svg class="w-5 h-5 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                    </svg>
                  </div>
                  <div class="bg-white border border-gray-200 rounded-2xl p-4">
                    <div class="flex space-x-1">
                      <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0s"></div>
                      <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                      <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Message Input -->
              <div class="px-6 py-4 border-t border-gray-200 bg-white">
                <form (ngSubmit)="sendMessage()" class="flex gap-2">
                  <input 
                    #messageInput
                    [(ngModel)]="currentMessage"
                    name="message"
                    placeholder="Ask a question about your course..."
                    [disabled]="isTyping()"
                    class="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
                    (keydown.enter)="sendMessage()">
                  <app-button 
                    type="submit"
                    variant="primary"
                    size="lg"
                    [disabled]="!currentMessage.trim() || isTyping()"
                    [loading]="isTyping()"
                    loadingText="Sending"
                    iconLeft='<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>'>
                    Send
                  </app-button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-page-layout>
  `,
  styles: [`
    :host ::ng-deep .markdown-content {
      color: inherit;
    }

    /* Headings */
    :host ::ng-deep .markdown-content h1,
    :host ::ng-deep .markdown-content h2,
    :host ::ng-deep .markdown-content h3,
    :host ::ng-deep .markdown-content h4 {
      font-weight: 600;
      line-height: 1.4;
      margin-top: 1.25em;
      margin-bottom: 0.75em;
    }

    :host ::ng-deep .markdown-content h1 {
      font-size: 1.5em;
      font-weight: 700;
      margin-top: 0;
    }

    :host ::ng-deep .markdown-content h2 {
      font-size: 1.25em;
      font-weight: 600;
    }

    :host ::ng-deep .markdown-content h3 {
      font-size: 1.125em;
      font-weight: 600;
    }

    :host ::ng-deep .markdown-content h4 {
      font-size: 1em;
      font-weight: 600;
    }

    /* Paragraphs */
    :host ::ng-deep .markdown-content p {
      margin-top: 0.75em;
      margin-bottom: 0.75em;
      line-height: 1.6;
    }

    :host ::ng-deep .markdown-content p:first-child {
      margin-top: 0;
    }

    :host ::ng-deep .markdown-content p:last-child {
      margin-bottom: 0;
    }

    /* Lists */
    :host ::ng-deep .markdown-content ul,
    :host ::ng-deep .markdown-content ol {
      margin-top: 0.75em;
      margin-bottom: 0.75em;
      padding-left: 1.5em;
    }

    :host ::ng-deep .markdown-content li {
      margin-top: 0.5em;
      margin-bottom: 0.5em;
      line-height: 1.6;
    }

    :host ::ng-deep .markdown-content ul {
      list-style-type: disc;
    }

    :host ::ng-deep .markdown-content ol {
      list-style-type: decimal;
    }

    :host ::ng-deep .markdown-content ul ul,
    :host ::ng-deep .markdown-content ol ol,
    :host ::ng-deep .markdown-content ul ol,
    :host ::ng-deep .markdown-content ol ul {
      margin-top: 0.5em;
      margin-bottom: 0.5em;
    }

    /* Code blocks */
    :host ::ng-deep .markdown-content pre {
      background-color: rgba(0, 0, 0, 0.05);
      border-radius: 0.5rem;
      padding: 1em;
      margin-top: 1em;
      margin-bottom: 1em;
      overflow-x: auto;
      font-size: 0.875em;
      line-height: 1.5;
    }

    :host ::ng-deep .markdown-content pre code {
      background-color: transparent;
      padding: 0;
      border-radius: 0;
      font-size: inherit;
    }

    /* Inline code */
    :host ::ng-deep .markdown-content code {
      background-color: rgba(0, 0, 0, 0.08);
      padding: 0.2em 0.4em;
      border-radius: 0.25rem;
      font-size: 0.875em;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
    }

    :host ::ng-deep .markdown-content p code,
    :host ::ng-deep .markdown-content li code {
      font-size: 0.9em;
    }

    /* Blockquotes */
    :host ::ng-deep .markdown-content blockquote {
      border-left: 3px solid rgba(0, 0, 0, 0.15);
      padding-left: 1em;
      margin-left: 0;
      margin-right: 0;
      margin-top: 1em;
      margin-bottom: 1em;
      font-style: italic;
      opacity: 0.9;
    }

    /* Links */
    :host ::ng-deep .markdown-content a {
      color: inherit;
      text-decoration: underline;
      text-underline-offset: 2px;
      opacity: 0.9;
      transition: opacity 0.2s ease;
    }

    :host ::ng-deep .markdown-content a:hover {
      opacity: 1;
    }

    /* Horizontal rules */
    :host ::ng-deep .markdown-content hr {
      border: none;
      border-top: 1px solid rgba(0, 0, 0, 0.1);
      margin: 1.5em 0;
    }

    /* Tables */
    :host ::ng-deep .markdown-content table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1em;
      margin-bottom: 1em;
      font-size: 0.875em;
    }

    :host ::ng-deep .markdown-content thead {
      border-bottom: 2px solid rgba(0, 0, 0, 0.1);
    }

    :host ::ng-deep .markdown-content th {
      text-align: left;
      font-weight: 600;
      padding: 0.5em;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }

    :host ::ng-deep .markdown-content td {
      padding: 0.5em;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }

    :host ::ng-deep .markdown-content tbody tr:last-child td {
      border-bottom: none;
    }

    /* Strong and emphasis */
    :host ::ng-deep .markdown-content strong {
      font-weight: 600;
    }

    :host ::ng-deep .markdown-content em {
      font-style: italic;
    }

    /* User message styles (indigo background) */
    :host ::ng-deep [class*="bg-indigo-600"] .markdown-content {
      color: white;
    }

    :host ::ng-deep [class*="bg-indigo-600"] .markdown-content code {
      background-color: rgba(255, 255, 255, 0.2);
      color: white;
    }

    :host ::ng-deep [class*="bg-indigo-600"] .markdown-content pre {
      background-color: rgba(255, 255, 255, 0.15);
      color: white;
    }

    :host ::ng-deep [class*="bg-indigo-600"] .markdown-content blockquote {
      border-left-color: rgba(255, 255, 255, 0.3);
    }

    :host ::ng-deep [class*="bg-indigo-600"] .markdown-content hr {
      border-top-color: rgba(255, 255, 255, 0.2);
    }

    :host ::ng-deep [class*="bg-indigo-600"] .markdown-content thead {
      border-bottom-color: rgba(255, 255, 255, 0.2);
    }

    :host ::ng-deep [class*="bg-indigo-600"] .markdown-content th,
    :host ::ng-deep [class*="bg-indigo-600"] .markdown-content td {
      border-bottom-color: rgba(255, 255, 255, 0.15);
    }

    /* Assistant message styles (white background) */
    :host ::ng-deep [class*="bg-white"] .markdown-content {
      color: #111827;
    }

    :host ::ng-deep [class*="bg-white"] .markdown-content code {
      background-color: rgba(0, 0, 0, 0.08);
      color: #111827;
    }

    :host ::ng-deep [class*="bg-white"] .markdown-content pre {
      background-color: #f3f4f6;
      color: #111827;
    }

    :host ::ng-deep [class*="bg-white"] .markdown-content blockquote {
      border-left-color: rgba(0, 0, 0, 0.15);
    }

    :host ::ng-deep [class*="bg-white"] .markdown-content hr {
      border-top-color: rgba(0, 0, 0, 0.1);
    }

    :host ::ng-deep [class*="bg-white"] .markdown-content thead {
      border-bottom-color: rgba(0, 0, 0, 0.1);
    }

    :host ::ng-deep [class*="bg-white"] .markdown-content th,
    :host ::ng-deep [class*="bg-white"] .markdown-content td {
      border-bottom-color: rgba(0, 0, 0, 0.05);
    }
  `]
})
export class AiChatComponent implements OnInit {
  private aiChatService = inject(AiChatService);
  private authService = inject(AuthService);
  private courseService = inject(CourseService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  conversations = signal<ChatConversation[]>([]);
  conversation = signal<ChatConversation | null>(null);
  messages = signal<ChatMessage[]>([]);
  
  // Computed signals to ensure arrays are always returned
  conversationsList = computed(() => {
    const convs = this.conversations();
    return Array.isArray(convs) ? convs : [];
  });
  
  messagesList = computed(() => {
    const msgs = this.messages();
    return Array.isArray(msgs) ? msgs : [];
  });
  courses: any[] = [];
  selectedCourseId: number | null = null;
  courseId: number | null = null;
  currentMessage = '';
  isTyping = signal(false);
  
  suggestions = [
    "What topics are covered in this course?",
    "Explain the concept of...",
    "What materials are available for this course?",
    "Help me understand..."
  ];

  ngOnInit() {
    // Get course ID from route params if available
    this.route.queryParams.subscribe(params => {
      const courseId = params['course_id'];
      if (courseId) {
        this.courseId = parseInt(courseId);
        this.selectedCourseId = this.courseId;
      }
    });

    // Load courses
    this.courseService.getCourses().subscribe({
      next: (courses) => {
        try {
          // Ensure courses is always an array
          if (Array.isArray(courses)) {
            this.courses = courses;
          } else if (courses && typeof courses === 'object') {
            // Handle paginated responses
            const paginated = courses as any;
            this.courses = Array.isArray(paginated.results) ? paginated.results : [];
          } else {
            this.courses = [];
          }
        } catch (error) {
          console.error('Error processing courses:', error);
          this.courses = [];
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load courses:', err);
        this.courses = [];
        this.cdr.detectChanges();
      }
    });

    // Load conversations
    this.loadConversations();

    // Create new conversation on init if no course specified
    if (!this.courseId) {
      this.createNewConversation();
    } else {
      // Find or create conversation for this course
      this.loadOrCreateConversationForCourse(this.courseId);
    }
  }

  loadConversations() {
    this.aiChatService.listConversations(this.selectedCourseId || undefined).subscribe({
      next: (conversations) => {
        try {
          // Ensure conversations is always an array
          let conversationsArray: ChatConversation[] = [];
          if (Array.isArray(conversations)) {
            conversationsArray = conversations;
          } else if (conversations && typeof conversations === 'object') {
            // Handle paginated responses
            const paginated = conversations as any;
            conversationsArray = Array.isArray(paginated.results) ? paginated.results : [];
          }
          this.conversations.set(conversationsArray);
        } catch (error) {
          console.error('Error processing conversations:', error);
          this.conversations.set([]);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load conversations:', err);
        this.conversations.set([]);
        this.cdr.detectChanges();
      }
    });
  }

  loadOrCreateConversationForCourse(courseId: number) {
    this.aiChatService.listConversations(courseId).subscribe({
      next: (conversations) => {
        try {
          // Ensure conversations is always an array
          let conversationsArray: ChatConversation[] = [];
          if (Array.isArray(conversations)) {
            conversationsArray = conversations;
          } else if (conversations && typeof conversations === 'object') {
            // Handle paginated responses
            const paginated = conversations as any;
            conversationsArray = Array.isArray(paginated.results) ? paginated.results : [];
          }
          if (conversationsArray.length > 0) {
            this.loadConversation(conversationsArray[0].id);
          } else {
            this.createNewConversation(courseId);
          }
        } catch (error) {
          console.error('Error processing conversations:', error);
          this.createNewConversation(courseId);
        }
      },
      error: (err) => {
        console.error('Failed to load conversation:', err);
        this.createNewConversation(courseId);
      }
    });
  }

  createNewConversation(courseId?: number) {
    const title = courseId ? `Course Questions` : 'New Conversation';
    return this.aiChatService.createConversation(courseId, title).subscribe({
      next: (conv) => {
        this.conversation.set(conv);
        this.messages.set([]);
        this.conversations.set([conv, ...this.conversations()]);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to create conversation:', err)
    });
  }

  loadConversation(conversationId: number) {
    this.aiChatService.getConversation(conversationId).subscribe({
      next: (conv) => {
        this.conversation.set(conv);
        this.loadMessages(conversationId);
      },
      error: (err) => console.error('Failed to load conversation:', err)
    });
  }

  loadMessages(conversationId: number) {
    this.aiChatService.getMessages(conversationId).subscribe({
      next: (messages) => {
        try {
          // Ensure messages is always an array
          let messagesArray: ChatMessage[] = [];
          if (Array.isArray(messages)) {
            messagesArray = messages;
          } else if (messages && typeof messages === 'object') {
            // Handle paginated responses
            const paginated = messages as any;
            messagesArray = Array.isArray(paginated.results) ? paginated.results : [];
          }
          this.messages.set(messagesArray);
        } catch (error) {
          console.error('Error processing messages:', error);
          this.messages.set([]);
        }
        this.scrollToBottom();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load messages:', err);
        this.messages.set([]);
        this.cdr.detectChanges();
      }
    });
  }

  sendMessage() {
    if (!this.currentMessage.trim() || this.isTyping()) return;

    const message = this.currentMessage.trim();
    this.currentMessage = '';
    
    // If no conversation exists, create one first
    if (!this.conversation()) {
      this.isTyping.set(true);
      const courseId = this.selectedCourseId || this.courseId || undefined;
      
      this.aiChatService.createConversation(courseId, courseId ? 'Course Questions' : 'New Conversation').subscribe({
        next: (conv) => {
          this.conversation.set(conv);
          this.messages.set([]);
          this.conversations.set([conv, ...this.conversations()]);
          this.cdr.detectChanges();
          // Now send the message
          this.sendMessageInternal(message);
        },
        error: (err) => {
          this.isTyping.set(false);
          this.currentMessage = message; // Restore message
          console.error('Failed to create conversation:', err);
          alert('Failed to create conversation. Please try again.');
          this.cdr.detectChanges();
        }
      });
      return;
    }

    this.sendMessageInternal(message);
  }

  private sendMessageInternal(message: string) {
    if (!this.conversation()) return;

    this.isTyping.set(true);

    const conversationId = this.conversation()!.id;
    const courseId = this.selectedCourseId || this.courseId || undefined;

    // Add user message to UI immediately
    const userMessage: ChatMessage = {
      id: 0,
      conversation: conversationId,
      role: 'user',
      content: message,
      created_at: new Date().toISOString()
    };
    this.messages.set([...this.messages(), userMessage]);
    this.scrollToBottom();
    this.cdr.detectChanges();

    // Send to AI
    this.aiChatService.chatWithAI(conversationId, message, courseId).subscribe({
      next: (response) => {
        this.isTyping.set(false);
        // Add assistant message
        this.messages.set([...this.messages(), response.message]);
        this.scrollToBottom();
        this.cdr.detectChanges();
        
        // Refresh conversation list
        this.loadConversations();
      },
      error: (err) => {
        this.isTyping.set(false);
        console.error('Failed to send message:', err);
        alert('Failed to send message. Please try again.');
        this.cdr.detectChanges();
      }
    });
  }

  sendSuggestion(suggestion: string) {
    this.currentMessage = suggestion;
    this.sendMessage();
  }

  deleteConversation() {
    if (!this.conversation() || !confirm('Are you sure you want to delete this conversation?')) return;

    this.aiChatService.deleteConversation(this.conversation()!.id).subscribe({
      next: () => {
        this.conversations.set(this.conversations().filter(c => c.id !== this.conversation()!.id));
        this.conversation.set(null);
        this.messages.set([]);
        this.createNewConversation();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to delete conversation:', err)
    });
  }

  onCourseChange() {
    if (this.selectedCourseId) {
      this.loadOrCreateConversationForCourse(this.selectedCourseId);
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    
    return date.toLocaleDateString();
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  getCourseName(courseId: number): string {
    const course = this.courses.find(c => c.id === courseId);
    return course ? `${course.code} - ${course.name}` : 'Unknown Course';
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }
}

