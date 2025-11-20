import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TabsPage } from './tabs.page';

@NgModule({
  imports: [IonicModule, CommonModule, RouterModule.forChild([
    {
      path: '',
      component: TabsPage,
      children: [
        { path: 'feed', loadChildren: () => import('../pages/feed/feed.module').then(m=>m.FeedModule) },
        { path: 'my-trips', loadChildren: () => import('../pages/my-trips/my-trips.module').then(m=>m.MyTripsModule) },
        { path: 'explore', loadChildren: () => import('../pages/explore/explore.module').then(m=>m.ExploreModule) },
        { path: 'dashboard', loadChildren: () => import('../pages/dashboard/dashboard.module').then(m=>m.DashboardModule) },
        { path: 'profile', loadChildren: () => import('../pages/profile/profile.module').then(m=>m.ProfileModule) },
        { path: '', redirectTo: 'feed', pathMatch: 'full' }
      ]
    }
  ])]
})
export class TabsModule {}
