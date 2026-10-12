import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from './services/auth.service';
import { HouseholdService } from './services/household.service';
import { Household } from './models/nido.models';
import { AiAssistantComponent } from './components/ai-assistant/ai-assistant.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, FormsModule, AiAssistantComponent],
  template: `
    <div class="app-layout" [class.unauthenticated]="!authService.currentUser()">
      <!-- Navigation Bar (Only for logged users) -->
      <header *ngIf="authService.currentUser()" class="navbar">
        <div class="nav-container">
          <div class="nav-brand">
            <a routerLink="/" class="brand-link" title="NIDO - Inicio">
              <img src="favicon.svg" alt="NIDO Logo" class="brand-logo" width="32" height="32">
              <span class="brand-title">NIDO</span>
            </a>

            <!-- Household Switcher -->
            <div class="household-switcher" *ngIf="householdService.households().length > 0">
              <select 
                [ngModel]="householdService.activeHousehold()?.id" 
                (ngModelChange)="onHouseholdChange($event)"
                class="household-select"
              >
                <option *ngFor="let h of householdService.households()" [value]="h.id">
                  {{ h.name }} ({{ h.role === 'OWNER' ? 'Propietario' : 'Miembro' }})
                </option>
              </select>
              <button class="btn btn-sm btn-secondary" (click)="openCreateHouseholdModal()" title="Crear o unirse a hogar">
                + Hogar
              </button>
            </div>
          </div>

          <!-- Navigation Links -->
          <nav class="nav-menu">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
              Panel
            </a>
            <a routerLink="/inventory" routerLinkActive="active" class="nav-item">
              Inventario
            </a>
            <a routerLink="/locations" routerLinkActive="active" class="nav-item">
              Ubicaciones
            </a>
            <a routerLink="/shopping" routerLinkActive="active" class="nav-item">
              Compra
            </a>
            <a routerLink="/recipes" routerLinkActive="active" class="nav-item">
              Recetas
            </a>
            <a routerLink="/clothing" routerLinkActive="active" class="nav-item">
              Ropa
            </a>
          </nav>

          <!-- User controls -->
          <div class="nav-user">
            <div class="user-info">
              <span class="user-avatar">{{ authService.currentUser()?.name?.charAt(0) || 'U' }}</span>
              <span class="user-name">{{ authService.currentUser()?.name }}</span>
            </div>
            <button class="btn btn-sm btn-outline-primary" (click)="logout()">
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <!-- Main Outlet Content -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>

      <!-- Create / Join Household Modal -->
      <div *ngIf="householdService.showModal()" class="modal-backdrop">
        <div class="modal-card card">
          <div class="modal-header">
            <h3>Gestión de Hogares</h3>
            <button class="close-btn" (click)="closeHouseholdModal()">✕</button>
          </div>
          <div class="modal-body">
            <!-- Create new household -->
            <div class="section">
              <h4>Crear un nuevo hogar</h4>
              <div class="form-group">
                <input 
                  type="text" 
                  [(ngModel)]="newHouseholdName" 
                  placeholder="Ej. Casa de la Playa, Piso Madrid" 
                  class="form-control"
                />
              </div>
              <button 
                class="btn btn-primary btn-sm" 
                [disabled]="!newHouseholdName.trim() || isProcessingHousehold()" 
                (click)="createHousehold()"
              >
                Crear Hogar
              </button>
            </div>

            <hr class="separator" />

            <!-- Join with code -->
            <div class="section">
              <h4>Unirse a un hogar con código</h4>
              <div class="form-group">
                <input 
                  type="text" 
                  [(ngModel)]="joinCode" 
                  placeholder="Código de invitación (Ej. 8 letras)" 
                  class="form-control"
                />
              </div>
              <button 
                class="btn btn-secondary btn-sm" 
                [disabled]="!joinCode.trim() || isProcessingHousehold()" 
                (click)="joinHousehold()"
              >
                Unirse con código
              </button>
            </div>

            <!-- Current Household Invitation Code Generator & Starter Data -->
            <div *ngIf="householdService.activeHousehold()" class="section invitation-section">
              <hr class="separator" />
              <h4>Poblar hogar con productos de ejemplo</h4>
              <p class="form-hint">Añade al instante alimentos básicos, productos de limpieza y ropa con ubicaciones y caducidades para probar todas las funciones sin teclear:</p>
              <button class="btn btn-secondary btn-sm" (click)="populateCurrentHousehold()" [disabled]="isProcessingHousehold()">
                Poblar despensa y ubicaciones
              </button>

              <hr class="separator" />
              <h4>Invitar miembros a "{{ householdService.activeHousehold()?.name }}"</h4>
              <button class="btn btn-outline-primary btn-sm" (click)="generateInvitation()">
                Generar código de invitación
              </button>
              <div *ngIf="generatedCode()" class="code-box">
                <span>Código: <strong>{{ generatedCode() }}</strong></span>
                <small>Válido por 7 días. Comparte este código con quien quieras invitar.</small>
              </div>
            </div>

            <div *ngIf="householdError()" class="alert alert-danger" style="margin-top: 1rem;">
              {{ householdError() }}
            </div>
          </div>
        </div>
      </div>

      <!-- AI Assistant Panel (available for authenticated users) -->
      <app-ai-assistant *ngIf="authService.currentUser()"></app-ai-assistant>
    </div>
  `,
  styles: [`
    .app-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .navbar {
      background-color: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: var(--shadow-xs);
    }

    .nav-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0.75rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .brand-link {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      font-family: var(--font-display);
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--color-primary);
      text-decoration: none;
      transition: transform var(--transition-fast), opacity var(--transition-fast);

      &:hover {
        opacity: 0.92;
        transform: translateY(-1px);
      }

      .brand-logo {
        width: 32px;
        height: 32px;
        border-radius: 9px;
        box-shadow: 0 2px 8px rgba(27, 67, 50, 0.2);
        display: block;
        transition: transform 0.2s ease;
      }

      &:hover .brand-logo {
        transform: scale(1.05);
      }

      .brand-title {
        letter-spacing: -0.01em;
        font-weight: 800;
      }
    }

    .household-switcher {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .household-select {
        padding: 0.45rem 0.75rem;
        border-radius: var(--radius-md);
        border: 1.5px solid var(--color-border);
        font-size: 0.85rem;
        font-weight: 600;
        background-color: var(--color-sand);
        color: var(--color-text-main);
        cursor: pointer;

        &:focus {
          outline: none;
          border-color: var(--color-primary);
        }
      }
    }

    .nav-menu {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;

      .nav-item {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.5rem 0.85rem;
        border-radius: var(--radius-md);
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--color-text-muted);
        text-decoration: none;
        transition: all var(--transition-fast);

        &:hover {
          color: var(--color-text-main);
          background-color: var(--color-sand);
        }

        &.active {
          color: var(--color-primary);
          background-color: var(--color-primary-light);
        }
      }
    }

    .nav-user {
      display: flex;
      align-items: center;
      gap: 1rem;

      .user-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: var(--color-secondary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
        }

        .user-name {
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--color-text-main);
        }
      }
    }

    .main-content {
      flex: 1;
    }

    /* Modal Styles */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
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
      max-width: 480px;
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-lg);
      padding: 1.75rem;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;

      .close-btn {
        font-size: 1.2rem;
        color: var(--color-text-muted);
        cursor: pointer;
        &:hover { color: var(--color-text-main); }
      }
    }

    .separator {
      border: 0;
      height: 1px;
      background: var(--color-border);
      margin: 1.25rem 0;
    }

    .section {
      h4 {
        font-size: 0.95rem;
        margin-bottom: 0.65rem;
      }
    }

    .code-box {
      margin-top: 0.75rem;
      padding: 0.75rem;
      background: var(--color-sand);
      border-radius: var(--radius-md);
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      border: 1px dashed var(--color-primary);

      strong {
        font-size: 1.1rem;
        color: var(--color-primary);
        letter-spacing: 2px;
      }
    }
  `]
})
export class App {
  showHouseholdModal = signal<boolean>(false);
  newHouseholdName = '';
  joinCode = '';
  generatedCode = signal<string>('');
  householdError = signal<string>('');
  isProcessingHousehold = signal<boolean>(false);

  constructor(
    public authService: AuthService,
    public householdService: HouseholdService,
    private router: Router
  ) {
    // Automatically load households when user is authenticated
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.householdService.loadHouseholds().subscribe();
      }
    });
  }

  onHouseholdChange(householdId: number | string) {
    const found = this.householdService.households().find(h => h.id === Number(householdId));
    if (found) {
      this.householdService.setActiveHousehold(found);
      // Reload current route or trigger change
      window.location.reload();
    }
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login'])
    });
  }

  openCreateHouseholdModal() {
    this.householdError.set('');
    this.generatedCode.set('');
    this.householdService.openHouseholdModal();
  }

  closeHouseholdModal() {
    this.householdService.closeHouseholdModal();
  }

  createHousehold() {
    if (!this.newHouseholdName.trim()) return;
    this.isProcessingHousehold.set(true);
    this.householdError.set('');

    this.householdService.createHousehold({ name: this.newHouseholdName.trim() }).subscribe({
      next: () => {
        this.newHouseholdName = '';
        this.isProcessingHousehold.set(false);
        this.closeHouseholdModal();
      },
      error: (err) => {
        this.isProcessingHousehold.set(false);
        this.householdError.set(err.error?.error || 'Error al crear el hogar');
      }
    });
  }

  joinHousehold() {
    if (!this.joinCode.trim()) return;
    this.isProcessingHousehold.set(true);
    this.householdError.set('');

    this.householdService.joinHousehold(this.joinCode.trim()).subscribe({
      next: () => {
        this.joinCode = '';
        this.isProcessingHousehold.set(false);
        this.closeHouseholdModal();
      },
      error: (err) => {
        this.isProcessingHousehold.set(false);
        this.householdError.set(err.error?.error || 'Código inválido o caducado');
      }
    });
  }

  generateInvitation() {
    const active = this.householdService.activeHousehold();
    if (!active) return;
    this.householdService.createInvitation(active.id).subscribe({
      next: (inv) => this.generatedCode.set(inv.code),
      error: (err) => this.householdError.set(err.error?.error || 'Error al generar invitación')
    });
  }

  populateCurrentHousehold() {
    const active = this.householdService.activeHousehold();
    if (!active) return;
    this.isProcessingHousehold.set(true);
    this.householdError.set('');

    this.householdService.populateStarterData(active.id).subscribe({
      next: () => {
        this.isProcessingHousehold.set(false);
        this.closeHouseholdModal();
        window.location.reload();
      },
      error: (err) => {
        this.isProcessingHousehold.set(false);
        this.householdError.set(err.error?.error || 'Error al poblar productos de ejemplo');
      }
    });
  }
}
