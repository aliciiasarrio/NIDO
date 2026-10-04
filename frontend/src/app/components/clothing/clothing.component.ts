import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../services/dashboard.service';
import { InventoryService } from '../../services/inventory.service';
import { HouseholdService } from '../../services/household.service';
import { Item } from '../../models/nido.models';
import { ProductImageService } from '../../services/product-image.service';

@Component({
  selector: 'app-clothing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="clothing-page">
      <div *ngIf="!householdService.activeHousehold()" class="card text-center p-4">
        <p>Selecciona un hogar para gestionar las prendas de ropa.</p>
        <button class="btn btn-primary btn-sm mt-3" (click)="householdService.openHouseholdModal()">
          Crear o unirse a un hogar
        </button>
      </div>

      <div *ngIf="householdService.activeHousehold()">
        <header class="page-header">
          <div>
            <h1>Prendas Sin Uso y Armario Sostenible</h1>
            <p class="subtitle">Detecta ropa que no utilizas para donar, vender o dar una segunda vida</p>
          </div>
          <div class="threshold-selector">
            <label>Tiempo sin usar:</label>
            <select [(ngModel)]="daysThreshold" (ngModelChange)="loadUnworn()" class="form-control">
              <option [value]="30">Más de 30 días</option>
              <option [value]="60">Más de 60 días</option>
              <option [value]="90">Más de 90 días (3 meses)</option>
              <option [value]="180">Más de 180 días (6 meses)</option>
              <option [value]="365">Más de 1 año</option>
            </select>
          </div>
        </header>

        <div *ngIf="successMessage()" class="alert alert-success">{{ successMessage() }}</div>

        <!-- Unworn Items Grid -->
        <div class="clothing-grid">
          <div *ngIf="unwornItems().length === 0" class="card empty-card">
            <p>No tienes prendas inactivas por más de {{ daysThreshold }} días.</p>
          </div>

          <div *ngFor="let item of unwornItems()" class="clothing-card card">
            <div class="clothing-card-top">
              <div class="clothing-thumbnail-container" [title]="item.name">
                <img [src]="productImageService.getImage(item)" [alt]="item.name" class="clothing-thumbnail" />
              </div>
              <div class="clothing-header">
                <div class="clothing-title">
                  <h3>{{ item.name }}</h3>
                  <div class="badges">
                    <span *ngIf="item.clothingSize" class="badge badge-primary">Talla: {{ item.clothingSize }}</span>
                    <span *ngIf="item.clothingColor" class="badge badge-secondary">{{ item.clothingColor }}</span>
                  </div>
                </div>
              </div>
            </div>

            <p *ngIf="item.description" class="clothing-desc">{{ item.description }}</p>

            <div class="wear-info">
              <span>Última vez usada: 
                <strong>{{ item.lastWornAt ? (item.lastWornAt | date:'dd/MM/yyyy') : 'Nunca registrada' }}</strong>
              </span>
            </div>

            <div class="clothing-actions">
              <button class="btn btn-sm btn-primary" (click)="wearNow(item)">
                Registrar uso hoy
              </button>
              <button class="btn btn-sm btn-outline-primary" (click)="generateDraft(item)">
                Copiar borrador para venta / donación
              </button>
              <button class="btn btn-sm btn-outline-danger" (click)="deleteClothing(item)">
                🗑️ Eliminar prenda
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Draft Modal -->
      <div *ngIf="showDraftModal()" class="modal-backdrop">
        <div class="modal-card card">
          <div class="modal-header">
            <h3>Borrador para Segunda Mano (Vinted / Wallapop)</h3>
            <button class="close-btn" (click)="showDraftModal.set(false)">✕</button>
          </div>
          <div class="modal-body">
            <p class="hint">Copia este texto para publicarlo fácilmente en la plataforma que prefieras:</p>
            <textarea class="form-control draft-textarea" rows="6" readonly>{{ draftText() }}</textarea>
            <div class="modal-actions">
              <button class="btn btn-secondary" (click)="showDraftModal.set(false)">Cerrar</button>
              <button class="btn btn-primary" (click)="copyDraftToClipboard()">
                Copiar al portapapeles
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .clothing-page {
      max-width: 1280px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      gap: 1rem;
      flex-wrap: wrap;

      .subtitle { color: var(--color-text-muted); }

      .threshold-selector {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 600;
        font-size: 0.9rem;
      }
    }

    .clothing-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 1.5rem;
    }

    .clothing-card {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 1.75rem;

      .clothing-card-top {
        display: flex;
        gap: 1rem;
        align-items: center;
        margin-bottom: 0.75rem;

        .clothing-thumbnail-container {
          flex-shrink: 0;
          width: 52px;
          height: 52px;
          border-radius: var(--radius-md);
          overflow: hidden;
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;

          &:hover {
            transform: scale(1.08);
          }

          .clothing-thumbnail {
            width: 100%;
            height: 100%;
            object-fit: contain;
            padding: 2px;
          }
        }

        .clothing-header {
          flex: 1;

          .clothing-title {
            h3 { font-size: 1.15rem; margin-bottom: 0.25rem; }
            .badges { display: flex; gap: 0.35rem; }
          }
        }
      }

      .clothing-desc {
        font-size: 0.9rem;
        color: var(--color-text-muted);
        margin-bottom: 0.75rem;
      }

      .wear-info {
        font-size: 0.85rem;
        color: var(--color-text-main);
        background: var(--color-sand);
        padding: 0.5rem 0.75rem;
        border-radius: var(--radius-sm);
        margin-bottom: 1.25rem;
      }

      .clothing-actions {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
    }

    .empty-card {
      grid-column: 1 / -1;
      text-align: center;
      padding: 3rem;
      color: var(--color-text-muted);
      span { font-size: 2.5rem; display: block; margin-bottom: 0.5rem; }
    }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(35, 34, 32, 0.45);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1.5rem;
    }

    .modal-card { width: 100%; max-width: 500px; padding: 2rem; }
    .modal-header { display: flex; justify-content: space-between; margin-bottom: 1rem; .close-btn { font-size: 1.2rem; } }
    .draft-textarea { font-family: monospace; font-size: 0.875rem; margin-top: 0.75rem; resize: none; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.25rem; }
  `]
})
export class ClothingComponent {
  unwornItems = signal<Item[]>([]);
  daysThreshold = 90;
  successMessage = signal<string>('');

  showDraftModal = signal<boolean>(false);
  draftText = signal<string>('');

  constructor(
    public householdService: HouseholdService,
    public productImageService: ProductImageService,
    private dashboardService: DashboardService,
    private inventoryService: InventoryService
  ) {
    effect(() => {
      const active = this.householdService.activeHousehold();
      if (active) {
        this.loadUnworn();
      } else {
        this.unwornItems.set([]);
      }
    });
  }

  loadUnworn() {
    const active = this.householdService.activeHousehold();
    if (!active) return;

    this.dashboardService.getSummary(active.id, this.daysThreshold).subscribe({
      next: (summary) => this.unwornItems.set(summary.unwornClothingItems)
    });
  }

  wearNow(item: Item) {
    const active = this.householdService.activeHousehold();
    if (!active) return;

    this.inventoryService.recordClothingWorn(active.id, item.id).subscribe({
      next: () => {
        this.successMessage.set(`¡Genial! Has usado "${item.name}" hoy.`);
        this.loadUnworn();
      }
    });
  }

  deleteClothing(item: Item) {
    if (!confirm(`¿Estás seguro de que deseas eliminar la prenda "${item.name}"? Se retirará de tu armario y del inventario.`)) {
      return;
    }
    const active = this.householdService.activeHousehold();
    if (!active) return;

    this.inventoryService.deleteItem(active.id, item.id).subscribe({
      next: () => {
        this.successMessage.set(`Prenda "${item.name}" eliminada correctamente.`);
        this.loadUnworn();
      },
      error: (err) => alert(err.error?.error || 'Error al eliminar la prenda')
    });
  }

  generateDraft(item: Item) {
    const title = `${item.name}${item.clothingSize ? ' - Talla ' + item.clothingSize : ''}`;
    const desc = `Título: ${title}
Talla: ${item.clothingSize || 'Estándar'}
Color: ${item.clothingColor || 'No especificado'}
Estado: Muy buen estado / Poco uso
Descripción: ${item.description || 'Prenda cuidada lista para una nueva vida.'}
#segundamano #moda #sostenible`;

    this.draftText.set(desc);
    this.showDraftModal.set(true);
  }

  copyDraftToClipboard() {
    navigator.clipboard.writeText(this.draftText()).then(() => {
      this.successMessage.set('Borrador copiado al portapapeles con éxito');
      this.showDraftModal.set(false);
    });
  }
}
