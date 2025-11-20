import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service'; 

@Injectable({ providedIn: 'root' })
export class TabsGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    const roles = this.auth.roles();
    console.log('🛡️ [TabsGuard] Checking roles:', roles);

    if (roles.includes('ROLE_ADMIN')) {
      console.warn('🚫 TabsGuard: Admin tried to access /tabs → redirecting to /admin/dashboard');
      return this.router.parseUrl('/admin/dashboard');
    }

    if (roles.includes('ROLE_USER')) {
      console.log('✅ TabsGuard: Normal user allowed inside /tabs');
      return true;
    }

    console.warn('🚫 TabsGuard: No roles → redirecting to /login');
    return this.router.parseUrl('/login');
  }
}
