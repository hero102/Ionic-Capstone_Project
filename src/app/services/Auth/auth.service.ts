import { Injectable, signal, ApplicationRef, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
} from '@angular/router';
import { environment } from '../../../environments/environment';
import { decodeJwt } from './token.util';
import { firstValueFrom } from 'rxjs';
import { MaintenanceService } from '../Maintanance/maintenance.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = environment.apiBaseUrl;

  // ✅ Signals for reactive state
  user = signal<any | null>(null);
  isLoggedIn = signal(false);
  roles = signal<string[]>([]);

  private navigating = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private appRef: ApplicationRef,
    private maintenanceService: MaintenanceService
  ) {
    console.log('🚀 [AuthService] Initialized...');

    // 🧭 Router Logs
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart)
        console.log('➡️ [Router] NavigationStart →', event.url);
      if (event instanceof NavigationEnd)
        console.log('✅ [Router] NavigationEnd →', event.url);
      if (event instanceof NavigationCancel)
        console.warn('⛔ [Router] NavigationCancel →', event.url);
      if (event instanceof NavigationError)
        console.error('💥 [Router] NavigationError →', event.url, event.error);
    });

    // 🔁 Restore Session
    const token = this.getToken();
    if (token) {
      console.log('🔁 Found saved token, restoring session...');
      this.restoreSession(token);
    } else {
      console.log('🧾 No token found — new session.');
    }

    // ⚡ Maintenance Mode Auto Redirect
    effect(() => {
      const active = this.maintenanceService.isActive();
      const loggedIn = this.isLoggedIn();
      const admin = this.isAdmin();

      if (active && loggedIn && !admin) {
        console.warn('⚠️ Maintenance active — redirecting user...');
        this.router.navigateByUrl('/maintenance', { replaceUrl: true });
      }

      if (!active && loggedIn) {
        const currentUrl = this.router.url;
        if (currentUrl.includes('/maintenance')) {
          if (this.isAdmin()) {
            this.router.navigateByUrl('/admin/dashboard', { replaceUrl: true });
          } else {
            this.router.navigateByUrl('/tabs/dashboard', { replaceUrl: true });
          }
        }
      }
    });
  }

  // ===============================
  // 🔐 AUTH CALLS
  // ===============================

  login(credentials: any) {
    console.log('📩 [AuthService] Sending login request →', credentials.email);
    return this.http.post<any>(`${this.api}/auth/login`, credentials);
  }

  register(data: any) {
    console.log('🧑‍💻 [AuthService] Sending registration request →', data.email);
    return this.http.post<any>(`${this.api}/auth/register`, data);
  }

  // ===============================
  // 💾 SAVE SESSION + REDIRECT
  // ===============================
  async saveSession(authResponse: any) {
    if (!authResponse?.token) return;

    const roles: string[] = Array.isArray(authResponse.roles)
      ? authResponse.roles
      : authResponse.roles
      ? [authResponse.roles]
      : [];

    // ✅ Store token and user info including user ID
    localStorage.setItem('tripquest_token', authResponse.token);
    localStorage.setItem(
      'tripquest_user',
      JSON.stringify({
        id: authResponse.id, // 👈 include user ID here
        email: authResponse.email,
        name: authResponse.name,
        roles,
      })
    );

    this.user.set({
      id: authResponse.id,
      email: authResponse.email,
      name: authResponse.name,
      roles,
    });
    this.roles.set(roles);
    this.isLoggedIn.set(true);

    console.log('✅ Session saved. Roles:', roles);

    await firstValueFrom(this.appRef.isStable);

    if (this.navigating) {
      console.warn('⚠️ Navigation already in progress — skipping redirect.');
      return;
    }
    this.navigating = true;

    try {
      const currentRoles = this.roles();
      if (currentRoles.includes('ROLE_ADMIN')) {
        console.log('🧑‍💼 Redirect → /admin/dashboard');
        await this.router.navigateByUrl('/admin/dashboard', { replaceUrl: true });
      } else if (currentRoles.includes('ROLE_USER')) {
        console.log('👤 Redirect → /tabs/dashboard');
        await this.router.navigateByUrl('/tabs/dashboard', { replaceUrl: true });
      } else {
        console.warn('⚠️ Unknown role — redirecting to /login');
        await this.router.navigateByUrl('/login', { replaceUrl: true });
      }
    } catch (err) {
      console.error('❌ Redirect failed:', err);
    } finally {
      this.navigating = false;
    }
  }

  // ===============================
  // 🔁 RESTORE EXISTING SESSION
  // ===============================
  private restoreSession(token: string) {
    console.group('♻️ [AuthService] Restoring Session');
    try {
      const decoded = decodeJwt(token);
      const saved = JSON.parse(localStorage.getItem('tripquest_user') || '{}');

      const roles =
        saved?.roles?.length > 0
          ? saved.roles
          : decoded?.roles
          ? decoded.roles
          : [];

      this.user.set(saved || decoded || null);
      this.roles.set(roles);
      this.isLoggedIn.set(true);

      console.log('✅ Session restored. Roles:', roles);
    } catch (e) {
      console.error('💥 [AuthService] Failed to restore session:', e);
      this.logout();
    }
    console.groupEnd();
  }

  // ===============================
  // 🧰 UTILITIES
  // ===============================
  getToken() {
    return localStorage.getItem('tripquest_token');
  }

  getUser() {
    try {
      const data = localStorage.getItem('tripquest_user');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('[AuthService] Failed to parse user from storage:', e);
      return null;
    }
  }

  logout() {
    console.log('🚪 [AuthService] Logging out...');
    localStorage.removeItem('tripquest_token');
    localStorage.removeItem('tripquest_user');
    this.user.set(null);
    this.roles.set([]);
    this.isLoggedIn.set(false);

    console.log('🧹 Cleared session data.');
    this.router.navigate(['/login']);
  }

  // ===============================
  // 🧩 ROLE HELPERS
  // ===============================
  isAdmin() {
    return this.roles().includes('ROLE_ADMIN');
  }

  isUser() {
    return this.roles().includes('ROLE_USER');
  }
}
