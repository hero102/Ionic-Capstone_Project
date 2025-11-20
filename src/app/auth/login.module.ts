import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LoginPage } from './login.page';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [IonicModule, CommonModule, FormsModule, RouterModule.forChild([{ path: '', component: LoginPage }])],
  declarations: [LoginPage]
})
export class LoginModule {}
