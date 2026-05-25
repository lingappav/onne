import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService, AppUser } from '../../services/auth.service';
import { PresaleService, PresaleOrder, FundingStats } from '../../services/presale.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-presale',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatSnackBarModule, MatTooltipModule],
  templateUrl: './presale.component.html',
  styleUrl: './presale.component.scss'
})
export class PresaleComponent implements OnInit {
  private authSvc    = inject(AuthService);
  private presaleSvc = inject(PresaleService);
  private router     = inject(Router);
  private snack      = inject(MatSnackBar);

  user: AppUser | null = null;
  stats: FundingStats | null = null;
  userOrders: PresaleOrder[] = [];

  copies  = 1;
  message = '';
  submitting = false;

  readonly pricePerCopy = environment.presalePriceUsd;
  readonly goal         = environment.presaleGoal;

  get totalCost(): number { return this.copies * this.pricePerCopy; }

  ngOnInit() {
    this.authSvc.user$.subscribe(u => {
      this.user = u;
      if (!u) { this.router.navigate(['/login']); return; }
      this.presaleSvc.getUserOrders(u.uid).subscribe(orders => this.userOrders = orders);
    });
    this.presaleSvc.getFundingStats().subscribe(s => this.stats = s);
  }

  signOut() {
    this.authSvc.signOut().subscribe(() => this.router.navigate(['/login']));
  }

  submit() {
    if (!this.user || this.copies < 1 || this.copies > 10) return;
    if (this.hasPendingOrApproved) {
      this.snack.open('You already have an active order. Contact the author to modify it.', 'OK', { duration: 5000 });
      return;
    }
    this.submitting = true;
    this.presaleSvc.submitOrder({
      uid:         this.user.uid,
      displayName: this.user.displayName ?? 'Anonymous',
      email:       this.user.email ?? '',
      photoURL:    this.user.photoURL,
      copies:      this.copies,
      totalUsd:    this.totalCost,
      message:     this.message.trim()
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.message = '';
        this.copies  = 1;
        this.snack.open('Pre-order request submitted! The author will review it shortly.', 'OK', { duration: 6000 });
      },
      error: () => {
        this.submitting = false;
        this.snack.open('Submission failed. Please try again.', 'OK', { duration: 4000 });
      }
    });
  }

  get hasPendingOrApproved(): boolean {
    return this.userOrders.some(o => o.status === 'pending' || o.status === 'approved');
  }

  statusIcon(s: string) {
    return s === 'approved' ? 'check_circle' : s === 'denied' ? 'cancel' : 'schedule';
  }
  statusColor(s: string) {
    return s === 'approved' ? 'approved' : s === 'denied' ? 'denied' : 'pending';
  }
}
