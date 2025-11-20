import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { MaintenanceService } from '../services/Maintanance/maintenance.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MaintenanceGuard implements CanActivate {
  constructor(private maintenance: MaintenanceService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.maintenance.active$.pipe(
      map((active) => {
        const role = localStorage.getItem('role');
        const currentUrl = this.router.url;

        // 👑 Admin always allowed
        if (role === 'ADMIN') return true;

        // 🧍 User blocked only when maintenance ON
        if (active && !currentUrl.includes('/maintenance')) {
          this.router.navigate(['/maintenance'], { replaceUrl: true });
          return false;
        }

        return true;
      })
    );
  }
}
