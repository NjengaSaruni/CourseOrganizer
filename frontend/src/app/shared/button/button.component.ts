import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="buttonClasses"
      (click)="handleClick($event)">
      
      <!-- Loading Spinner -->
      <svg 
        *ngIf="loading"
        class="animate-spin -ml-1 mr-2 h-4 w-4"
        [class.h-3]="size === 'sm'"
        [class.w-3]="size === 'sm'"
        [class.h-5]="size === 'lg'"
        [class.w-5]="size === 'lg'"
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      
      <!-- Left Icon -->
      <span *ngIf="iconLeft && !loading" [innerHTML]="iconLeft" class="flex-shrink-0 mr-2"></span>
      
      <!-- Content -->
      <span [class.opacity-0]="loading && !loadingText">
        <ng-content></ng-content>
      </span>
      
      <!-- Loading Text -->
      <span *ngIf="loading && loadingText" class="ml-2">{{ loadingText }}</span>
      
      <!-- Right Icon -->
      <span *ngIf="iconRight && !loading" [innerHTML]="iconRight" class="flex-shrink-0 ml-2"></span>
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() loadingText = '';
  @Input() fullWidth = false;
  @Input() iconLeft = '';
  @Input() iconRight = '';
  @Output() clicked = new EventEmitter<Event>();

  handleClick(event: Event): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(event);
    }
  }

  get buttonClasses(): string {
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed';
    
    // Size classes
    const sizeClasses = {
      'sm': 'px-3 py-1.5 text-xs rounded-lg',
      'md': 'px-4 py-2.5 text-sm rounded-xl',
      'lg': 'px-6 py-3 text-base rounded-xl'
    };

    // Variant classes
    const variantClasses = {
      'primary': 'bg-gray-900 text-white hover:bg-black focus:ring-gray-200 shadow-sm',
      'secondary': 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-200 shadow-sm',
      'danger': 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-200 shadow-sm',
      'success': 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-200 shadow-sm',
      'warning': 'bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-200 shadow-sm',
      'ghost': 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-200'
    };

    const widthClass = this.fullWidth ? 'w-full' : '';

    return `${baseClasses} ${sizeClasses[this.size]} ${variantClasses[this.variant]} ${widthClass}`.trim();
  }
}

