import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LocationService } from '../../services/location.service';
import { HouseholdService } from '../../services/household.service';
import { InventoryService } from '../../services/inventory.service';
import { Location, LocationRequest, Item } from '../../models/nido.models';

@Component({
  selector: 'app-locations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="locations-page">
      <div *ngIf="!householdService.activeHousehold()" class="card text-center p-4">
        <p>Selecciona o crea un hogar para gestionar sus ubicaciones.</p>
        <button class="btn btn-primary btn-sm mt-3" (click)="householdService.openHouseholdModal()">
          Crear o unirse a un hogar
        </button>
      </div>

      <div *ngIf="householdService.activeHousehold()">
        <header class="page-header">
          <div>
            <h1>Ubicaciones del Hogar</h1>
            <p class="subtitle">Organiza los espacios de almacenamiento (habitaciones, armarios, baldas)</p>
          </div>
          <button class="btn btn-primary" (click)="openCreateModal()">
            + Nueva Ubicación
          </button>
        </header>

        <div *ngIf="errorMessage()" class="alert alert-danger">
          {{ errorMessage() }}
        </div>
        <div *ngIf="successMessage()" class="alert alert-success">
          {{ successMessage() }}
        </div>

        <!-- Filter bar -->
        <div class="search-bar card">
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            placeholder="Buscar por nombre o ruta (ej. Cocina, Armario...)" 
            class="form-control"
          />
        </div>

        <!-- Location List / Tree Representation -->
        <div class="locations-grid">
          <div *ngIf="filteredLocations().length === 0" class="card empty-card">
            <p>No hay ubicaciones registradas con ese criterio.</p>
            <button class="btn btn-primary btn-sm" (click)="openCreateModal()">
              Crear primera ubicación
            </button>
          </div>

          <div *ngFor="let loc of filteredLocations()" class="location-item card">
            <div class="location-main">
              <div class="location-details">
                <div class="location-breadcrumb">
                  <span class="home-crumb">{{ householdService.activeHousehold()?.name }}</span>
                  <span class="crumb-separator">/</span>
                  <span class="full-path">{{ loc.fullPath }}</span>
                </div>
                <h3>{{ loc.name }}</h3>

                <!-- Items stored in this location -->
                <div class="location-stock-summary">
                  <span class="stock-count-badge">
                    {{ getItemsInLocation(loc.id).length }} {{ getItemsInLocation(loc.id).length === 1 ? 'producto almacenado' : 'productos almacenados' }}
                  </span>
                  
                  <div *ngIf="getItemsInLocation(loc.id).length > 0" class="location-items-chips">
                    <span *ngFor="let it of getItemsInLocation(loc.id).slice(0, 4)" class="item-chip">
                      {{ it.name }} ({{ getStockQtyInLocation(it, loc.id) }} {{ it.unit }})
                    </span>
                    <span *ngIf="getItemsInLocation(loc.id).length > 4" class="item-chip more-chip">
                      +{{ getItemsInLocation(loc.id).length - 4 }} más
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="location-actions">
              <button 
                class="btn btn-sm btn-primary" 
                (click)="navigateToAddItem(loc)" 
                title="Añadir producto directamente en esta ubicación"
              >
                + Añadir objeto aquí
              </button>
              <button class="btn btn-sm btn-secondary" (click)="openEditModal(loc)" title="Editar ubicación">
                Editar
              </button>
              <button class="btn btn-sm btn-outline-primary" (click)="archiveLocation(loc)" title="Archivar ubicación">
                Archivar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Create / Edit Modal -->
      <div *ngIf="showModal()" class="modal-backdrop">
        <div class="modal-card card">
          <div class="modal-header">
            <h3>{{ editingLocation ? 'Editar Ubicación' : 'Nueva Ubicación' }}</h3>
            <button class="close-btn" (click)="closeModal()">✕</button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label>Nombre de la ubicación</label>
              <input 
                type="text" 
                [(ngModel)]="modalName" 
                placeholder="Ej. Balda 2, Cajón cubiertos, Trastero" 
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label>Ubicación superior (padre opcional)</label>
              <select [(ngModel)]="modalParentId" class="form-control">
                <option [ngValue]="null">-- Ninguna (Ubicación Raíz) --</option>
                <option 
                  *ngFor="let l of availableParents()" 
                  [ngValue]="l.id"
                >
                  {{ l.fullPath }}
                </option>
              </select>
              <span class="form-hint">Permite crear jerarquías como: Cocina > Armario > Balda.</span>
            </div>

            <div class="modal-actions">
              <button class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
              <button 
                class="btn btn-primary" 
                [disabled]="!modalName.trim()" 
                (click)="saveLocation()"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- In-App Confirmation Archive Location Modal -->
      <div *ngIf="locationToArchive()" class="modal-backdrop">
        <div class="modal-card card confirm-modal">
          <div class="confirm-icon-box">
            <span class="confirm-icon">📍</span>
          </div>
          <div class="confirm-content">
            <h3>¿Archivar ubicación?</h3>
            <p class="confirm-desc">
              ¿Estás seguro de que deseas archivar <strong>"{{ locationToArchive()?.name }}"</strong>?
            </p>
            <p class="confirm-sub">Solo es posible si no contiene sububicaciones activas en su interior.</p>
          </div>
          <div class="confirm-actions">
            <button type="button" class="btn btn-secondary" (click)="cancelArchiveLocation()">
              Cancelar
            </button>
            <button type="button" class="btn btn-danger" (click)="confirmArchiveLocation()">
              Sí, archivar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .locations-page {
      max-width: 1280px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      gap: 1rem;
      flex-wrap: wrap;

      .subtitle {
        color: var(--color-text-muted);
      }
    }

    .search-bar {
      padding: 1rem;
      margin-bottom: 1.5rem;
    }

    .locations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 1rem;
    }

    .location-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      transition: transform var(--transition-fast);

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }

      .location-main {
        display: flex;
        align-items: center;
        gap: 1rem;

        .location-icon {
          font-size: 1.8rem;
          background: var(--color-sand);
          padding: 0.5rem;
          border-radius: var(--radius-md);
        }

        .location-details {
          h3 {
            font-size: 1.05rem;
            margin-bottom: 0.2rem;
          }

          .full-path {
            font-size: 0.8rem;
            color: var(--color-text-muted);
            font-weight: 500;
          }

          .location-breadcrumb {
            display: flex;
            align-items: center;
            gap: 0.35rem;
            font-size: 0.75rem;
            color: var(--color-text-muted);
            margin-bottom: 0.35rem;

            .crumb-separator { opacity: 0.5; }
            .home-crumb { font-weight: 500; }
            .full-path { font-weight: 600; color: var(--color-primary); }
          }

          .location-stock-summary {
            margin-top: 0.5rem;

            .stock-count-badge {
              font-size: 0.75rem;
              background: var(--color-sand);
              padding: 0.2rem 0.5rem;
              border-radius: var(--radius-sm);
              color: var(--color-text-muted);
              font-weight: 600;
              display: inline-block;
            }
          }

          .location-items-chips {
            display: flex;
            gap: 0.35rem;
            flex-wrap: wrap;
            margin-top: 0.4rem;

            .item-chip {
              background: var(--color-cream);
              border: 1px solid var(--color-border);
              padding: 0.15rem 0.5rem;
              border-radius: var(--radius-pill);
              font-size: 0.75rem;
              color: var(--color-text-main);

              &.more-chip {
                font-weight: 600;
                color: var(--color-primary);
                background: var(--color-primary-light);
              }
            }
          }
        }
      }

      .location-actions {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
    }

    .empty-card {
      grid-column: 1 / -1;
      text-align: center;
      padding: 3rem;
      color: var(--color-text-muted);

      span {
        font-size: 2.5rem;
        display: block;
        margin-bottom: 0.5rem;
      }
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

    .modal-card {
      width: 100%;
      max-width: 500px;
      padding: 2rem;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;

      .close-btn {
        font-size: 1.2rem;
      }
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.5rem;
    }
  `]
})
export class LocationsComponent {
  locations = signal<Location[]>([]);
  items = signal<Item[]>([]);
  searchQuery = '';
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  showModal = signal<boolean>(false);
  editingLocation: Location | null = null;
  modalName = '';
  modalParentId: number | null = null;
  locationToArchive = signal<Location | null>(null);

  constructor(
    public householdService: HouseholdService,
    private locationService: LocationService,
    private inventoryService: InventoryService,
    private router: Router
  ) {
    effect(() => {
      const active = this.householdService.activeHousehold();
      if (active) {
        this.loadLocations();
      } else {
        this.locations.set([]);
        this.items.set([]);
      }
    });
  }

  loadLocations() {
    const active = this.householdService.activeHousehold();
    if (!active) return;
    this.locationService.getLocations(active.id).subscribe({
      next: (list) => this.locations.set(list)
    });
    this.inventoryService.getItems(active.id).subscribe({
      next: (itemList) => this.items.set(itemList)
    });
  }

  getItemsInLocation(locId: number): Item[] {
    return this.items().filter(item => item.stocks && item.stocks.some(s => s.locationId === locId));
  }

  getStockQtyInLocation(item: Item, locId: number): number {
    return (item.stocks || [])
      .filter(s => s.locationId === locId)
      .reduce((acc, cur) => acc + cur.quantity, 0);
  }

  navigateToAddItem(loc: Location) {
    this.router.navigate(['/inventory'], {
      queryParams: {
        locationId: loc.id,
        locationName: loc.fullPath,
        autoOpen: 'true'
      }
    });
  }

  filteredLocations(): Location[] {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return this.locations();
    return this.locations().filter(l => 
      l.name.toLowerCase().includes(q) || l.fullPath.toLowerCase().includes(q)
    );
  }

  availableParents(): Location[] {
    if (!this.editingLocation) return this.locations();
    // Excluir a la propia ubicación para evitar auto-referencias
    return this.locations().filter(l => l.id !== this.editingLocation?.id);
  }

  openCreateModal() {
    this.editingLocation = null;
    this.modalName = '';
    this.modalParentId = null;
    this.showModal.set(true);
  }

  openEditModal(loc: Location) {
    this.editingLocation = loc;
    this.modalName = loc.name;
    this.modalParentId = loc.parentId;
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveLocation() {
    const active = this.householdService.activeHousehold();
    if (!active || !this.modalName.trim()) return;

    const payload: LocationRequest = {
      name: this.modalName.trim(),
      parentId: this.modalParentId
    };

    if (this.editingLocation) {
      this.locationService.updateLocation(active.id, this.editingLocation.id, payload).subscribe({
        next: () => {
          this.successMessage.set('Ubicación actualizada correctamente');
          this.closeModal();
          this.loadLocations();
        },
        error: (err) => this.errorMessage.set(err.error?.error || 'Error al actualizar ubicación')
      });
    } else {
      this.locationService.createLocation(active.id, payload).subscribe({
        next: () => {
          this.successMessage.set('Ubicación creada con éxito');
          this.closeModal();
          this.loadLocations();
        },
        error: (err) => this.errorMessage.set(err.error?.error || 'Error al crear ubicación')
      });
    }
  }

  archiveLocation(loc: Location) {
    this.locationToArchive.set(loc);
  }

  cancelArchiveLocation() {
    this.locationToArchive.set(null);
  }

  confirmArchiveLocation() {
    const loc = this.locationToArchive();
    if (!loc) return;
    const active = this.householdService.activeHousehold();
    if (!active) return;

    this.locationService.archiveLocation(active.id, loc.id).subscribe({
      next: () => {
        this.successMessage.set(`Ubicación "${loc.name}" archivada correctamente.`);
        this.errorMessage.set('');
        this.locationToArchive.set(null);
        this.loadLocations();
      },
      error: (err) => {
        this.errorMessage.set(err.error?.error || 'Error al archivar la ubicación');
        this.locationToArchive.set(null);
      }
    });
  }
}
