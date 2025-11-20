import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, ModalController } from '@ionic/angular';
import { AuthService } from '../services/Auth/auth.service';

@Component({
  selector: 'app-register-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Register</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="close()">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form (submit)="onSubmit($event)">
        <ion-item>
          <ion-label position="floating">Name</ion-label>
          <ion-input name="name" [(ngModel)]="name" required></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Email</ion-label>
          <ion-input
            name="email"
            [(ngModel)]="email"
            type="email"
            required
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Password</ion-label>
          <ion-input
            name="password"
            [(ngModel)]="password"
            type="password"
            required
          ></ion-input>
        </ion-item>

        <ion-button expand="block" type="submit">Register</ion-button>
      </form>
    </ion-content>
  `,
})
export class RegisterModalComponent {
  name = '';
  email = '';
  password = '';

  constructor(
    private auth: AuthService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {}

  close() {
    this.modalCtrl.dismiss();
  }

  async onSubmit(e: Event) {
    e.preventDefault();
    try {
      await this.auth
        .register({ name: this.name, email: this.email, password: this.password })
        .toPromise();
      const t = await this.toastCtrl.create({
        message: 'Registered successfully! Please log in.',
        duration: 1500,
      });
      await t.present();
      this.modalCtrl.dismiss({ success: true });
    } catch (err) {
      const t = await this.toastCtrl.create({
        message: 'Registration failed. Try again.',
        duration: 1500,
      });
      await t.present();
    }
  }
}
