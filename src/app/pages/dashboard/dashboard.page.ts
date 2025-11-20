import { Component, OnInit, ElementRef, ViewChild, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { Chart, registerables } from 'chart.js';
import { TripService } from '../../services/TripAndDestination/trip.service';
import { AuthService } from '../../services/Auth/auth.service';
import { TripSignalService } from 'src/app/services/TripAndDestination/trip-signal.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  // 🧠 Reactive signals
  loading = signal(false);
  totalTrips = signal(0);
  featuredTrips = signal(0);
  activeCategories = signal<number>(0);
  byCategory = signal<{ name: string; count: number }[]>([]);

  // 🎨 Chart reference
  @ViewChild('categoryCanvas') categoryCanvas!: ElementRef;
  private categoryChart!: Chart;

  constructor(
    private tripService: TripService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private tripSignal: TripSignalService,
    public auth: AuthService
  ) {
    // 👀 Auto-update Dashboard whenever trips change globally
    effect(() => {
      const trips = this.tripSignal.trips(); // signal subscription
      console.log('%c[Dashboard] 🔁 Trips changed:', 'color:#06b6d4;', trips.length);

      // 🔁 Update dashboard stats in real time
      if (trips && trips.length > 0) {
        this.updateDashboardStats(trips);
        setTimeout(() => this.renderCategoryChart(), 300);
      }
    });
  }

  async ngOnInit() {
    console.log('%c[Dashboard] 🚀 ngOnInit started', 'color:#4f46e5; font-weight:bold;');

    // ✅ If trips already in signal (cached), just render
    if (this.tripSignal.trips().length > 0) {
      console.log('%c[Dashboard] ⚡ Using cached trips', 'color:#22c55e;');
      this.updateDashboardStats(this.tripSignal.trips());
      setTimeout(() => this.renderCategoryChart(), 300);
    } else {
      await this.loadDashboardData();
    }
  }

  /** 🔁 Fetch user's trips only once (initial load) */
  async loadDashboardData() {
    console.log('%c[Dashboard] 🔄 Fetching trips...', 'color:#06b6d4;');
    this.loading.set(true);

    const loader = await this.loadingCtrl.create({
      message: 'Loading your trips...',
      spinner: 'crescent',
    });
    await loader.present();

    try {
      const res: any[] = (await this.tripService.httpGet(`/trips/me`).toPromise()) || [];
      console.log('%c[Dashboard] 📦 Trips fetched:', 'color:#0ea5e9;', res);

      // ✅ Update global TripSignalService
      this.tripSignal.setTrips(res);

      // ✅ Dashboard stats will auto-update via effect()
    } catch (err) {
      console.error('%c[Dashboard] ❌ Error fetching trips:', 'color:#dc2626;', err);
      const toast = await this.toastCtrl.create({
        message: 'Failed to load your trip data',
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
    } finally {
      this.loading.set(false);
      await loader.dismiss();
    }
  }

  /** 🧮 Update dashboard stats from trips */
  private updateDashboardStats(trips: any[]) {
    console.log('%c[Dashboard] 📊 Updating stats...', 'color:#f59e0b;');
    const byCategoryObj: Record<string, number> = {};

    trips.forEach((trip) => {
      const category = trip.destination?.category || trip.category || 'Uncategorized';
      byCategoryObj[category] = (byCategoryObj[category] || 0) + 1;
    });

    this.byCategory.set(
      Object.keys(byCategoryObj).map((key) => ({
        name: key,
        count: byCategoryObj[key],
      }))
    );
    this.totalTrips.set(trips.length);
    this.featuredTrips.set(trips.filter((t) => t.featured).length);
    this.activeCategories.set(Object.keys(byCategoryObj).length);

    console.log('%c[Dashboard] ✅ Stats updated:', 'color:#10b981;', {
      totalTrips: this.totalTrips(),
      featuredTrips: this.featuredTrips(),
      activeCategories: this.activeCategories(),
      byCategory: this.byCategory(),
    });
  }

  /** 🥧 Category Chart Renderer */
  private renderCategoryChart() {
    if (!this.categoryCanvas) {
      console.warn('%c[Dashboard] ⚠️ Chart canvas not found.', 'color:#f87171;');
      return;
    }

    const ctx = this.categoryCanvas.nativeElement.getContext('2d');
    if (this.categoryChart) {
      console.log('%c[Dashboard] ♻️ Destroying old chart...', 'color:#fbbf24;');
      this.categoryChart.destroy();
    }

    const labels = this.byCategory().map((c) => c.name);
    const data = this.byCategory().map((c) => c.count);

    console.log('%c[Dashboard] 🧩 Chart Data:', 'color:#2563eb;', { labels, data });

    this.categoryChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            label: 'Your Trips by Category',
            data,
            backgroundColor: ['#4f46e5', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4'],
            borderColor: '#fff',
            borderWidth: 3,
            hoverOffset: 20,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#333', font: { size: 14 } },
          },
        },
        cutout: '65%',
        animation: { animateRotate: true, animateScale: true },
      },
    });

    console.log('%c[Dashboard] ✅ Chart rendered successfully!', 'color:#10b981; font-weight:bold;');
  }
}
