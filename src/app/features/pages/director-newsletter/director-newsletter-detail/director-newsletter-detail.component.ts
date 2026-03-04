import {
	Component, signal, inject, OnInit, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import {
	Newsletter, NewsletterService, NewsletterTag
} from '../../../../shared-services/api-service/news-letter.service';

@Component({
	selector: 'app-newsletter-detail',
	standalone: true,
	imports: [CommonModule, RouterModule],
	styleUrl: './director-newsletter-detail.component.css',
	templateUrl: './director-newsletter-detail.component.html'
})
export class DirectorNewsletterDetailComponent implements OnInit, OnDestroy {

	private route  = inject(ActivatedRoute);
	private router = inject(Router);
	private svc    = inject(NewsletterService);

	newsletter  = signal<Newsletter | null>(null);
	related     = signal<Newsletter[]>([]);
	loading     = signal(true);
	errMsg      = signal('');
	readProgress = signal(0);

	private subs: Subscription[] = [];
	private scrollListener?: () => void;

	ngOnInit(): void {
		this.subs.push(
			this.route.paramMap.subscribe(params => {
				const slug = params.get('slug');
				if (slug) this.loadBySlug(slug);
			})
		);
		this.initScrollProgress();
	}

	ngOnDestroy(): void {
		this.subs.forEach(s => s.unsubscribe());
		if (this.scrollListener) window.removeEventListener('scroll', this.scrollListener);
	}

	private loadBySlug(slug: string): void {
		this.loading.set(true);
		this.errMsg.set('');
		this.newsletter.set(null);
		this.subs.push(
			this.svc.getNewsletterBySlug(slug).subscribe({
				next: n => {
					if (!n) { this.errMsg.set('Newsletter not found.'); this.loading.set(false); return; }
					this.newsletter.set(n);
					this.loading.set(false);
					if (n.id) this.svc.incrementViews(n.id);
					this.loadRelated(n);
				},
				error: e => { this.errMsg.set(e?.message ?? 'Failed to load.'); this.loading.set(false); }
			})
		);
	}

	private loadRelated(n: Newsletter): void {
		this.subs.push(
			this.svc.getByTag(n.tag).subscribe({
				next: items => {
					this.related.set(items.filter(i => i.id !== n.id).slice(0, 3));
				},
				error: () => {}
			})
		);
	}

	private initScrollProgress(): void {
		this.scrollListener = () => {
			const scrollTop = window.scrollY;
			const docHeight = document.documentElement.scrollHeight - window.innerHeight;
			this.readProgress.set(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0);
		};
		window.addEventListener('scroll', this.scrollListener, { passive: true });
	}

	goBack(): void { this.router.navigate(['/director-newsletter']); }

	goDetail(n: Newsletter): void {
		this.router.navigate(['/director-newsletter', n.slug]);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

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

	formatDate(ts: any): string { return this.svc.formatDate(ts); }

	copyLink(): void {
		navigator.clipboard.writeText(window.location.href).then(() => {
			// optionally show a toast
		});
	}
}
