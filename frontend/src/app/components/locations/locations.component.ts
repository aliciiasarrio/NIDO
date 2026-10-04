import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LocationService } from '../../services/location.service';
import { HouseholdService } from '../../services/household.service';
import { InventoryService } from '../../services/inventory.service';
import { ProductImageService } from '../../services/product-image.service';
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
            <p class="subtitle">Espacios y zonas de almacenamiento</p>
          </div>
          <button class="btn btn-primary btn-create-location" (click)="openCreateModal()">
            <span>+</span> Nueva Ubicación
          </button>
        </header>

        <div *ngIf="errorMessage()" class="alert alert-danger">
          {{ errorMessage() }}
        </div>
        <div *ngIf="successMessage()" class="alert alert-success">
          {{ successMessage() }}
        </div>

        <!-- Filter bar con desplegables organizados -->
        <div class="filters-panel card">
          <div class="filters-grid">
            <div class="search-input-group">
              <span class="input-icon">🔍</span>
              <input 
                type="text" 
                [(ngModel)]="searchQuery" 
                placeholder="Buscar ubicación..." 
                class="form-control"
              />
            </div>

            <div class="select-group">
              <label class="select-label">Estancia principal:</label>
              <select [(ngModel)]="selectedParentId" class="form-control">
                <option [ngValue]="null">🏠 Todas las estancias</option>
                <option *ngFor="let root of rootLocations()" [ngValue]="root.id">
                  {{ getLocationIcon(root.name) }} {{ root.name }}
                </option>
              </select>
            </div>

            <div class="select-group">
              <label class="select-label">Filtro de contenido:</label>
              <select [(ngModel)]="stockFilter" class="form-control">
                <option value="ALL">📦 Todas las ubicaciones</option>
                <option value="WITH_STOCK">✅ Con productos guardados</option>
                <option value="EMPTY">⚪ Vacías / Sin existencias</option>
              </select>
            </div>
          </div>

          <div class="filters-meta">
            <span class="count-badge">
              <strong>{{ filteredLocations().length }}</strong> {{ filteredLocations().length === 1 ? 'ubicación encontrada' : 'ubicaciones encontradas' }}
            </span>
            <button 
              *ngIf="searchQuery || selectedParentId !== null || stockFilter !== 'ALL'" 
              class="btn-reset-filters" 
              (click)="resetFilters()"
            >
              ✕ Limpiar filtros
            </button>
          </div>
        </div>

        <!-- 3D Interactive Flip Cards Grid -->
        <div class="locations-grid">
          <div *ngIf="filteredLocations().length === 0" class="card empty-card">
            <span class="empty-icon">📍</span>
            <p>No se han encontrado ubicaciones con los filtros seleccionados.</p>
            <button class="btn btn-primary btn-sm mt-3" (click)="openCreateModal()">
              Crear nueva ubicación
            </button>
          </div>

          <div 
            *ngFor="let loc of filteredLocations()" 
            class="flip-card"
            [class.is-flipped]="flippedCardId() === loc.id"
            (click)="toggleCardFlip(loc.id)"
          >
            <div class="flip-card-inner">
              
              <!-- CARA FRONTAL (FRONT FACE: Información limpia y estética) -->
              <div class="flip-card-face flip-card-front card">
                <div class="card-header-front">
                  <div class="icon-avatar">
                    <span class="emoji-icon">{{ getLocationIcon(loc.name) }}</span>
                  </div>
                  <div 
                    class="badge-stock-pill" 
                    [class.empty]="getItemsInLocation(loc.id).length === 0"
                  >
                    {{ getItemsInLocation(loc.id).length }} {{ getItemsInLocation(loc.id).length === 1 ? 'producto' : 'productos' }}
                  </div>
                </div>

                <div class="card-content-front">
                  <div class="location-path-crumb" [title]="loc.fullPath">
                    <span class="home-prefix">{{ householdService.activeHousehold()?.name }}</span>
                    <span class="crumb-slash">/</span>
                    <span class="path-text">{{ loc.fullPath }}</span>
                  </div>

                  <h3 class="location-title">{{ loc.name }}</h3>

                  <!-- Vista previa visual de productos bien integrada directamente bajo el título -->
                  <div class="preview-products-box" *ngIf="getItemsInLocation(loc.id).length > 0">
                    <span class="preview-label">Contenido en este espacio:</span>
                    <div class="thumbnails-preview-row">
                      <div 
                        *ngFor="let it of getItemsInLocation(loc.id).slice(0, 4)" 
                        class="thumb-wrapper" 
                        [title]="it.name + ' (' + getStockQtyInLocation(it, loc.id) + ' ' + it.unit + ')'"
                      >
                        <img [src]="productImageService.getImage(it)" [alt]="it.name" class="mini-thumb" />
                      </div>
                      <span *ngIf="getItemsInLocation(loc.id).length > 4" class="more-badge">
                        +{{ getItemsInLocation(loc.id).length - 4 }} más
                      </span>
                    </div>
                  </div>

                  <div class="empty-location-hint" *ngIf="getItemsInLocation(loc.id).length === 0">
                    <span>📦 Espacio disponible sin existencias</span>
                  </div>
                </div>
              </div>

              <!-- CARA TRASERA (BACK FACE: Al situar el ratón encima o hacer click) -->
              <div class="flip-card-face flip-card-back card">
                <div class="back-header">
                  <div class="back-title-group">
                    <span class="back-icon">{{ getLocationIcon(loc.name) }}</span>
                    <div>
                      <h4 class="back-heading">{{ loc.name }}</h4>
                      <span class="back-subpath">{{ loc.fullPath }}</span>
                    </div>
                  </div>
                </div>

                <!-- Lista fija de productos (MÁXIMO 2 productos, SIN SCROLL) -->
                <div class="back-items-container">
                  <div *ngIf="getItemsInLocation(loc.id).length === 0" class="empty-stock-state">
                    <span class="empty-box-icon">📦</span>
                    <p>No hay productos guardados aquí aún.</p>
                  </div>

                  <!-- Solo los primeros 2 productos que caben en la vista -->
                  <div *ngFor="let it of getItemsInLocation(loc.id).slice(0, 2)" class="back-item-row">
                    <img [src]="productImageService.getImage(it)" [alt]="it.name" class="back-thumb" />
                    <div class="back-item-meta">
                      <span class="back-item-title" [title]="it.name">{{ it.name }}</span>
                      <span class="back-item-quantity">{{ getStockQtyInLocation(it, loc.id) }} {{ it.unit }}</span>
                    </div>
                  </div>

                  <!-- Botón para ver más en pop-up -->
                  <button 
                    *ngIf="getItemsInLocation(loc.id).length > 2" 
                    type="button" 
                    class="btn-view-more" 
                    (click)="openLocationItemsModal(loc, $event)"
                  >
                    🔍 Ver más ({{ getItemsInLocation(loc.id).length }} en total)
                  </button>
                  <button 
                    *ngIf="getItemsInLocation(loc.id).length > 0 && getItemsInLocation(loc.id).length <= 2" 
                    type="button" 
                    class="btn-view-more subtle" 
                    (click)="openLocationItemsModal(loc, $event)"
                  >
                    🔍 Ver detalle completo
                  </button>
                </div>

                <!-- Acciones ordenadas y organizadas -->
                <div class="back-footer-actions">
                  <button 
                    type="button" 
                    class="btn btn-sm btn-primary btn-add-here" 
                    (click)="$event.stopPropagation(); navigateToAddItem(loc)"
                    title="Añadir producto directamente aquí"
                  >
                    + Añadir objeto aquí
                  </button>

                  <div class="back-secondary-row">
                    <button 
                      type="button" 
                      class="btn btn-sm btn-secondary flex-1" 
                      (click)="$event.stopPropagation(); openEditModal(loc)"
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      type="button" 
                      class="btn btn-sm btn-outline-danger flex-1" 
                      (click)="$event.stopPropagation(); archiveLocation(loc)"
                    >
                      🗑️ Archivar
                    </button>
                  </div>
                </div>

              </div>

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

      <!-- Pop-up Modal: Todos los elementos registrados en la ubicación -->
      <div *ngIf="locationForItemsModal()" class="modal-backdrop" (click)="closeLocationItemsModal()">
        <div class="modal-card card location-items-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title-with-icon">
              <span class="modal-loc-icon">{{ getLocationIcon(locationForItemsModal()!.name) }}</span>
              <div>
                <h3>{{ locationForItemsModal()!.name }}</h3>
                <span class="modal-loc-path">{{ locationForItemsModal()!.fullPath }}</span>
              </div>
            </div>
            <button type="button" class="close-btn" (click)="closeLocationItemsModal()">✕</button>
          </div>

          <div class="modal-body items-modal-body">
            <div class="items-modal-meta">
              <span class="badge-stock-pill" [class.empty]="getItemsInLocation(locationForItemsModal()!.id).length === 0">
                {{ getItemsInLocation(locationForItemsModal()!.id).length }} {{ getItemsInLocation(locationForItemsModal()!.id).length === 1 ? 'producto registrado' : 'productos registrados' }}
              </span>
            </div>

            <!-- Listado completo de productos en el pop-up -->
            <div class="location-full-items-list custom-scroll">
              <div *ngIf="getItemsInLocation(locationForItemsModal()!.id).length === 0" class="empty-stock-state">
                <span class="empty-box-icon">📦</span>
                <p>No hay productos guardados en esta ubicación todavía.</p>
              </div>

              <div 
                *ngFor="let it of getItemsInLocation(locationForItemsModal()!.id)" 
                class="location-full-item-card"
              >
                <img [src]="productImageService.getImage(it)" [alt]="it.name" class="modal-item-thumb" />
                <div class="modal-item-info">
                  <div class="modal-item-title-row">
                    <h4 class="modal-item-name" [title]="it.name">{{ it.name }}</h4>
                    <span class="modal-category-chip">{{ it.categoryName }}</span>
                  </div>
                  <div class="modal-item-details-row">
                    <span class="modal-stock-badge">
                      📦 <strong>{{ getStockQtyInLocation(it, locationForItemsModal()!.id) }}</strong> {{ it.unit }}
                    </span>
                    <span class="modal-type-chip" [class.consumable]="it.itemType === 'CONSUMABLE'">
                      {{ it.itemType === 'CONSUMABLE' ? 'Consumible' : 'Duradero' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button 
              type="button" 
              class="btn btn-primary" 
              (click)="navigateToAddItem(locationForItemsModal()!); closeLocationItemsModal()"
            >
              + Añadir objeto aquí
            </button>
            <button type="button" class="btn btn-secondary" (click)="closeLocationItemsModal()">
              Cerrar
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
        font-size: 0.95rem;
      }

      .btn-create-location {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(45, 106, 79, 0.2);
      }
    }

    /* Filters Panel */
    .filters-panel {
      padding: 1.25rem 1.5rem;
      margin-bottom: 2rem;
      background: #ffffff;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);

      .filters-grid {
        display: grid;
        grid-template-columns: 2fr 1.5fr 1.5fr;
        gap: 1.25rem;
        align-items: flex-end;

        @media (max-width: 900px) {
          grid-template-columns: 1fr;
        }

        .search-input-group {
          position: relative;

          .input-icon {
            position: absolute;
            left: 0.85rem;
            top: 50%;
            transform: translateY(-50%);
            opacity: 0.5;
            font-size: 0.9rem;
          }

          input {
            padding-left: 2.35rem;
          }
        }

        .select-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;

          .select-label {
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            color: var(--color-text-muted);
          }
        }
      }

      .filters-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 1rem;
        padding-top: 0.75rem;
        border-top: 1px solid rgba(0, 0, 0, 0.05);

        .count-badge {
          font-size: 0.825rem;
          color: var(--color-text-muted);

          strong {
            color: var(--color-primary);
            font-weight: 700;
          }
        }

        .btn-reset-filters {
          background: none;
          border: none;
          color: var(--color-danger);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-sm);

          &:hover {
            background: #fee2e2;
          }
        }
      }
    }

    /* 3D Flip Card System */
    .locations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 1.75rem;
    }

    .flip-card {
      background-color: transparent;
      height: 285px;
      perspective: 1200px;
      cursor: pointer;

      &:hover .flip-card-inner,
      &.is-flipped .flip-card-inner {
        transform: rotateY(180deg);
      }
    }

    .flip-card-inner {
      position: relative;
      width: 100%;
      height: 100%;
      text-align: left;
      transition: transform 0.65s cubic-bezier(0.2, 0.8, 0.2, 1);
      transform-style: preserve-3d;
    }

    .flip-card-face {
      position: absolute;
      width: 100%;
      height: 100%;
      -webkit-backface-visibility: hidden;
      backface-visibility: hidden;
      border-radius: var(--radius-lg);
      padding: 1.35rem 1.4rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border: 1px solid var(--color-border);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
    }

    /* Front Face */
    .flip-card-front {
      background: linear-gradient(155deg, #ffffff 0%, #faf8f5 100%);

      &:hover {
        border-color: rgba(45, 106, 79, 0.4);
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.08);
      }

      .card-header-front {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.25rem;

        .icon-avatar {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);

          .emoji-icon {
            font-size: 1.5rem;
          }
        }

        .badge-stock-pill {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-pill);
          background: #d8f3dc;
          color: #1b4332;

          &.empty {
            background: var(--color-sand);
            color: var(--color-text-muted);
            font-weight: 600;
          }
        }
      }

      .card-content-front {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        gap: 0.65rem;
        margin-top: 0.25rem;

        .location-path-crumb {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 0.15rem;

          .home-prefix {
            font-weight: 500;
          }

          .crumb-slash {
            margin: 0 0.3rem;
            opacity: 0.4;
          }

          .path-text {
            font-weight: 600;
            color: var(--color-primary);
          }
        }

        .location-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--color-text-main);
          margin-bottom: 0;
          line-height: 1.25;
        }

        .preview-products-box {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: var(--radius-md);
          padding: 0.65rem 0.85rem;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);

          .preview-label {
            font-size: 0.725rem;
            color: var(--color-text-muted);
            font-weight: 600;
            display: block;
            margin-bottom: 0.4rem;
          }

          .thumbnails-preview-row {
            display: flex;
            align-items: center;
            gap: 0.45rem;

            .thumb-wrapper {
              width: 36px;
              height: 36px;
              border-radius: 8px;
              overflow: hidden;
              background: #ffffff;
              border: 1px solid rgba(0, 0, 0, 0.1);
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
              display: flex;
              align-items: center;
              justify-content: center;

              .mini-thumb {
                width: 100%;
                height: 100%;
                object-fit: cover;
              }
            }

            .more-badge {
              font-size: 0.75rem;
              font-weight: 700;
              color: var(--color-primary);
              background: var(--color-primary-light);
              padding: 0.25rem 0.5rem;
              border-radius: var(--radius-pill);
            }
          }
        }

        .empty-location-hint {
          background: rgba(0, 0, 0, 0.025);
          border: 1px dashed rgba(0, 0, 0, 0.1);
          border-radius: var(--radius-md);
          padding: 0.65rem 0.85rem;
          font-size: 0.8rem;
          color: var(--color-text-muted);
          display: inline-block;
        }
      }
    }

    /* Back Face */
    .flip-card-back {
      background: #ffffff;
      transform: rotateY(180deg);
      border-color: var(--color-primary);
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.12);

      .back-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 0.6rem;
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);

        .back-title-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          min-width: 0;

          .back-icon {
            font-size: 1.35rem;
          }

          .back-heading {
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--color-text-main);
            margin: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .back-subpath {
            font-size: 0.7rem;
            color: var(--color-text-muted);
            display: block;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }

      .back-items-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.45rem;
        overflow: hidden;
        margin: 0.45rem 0;

        .empty-stock-state {
          text-align: center;
          padding: 1.25rem 0.5rem;
          color: var(--color-text-muted);

          .empty-box-icon {
            font-size: 1.6rem;
            display: block;
            margin-bottom: 0.25rem;
            opacity: 0.6;
          }

          p {
            font-size: 0.8rem;
            margin: 0;
          }
        }

        .back-item-row {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.35rem 0.55rem;
          background: var(--color-sand);
          border-radius: var(--radius-sm);
          border: 1px solid rgba(0, 0, 0, 0.04);
          transition: background 0.15s ease;

          &:hover {
            background: #ede8e1;
          }

          .back-thumb {
            width: 30px;
            height: 30px;
            border-radius: 6px;
            object-fit: cover;
            background: #ffffff;
            border: 1px solid rgba(0, 0, 0, 0.08);
            flex-shrink: 0;
          }

          .back-item-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex: 1;
            min-width: 0;

            .back-item-title {
              font-size: 0.775rem;
              font-weight: 600;
              color: var(--color-text-main);
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              padding-right: 0.5rem;
            }

            .back-item-quantity {
              font-size: 0.75rem;
              font-weight: 700;
              color: var(--color-primary);
              white-space: nowrap;
            }
          }
        }

        .btn-view-more {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-primary);
          background: var(--color-primary-light);
          border: 1px dashed rgba(45, 106, 79, 0.35);
          border-radius: var(--radius-sm);
          padding: 0.35rem 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
          margin-top: 0.15rem;

          &:hover {
            background: #d8f3dc;
            border-color: var(--color-primary);
            transform: translateY(-1px);
          }

          &.subtle {
            font-size: 0.725rem;
            background: transparent;
            border-style: solid;
            border-color: rgba(0, 0, 0, 0.08);
            color: var(--color-text-muted);

            &:hover {
              background: var(--color-primary-light);
              color: var(--color-primary);
              border-color: var(--color-primary);
            }
          }
        }
      }

      .back-footer-actions {
        margin-top: auto;
        padding-top: 0.55rem;
        border-top: 1px solid rgba(0, 0, 0, 0.06);
        display: flex;
        flex-direction: column;
        gap: 0.4rem;

        .btn-add-here {
          width: 100%;
          font-weight: 600;
          padding: 0.35rem 0.5rem;
          box-shadow: 0 2px 6px rgba(45, 106, 79, 0.15);
        }

        .back-secondary-row {
          display: flex;
          gap: 0.4rem;

          .flex-1 {
            flex: 1;
          }
        }
      }
    }

    .empty-card {
      grid-column: 1 / -1;
      text-align: center;
      padding: 3.5rem 2rem;
      color: var(--color-text-muted);

      .empty-icon {
        font-size: 2.75rem;
        display: block;
        margin-bottom: 0.5rem;
      }
    }

    /* Modal Backdrop */
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

    /* Modal pop-up de todos los elementos de la ubicación */
    .location-items-modal {
      max-width: 580px;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      padding: 1.75rem;

      .modal-title-with-icon {
        display: flex;
        align-items: center;
        gap: 0.85rem;

        .modal-loc-icon {
          font-size: 2.2rem;
        }

        h3 {
          margin: 0 0 0.15rem 0;
          font-size: 1.35rem;
          color: var(--color-text-main);
        }

        .modal-loc-path {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          font-weight: 500;
        }
      }

      .items-modal-body {
        margin-top: 1rem;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .items-modal-meta {
        margin-bottom: 0.85rem;
      }

      .location-full-items-list {
        max-height: 380px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 0.65rem;
        padding-right: 0.35rem;

        .location-full-item-card {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.75rem 0.9rem;
          border-radius: var(--radius-md);
          background: #ffffff;
          border: 1px solid var(--color-border);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
          transition: all 0.15s ease;

          &:hover {
            border-color: var(--color-primary);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
          }

          .modal-item-thumb {
            width: 44px;
            height: 44px;
            border-radius: 8px;
            object-fit: cover;
            border: 1px solid rgba(0, 0, 0, 0.08);
            background: #fafafa;
            flex-shrink: 0;
          }

          .modal-item-info {
            flex: 1;
            min-width: 0;

            .modal-item-title-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 0.5rem;
              margin-bottom: 0.25rem;

              .modal-item-name {
                font-size: 0.95rem;
                font-weight: 700;
                margin: 0;
                color: var(--color-text-main);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }

              .modal-category-chip {
                font-size: 0.7rem;
                font-weight: 600;
                padding: 0.15rem 0.55rem;
                border-radius: var(--radius-pill);
                background: var(--color-sand);
                color: var(--color-text-muted);
                flex-shrink: 0;
              }
            }

            .modal-item-details-row {
              display: flex;
              align-items: center;
              gap: 0.75rem;
              font-size: 0.8rem;

              .modal-stock-badge {
                color: var(--color-primary);
                font-weight: 600;
              }

              .modal-type-chip {
                font-size: 0.7rem;
                padding: 0.1rem 0.45rem;
                border-radius: 4px;
                background: rgba(0, 0, 0, 0.04);
                color: var(--color-text-muted);

                &.consumable {
                  background: #e0f2fe;
                  color: #0369a1;
                  font-weight: 500;
                }
              }
            }
          }
        }
      }
    }
  `]
})
export class LocationsComponent {
  locations = signal<Location[]>([]);
  items = signal<Item[]>([]);
  searchQuery = '';
  selectedParentId: number | null = null;
  stockFilter: 'ALL' | 'WITH_STOCK' | 'EMPTY' = 'ALL';

  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  showModal = signal<boolean>(false);
  editingLocation: Location | null = null;
  modalName = '';
  modalParentId: number | null = null;
  locationToArchive = signal<Location | null>(null);
  locationForItemsModal = signal<Location | null>(null);

  flippedCardId = signal<number | null>(null);

  constructor(
    public householdService: HouseholdService,
    public productImageService: ProductImageService,
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

  rootLocations(): Location[] {
    return this.locations().filter(l => !l.parentId);
  }

  filteredLocations(): Location[] {
    const q = this.searchQuery.toLowerCase().trim();
    return this.locations().filter(l => {
      const matchesQuery = !q || l.name.toLowerCase().includes(q) || l.fullPath.toLowerCase().includes(q);
      
      let matchesParent = true;
      if (this.selectedParentId !== null) {
        const rootLoc = this.locations().find(p => p.id === this.selectedParentId);
        const rootName = rootLoc ? rootLoc.name : '';
        matchesParent = l.id === this.selectedParentId || 
                        l.parentId === this.selectedParentId || 
                        (rootName.length > 0 && l.fullPath.startsWith(rootName));
      }

      const itemCount = this.getItemsInLocation(l.id).length;
      let matchesStock = true;
      if (this.stockFilter === 'WITH_STOCK') {
        matchesStock = itemCount > 0;
      } else if (this.stockFilter === 'EMPTY') {
        matchesStock = itemCount === 0;
      }

      return matchesQuery && matchesParent && matchesStock;
    });
  }

  resetFilters() {
    this.searchQuery = '';
    this.selectedParentId = null;
    this.stockFilter = 'ALL';
  }

  getLocationIcon(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('cocina')) return '🍳';
    if (n.includes('frigo') || n.includes('nevera')) return '❄️';
    if (n.includes('congelador')) return '🧊';
    if (n.includes('despensa')) return '🥫';
    if (n.includes('armario')) return '🚪';
    if (n.includes('cómoda') || n.includes('cajón') || n.includes('cajon')) return '🗄️';
    if (n.includes('dormitorio') || n.includes('habitaci')) return '🛏️';
    if (n.includes('baño') || n.includes('aseo')) return '🛁';
    if (n.includes('salón') || n.includes('comedor')) return '🛋️';
    if (n.includes('balda') || n.includes('estanter')) return '📚';
    if (n.includes('trastero') || n.includes('garaje')) return '📦';
    if (n.includes('mueble')) return '🪑';
    return '📍';
  }

  toggleCardFlip(locId: number) {
    this.flippedCardId.update(curr => curr === locId ? null : locId);
  }

  openLocationItemsModal(loc: Location, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.locationForItemsModal.set(loc);
  }

  closeLocationItemsModal() {
    this.locationForItemsModal.set(null);
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

  availableParents(): Location[] {
    if (!this.editingLocation) return this.locations();
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
    this.modalParentId = loc.parentId || null;
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingLocation = null;
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
          this.successMessage.set(`Ubicación "${payload.name}" actualizada con éxito.`);
          this.closeModal();
          this.loadLocations();
        },
        error: (err) => this.errorMessage.set(err.error?.error || 'Error al actualizar ubicación')
      });
    } else {
      this.locationService.createLocation(active.id, payload).subscribe({
        next: () => {
          this.successMessage.set(`Ubicación "${payload.name}" creada con éxito.`);
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
