import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Location, LocationRequest } from '../models/nido.models';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  constructor(private http: HttpClient) {}

  getLocations(householdId: number, includeArchived = false): Observable<Location[]> {
    return this.http.get<Location[]>(`/api/households/${householdId}/locations?includeArchived=${includeArchived}`, { withCredentials: true });
  }

  createLocation(householdId: number, request: LocationRequest): Observable<Location> {
    return this.http.post<Location>(`/api/households/${householdId}/locations`, request, { withCredentials: true });
  }

  updateLocation(householdId: number, locationId: number, request: LocationRequest): Observable<Location> {
    return this.http.put<Location>(`/api/households/${householdId}/locations/${locationId}`, request, { withCredentials: true });
  }

  archiveLocation(householdId: number, locationId: number): Observable<void> {
    return this.http.delete<void>(`/api/households/${householdId}/locations/${locationId}`, { withCredentials: true });
  }
}
