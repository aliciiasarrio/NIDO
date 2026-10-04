import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item, ItemRequest, MovementRequest, MovementResponse } from '../models/nido.models';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  constructor(private http: HttpClient) {}

  getItems(householdId: number, includeArchived = false): Observable<Item[]> {
    return this.http.get<Item[]>(`/api/households/${householdId}/items?includeArchived=${includeArchived}`, { withCredentials: true });
  }

  getItemById(householdId: number, itemId: number): Observable<Item> {
    return this.http.get<Item>(`/api/households/${householdId}/items/${itemId}`, { withCredentials: true });
  }

  createItem(householdId: number, request: ItemRequest): Observable<Item> {
    return this.http.post<Item>(`/api/households/${householdId}/items`, request, { withCredentials: true });
  }

  updateItem(householdId: number, itemId: number, request: ItemRequest): Observable<Item> {
    return this.http.put<Item>(`/api/households/${householdId}/items/${itemId}`, request, { withCredentials: true });
  }

  deleteItem(householdId: number, itemId: number, permanent = true): Observable<void> {
    return this.http.delete<void>(`/api/households/${householdId}/items/${itemId}?archiveOnly=${!permanent}`, { withCredentials: true });
  }

  archiveItem(householdId: number, itemId: number): Observable<void> {
    return this.http.delete<void>(`/api/households/${householdId}/items/${itemId}?archiveOnly=true`, { withCredentials: true });
  }

  recordClothingWorn(householdId: number, itemId: number): Observable<void> {
    return this.http.post<void>(`/api/households/${householdId}/items/${itemId}/wear`, {}, { withCredentials: true });
  }

  recordMovement(householdId: number, itemId: number, request: MovementRequest): Observable<MovementResponse> {
    return this.http.post<MovementResponse>(`/api/households/${householdId}/items/${itemId}/movements`, request, { withCredentials: true });
  }

  getItemMovements(householdId: number, itemId: number): Observable<MovementResponse[]> {
    return this.http.get<MovementResponse[]>(`/api/households/${householdId}/items/${itemId}/movements`, { withCredentials: true });
  }
}
