import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { MaintenanceGuard } from './guards/maintenance.guard';

export const routes: Routes = [
  // 🏠 Default redirect
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  // 🔐 Public routes
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'maintenance',
    loadComponent: () =>
      import('./pages/Maintenance/maintenance.page').then(
        (m) => m.MaintenancePage
      ),
  },

  // 👥 USER Protected Area
  {
    path: 'tabs',
    canActivate: [AuthGuard, MaintenanceGuard], // 👈 Maintenance applies only to users
    loadComponent: () =>
      import('./tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: 'feed',
        loadComponent: () =>
          import('./pages/feed/feed.page').then((m) => m.FeedPage),
      },
      {
        path: 'my-trips',
        loadComponent: () =>
          import('./pages/my-trips/my-trips.page').then(
            (m) => m.MyTripsPage
          ),
      },
      {
        path: 'explore',
        loadComponent: () =>
          import('./pages/explore/explore.page').then((m) => m.ExplorePage),
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.page').then(
            (m) => m.DashboardPage
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/profile/profile.page').then((m) => m.ProfilePage),
      },
      {
        path: '',
        redirectTo: '/tabs/feed',
        pathMatch: 'full',
      },
    ],
  },

  // 🧑‍💼 ADMIN Protected Area
  {
    path: 'admin',
    canActivate: [AdminGuard], // 👈 no MaintenanceGuard here
    loadComponent: () =>
      import('./admin/pages/admin-tabs/admin-tabs.page').then(
        (m) => m.AdminTabsPage
      ),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./admin/pages/admin-dashboard/admin-dashboard.page').then(
            (m) => m.AdminDashboardPage
          ),
      },
      {
        path: 'trips',
        loadComponent: () =>
          import('./admin/pages/admin-trips/admin-trips.page').then(
            (m) => m.AdminTripsPage
          ),
      },
      {
        path: 'destinations',
        loadComponent: () =>
          import(
            './admin/pages/admin-destinations/admin-destinations.page'
          ).then((m) => m.AdminDestinationsPage),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./admin/pages/settings/settings.page').then(
            (m) => m.SettingsPage
          ),
      },
      {
        path: '',
        redirectTo: '/admin/dashboard',
        pathMatch: 'full',
      },
    ],
  },

  // ⚠️ Fallback
  {
    path: '**',
    redirectTo: 'login',
  },
];
