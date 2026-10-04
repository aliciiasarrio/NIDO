import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ShoppingEntry, ShoppingEntryRequest, PurchaseEntryRequest } from '../models/nido.models';

@Injectable({
  providedIn: 'root'
})
export class ShoppingListService {
  constructor(private http: HttpClient) {}

  getShoppingList(householdId: number, status?: 'PENDING' | 'COMPLETED'): Observable<ShoppingEntry[]> {
    const url = status
      ? `/api/households/${householdId}/shopping-list?status=${status}`
      : `/api/households/${householdId}/shopping-list`;
    return this.http.get<ShoppingEntry[]>(url, { withCredentials: true });
  }

  addEntry(householdId: number, request: ShoppingEntryRequest): Observable<ShoppingEntry> {
    return this.http.post<ShoppingEntry>(`/api/households/${householdId}/shopping-list`, request, { withCredentials: true });
  }

  updateQuantity(householdId: number, entryId: number, quantity: number): Observable<ShoppingEntry> {
    return this.http.put<ShoppingEntry>(`/api/households/${householdId}/shopping-list/${entryId}/quantity`, { quantity }, { withCredentials: true });
  }

  deleteEntry(householdId: number, entryId: number): Observable<void> {
    return this.http.delete<void>(`/api/households/${householdId}/shopping-list/${entryId}`, { withCredentials: true });
  }

  purchaseEntry(householdId: number, entryId: number, request: PurchaseEntryRequest): Observable<ShoppingEntry> {
    return this.http.post<ShoppingEntry>(`/api/households/${householdId}/shopping-list/${entryId}/purchase`, request, { withCredentials: true });
  }
}
