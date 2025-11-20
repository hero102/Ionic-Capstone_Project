import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonicModule,
  AlertController,
  ToastController,
  LoadingController,
  ActionSheetController,
} from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../services/Auth/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  user: any;
  profileImage: string | null = null;
  profileForm = this.fb.group({
    name: ['', Validators.required],
    location: [''],
  });

  constructor(
    private auth: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private actionSheetCtrl: ActionSheetController
  ) {}

  async ngOnInit() {
    await this.loadProfile();
  }

  // ✅ Load user profile
  async loadProfile() {
    const token = this.auth.getToken();
    if (!token) {
      await this.router.navigate(['/login']);
      return;
    }

    try {
      const res = await fetch(`${environment.apiBaseUrl}/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      this.user = await res.json();

      this.profileForm.patchValue({
        name: this.user.name,
        location: this.user.location || '',
      });

      this.profileImage = this.user.profileImage || null;
      await this.getLocation();
    } catch (err) {
      console.error('Profile load failed:', err);
    }
  }

  // ✅ Open ActionSheet for photo options
  async openPhotoOptions() {
    const sheet = await this.actionSheetCtrl.create({
      header: 'Update Profile Picture',
      buttons: [
        {
          text: 'Take Photo',
          icon: 'camera-outline',
          handler: () => this.pickPhoto(CameraSource.Camera),
        },
        {
          text: 'Choose from Gallery',
          icon: 'image-outline',
          handler: () => this.pickPhoto(CameraSource.Photos),
        },
        {
          text: 'Cancel',
          role: 'cancel',
          icon: 'close-outline',
        },
      ],
    });
    await sheet.present();
  }

  // ✅ Capture or pick photo (works both web + mobile)
  async pickPhoto(source: CameraSource) {
    console.log('[Camera] pickPhoto clicked');

    try {
      const platform = (window as any).Capacitor?.getPlatform?.() || 'web';
      console.log('[Platform Detected]', platform);

      // Web fallback for camera (manual file picker)
      if (platform === 'web' && source === CameraSource.Camera) {
        console.log('[Camera] using manual file picker (browser)');
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment';
        input.onchange = (e: any) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = () => (this.profileImage = reader.result as string);
            reader.readAsDataURL(file);
          }
        };
        input.click();
        return;
      }

      // ✅ Works in native apps and some browsers (with secure flag)
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source,
      });

      if (image?.webPath) {
        this.profileImage = image.webPath;
        const toast = await this.toastCtrl.create({
          message: 'Profile photo updated!',
          duration: 1200,
          color: 'success',
        });
        await toast.present();
      } else {
        console.warn('[Camera] No image returned');
      }
    } catch (err: any) {
      console.error('[Camera Error]', err?.message || err);
      const toast = await this.toastCtrl.create({
        message: 'Camera or gallery access failed.',
        duration: 1200,
        color: 'danger',
      });
      await toast.present();
    }
  }

  // ✅ Fetch location (works on web + mobile)
  async getLocation() {
    console.log('[Location] fetching...');
    const platform = (window as any).Capacitor?.getPlatform?.() || 'web';

    try {
      const loading = await this.loadingCtrl.create({
        message: 'Fetching location...',
        spinner: 'crescent',
      });
      await loading.present();

      let latitude: number, longitude: number;

      if (platform === 'web') {
        console.log('[Location] using browser geolocation');
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
      } else {
        console.log('[Location] using Capacitor geolocation');
        const pos = await Geolocation.getCurrentPosition();
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
      }

      const locationString = `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`;
      this.profileForm.patchValue({ location: locationString });

      await loading.dismiss();
    } catch (err) {
      console.warn('[Location] error:', err);
      const t = await this.toastCtrl.create({
        message: 'Unable to access location',
        duration: 1200,
        color: 'warning',
      });
      await t.present();
    }
  }

  // ✅ Save profile
  async saveProfile() {
    if (this.profileForm.invalid) {
      const t = await this.toastCtrl.create({
        message: 'Please enter your name',
        duration: 1000,
        color: 'warning',
      });
      return t.present();
    }

    const token = this.auth.getToken();
    if (!token) return;

    const updatedData = {
      name: this.profileForm.value.name,
      location: this.profileForm.value.location,
      profileImage: this.profileImage,
    };

    try {
      const res = await fetch(`${environment.apiBaseUrl}/user/updateProfile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (res.ok) {
        this.user = await res.json();
        const t = await this.toastCtrl.create({
          message: 'Profile updated successfully!',
          duration: 1200,
          color: 'success',
        });
        await t.present();
      } else {
        throw new Error('Update failed');
      }
    } catch (err) {
      console.error(err);
      const t = await this.toastCtrl.create({
        message: 'Profile update failed',
        duration: 1200,
        color: 'danger',
      });
      await t.present();
    }
  }

  // ✅ Logout
  async logout() {
    const a = await this.alertCtrl.create({
      header: 'Confirm',
      message: 'Logout?',
      buttons: [
        { text: 'Cancel' },
        {
          text: 'Yes',
          handler: () => {
            this.auth.logout();
            this.router.navigate(['/login']);
          },
        },
      ],
    });
    await a.present();
  }
}
