import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardPage } from './dashboard.page';

@NgModule({
  imports: [IonicModule, CommonModule, RouterModule.forChild([{ path: '', component: DashboardPage }])],
  declarations: [DashboardPage]
})
export class DashboardModule {}
