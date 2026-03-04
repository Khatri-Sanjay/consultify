import {
	Component, signal, computed, inject,
	OnInit, OnDestroy, ElementRef, ViewChild, NgZone
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DomSanitizer} from '@angular/platform-browser';
import {firstValueFrom, Subscription} from 'rxjs';
import {BlogService, BlogPost, MediaType} from '../../../shared-services/api-service/blog.service';
import {CATEGORY} from '../../../crux/data/common';
import {DeleteModalService} from '../../common/delete-modal/service/delete-modal.service';

declare const Quill: any;
type View = 'list' | 'form';

@Component({
	selector: 'app-blog-admin',
	standalone: true,
	imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
	styleUrl: './blog-management.component.css',
	templateUrl: './blog-management.component.html'
})
export class BlogManagementComponent implements OnInit, OnDestroy {

	svc = inject(BlogService);
	private fb = inject(FormBuilder);
	private san = inject(DomSanitizer);
	private deleteModal = inject(DeleteModalService);
	private zone = inject(NgZone);

	// ── View state ───────────────────────────────────────────────
	view = signal<View>('list');
	media = signal<MediaType>('image');
	loading = signal(true);
	saving = signal(false);
	ok = signal(false);
	errMsg = signal('');
	editId = signal<string | null>(null);
	imgError = false;

	// ── Data ─────────────────────────────────────────────────────
	allPosts = signal<BlogPost[]>([]);
	shown = signal<BlogPost[]>([]);
	filterBy = 'all';
	searchQ = '';

	// ── Pagination ───────────────────────────────────────────────
	page = signal(1);
	pageSize = signal(5);

	totalPages = computed(() =>
		Math.max(1, Math.ceil(this.shown().length / this.pageSize()))
	);

	pagedPosts = computed(() => {
		const s = (this.page() - 1) * this.pageSize();
		return this.shown().slice(s, s + this.pageSize());
	});

	pageStart = computed(() =>
		this.shown().length === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1
	);

	pageEnd = computed(() =>
		Math.min(this.page() * this.pageSize(), this.shown().length)
	);

	pageNumbers = computed<(number | '...')[]>(() => {
		const total = this.totalPages();
		const cur = this.page();
		const pages: (number | '...')[] = [];
		if (total <= 7) {
			for (let i = 1; i <= total; i++) pages.push(i);
		} else {
			pages.push(1);
			if (cur > 3) pages.push('...');
			for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++) pages.push(p);
			if (cur < total - 2) pages.push('...');
			pages.push(total);
		}
		return pages;
	});

	goPage(p: number | '...'): void {
		if (p === '...') return;
		this.page.set(Math.max(1, Math.min(p as number, this.totalPages())));
	}

	prevPage(): void {
		if (this.page() > 1) this.page.update(p => p - 1);
	}

	nextPage(): void {
		if (this.page() < this.totalPages()) this.page.update(p => p + 1);
	}

	onPageSizeChange(size: number): void {
		this.pageSize.set(size);
		this.page.set(1);
	}

	// ── Form ─────────────────────────────────────────────────────
	form!: FormGroup;
	private subs: Subscription[] = [];

	@ViewChild('quillEditor') quillEditorEl!: ElementRef;
	private quill: any = null;
	quillReady = signal(false);

	// ── Static data ──────────────────────────────────────────────
	readonly categories = CATEGORY;
	readonly mediaOpts = [
		{val: 'image' as MediaType, icon: '🖼️', label: 'Image URL'},
		{val: 'youtube' as MediaType, icon: '▶️', label: 'YouTube'},
		{val: 'video' as MediaType, icon: '🎬', label: 'Video URL'},
		{val: 'none' as MediaType, icon: '💬', label: 'Emoji'},
	];
	readonly authorColors = ['#1a35d4', '#7c3aed', '#059669', '#dc2626', '#0891b2', '#d97706', '#db2777'];

	// ── Stats ────────────────────────────────────────────────────
	stats = computed(() => {
		const all = this.allPosts();
		return [
			{label: 'Total Posts', val: all.length, icon: '📄', color: 'blue'},
			{label: 'Published', val: all.filter(p => p.published).length, icon: '🌐', color: 'green'},
			{label: 'Drafts', val: all.filter(p => !p.published).length, icon: '📝', color: 'amber'},
			{label: 'Featured', val: all.filter(p => p.featured).length, icon: '⭐', color: 'purple'},
		];
	});

	estimateRead(): string {
		return this.svc.readTime(this.form?.get('content')?.value ?? '');
	}

	// ── Lifecycle ────────────────────────────────────────────────
	ngOnInit(): void {
		this.buildForm();
		this.fetchPosts();
	}

	ngOnDestroy(): void {
		this.subs.forEach(s => s.unsubscribe());
	}

	// ── Data fetching ────────────────────────────────────────────
	fetchPosts(): void {
		this.loading.set(true);
		this.subs.push(
			this.svc.getAllPosts().subscribe({
				next: posts => {
					this.allPosts.set(posts);
					this.applyFilter();
					this.loading.set(false);
				},
				error: e => {
					this.errMsg.set(e?.message ?? 'Failed to load posts.');
					this.loading.set(false);
				}
			})
		);
	}

	refreshList(): void {
		this.fetchPosts();
	}

	setFilter(value: string): void {
		this.filterBy = value;
		this.page.set(1);
		this.applyFilter();
	}

	applyFilter(): void {
		let list = this.allPosts();
		if (this.filterBy === 'pub') list = list.filter(p => p.published);
		if (this.filterBy === 'draft') list = list.filter(p => !p.published);
		const q = this.searchQ.trim().toLowerCase();
		if (q) list = list.filter(p =>
			p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
		);
		this.shown.set(list);
		this.page.set(1);
	}

	// ── Form helpers ─────────────────────────────────────────────
	private buildForm(p?: BlogPost): void {
		this.form = this.fb.group({
			title: [p?.title ?? '', [Validators.required]],
			slug: [p?.slug ?? '', [Validators.required]],
			excerpt: [p?.excerpt ?? '', [Validators.required, Validators.maxLength(200)]],
			content: [p?.content ?? ''],
			category: [p?.category ?? '', [Validators.required]],
			tagsRaw: [p?.tags?.join(', ') ?? ''],
			author: [p?.author ?? 'Global Next Team', [Validators.required]],
			authorRole: [p?.authorRole ?? 'Education Consultant'],
			authorColor: [p?.authorColor ?? '#1a35d4'],
			published: [p?.published ?? false],
			featured: [p?.featured ?? false],
			imageUrl: [p?.imageUrl ?? ''],
			imageAlt: [p?.imageAlt ?? ''],
			videoUrl: [p?.videoUrl ?? ''],
			youtubeUrl: [''],
			youtubeId: [p?.youtubeId ?? ''],
			fallbackEmoji: [p?.fallbackEmoji ?? ''],
		});
		if (p?.youtubeId) {
			this.form.patchValue({youtubeUrl: `https://www.youtube.com/watch?v=${p.youtubeId}`}, {emitEvent: false});
		}
	}

	openNew(): void {
		this.editId.set(null);
		this.media.set('image');
		this.ok.set(false);
		this.errMsg.set('');
		this.imgError = false;
		this.buildForm();
		this.view.set('form');
		setTimeout(() => this.initQuill(), 120);
	}

	openEdit(p: BlogPost): void {
		this.editId.set(p.id!);
		this.media.set(p.mediaType);
		this.ok.set(false);
		this.errMsg.set('');
		this.imgError = false;
		this.buildForm(p);
		this.view.set('form');
		setTimeout(() => this.initQuill(p.content ?? ''), 120);
	}

	save(draft = false): void {
		if (!draft && this.form.invalid) {
			this.form.markAllAsTouched();
			return;
		}
		this.saving.set(true);
		this.ok.set(false);
		this.errMsg.set('');
		const v = this.form.value;
		const tags = String(v.tagsRaw).split(',').map((t: string) => t.trim().toLowerCase()).filter(Boolean);
		const payload: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'> = {
			title: v.title.trim(), slug: v.slug.trim(), excerpt: v.excerpt.trim(),
			content: v.content ?? '', category: v.category, tags,
			author: v.author, authorRole: v.authorRole,
			initials: this.svc.initials(v.author), authorColor: v.authorColor,
			published: draft ? false : v.published, featured: v.featured,
			readTime: this.svc.readTime(v.content ?? ''), mediaType: this.media(),
			imageUrl: v.imageUrl || undefined, imageAlt: v.imageAlt || undefined,
			videoUrl: v.videoUrl || undefined, youtubeId: v.youtubeId || undefined,
			fallbackEmoji: v.fallbackEmoji || undefined,
		};
		const id = this.editId();
		if (id) {
			this.subs.push(this.svc.update(id, payload).subscribe({
				next: () => this.onSaveSuccess(),
				error: (e: Error) => this.onSaveError(e)
			}));
		} else {
			this.subs.push(this.svc.create(payload).subscribe({
				next: (newId: string) => {
					this.editId.set(newId);
					this.onSaveSuccess();
				}, error: (e: Error) => this.onSaveError(e)
			}));
		}
		this.backToList();
	}

	saveDraft(): void {
		this.save(true);
	}

	private onSaveSuccess(): void {
		this.ok.set(true);
		this.saving.set(false);
		setTimeout(() => this.ok.set(false), 3500);
		this.fetchPosts();
	}

	private onSaveError(e: Error): void {
		this.errMsg.set(e?.message ?? 'Save failed.');
		this.saving.set(false);
	}

	togglePub(p: BlogPost): void {
		this.subs.push(this.svc.togglePublish(p.id!, p.published).subscribe({
			next: () => this.fetchPosts(),
			error: e => this.errMsg.set(e?.message ?? 'Toggle failed.'),
		}));
	}

	askDelete(post: BlogPost): void {
		this.deleteModal.open({
			title: post.title, subtitle: post.slug, meta: post.category,
			imageUrl: post.mediaType === 'image' ? post.imageUrl
				: post.mediaType === 'youtube' ? this.ytThumb(post.youtubeId ?? '') : undefined,
			onConfirm: async () => {
				await firstValueFrom(this.svc.delete(post));
				this.svc.clearCache();
				this.refreshList();
			},
		});
	}

	backToList(): void {
		this.destroyQuill();
		this.view.set('list');
	}

	// ── Quill ─────────────────────────────────────────────────────
	private loadQuill(): Promise<void> {
		return new Promise(resolve => {
			if (typeof Quill !== 'undefined') {
				resolve();
				return;
			}
			const s = document.createElement('script');
			s.src = 'https://cdn.quilljs.com/1.3.7/quill.min.js';
			s.onload = () => resolve();
			document.head.appendChild(s);
		});
	}

	private async initQuill(html = ''): Promise<void> {
		await this.loadQuill();
		await new Promise<void>(r => setTimeout(r, 80));
		if (!this.quillEditorEl?.nativeElement) return;
		this.destroyQuill();
		this.zone.runOutsideAngular(() => {
			this.quill = new Quill(this.quillEditorEl.nativeElement, {
				theme: 'snow',
				placeholder: 'Start writing your article here…',
				modules: {
					toolbar: [[{header: [2, 3, false]}], ['bold', 'italic', 'underline'],
						['blockquote'], [{list: 'ordered'}, {list: 'bullet'}], ['link', 'image'], ['clean']],
				},
			});
			if (html) this.quill.clipboard.dangerouslyPasteHTML(html);
			this.quill.on('text-change', () => {
				this.zone.run(() => {
					const el = this.quillEditorEl.nativeElement.querySelector('.ql-editor');
					const val = el?.innerHTML ?? '';
					this.form.patchValue({content: val === '<p><br></p>' ? '' : val}, {emitEvent: false});
				});
			});
		});
		this.zone.run(() => this.quillReady.set(true));
	}

	private destroyQuill(): void {
		this.quill = null;
		this.quillReady.set(false);
	}

	// ── Helpers ──────────────────────────────────────────────────
	autoSlug(): void {
		if (!this.editId())
			this.form.patchValue({slug: this.svc.slugify(this.form.get('title')?.value ?? '')});
	}

	inv(f: string): boolean {
		const c = this.form.get(f);
		return !!(c && c.invalid && (c.touched || c.dirty));
	}

	ytThumb(id: string | null): string {
		return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : '';
	}

	parseYoutubeUrl(): void {
		const id = this.extractYtId(this.form.get('youtubeUrl')?.value ?? '');
		this.form.patchValue({youtubeId: id ?? ''});
	}

	private extractYtId(url: string): string | null {
		if (!url) return null;
		const m = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/);
		if (m?.[1]) return m[1];
		return /^[A-Za-z0-9_-]{11}$/.test(url.trim()) ? url.trim() : null;
	}

	catEmoji(cat: string): string {
		const m: Record<string, string> = {
			'Visa News': '📋', 'Study Tips': '📚', 'Scholarships': '🎓',
			'Life Abroad': '🌏', 'PTE / IELTS': '📝', 'University Guide': '🏫'
		};
		return m[cat] ?? '📰';
	}

	statClass(color: string): string {
		return ({
			blue: 'stat-blue',
			green: 'stat-green',
			amber: 'stat-amber',
			purple: 'stat-purple'
		} as any)[color] ?? '';
	}
}
