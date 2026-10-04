import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, filter, take } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Esperar a que se termine de comprobar la sesión
  if (!authService.isLoading()) {
    if (authService.currentUser()) {
      return true;
    }
    router.navigate(['/login']);
    return false;
  }

  return authService.checkSession().pipe(
    take(1),
    map(user => {
      if (user) return true;
      router.navigate(['/login']);
      return false;
    })
  );
};
