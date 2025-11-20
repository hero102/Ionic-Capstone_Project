import { Component, OnInit, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonicModule,
  ModalController,
  ToastController,
  RefresherCustomEvent,
  LoadingController,
} from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { TripService } from '../../services/TripAndDestination/trip.service';
import { AuthService } from '../../services/Auth/auth.service';
import { TripSignalService } from 'src/app/services/TripAndDestination/trip-signal.service';
import { TripDetailModalComponent } from 'src/app/shared/trip-detail-modal.component';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
})
export class FeedPage implements OnInit {
  loading = signal(false);
  searchText = signal('');

  constructor(
    private tripService: TripService,
    private tripSignal: TripSignalService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    public auth: AuthService
  ) {
    // 👀 React to trip changes globally
    effect(() => {
      const trips = this.tripSignal.trips(); // auto-triggers whenever trips change
      console.log('%c[FeedPage] 🔁 Trips signal changed:', 'color:#06b6d4;', trips.length);
      this.refreshImages(trips);
    });
  }

  /** ✅ Computed: Filter approved, search, and sort featured first */
  filteredTrips = computed(() => {
    const term = this.searchText().toLowerCase();

    // Step 1: Filter approved + match search
    const filtered = this.tripSignal
      .trips()
      .filter((t) => t.approved)
      .filter(
        (t) =>
          t.title?.toLowerCase().includes(term) ||
          t.destination?.name?.toLowerCase().includes(term) ||
          t.destination?.category?.toLowerCase().includes(term)
      );

    // Step 2: Sort so that featured trips come first
    const sorted = filtered.sort((a, b) => {
      if (a.featured && !b.featured) return -1; // a first
      if (!a.featured && b.featured) return 1;  // b first
      return 0; // maintain original order otherwise
    });

    console.log('%c[FeedPage] 🔍 Filtered + sorted trips:', 'color:#f59e0b;', sorted.length);
    return sorted;
  });

  async ngOnInit() {
    console.log('%c[FeedPage] 🚀 ngOnInit triggered', 'color:#4f46e5;');
    if (this.tripSignal.trips().length === 0) {
      await this.loadTrips();
    }
  }

  /** 🔁 Load approved trips from backend */
  async loadTrips(event?: RefresherCustomEvent) {
    this.loading.set(true);
    const loader = await this.loadingCtrl.create({
      message: 'Loading trips...',
      spinner: 'crescent',
    });
    await loader.present();

    try {
      const res = (await this.tripService.getFeed().toPromise()) || [];

      // ✅ Map clean trip objects
      const mapped = res
        .map((t: any) => ({
          ...t,
          image:
            t.imageUrls && t.imageUrls.length
              ? t.imageUrls[0]
              : 'assets/sample-destination.jpg',
          destination: t.destination || { name: 'Unknown', category: 'Uncategorized' },
          user: t.user || { name: 'Anonymous' },
        }))
        .filter((t: any) => t.approved);

      this.tripSignal.setTrips(mapped);
      console.log('%c[FeedPage] ✅ Approved trips loaded:', 'color:#22c55e;', mapped.length);
    } catch (e: any) {
      console.error('%c[FeedPage] ❌ Failed to load feed:', 'color:#ef4444;', e);
      const toast = await this.toastCtrl.create({
        message: 'Unable to load trips. Please try again.',
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

  /** 🖼️ Refresh image bindings automatically */
  refreshImages(trips: any[]) {
    trips.forEach((t) => {
      if (!t.image || t.image.includes('sample-destination')) {
        if (t.imageUrls && t.imageUrls.length > 0) {
          t.image = t.imageUrls[0];
        }
      }
    });
  }

  handleRefresh(event: RefresherCustomEvent) {
    this.loadTrips(event);
  }

  onSearchChange(event: any) {
    this.searchText.set(event.target.value?.toLowerCase() || '');
  }

  async openTripModal(trip: any) {
    const modal = await this.modalCtrl.create({
      component: TripDetailModalComponent,
      componentProps: { trip },
      breakpoints: [0, 0.8, 1],
      initialBreakpoint: 0.8,
      cssClass: 'trip-detail-modal',
    });
    await modal.present();
  }
}
