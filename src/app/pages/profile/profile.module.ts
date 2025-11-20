import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProfilePage } from './profile.page';

@NgModule({
  imports: [IonicModule, CommonModule, RouterModule.forChild([{ path: '', component: ProfilePage }])],
  declarations: [ProfilePage]
})
export class ProfileModule {}
