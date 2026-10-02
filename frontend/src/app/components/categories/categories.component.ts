import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header>
      <h1>NIDO</h1>
      <p>Tu casa, organizada. Encuentra lo que tienes y dónde lo guardas.</p>
    </header>

    <main>
      <h2>Categorías</h2>

      @if (loading()) {
        <p>Cargando categorías…</p>
      } @else if (error()) {
        <p>No se pudieron cargar las categorías</p>
        <button (click)="loadCategories()">Reintentar</button>
      } @else if (categories().length === 0) {
        <p>Todavía no hay categorías</p>
      } @else {
        <ul>
          @for (category of categories(); track category.id) {
            <li>{{ category.name }}</li>
          }
        </ul>
      }
    </main>
  `,
  styles: [`
    :host {
      display: block;
      padding: 1rem;
      font-family: system-ui, -apple-system, sans-serif;
    }
    header {
      margin-bottom: 2rem;
    }
    h1 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }
    p {
      margin: 0;
      color: #666;
    }
    ul {
      list-style-type: none;
      padding: 0;
    }
    li {
      padding: 0.75rem;
      margin-bottom: 0.5rem;
      background-color: #f8f9fa;
      border-radius: 6px;
      border: 1px solid #eee;
    }
    button {
      padding: 0.5rem 1rem;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  `]
})
export class CategoriesComponent implements OnInit {
  private categoryService = inject(CategoryService);

  categories = signal<Category[]>([]);
  loading = signal<boolean>(false);
  error = signal<boolean>(false);

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.error.set(false);
    
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }
}
