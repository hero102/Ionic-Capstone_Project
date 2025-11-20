import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-trip-detail-modal',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-content class="ion-padding">
      <ion-header collapse="condense">
        <ion-toolbar color="primary">
          <ion-title>{{ trip?.title }}</ion-title>
          <ion-buttons slot="end">
            <ion-button (click)="close()">Close</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>

      <ion-img
        [src]="trip?.image"
        alt="Trip image"
        style="width: 100%; border-radius: 12px; max-height: 300px; object-fit: cover;"
      ></ion-img>

      <div class="ion-padding">
        <h2>{{ trip?.title }}</h2>
        <p>{{ trip?.caption }}</p>

        <ion-item lines="none">
          <ion-icon name="location-outline" slot="start"></ion-icon>
          <ion-label>
            {{ trip?.destination?.name }} ({{ trip?.destination?.category | titlecase }})
          </ion-label>
        </ion-item>

        <ion-item lines="none">
          <ion-icon name="person-circle-outline" slot="start"></ion-icon>
          <ion-label>{{ trip?.user?.name || 'Anonymous' }}</ion-label>
        </ion-item>

        <ion-item lines="none">
          <ion-icon name="star" slot="start" color="warning"></ion-icon>
          <ion-label>Rating: {{ trip?.rating || 0 }}</ion-label>
        </ion-item>

        <ion-badge *ngIf="trip?.featured" color="primary" class="ion-margin-top">
          Featured
        </ion-badge>
      </div>
    </ion-content>
  `,
})
export class TripDetailModalComponent {
  @Input() trip: any;

  constructor(private modalCtrl: ModalController) {}

  close() {
    this.modalCtrl.dismiss();
  }
}
