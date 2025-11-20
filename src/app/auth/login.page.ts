import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonicModule,
  ToastController,
  ModalController,
  LoadingController,
} from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../services/Auth/auth.service';
import { RegisterModalComponent } from './register.page';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Login</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form (submit)="onSubmit($event)">
        <ion-item>
          <ion-label position="floating">Email</ion-label>
          <ion-input
            name="email"
            type="email"
            [(ngModel)]="email"
            required
            autocomplete="username"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Password</ion-label>
          <ion-input
            name="password"
            [(ngModel)]="password"
            type="password"
            required
            autocomplete="current-password"
          ></ion-input>
        </ion-item>

        <ion-button expand="block" type="submit" [disabled]="loading">
          {{ loading ? 'Logging in...' : 'Login' }}
        </ion-button>
      </form>

      <div class="ion-text-center ion-padding-top">
        <ion-button fill="clear" color="medium" (click)="openRegister()">
          New here? Register
        </ion-button>
      </div>
    </ion-content>
  `,
})
export class LoginPage {
  email = '';
  password = '';
  loading = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController
  ) {}

  /** 🔐 Handle Login */
  async onSubmit(e: Event) {
    e.preventDefault();
    if (!this.email || !this.password) return;

    const loader = await this.loadingCtrl.create({
      message: 'Signing in...',
      spinner: 'crescent',
    });
    await loader.present();

    this.loading = true;

    try {
      const res: any = await this.auth
        .login({ email: this.email, password: this.password })
        .toPromise();

      // If backend returns success token -> save session
      if (res?.token) {
        // Save & redirect handled inside saveSession
        await this.auth.saveSession(res);

        const successToast = await this.toastCtrl.create({
          message: `Welcome back, ${res.name || res.email}!`,
          duration: 1200,
          color: 'success',
        });
        await successToast.present();
        return;
      }

      // If server responded with a non-token success payload
      const msg = res?.message || 'Unexpected response from server';
      const t = await this.toastCtrl.create({ message: msg, duration: 1800, color: 'warning' });
      await t.present();
    } catch (err: any) {
      console.error('[Login] Failed:', err);

      // Try to extract a useful message from the backend response
      let message = 'Login failed — please try again';

      // HttpErrorResponse shape (Angular)
      if (err && err.error) {
        // Common: { message: 'Invalid credentials' } or plain string
        if (typeof err.error === 'string' && err.error.trim()) {
          message = err.error;
        } else if (err.error.message) {
          message = err.error.message;
        } else if (err.error.error) {
          // sometimes { error: 'Bad credentials' }
          message = err.error.error;
        } else {
          // fallback to JSON stringification for debugging
          try {
            message = JSON.stringify(err.error);
          } catch {}
        }
      } else if (err && err.message) {
        // Generic Error object
        message = err.message;
      } else if (err && err.statusText) {
        message = `${err.status} ${err.statusText}`;
      }

      const t = await this.toastCtrl.create({
        message,
        duration: 2500,
        color: 'danger',
      });
      await t.present();
    } finally {
      this.loading = false;
      try { await loader.dismiss(); } catch {}
    }
  }

  /** 🧍‍♂️ Open Register Modal */
  async openRegister() {
    const modal = await this.modalCtrl.create({
      component: RegisterModalComponent,
      cssClass: 'register-modal',
    });

    modal.onDidDismiss().then((res) => {
      if (res.data?.success) {
        this.email = res.data.email;
        this.password = '';
      }
    });

    await modal.present();
  }
}
