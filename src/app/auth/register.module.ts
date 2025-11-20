import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RegisterPage } from './register.page';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [IonicModule, CommonModule, FormsModule, RouterModule.forChild([{ path: '', component: RegisterPage }])],
  declarations: [RegisterPage]
})
export class RegisterModule {}
