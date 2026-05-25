import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService, isFirebaseConfigured } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule, MatSnackBarModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);
  private snack  = inject(MatSnackBar);

  loading = false;
  readonly firebaseReady = isFirebaseConfigured();

  signInGoogle() {
    if (!this.firebaseReady) return;
    this.loading = true;
    this.auth.signInWithGoogle().subscribe({
      next: (user) => {
        this.loading = false;
        this.router.navigate([user.role === 'admin' ? '/admin-panel' : '/presale']);
      },
      error: (err) => {
        this.loading = false;
        this.snack.open('Sign-in failed: ' + (err.message || 'unknown error'), 'OK', { duration: 5000 });
      }
    });
  }
}
