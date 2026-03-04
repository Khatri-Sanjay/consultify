import {
	Component, inject, OnInit, OnDestroy, signal, computed
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {
	Subject, takeUntil, BehaviorSubject, combineLatest,
	map, debounceTime, distinctUntilChanged
} from 'rxjs';
import {AuthService} from '../../../shared-services/api-service/auth.service';
import {AppUser, UserRole} from '../../../crux/models/user.model';
import {DeleteModalService} from '../../common/delete-modal/service/delete-modal.service';

@Component({
	selector: 'app-user-management',
	standalone: true,
	imports: [CommonModule, RouterModule, FormsModule],
	styleUrl: './user-management.component.css',
	templateUrl: './user-management.component.html',
})
export class UserManagementComponent implements OnInit, OnDestroy {
	private auth = inject(AuthService);
	private deleteModal = inject(DeleteModalService);
	private destroy$ = new Subject<void>();

	// ── Search / Filter streams ───────────────────────────────
	search$ = new BehaviorSubject<string>('');
	roleFilter$ = new BehaviorSubject<string>('');
	searchQuery = '';
	roleFilter = '';

	// ── Pagination ────────────────────────────────────────────
	page = signal(1);
	pageSize = signal(10);

	// ── UI state ──────────────────────────────────────────────
	toast = signal<{ msg: string; type: 'success' | 'error' } | null>(null);
	loading = signal(true);

	// ── Data ──────────────────────────────────────────────────
	private allUsers$ = this.auth.getAllUsers();

	filteredUsers$ = combineLatest([
		this.allUsers$,
		this.search$.pipe(debounceTime(220), distinctUntilChanged()),
		this.roleFilter$.pipe(distinctUntilChanged()),
	]).pipe(
		map(([users, q, role]) => {
			this.loading.set(false);
			return users.filter(u => {
				const matchQ = !q ||
					u.displayName.toLowerCase().includes(q.toLowerCase()) ||
					u.email.toLowerCase().includes(q.toLowerCase()) ||
					(u.phone ?? '').includes(q);
				const matchRole = !role || u.role === role;
				return matchQ && matchRole;
			});
		})
	);

	// Pagination helpers — operate on the latest filtered snapshot
	protected _filtered: AppUser[] = [];

	totalPages = signal(1);
	pageNumbers = computed(() => {
		const total = this.totalPages();
		const cur = this.page();
		const pages: (number | '...')[] = [];
		if (total <= 7) {
			for (let i = 1; i <= total; i++) pages.push(i);
		} else {
			pages.push(1);
			if (cur > 3) pages.push('...');
			for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i);
			if (cur < total - 2) pages.push('...');
			pages.push(total);
		}
		return pages;
	});

	pagedUsers$ = this.filteredUsers$.pipe(
		map(users => {
			this._filtered = users;
			const tp = Math.max(1, Math.ceil(users.length / this.pageSize()));
			this.totalPages.set(tp);
			if (this.page() > tp) this.page.set(1);
			const start = (this.page() - 1) * this.pageSize();
			return users.slice(start, start + this.pageSize());
		})
	);

	// ── Stats ─────────────────────────────────────────────────
	stats$ = this.filteredUsers$.pipe(
		map(users => ({
			total: users.length,
			active: users.filter(u => u.isActive).length,
			admins: users.filter(u => u.role === 'admin').length,
			mods: users.filter(u => u.role === 'moderator').length,
			newWeek: users.filter(u => Date.now() - new Date(u.createdAt).getTime() < 7 * 864e5).length,
		}))
	);

	// ── Actions ───────────────────────────────────────────────
	changeRole(user: AppUser, role: UserRole): void {
		this.auth.updateUserRole(user.uid, role)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: () => this.showToast(`${user.displayName}'s role → ${role}`, 'success'),
				error: () => this.showToast('Failed to update role', 'error'),
			});
	}

	toggleActive(user: AppUser): void {
		this.auth.toggleUserActive(user.uid, !user.isActive)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: () => this.showToast(
					`${user.displayName} marked ${!user.isActive ? 'active' : 'inactive'}`, 'success'
				),
				error: () => this.showToast('Failed to update status', 'error'),
			});
	}

	deleteUser(user: AppUser): void {
		this.deleteModal.open({
			title: `Remove ${user.displayName}?`,
			subtitle: 'This removes their profile data from the system. They will lose access.',
			meta: `${user.email} · ${user.role}`,
			avatarText: user.displayName.charAt(0).toUpperCase(),
			avatarColor: this.roleColor(user.role),
			onConfirm: async () => {
				await this.auth.deleteUserDoc(user.uid).toPromise();
				this.showToast(`${user.displayName} removed`, 'success');
			},
		});
	}

	// ── Pagination ────────────────────────────────────────────
	goPage(p: number | '...'): void {
		if (p === '...') return;
		this.page.set(Math.min(Math.max(1, p as number), this.totalPages()));
		this._refreshPage();
	}

	prevPage(): void {
		if (this.page() > 1) {
			this.page.update(p => p - 1);
			this._refreshPage();
		}
	}

	nextPage(): void {
		if (this.page() < this.totalPages()) {
			this.page.update(p => p + 1);
			this._refreshPage();
		}
	}

	private _refreshPage(): void {
		this.search$.next(this.searchQuery);
	} // trigger re-emit

	// ── Helpers ───────────────────────────────────────────────
	roleColor(role: string): string {
		return ({admin: '#1a35d4', moderator: '#7c3aed', user: '#059669'} as any)[role] ?? '#6b7280';
	}

	roleBadgeClass(role: string): string {
		return ({admin: 'badge-blue', moderator: 'badge-purple', user: 'badge-green'} as any)[role] ?? 'badge-gray';
	}

	authorInitials(name: string): string {
		if (!name?.trim()) return '?';
		const parts = name.trim().split(/\s+/);
		return parts.length === 1
			? parts[0].charAt(0).toUpperCase()
			: (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
	}

	private showToast(msg: string, type: 'success' | 'error'): void {
		this.toast.set({msg, type});
		setTimeout(() => this.toast.set(null), 3200);
	}

	pageStart = computed(() => (this.page() - 1) * this.pageSize() + 1);
	pageEnd = computed(() => Math.min(this.page() * this.pageSize(), this._filtered.length));
	protected readonly Math = Math;

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}
}
