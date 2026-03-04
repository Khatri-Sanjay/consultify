import {
	Component, signal, computed, inject,
	OnInit, OnDestroy, ElementRef, ViewChild, NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { firstValueFrom, Subscription } from 'rxjs';
import {
	Newsletter,
	NewsletterService,
	NewsletterStatus,
	NewsletterTag
} from '../../../shared-services/api-service/news-letter.service';
import {DeleteModalService} from '../../common/delete-modal/service/delete-modal.service';

declare const Quill: any;
type View = 'list' | 'form';

@Component({
	selector: 'app-newsletter-admin',
	standalone: true,
	imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
	styleUrl: './newsletter-management.component.css',
	templateUrl: './newsletter-management.component.html'
})
export class NewsletterManagementComponent implements OnInit, OnDestroy {

	svc = inject(NewsletterService);
	private fb = inject(FormBuilder);
	private zone = inject(NgZone);
	private deleteModal = inject(DeleteModalService);

	// ── View State ───────────────────────────────────────────
	view = signal<View>('list');
	loading = signal(true);
	saving = signal(false);
	ok = signal(false);
	errMsg = signal('');
	editId = signal<string | null>(null);

	// ── Data ─────────────────────────────────────────────────
	allItems = signal<Newsletter[]>([]);
	shown = signal<Newsletter[]>([]);

	// ── Filters ──────────────────────────────────────────────
	filterStatus: 'all' | 'published' | 'draft' = 'all';
	filterTag = 'all';
	searchQ = '';

	// ── Pagination ───────────────────────────────────────────
	page     = signal(1);
	pageSize = signal(5);

	totalPages = computed(() =>
		Math.max(1, Math.ceil(this.shown().length / this.pageSize()))
	);

	paged = computed(() => {
		const start = (this.page() - 1) * this.pageSize();
		return this.shown().slice(start, start + this.pageSize());
	});

	pageStart = computed(() =>
		this.shown().length === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1
	);

	pageEnd = computed(() =>
		Math.min(this.page() * this.pageSize(), this.shown().length)
	);

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

	onPageSizeChange(size: number): void {
		this.pageSize.set(size);
		this.page.set(1);
	}

	goPage(p: number | '...'): void {
		if (p === '...') return;
		this.page.set(Math.min(Math.max(1, p as number), this.totalPages()));
	}
	prevPage(): void { if (this.page() > 1) this.page.update(p => p - 1); }
	nextPage(): void { if (this.page() < this.totalPages()) this.page.update(p => p + 1); }

	// ── Stats ─────────────────────────────────────────────────
	stats = computed(() => {
		const all = this.allItems();
		return [
			{ label: 'Total', val: all.length, icon: '📰', color: 'blue' },
			{ label: 'Published', val: all.filter(n => n.status === 'published').length, icon: '✅', color: 'green' },
			{ label: 'Drafts', val: all.filter(n => n.status === 'draft').length, icon: '📝', color: 'amber' },
			{ label: 'Featured', val: all.filter(n => n.featured).length, icon: '⭐', color: 'orange' },
		];
	});

	// ── Constants ─────────────────────────────────────────────
	readonly tags: NewsletterTag[] = [
		'Policy Update', 'Scholarships', 'Year in Review',
		'Visa News', 'University Update', 'Student Story', 'General'
	];

	readonly months = [
		'January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'October', 'November', 'December'
	];

	readonly years: number[] = this.generateYears();

	private generateYears(): number[] {
		const currentYear = new Date().getFullYear();

		return Array.from(
			{ length: 7 },
			(_, i) => currentYear - 2 + i
		);
	}

	// ── Form ──────────────────────────────────────────────────
	form!: FormGroup;
	private subs: Subscription[] = [];

	// ── Quill ─────────────────────────────────────────────────
	@ViewChild('quillEditor') quillEditorEl!: ElementRef;
	private quill: any = null;
	quillReady = signal(false);

	private loadQuill(): Promise<void> {
		return new Promise(resolve => {
			if (typeof Quill !== 'undefined') { resolve(); return; }
			if (!document.querySelector('link[href*="quill"]')) {
				const link = document.createElement('link');
				link.rel = 'stylesheet';
				link.href = 'https://cdn.quilljs.com/1.3.7/quill.snow.css';
				document.head.appendChild(link);
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
				placeholder: 'Write your newsletter content here…',
				modules: {
					toolbar: [
						[{ header: [2, 3, false] }],
						['bold', 'italic', 'underline', 'strike'],
						['blockquote'],
						[{ list: 'ordered' }, { list: 'bullet' }],
						[{ color: [] }, { background: [] }],
						['link'],
						['clean'],
					],
				},
			});
			if (html) this.quill.clipboard.dangerouslyPasteHTML(html);
			this.quill.on('text-change', () => {
				this.zone.run(() => {
					const el = this.quillEditorEl.nativeElement.querySelector('.ql-editor');
					const val = el?.innerHTML ?? '';
					this.form.patchValue(
						{ content: val === '<p><br></p>' ? '' : val },
						{ emitEvent: false }
					);
				});
			});
		});
		this.zone.run(() => this.quillReady.set(true));
	}

	private destroyQuill(): void { this.quill = null; this.quillReady.set(false); }

	// ── Lifecycle ─────────────────────────────────────────────
	ngOnInit(): void { this.buildForm(); this.fetchAll(); }
	ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }

	// ── Fetch ─────────────────────────────────────────────────
	fetchAll(): void {
		this.loading.set(true);
		this.svc.clearCache();
		this.subs.push(
			this.svc.getAllForAdmin().subscribe({
				next: items => { this.allItems.set(items); this.applyFilter(); this.loading.set(false); },
				error: e => { this.errMsg.set(e?.message ?? 'Failed to load.'); this.loading.set(false); }
			})
		);
	}

	applyFilter(): void {
		let list = this.allItems();
		if (this.filterStatus === 'published') list = list.filter(n => n.status === 'published');
		if (this.filterStatus === 'draft') list = list.filter(n => n.status === 'draft');
		if (this.filterTag !== 'all') list = list.filter(n => n.tag === this.filterTag);
		const q = this.searchQ.trim().toLowerCase();
		if (q) list = list.filter(n =>
			n.title.toLowerCase().includes(q) ||
			n.tag.toLowerCase().includes(q) ||
			n.author.toLowerCase().includes(q) ||
			n.month.toLowerCase().includes(q)
		);
		this.shown.set(list);
		this.page.set(1);
	}

	// ── Form Builder ──────────────────────────────────────────
	private buildForm(n?: Newsletter): void {
		this.form = this.fb.group({
			title:       [n?.title ?? '', Validators.required],
			excerpt:     [n?.excerpt ?? '', [Validators.required, Validators.maxLength(300)]],
			content:     [n?.content ?? ''],
			tag:         [n?.tag ?? 'General', Validators.required],
			status:      [n?.status ?? 'draft', Validators.required],
			month:       [n?.month ?? this.months[new Date().getMonth()], Validators.required],
			year:        [n?.year ?? new Date().getFullYear().toString(), Validators.required],
			coverImage:  [n?.coverImage ?? ''],
			author:      [n?.author ?? 'Global Next Team', Validators.required],
			authorTitle: [n?.authorTitle ?? 'Education Consultant', Validators.required],
			authorAvatar:[n?.authorAvatar ?? ''],
			featured:    [n?.featured ?? false],
		});
	}

	// ── CRUD ──────────────────────────────────────────────────
	openNew(): void {
		this.editId.set(null); this.ok.set(false); this.errMsg.set('');
		this.buildForm(); this.view.set('form');
		setTimeout(() => this.initQuill(), 120);
	}

	openEdit(n: Newsletter): void {
		this.editId.set(n.id!); this.ok.set(false); this.errMsg.set('');
		this.buildForm(n); this.view.set('form');
		setTimeout(() => this.initQuill(n.content ?? ''), 120);
	}

	backToList(): void { this.destroyQuill(); this.view.set('list'); }

	save(asDraft = false): void {
		if (!asDraft && this.form.invalid) { this.form.markAllAsTouched(); return; }
		this.saving.set(true); this.ok.set(false); this.errMsg.set('');
		const v = this.form.value;
		const payload: Omit<Newsletter, 'id' | 'createdAt' | 'updatedAt' | 'slug' | 'viewCount'> = {
			title: v.title.trim(), excerpt: v.excerpt.trim(), content: v.content ?? '',
			tag: v.tag, status: asDraft ? 'draft' : v.status,
			month: v.month, year: v.year,
			readTime: this.svc.readTime(v.content ?? ''),
			coverImage: v.coverImage || undefined,
			author: v.author, authorTitle: v.authorTitle,
			authorAvatar: v.authorAvatar || undefined,
			featured: v.featured,
		};
		const id = this.editId();
		if (id) {
			this.subs.push(this.svc.update(id, payload).subscribe({
				next: () => this.onSaveSuccess(), error: (e: Error) => this.onSaveError(e),
			}));
		} else {
			this.subs.push(this.svc.create(payload).subscribe({
				next: (newId: string) => { this.editId.set(newId); this.onSaveSuccess(); },
				error: (e: Error) => this.onSaveError(e),
			}));
		}
	}

	saveDraft(): void { this.save(true); }

	private onSaveSuccess(): void {
		this.ok.set(true); this.saving.set(false); this.fetchAll();
		setTimeout(() => { this.ok.set(false); this.backToList(); }, 1400);
	}

	private onSaveError(e: Error): void {
		this.errMsg.set(e?.message ?? 'Save failed.'); this.saving.set(false);
	}

	deleteItem(n: Newsletter): void {
		this.deleteModal.open({
			title:       `Delete "${n.title}"?`,
			subtitle:    'This action cannot be undone. The newsletter will be permanently removed.',
			meta:        `${n.month} ${n.year} · ${n.tag} · ${n.readTime}`,

			...(n.coverImage
					? { imageUrl: n.coverImage }
					: {
						avatarText:  this.authorInitials(n.author),
						avatarColor: this.avatarColor(n.author),
					}
			),

			onConfirm: async () => {
				try {
					await firstValueFrom(this.svc.delete(n.id!));
					this.fetchAll();
				} catch (e: any) {
					this.errMsg.set(e?.message ?? 'Delete failed.');
				}
			}
		});
	}

	toggleFeatured(n: Newsletter): void {
		this.subs.push(this.svc.update(n.id!, { featured: !n.featured }).subscribe({
			next: () => this.fetchAll(),
			error: e => this.errMsg.set(e?.message ?? 'Update failed.')
		}));
	}

	toggleStatus(n: Newsletter): void {
		const s: NewsletterStatus = n.status === 'published' ? 'draft' : 'published';
		this.subs.push(this.svc.update(n.id!, { status: s }).subscribe({
			next: () => this.fetchAll(),
			error: e => this.errMsg.set(e?.message ?? 'Update failed.')
		}));
	}

	// ── Helpers ───────────────────────────────────────────────
	inv(f: string): boolean {
		const c = this.form.get(f);
		return !!(c && c.invalid && (c.touched || c.dirty));
	}

	tagCls(tag: NewsletterTag): string {
		const map: Record<string, string> = {
			'Policy Update': 'tag-blue', 'Scholarships': 'tag-green',
			'Year in Review': 'tag-purple', 'Visa News': 'tag-cyan',
			'University Update': 'tag-indigo', 'Student Story': 'tag-orange',
			'General': 'tag-gray',
		};
		return map[tag] ?? 'tag-gray';
	}

	estimateRead(): string { return this.svc.readTime(this.form?.get('content')?.value ?? ''); }
	get excerptLen(): number { return this.form?.get('excerpt')?.value?.length ?? 0; }

	protected readonly Math = Math;

	authorInitials(name: string): string {
		if (!name?.trim()) return '?';
		const parts = name.trim().split(/\s+/);
		if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
		return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
	}

	avatarColor(name: string): string {
		const palette = [
			'#1a35d4', '#7c3aed', '#059669', '#d97706',
			'#dc2626', '#0078b5', '#ea580c', '#4338ca',
			'#0e7490', '#be185d', '#15803d', '#b45309',
		];
		if (!name?.trim()) return palette[0];
		const hash = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
		return palette[hash % palette.length];
	}

	newsletterSeedData: Omit<Newsletter, 'id' | 'createdAt' | 'updatedAt' | 'slug' | 'viewCount'>[] = [
		{
			title: "2026 Global Migration Outlook: Targeted Talent",
			excerpt: "A briefing on the shift from general migration to high-skill acquisition in Australia and Canada.",
			content: `
      <h2>The 2026 Border Strategy</h2>
      <p>The global education sector is witnessing a "Quality over Quantity" shift. Governments are moving toward <strong>Targeted Talent Acquisition</strong>.</p>
      <ul>
        <li><strong>Australia:</strong> The new <em>National Innovation Visa</em> replaces the Global Talent visa, focusing on AI and Green Energy.</li>
        <li><strong>Canada:</strong> Express Entry draws now prioritize Healthcare and French-speaking STEM professionals.</li>
      </ul>
      <blockquote>"The goal for 2026 is not just to study abroad, but to align with the host country's long-term economic needs."</blockquote>
      <p>We recommend students focus on high-demand skill lists before finalizing their course selection.</p>
    `,
			tag: "Policy Update",
			status: "published",
			month: "March",
			year: "2026",
			readTime: "8 min read",
			author: "Global Next Team",
			authorTitle: "Director of Migration",
			coverImage: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85",
			featured: true
		},
		{
			title: "The 2026 Full-Fee Waiver Masterlist",
			excerpt: "Our curated list of the top 10 fully funded scholarships closing in April/May 2026.",
			content: `
      <h3>Top Funding Opportunities for 2026</h3>
      <p>Financial barriers are the primary reason for application withdrawals. We have identified three major fully-funded paths:</p>
      <ol>
        <li><strong>Erasmus Mundus (Europe):</strong> 100% tuition + €1,200 monthly stipend.</li>
        <li><strong>Commonwealth Scholarships (UK):</strong> For Master’s and PhD students from developing nations.</li>
        <li><strong>DAAD EPOS (Germany):</strong> Best for professionals with 2+ years of experience.</li>
      </ol>
      <p><strong>Pro Tip:</strong> Start your SOP at least 4 months before the deadline to ensure your goals align with the donor's mission.</p>
    `,
			tag: "Scholarships",
			status: "published",
			month: "March",
			year: "2026",
			readTime: "12 min read",
			author: "Global Next Team",
			authorTitle: "Head of Admissions",
			coverImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644",
			featured: false
		},
		{
			title: "UK Graduate Route: 2026 Compliance Update",
			excerpt: "New monitoring standards for the 2-year post-study work visa you need to know.",
			content: `
      <h2>Protecting Your UK Work Rights</h2>
      <p>The Home Office has updated the <strong>Graduate Route</strong> requirements. While the duration remains 2 years, monitoring of 'Genuine Engagement' has increased.</p>
      <p>Key compliance points:</p>
      <ul>
        <li><strong>Proof of Address:</strong> Update your address on the UKVI portal within 7 days of any move.</li>
        <li><strong>Work Restrictions:</strong> Self-employment is permitted, but professional coaching/sport is prohibited.</li>
      </ul>
      <p>Failure to comply can lead to visa cancellation. Start your 'Skilled Worker' transition plan early in your second year.</p>
    `,
			tag: "Visa News",
			status: "published",
			month: "February",
			year: "2026",
			readTime: "6 min read",
			author: "Global Next Team",
			authorTitle: "Senior Migration Agent",
			coverImage: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad",
			featured: false
		},
		{
			title: "Success Spotlight: Anjali’s Journey to Vancouver",
			excerpt: "How a 3-year study gap was turned into a Master's admission at UBC.",
			content: `
      <h3>Case Study: Overcoming Study Gaps</h3>
      <p>Anjali came to us with a 3-year gap and two previous rejections. We reframed her gap as <strong>Applied Professional Development</strong>.</p>
      <p>The strategy included:</p>
      <ul>
        <li>Rewriting the SOP to focus on NGO field experience.</li>
        <li>Refining the financial narrative to show stable, long-term funding.</li>
      </ul>
      <p>Anjali is now pursuing her MBA at UBC. Her journey proves that a strong narrative beats a 'perfect' profile every time.</p>
    `,
			tag: "Student Story",
			status: "published",
			month: "January",
			year: "2026",
			readTime: "5 min read",
			author: "Global Next Team",
			authorTitle: "Student Counselor",
			coverImage: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2",
			featured: false
		},
		{
			title: "Germany’s Top 5 AI & Robotics Programs",
			excerpt: "Where to apply for English-taught STEM courses in Germany for the Winter 2026 intake.",
			content: `
      <h2>Germany: The AI Hub</h2>
      <p>With the 2026 'Green Tech Initiative', German public universities are offering record English-taught STEM programs.</p>
      <table border="1" style="width:100%; border-collapse: collapse; margin: 10px 0;">
        <tr style="background-color: #f3f4f6;"><th>University</th><th>Specialization</th><th>Intake</th></tr>
        <tr><td>TU Munich</td><td>Robotics</td><td>Winter</td></tr>
        <tr><td>RWTH Aachen</td><td>Data Science</td><td>Winter/Summer</td></tr>
      </table>
      <p>The <strong>Blocked Account</strong> requirement is now €11,904 per year. Ensure your funds are liquid by July for the Winter intake.</p>
    `,
			tag: "University Update",
			status: "published",
			month: "March",
			year: "2026",
			readTime: "9 min read",
			author: "Global Next Team",
			authorTitle: "Academic Specialist",
			coverImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e",
			featured: false
		},
		{
			title: "Mastering the PTE Core: 2026 Strategy",
			excerpt: "A breakdown of the new 'Write Email' section and scoring for Canadian migration.",
			content: `
      <h3>PTE Core vs Academic</h3>
      <p>PTE Core is now the standard for Canadian General Migration. The format focuses on <strong>Everyday English</strong>.</p>
      <ul>
        <li><strong>Write Email:</strong> You have 9 minutes to respond to a real-world scenario.</li>
        <li><strong>Scoring:</strong> Aim for a CLB 7 or higher for a competitive Express Entry profile.</li>
      </ul>
      <p>Join our weekend bootcamp to practice the new automated scoring algorithms.</p>
    `,
			tag: "General",
			status: "published",
			month: "February",
			year: "2026",
			readTime: "7 min read",
			author: "Global Next Team",
			authorTitle: "Language Instructor",
			coverImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8",
			featured: false
		},
		{
			title: "Japan MEXT 2026: The Research Pathway",
			excerpt: "Why Japan is becoming the #1 alternative to Western education in 2026.",
			content: `
      <h2>Study in Japan for Free</h2>
      <p>The MEXT scholarship remains the most prestigious award in Asia. It covers airfare, tuition, and a monthly stipend.</p>
      <p><strong>Selection Phases:</strong></p>
      <ol>
        <li>Document Screening & Written Exam (Math/English).</li>
        <li>Embassy Interview.</li>
        <li>University Acceptance.</li>
      </ol>
      <p>Our Japan desk is currently reviewing research proposals for the 2026 cycle.</p>
    `,
			tag: "Scholarships",
			status: "published",
			month: "March",
			year: "2026",
			readTime: "11 min read",
			author: "Global Next Team",
			authorTitle: "Regional Manager",
			coverImage: "https://images.unsplash.com/photo-1526367790999-015078648402",
			featured: false
		},
		{
			title: "2025 Retrospective: A Year of 98% Success",
			excerpt: "A look back at our growth and the success rates of our students in Germany and Australia.",
			content: `
      <h2>Transparency & Success</h2>
      <p>In 2025, Global Next achieved a <strong>98% Visa Success Rate</strong> for Germany. We helped over 400 students secure admissions in Public Universities.</p>
      <p>Our 2026 vision includes:</p>
      <ul>
        <li>New AI-driven counseling modules.</li>
        <li>Partnerships with 15 new UK institutions.</li>
      </ul>
      <p>Thank you for trusting us with your future.</p>
    `,
			tag: "Year in Review",
			status: "published",
			month: "January",
			year: "2026",
			readTime: "10 min read",
			author: "Global Next Team",
			authorTitle: "Managing Director",
			coverImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4",
			featured: false
		},
		{
			title: "Visa Cap Myths: Debunking the Rumors",
			excerpt: "Clarifying the 'Visa Cap' headlines in Australia and what it really means for you.",
			content: `
      <h3>Fact-Checking the Headlines</h3>
      <p>Recent news about 'Visa Caps' has caused unnecessary panic. In reality, these are <strong>Quality Standards</strong>.</p>
      <p>The Truth:</p>
      <ul>
        <li>Genuine students with clear career goals are still being approved.</li>
        <li>High-ranking universities have seen no decrease in visa grants.</li>
      </ul>
      <p>Our advice: Avoid the "visa mill" colleges and focus on reputable G8 or Russell Group institutions.</p>
    `,
			tag: "Policy Update",
			status: "published",
			month: "February",
			year: "2026",
			readTime: "9 min read",
			author: "Global Next Team",
			authorTitle: "Migration Consultant",
			coverImage: "https://images.unsplash.com/photo-1589330694653-ded6df03f754",
			featured: false
		},
		{
			title: "Acing the Ivy League Admissions Interview",
			excerpt: "Strategies to handle high-pressure academic interviews at elite institutions.",
			content: `
      <h2>The Interview Cheat Sheet</h2>
      <p>The interview is where you prove you are more than your GPA. Elite universities use this to test your <strong>Cultural Fit</strong>.</p>
      <p>Common Questions for 2026:</p>
      <ul>
        <li>"How will you contribute to our campus diversity?"</li>
        <li>"Describe a time you failed and how you pivoted."</li>
      </ul>
      <p>Use the <strong>STAR Method</strong> (Situation, Task, Action, Result) to frame your answers clearly.</p>
    `,
			tag: "General",
			status: "published",
			month: "March",
			year: "2026",
			readTime: "7 min read",
			author: "Global Next Team",
			authorTitle: "Education Consultant",
			coverImage: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e",
			featured: false
		}
	];

	// Inside DirectorNewsletterComponent.ts
	seedData() {
		this.newsletterSeedData.forEach(item => {
			// We use the service create method which handles slugs and timestamps
			this.svc.create(item).subscribe({
				next: (id) => console.log(`Newsletter created with ID: ${id}`),
				error: (err) => console.error('Upload failed', err)
			});
		});
	}
}
