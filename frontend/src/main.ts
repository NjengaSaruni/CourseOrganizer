import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Browser shim for libraries expecting Node's global
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (typeof (window as any).global === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  (window as any).global = window;
}

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
