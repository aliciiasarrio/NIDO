import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardSummary, RecipeRecommendation } from '../models/nido.models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private http: HttpClient) {}

  getSummary(householdId: number, unwornDays = 90): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`/api/households/${householdId}/dashboard/summary?unwornDays=${unwornDays}`, { withCredentials: true });
  }

  getRecipeRecommendations(householdId: number): Observable<RecipeRecommendation[]> {
    return this.http.get<RecipeRecommendation[]>(`/api/households/${householdId}/recipes/recommendations`, { withCredentials: true });
  }
}
