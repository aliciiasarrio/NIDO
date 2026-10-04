import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CatalogProduct } from '../models/nido.models';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  constructor(private http: HttpClient) {}

  getCatalog(query?: string, category?: string): Observable<CatalogProduct[]> {
    let url = '/api/catalog';
    const params: string[] = [];
    if (query) params.push(`query=${encodeURIComponent(query)}`);
    if (category) params.push(`category=${encodeURIComponent(category)}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    return this.http.get<CatalogProduct[]>(url);
  }
}
