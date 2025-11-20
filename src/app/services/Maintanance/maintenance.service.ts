import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, interval, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class MaintenanceService {
  private readonly api = `${environment.apiBaseUrl}/settings/maintenance`;
  private activeSubject = new BehaviorSubject<boolean>(false);
  active$ = this.activeSubject.asObservable();

  // 🧩 internal flag to prevent admin redirect after toggle
  private skipRedirectForAdmin = false;

  constructor(private http: HttpClient, private router: Router) {
    this.loadFromBackend();

    // 🔁 Poll backend every 10s
    interval(10000)
      .pipe(switchMap(() => this.fetchState()))
      .subscribe();
  }

  /** Fetch backend state */
  private fetchState() {
    return this.http.get<boolean>(this.api).pipe(
      catchError((err) => {
        console.warn('⚠️ Could not fetch maintenance state', err);
        return of(this.activeSubject.value);
      }),
      tap((isActive) => {
        const prev = this.activeSubject.value;
        this.activeSubject.next(isActive);

        const role = localStorage.getItem('role');
        const currentUrl = this.router.url;

        // 👑 Skip redirect if admin just toggled it
        if (this.skipRedirectForAdmin && role === 'ADMIN') {
          console.log('🛑 Skipping redirect (admin toggled it)');
          this.skipRedirectForAdmin = false;
          return;
        }

        // 🚧 Maintenance turned ON → redirect only normal users
        if (isActive && !prev && role !== 'ADMIN') {
          if (
            !currentUrl.includes('/maintenance') &&
            !currentUrl.includes('/login')
          ) {
            console.log('🚧 Maintenance ON → Redirecting USER');
            this.router.navigate(['/maintenance'], { replaceUrl: true });
          }
        }

        // ✅ Maintenance turned OFF → users come back
        if (!isActive && prev && role !== 'ADMIN') {
          const token = localStorage.getItem('token');
          console.log('✅ Maintenance OFF → Restoring access');
          if (token) {
            this.router.navigate(['/tabs/dashboard'], { replaceUrl: true });
          } else {
            this.router.navigate(['/login'], { replaceUrl: true });
          }
        }
      })
    );
  }

  /** Load state initially */
  loadFromBackend() {
    this.fetchState().subscribe();
  }

  /** Admin toggles maintenance */
  setMaintenance(active: boolean) {
    const role = localStorage.getItem('role');

    // mark if admin is toggling → prevent redirect loop
    if (role === 'ADMIN') {
      this.skipRedirectForAdmin = true;
    }

    return this.http.post<void>(this.api, { active }).pipe(
      catchError((err) => {
        console.error('❌ Failed to update maintenance mode', err);
        return of();
      }),
      tap(() => {
        this.activeSubject.next(active);

        if (role === 'ADMIN') {
          console.log(`👑 Admin toggled maintenance → ${active}`);
          // do not redirect admin ever
          return;
        }

        // users only
        if (active) {
          console.log('🚧 Maintenance ON → Redirecting user');
          this.router.navigate(['/maintenance'], { replaceUrl: true });
        } else {
          console.log('✅ Maintenance OFF → Restoring access');
          const token = localStorage.getItem('token');
          if (token) {
            this.router.navigate(['/tabs/dashboard'], { replaceUrl: true });
          } else {
            this.router.navigate(['/login'], { replaceUrl: true });
          }
        }
      })
    );
  }

  isActive(): boolean {
    return this.activeSubject.value;
  }
}
