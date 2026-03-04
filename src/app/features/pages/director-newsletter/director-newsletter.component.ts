import {
	Component, signal, computed, inject, OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
	Newsletter, NewsletterService, NewsletterTag
} from '../../../shared-services/api-service/news-letter.service';

@Component({
	selector: 'app-director-newsletter',
	standalone: true,
	imports: [CommonModule, FormsModule],
	styleUrl: './director-newsletter.component.css',
	templateUrl: './director-newsletter.component.html'
})
export class DirectorNewsletterComponent implements OnInit {

	private svc = inject(NewsletterService);
	private router = inject(Router);

	loading = signal(true);
	errMsg  = signal('');

	allItems = signal<Newsletter[]>([]);
	shown    = signal<Newsletter[]>([]);

	searchQ   = '';
	activeTag: string = 'all';
	sortBy    = 'newest';

	page     = signal(1);
	readonly pageSize = 9;

	totalPages = computed(() => Math.max(1, Math.ceil(this.shown().length / this.pageSize)));

	paged = computed(() => {
		const start = (this.page() - 1) * this.pageSize;
		return this.shown().slice(start, start + this.pageSize);
	});

	pageNumbers = computed(() => {
		const total = this.totalPages();
		const cur   = this.page();
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

	featured = computed(() =>
		this.allItems().find(n => n.featured && n.status === 'published') ?? null
	);

	readonly tags: NewsletterTag[] = [
		'Policy Update', 'Scholarships', 'Year in Review',
		'Visa News', 'University Update', 'Student Story', 'General'
	];

	ngOnInit(): void { this.load(); }

	load(): void {
		this.loading.set(true);
		this.errMsg.set('');
		this.svc.getNewsletters(100).subscribe({
			next: items => {
				this.allItems.set(items);
				this.applyFilter();
				this.loading.set(false);
			},
			error: e => {
				this.errMsg.set(e?.message ?? 'Failed to load newsletters.');
				this.loading.set(false);
			}
		});
	}

	applyFilter(): void {
		let list = this.allItems().filter(n => n.status === 'published');

		if (this.activeTag !== 'all') list = list.filter(n => n.tag === this.activeTag);

		const q = this.searchQ.trim().toLowerCase();
		if (q) list = list.filter(n =>
			n.title.toLowerCase().includes(q) ||
			n.excerpt.toLowerCase().includes(q) ||
			n.author.toLowerCase().includes(q) ||
			n.tag.toLowerCase().includes(q) ||
			n.month.toLowerCase().includes(q)
		);

		if (this.sortBy === 'newest') {
			list = [...list].sort((a, b) => {
				const da = a.publishedAt instanceof Date ? a.publishedAt : (a.publishedAt as any)?.toDate?.() ?? new Date(0);
				const db2 = b.publishedAt instanceof Date ? b.publishedAt : (b.publishedAt as any)?.toDate?.() ?? new Date(0);
				return db2.getTime() - da.getTime();
			});
		} else if (this.sortBy === 'oldest') {
			list = [...list].sort((a, b) => {
				const da = a.publishedAt instanceof Date ? a.publishedAt : (a.publishedAt as any)?.toDate?.() ?? new Date(0);
				const db2 = b.publishedAt instanceof Date ? b.publishedAt : (b.publishedAt as any)?.toDate?.() ?? new Date(0);
				return da.getTime() - db2.getTime();
			});
		} else if (this.sortBy === 'views') {
			list = [...list].sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));
		}

		this.shown.set(list);
		this.page.set(1);
	}

	goDetail(n: Newsletter): void {
		this.router.navigate(['/director-newsletter', n.slug]);
	}

	goPage(p: number | '...'): void {
		if (p === '...') return;
		this.page.set(Math.min(Math.max(1, p as number), this.totalPages()));
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
	prevPage(): void { if (this.page() > 1) { this.page.update(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } }
	nextPage(): void { if (this.page() < this.totalPages()) { this.page.update(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } }

	authorInitials(name: string): string {
		if (!name?.trim()) return '?';
		const parts = name.trim().split(/\s+/);
		if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
		return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
	}

	avatarColor(name: string): string {
		const palette = ['#1a35d4','#7c3aed','#059669','#d97706','#dc2626',
			'#0078b5','#ea580c','#4338ca','#0e7490','#be185d'];
		if (!name?.trim()) return palette[0];
		const hash = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
		return palette[hash % palette.length];
	}

	tagCls(tag: NewsletterTag): string {
		const map: Record<string, string> = {
			'Policy Update': 'tag-blue', 'Scholarships': 'tag-green',
			'Year in Review': 'tag-purple', 'Visa News': 'tag-cyan',
			'University Update': 'tag-indigo', 'Student Story': 'tag-orange', 'General': 'tag-gray',
		};
		return map[tag] ?? 'tag-gray';
	}

	protected readonly Math = Math;
}
