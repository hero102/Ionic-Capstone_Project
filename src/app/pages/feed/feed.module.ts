import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FeedPage } from './feed.page';

@NgModule({
  imports: [IonicModule, CommonModule, RouterModule.forChild([{ path: '', component: FeedPage }])],
  declarations: [FeedPage]
})
export class FeedModule {}
