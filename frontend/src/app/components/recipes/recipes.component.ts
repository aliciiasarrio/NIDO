import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { ShoppingListService } from '../../services/shopping-list.service';
import { HouseholdService } from '../../services/household.service';
import { RecipeRecommendation } from '../../models/nido.models';
import { ProductImageService } from '../../services/product-image.service';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="recipes-page">
      <div *ngIf="!householdService.activeHousehold()" class="card text-center p-4">
        <p>Selecciona un hogar para ver las recomendaciones de cocina.</p>
        <button class="btn btn-primary btn-sm mt-3" (click)="householdService.openHouseholdModal()">
          Crear o unirse a un hogar
        </button>
      </div>

      <div *ngIf="householdService.activeHousehold()">
        <header class="page-header">
          <div>
            <h1>Recomendaciones de Recetas</h1>
            <p class="subtitle">Aprovecha lo que ya tienes en casa y da prioridad a lo que va a caducar</p>
          </div>
        </header>

        <div *ngIf="successMessage()" class="alert alert-success">{{ successMessage() }}</div>

        <!-- Recipes Grid -->
        <div class="recipes-grid">
          <div *ngFor="let rec of recommendations()" class="recipe-card card">
            <div class="recipe-top">
              <div class="recipe-header-left">
                <div class="recipe-thumbnail-container" [title]="rec.title">
                  <img [src]="productImageService.getImage(rec.title, 'Alimentos')" [alt]="rec.title" class="recipe-thumbnail" />
                </div>
                <div>
                  <h3>{{ rec.title }}</h3>
                  <span class="cook-time">Tiempo: {{ rec.cookingTimeMinutes }} min</span>
                </div>
              </div>
              <div class="affinity-badge" [class.high]="rec.matchPercentage >= 75" [class.med]="rec.matchPercentage >= 40 && rec.matchPercentage < 75">
                {{ rec.matchPercentage }}% disponible
              </div>
            </div>

            <p class="recipe-desc">{{ rec.description }}</p>

            <div *ngIf="rec.hasExpiringIngredients" class="expiring-alert">
              Contiene ingredientes próximos a caducar. Consumir con prioridad.
            </div>

            <!-- Ingredients sections -->
            <div class="ingredients-box">
              <div class="ing-section" *ngIf="rec.availableIngredients.length > 0">
                <span class="ing-title">En tu despensa:</span>
                <div class="ing-tags">
                  <span *ngFor="let ing of rec.availableIngredients" class="badge badge-success">{{ ing }}</span>
                </div>
              </div>

              <div class="ing-section" *ngIf="rec.missingIngredients.length > 0">
                <span class="ing-title">Ingredientes faltantes:</span>
                <div class="ing-tags">
                  <span *ngFor="let ing of rec.missingIngredients" class="badge badge-warning">{{ ing }}</span>
                </div>
              </div>
            </div>

            <div class="card-footer" *ngIf="rec.missingIngredients.length > 0">
              <button class="btn btn-sm btn-outline-primary w-100" (click)="addMissingToShopping(rec)">
                Añadir faltantes a la lista de compra
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .recipes-page {
      max-width: 1280px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }

    .page-header {
      margin-bottom: 2rem;
      .subtitle { color: var(--color-text-muted); }
    }

    .recipes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 1.5rem;
    }

    .recipe-card {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 1.75rem;

      .recipe-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1rem;
        gap: 0.75rem;

        .recipe-header-left {
          display: flex;
          align-items: center;
          gap: 0.85rem;

          .recipe-thumbnail-container {
            flex-shrink: 0;
            width: 48px;
            height: 48px;
            border-radius: var(--radius-md);
            overflow: hidden;
            background: #ffffff;
            border: 1px solid rgba(0, 0, 0, 0.08);
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.04);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s ease;

            &:hover {
              transform: scale(1.08);
            }

            .recipe-thumbnail {
              width: 100%;
              height: 100%;
              object-fit: contain;
              padding: 2px;
            }
          }

          h3 { font-size: 1.15rem; margin-bottom: 0.2rem; }
          .cook-time { font-size: 0.825rem; font-weight: 600; color: var(--color-text-muted); }
        }

        .affinity-badge {
          font-size: 0.8rem;
          font-weight: 700;
          padding: 0.3rem 0.65rem;
          border-radius: var(--radius-pill);
          background: #ffebee;
          color: #c62828;
          white-space: nowrap;

          &.high { background: #e8f5e9; color: #2e7d32; }
          &.med { background: #fff3e0; color: #ef6c00; }
        }
      }

      .recipe-desc { font-size: 0.9rem; color: var(--color-text-muted); margin-bottom: 0.75rem; }

      .expiring-alert {
        background: var(--color-danger-bg);
        color: var(--color-danger);
        padding: 0.5rem 0.75rem;
        border-radius: var(--radius-sm);
        font-size: 0.8rem;
        font-weight: 600;
        margin-bottom: 1rem;
      }

      .ingredients-box {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-bottom: 1.25rem;

        .ing-section {
          .ing-title {
            font-size: 0.8rem;
            font-weight: 700;
            color: var(--color-text-muted);
            display: block;
            margin-bottom: 0.35rem;
          }

          .ing-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.35rem;
          }
        }
      }

      .card-footer {
        margin-top: auto;
      }
    }

    .w-100 { width: 100%; }
  `]
})
export class RecipesComponent {
  recommendations = signal<RecipeRecommendation[]>([]);
  successMessage = signal<string>('');

  constructor(
    public householdService: HouseholdService,
    private dashboardService: DashboardService,
    private shoppingService: ShoppingListService,
    public productImageService: ProductImageService
  ) {
    effect(() => {
      const active = this.householdService.activeHousehold();
      if (active) {
        this.loadRecommendations();
      } else {
        this.recommendations.set([]);
      }
    });
  }

  loadRecommendations() {
    const active = this.householdService.activeHousehold();
    if (!active) return;

    this.dashboardService.getRecipeRecommendations(active.id).subscribe({
      next: (list) => this.recommendations.set(list)
    });
  }

  addMissingToShopping(recipe: RecipeRecommendation) {
    const active = this.householdService.activeHousehold();
    if (!active) return;

    recipe.missingIngredients.forEach(ing => {
      this.shoppingService.addEntry(active.id, {
        name: ing,
        pendingQuantity: 1
      }).subscribe();
    });

    this.successMessage.set(`Ingredientes de "${recipe.title}" añadidos a la lista de compra`);
  }
}
