import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { MaintenanceService } from 'src/app/services/Maintanance/maintenance.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  maintenance = false;
  theme: 'light' | 'dark' | 'system' = 'light';

  constructor(
    private toast: ToastController,
    private maintenanceService: MaintenanceService
  ) {}

  ngOnInit() {
    this.loadSettings();

    // 🌗 Auto-detect system theme change if "system" selected
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    prefersDark.addEventListener('change', (media) => {
      if (this.theme === 'system') {
        document.body.classList.toggle('dark', media.matches);
      }
    });

    // 🔁 Sync UI with backend maintenance changes (live)
    this.maintenanceService.active$.subscribe((isActive) => {
      this.maintenance = isActive;
    });
  }

  /** 🔹 Load theme + maintenance state */
  loadSettings() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) this.theme = savedTheme as 'light' | 'dark' | 'system';

    this.maintenance = this.maintenanceService.isActive();
    this.applyTheme(this.theme);
  }

  /** 💾 Save both theme and maintenance mode */
  async saveSettings() {
    // ✅ Update backend maintenance status
    this.maintenanceService.setMaintenance(this.maintenance).subscribe();

    // ✅ Save theme preference locally
    localStorage.setItem('theme', this.theme);
    this.applyTheme(this.theme);

    // ✅ Toast confirmation
    const toast = await this.toast.create({
      message: 'Settings updated successfully!',
      duration: 1500,
      color: 'success',
    });
    await toast.present();
  }

  /** 🌓 Apply selected theme immediately */
  applyTheme(theme: 'light' | 'dark' | 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const isDark =
      theme === 'dark' ? true : theme === 'system' ? prefersDark.matches : false;

    document.body.classList.toggle('dark', isDark);
  }

  onThemeChange() {
    this.applyTheme(this.theme);
  }
}
