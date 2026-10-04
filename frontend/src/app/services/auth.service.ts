import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { User, LoginRequest, RegisterRequest } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = '/api/auth';
  
  readonly currentUser = signal<User | null>(null);
  readonly isLoading = signal<boolean>(true);

  constructor(private http: HttpClient) {
    this.checkSession().subscribe();
  }

  checkSession(): Observable<User | null> {
    this.isLoading.set(true);
    return this.http.get<User>(`${this.baseUrl}/me`, { withCredentials: true }).pipe(
      tap(user => {
        this.currentUser.set(user);
        this.isLoading.set(false);
      }),
      catchError(() => {
        this.currentUser.set(null);
        this.isLoading.set(false);
        return of(null);
      })
    );
  }

  register(data: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/register`, data, { withCredentials: true });
  }

  login(data: LoginRequest): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/login`, data, { withCredentials: true }).pipe(
      tap(user => this.currentUser.set(user))
    );
  }

  logout(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => this.currentUser.set(null))
    );
  }
}
