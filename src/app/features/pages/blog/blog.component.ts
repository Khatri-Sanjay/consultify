import {
	Component, signal, computed, inject,
	ElementRef, AfterViewInit, OnInit, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { BlogService, BlogPost } from '../../../shared-services/api-service/blog.service';
import {CATEGORY} from '../../../crux/data/common';

@Component({
	selector: 'app-blog',
	standalone: true,
	imports: [CommonModule, RouterModule, FormsModule],
	styleUrl: './blog.component.css',
	templateUrl: './blog.component.html'
})
export class BlogComponent implements AfterViewInit, OnInit, OnDestroy {

	svc = inject(BlogService);
	private sanitizer = inject(DomSanitizer);
	private el = inject(ElementRef);
	private subs: Subscription[] = [];

	activeCat = signal('All');
	searchQ = signal('');
	sortBy = signal('newest');
	page = signal(1);
	readonly perPage = 6;

	allPosts = signal<BlogPost[]>([]);
	loading = signal(true);
	errMsg = signal('');
	showBtt = signal(false);

	nlName = '';
	nlEmail = '';
	nlDone = signal(false);

	readonly categories = ['ALL'].concat(CATEGORY);

	heroStats = computed(() => {
		const posts = this.allPosts();
		const cats = new Set(posts.map(p => p.category));
		return [
			{ icon: '📰', val: posts.length + '+', label: 'Articles' },
			{ icon: '🌏', val: String(cats.size || 6), label: 'Categories' },
			{ icon: '📅', val: 'Monthly', label: 'Newsletter' },
		];
	});

	fetchPosts(): void {
		this.loading.set(true);
		this.errMsg.set('');
		this.subs.push(
			this.svc.getPosts().subscribe({
				next: posts => {
					this.allPosts.set(posts);
					this.loading.set(false);
					setTimeout(() => this.observeElements(), 100);
				},
				error: e => {
					this.errMsg.set(e?.message ?? 'Failed to load articles.');
					this.loading.set(false);
				}
			})
		);
	}

	private observeElements(): void {
		this.el.nativeElement.querySelectorAll('.rv,.sg')
			.forEach((el: Element) => {
				el.classList.remove('in'); // reset first
				this._obs.observe(el);
			});
	}

	// ── Computed ───────────────────────────────────────────────────
	featuredPost = computed(() =>
		this.allPosts().find(p => p.featured && p.published)
	);

	filteredPosts = computed(() => {
		// Exclude featured from grid when on "All" with no search
		let list = this.allPosts().filter(p => p.published);
		if (this.activeCat() === 'All' && !this.searchQ) {
			list = list.filter(p => !p.featured);
		}
		if (this.activeCat() !== 'All') {
			list = list.filter(p => p.category === this.activeCat());
		}
		const q = this.searchQ().trim().toLowerCase();
		if (q) {
			list = list.filter(p =>
				p.title.toLowerCase().includes(q) ||
				p.excerpt.toLowerCase().includes(q) ||
				(p.tags ?? []).some(t => t.toLowerCase().includes(q))
			);
		}
		if (this.sortBy() === 'oldest') list = [...list].reverse();
		if (this.sortBy() === 'shortest') {
			list = [...list].sort((a, b) => parseInt(a.readTime ?? '0') - parseInt(b.readTime ?? '0'));
		}
		return list;
	});

	visiblePosts = computed(() => {
		const s = (this.page() - 1) * this.perPage;
		return this.filteredPosts().slice(s, s + this.perPage);
	});

	totalPages = computed(() => Math.max(1, Math.ceil(this.filteredPosts().length / this.perPage)));
	pageList = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

	recentPosts = computed(() =>
		this.allPosts().filter(p => p.published && !p.featured).slice(0, 5)
	);

	allTags = computed(() => {
		const set = new Set<string>();
		this.allPosts().forEach(p => (p.tags ?? []).forEach(t => set.add(t)));
		return [...set].slice(0, 18);
	});

	setCat(cat: string): void { this.activeCat.set(cat); this.page.set(1); }
	onSearch(): void { this.page.set(1); }
	onSort(): void { this.page.set(1); }
	clearSearch(): void { this.searchQ.set(''); this.page.set(1); }

	resetFilters(): void { this.searchQ.set(''); this.activeCat.set('All'); this.page.set(1); }

	searchTag(tag: string): void { this.searchQ.set(tag); this.page.set(1); }

	goTo(n: number): void {
		if (n < 1 || n > this.totalPages()) return;
		this.page.set(n);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	countCat(cat: string): number {
		return this.allPosts().filter(p => p.published && p.category === cat).length;
	}

	// ── Helpers ────────────────────────────────────────────────────
	ytThumb(id: string): string {
		return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
	}

	ytEmbed(id: string): SafeResourceUrl {
		return this.sanitizer.bypassSecurityTrustResourceUrl(
			`https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`
		);
	}

	catEmoji(cat: string): string {
		const m: Record<string, string> = {
			'Visa News': '📋', 'Study Tips': '📚', 'Scholarships': '🎓',
			'Life Abroad': '🌏', 'PTE / IELTS': '📝', 'University Guide': '🏫',
		};
		return m[cat] ?? '📰';
	}

	// ── Scroll reveal + back-to-top ────────────────────────────────
	private _obs!: IntersectionObserver;
	private _scrollHandler = () => this.showBtt.set(window.scrollY > 400);


	ngOnInit(): void {
		this.fetchPosts();
		window.addEventListener('scroll', this._scrollHandler, { passive: true });
	}

	ngAfterViewInit(): void {
		this._obs = new IntersectionObserver(entries => {
			entries.forEach(e => {
				if (e.isIntersecting) {
					e.target.classList.add('in');
					this._obs.unobserve(e.target);
				}
			});
		}, { threshold: 0.10 });
		this.observeElements();
	}

	ngOnDestroy(): void {
		this.subs.forEach(s => s.unsubscribe());
		this._obs?.disconnect();
		window.removeEventListener('scroll', this._scrollHandler);
	}
}
