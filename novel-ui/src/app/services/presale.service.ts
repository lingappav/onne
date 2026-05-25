import { Injectable, inject } from '@angular/core';
import {
  Firestore, collection, collectionData, doc, setDoc, updateDoc,
  query, where, orderBy, serverTimestamp
} from '@angular/fire/firestore';
import { Observable, from, map, of } from 'rxjs';
import { environment } from '../../environments/environment';

export type OrderStatus = 'pending' | 'approved' | 'denied';

export interface PresaleOrder {
  orderId: string;
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  copies: number;
  totalUsd: number;
  message: string;
  status: OrderStatus;
  adminNote: string;
  createdAt: any;
  updatedAt: any;
}

export interface FundingStats {
  totalApproved: number;
  totalPending: number;
  totalRevenue: number;
  percentFunded: number;
}

const EMPTY_STATS: FundingStats = { totalApproved: 0, totalPending: 0, totalRevenue: 0, percentFunded: 0 };

@Injectable({ providedIn: 'root' })
export class PresaleService {
  private firestore = inject(Firestore, { optional: true }) as Firestore | null;

  private get ordersCol() {
    return this.firestore ? collection(this.firestore, 'presale_orders') : null;
  }

  getAllOrders(): Observable<PresaleOrder[]> {
    if (!this.ordersCol) return of([]);
    const q = query(this.ordersCol, orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'orderId' }) as Observable<PresaleOrder[]>;
  }

  getOrdersByStatus(status: OrderStatus): Observable<PresaleOrder[]> {
    if (!this.ordersCol) return of([]);
    const q = query(this.ordersCol, where('status', '==', status), orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'orderId' }) as Observable<PresaleOrder[]>;
  }

  getUserOrders(uid: string): Observable<PresaleOrder[]> {
    if (!this.ordersCol) return of([]);
    const q = query(this.ordersCol, where('uid', '==', uid), orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'orderId' }) as Observable<PresaleOrder[]>;
  }

  getFundingStats(): Observable<FundingStats> {
    if (!this.ordersCol) return of(EMPTY_STATS);
    return this.getAllOrders().pipe(
      map(orders => {
        const approved     = orders.filter(o => o.status === 'approved');
        const pending      = orders.filter(o => o.status === 'pending');
        const totalApproved = approved.reduce((s, o) => s + o.copies, 0);
        const totalPending  = pending.reduce((s, o) => s + o.copies, 0);
        const totalRevenue  = totalApproved * environment.presalePriceUsd;
        const percentFunded = Math.min(100, Math.round((totalApproved / environment.presaleGoal) * 100));
        return { totalApproved, totalPending, totalRevenue, percentFunded };
      })
    );
  }

  submitOrder(order: Omit<PresaleOrder, 'orderId' | 'status' | 'adminNote' | 'createdAt' | 'updatedAt'>): Observable<string> {
    if (!this.firestore || !this.ordersCol) return from(Promise.reject(new Error('Firebase not configured')));
    const id  = doc(this.ordersCol).id;
    const ref = doc(this.firestore, `presale_orders/${id}`);
    const payload: Omit<PresaleOrder, 'orderId'> = {
      ...order, status: 'pending', adminNote: '',
      createdAt: serverTimestamp(), updatedAt: serverTimestamp()
    };
    return from(setDoc(ref, payload).then(() => id));
  }

  updateOrderStatus(orderId: string, status: OrderStatus, adminNote = ''): Observable<void> {
    if (!this.firestore) return from(Promise.resolve());
    const ref = doc(this.firestore, `presale_orders/${orderId}`);
    return from(updateDoc(ref, { status, adminNote, updatedAt: serverTimestamp() }));
  }
}
