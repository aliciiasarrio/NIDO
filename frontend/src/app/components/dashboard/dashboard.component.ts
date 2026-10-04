import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { HouseholdService } from '../../services/household.service';
import { ShoppingListService } from '../../services/shopping-list.service';
import { DashboardSummary, Item } from '../../models/nido.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-page">
      <!-- Empty state if no active household -->
      <div *ngIf="!householdService.activeHousehold()" class="empty-household card">
        <h2>Bienvenido a NIDO</h2>
        <p>Para empezar a organizar tus cosas, crea tu primer hogar o únete a uno existente con un código.</p>
        <button class="btn btn-primary" (click)="openCreateModal()">
          Crear mi primer hogar
        </button>
      </div>

      <!-- Dashboard Content when Household is selected -->
      <div *ngIf="householdService.activeHousehold()">
        <header class="page-header">
          <div>
            <h1>Hogar: {{ householdService.activeHousehold()?.name }}</h1>
            <p class="subtitle">Estado global de tu inventario y alertas domésticas</p>
          </div>
          <div class="header-actions">
            <a routerLink="/inventory" class="btn btn-primary">
              + Añadir Producto
            </a>
            <a routerLink="/shopping" class="btn btn-secondary">
              Lista de la Compra
            </a>
          </div>
        </header>

        <!-- Metric Badges Grid -->
        <div class="metrics-grid">
          <div class="metric-card card">
            <div class="metric-data">
              <span class="metric-value">{{ summary()?.totalItems || 0 }}</span>
              <span class="metric-label">Productos y Objetos</span>
            </div>
          </div>

          <div class="metric-card card">
            <div class="metric-data">
              <span class="metric-value">{{ summary()?.totalLocations || 0 }}</span>
              <span class="metric-label">Ubicaciones</span>
            </div>
          </div>

          <div class="metric-card card" [class.highlight-alert]="(summary()?.lowStockCount || 0) > 0">
            <div class="metric-data">
              <span class="metric-value">{{ summary()?.lowStockCount || 0 }}</span>
              <span class="metric-label">Bajo Stock Mínimo</span>
            </div>
          </div>

          <div class="metric-card card" [class.highlight-alert]="(summary()?.expiringSoonCount || 0) > 0">
            <div class="metric-data">
              <span class="metric-value">{{ summary()?.expiringSoonCount || 0 }}</span>
              <span class="metric-label">Próximos a Caducar (7 días)</span>
            </div>
          </div>
        </div>

        <div *ngIf="actionMessage()" class="alert alert-success" style="margin-bottom: 1.5rem;">
          {{ actionMessage() }}
        </div>

        <!-- Alerts and Recommendations Sections -->
        <div class="dashboard-columns">
          <!-- Low Stock Alert List -->
          <div class="dashboard-col card">
            <div class="card-header">
              <h3>Reposición Necesaria</h3>
              <a routerLink="/shopping" class="card-link">Ir a la lista →</a>
            </div>

            <div *ngIf="summary()?.lowStockItems?.length === 0" class="empty-state">
              Todos los productos consumibles disponen de existencias suficientes.
            </div>

            <div class="alert-list" *ngIf="(summary()?.lowStockItems?.length || 0) > 0">
              <div *ngFor="let item of summary()?.lowStockItems" class="alert-row">
                <div class="alert-info">
                  <strong>{{ item.name }}</strong>
                  <span class="badge badge-warning">{{ item.categoryName }}</span>
                  <div class="stock-text">
                    Stock actual: <strong>{{ item.totalStock }}</strong> / Mínimo: {{ item.minimumQuantity }} {{ item.unit }}
                  </div>
                </div>
                <div class="alert-actions">
                  <button class="btn btn-sm btn-outline-primary" (click)="quickAddToShopping(item)" title="Añadir a la lista de la compra">
                    + A la compra
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Expiring Soon List -->
          <div class="dashboard-col card">
            <div class="card-header">
              <h3>Consumo Prioritario (Caducidades)</h3>
              <a routerLink="/recipes" class="card-link">Recetas con sobras →</a>
            </div>

            <div *ngIf="summary()?.expiringSoonStocks?.length === 0" class="empty-state">
              No hay alimentos próximos a caducar en los próximos 7 días.
            </div>

            <div class="alert-list" *ngIf="(summary()?.expiringSoonStocks?.length || 0) > 0">
              <div *ngFor="let stock of summary()?.expiringSoonStocks" class="alert-row">
                <div class="alert-info">
                  <strong>{{ stock.itemName || 'Alimento perecedero' }}</strong>
                  <div class="stock-text">
                    Ubicación: <span>{{ stock.locationFullPath }}</span> | Cantidad: <strong>{{ stock.quantity }}</strong>
                  </div>
                  <div class="stock-expiry">
                    <span class="badge badge-danger">Caduca: {{ stock.expirationDate }}</span>
                  </div>
                </div>
                <div class="alert-actions">
                  <a routerLink="/recipes" class="btn btn-sm btn-primary" title="Buscar receta para aprovecharlo">
                    Cocinar
                  </a>
                  <a [routerLink]="['/inventory']" [queryParams]="{ search: stock.itemName }" class="btn btn-sm btn-secondary" title="Ver en inventario para consumir">
                    Consumir
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      max-width: 1280px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }

    .empty-household {
      text-align: center;
      padding: 4rem 2rem;
      max-width: 540px;
      margin: 3rem auto;

      .icon {
        font-size: 3.5rem;
        margin-bottom: 1rem;
        display: inline-block;
      }

      h2 {
        margin-bottom: 0.75rem;
      }

      p {
        color: var(--color-text-muted);
        margin-bottom: 1.5rem;
      }
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;

      .subtitle {
        color: var(--color-text-muted);
        margin-top: 0.25rem;
      }

      .header-actions {
        display: flex;
        gap: 0.75rem;
      }
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2rem;
    }

    .metric-card {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.25rem 1.5rem;

      &.highlight-alert {
        border-color: #ffcc80;
        background-color: #fffdf9;
      }

      .metric-icon {
        width: 52px;
        height: 52px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;

        &.bg-primary { background: var(--color-primary-light); }
        &.bg-secondary { background: var(--color-secondary-light); }
        &.bg-warning { background: var(--color-warning-bg); }
        &.bg-danger { background: var(--color-danger-bg); }
      }

      .metric-data {
        display: flex;
        flex-direction: column;

        .metric-value {
          font-size: 1.8rem;
          font-weight: 800;
          font-family: var(--font-display);
          line-height: 1;
        }

        .metric-label {
          font-size: 0.85rem;
          color: var(--color-text-muted);
          margin-top: 0.25rem;
          font-weight: 500;
        }
      }
    }

    .dashboard-columns {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--color-border-light);

      h3 {
        font-size: 1.1rem;
      }

      .card-link {
        font-size: 0.85rem;
        font-weight: 600;
      }
    }

    .empty-state {
      padding: 2rem;
      text-align: center;
      color: var(--color-text-muted);
      font-size: 0.95rem;

      span {
        font-size: 1.5rem;
        display: block;
        margin-bottom: 0.5rem;
      }
    }

    .alert-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .alert-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      border-radius: var(--radius-md);
      background-color: var(--color-sand);
      border: 1px solid var(--color-border-light);

      .alert-info {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;

        .stock-text {
          font-size: 0.825rem;
          color: var(--color-text-muted);
        }
      }
    }
  `]
})
export class DashboardComponent {
  summary = signal<DashboardSummary | null>(null);
  actionMessage = signal<string>('');

  constructor(
    public householdService: HouseholdService,
    private dashboardService: DashboardService,
    private shoppingListService: ShoppingListService
  ) {
    effect(() => {
      const active = this.householdService.activeHousehold();
      if (active) {
        this.loadSummary(active.id);
      } else {
        this.summary.set(null);
      }
    });
  }

  loadSummary(householdId: number) {
    this.dashboardService.getSummary(householdId).subscribe({
      next: (data) => this.summary.set(data),
      error: () => this.summary.set(null)
    });
  }

  quickAddToShopping(item: Item) {
    const active = this.householdService.activeHousehold();
    if (!active) return;
    const needed = Math.max(1, (item.minimumQuantity || 1) - item.totalStock);
    this.shoppingListService.addEntry(active.id, {
      itemId: item.id,
      name: item.name,
      pendingQuantity: needed
    }).subscribe({
      next: () => {
        this.actionMessage.set(`"${item.name}" añadido a la lista de la compra (${needed} ${item.unit}).`);
        setTimeout(() => this.actionMessage.set(''), 4500);
      },
      error: () => {
        this.actionMessage.set(`Error al añadir "${item.name}" a la lista.`);
      }
    });
  }

  openCreateModal() {
    this.householdService.openHouseholdModal();
  }
}
