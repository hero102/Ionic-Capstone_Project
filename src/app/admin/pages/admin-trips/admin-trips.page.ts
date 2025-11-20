import {
  Component,
  OnInit,
  signal,
  computed,
  effect,
  HostListener,
} from '@angular/core';
import {
  IonicModule,
  ToastController,
  AlertController,
  LoadingController,
  RefresherCustomEvent,
} from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TripService } from 'src/app/services/TripAndDestination/trip.service';
import { TripSignalService } from 'src/app/services/TripAndDestination/trip-signal.service';

@Component({
  selector: 'app-admin-trips',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterModule],
  templateUrl: './admin-trips.page.html',
  styleUrls: ['./admin-trips.page.scss'],
})
export class AdminTripsPage implements OnInit {
  loading = signal(false);
  searchText = signal('');
  filterType = signal<'all' | 'pending' | 'approved' | 'featured'>('all');
  isMobile = signal(window.innerWidth < 992);

  constructor(
    private tripService: TripService,
    public tripSignal: TripSignalService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {
    effect(() => {
      console.log(
        '%c[AdminTrips] Trips updated:',
        'color:#06b6d4;',
        this.tripSignal.trips().length
      );
    });
  }

  @HostListener('window:resize')
  onResize() {
    this.isMobile.set(window.innerWidth < 992);
  }

  /** 🧮 Computed: only show non-draft trips */
  filteredTrips = computed(() => {
    const term = this.searchText().toLowerCase();
    const type = this.filterType();

    return this.tripSignal
      .trips()
      .filter((t) => t.draft === false) // 🚫 hide all drafts
      .filter((t) => {
        if (type === 'pending') return t.approved === false;
        if (type === 'approved') return t.approved === true;
        if (type === 'featured') return t.featured === true && t.approved === true;
        return true;
      })
      .filter(
        (t) =>
          t.title?.toLowerCase().includes(term) ||
          t.destination?.name?.toLowerCase().includes(term) ||
          t.destination?.category?.toLowerCase().includes(term) ||
          t.user?.name?.toLowerCase().includes(term)
      )
      .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  });

  async ngOnInit() {
    await this.loadTrips();
  }

  /** 🔁 Load all trips */
  async loadTrips(event?: RefresherCustomEvent) {
    this.loading.set(true);
    const loader = await this.loadingCtrl.create({
      message: 'Loading trips...',
      spinner: 'crescent',
    });
    await loader.present();

    try {
      const trips = (await this.tripService.getAllTripsForAdmin().toPromise()) || [];
      this.tripSignal.setTrips(trips);
    } catch (e) {
      const toast = await this.toastCtrl.create({
        message: 'Failed to load trips.',
        duration: 1500,
        color: 'warning',
      });
      await toast.present();
    } finally {
      this.loading.set(false);
      await loader.dismiss();
      if (event) event.target.complete();
    }
  }

  /** 🔍 Search */
  onSearchChange(event: any) {
    this.searchText.set(event.target.value?.toLowerCase() || '');
  }

  /** Filter segment */
  onFilterChange(value: any) {
    const allowed: ('all' | 'pending' | 'approved' | 'featured')[] = [
      'all',
      'pending',
      'approved',
      'featured',
    ];
    this.filterType.set(allowed.includes(value) ? value : 'all');
  }

  /** ✅ Approve / Unapprove trip */
  async confirmApprove(trip: any) {
    const alert = await this.alertCtrl.create({
      header: trip.approved ? 'Unapprove Trip' : 'Approve Trip',
      message: `Do you want to ${trip.approved ? 'unapprove' : 'approve'} this trip?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Yes',
          handler: async () => {
            await this.tripService.approveTrip(trip.id, !trip.approved).toPromise();
            trip.approved = !trip.approved;
            this.tripSignal.updateTrip(trip);
            const toast = await this.toastCtrl.create({
              message: `Trip ${trip.approved ? 'approved ✅' : 'set to pending ⏳'}.`,
              duration: 1200,
              color: 'success',
            });
            await toast.present();
          },
        },
      ],
    });
    await alert.present();
  }

  /** ⭐ Feature / Unfeature */
  async confirmFeature(trip: any) {
    const alert = await this.alertCtrl.create({
      header: trip.featured ? 'Remove Feature' : 'Feature Trip',
      message: `Do you want to ${trip.featured ? 'remove' : 'set'} this trip as featured?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Yes',
          handler: async () => {
            await this.tripService.setFeatured(trip.id, !trip.featured).toPromise();
            trip.featured = !trip.featured;
            this.tripSignal.updateTrip(trip);
            const toast = await this.toastCtrl.create({
              message: 'Trip featured status updated.',
              duration: 1200,
              color: 'success',
            });
            await toast.present();
          },
        },
      ],
    });
    await alert.present();
  }

  /** 🗑 Delete trip */
  async confirmDelete(trip: any) {
    const alert = await this.alertCtrl.create({
      header: 'Delete Trip',
      message: `Are you sure you want to delete "${trip.title}"?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            await this.tripService.deleteTrip(trip.id).toPromise();
            this.tripSignal.removeTrip(trip.id);
            const toast = await this.toastCtrl.create({
              message: 'Trip deleted successfully.',
              duration: 1200,
              color: 'danger',
            });
            await toast.present();
          },
        },
      ],
    });
    await alert.present();
  }
}
