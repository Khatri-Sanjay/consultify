import { Component, inject, OnDestroy, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, combineLatest, catchError, of, takeUntil } from 'rxjs';
import { AuthService } from '../../../shared-services/api-service/auth.service';
import { BlogService } from '../../../shared-services/api-service/blog.service';
import { NewsletterService } from '../../../shared-services/api-service/news-letter.service';
import { ContactService } from '../../../shared-services/api-service/contact.service';

export interface StatCard {
	label: string; value: number; sub: string;
	icon: string; grad: [string, string]; trend: string; trendUp: boolean; route: string;
}

export interface FeedItem {
	type: 'user' | 'message' | 'blog' | 'newsletter';
	title: string; sub: string; time: string;
	initials: string; color: string;
	badge: string; badgeClass: string;
}

@Component({
	selector: 'app-admin-dashboard',
	standalone: true,
	imports: [CommonModule, RouterModule],
	styleUrl: './dashboard.component.css',
	templateUrl: './dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
	private auth       = inject(AuthService);
	private blog       = inject(BlogService);
	private newsletter = inject(NewsletterService);
	protected contact    = inject(ContactService);
	private destroy$   = new Subject<void>();

	today = new Date();

	loading      = signal(true);
	stats        = signal<StatCard[]>([]);
	feed         = signal<FeedItem[]>([]);
	recentUsers  = signal<any[]>([]);
	newMessages  = signal<any[]>([]);
	chartBars    = signal<{ label: string; value: number; pct: number }[]>([]);
	newsletterStats = signal<{ published: number; drafts: number; totalViews: number }>({ published: 0, drafts: 0, totalViews: 0 });

	currentUser$ = this.auth.user$;

	greeting = computed(() => {
		const h = new Date().getHours();
		if (h < 12) return 'Good morning';
		if (h < 17) return 'Good afternoon';
		return 'Good evening';
	});

	readonly quickActions = [
		{ label: 'New Blog Post',  icon: '✍️', route: '/admin/blogs',         color: '#3b82f6', bg: '#eff6ff' },
		{ label: 'New Newsletter', icon: '📰', route: '/admin/newsletter',   color: '#8b5cf6', bg: '#f5f3ff' },
		{ label: 'View Messages',  icon: '💬', route: '/admin/messages',     color: '#10b981', bg: '#ecfdf5' },
		{ label: 'Manage Users',   icon: '👥', route: '/admin/users',        color: '#f59e0b', bg: '#fffbeb' },
		{ label: 'Applications',   icon: '📋', route: '/admin/applications', color: '#ef4444', bg: '#fef2f2' },
		{ label: 'Destinations',   icon: '🌍', route: '/admin/destinations', color: '#06b6d4', bg: '#ecfeff' },
	];

	ngOnInit(): void { this.load(); }

	private load(): void {
		combineLatest([
			this.auth.getAllUsers().pipe(catchError(() => of([]))),
			this.blog.getAllPosts().pipe(catchError(() => of([]))),
			this.newsletter.getAllForAdmin().pipe(catchError(() => of([]))),
			this.contact.getAll().pipe(catchError(() => of([]))),
		]).pipe(takeUntil(this.destroy$))
			.subscribe(([users, posts, letters, messages]) => {
				this.buildStats(users, posts, letters, messages);
				this.buildFeed(users, posts, messages);
				this.buildChart(posts);
				this.recentUsers.set(users.slice(0, 6));
				this.newMessages.set((messages as any[]).filter(m => m.status === 'new').slice(0, 5));
				const nlPub = (letters as any[]).filter(n => n.status === 'published');
				this.newsletterStats.set({
					published: nlPub.length,
					drafts: (letters as any[]).length - nlPub.length,
					totalViews: nlPub.reduce((s: number, n: any) => s + (n.viewCount ?? 0), 0),
				});
				this.loading.set(false);
			});
	}

	private buildStats(users: any[], posts: any[], letters: any[], messages: any[]): void {
		const weekAgo = Date.now() - 7 * 864e5;
		const newUsers = users.filter(u => new Date(u.createdAt).getTime() > weekAgo).length;
		const pubPosts = posts.filter(p => p.published).length;
		const pubLetters = letters.filter(n => n.status === 'published').length;
		const unread = messages.filter(m => m.status === 'new').length;

		this.stats.set([
			{
				label: 'Total Users', value: users.length,
				sub: `${users.filter(u => u.isActive).length} active`,
				icon: '👥', grad: ['#1a35d4', '#00aaff'],
				trend: `+${newUsers} this week`, trendUp: true,
				route: '/admin/users',
			},
			{
				label: 'Blog Posts', value: posts.length,
				sub: `${pubPosts} published`,
				icon: '✍️', grad: ['#7c3aed', '#a78bfa'],
				trend: `${posts.length - pubPosts} drafts`, trendUp: pubPosts > 0,
				route: '/admin/blog',
			},
			{
				label: 'Newsletters', value: letters.length,
				sub: `${pubLetters} published`,
				icon: '📰', grad: ['#059669', '#34d399'],
				trend: `${letters.reduce((s: number, n: any) => s + (n.viewCount ?? 0), 0)} total views`, trendUp: true,
				route: '/admin/newsletter',
			},
			{
				label: 'Messages', value: messages.length,
				sub: `${unread} unread`,
				icon: '💬', grad: ['#ea580c', '#fbbf24'],
				trend: unread > 0 ? `${unread} need reply` : 'All caught up ✓', trendUp: unread === 0,
				route: '/admin/messages',
			},
		]);
	}

	private buildFeed(users: any[], posts: any[], messages: any[]): void {
		const items: FeedItem[] = [];

		(users as any[]).slice(0, 3).forEach(u => items.push({
			type: 'user',
			title: u.displayName || u.email,
			sub: `Registered as ${u.role}`,
			time: this.contact.relativeTime(u.createdAt),
			initials: (u.displayName || u.email || '?').charAt(0).toUpperCase(),
			color: this.roleColor(u.role),
			badge: u.role,
			badgeClass: this.roleBadgeClass(u.role),
		}));

		(messages as any[]).slice(0, 3).forEach(m => items.push({
			type: 'message',
			title: m.fullName,
			sub: m.service || m.message?.slice(0, 55) + '…',
			time: this.contact.relativeTime(m.createdAt),
			initials: m.initials || m.fullName?.charAt(0) || '?',
			color: m.avatarColor || '#6366f1',
			badge: m.status,
			badgeClass: this.msgBadgeClass(m.status),
		}));

		(posts as any[]).slice(0, 2).forEach(p => items.push({
			type: 'blog',
			title: p.title,
			sub: `by ${p.author}`,
			time: this.contact.relativeTime(p.createdAt),
			initials: p.initials || p.author?.charAt(0) || 'B',
			color: p.authorColor || '#8b5cf6',
			badge: p.published ? 'published' : 'draft',
			badgeClass: p.published ? 'badge-green' : 'badge-amber',
		}));

		this.feed.set(items.slice(0, 8));
	}

	private buildChart(posts: any[]): void {
		const cats = (posts as any[]).reduce((acc: Record<string, number>, p) => {
			acc[p.category] = (acc[p.category] || 0) + 1;
			return acc;
		}, {});
		const max = Math.max(...Object.values(cats), 1);
		this.chartBars.set(
			Object.entries(cats)
				.sort(([, a], [, b]) => (b as number) - (a as number))
				.slice(0, 6)
				.map(([label, value]) => ({ label, value: value as number, pct: Math.round((value as number / max) * 100) }))
		);
	}

	roleColor(role: string): string {
		return ({ admin: '#1a35d4', moderator: '#8b5cf6', user: '#10b981' } as any)[role] ?? '#6b7280';
	}

	roleBadgeClass(role: string): string {
		return ({ admin: 'badge-blue', moderator: 'badge-purple', user: 'badge-green' } as any)[role] ?? 'badge-gray';
	}

	msgBadgeClass(status: string): string {
		return ({ new: 'badge-red', read: 'badge-blue', replied: 'badge-green', archived: 'badge-gray' } as any)[status] ?? 'badge-gray';
	}

	typeLabel(type: string): string {
		return ({ user: 'New User', message: 'Message', blog: 'Blog Post', newsletter: 'Newsletter' } as any)[type] ?? 'Activity';
	}

	typeIcon(type: string): string {
		return ({ user: '👤', message: '💬', blog: '✍️', newsletter: '📰' } as any)[type] ?? '📌';
	}

	ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
