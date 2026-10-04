import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Household, HouseholdRequest, InvitationResponse } from '../models/nido.models';

@Injectable({
  providedIn: 'root'
})
export class HouseholdService {
  private readonly baseUrl = '/api/households';

  readonly households = signal<Household[]>([]);
  readonly activeHousehold = signal<Household | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly showModal = signal<boolean>(false);

  constructor(private http: HttpClient) {}

  openHouseholdModal() {
    this.showModal.set(true);
  }

  closeHouseholdModal() {
    this.showModal.set(false);
  }

  loadHouseholds(): Observable<Household[]> {
    this.isLoading.set(true);
    return this.http.get<Household[]>(this.baseUrl, { withCredentials: true }).pipe(
      tap(list => {
        this.households.set(list);
        this.isLoading.set(false);
        if (list.length > 0 && !this.activeHousehold()) {
          // Restore selected household from localStorage or pick first
          const savedId = localStorage.getItem('nido_active_household_id');
          const found = list.find(h => h.id.toString() === savedId);
          this.setActiveHousehold(found || list[0]);
        }
      })
    );
  }

  setActiveHousehold(household: Household) {
    this.activeHousehold.set(household);
    localStorage.setItem('nido_active_household_id', household.id.toString());
  }

  createHousehold(request: HouseholdRequest): Observable<Household> {
    return this.http.post<Household>(this.baseUrl, request, { withCredentials: true }).pipe(
      tap(created => {
        this.households.update(prev => [...prev, created]);
        this.setActiveHousehold(created);
      })
    );
  }

  joinHousehold(code: string): Observable<Household> {
    return this.http.post<Household>(`${this.baseUrl}/join`, { code }, { withCredentials: true }).pipe(
      tap(joined => {
        this.households.update(prev => [...prev, joined]);
        this.setActiveHousehold(joined);
      })
    );
  }

  createInvitation(householdId: number): Observable<InvitationResponse> {
    return this.http.post<InvitationResponse>(`${this.baseUrl}/${householdId}/invitations`, {}, { withCredentials: true });
  }

  populateStarterData(householdId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/${householdId}/populate`, {}, { withCredentials: true });
  }
}
