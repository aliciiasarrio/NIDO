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
            <p class="subtitle">Espacios y zonas de almacenamiento organizados</p>
          </div>
          <button class="btn btn-primary btn-create-location" (click)="openCreateModal()">
            <svg class="svg-icon-btn" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Nueva Ubicación
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
              <span class="input-icon">
                <svg class="svg-icon-search" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </span>
              <input 
                type="text" 
                [(ngModel)]="searchQuery" 
                placeholder="Buscar ubicación por nombre o ruta..." 
                class="form-control"
              />
            </div>

            <div class="select-group">
              <label class="select-label">Estancia principal:</label>
              <select [(ngModel)]="selectedParentId" class="form-control">
                <option [ngValue]="null">Todas las estancias</option>
                <option *ngFor="let root of rootLocations()" [ngValue]="root.id">
                  {{ root.name }}
                </option>
              </select>
            </div>

            <div class="select-group">
              <label class="select-label">Estado de existencias:</label>
              <select [(ngModel)]="stockFilter" class="form-control">
                <option value="ALL">Todas las ubicaciones</option>
                <option value="WITH_STOCK">Con artículos registrados</option>
                <option value="EMPTY">Sin existencias</option>
              </select>
            </div>
          </div>

          <div class="filters-meta">
            <span class="count-badge">
              <strong>{{ filteredLocations().length }}</strong> {{ filteredLocations().length === 1 ? 'ubicación disponible' : 'ubicaciones disponibles' }}
            </span>
            <button 
              *ngIf="searchQuery || selectedParentId !== null || stockFilter !== 'ALL'" 
              class="btn-reset-filters" 
              (click)="resetFilters()"
            >
              <svg class="svg-icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              Limpiar filtros
            </button>
          </div>
        </div>

        <!-- 3D Interactive Flip Cards Grid -->
        <div class="locations-grid">
          <div *ngIf="filteredLocations().length === 0" class="card empty-card">
            <div class="empty-icon-box">
              <svg class="svg-empty" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <p>No se encontraron ubicaciones con los criterios de búsqueda.</p>
            <button class="btn btn-secondary btn-sm mt-3" (click)="resetFilters()">
              Restablecer filtros
            </button>
          </div>

          <div 
            *ngFor="let loc of filteredLocations()" 
            class="flip-card"
            [class.is-flipped]="flippedCardId() === loc.id"
            (click)="toggleCardFlip(loc.id)"
          >
            <div class="flip-card-inner">
              
              <!-- CARA FRONTAL (FRONT FACE) -->
              <div class="flip-card-face flip-card-front card">
                <div class="card-header-front">
                  <div class="icon-avatar">
                    <ng-container [ngSwitch]="getLocationType(loc.name)">
                      <svg *ngSwitchCase="'kitchen'" class="loc-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
                      <svg *ngSwitchCase="'cold'" class="loc-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"></rect><line x1="5" y1="10" x2="19" y2="10"></line><line x1="9" y1="6" x2="9" y2="8"></line><line x1="9" y1="14" x2="9" y2="17"></line></svg>
                      <svg *ngSwitchCase="'storage'" class="loc-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                      <svg *ngSwitchCase="'wardrobe'" class="loc-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="12" y1="2" x2="12" y2="22"></line><line x1="9" y1="10" x2="9" y2="12"></line><line x1="15" y1="10" x2="15" y2="12"></line></svg>
                      <svg *ngSwitchCase="'bedroom'" class="loc-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16"></path><path d="M2 8h18a2 2 0 0 1 2 2v10"></path><path d="M2 17h20"></path><path d="M6 8v9"></path></svg>
                      <svg *ngSwitchCase="'bathroom'" class="loc-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6h6a3 3 0 0 1 3 3v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9a3 3 0 0 1 3-3z"></path><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3z"></path><line x1="6" y1="19" x2="6" y2="22"></line><line x1="18" y1="19" x2="18" y2="22"></line></svg>
                      <svg *ngSwitchCase="'living'" class="loc-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3"></path><path d="M2 11a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7z"></path><path d="M4 18v2"></path><path d="M20 18v2"></path></svg>
                      <svg *ngSwitchDefault class="loc-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                    </ng-container>
                  </div>
                  <div 
                    class="badge-stock-pill" 
                    [class.empty]="getItemsInLocation(loc.id).length === 0"
                  >
                    {{ getItemsInLocation(loc.id).length }} {{ getItemsInLocation(loc.id).length === 1 ? 'artículo' : 'artículos' }}
                  </div>
                </div>

                <div class="card-content-front">
                  <div class="location-path-crumb" [title]="loc.fullPath">
                    <span class="home-prefix">{{ householdService.activeHousehold()?.name }}</span>
                    <span class="crumb-slash">/</span>
                    <span class="path-text">{{ loc.fullPath }}</span>
                  </div>

                  <h3 class="location-title">{{ loc.name }}</h3>

                  <!-- Contenedor de artículos con botón explícito para ver todos -->
                  <div class="preview-products-box" *ngIf="getItemsInLocation(loc.id).length > 0">
                    <div class="preview-header-row">
                      <span class="preview-label">Artículos almacenados</span>
                      <button 
                        type="button" 
                        class="btn-expand-trigger" 
                        (click)="openLocationItemsModal(loc, $event)"
                        title="Ver todos los artículos en esta ubicación"
                      >
                        <span>Ver todos ({{ getItemsInLocation(loc.id).length }})</span>
                        <svg class="svg-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                      </button>
                    </div>

                    <div class="thumbnails-preview-row" (click)="openLocationItemsModal(loc, $event)" title="Haz clic para ver todos los artículos">
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
                    <svg class="svg-hint-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                    <span>Espacio disponible sin existencias</span>
                  </div>
                </div>
              </div>

              <!-- CARA TRASERA (BACK FACE) -->
              <div class="flip-card-face flip-card-back card">
                <div class="back-header">
                  <div class="back-title-group">
                    <div class="back-avatar">
                      <ng-container [ngSwitch]="getLocationType(loc.name)">
                        <svg *ngSwitchCase="'kitchen'" class="loc-svg-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
                        <svg *ngSwitchCase="'cold'" class="loc-svg-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="2" width="14" height="20" rx="2"></rect><line x1="5" y1="10" x2="19" y2="10"></line><line x1="9" y1="6" x2="9" y2="8"></line><line x1="9" y1="14" x2="9" y2="17"></line></svg>
                        <svg *ngSwitchCase="'storage'" class="loc-svg-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                        <svg *ngSwitchCase="'wardrobe'" class="loc-svg-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="12" y1="2" x2="12" y2="22"></line><line x1="9" y1="10" x2="9" y2="12"></line><line x1="15" y1="10" x2="15" y2="12"></line></svg>
                        <svg *ngSwitchCase="'bedroom'" class="loc-svg-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 4v16"></path><path d="M2 8h18a2 2 0 0 1 2 2v10"></path><path d="M2 17h20"></path><path d="M6 8v9"></path></svg>
                        <svg *ngSwitchCase="'bathroom'" class="loc-svg-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 6h6a3 3 0 0 1 3 3v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9a3 3 0 0 1 3-3z"></path><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3z"></path><line x1="6" y1="19" x2="6" y2="22"></line><line x1="18" y1="19" x2="18" y2="22"></line></svg>
                        <svg *ngSwitchCase="'living'" class="loc-svg-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3"></path><path d="M2 11a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7z"></path><path d="M4 18v2"></path><path d="M20 18v2"></path></svg>
                        <svg *ngSwitchDefault class="loc-svg-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                      </ng-container>
                    </div>
                    <div>
                      <h4 class="back-heading">{{ loc.name }}</h4>
                      <span class="back-subpath">{{ loc.fullPath }}</span>
                    </div>
                  </div>
                </div>

                <!-- Lista fija de productos (MÁXIMO 2 productos, SIN SCROLL) -->
                <div class="back-items-container">
                  <div *ngIf="getItemsInLocation(loc.id).length === 0" class="empty-stock-state">
                    <svg class="empty-box-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                    <p>Sin productos registrados</p>
                  </div>

                  <!-- Solo los primeros 2 productos que caben en la vista -->
                  <div *ngFor="let it of getItemsInLocation(loc.id).slice(0, 2)" class="back-item-row">
                    <img [src]="productImageService.getImage(it)" [alt]="it.name" class="back-thumb" />
                    <div class="back-item-meta">
                      <span class="back-item-title" [title]="it.name">{{ it.name }}</span>
                      <span class="back-item-quantity">{{ getStockQtyInLocation(it, loc.id) }} {{ it.unit }}</span>
                    </div>
                  </div>

                  <!-- Botón SIEMPRE presente si hay productos para ampliar y ver la lista completa -->
                  <button 
                    *ngIf="getItemsInLocation(loc.id).length > 0" 
                    type="button" 
                    class="btn-expand-full-view" 
                    (click)="openLocationItemsModal(loc, $event)"
                    title="Ampliar y ver listado completo"
                  >
                    <svg class="svg-icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"></path><path d="M10 14L21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg>
                    Ver todos los artículos ({{ getItemsInLocation(loc.id).length }})
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
                    <svg class="svg-icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Añadir producto
                  </button>

                  <div class="back-secondary-row">
                    <button 
                      type="button" 
                      class="btn btn-sm btn-secondary flex-1" 
                      (click)="$event.stopPropagation(); openEditModal(loc)"
                    >
                      <svg class="svg-icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      Editar
                    </button>
                    <button 
                      type="button" 
                      class="btn btn-sm btn-outline-danger flex-1" 
                      (click)="$event.stopPropagation(); archiveLocation(loc)"
                    >
                      <svg class="svg-icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      Archivar
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
            <button class="close-btn" (click)="closeModal()" aria-label="Cerrar modal">
              <svg class="svg-icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
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
              <span class="form-hint">Permite crear jerarquías organizadas (ej. Cocina > Armario > Balda).</span>
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
            <svg class="confirm-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <div class="confirm-content">
            <h3>Archivar ubicación</h3>
            <p class="confirm-desc">
              ¿Estás seguro de que deseas archivar <strong>"{{ locationToArchive()?.name }}"</strong>?
            </p>
            <p class="confirm-sub">Esta acción solo se completará si no contiene sububicaciones activas en su interior.</p>
          </div>
          <div class="confirm-actions">
            <button type="button" class="btn btn-secondary" (click)="cancelArchiveLocation()">
              Cancelar
            </button>
            <button type="button" class="btn btn-danger" (click)="confirmArchiveLocation()">
              Confirmar archivado
            </button>
          </div>
        </div>
      </div>

      <!-- Pop-up Modal: Todos los elementos registrados en la ubicación -->
      <div *ngIf="locationForItemsModal()" class="modal-backdrop" (click)="closeLocationItemsModal()">
        <div class="modal-card card location-items-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title-with-icon">
              <div class="modal-avatar">
                <ng-container [ngSwitch]="getLocationType(locationForItemsModal()!.name)">
                  <svg *ngSwitchCase="'kitchen'" class="loc-svg-modal" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
                  <svg *ngSwitchCase="'cold'" class="loc-svg-modal" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"></rect><line x1="5" y1="10" x2="19" y2="10"></line><line x1="9" y1="6" x2="9" y2="8"></line><line x1="9" y1="14" x2="9" y2="17"></line></svg>
                  <svg *ngSwitchCase="'storage'" class="loc-svg-modal" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                  <svg *ngSwitchCase="'wardrobe'" class="loc-svg-modal" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="12" y1="2" x2="12" y2="22"></line><line x1="9" y1="10" x2="9" y2="12"></line><line x1="15" y1="10" x2="15" y2="12"></line></svg>
                  <svg *ngSwitchCase="'bedroom'" class="loc-svg-modal" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16"></path><path d="M2 8h18a2 2 0 0 1 2 2v10"></path><path d="M2 17h20"></path><path d="M6 8v9"></path></svg>
                  <svg *ngSwitchCase="'bathroom'" class="loc-svg-modal" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6h6a3 3 0 0 1 3 3v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9a3 3 0 0 1 3-3z"></path><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3z"></path><line x1="6" y1="19" x2="6" y2="22"></line><line x1="18" y1="19" x2="18" y2="22"></line></svg>
                  <svg *ngSwitchCase="'living'" class="loc-svg-modal" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3"></path><path d="M2 11a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7z"></path><path d="M4 18v2"></path><path d="M20 18v2"></path></svg>
                  <svg *ngSwitchDefault class="loc-svg-modal" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                </ng-container>
              </div>
              <div>
                <h3>{{ locationForItemsModal()!.name }}</h3>
                <span class="modal-loc-path">{{ locationForItemsModal()!.fullPath }}</span>
              </div>
            </div>
            <button type="button" class="close-btn" (click)="closeLocationItemsModal()" aria-label="Cerrar modal">
              <svg class="svg-icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div class="modal-body items-modal-body">
            <div class="items-modal-meta">
              <span class="badge-stock-pill" [class.empty]="getItemsInLocation(locationForItemsModal()!.id).length === 0">
                {{ getItemsInLocation(locationForItemsModal()!.id).length }} {{ getItemsInLocation(locationForItemsModal()!.id).length === 1 ? 'artículo registrado' : 'artículos registrados' }}
              </span>
            </div>

            <!-- Listado completo de productos en el pop-up -->
            <div class="location-full-items-list custom-scroll">
              <div *ngIf="getItemsInLocation(locationForItemsModal()!.id).length === 0" class="empty-stock-state">
                <svg class="empty-box-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                <p>No hay artículos guardados en esta ubicación todavía.</p>
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
                      <svg class="svg-inline-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                      <strong>{{ getStockQtyInLocation(it, locationForItemsModal()!.id) }}</strong> {{ it.unit }}
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
              <svg class="svg-icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Añadir producto
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
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;

            .svg-icon-search {
              width: 16px;
              height: 16px;
              color: #64748b;
            }
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
            font-size: 0.725rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            color: #64748b;
          }
        }
      }

      .filters-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 1rem;
        padding-top: 0.75rem;
        border-top: 1px solid #f1f5f9;

        .count-badge {
          font-size: 0.825rem;
          color: #64748b;

          strong {
            color: #0f172a;
            font-weight: 700;
          }
        }

        .btn-reset-filters {
          background: none;
          border: 1px solid #fecaca;
          color: #b91c1c;
          font-size: 0.775rem;
          font-weight: 600;
          cursor: pointer;
          padding: 0.25rem 0.6rem;
          border-radius: var(--radius-sm);
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          transition: background 0.15s ease;

          &:hover {
            background: #fef2f2;
          }

          .svg-icon-xs {
            width: 12px;
            height: 12px;
          }
        }
      }
    }

    .svg-icon-btn {
      width: 16px;
      height: 16px;
      margin-right: 0.4rem;
      vertical-align: middle;
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
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
    }

    /* Front Face */
    .flip-card-front {
      background: linear-gradient(160deg, #ffffff 0%, #f8fafc 100%);

      &:hover {
        border-color: #94a3b8;
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.07);
      }

      .card-header-front {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.25rem;

        .icon-avatar {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #475569;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);

          .loc-svg {
            width: 20px;
            height: 20px;
            color: #475569;
          }
        }

        .badge-stock-pill {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.3rem 0.65rem;
          border-radius: var(--radius-pill);
          background: #f0fdf4;
          color: #166534;
          border: 1px solid #bbf7d0;

          &.empty {
            background: #f8fafc;
            color: #64748b;
            border-color: #e2e8f0;
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
          font-size: 0.725rem;
          color: #64748b;
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
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0;
          line-height: 1.25;
        }

        .preview-products-box {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: var(--radius-md);
          padding: 0.75rem 0.85rem;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);

          .preview-header-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.45rem;

            .preview-label {
              font-size: 0.7rem;
              color: #64748b;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.03em;
            }

            .btn-expand-trigger {
              background: transparent;
              border: none;
              padding: 0;
              color: var(--color-primary);
              font-size: 0.75rem;
              font-weight: 600;
              cursor: pointer;
              display: inline-flex;
              align-items: center;
              gap: 0.25rem;
              transition: all 0.15s ease;

              &:hover {
                color: #14532d;
                text-decoration: underline;

                .svg-chevron {
                  transform: translateX(2px);
                }
              }

              .svg-chevron {
                width: 12px;
                height: 12px;
                transition: transform 0.15s ease;
              }
            }
          }

          .thumbnails-preview-row {
            display: flex;
            align-items: center;
            gap: 0.45rem;
            cursor: pointer;

            &:hover {
              opacity: 0.88;
            }

            .thumb-wrapper {
              width: 36px;
              height: 36px;
              border-radius: 6px;
              overflow: hidden;
              background: #ffffff;
              border: 1px solid #e2e8f0;
              box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
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
              font-size: 0.725rem;
              font-weight: 600;
              color: #334155;
              background: #f1f5f9;
              border: 1px solid #e2e8f0;
              padding: 0.2rem 0.5rem;
              border-radius: var(--radius-pill);
            }
          }
        }

        .empty-location-hint {
          background: #f8fafc;
          border: 1px dashed #cbd5e1;
          border-radius: var(--radius-md);
          padding: 0.75rem 0.85rem;
          font-size: 0.8rem;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 0.5rem;

          .svg-hint-icon {
            width: 16px;
            height: 16px;
            color: #94a3b8;
            flex-shrink: 0;
          }
        }
      }
    }

    /* Back Face */
    .flip-card-back {
      background: #ffffff;
      transform: rotateY(180deg);
      border-color: var(--color-primary);
      box-shadow: 0 16px 36px rgba(15, 23, 42, 0.1);

      .back-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 0.6rem;
        border-bottom: 1px solid #e2e8f0;

        .back-title-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          min-width: 0;

          .back-avatar {
            width: 28px;
            height: 28px;
            border-radius: 6px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #475569;
            flex-shrink: 0;

            .loc-svg-sm {
              width: 15px;
              height: 15px;
            }
          }

          .back-heading {
            font-size: 1.05rem;
            font-weight: 700;
            color: #0f172a;
            margin: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .back-subpath {
            font-size: 0.7rem;
            color: #64748b;
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
          color: #64748b;

          .empty-box-svg {
            width: 30px;
            height: 30px;
            color: #94a3b8;
            margin: 0 auto 0.35rem auto;
            display: block;
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
          background: #f8fafc;
          border-radius: var(--radius-sm);
          border: 1px solid #e2e8f0;

          .back-thumb {
            width: 30px;
            height: 30px;
            border-radius: 6px;
            object-fit: cover;
            background: #ffffff;
            border: 1px solid #e2e8f0;
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
              color: #0f172a;
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

        .btn-expand-full-view {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          font-size: 0.775rem;
          font-weight: 600;
          color: var(--color-primary);
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: var(--radius-sm);
          padding: 0.45rem 0.65rem;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: center;
          margin-top: 0.2rem;

          &:hover {
            background: #dcfce7;
            border-color: #86efac;
            color: #14532d;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          }

          .svg-icon-xs {
            width: 13px;
            height: 13px;
          }
        }
      }

      .back-footer-actions {
        margin-top: auto;
        padding-top: 0.55rem;
        border-top: 1px solid #e2e8f0;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;

        .btn-add-here {
          width: 100%;
          font-weight: 600;
          padding: 0.4rem 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;

          .svg-icon-xs {
            width: 13px;
            height: 13px;
          }
        }

        .back-secondary-row {
          display: flex;
          gap: 0.4rem;

          .btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.35rem;

            .svg-icon-xs {
              width: 13px;
              height: 13px;
            }
          }

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
      color: #64748b;

      .empty-icon-box {
        display: flex;
        justify-content: center;
        margin-bottom: 0.75rem;

        .svg-empty {
          width: 44px;
          height: 44px;
          color: #cbd5e1;
        }
      }
    }

    /* Modal Backdrop */
    .modal-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 23, 42, 0.55);
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
      background: #ffffff;
      border: 1px solid #e2e8f0;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    .confirm-modal {
      text-align: center;

      .confirm-icon-box {
        display: flex;
        justify-content: center;
        margin-bottom: 1rem;

        .confirm-svg {
          width: 36px;
          height: 36px;
          color: #dc2626;
        }
      }

      .confirm-desc {
        color: #0f172a;
        font-size: 0.95rem;
        margin: 0.5rem 0;
      }

      .confirm-sub {
        font-size: 0.8rem;
        color: #64748b;
        margin-bottom: 1.25rem;
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;

      .close-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.35rem;
        border-radius: 6px;
        color: #64748b;
        transition: background 0.15s ease, color 0.15s ease;

        &:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .svg-icon-close {
          width: 18px;
          height: 18px;
        }
      }
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.5rem;

      .btn {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
      }
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

        .modal-avatar {
          width: 42px;
          height: 42px;
          border-radius: 8px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-primary);
          flex-shrink: 0;

          .loc-svg-modal {
            width: 22px;
            height: 22px;
          }
        }

        h3 {
          margin: 0 0 0.15rem 0;
          font-size: 1.3rem;
          color: #0f172a;
        }

        .modal-loc-path {
          font-size: 0.775rem;
          color: #64748b;
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
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
          transition: all 0.15s ease;

          &:hover {
            border-color: #94a3b8;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          }

          .modal-item-thumb {
            width: 44px;
            height: 44px;
            border-radius: 6px;
            object-fit: cover;
            border: 1px solid #e2e8f0;
            background: #f8fafc;
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
                color: #0f172a;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }

              .modal-category-chip {
                font-size: 0.7rem;
                font-weight: 600;
                padding: 0.15rem 0.55rem;
                border-radius: var(--radius-pill);
                background: #f1f5f9;
                color: #475569;
                border: 1px solid #e2e8f0;
                flex-shrink: 0;
              }
            }

            .modal-item-details-row {
              display: flex;
              align-items: center;
              gap: 0.75rem;
              font-size: 0.8rem;

              .modal-stock-badge {
                color: #166534;
                font-weight: 600;

                .svg-inline-xs {
                  width: 13px;
                  height: 13px;
                  color: #166534;
                  margin-right: 0.25rem;
                  vertical-align: -1px;
                }
              }

              .modal-type-chip {
                font-size: 0.7rem;
                padding: 0.1rem 0.45rem;
                border-radius: 4px;
                background: #f1f5f9;
                color: #64748b;
                border: 1px solid #e2e8f0;

                &.consumable {
                  background: #eff6ff;
                  color: #1d4ed8;
                  border-color: #bfdbfe;
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

  getLocationType(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('cocina')) return 'kitchen';
    if (n.includes('frigo') || n.includes('nevera') || n.includes('congelador')) return 'cold';
    if (n.includes('despensa') || n.includes('almacén') || n.includes('trastero') || n.includes('garaje')) return 'storage';
    if (n.includes('armario') || n.includes('cómoda') || n.includes('cajón') || n.includes('cajon')) return 'wardrobe';
    if (n.includes('dormitorio') || n.includes('habitaci')) return 'bedroom';
    if (n.includes('baño') || n.includes('aseo')) return 'bathroom';
    if (n.includes('salón') || n.includes('comedor')) return 'living';
    return 'room';
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
