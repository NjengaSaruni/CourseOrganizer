import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { renderMessageWithReferences } from '../../core/message-parser.util';

@Component({
  selector: 'app-chat-message-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="chat-message-content"
      [innerHTML]="renderedMessage"
      (click)="handleClick($event)"></div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .chat-message-content {
      word-wrap: break-word;
      word-break: break-word;
    }

    :host ::ng-deep .chat-mention {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      padding: 2px 8px;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-block;
      font-size: 0.9em;
    }

    :host ::ng-deep .chat-mention:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    :host ::ng-deep .chat-material {
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
      color: white;
      padding: 2px 8px;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-block;
      font-size: 0.9em;
    }

    :host ::ng-deep .chat-material:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
    }

    :host ::ng-deep .chat-topic {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 2px 8px;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-block;
      font-size: 0.9em;
    }

    :host ::ng-deep .chat-topic:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
  `]
})
export class ChatMessageRendererComponent {
  @Input() message = '';
  
  @Output() mentionClicked = new EventEmitter<{ userId: number; userName: string }>();
  @Output() materialClicked = new EventEmitter<{ materialId: number; materialTitle: string }>();
  @Output() topicClicked = new EventEmitter<{ topic: string }>();

  renderedMessage: SafeHtml = '';

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(): void {
    this.updateRenderedMessage();
  }

  private updateRenderedMessage(): void {
    const html = renderMessageWithReferences(this.message);
    this.renderedMessage = this.sanitizer.bypassSecurityTrustHtml(html);
  }

  handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    
    // Handle mention click
    if (target.classList.contains('chat-mention')) {
      const userId = target.getAttribute('data-user-id');
      const userName = target.getAttribute('title');
      if (userId && userName) {
        this.mentionClicked.emit({ 
          userId: parseInt(userId), 
          userName 
        });
      }
    }
    
    // Handle material click
    if (target.classList.contains('chat-material')) {
      const materialId = target.getAttribute('data-material-id');
      const materialTitle = target.getAttribute('title');
      if (materialId && materialTitle) {
        this.materialClicked.emit({ 
          materialId: parseInt(materialId), 
          materialTitle 
        });
      }
    }
    
    // Handle topic click
    if (target.classList.contains('chat-topic')) {
      const topic = target.getAttribute('data-topic');
      if (topic) {
        this.topicClicked.emit({ topic });
      }
    }
  }
}

