import { Injectable, Optional, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc, serverTimestamp } from '@angular/fire/firestore';
import { BehaviorSubject, from, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AppUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role: 'visitor' | 'buyer' | 'admin';
  createdAt?: any;
}

export function isFirebaseConfigured(): boolean {
  return !!environment.firebase?.apiKey;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth      = inject(Auth, { optional: true }) as Auth | null;
  private firestore = inject(Firestore, { optional: true }) as Firestore | null;

  private _user$ = new BehaviorSubject<AppUser | null>(null);
  readonly user$ = this._user$.asObservable();

  constructor() {
    if (this.auth) {
      onAuthStateChanged(this.auth, async (firebaseUser) => {
        if (firebaseUser) {
          const appUser = await this.syncUserProfile(firebaseUser);
          this._user$.next(appUser);
        } else {
          this._user$.next(null);
        }
      });
    }
  }

  get currentUser(): AppUser | null { return this._user$.value; }
  get isLoggedIn(): boolean { return !!this._user$.value; }
  get isAdmin(): boolean {
    const u = this._user$.value;
    return !!u && (u.role === 'admin' || (!!environment.adminUid && u.uid === environment.adminUid));
  }

  signInWithGoogle(): Observable<AppUser> {
    if (!this.auth) return throwError(() => new Error('Firebase not configured'));
    const provider = new GoogleAuthProvider();
    return from(
      signInWithPopup(this.auth, provider).then(result =>
        this.syncUserProfile(result.user)
      )
    );
  }

  signOut(): Observable<void> {
    if (!this.auth) return from(Promise.resolve());
    return from(signOut(this.auth));
  }

  private async syncUserProfile(firebaseUser: User): Promise<AppUser> {
    if (!this.firestore) throw new Error('Firestore not configured');
    const ref  = doc(this.firestore, `users/${firebaseUser.uid}`);
    const snap = await getDoc(ref);
    const isAdmin = !!environment.adminUid && firebaseUser.uid === environment.adminUid;

    if (!snap.exists()) {
      const newUser: AppUser = {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName,
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
        role: isAdmin ? 'admin' : 'visitor',
        createdAt: serverTimestamp()
      };
      await setDoc(ref, newUser);
      return newUser;
    }

    const data = snap.data() as AppUser;
    if (isAdmin && data.role !== 'admin') {
      await setDoc(ref, { ...data, role: 'admin' }, { merge: true });
      return { ...data, role: 'admin' };
    }
    return data;
  }

  async setUserRole(uid: string, role: AppUser['role']): Promise<void> {
    if (!this.firestore) return;
    const ref = doc(this.firestore, `users/${uid}`);
    await setDoc(ref, { role }, { merge: true });
  }
}
