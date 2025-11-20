import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../Auth/auth.service';
import { Observable, tap } from 'rxjs';
import { TripSignalService } from './trip-signal.service';

@Injectable({ providedIn: 'root' })
export class TripService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private tripSignal = inject(TripSignalService);
  private baseUrl = `${environment.apiBaseUrl}/trips`;
  private dashboardUrl = `${environment.apiBaseUrl}/dashboard`;

  /** 🔐 Generate JWT headers */
  private getAuthHeaders(json = true): HttpHeaders {
    const token = this.auth.getToken();
    let headers = new HttpHeaders();
    if (json) headers = headers.set('Content-Type', 'application/json');
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  // 🌍 =============================
  // USER / PUBLIC ENDPOINTS
  // =============================

  /** 🧭 Public feed (approved trips only) */
  getFeed(): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.baseUrl}/feed`, { headers: this.getAuthHeaders() })
      .pipe(tap((res) => this.tripSignal.setTrips(res)));
  }

  /** 👤 Logged-in user's trips */
  getMyTrips(): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.baseUrl}/me`, { headers: this.getAuthHeaders() })
      .pipe(tap((res) => this.tripSignal.setTrips(res)));
  }

  /** ➕ Create new trip */
  createTrip(payload: any): Observable<any> {
    return this.http
      .post<any>(this.baseUrl, payload, { headers: this.getAuthHeaders() })
      .pipe(
        tap((trip) => {
          this.tripSignal.addTrip({
            ...trip,
            image:
              trip.imageUrls?.[0] ??
              'assets/sample-destination.jpg',
          });
        })
      );
  }

  /** ✏️ Update trip */
  updateTrip(id: number, payload: any): Observable<any> {
    return this.http
      .put<any>(`${this.baseUrl}/${id}`, payload, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        tap((trip) => {
          this.tripSignal.updateTrip({
            ...trip,
            image:
              trip.imageUrls?.[0] ??
              'assets/sample-destination.jpg',
          });
        })
      );
  }

  /** ❌ Delete trip */
  deleteTrip(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/${id}`, { headers: this.getAuthHeaders() })
      .pipe(tap(() => this.tripSignal.removeTrip(id)));
  }

  // 👑 =============================
  // ADMIN ENDPOINTS
  // =============================

  /** 📋 Get all trips (admin dashboard view) */
  getAllTripsForAdmin(): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.baseUrl}/admin/all`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(tap((res) => this.tripSignal.setTrips(res)));
  }

  /** ✅ Approve or unapprove a trip */
  approveTrip(id: number, approved: boolean): Observable<any> {
    return this.http
      .post<any>(
        `${this.baseUrl}/admin/${id}/approve`,
        { approved },
        { headers: this.getAuthHeaders() }
      )
      .pipe(tap((trip) => this.tripSignal.updateTrip(trip)));
  }

  /** 🌟 Feature / unfeature a trip */
  setFeatured(id: number, featured: boolean): Observable<any> {
    return this.http
      .post<any>(
        `${this.baseUrl}/admin/${id}/feature?featured=${featured}`,
        {},
        { headers: this.getAuthHeaders() }
      )
      .pipe(tap((trip) => this.tripSignal.updateTrip(trip)));
  }

  /** 🔍 Get trip by ID */
  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // 📊 =============================
  // DASHBOARD ENDPOINTS
  // =============================

  /** 👤 User dashboard stats */
  getUserDashboard(): Observable<any> {
    return this.http.get<any>(`${this.dashboardUrl}/user`, {
      headers: this.getAuthHeaders(),
    });
  }

  /** 👑 Admin dashboard stats */
  getAdminDashboard(): Observable<any> {
    return this.http.get<any>(`${this.dashboardUrl}/admin`, {
      headers: this.getAuthHeaders(),
    });
  }

  /** Generic admin GET utility */
  httpGet(path: string): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}${path}`, {
      headers: this.getAuthHeaders(),
    });
  }
}
