import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './explore.page.html',
  styleUrls: ['./explore.page.scss'],
})
export class ExplorePage implements OnInit {
  segment = 'all';
  categories: string[] = []; // includes admin-added categories
  destinations: any[] = [];
  filtered: any[] = [];
  loading = false;

  // ✅ API endpoints
  private tripsApi = 'http://localhost:8080/api/trips/feed'; // returns approved only
  private destinationsApi = 'http://localhost:8080/api/destinations'; // includes admin-added categories

  constructor(private http: HttpClient, private toastCtrl: ToastController) {}

  ngOnInit() {
    this.loadExploreFeed();
  }

  /** 🔁 Load approved trips + admin-added destinations */
  async loadExploreFeed() {
    this.loading = true;
    try {
      const token = localStorage.getItem('token');
      let headers = new HttpHeaders();
      if (token) headers = headers.set('Authorization', `Bearer ${token}`);

      // Fetch both datasets
      const [trips, adminDestinations] = await Promise.all([
        this.http.get<any[]>(this.tripsApi, { headers }).toPromise(),
        this.http.get<any[]>(this.destinationsApi, { headers }).toPromise(),
      ]);

      // ✅ Approved trips
      const approvedTrips = (trips || [])
        .filter((t) => t.approved === true)
        .map((t) => ({
          id: 'trip-' + t.id,
          name: t.destination?.name || t.title || '',
          category: t.destination?.category?.trim() || '',
          description: t.caption || '',
          imageUrl:
            t.imageUrls?.[0] || t.imageUrl || 'assets/images/default-trip.jpg',
          rating: t.rating ?? 0,
          featured: t.featured ?? false,
          source: 'trip',
        }));

      // ✅ Admin destinations
      const publicDestinations = (adminDestinations || [])
        .filter((d) => !!d.name?.trim())
        .map((d) => ({
          id: 'dest-' + d.id,
          name: d.name.trim(),
          category: d.category?.trim() || '',
          description: d.description || '',
          imageUrl: d.imageUrl || 'assets/images/default-trip.jpg',
          rating: d.rating ?? 0,
          featured: d.featured ?? false,
          source: 'destination',
        }));

      // ✅ Merge both (remove duplicates by name)
      const merged = [...approvedTrips, ...publicDestinations];
      const uniqueByName = merged.filter(
        (value, index, self) =>
          index ===
          self.findIndex(
            (t) => t.name?.toLowerCase() === value.name?.toLowerCase()
          )
      );

      this.destinations = uniqueByName;

      // ✅ Collect all unique categories
      const categorySet = new Set<string>();
      (adminDestinations || []).forEach((d) => {
        if (d.category?.trim()) categorySet.add(d.category.toLowerCase());
      });
      this.destinations.forEach((t) => {
        if (t.category?.trim()) categorySet.add(t.category.toLowerCase());
      });

      this.categories = Array.from(categorySet).sort();

      // ✅ Apply filter for “All” initially
      this.segment = 'all';
      this.applyFilter();
    } catch (err) {
      console.error('[Explore] ❌ Failed to load explore feed:', err);
      const toast = await this.toastCtrl.create({
        message: 'Failed to load explore feed',
        duration: 1500,
        color: 'danger',
      });
      await toast.present();
    } finally {
      this.loading = false;
    }
  }

  /** ✅ Apply filter logic */
  applyFilter() {
    if (this.segment === 'all') {
      this.filtered = this.destinations;
    } else {
      this.filtered = this.destinations.filter(
        (d) => d.category?.toLowerCase() === this.segment.toLowerCase()
      );
    }
  }

  segmentChanged(event: any) {
    this.segment = event.detail.value;
    this.applyFilter();
  }

  onImageError(event: any) {
    event.target.src = 'assets/images/default-trip.jpg';
  }

  getCategoryColor(category: string): string {
    switch (category?.toLowerCase()) {
      case 'beach':
        return 'tertiary';
      case 'mountain':
        return 'success';
      case 'city':
        return 'primary';
      case 'heritage':
        return 'warning';
      default:
        return 'medium';
    }
  }
}
