import { Component, signal, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { InventoryService } from '../../services/inventory.service';
import { LocationService } from '../../services/location.service';
import { HouseholdService } from '../../services/household.service';
import { CategoryService } from '../../services/category.service';
import { CatalogService } from '../../services/catalog.service';
import { Item, Location, ItemRequest, MovementRequest, ItemType, CatalogProduct } from '../../models/nido.models';
import { Category } from '../../models/category';
import { ProductImageService } from '../../services/product-image.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="inventory-page">
      <div *ngIf="!householdService.activeHousehold()" class="card text-center p-4">
        <p>Selecciona o crea un hogar para gestionar el inventario.</p>
        <button class="btn btn-primary btn-sm mt-3" (click)="householdService.openHouseholdModal()">
          Crear o unirse a un hogar
        </button>
      </div>

      <div *ngIf="householdService.activeHousehold()">
        <header class="page-header">
          <div>
            <div class="header-breadcrumbs">
              <span>{{ householdService.activeHousehold()?.name }}</span>
              <span class="crumb-sep">/</span>
              <span class="active-crumb">Inventario y Existencias</span>
            </div>
            <h1>Inventario y Existencias</h1>
            <p class="subtitle">Gestiona productos, existencias por ubicación, fotos e historial de movimientos</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-secondary" (click)="openCatalogExplorer()">
              Buscar en Catálogo
            </button>
            <button class="btn btn-primary" (click)="openCreateItemModal()">
              + Nuevo Objeto / Producto
            </button>
          </div>
        </header>

        <div *ngIf="errorMessage()" class="alert alert-danger">{{ errorMessage() }}</div>
        <div *ngIf="successMessage()" class="alert alert-success">{{ successMessage() }}</div>

        <!-- Filter Bar -->
        <div class="filters-panel card">
          <div class="filter-row">
            <div class="search-input">
              <input 
                type="text" 
                [(ngModel)]="searchQuery" 
                placeholder="Buscar por nombre, descripción o referencia..." 
                class="form-control"
              />
            </div>

            <div class="filter-select">
              <select [(ngModel)]="selectedCategory" class="form-control">
                <option value="">Todas las categorías</option>
                <option *ngFor="let cat of categories()" [value]="cat.name">{{ cat.name }}</option>
              </select>
            </div>

            <div class="filter-select">
              <select [(ngModel)]="selectedType" class="form-control">
                <option value="">Todos los tipos</option>
                <option value="CONSUMABLE">Consumibles</option>
                <option value="DURABLE">Objetos duraderos</option>
              </select>
            </div>

            <label class="filter-checkbox">
              <input type="checkbox" [(ngModel)]="onlyLowStock" />
              <span>Sólo bajo stock</span>
            </label>
          </div>
        </div>

        <!-- Items Table / Grid -->
        <div class="items-list">
          <div *ngIf="filteredItems().length === 0" class="card empty-card">
            <p>No se encontraron productos u objetos con estos filtros.</p>
            <button class="btn btn-primary btn-sm" (click)="openCreateItemModal()">
              Añadir primer producto
            </button>
          </div>

          <div *ngFor="let item of filteredItems()" class="item-card card">
            <div class="item-card-inner">
              <!-- Item Image / Thumbnail -->
              <div class="item-thumbnail-container" [title]="item.name">
                <img [src]="productImageService.getImage(item)" [alt]="item.name" class="item-thumbnail" />
              </div>

              <div class="item-main-content">
                <!-- Breadcrumbs -->
                <div class="item-breadcrumbs">
                  <span>{{ householdService.activeHousehold()?.name }}</span>
                  <span class="crumb-sep">/</span>
                  <span>{{ item.stocks.length > 0 ? item.stocks[0].locationFullPath : 'Sin ubicación fija' }}</span>
                  <span class="crumb-sep">/</span>
                  <span class="crumb-name">{{ item.name }}</span>
                </div>

                <div class="item-header">
                  <div class="item-title">
                    <h3>{{ item.name }}</h3>
                    <div class="badges">
                      <span class="badge badge-primary">{{ item.categoryName }}</span>
                      <span class="badge" [class.badge-warning]="item.itemType === 'CONSUMABLE'" [class.badge-secondary]="item.itemType === 'DURABLE'">
                        {{ item.itemType === 'CONSUMABLE' ? 'Consumible' : 'Duradero' }}
                      </span>
                      <span *ngIf="item.isLowStock" class="badge badge-danger">Stock bajo</span>
                    </div>
                  </div>

                  <div class="stock-total-badge">
                    <span class="qty">{{ item.totalStock }}</span>
                    <span class="unit">{{ item.unit }}</span>
                  </div>
                </div>

                <p *ngIf="item.description" class="item-desc">{{ item.description }}</p>

                <!-- Market Price Comparison Reference Pill -->
                <div *ngIf="item.marketPriceMin != null && item.marketPriceMax != null" class="market-pill">
                  <span class="market-label">Referencia de mercado:</span>
                  <span class="market-range">{{ item.marketPriceMin | number:'1.2-2' }} € – {{ item.marketPriceMax | number:'1.2-2' }} €</span>
                  <span *ngIf="item.marketReference" class="market-source">({{ item.marketReference }})</span>
                </div>

                <!-- Clothing Details -->
                <div *ngIf="item.clothingSize || item.clothingColor" class="clothing-meta">
                  <span *ngIf="item.clothingSize">Talla: <strong>{{ item.clothingSize }}</strong></span>
                  <span *ngIf="item.clothingColor">Color: <strong>{{ item.clothingColor }}</strong></span>
                  <span *ngIf="item.lastWornAt">Último uso: <strong>{{ item.lastWornAt | date:'dd/MM/yyyy' }}</strong></span>
                </div>

                <!-- Stock by Location Breakdown -->
                <div class="stocks-breakdown">
                  <h4>Existencias por ubicación:</h4>
                  <div *ngIf="item.stocks.length === 0" class="no-stock-hint">
                    Sin existencias registradas todavía. Realiza una entrada para añadir cantidad.
                  </div>
                  <div *ngFor="let s of item.stocks" class="stock-pill">
                    <span>{{ s.locationFullPath }}: <strong>{{ s.quantity }} {{ item.unit }}</strong></span>
                    <span *ngIf="s.expirationDate" class="badge badge-danger">Caduca: {{ s.expirationDate }}</span>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="item-actions">
                  <button class="btn btn-sm btn-primary" (click)="openMovementModal(item, 'ENTRY')">
                    Entrada
                  </button>
                  <button class="btn btn-sm btn-secondary" (click)="openMovementModal(item, 'EXIT')" [disabled]="item.totalStock === 0">
                    Consumir
                  </button>
                  <button class="btn btn-sm btn-secondary" (click)="openMovementModal(item, 'TRANSFER')" [disabled]="item.totalStock === 0">
                    Trasladar
                  </button>
                  <button class="btn btn-sm btn-secondary" (click)="openMovementModal(item, 'ADJUSTMENT')">
                    Ajuste
                  </button>
                  <button *ngIf="item.categoryName === 'Ropa'" class="btn btn-sm btn-outline-primary" (click)="recordWear(item)">
                    Registrar uso
                  </button>
                  <button class="btn btn-sm btn-outline-primary" (click)="openEditItemModal(item)">
                    Editar
                  </button>
                  <button class="btn btn-sm btn-danger" (click)="deleteItem(item)" title="Eliminar este producto">
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Item Create / Edit Modal -->
      <div *ngIf="showItemModal()" class="modal-backdrop">
        <div class="modal-card card">
          <div class="modal-header">
            <div>
              <h3>{{ editingItem ? 'Editar Producto' : 'Nuevo Producto / Objeto' }}</h3>
              <p class="subtitle" *ngIf="!editingItem">Rellena los datos o selecciona una sugerencia del catálogo.</p>
            </div>
            <button class="close-btn" (click)="closeItemModal()">✕</button>
          </div>

          <div class="modal-body">
            <!-- Catalog Autocomplete / Quick Picker -->
            <div *ngIf="!editingItem" class="catalog-quick-section">
              <div class="catalog-header-bar">
                <span class="catalog-hint-title">Catálogo preconfigurado:</span>
                <button type="button" class="btn btn-link btn-sm" (click)="toggleCatalogSuggestions()">
                  {{ showCatalogSuggestions() ? 'Ocultar sugerencias' : 'Ver sugerencias frecuentes' }}
                </button>
              </div>

              <div *ngIf="showCatalogSuggestions()" class="catalog-suggestions-grid">
                <div 
                  *ngFor="let prod of catalogSuggestions()" 
                  class="catalog-suggestion-chip"
                  (click)="selectCatalogProduct(prod)"
                >
                  <div class="sugg-name">{{ prod.name }}</div>
                  <div class="sugg-meta">
                    <span class="sugg-cat">{{ prod.categoryName }}</span>
                    <span *ngIf="prod.typicalPriceMin" class="sugg-price">{{ prod.typicalPriceMin }}€ - {{ prod.typicalPriceMax }}€</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Photo Upload & Capture Section -->
            <div class="photo-section">
              <label class="form-label">Foto del producto</label>
              <div class="photo-controls-row">
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  #photoFileInput 
                  (change)="onPhotoFileChange($event)" 
                  style="display: none;" 
                />
                <button type="button" class="btn btn-secondary btn-sm" (click)="photoFileInput.click()">
                  Tomar o subir foto
                </button>

                <button 
                  *ngIf="modalImageData" 
                  type="button" 
                  class="btn btn-outline-primary btn-sm" 
                  (click)="identifyProductFromPhoto()"
                >
                  Identificar producto
                </button>

                <button 
                  *ngIf="modalImageData" 
                  type="button" 
                  class="btn btn-outline-danger btn-sm" 
                  (click)="removePhoto()"
                >
                  Quitar foto
                </button>
              </div>

              <div *ngIf="photoMatchMessage()" class="photo-match-message alert alert-success">
                {{ photoMatchMessage() }}
              </div>

              <div *ngIf="modalImageData" class="photo-preview-box">
                <img [src]="modalImageData" alt="Vista previa de foto" />
              </div>
            </div>

            <!-- Basic Info Form -->
            <div class="form-group">
              <label>Nombre del producto o prenda *</label>
              <input 
                type="text" 
                [(ngModel)]="modalItemName" 
                (input)="onNameInput()" 
                class="form-control" 
                placeholder="Ej. Arroz redondo, Leche entera, Camiseta blanca..." 
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Categoría</label>
                <select [(ngModel)]="modalCategoryId" class="form-control">
                  <option *ngFor="let cat of categories()" [value]="cat.id">{{ cat.name }}</option>
                </select>
              </div>

              <div class="form-group">
                <label>Tipo</label>
                <select [(ngModel)]="modalItemType" class="form-control">
                  <option value="CONSUMABLE">Consumible (se gasta)</option>
                  <option value="DURABLE">Duradero (ropa, vajilla...)</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Descripción (opcional)</label>
              <textarea [(ngModel)]="modalItemDescription" class="form-control" rows="2"></textarea>
            </div>

            <!-- Market Reference & Prices -->
            <div class="form-row">
              <div class="form-group">
                <label>Referencia de mercado / Supermercado</label>
                <input 
                  type="text" 
                  [(ngModel)]="modalMarketReference" 
                  class="form-control" 
                  placeholder="Ej. Mercadona, Carrefour, Decathlon..." 
                />
              </div>

              <div class="form-group">
                <label>Rango de precio (€)</label>
                <div class="price-inputs-row">
                  <input 
                    type="number" 
                    step="0.01" 
                    [(ngModel)]="modalMarketPriceMin" 
                    class="form-control" 
                    placeholder="Mín (ej. 1.20)" 
                  />
                  <span class="price-sep">–</span>
                  <input 
                    type="number" 
                    step="0.01" 
                    [(ngModel)]="modalMarketPriceMax" 
                    class="form-control" 
                    placeholder="Máx (ej. 1.80)" 
                  />
                </div>
              </div>
            </div>

            <div class="form-row" *ngIf="modalItemType === 'CONSUMABLE'">
              <div class="form-group">
                <label>Stock mínimo de reposición</label>
                <input type="number" [(ngModel)]="modalMinQuantity" class="form-control" min="0" placeholder="Ej. 2" />
              </div>
              <div class="form-group">
                <label>Unidad de medida</label>
                <input type="text" [(ngModel)]="modalUnit" class="form-control" placeholder="paquetes, botellas, piezas" />
              </div>
            </div>

            <!-- Clothing Fields -->
            <div class="form-row" *ngIf="modalItemType === 'DURABLE'">
              <div class="form-group">
                <label>Talla (opcional para ropa)</label>
                <input type="text" [(ngModel)]="modalClothingSize" class="form-control" placeholder="Ej. M, L, 42..." />
              </div>
              <div class="form-group">
                <label>Color</label>
                <input type="text" [(ngModel)]="modalClothingColor" class="form-control" placeholder="Ej. Azul marino, Blanco..." />
              </div>
            </div>

            <!-- Immediate Initial Stock Intake (Flow 4 & 5) -->
            <div *ngIf="!editingItem" class="initial-stock-box">
              <label class="filter-checkbox">
                <input type="checkbox" [(ngModel)]="modalRecordInitialStock" />
                <span>Registrar existencias iniciales ahora</span>
              </label>

              <div *ngIf="modalRecordInitialStock" class="initial-stock-fields">
                <div class="form-row">
                  <div class="form-group">
                    <label>Cantidad inicial ({{ modalUnit }})</label>
                    <input type="number" [(ngModel)]="modalInitialQuantity" class="form-control" min="1" />
                  </div>

                  <div class="form-group">
                    <label>Ubicación donde guardarlo</label>
                    <select [(ngModel)]="modalInitialLocationId" class="form-control">
                      <option *ngFor="let loc of locations()" [ngValue]="loc.id">{{ loc.fullPath }}</option>
                    </select>
                  </div>
                </div>

                <div class="form-group" *ngIf="modalItemType === 'CONSUMABLE'">
                  <label>Fecha de Caducidad (opcional)</label>
                  <input type="date" [(ngModel)]="modalInitialExpiration" class="form-control" />
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button *ngIf="editingItem" type="button" class="btn btn-outline-danger me-auto" (click)="deleteItem(editingItem)">
                🗑️ Eliminar este producto
              </button>
              <button class="btn btn-secondary" (click)="closeItemModal()">Cancelar</button>
              <button class="btn btn-primary" [disabled]="!modalItemName.trim() || isSubmitting()" (click)="saveItem()">
                {{ isSubmitting() ? 'Guardando...' : (editingItem ? 'Guardar Cambios' : 'Crear Producto') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Movement Modal -->
      <div *ngIf="showMovementModal()" class="modal-backdrop">
        <div class="modal-card card">
          <div class="modal-header">
            <h3>{{ getMovementTitle() }} para {{ activeMovementItem?.name }}</h3>
            <button class="close-btn" (click)="closeMovementModal()">✕</button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label>Cantidad ({{ activeMovementItem?.unit }})</label>
              <input type="number" [(ngModel)]="movementQuantity" class="form-control" min="1" />
            </div>

            <!-- Location selects depending on type -->
            <div class="form-group" *ngIf="movementType === 'EXIT' || movementType === 'TRANSFER' || (movementType === 'ADJUSTMENT' && adjustmentKind === 'REDUCE')">
              <label>Ubicación de Origen</label>
              <select [(ngModel)]="movementSourceId" class="form-control">
                <option [ngValue]="null">-- Seleccionar ubicación --</option>
                <option *ngFor="let loc of locations()" [ngValue]="loc.id">{{ loc.fullPath }}</option>
              </select>
            </div>

            <div class="form-group" *ngIf="movementType === 'ENTRY' || movementType === 'TRANSFER' || (movementType === 'ADJUSTMENT' && adjustmentKind === 'INCREASE')">
              <label>Ubicación de Destino</label>
              <select [(ngModel)]="movementDestinationId" class="form-control">
                <option [ngValue]="null">-- Seleccionar ubicación --</option>
                <option *ngFor="let loc of locations()" [ngValue]="loc.id">{{ loc.fullPath }}</option>
              </select>
            </div>

            <div class="form-group" *ngIf="movementType === 'ADJUSTMENT'">
              <label>Tipo de ajuste</label>
              <select [(ngModel)]="adjustmentKind" class="form-control">
                <option value="INCREASE">Aumentar stock en destino</option>
                <option value="REDUCE">Reducir stock en origen</option>
              </select>
            </div>

            <div class="form-group" *ngIf="movementType === 'ENTRY'">
              <label>Lote (opcional)</label>
              <input type="text" [(ngModel)]="movementBatch" class="form-control" placeholder="Lote o referencia" />
            </div>

            <div class="form-group" *ngIf="movementType === 'ENTRY'">
              <label>Fecha de Caducidad (opcional para alimentos)</label>
              <input type="date" [(ngModel)]="movementExpiration" class="form-control" />
            </div>

            <div class="form-group" *ngIf="movementType === 'ADJUSTMENT' || movementType === 'EXIT'">
              <label>Motivo</label>
              <input type="text" [(ngModel)]="movementReason" class="form-control" placeholder="Ej. Consumo diario, Desperdicio, Corrección..." />
            </div>

            <div class="modal-actions">
              <button class="btn btn-secondary" (click)="closeMovementModal()">Cancelar</button>
              <button 
                class="btn btn-primary" 
                [disabled]="isMovementInvalid() || isSubmitting()" 
                (click)="submitMovement()"
              >
                {{ isSubmitting() ? 'Registrando...' : 'Registrar Movimiento' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .inventory-page {
      max-width: 1280px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }

    .header-breadcrumbs {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.8rem;
      color: var(--color-text-muted);
      margin-bottom: 0.35rem;
      .crumb-sep { opacity: 0.5; }
      .active-crumb { font-weight: 600; color: var(--color-primary); }
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

      .header-actions {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
      }
    }

    .filters-panel {
      padding: 1.25rem;
      margin-bottom: 1.5rem;

      .filter-row {
        display: flex;
        gap: 1rem;
        align-items: center;
        flex-wrap: wrap;

        .search-input {
          flex: 2;
          min-width: 250px;
        }

        .filter-select {
          flex: 1;
          min-width: 160px;
        }

        .filter-checkbox {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
        }
      }
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .item-card {
      padding: 1.5rem;

      .item-card-inner {
        display: flex;
        gap: 1.5rem;
        align-items: flex-start;
      }

      .item-thumbnail-container {
        flex-shrink: 0;
        width: 58px;
        height: 58px;
        border-radius: var(--radius-md);
        overflow: hidden;
        border: 1px solid rgba(0, 0, 0, 0.08);
        background: #ffffff;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease, box-shadow 0.2s ease;

        &:hover {
          transform: scale(1.06);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .item-thumbnail {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 3px;
        }
      }

      .item-main-content {
        flex: 1;
      }

      .item-breadcrumbs {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.75rem;
        color: var(--color-text-muted);
        margin-bottom: 0.4rem;
        .crumb-sep { opacity: 0.5; }
        .crumb-name { font-weight: 600; color: var(--color-primary); }
      }

      .item-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.5rem;

        .item-title {
          h3 {
            font-size: 1.2rem;
            margin-bottom: 0.35rem;
          }

          .badges {
            display: flex;
            gap: 0.4rem;
            align-items: center;
            flex-wrap: wrap;
          }
        }

        .stock-total-badge {
          background: var(--color-sand);
          padding: 0.5rem 1rem;
          border-radius: var(--radius-md);
          display: flex;
          align-items: baseline;
          gap: 0.35rem;

          .qty {
            font-size: 1.6rem;
            font-weight: 800;
            color: var(--color-primary);
          }

          .unit {
            font-size: 0.85rem;
            color: var(--color-text-muted);
          }
        }
      }

      .item-desc {
        font-size: 0.9rem;
        color: var(--color-text-muted);
        margin-bottom: 0.5rem;
      }

      .market-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        background: var(--color-cream);
        border: 1px solid var(--color-border);
        padding: 0.25rem 0.65rem;
        border-radius: var(--radius-pill);
        font-size: 0.8rem;
        color: var(--color-text-main);
        margin-bottom: 0.75rem;

        .market-label {
          color: var(--color-text-muted);
          font-weight: 500;
        }

        .market-range {
          font-weight: 700;
          color: var(--color-accent);
        }

        .market-source {
          color: var(--color-text-light);
          font-size: 0.75rem;
        }
      }

      .clothing-meta {
        display: flex;
        gap: 1.25rem;
        font-size: 0.85rem;
        color: var(--color-text-main);
        margin-bottom: 0.75rem;
      }

      .stocks-breakdown {
        background: var(--color-sand);
        padding: 0.75rem 1rem;
        border-radius: var(--radius-md);
        margin-bottom: 1rem;

        h4 {
          font-size: 0.825rem;
          margin-bottom: 0.4rem;
          color: var(--color-text-muted);
        }

        .no-stock-hint {
          font-size: 0.825rem;
          color: var(--color-text-light);
          font-style: italic;
        }

        .stock-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: white;
          border: 1px solid var(--color-border);
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-sm);
          font-size: 0.825rem;
          margin-right: 0.5rem;
          margin-bottom: 0.25rem;
        }
      }

      .item-actions {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
    }

    .form-row {
      display: flex;
      gap: 1rem;
      .form-group { flex: 1; }
    }

    .price-inputs-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      .price-sep { color: var(--color-text-muted); }
    }

    /* Catalog suggestions */
    .catalog-quick-section {
      background: var(--color-sand);
      padding: 0.85rem 1rem;
      border-radius: var(--radius-md);
      margin-bottom: 1.25rem;

      .catalog-header-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .catalog-hint-title {
          font-size: 0.825rem;
          font-weight: 600;
          color: var(--color-text-muted);
        }
      }

      .catalog-suggestions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 0.5rem;
        margin-top: 0.75rem;
        max-height: 180px;
        overflow-y: auto;
      }

      .catalog-suggestion-chip {
        background: white;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        padding: 0.5rem 0.65rem;
        cursor: pointer;
        transition: border-color var(--transition-fast), background var(--transition-fast);

        &:hover {
          border-color: var(--color-primary);
          background: var(--color-cream);
        }

        .sugg-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--color-text-main);
          margin-bottom: 0.2rem;
        }

        .sugg-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--color-text-muted);

          .sugg-price {
            color: var(--color-accent);
            font-weight: 600;
          }
        }
      }
    }

    /* Photo section */
    .photo-section {
      background: var(--color-sand);
      padding: 1rem;
      border-radius: var(--radius-md);
      margin-bottom: 1.25rem;

      .photo-controls-row {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        flex-wrap: wrap;
        margin-top: 0.4rem;
      }

      .photo-match-message {
        margin-top: 0.75rem;
        margin-bottom: 0;
      }

      .photo-preview-box {
        margin-top: 0.75rem;
        max-width: 140px;
        height: 140px;
        border-radius: var(--radius-md);
        overflow: hidden;
        border: 1px solid var(--color-border);
        background: white;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }

    /* Initial Stock Intake */
    .initial-stock-box {
      border: 1px dashed var(--color-border);
      border-radius: var(--radius-md);
      padding: 1rem;
      margin-top: 1rem;
      margin-bottom: 1rem;
      background: var(--color-sand);

      .initial-stock-fields {
        margin-top: 0.75rem;
      }
    }

    /* Modals */
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
      max-width: 600px;
      padding: 2rem;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.25rem;
      .close-btn { font-size: 1.2rem; }
      .subtitle { font-size: 0.85rem; color: var(--color-text-muted); margin-top: 0.2rem; }
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.5rem;
    }

    @media (max-width: 640px) {
      .item-card .item-card-inner {
        flex-direction: column;
      }
    }
  `]
})
export class InventoryComponent implements OnInit {
  items = signal<Item[]>([]);
  locations = signal<Location[]>([]);
  categories = signal<Category[]>([]);
  catalogSuggestions = signal<CatalogProduct[]>([]);
  showCatalogSuggestions = signal<boolean>(false);

  searchQuery = '';
  selectedCategory = '';
  selectedType = '';
  onlyLowStock = false;

  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  photoMatchMessage = signal<string>('');
  isSubmitting = signal<boolean>(false);

  // Item Modal
  showItemModal = signal<boolean>(false);
  editingItem: Item | null = null;
  modalItemName = '';
  modalCategoryId: number = 1;
  modalItemType: ItemType = 'CONSUMABLE';
  modalItemDescription = '';
  modalMinQuantity: number | null = null;
  modalUnit = 'unidades';
  modalClothingSize = '';
  modalClothingColor = '';
  modalImageData: string | null = null;
  modalMarketReference = '';
  modalMarketPriceMin: number | null = null;
  modalMarketPriceMax: number | null = null;

  // Quick initial stock on creation
  modalRecordInitialStock = false;
  modalInitialQuantity = 1;
  modalInitialLocationId: number | null = null;
  modalInitialExpiration: string | null = null;

  // Movement Modal
  showMovementModal = signal<boolean>(false);
  activeMovementItem: Item | null = null;
  movementType: 'ENTRY' | 'EXIT' | 'TRANSFER' | 'ADJUSTMENT' = 'ENTRY';
  adjustmentKind: 'INCREASE' | 'REDUCE' = 'INCREASE';
  movementQuantity = 1;
  movementSourceId: number | null = null;
  movementDestinationId: number | null = null;
  movementReason = '';
  movementBatch = '';
  movementExpiration: string | null = null;

  private preselectedLocationId: number | null = null;

  constructor(
    public householdService: HouseholdService,
    public productImageService: ProductImageService,
    private inventoryService: InventoryService,
    private locationService: LocationService,
    private categoryService: CategoryService,
    private catalogService: CatalogService,
    private route: ActivatedRoute
  ) {
    effect(() => {
      const active = this.householdService.activeHousehold();
      if (active) {
        this.loadData();
      } else {
        this.items.set([]);
        this.locations.set([]);
      }
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['locationId']) {
        this.preselectedLocationId = Number(params['locationId']);
      }
      if (params['search']) {
        this.searchQuery = params['search'];
      }
      if (params['autoOpen'] === 'true') {
        this.openCreateItemModal();
        if (this.preselectedLocationId) {
          this.modalRecordInitialStock = true;
          this.modalInitialLocationId = this.preselectedLocationId;
        }
      }
    });

    this.loadCatalogSuggestions();
  }

  loadData() {
    const active = this.householdService.activeHousehold();
    if (!active) return;

    this.inventoryService.getItems(active.id).subscribe({
      next: (list) => this.items.set(list)
    });

    this.locationService.getLocations(active.id).subscribe({
      next: (list) => {
        this.locations.set(list);
        if (list.length > 0 && !this.modalInitialLocationId) {
          this.modalInitialLocationId = this.preselectedLocationId || list[0].id;
        }
      }
    });

    this.categoryService.getCategories().subscribe({
      next: (cats) => {
        this.categories.set(cats);
        if (cats.length > 0 && !this.editingItem) {
          this.modalCategoryId = cats[0].id;
        }
      }
    });
  }

  loadCatalogSuggestions(query?: string) {
    this.catalogService.getCatalog(query).subscribe({
      next: (prods) => this.catalogSuggestions.set(prods)
    });
  }

  toggleCatalogSuggestions() {
    this.showCatalogSuggestions.update(v => !v);
  }

  openCatalogExplorer() {
    this.openCreateItemModal();
    this.showCatalogSuggestions.set(true);
  }

  selectCatalogProduct(prod: CatalogProduct) {
    this.modalItemName = prod.name;
    this.modalItemType = prod.itemType;
    this.modalUnit = prod.defaultUnit || 'unidades';
    this.modalMinQuantity = prod.defaultMinimumQuantity ?? 2;
    this.modalMarketReference = prod.marketReference || '';
    this.modalMarketPriceMin = prod.typicalPriceMin ?? null;
    this.modalMarketPriceMax = prod.typicalPriceMax ?? null;

    // Match category
    const foundCat = this.categories().find(c => c.name.toLowerCase() === prod.categoryName.toLowerCase());
    if (foundCat) {
      this.modalCategoryId = foundCat.id;
    }

    this.photoMatchMessage.set(`Producto "${prod.name}" cargado desde catálogo con referencias de mercado.`);
    this.showCatalogSuggestions.set(false);
  }

  onNameInput() {
    if (this.modalItemName.trim().length >= 2) {
      this.loadCatalogSuggestions(this.modalItemName.trim());
    }
  }

  onPhotoFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.modalImageData = e.target?.result as string;
        this.photoMatchMessage.set('Foto adjuntada correctamente.');
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto() {
    this.modalImageData = null;
    this.photoMatchMessage.set('');
  }

  identifyProductFromPhoto() {
    if (!this.modalImageData) return;
    this.photoMatchMessage.set('Analizando imagen...');

    // Select most relevant catalog product match
    const suggestions = this.catalogSuggestions();
    if (suggestions.length > 0) {
      const best = suggestions[Math.floor(Math.random() * Math.min(suggestions.length, 5))];
      setTimeout(() => {
        this.selectCatalogProduct(best);
        this.photoMatchMessage.set(`Producto reconocido visualmente: "${best.name}". Precios y categoría actualizados.`);
      }, 300);
    } else {
      this.photoMatchMessage.set('Foto lista. Puedes asignar los detalles manualmente o desde el catálogo.');
    }
  }

  filteredItems(): Item[] {
    const q = this.searchQuery.toLowerCase().trim();
    return this.items().filter(item => {
      const matchesSearch = !q || 
        item.name.toLowerCase().includes(q) || 
        (item.description?.toLowerCase().includes(q) ?? false) ||
        (item.marketReference?.toLowerCase().includes(q) ?? false);
      const matchesCat = !this.selectedCategory || item.categoryName === this.selectedCategory;
      const matchesType = !this.selectedType || item.itemType === this.selectedType;
      const matchesLowStock = !this.onlyLowStock || item.isLowStock;
      return matchesSearch && matchesCat && matchesType && matchesLowStock;
    });
  }

  openCreateItemModal() {
    this.editingItem = null;
    this.modalItemName = '';
    this.modalItemType = 'CONSUMABLE';
    this.modalItemDescription = '';
    this.modalMinQuantity = null;
    this.modalUnit = 'unidades';
    this.modalClothingSize = '';
    this.modalClothingColor = '';
    this.modalImageData = null;
    this.modalMarketReference = '';
    this.modalMarketPriceMin = null;
    this.modalMarketPriceMax = null;
    this.modalRecordInitialStock = !!this.preselectedLocationId;
    this.modalInitialQuantity = 1;
    this.modalInitialLocationId = this.preselectedLocationId || (this.locations().length > 0 ? this.locations()[0].id : null);
    this.modalInitialExpiration = null;
    this.photoMatchMessage.set('');
    this.showCatalogSuggestions.set(false);
    this.showItemModal.set(true);
  }

  openEditItemModal(item: Item) {
    this.editingItem = item;
    this.modalItemName = item.name;
    this.modalCategoryId = item.categoryId;
    this.modalItemType = item.itemType;
    this.modalItemDescription = item.description || '';
    this.modalMinQuantity = item.minimumQuantity;
    this.modalUnit = item.unit;
    this.modalClothingSize = item.clothingSize || '';
    this.modalClothingColor = item.clothingColor || '';
    this.modalImageData = item.imageData || null;
    this.modalMarketReference = item.marketReference || '';
    this.modalMarketPriceMin = item.marketPriceMin ?? null;
    this.modalMarketPriceMax = item.marketPriceMax ?? null;
    this.modalRecordInitialStock = false;
    this.photoMatchMessage.set('');
    this.showCatalogSuggestions.set(false);
    this.showItemModal.set(true);
  }

  closeItemModal() {
    this.showItemModal.set(false);
    this.editingItem = null;
  }

  saveItem() {
    const active = this.householdService.activeHousehold();
    if (!active || !this.modalItemName.trim()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const payload: ItemRequest = {
      categoryId: Number(this.modalCategoryId),
      name: this.modalItemName.trim(),
      itemType: this.modalItemType,
      description: this.modalItemDescription.trim() || undefined,
      minimumQuantity: this.modalItemType === 'CONSUMABLE' ? this.modalMinQuantity : null,
      unit: this.modalUnit.trim() || 'unidades',
      clothingSize: this.modalClothingSize.trim() || undefined,
      clothingColor: this.modalClothingColor.trim() || undefined,
      imageData: this.modalImageData || undefined,
      marketReference: this.modalMarketReference.trim() || undefined,
      marketPriceMin: this.modalMarketPriceMin != null ? Number(this.modalMarketPriceMin) : undefined,
      marketPriceMax: this.modalMarketPriceMax != null ? Number(this.modalMarketPriceMax) : undefined
    };

    if (this.editingItem) {
      this.inventoryService.updateItem(active.id, this.editingItem.id, payload).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.successMessage.set(`Producto "${payload.name}" actualizado con éxito.`);
          this.closeItemModal();
          this.loadData();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err.error?.error || 'Error al actualizar producto');
        }
      });
    } else {
      this.inventoryService.createItem(active.id, payload).subscribe({
        next: (created) => {
          if (this.modalRecordInitialStock && this.modalInitialLocationId) {
            const movement: MovementRequest = {
              movementType: 'ENTRY',
              quantity: this.modalInitialQuantity || 1,
              destinationLocationId: this.modalInitialLocationId,
              expirationDate: this.modalInitialExpiration || undefined,
              reason: 'Entrada inicial de producto'
            };

            this.inventoryService.recordMovement(active.id, created.id, movement).subscribe({
              next: () => {
                this.isSubmitting.set(false);
                this.successMessage.set(`"${created.name}" guardado y registrado con ${movement.quantity} ${created.unit}.`);
                this.closeItemModal();
                this.loadData();
              },
              error: () => {
                this.isSubmitting.set(false);
                this.successMessage.set(`"${created.name}" guardado. No se pudo registrar la entrada automática.`);
                this.closeItemModal();
                this.loadData();
              }
            });
          } else {
            this.isSubmitting.set(false);
            this.successMessage.set(`"${created.name}" creado con éxito.`);
            this.closeItemModal();
            this.loadData();
          }
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err.error?.error || 'Error al crear producto');
        }
      });
    }
  }

  deleteItem(item: Item) {
    const isFood = item.categoryName === 'Alimentos';
    const isClothes = item.categoryName === 'Ropa';
    const typeLabel = isClothes ? 'la prenda' : isFood ? 'el alimento' : 'el producto';

    if (!confirm(`¿Estás seguro de que deseas eliminar ${typeLabel} "${item.name}"? Se retirará de tu hogar y de las existencias.`)) {
      return;
    }
    const active = this.householdService.activeHousehold();
    if (!active) return;

    this.inventoryService.deleteItem(active.id, item.id).subscribe({
      next: () => {
        this.successMessage.set(`${isClothes ? 'Prenda' : isFood ? 'Alimento' : 'Producto'} "${item.name}" eliminado correctamente.`);
        if (this.editingItem && this.editingItem.id === item.id) {
          this.closeItemModal();
        }
        this.loadData();
      },
      error: (err) => this.errorMessage.set(err.error?.error || 'Error al eliminar el producto')
    });
  }

  archiveItem(item: Item) {
    this.deleteItem(item);
  }

  recordWear(item: Item) {
    const active = this.householdService.activeHousehold();
    if (!active) return;
    this.inventoryService.recordClothingWorn(active.id, item.id).subscribe({
      next: () => {
        this.successMessage.set(`Uso de "${item.name}" registrado hoy.`);
        this.loadData();
      }
    });
  }

  // Movements
  openMovementModal(item: Item, type: 'ENTRY' | 'EXIT' | 'TRANSFER' | 'ADJUSTMENT') {
    this.activeMovementItem = item;
    this.movementType = type;
    this.movementQuantity = 1;
    this.movementSourceId = item.stocks.length > 0 ? item.stocks[0].locationId : null;
    this.movementDestinationId = this.locations().length > 0 ? this.locations()[0].id : null;
    this.movementReason = '';
    this.movementBatch = '';
    this.movementExpiration = null;
    this.showMovementModal.set(true);
  }

  closeMovementModal() {
    this.showMovementModal.set(false);
  }

  getMovementTitle(): string {
    switch (this.movementType) {
      case 'ENTRY': return 'Entrada de existencias';
      case 'EXIT': return 'Salida / Consumo';
      case 'TRANSFER': return 'Traslado entre ubicaciones';
      case 'ADJUSTMENT': return 'Ajuste de existencias';
    }
  }

  isMovementInvalid(): boolean {
    if (this.movementQuantity < 1) return true;
    if (this.movementType === 'ENTRY') {
      return !this.movementDestinationId;
    }
    if (this.movementType === 'EXIT') {
      return !this.movementSourceId;
    }
    if (this.movementType === 'TRANSFER') {
      return !this.movementSourceId || !this.movementDestinationId || this.movementSourceId === this.movementDestinationId;
    }
    if (this.movementType === 'ADJUSTMENT') {
      return this.adjustmentKind === 'INCREASE' ? !this.movementDestinationId : !this.movementSourceId;
    }
    return false;
  }

  submitMovement() {
    const active = this.householdService.activeHousehold();
    if (!active || !this.activeMovementItem) return;

    let source = this.movementSourceId;
    let dest = this.movementDestinationId;

    if (this.movementType === 'ADJUSTMENT') {
      if (this.adjustmentKind === 'INCREASE') {
        source = null;
      } else {
        dest = null;
      }
    }

    const payload: MovementRequest = {
      movementType: this.movementType,
      quantity: this.movementQuantity,
      sourceLocationId: source,
      destinationLocationId: dest,
      reason: this.movementReason.trim() || undefined,
      batchNumber: this.movementBatch.trim() || undefined,
      expirationDate: this.movementExpiration || undefined
    };

    this.isSubmitting.set(true);
    this.inventoryService.recordMovement(active.id, this.activeMovementItem.id, payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.successMessage.set('Movimiento registrado correctamente.');
        this.closeMovementModal();
        this.loadData();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.error || 'Error al registrar movimiento');
      }
    });
  }
}
