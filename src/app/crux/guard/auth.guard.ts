import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthService } from '../../shared-services/api-service/auth.service';
import {UserRole} from '../models/user.model';

/** Protect routes that require authentication */
export const authGuard: CanActivateFn = () => {
	const auth = inject(AuthService);
	const router = inject(Router);

	return auth.user$.pipe(
		take(1),
		map(user => {
			if (user) return true;
			router.navigate(['/auth/login']);
			return false;
		})
	);
};

/** Redirect already-logged-in users away from auth pages */
export const publicGuard: CanActivateFn = () => {
	const auth = inject(AuthService);
	const router = inject(Router);

	return auth.user$.pipe(
		take(1),
		map(user => {
			if (!user) return true;
			router.navigate(user.role === 'admin' ? ['/admin/dashboard'] : ['/']);
			return false;
		})
	);
};

/** Factory guard: require a specific role */
export function roleGuard(...roles: UserRole[]): CanActivateFn {
	return () => {
		const auth = inject(AuthService);
		const router = inject(Router);

		return auth.user$.pipe(
			take(1),
			map(user => {
				if (user && roles.includes(user.role)) return true;
				if (!user) {
					router.navigate(['/auth/login']);
				} else {
					router.navigate(['/unauthorized']);
				}
				return false;
			})
		);
	};
}

/** Admin-only shorthand */
export const adminGuard: CanActivateFn = roleGuard('admin');
