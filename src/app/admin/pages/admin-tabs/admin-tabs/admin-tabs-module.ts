import { NgModule } from '@angular/core';
import { AdminTabsRoutingModule } from '../admin-tabs-routing/admin-tabs-routing-module'; 
import { AdminTabsPage } from '../admin-tabs.page'; 
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [CommonModule, IonicModule, AdminTabsRoutingModule],
  declarations: [],
})
export class AdminTabsModule {}
