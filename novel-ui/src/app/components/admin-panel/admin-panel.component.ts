import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PresaleService, PresaleOrder, OrderStatus, FundingStats } from '../../services/presale.service';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

type FilterTab = 'all' | 'pending' | 'approved' | 'denied';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule, MatButtonModule, MatSnackBarModule, MatTooltipModule],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.scss'
})
export class AdminPanelComponent implements OnInit {
  private presaleSvc = inject(PresaleService);
  private authSvc    = inject(AuthService);
  private snack      = inject(MatSnackBar);

  allOrders: PresaleOrder[] = [];
  stats: FundingStats | null = null;
  activeTab: FilterTab = 'pending';
  adminNoteInputs: Record<string, string> = {};

  readonly goal         = environment.presaleGoal;
  readonly pricePerCopy = environment.presalePriceUsd;

  ngOnInit() {
    this.presaleSvc.getAllOrders().subscribe(orders => {
      this.allOrders = orders;
      orders.forEach(o => {
        if (!(o.orderId in this.adminNoteInputs)) {
          this.adminNoteInputs[o.orderId] = o.adminNote || '';
        }
      });
    });
    this.presaleSvc.getFundingStats().subscribe(s => this.stats = s);
  }

  get filteredOrders(): PresaleOrder[] {
    if (this.activeTab === 'all') return this.allOrders;
    return this.allOrders.filter(o => o.status === this.activeTab);
  }

  tabCount(tab: FilterTab): number {
    if (tab === 'all') return this.allOrders.length;
    return this.allOrders.filter(o => o.status === tab).length;
  }

  updateStatus(order: PresaleOrder, status: OrderStatus) {
    const note = this.adminNoteInputs[order.orderId] ?? '';
    this.presaleSvc.updateOrderStatus(order.orderId, status, note).subscribe({
      next: () => this.snack.open(`Order ${status}`, 'OK', { duration: 3000 }),
      error: () => this.snack.open('Update failed', 'OK', { duration: 3000 })
    });
  }

  signOut() {
    this.authSvc.signOut().subscribe();
  }

  statusIcon(s: string) {
    return s === 'approved' ? 'check_circle' : s === 'denied' ? 'cancel' : 'schedule';
  }
  statusClass(s: string) {
    return s === 'approved' ? 'approved' : s === 'denied' ? 'denied' : 'pending';
  }
}
