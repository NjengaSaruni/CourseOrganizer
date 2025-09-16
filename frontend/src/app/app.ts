import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CallOverlayComponent } from './shared/call-overlay/call-overlay.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CallOverlayComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('course-organizer');
}
