import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { MaintenanceService } from '../../services/Maintanance/maintenance.service';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header>
      <ion-toolbar color="warning">
        <ion-title>Maintenance Mode</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding ion-text-center">
      <ion-icon name="construct-outline" size="large" color="warning"></ion-icon>
      <h2 class="ion-margin-top">We'll Be Back Soon!</h2>
      <p>The app is currently under maintenance. Please check back later.</p>
      <ion-spinner name="crescent" color="medium" class="ion-margin-top"></ion-spinner>
    </ion-content>
  `,
})
export class MaintenancePage implements OnInit, OnDestroy {
  active = false;
  private sub?: Subscription;

  constructor(private maintenance: MaintenanceService) {}

  ngOnInit() {
    this.sub = this.maintenance.active$.subscribe((isActive) => {
      this.active = isActive;
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
