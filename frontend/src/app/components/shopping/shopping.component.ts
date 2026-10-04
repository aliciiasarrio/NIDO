import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShoppingListService } from '../../services/shopping-list.service';
import { LocationService } from '../../services/location.service';
import { HouseholdService } from '../../services/household.service';
import { DashboardService } from '../../services/dashboard.service';
import { ShoppingEntry, Location, Item } from '../../models/nido.models';

@Component({
  selector: 'app-shopping',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="shopping-page">
      <div *ngIf="!householdService.activeHousehold()" class="card text-center p-4">
        <p>Selecciona un hogar para ver su lista de la compra.</p>
        <button class="btn btn-primary btn-sm mt-3" (click)="householdService.openHouseholdModal()">
          Crear o unirse a un hogar
        </button>
      </div>

      <div *ngIf="householdService.activeHousehold()">
        <header class="page-header">
          <div>
            <h1>Lista de la Compra</h1>
            <p class="subtitle">Añade productos necesarios o importa automáticamente los de bajo stock</p>
          </div>
        </header>

        <div *ngIf="errorMessage()" class="alert alert-danger">{{ errorMessage() }}</div>
        <div *ngIf="successMessage()" class="alert alert-success">{{ successMessage() }}</div>

        <!-- Add item row -->
        <div class="add-bar card">
          <div class="add-row">
            <input 
              type="text" 
              [(ngModel)]="newEntryName" 
              placeholder="¿Qué necesitas comprar? (Ej. Leche, Papel de cocina...)" 
              class="form-control"
              (keyup.enter)="addEntry()"
            />
            <input 
              type="number" 
              [(ngModel)]="newEntryQty" 
              min="1" 
              class="form-control qty-input"
            />
            <button class="btn btn-primary" [disabled]="!newEntryName.trim()" (click)="addEntry()">
              + Añadir
            </button>
          </div>

          <!-- Suggestions for Low Stock items -->
          <div *ngIf="suggestedItems().length > 0" class="suggestions-box">
            <span class="sugg-label">Sugerencias por stock bajo:</span>
            <div class="sugg-pills">
              <button 
                *ngFor="let s of suggestedItems()" 
                class="sugg-btn" 
                (click)="addSuggested(s)"
              >
                + {{ s.name }} ({{ s.minimumQuantity }} uds.)
              </button>
            </div>
          </div>
        </div>

        <!-- Shopping Entries List -->
        <div class="entries-list">
          <div *ngIf="entries().length === 0" class="card empty-card">
            <p>La lista de la compra está vacía.</p>
          </div>

          <div *ngFor="let entry of entries()" class="entry-card card" [class.completed]="entry.status === 'COMPLETED'">
            <div class="entry-left">
              <div class="entry-info">
                <h3>{{ entry.name }}</h3>
                <span *ngIf="entry.itemName" class="badge badge-primary">Vinculado a inventario</span>
                <span *ngIf="entry.status === 'COMPLETED'" class="badge badge-success">Comprado</span>
              </div>
            </div>

            <div class="entry-right">
              <div class="qty-control" *ngIf="entry.status === 'PENDING'">
                <button class="btn btn-sm btn-secondary" (click)="changeQty(entry, -1)">-</button>
                <span class="qty">{{ entry.pendingQuantity }}</span>
                <button class="btn btn-sm btn-secondary" (click)="changeQty(entry, 1)">+</button>
              </div>

              <!-- Action to Register Purchase to Stock -->
              <button 
                *ngIf="entry.status === 'PENDING'" 
                class="btn btn-sm btn-primary" 
                (click)="openPurchaseModal(entry)"
              >
                Registrar compra y ubicar
              </button>

              <button class="btn btn-sm btn-danger" (click)="deleteEntry(entry)" title="Eliminar">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Purchase Destination Modal -->
      <div *ngIf="showPurchaseModal()" class="modal-backdrop">
        <div class="modal-card card">
          <div class="modal-header">
            <h3>Comprar y Registrar en Inventario</h3>
            <button class="close-btn" (click)="closePurchaseModal()">✕</button>
          </div>

          <div class="modal-body">
            <p>Indica la cantidad adquirida y dónde se guardará en tu hogar:</p>

            <div class="form-group">
              <label>Cantidad comprada</label>
              <input type="number" [(ngModel)]="purchaseQuantity" class="form-control" min="1" />
            </div>

            <div class="form-group">
              <label>Ubicación de destino</label>
              <select [(ngModel)]="purchaseLocationId" class="form-control">
                <option [ngValue]="null">-- Seleccionar ubicación --</option>
                <option *ngFor="let loc of locations()" [ngValue]="loc.id">{{ loc.fullPath }}</option>
              </select>
              <small *ngIf="locations().length === 0" style="color: var(--color-danger); display: block; margin-top: 0.25rem;">
                No tienes ubicaciones creadas aún. Ve a 'Ubicaciones' para crear al menos una (ej. Cocina, Despensa).
              </small>
            </div>

            <div class="form-group">
              <label>Fecha de caducidad (opcional)</label>
              <input type="date" [(ngModel)]="purchaseExpiration" class="form-control" />
            </div>

            <div class="modal-actions">
              <button class="btn btn-secondary" (click)="closePurchaseModal()">Cancelar</button>
              <button 
                class="btn btn-primary" 
                [disabled]="!purchaseLocationId || purchaseQuantity < 1" 
                (click)="confirmPurchase()"
              >
                Completar Compra
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .shopping-page {
      max-width: 960px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }

    .page-header {
      margin-bottom: 1.5rem;
      .subtitle { color: var(--color-text-muted); }
    }

    .add-bar {
      padding: 1.25rem;
      margin-bottom: 1.5rem;

      .add-row {
        display: flex;
        gap: 0.75rem;

        input[type="text"] { flex: 1; }
        .qty-input { width: 80px; }
      }

      .suggestions-box {
        margin-top: 1rem;
        padding-top: 0.75rem;
        border-top: 1px dashed var(--color-border);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;

        .sugg-label {
          font-size: 0.825rem;
          font-weight: 600;
          color: var(--color-text-muted);
        }

        .sugg-pills {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;

          .sugg-btn {
            background: var(--color-primary-light);
            color: var(--color-primary);
            border-radius: var(--radius-pill);
            padding: 0.25rem 0.65rem;
            font-size: 0.8rem;
            font-weight: 600;
            border: 1px solid transparent;

            &:hover {
              background: var(--color-primary);
              color: white;
            }
          }
        }
      }
    }

    .entries-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .entry-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      transition: opacity var(--transition-fast);

      &.completed {
        opacity: 0.6;
        background: var(--color-sand);
        h3 { text-decoration: line-through; }
      }

      .entry-left {
        display: flex;
        align-items: center;
        gap: 1rem;

        .status-indicator { font-size: 1.2rem; }

        .entry-info {
          h3 { font-size: 1.05rem; }
        }
      }

      .entry-right {
        display: flex;
        align-items: center;
        gap: 1rem;

        .qty-control {
          display: flex;
          align-items: center;
          gap: 0.5rem;

          .qty {
            font-weight: 700;
            font-size: 1.1rem;
            min-width: 20px;
            text-align: center;
          }
        }
      }
    }

    .empty-card {
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

    .modal-card { width: 100%; max-width: 480px; padding: 2rem; }
    .modal-header { display: flex; justify-content: space-between; margin-bottom: 1rem; .close-btn { font-size: 1.2rem; } }
    .modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }
  `]
})
export class ShoppingComponent {
  entries = signal<ShoppingEntry[]>([]);
  locations = signal<Location[]>([]);
  suggestedItems = signal<Item[]>([]);

  newEntryName = '';
  newEntryQty = 1;

  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  // Purchase Modal
  showPurchaseModal = signal<boolean>(false);
  activePurchaseEntry: ShoppingEntry | null = null;
  purchaseQuantity = 1;
  purchaseLocationId: number | null = null;
  purchaseExpiration: string | null = null;

  constructor(
    public householdService: HouseholdService,
    private shoppingService: ShoppingListService,
    private locationService: LocationService,
    private dashboardService: DashboardService
  ) {
    effect(() => {
      const active = this.householdService.activeHousehold();
      if (active) {
        this.loadData();
      } else {
        this.entries.set([]);
        this.locations.set([]);
        this.suggestedItems.set([]);
      }
    });
  }

  loadData() {
    const active = this.householdService.activeHousehold();
    if (!active) return;

    this.shoppingService.getShoppingList(active.id).subscribe({
      next: (list) => this.entries.set(list)
    });

    this.locationService.getLocations(active.id).subscribe({
      next: (list) => {
        this.locations.set(list);
        if (list.length > 0) this.purchaseLocationId = list[0].id;
      }
    });

    this.dashboardService.getSummary(active.id).subscribe({
      next: (summary) => this.suggestedItems.set(summary.lowStockItems)
    });
  }

  addEntry() {
    const active = this.householdService.activeHousehold();
    if (!active || !this.newEntryName.trim()) return;

    this.shoppingService.addEntry(active.id, {
      name: this.newEntryName.trim(),
      pendingQuantity: this.newEntryQty
    }).subscribe({
      next: () => {
        this.newEntryName = '';
        this.newEntryQty = 1;
        this.loadData();
      },
      error: (err) => this.errorMessage.set(err.error?.error || 'Error al añadir artículo')
    });
  }

  addSuggested(item: Item) {
    const active = this.householdService.activeHousehold();
    if (!active) return;

    const qty = item.minimumQuantity ? Math.max(1, item.minimumQuantity - item.totalStock) : 1;

    this.shoppingService.addEntry(active.id, {
      itemId: item.id,
      name: item.name,
      pendingQuantity: qty
    }).subscribe({
      next: () => {
        this.successMessage.set(`"${item.name}" añadido a la compra`);
        this.loadData();
      }
    });
  }

  changeQty(entry: ShoppingEntry, delta: number) {
    const active = this.householdService.activeHousehold();
    if (!active) return;

    const newQty = entry.pendingQuantity + delta;
    this.shoppingService.updateQuantity(active.id, entry.id, newQty).subscribe({
      next: () => this.loadData()
    });
  }

  deleteEntry(entry: ShoppingEntry) {
    const active = this.householdService.activeHousehold();
    if (!active) return;

    this.shoppingService.deleteEntry(active.id, entry.id).subscribe({
      next: () => this.loadData()
    });
  }

  openPurchaseModal(entry: ShoppingEntry) {
    this.activePurchaseEntry = entry;
    this.purchaseQuantity = entry.pendingQuantity;
    this.purchaseExpiration = null;
    this.showPurchaseModal.set(true);
  }

  closePurchaseModal() {
    this.showPurchaseModal.set(false);
  }

  confirmPurchase() {
    const active = this.householdService.activeHousehold();
    if (!active || !this.activePurchaseEntry || !this.purchaseLocationId) return;

    this.shoppingService.purchaseEntry(active.id, this.activePurchaseEntry.id, {
      quantityPurchased: this.purchaseQuantity,
      destinationLocationId: this.purchaseLocationId,
      expirationDate: this.purchaseExpiration || undefined
    }).subscribe({
      next: () => {
        this.successMessage.set('Compra registrada y existencias añadidas al inventario');
        this.closePurchaseModal();
        this.loadData();
      },
      error: (err) => this.errorMessage.set(err.error?.error || 'Error al registrar compra')
    });
  }
}
