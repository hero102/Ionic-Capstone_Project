import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MyTripsPage } from './my-trips.page';
import { TripModalComponent } from '../../shared/trip-modal.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [IonicModule, CommonModule, FormsModule, RouterModule.forChild([{ path: '', component: MyTripsPage }])],
  declarations: [MyTripsPage, TripModalComponent],
  entryComponents: [TripModalComponent]
})
export class MyTripsModule {}
