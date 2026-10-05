import { provideZoneChangeDetection } from "@angular/core";
import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import { App } from "./app/app";

const bootstrap = (context: BootstrapContext) => bootstrapApplication(App, {providers: [provideZoneChangeDetection()]}, context);

export default bootstrap;
