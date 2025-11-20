import { Component, OnInit, signal, ElementRef, ViewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonicModule,
  LoadingController,
  ToastController,
  AlertController,
} from '@ionic/angular';
import { Chart, registerables } from 'chart.js';
import { Router } from '@angular/router';

import { TripService } from 'src/app/services/TripAndDestination/trip.service';
import { DestinationService } from 'src/app/services/TripAndDestination/destination.service';
import { TripSignalService } from 'src/app/services/TripAndDestination/trip-signal.service';
import { AuthService } from 'src/app/services/Auth/auth.service';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
})
export class AdminDashboardPage implements OnInit {
  // 📊 Data signals
  loading = signal(false);
  totalTrips = signal(0);
  approvedTrips = signal(0);
  featuredTrips = signal(0);
  pendingTrips = signal(0);
  destinationsCount = signal(0);
  topDestinations = signal<{ name: string; tripCount: number }[]>([]);

  // 🎨 Chart references
  @ViewChild('barCanvas') barCanvas!: ElementRef;
  @ViewChild('pieCanvas') pieCanvas!: ElementRef;

  private barChart!: Chart;
  private pieChart!: Chart;

  constructor(
    private tripService: TripService,
    private destService: DestinationService,
    private tripSignal: TripSignalService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private authService: AuthService,
    private router: Router
  ) {
    // 👀 Auto-update dashboard whenever trips change globally
    effect(() => {
      const trips = this.tripSignal.trips();
      console.log('%c[AdminDashboard] 🔁 Trips changed:', 'color:#06b6d4;', trips.length);

      this.approvedTrips.set(trips.filter((t) => t.approved).length);
      this.featuredTrips.set(trips.filter((t) => t.featured).length);
      this.pendingTrips.set(trips.filter((t) => !t.approved).length);
      this.totalTrips.set(trips.length);

      // ✅ Update top destinations reactively
      this.refreshTopDestinations(trips);

      // ✅ Re-render charts dynamically
      setTimeout(() => {
        this.createBarChart(this.topDestinations());
        this.createPieChart();
      }, 250);
    });
  }

  async ngOnInit() {
    console.log('%c[AdminDashboard] 🚀 ngOnInit started', 'color:#4f46e5;');
    await this.loadDashboardData();
  }

  /** 🔁 Load dashboard analytics initially */
  async loadDashboardData() {
    this.loading.set(true);
    const loader = await this.loadingCtrl.create({
      message: 'Loading admin dashboard...',
      spinner: 'crescent',
    });
    await loader.present();

    try {
      console.log('%c[AdminDashboard] 🌍 Fetching trips...', 'color:#3b82f6;');
      const trips = (await this.tripService.getAllTripsForAdmin().toPromise()) ?? [];
      this.tripSignal.setTrips(trips); // ✅ Store globally (triggers effect)

      console.log('%c[AdminDashboard] 🧭 Fetching destinations...', 'color:#0ea5e9;');
      const destinations = (await this.destService.list().toPromise()) ?? [];
      this.destinationsCount.set(destinations.length);

      this.refreshTopDestinations(trips, destinations);
    } catch (err) {
      console.error('%c[AdminDashboard] ❌ Error:', 'color:#dc2626;', err);
      const toast = await this.toastCtrl.create({
        message: 'Failed to load dashboard data',
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
    } finally {
      this.loading.set(false);
      await loader.dismiss();
    }
  }

  /** 🏆 Compute Top 5 Destinations */
  private async refreshTopDestinations(trips: any[], destList?: any[]) {
    console.log('%c[AdminDashboard] 🧮 Recalculating top destinations...', 'color:#f59e0b;');
    const destinations = destList ?? (await this.destService.list().toPromise()) ?? [];

    const top = destinations
      .map((d: any) => ({
        name: d.name,
        tripCount: trips.filter((t) => t.destination?.id === d.id).length,
      }))
      .filter((d) => d.tripCount > 0)
      .sort((a, b) => b.tripCount - a.tripCount)
      .slice(0, 5);

    this.topDestinations.set(top);
    console.log('%c[AdminDashboard] 🏆 Top Destinations:', 'color:#22c55e;', top);
  }

  /** 📊 Bar Chart — Trips per Destination */
  private createBarChart(data: any[]) {
    if (!this.barCanvas) return;
    if (this.barChart) this.barChart.destroy();

    const ctx = this.barCanvas.nativeElement;
    const labels = data.map((d) => d.name);
    const counts = data.map((d) => d.tripCount);

    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Trips Count',
            data: counts,
            backgroundColor: '#3b82f6',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } },
      },
    });
    console.log('%c[AdminDashboard] 📊 Bar chart updated', 'color:#4ade80;');
  }

  /** 🥧 Pie Chart — Trip Status Distribution */
  private createPieChart() {
    if (!this.pieCanvas) return;
    if (this.pieChart) this.pieChart.destroy();

    const approved = this.approvedTrips();
    const featured = this.featuredTrips();
    const pending = this.pendingTrips();

    this.pieChart = new Chart(this.pieCanvas.nativeElement, {
      type: 'pie',
      data: {
        labels: ['Approved', 'Featured', 'Pending'],
        datasets: [
          {
            data: [approved, featured, pending],
            backgroundColor: ['#2dd36f', '#ffc409', '#eb445a'],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
      },
    });
    console.log('%c[AdminDashboard] 🥧 Pie chart updated', 'color:#eab308;');
  }

  /** 🚪 Logout Confirmation */
  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Logout',
      message: 'Are you sure you want to log out?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Logout',
          handler: async () => {
            this.authService.logout();
            const toast = await this.toastCtrl.create({
              message: 'Logged out successfully',
              duration: 1500,
              color: 'medium',
            });
            await toast.present();
            this.router.navigateByUrl('/login', { replaceUrl: true });
          },
        },
      ],
    });
    await alert.present();
  }
}
