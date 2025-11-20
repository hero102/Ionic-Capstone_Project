import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { TripService } from '../../services/TripAndDestination/trip.service';
import { TripModalComponent } from '../../shared/trip-modal.component';

@Component({
  selector: 'app-my-trips',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './my-trips.page.html',
  styleUrls: ['./my-trips.page.scss'],
})
export class MyTripsPage implements OnInit {
  trips = signal<any[]>([]);
  segment = signal<'all' | 'drafts' | 'published'>('all');
  loading = signal(false);

  filteredTrips = computed(() => {
    const filter = this.segment();
    const all = this.trips();

    if (filter === 'drafts') return all.filter(t => t.draft === true);
    if (filter === 'published') return all.filter(t => t.approved === true);
    return all;
  });

  constructor(
    private tripService: TripService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.load();
  }

  async load() {
    this.loading.set(true);
    try {
      const res = await this.tripService.getMyTrips().toPromise();
      this.trips.set(Array.isArray(res) ? res : []);
      console.log('[MyTrips] ✅ Loaded', this.trips().length, 'trips');
    } catch (err) {
      console.error('[MyTrips] ❌ Failed to load trips:', err);
      const toast = await this.toastCtrl.create({
        message: 'Failed to load trips.',
        duration: 1500,
        color: 'danger',
      });
      await toast.present();
    } finally {
      this.loading.set(false);
    }
  }

  async openCreate() {
    const modal = await this.modalCtrl.create({
      component: TripModalComponent,
      componentProps: { mode: 'create' },
    });
    modal.onDidDismiss().then(() => this.load());
    await modal.present();
  }

  async editTrip(trip: any) {
    const modal = await this.modalCtrl.create({
      component: TripModalComponent,
      componentProps: { mode: 'edit', trip: { ...trip } },
    });
    modal.onDidDismiss().then(() => this.load());
    await modal.present();
  }

  async deleteTrip(trip: any) {
    const confirm = window.confirm('Are you sure you want to delete this trip?');
    if (!confirm) return;
    try {
      await this.tripService.deleteTrip(trip.id).toPromise();
      const toast = await this.toastCtrl.create({
        message: 'Trip deleted successfully.',
        duration: 1000,
        color: 'success',
      });
      await toast.present();
      this.load();
    } catch (err) {
      console.error('[MyTrips] ❌ Delete failed:', err);
      const toast = await this.toastCtrl.create({
        message: 'Delete failed. Try again.',
        duration: 1000,
        color: 'danger',
      });
      await toast.present();
    }
  }

  onSegmentChange(event: any) {
  const value = (event.detail?.value ?? 'all') as 'all' | 'drafts' | 'published';
  this.segment.set(value);
}

}
