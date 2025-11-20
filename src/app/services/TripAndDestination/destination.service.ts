import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../Auth/auth.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DestinationService {
  private baseUrl = `${environment.apiBaseUrl}/destinations`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  /** 🔐 Generate JWT headers */
  private getAuthHeaders(json = true): HttpHeaders {
    const token = this.auth.getToken();
    let headers = new HttpHeaders();
    if (json) headers = headers.set('Content-Type', 'application/json');
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  // 🌍 =============================
  // PUBLIC / ADMIN DESTINATIONS
  // =============================

  /** Get all destinations */
  list(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl, {
      headers: this.getAuthHeaders(),
    });
  }

  /** Get destination by ID */
  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  /** ➕ Create destination (supports image upload) */
  create(destination: any, file?: File): Observable<any> {
    if (file) {
      const formData = new FormData();
      formData.append('name', destination.name || '');
      formData.append('category', destination.category || '');
      if (destination.description)
        formData.append('description', destination.description);
      formData.append('file', file);

      return this.http.post<any>(`${this.baseUrl}/upload`, formData, {
        headers: this.getAuthHeaders(false),
      });
    }

    return this.http.post<any>(this.baseUrl, destination, {
      headers: this.getAuthHeaders(),
    });
  }

  /** ✏️ Update destination (auto-detect file upload) */
  update(id: number, destination: any, file?: File): Observable<any> {
    if (file) {
      const formData = new FormData();
      formData.append('name', destination.name || '');
      formData.append('category', destination.category || '');
      if (destination.description)
        formData.append('description', destination.description);
      formData.append('file', file);

      return this.http.put<any>(`${this.baseUrl}/upload/${id}`, formData, {
        headers: this.getAuthHeaders(false),
      });
    }

    return this.http.put<any>(`${this.baseUrl}/${id}`, destination, {
      headers: this.getAuthHeaders(),
    });
  }
  listUniqueCategories() {
  return this.http.get<string[]>(`${this.baseUrl}/categories`);
}


  /** 🗑️ Delete destination */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }
}
