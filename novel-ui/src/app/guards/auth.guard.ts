import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, isFirebaseConfigured } from '../services/auth.service';
import { map, take } from 'rxjs/operators';
import { of } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  if (!isFirebaseConfigured()) return of(true); // pass-through in demo mode
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.user$.pipe(
    take(1),
    map(user => user ? true : router.createUrlTree(['/login']))
  );
};

export const adminGuard: CanActivateFn = () => {
  if (!isFirebaseConfigured()) return of(true); // pass-through in demo mode
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.user$.pipe(
    take(1),
    map(user => {
      if (!user) return router.createUrlTree(['/login']);
      if (user.role !== 'admin') return router.createUrlTree(['/presale']);
      return true;
    })
  );
};
