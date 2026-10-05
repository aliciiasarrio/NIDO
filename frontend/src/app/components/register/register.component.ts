import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
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
          <p class="subtitle">Crea tu cuenta y empieza a organizar tu hogar</p>
        </div>

        <div *ngIf="errorMessage()" class="alert alert-danger" role="alert">
          {{ errorMessage() }}
        </div>

        <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
          <div class="form-group">
            <label for="name">Nombre completo</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              [(ngModel)]="name" 
              #nameModel="ngModel"
              required 
              minlength="2"
              class="form-control" 
              placeholder="Ej. Carmen Gómez"
              autocomplete="name"
            />
            <div *ngIf="nameModel.invalid && (nameModel.dirty || nameModel.touched)" class="form-error">
              Introduce un nombre válido (mínimo 2 letras).
            </div>
          </div>

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
              minlength="8"
              class="form-control" 
              placeholder="Mínimo 8 caracteres"
              autocomplete="new-password"
            />
            <div *ngIf="passwordModel.invalid && (passwordModel.dirty || passwordModel.touched)" class="form-error">
              La contraseña debe tener al menos 8 caracteres.
            </div>
          </div>

          <button 
            type="submit" 
            class="btn btn-primary w-100" 
            [disabled]="registerForm.invalid || isSubmitting()"
          >
            <span *ngIf="isSubmitting()">Creando cuenta...</span>
            <span *ngIf="!isSubmitting()">Registrarse</span>
          </button>
        </form>

        <div class="auth-footer">
          <p>¿Ya tienes cuenta? <a routerLink="/login">Inicia sesión</a></p>
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
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  errorMessage = signal<string>('');
  isSubmitting = signal<boolean>(false);

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (!this.name || !this.email || !this.password) return;
    this.errorMessage.set('');
    this.isSubmitting.set(true);

    this.authService.register({ name: this.name, email: this.email, password: this.password }).subscribe({
      next: () => {
        // Auto-login after registration
        this.authService.login({ email: this.email, password: this.password }).subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.router.navigate(['/']);
          },
          error: () => {
            this.isSubmitting.set(false);
            this.router.navigate(['/login']);
          }
        });
      },
      error: (err) => {
        this.isSubmitting.set(false);
        if (err.error?.error) {
          this.errorMessage.set(err.error.error);
        } else if (err.error && typeof err.error === 'object') {
          // Si el backend devuelve un mapa de validación { password: "...", email: "..." }
          const messages = Object.values(err.error);
          this.errorMessage.set(messages.length > 0 ? (messages[0] as string) : 'Error al registrar la cuenta.');
        } else {
          this.errorMessage.set('Error al registrar la cuenta. Comprueba los datos.');
        }
      }
    });
  }
}
