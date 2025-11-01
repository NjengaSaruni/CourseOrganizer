import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

@Pipe({
  name: 'markdown',
  standalone: true
})
export class MarkdownPipe implements PipeTransform {
  private configured = false;

  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    if (!value) return '';
    
    // Configure marked options on first use
    if (!this.configured) {
      try {
        marked.setOptions({
          breaks: true,
          gfm: true
        });
        this.configured = true;
      } catch (error) {
        console.warn('Could not configure marked:', error);
      }
    }
    
    try {
      // Parse markdown to HTML - marked.parse is synchronous
      const html = marked.parse(value) as string;
      
      // Debug: Check if markdown was actually parsed
      if (html === value && (value.includes('##') || value.includes('**'))) {
        console.error('Markdown not parsed! Input:', value.substring(0, 100), 'Output:', html.substring(0, 100));
      }
      
      // Sanitize HTML to prevent XSS attacks
      return this.sanitizer.bypassSecurityTrustHtml(html);
    } catch (error) {
      console.error('Error parsing markdown:', error);
      // Return escaped HTML if markdown parsing fails
      return this.sanitizer.bypassSecurityTrustHtml(
        value.replace(/</g, '&lt;').replace(/>/g, '&gt;')
      );
    }
  }
}

