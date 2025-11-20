import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/Auth/auth.service'; 

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    const roles = this.auth.roles();
    console.log('🛡️ [AdminGuard] Roles during canActivate:', roles);

    if (roles.includes('ROLE_ADMIN')) {
      console.log('✅ AdminGuard: Access granted to admin route');
      return true;
    }

    if (roles.includes('ROLE_USER')) {
      console.warn('🚫 AdminGuard: Normal user detected — redirecting to /tabs/dashboard');
      return this.router.parseUrl('/tabs/dashboard');
    }

    console.warn('🚫 AdminGuard: Not logged in — redirecting to /login');
    return this.router.parseUrl('/login');
  }
}
