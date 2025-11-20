import { fixIoniconsBasePath } from './fix-ionicons';
fixIoniconsBasePath(); // ✅ Fix invalid base URL before anything else

import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { addIcons } from 'ionicons';
import {
  home,
  albums,
  person,
  compass,
  barChart,
  statsChart,
  logIn,
  logOut,
  cameraOutline,
  locateOutline,
  personCircleOutline
} from 'ionicons/icons';

// ✅ Register icons manually to avoid network fetches
addIcons({
  home,
  albums,
  person,
  compass,
  barChart,
  statsChart,
  logIn,
  logOut,
  'camera-outline': cameraOutline,
  'locate-outline': locateOutline,
  'person-circle-outline': personCircleOutline,
});

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideIonicAngular({ mode: 'md' }),
    provideHttpClient(),
  ],
}).catch((err) => console.error(err));
