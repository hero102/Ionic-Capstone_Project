import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminTabsPage } from '../admin-tabs.page';

const routes: Routes = [
  {
    path: '',
    component: AdminTabsPage,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('../../admin-dashboard/admin-dashboard.page').then((m) => m.AdminDashboardPage),
      },
      {
        path: 'trips',
        loadComponent: () =>
          import('../../admin-trips/admin-trips.page').then((m) => m.AdminTripsPage),
      },
      {
        path: 'destinations',
        loadComponent: () =>
          import('../../admin-destinations/admin-destinations.page').then((m) => m.AdminDestinationsPage),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('../../settings/settings.page').then((m) => m.SettingsPage),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminTabsRoutingModule {}
