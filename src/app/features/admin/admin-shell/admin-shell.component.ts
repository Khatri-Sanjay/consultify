import {
	Component, signal, inject, OnInit, OnDestroy, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subject, takeUntil, filter } from 'rxjs';
import { AuthService } from '../../../shared-services/api-service/auth.service';

interface NavItem {
	svg: string;
	label: string;
	route: string;
	badge?: string | number;
	badgeType?: 'blue' | 'amber' | 'red' | 'green';
}

/* ─── SVG paths only — rendered inside consistent <svg> wrapper via ic() ─── */
const IC = {
	dashboard: `<path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>`,
	analytics: `<path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>`,
	applications: `<path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>`,
	blog: `<path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>`,
	users: `<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>`,
	destinations: `<path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>`,
	universities: `<path stroke-linecap="round" stroke-linejoin="round" d="M12 14l9-5-9-5-9 5 9 5z"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>`,
	messages: `<path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>`,
	settings: `<path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/>`,
	auditlog: `<path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>`,
	logout: `<path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>`,
	chevronR: `<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>`,
	chevronL: `<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>`,
	menu: `<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h10"/>`,
	close: `<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>`,
	bell: `<path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>`,
	search: `<circle cx="11" cy="11" r="8"/><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-4.35-4.35"/>`,
	link: `<path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>`,
	user: `<path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>`,
	newsletter: `<path stroke-linecap="round" stroke-linejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6m-6 4h.01"/>`,
};

/** Wraps SVG path strings in a properly-sized, stroked SVG element */
function ic(paths: string, size = 16): string {
	return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
    xmlns="http://www.w3.org/2000/svg" style="display:block;flex-shrink:0">${paths}</svg>`;
}

@Component({
	selector: 'app-admin-shell',
	standalone: true,
	imports: [CommonModule, RouterModule],
	templateUrl: './admin-shell.component.html',
	styleUrl: './admin-shell.component.css',
})
export class AdminShellComponent implements OnInit, OnDestroy {
	private readonly authService = inject(AuthService);
	private readonly router = inject(Router);
	private readonly sanitizer = inject(DomSanitizer);
	private readonly destroy$ = new Subject<void>();

	mini = signal(false);
	mobileOpen = signal(false);
	dropOpen = signal(false);
	notifOpen = signal(false);
	pageLabel = signal('');

	readonly user$ = this.authService.user$;
	readonly year = new Date().getFullYear();
	readonly icons = IC;

	render(paths: string, size = 16): SafeHtml {
		return this.sanitizer.bypassSecurityTrustHtml(ic(paths, size));
	}

	readonly mainNav: NavItem[] = [
		{ svg: IC.dashboard, label: 'Dashboard', route: '/admin/dashboard' },
		{ svg: IC.blog, label: 'Blog', route: '/admin/blogs' },
	];

	readonly mgmtNav: NavItem[] = [
		{ svg: IC.users, label: 'Users', route: '/admin/users' },
		{ svg: IC.messages, label: 'Messages', route: '/admin/messages' },
		{ svg: IC.newsletter, label: 'News Letter', route: '/admin/newsletter' },
	];


	private readonly routeLabels: Record<string, string> = {
		'/admin/dashboard': 'Dashboard',
		'/admin/analytics': 'Analytics',
		'/admin/applications': 'Applications',
		'/admin/blogs': 'Blog',
		'/admin/users': 'User Management',
		'/admin/destinations': 'Destinations',
		'/admin/universities': 'Universities',
		'/admin/messages': 'Messages',
		'/admin/settings': 'Settings',
		'/admin/logs': 'Audit Logs',
		'/admin/profile': 'My Profile',
	};

	ngOnInit(): void {
		this.pageLabel.set(this.routeLabels[this.router.url] ?? '');
		this.router.events.pipe(
			filter(e => e instanceof NavigationEnd),
			takeUntil(this.destroy$)
		).subscribe((e: any) => {
			this.pageLabel.set(this.routeLabels[e.urlAfterRedirects] ?? '');
			this.mobileOpen.set(false);
			this.dropOpen.set(false);
			this.notifOpen.set(false);
		});
	}

	@HostListener('document:click', ['$event'])
	onDocClick(e: MouseEvent): void {
		const t = e.target as HTMLElement;
		if (!t.closest('.tb-ava') && !t.closest('.dd-sm')) this.dropOpen.set(false);
		if (!t.closest('.ib') && !t.closest('.dd-md')) this.notifOpen.set(false);
	}

	closeMobile(): void { this.mobileOpen.set(false); }

	logout(): void {
		this.dropOpen.set(false);
		this.authService.logout().pipe(takeUntil(this.destroy$)).subscribe();
	}

	ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
