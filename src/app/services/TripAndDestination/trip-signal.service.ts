import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TripSignalService {
  private _trips = signal<any[]>([]);
  public trips = computed(() => this._trips());

  /** ✅ Derived Signals for dashboard */
  totalTrips = computed(() => this._trips().length);
  approvedCount = computed(() => this._trips().filter(t => t.approved).length);
  featuredCount = computed(() => this._trips().filter(t => t.featured).length);
  pendingCount = computed(() => this._trips().filter(t => !t.approved).length);

  /** ✅ Replace entire list */
  setTrips(newTrips: any[]) {
    this._trips.set(newTrips);
    console.log('✅ [TripSignalService] Trips updated:', newTrips.length);
  }

  /** ✅ Add a trip */
  addTrip(trip: any) {
    this._trips.set([trip, ...this._trips()]);
    console.log('🆕 [TripSignalService] Trip added:', trip.title);
  }

  /** ✅ Update an existing trip */
  updateTrip(updated: any) {
    this._trips.set(
      this._trips().map((t) => (t.id === updated.id ? updated : t))
    );
    console.log('♻️ [TripSignalService] Trip updated:', updated.title);
  }

  /** ✅ Remove a trip */
  removeTrip(id: number) {
    this._trips.set(this._trips().filter((t) => t.id !== id));
    console.log('❌ [TripSignalService] Trip removed:', id);
  }

  /** ✅ Get trip by ID */
  getTripById(id: number) {
    return this._trips().find((t) => t.id === id);
  }
}
