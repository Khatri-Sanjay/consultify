import {Injectable, inject, OnDestroy} from '@angular/core';
import {
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	signOut,
	onAuthStateChanged,
	updateProfile,
	sendPasswordResetEmail,
	User as FirebaseUser,
	setPersistence,
	browserLocalPersistence,
	browserSessionPersistence,
	Unsubscribe,
} from 'firebase/auth';
import {
	doc,
	setDoc,
	getDoc,
	updateDoc,
	collection,
	query,
	orderBy,
	serverTimestamp,
	deleteDoc,
	onSnapshot,
	getDocs,
} from 'firebase/firestore';
import {
	Observable,
	BehaviorSubject,
	Subject,
	from,
	of,
	throwError,
	switchMap,
	map,
	tap,
	catchError,
	shareReplay,
	distinctUntilChanged,
	filter,
	takeUntil,
} from 'rxjs';
import {AppUser, LoginForm, RegisterForm, UserRole} from '../../crux/models/user.model';
import {Router} from '@angular/router';

import {auth, db} from '../../crux/config/firebase.config';

@Injectable({providedIn: 'root'})
export class AuthService implements OnDestroy {
	private readonly router = inject(Router);
	private readonly destroy$ = new Subject<void>();

	private _loading$ = new BehaviorSubject<boolean>(true);
	private _error$ = new BehaviorSubject<string | null>(null);

	readonly loading$ = this._loading$.asObservable();
	readonly error$ = this._error$.asObservable();


	readonly user$: Observable<AppUser | null> = new Observable<FirebaseUser | null>(sub => {
		const unsub: Unsubscribe = onAuthStateChanged(
			auth,
			fireUser => sub.next(fireUser),
			err => sub.error(err)
		);
		return () => unsub(); // called when Observable is unsubscribed → stops the listener
	}).pipe(
		switchMap((fireUser: FirebaseUser | null) => {
			if (!fireUser) {
				this._loading$.next(false);
				return of(null);
			}
			return this.fetchUserDoc(fireUser.uid).pipe(
				tap(() => this._loading$.next(false))
			);
		}),
		distinctUntilChanged((a, b) => a?.uid === b?.uid),
		shareReplay(1),       // share one subscription, replay last value to late subscribers
		takeUntil(this.destroy$),
	);

	readonly authenticatedUser$ = this.user$.pipe(
		filter((u): u is AppUser => u !== null)
	);

	readonly isAdmin$ = this.user$.pipe(map(u => u?.role === 'admin'), distinctUntilChanged());
	readonly isModerator$ = this.user$.pipe(map(u => u?.role === 'moderator' || u?.role === 'admin'), distinctUntilChanged());
	readonly isLoggedIn$ = this.user$.pipe(map(Boolean), distinctUntilChanged());

	/* ── Register ── */
	register(form: RegisterForm): Observable<AppUser> {
		this._loading$.next(true);
		this._error$.next(null);

		return from(createUserWithEmailAndPassword(auth, form.email, form.password)).pipe(
			switchMap(({user}) =>
				from(updateProfile(user, {displayName: form.displayName})).pipe(
					switchMap(() => this.createUserDoc(user, form))
				)
			),
			tap(appUser => {
				this._loading$.next(false);
				this.router.navigate(appUser.role === 'admin' ? ['/admin/dashboard'] : ['/']);
			}),
			catchError(err => {
				this._loading$.next(false);
				const msg = this.friendlyError(err.code);
				this._error$.next(msg);
				return throwError(() => new Error(msg));
			})
		);
	}

	/* ── Login ── */
	login(form: LoginForm): Observable<AppUser> {
		this._loading$.next(true);
		this._error$.next(null);

		const persistence = form.rememberMe ? browserLocalPersistence : browserSessionPersistence;

		return from(setPersistence(auth, persistence)).pipe(
			switchMap(() => from(signInWithEmailAndPassword(auth, form.email, form.password))),
			switchMap(({user}) => this.fetchUserDoc(user.uid)),
			map(appUser => {
				if (!appUser) throw {code: 'auth/user-not-found'};
				return appUser;
			}),
			tap(appUser => {
				this._loading$.next(false);
				this.router.navigate(appUser.role === 'admin' ? ['/admin/dashboard'] : ['/']);
			}),
			catchError(err => {
				this._loading$.next(false);
				const msg = this.friendlyError(err.code);
				this._error$.next(msg);
				return throwError(() => new Error(msg));
			})
		);
	}

	/* ── Logout ── */
	logout(): Observable<void> {
		return from(signOut(auth)).pipe(
			tap(() => this.router.navigate(['/auth/login'])),
			catchError(err => {
				this._error$.next('Failed to sign out. Please try again.');
				return throwError(() => err);
			})
		);
	}

	/* ── Password reset ── */
	resetPassword(email: string): Observable<void> {
		return from(sendPasswordResetEmail(auth, email)).pipe(
			catchError(err => {
				this._error$.next(this.friendlyError(err.code));
				return throwError(() => err);
			})
		);
	}

	/* ──────────────────────────────────────────
	   ADMIN — get all users

	   Two options:
	   A) getAllUsers()         one-time fetch (simpler)
	   B) getAllUsersRealtime() live stream — auto-updates on change
	────────────────────────────────────────── */
	getAllUsers(): Observable<AppUser[]> {
		const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
		return from(getDocs(q)).pipe(
			map(snapshot =>
				snapshot.docs.map(d => this.docToUser(d.id, d.data()))
			),
			catchError(() => of([]))
		);
	}

	/** Real-time version — wraps onSnapshot manually (replaces collectionData) */
	getAllUsersRealtime(): Observable<AppUser[]> {
		const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
		return new Observable<AppUser[]>(sub => {
			const unsub = onSnapshot(
				q,
				snap => sub.next(snap.docs.map(d => this.docToUser(d.id, d.data()))),
				err => sub.error(err)
			);
			return () => unsub();
		});
	}

	/* ── Admin: update role ── */
	updateUserRole(uid: string, role: UserRole): Observable<void> {
		return from(updateDoc(doc(db, 'users', uid), {role, updatedAt: serverTimestamp()}));
	}

	/* ── Admin: toggle active ── */
	toggleUserActive(uid: string, isActive: boolean): Observable<void> {
		return from(updateDoc(doc(db, 'users', uid), {isActive, updatedAt: serverTimestamp()}));
	}

	/* ── Admin: delete user doc ── */
	deleteUserDoc(uid: string): Observable<void> {
		return from(deleteDoc(doc(db, 'users', uid)));
	}

	clearError(): void {
		this._error$.next(null);
	}

	/* ── Private helpers ── */
	private createUserDoc(fireUser: FirebaseUser, form: RegisterForm): Observable<AppUser> {
		const appUser: AppUser = {
			uid: fireUser.uid,
			email: fireUser.email!,
			displayName: form.displayName,
			role: form.role ?? 'user',
			phone: form.phone ?? '',
			photoURL: fireUser.photoURL ?? '',
			createdAt: new Date(),
			updatedAt: new Date(),
			isActive: true,
		};
		return from(
			setDoc(doc(db, 'users', fireUser.uid), {
				...appUser,
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp(),
			})
		).pipe(map(() => appUser));
	}

	private fetchUserDoc(uid: string): Observable<AppUser | null> {
		return from(getDoc(doc(db, 'users', uid))).pipe(
			map(snap => snap.exists() ? this.docToUser(snap.id, snap.data()) : null),
			catchError(() => of(null))
		);
	}

	private docToUser(id: string, data: any): AppUser {
		return {
			...data,
			uid: id,
			createdAt: data['createdAt']?.toDate?.() ?? new Date(),
			updatedAt: data['updatedAt']?.toDate?.() ?? new Date(),
		} as AppUser;
	}

	private friendlyError(code: string): string {
		const map: Record<string, string> = {
			'auth/email-already-in-use': 'This email is already registered.',
			'auth/invalid-email': 'Please enter a valid email address.',
			'auth/weak-password': 'Password must be at least 6 characters.',
			'auth/user-not-found': 'No account found with this email.',
			'auth/wrong-password': 'Incorrect password. Please try again.',
			'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
			'auth/network-request-failed': 'Network error. Check your connection.',
			'auth/invalid-credential': 'Invalid credentials. Please check your email and password.',
		};
		return map[code] ?? 'An unexpected error occurred. Please try again.';
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
		this._loading$.complete();
		this._error$.complete();
	}
}
