import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card card">
        <div class="auth-header">
          <div class="auth-logo">
            <img src="favicon.svg" alt="NIDO Logo" class="auth-logo-img" width="48" height="48">
            <h2>NIDO</h2>
          </div>
          <p class="subtitle">Bienvenido de nuevo a tu hogar organizado</p>
        </div>

        <div *ngIf="errorMessage()" class="alert alert-danger" role="alert">
          {{ errorMessage() }}
        </div>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group">
            <label for="email">Correo electrónico</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              [(ngModel)]="email" 
              #emailModel="ngModel"
              required 
              email
              class="form-control" 
              placeholder="tu@email.com"
              autocomplete="email"
            />
            <div *ngIf="emailModel.invalid && (emailModel.dirty || emailModel.touched)" class="form-error">
              Introduce un correo electrónico válido.
            </div>
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              [(ngModel)]="password" 
              #passwordModel="ngModel"
              required 
              class="form-control" 
              placeholder="Tu contraseña"
              autocomplete="current-password"
            />
            <div *ngIf="passwordModel.invalid && (passwordModel.dirty || passwordModel.touched)" class="form-error">
              La contraseña es obligatoria.
            </div>
          </div>

          <button 
            type="submit" 
            class="btn btn-primary w-100" 
            [disabled]="loginForm.invalid || isSubmitting()"
          >
            <span *ngIf="isSubmitting()">Iniciando sesión...</span>
            <span *ngIf="!isSubmitting()">Iniciar sesión</span>
          </button>
        </form>

        <div class="auth-footer">
          <p>¿No tienes cuenta? <a routerLink="/register">Regístrate gratis</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      background: radial-gradient(circle at top left, var(--color-sand-dark) 0%, var(--color-sand) 100%);
    }

    .auth-card {
      width: 100%;
      max-width: 440px;
      padding: 2.5rem;
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-lg);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .auth-logo {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.8rem;
      font-weight: 800;
      color: var(--color-primary);
      margin-bottom: 0.5rem;

      .auth-logo-img {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(27, 67, 50, 0.25);
        display: block;
      }
    }

    .subtitle {
      color: var(--color-text-muted);
      font-size: 0.95rem;
    }

    .w-100 {
      width: 100%;
    }

    .auth-footer {
      text-align: center;
      margin-top: 1.75rem;
      font-size: 0.9rem;
      color: var(--color-text-muted);
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = signal<string>('');
  isSubmitting = signal<boolean>(false);

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (!this.email || !this.password) return;
    this.errorMessage.set('');
    this.isSubmitting.set(true);

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        // Distinguish network errors from credential errors
        if (err.status === 0 || err.name === 'HttpErrorResponse' && !err.status) {
          this.errorMessage.set('No se puede conectar con el servidor. Asegúrate de que el backend está arrancado (puerto 8080).');
        } else if (err.status === 401) {
          this.errorMessage.set('Correo o contraseña incorrectos. Revisa tus datos e inténtalo de nuevo.');
        } else if (err.status === 400) {
          const fieldErrors = err.error;
          if (typeof fieldErrors === 'object') {
            const messages = Object.values(fieldErrors).join(' ');
            this.errorMessage.set(messages || 'Datos inválidos. Revisa los campos.');
          } else {
            this.errorMessage.set(err.error?.error || 'Datos de login inválidos.');
          }
        } else {
          this.errorMessage.set(err.error?.error || 'Error al iniciar sesión. Inténtalo de nuevo.');
        }
      }
    });
  }
}
