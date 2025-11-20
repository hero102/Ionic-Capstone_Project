import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ExplorePage } from './explore.page';

@NgModule({
  imports: [IonicModule, CommonModule, RouterModule.forChild([{ path: '', component: ExplorePage }])],
  declarations: [ExplorePage]
})
export class ExploreModule {}
