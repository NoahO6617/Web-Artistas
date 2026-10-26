
import { mergeApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';

const bootstrap = (context: BootstrapContext) =>
  bootstrapApplication(
    App,
    mergeApplicationConfig(appConfig, {
      providers: [provideZoneChangeDetection()]
    }),
    context
  );

export default bootstrap;
