import { Component, OnInit, signal } from '@angular/core';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Result { title: string; excerpt: string; route: string; type: string; }

const SITE_CONTENT: Result[] = [
	{ title: 'Student Admission',              excerpt: 'Expert guidance for university and college applications across Australia.',         route: '/services/student-admission', type: 'Service' },
	{ title: 'Health Insurance (OSHC)',        excerpt: 'Overseas Student Health Cover selection and management guidance.',                 route: '/services/health-insurance',  type: 'Service' },
	{ title: 'PTE / IELTS Preparation',        excerpt: 'English proficiency test coaching to achieve your target score.',                 route: '/services/pte-ielts',          type: 'Service' },
	{ title: 'Student Visa (Subclass 500)',    excerpt: 'Full support for student visa applications — from documents to approval.',         route: '/visa/student-visa',           type: 'Visa'    },
	{ title: 'Temporary Graduate Visa (485)', excerpt: 'Post-study work visa guidance for recent Australian graduates.',                   route: '/visa/graduate-visa',          type: 'Visa'    },
	{ title: 'Tourist Visa (Subclass 600)',   excerpt: 'Visitor visa for tourism, recreation, or family visits to Australia.',             route: '/visa/tourist-visa',           type: 'Visa'    },
	{ title: 'About EduPath Consultancy',     excerpt: 'Learn about our team, values, and 10+ years of experience.',                     route: '/about',                       type: 'Page'    },
	{ title: "Director's Newsletter",         excerpt: 'Latest updates and insights from our director, Dr. Sarah Kim.',                  route: '/about/director-newsletter',   type: 'Page'    },
	{ title: 'Contact Us',                    excerpt: 'Book a free consultation with our registered migration agents.',                  route: '/contact',                     type: 'Page'    },
	{ title: 'Blog & Insights',              excerpt: 'Articles on visas, scholarships, PTE/IELTS, and life in Australia.',              route: '/blog',                        type: 'Blog'    },
];

@Component({
	selector: 'app-search',
	standalone: true,
	imports: [RouterModule, FormsModule],
	template: `
		<section class="py-16">
			<div class="container-custom max-w-4xl">

				<!-- Header -->
				<div class="mb-10">
					<h1 class="font-display text-3xl font-bold text-gray-900 mb-6">
						Search Results
						@if (query()) {
							<span class="text-primary-600"> for "{{ query() }}"</span>
						}
					</h1>

					<!-- Search bar -->
					<form (ngSubmit)="go()" role="search">
						<div class="relative">
							<label for="page-search" class="sr-only">Search EduPath</label>
							<svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
								 fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
									  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
							</svg>
							<input
								id="page-search" type="search" name="q" [(ngModel)]="input"
								placeholder="Search services, visa info, blog posts…"
								class="form-input pl-12 pr-28 py-4 text-base"
							/>
							<button type="submit" class="btn btn-primary btn-sm absolute right-2 top-1/2 -translate-y-1/2">
								Search
							</button>
						</div>
					</form>
				</div>

				<!-- Results -->
				@if (results().length > 0) {
					<p class="text-gray-400 text-sm mb-6">{{ results().length }} result(s) found</p>

					<div class="space-y-4">
						@for (r of results(); track r.route) {
							<a [routerLink]="r.route"
							   class="card p-6 flex items-start gap-5 group hover:-translate-y-0.5 transition-all duration-200">
								<div class="flex-1">
									<div class="flex items-center gap-2 mb-2">
                    <span class="bg-primary-50 text-primary-700 text-xs font-bold px-2.5 py-1 rounded-md">
                      {{ r.type }}
                    </span>
									</div>
									<h2 class="font-display text-xl font-bold text-gray-900 mb-2
                             group-hover:text-primary-700 transition-colors">{{ r.title }}</h2>
									<p class="text-gray-500 text-sm leading-relaxed">{{ r.excerpt }}</p>
								</div>
								<svg class="w-5 h-5 text-gray-300 group-hover:text-primary-500 flex-shrink-0 mt-1
                            group-hover:translate-x-1 transition-all"
									 fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
								</svg>
							</a>
						}
					</div>

				} @else if (query()) {
					<!-- No results -->
					<div class="text-center py-20">
						<div class="text-7xl mb-6" aria-hidden="true">🔍</div>
						<h2 class="font-display text-2xl font-bold text-gray-900 mb-3">No results found</h2>
						<p class="text-gray-500 text-sm mb-8">Try different keywords or browse our services below.</p>
						<div class="flex flex-wrap gap-3 justify-center">
							<a routerLink="/services" class="btn btn-outline">Our Services</a>
							<a routerLink="/visa"     class="btn btn-outline">Visa Services</a>
							<a routerLink="/contact"  class="btn btn-primary">Contact Us</a>
						</div>
					</div>
				} @else {
					<div class="text-center py-20 text-gray-400">
						<div class="text-7xl mb-5" aria-hidden="true">💡</div>
						<p>Enter a search term above to find content across our website.</p>
					</div>
				}

			</div>
		</section>
	`,
})
export class SearchComponent implements OnInit {
	query   = signal('');
	results = signal<Result[]>([]);
	input   = '';

	constructor(private route: ActivatedRoute) {}

	ngOnInit(): void {
		this.route.queryParams.subscribe((p) => {
			const q = p['q'] || '';
			this.query.set(q);
			this.input = q;
			this.search(q);
		});
	}

	go(): void {
		this.query.set(this.input);
		this.search(this.input);
	}

	private search(q: string): void {
		if (!q.trim()) { this.results.set([]); return; }
		const t = q.toLowerCase();
		this.results.set(
			SITE_CONTENT.filter(
				(r) => r.title.toLowerCase().includes(t) || r.excerpt.toLowerCase().includes(t) || r.type.toLowerCase().includes(t),
			),
		);
	}
}
