import {
	Component, signal, ElementRef, AfterViewInit, OnDestroy
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';

@Component({
	selector: 'app-visa',
	standalone: true,
	imports: [CommonModule, RouterModule],
	styles: [`
		:host {
			display: block;
		}

		/* ── Scroll reveal ───────────────────────────────── */
		.reveal {
			opacity: 0;
			transform: translateY(28px);
			transition: opacity .6s ease, transform .6s ease;
		}

		.reveal.in {
			opacity: 1;
			transform: none;
		}

		.reveal-l {
			opacity: 0;
			transform: translateX(-28px);
			transition: opacity .6s ease, transform .6s ease;
		}

		.reveal-l.in {
			opacity: 1;
			transform: none;
		}

		.reveal-r {
			opacity: 0;
			transform: translateX(28px);
			transition: opacity .6s ease, transform .6s ease;
		}

		.reveal-r.in {
			opacity: 1;
			transform: none;
		}

		.stagger > * {
			opacity: 0;
			transform: translateY(22px);
			transition: opacity .52s ease, transform .52s ease;
		}

		.stagger.in > * {
			opacity: 1;
			transform: none;
		}

		.stagger.in > *:nth-child(1) {
			transition-delay: .00s;
		}

		.stagger.in > *:nth-child(2) {
			transition-delay: .06s;
		}

		.stagger.in > *:nth-child(3) {
			transition-delay: .12s;
		}

		.stagger.in > *:nth-child(4) {
			transition-delay: .18s;
		}

		.stagger.in > *:nth-child(5) {
			transition-delay: .24s;
		}

		.stagger.in > *:nth-child(6) {
			transition-delay: .30s;
		}

		.stagger.in > *:nth-child(7) {
			transition-delay: .36s;
		}

		.stagger.in > *:nth-child(8) {
			transition-delay: .42s;
		}

		.stagger.in > *:nth-child(9) {
			transition-delay: .48s;
		}

		.stagger.in > *:nth-child(10) {
			transition-delay: .54s;
		}

		.stagger.in > *:nth-child(11) {
			transition-delay: .60s;
		}

		.stagger.in > *:nth-child(12) {
			transition-delay: .66s;
		}

		/* ── Subnav ──────────────────────────────────────── */
		.gn-subnav {
			background: #fff;
			border-bottom: 1px solid #eef1ff;
			position: sticky;
			top: 72px;
			z-index: 30;
		}

		@media (min-width: 1024px) {
			.gn-subnav {
				top: 80px;
			}
		}

		.gn-subnav-link {
			display: flex;
			align-items: center;
			gap: .4rem;
			flex-shrink: 0;
			padding: 1rem 0;
			border-bottom: 2px solid transparent;
			font-size: .875rem;
			font-weight: 600;
			color: #6b7280;
			text-decoration: none;
			white-space: nowrap;
			transition: color .15s, border-color .15s;
		}

		.gn-subnav-link:hover {
			color: #1a35d4;
			border-color: #b9d1ff;
		}

		.gn-subnav-link.active {
			color: #1a35d4;
			border-color: #1a35d4;
		}

		/* ── Country filter pills ────────────────────────── */
		.c-pill {
			display: inline-flex;
			align-items: center;
			gap: .4rem;
			padding: .4rem .9rem;
			border-radius: 999px;
			border: 1.5px solid #dde3ff;
			background: #fff;
			color: #4b5563;
			font-size: .8rem;
			font-weight: 500;
			cursor: pointer;
			transition: all .2s;
			white-space: nowrap;
		}

		.c-pill:hover {
			border-color: #1a35d4;
			color: #1a35d4;
			background: #eef4ff;
		}

		.c-pill.active {
			background: linear-gradient(135deg, #1a35d4, #00aaff);
			border-color: transparent;
			color: #fff;
			font-weight: 600;
			box-shadow: 0 4px 14px rgba(26, 53, 212, .3);
		}

		/* ── Visa card ───────────────────────────────────── */
		.visa-card {
			background: #fff;
			border-radius: 1.25rem;
			border: 1.5px solid #eef1ff;
			box-shadow: 0 2px 18px rgba(26, 37, 96, .06);
			transition: all .25s ease;
			text-decoration: none;
			display: block;
		}

		.visa-card:hover {
			transform: translateY(-5px);
			box-shadow: 0 18px 48px rgba(26, 37, 96, .14);
			border-color: #1a35d4;
		}

		/* ── Advantage card ──────────────────────────────── */
		.adv-card {
			background: #fff;
			border-radius: 1.1rem;
			border: 1.5px solid #eef1ff;
			box-shadow: 0 2px 16px rgba(26, 37, 96, .06);
			padding: 1.6rem;
			transition: all .22s ease;
			text-align: center;
		}

		.adv-card:hover {
			border-color: #1a35d4;
			transform: translateY(-3px);
			box-shadow: 0 12px 32px rgba(26, 37, 96, .12);
		}

		/* ── Process step ────────────────────────────────── */
		.step-card {
			background: #fff;
			border-radius: 1.25rem;
			border: 1.5px solid #eef1ff;
			box-shadow: 0 2px 18px rgba(26, 37, 96, .05);
			transition: all .25s ease;
			text-align: center;
			padding: 1.75rem 1.25rem;
			position: relative;
		}

		.step-card:hover {
			border-color: #1a35d4;
			transform: translateY(-4px);
			box-shadow: 0 14px 36px rgba(26, 37, 96, .12);
		}

		.step-connector {
			position: absolute;
			top: 1.75rem;
			left: calc(50% + 2rem);
			right: calc(-50% + 2rem);
			height: 2px;
			background: linear-gradient(90deg, #1a35d4, #00aaff);
			opacity: .2;
		}

		/* ── Testimonial ─────────────────────────────────── */
		.testi-mini {
			background: rgba(255, 255, 255, .04);
			border: 1px solid rgba(255, 255, 255, .08);
			border-radius: 1.1rem;
			transition: all .22s ease;
		}

		.testi-mini:hover {
			background: rgba(255, 255, 255, .08);
			border-color: rgba(0, 170, 255, .25);
			transform: translateY(-3px);
		}

		/* ── Grad text ───────────────────────────────────── */
		.grad-text {
			background: linear-gradient(90deg, #1a35d4, #00aaff);
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
			background-clip: text;
		}

		@keyframes pdot {
			0%, 100% {
				opacity: 1;
				transform: scale(1);
			}
			50% {
				opacity: .45;
				transform: scale(.82);
			}
		}
	`],
	template: `
		<!-- ===== HERO ===== -->
		<section class="hero-bg py-16 sm:py-20 relative overflow-hidden" aria-label="Visa services hero">
			<div class="container-custom relative z-10">

				<!-- Breadcrumb -->
				<nav aria-label="Breadcrumb" class="mb-6">
					<ol class="flex items-center gap-2 text-sm">
						<li><a routerLink="/" class="text-blue-300 hover:text-white transition-colors">Home</a></li>
						<li class="text-blue-400" aria-hidden="true">/</li>
						<li><span class="text-white font-medium" aria-current="page">Visa Services</span></li>
					</ol>
				</nav>

				<div class="grid lg:grid-cols-2 gap-10 items-center">
					<div>
						<div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm
                        border border-white/20 rounded-full px-4 py-2 text-blue-200 text-xs font-medium mb-6">
              		<span class="w-2 h-2 rounded-full bg-[#00aaff] flex-shrink-0"
					style="animation:pdot 2s ease-in-out infinite" aria-hidden="true"></span>
							MARA Registered Migration Agents
						</div>
						<h1 class="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-5">
							Visa Services for<br>
							<span class="grad-text">5 Destinations</span>
						</h1>
						<p class="text-blue-100/90 text-base sm:text-xl max-w-xl leading-relaxed mb-8">
							Expert migration agent support for student, graduate, and tourist visas across
							Australia, UK, Canada, USA, and New Zealand. 98% approval rate.
						</p>
						<div class="flex flex-wrap gap-3">
							<a routerLink="/contact"
							   class="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white text-sm transition-all"
							   style="background:linear-gradient(135deg,#f97316,#ea580c);box-shadow:0 4px 16px rgba(249,115,22,.38)"
							   onmouseover="this.style.transform='translateY(-1px)'"
							   onmouseout="this.style.transform=''">
								Book Free Consultation
								<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"
									 aria-hidden="true">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
										  d="M17 8l4 4m0 0l-4 4m4-4H3"/>
								</svg>
							</a>
							<a routerLink="/services" class="btn-outline-white text-sm py-3.5 px-6 justify-center">
								All Services
							</a>
						</div>
					</div>

					<!-- Hero stats -->
					<div class="hidden lg:grid grid-cols-2 gap-4">
						@for (hs of heroStats; track hs.label) {
							<div class="bg-white/8 backdrop-blur border border-white/12 rounded-2xl p-5 text-center">
								<div class="font-display text-white text-3xl font-bold mb-1">{{ hs.value }}</div>
								<div class="text-white text-sm">{{ hs.label }}</div>
							</div>
						}
					</div>
				</div>
			</div>
		</section>

		<!-- ===== VISA SUB-NAV ===== -->
		<nav class="gn-subnav" aria-label="Visa type sections">
			<div class="container-custom flex items-center gap-6 overflow-x-auto scrollbar-hide">
				<a routerLink="/visa/student-visa" routerLinkActive="active" class="gn-subnav-link">🎒 Student Visa</a>
				<a routerLink="/visa/graduate-visa" routerLinkActive="active" class="gn-subnav-link">🏛️ Graduate
					Visa</a>
				<a routerLink="/visa/tourist-visa" routerLinkActive="active" class="gn-subnav-link">✈️ Tourist Visa</a>
				<a routerLink="/visa/student-visa" routerLinkActive="active" class="gn-subnav-link">🌿 PR Pathways</a>
			</div>
		</nav>

		<!-- ===== CHILD ROUTE ===== -->
		<router-outlet/>

		<!-- ===== ALL VISA TYPES — with country filter ===== -->
		<section class="py-16 sm:py-20 bg-[#f8f9ff]" aria-labelledby="all-visas-heading">
			<div class="container-custom">

				<div class="text-center mb-10 reveal" #revealRef>
					<span class="section-tag">Visa Pathways</span>
					<h2 id="all-visas-heading" class="section-title mb-4">All Visa Types We Handle</h2>
					<p class="section-subtitle max-w-2xl mx-auto">
						Registered migration agents providing expert, personalised guidance for every visa type across 5
						countries.
					</p>
				</div>

				<!-- Country filter -->
				<div class="flex items-center flex-wrap gap-2 justify-center mb-10 reveal" #revealRef>
					<span
						class="text-xs font-bold uppercase tracking-wider text-gray-400 mr-1">Filter by country:</span>
					@for (c of countryFilters; track c.code) {
						<button class="c-pill" [class.active]="activeFilter() === c.code"
								(click)="setFilter(c.code)">
							<span aria-hidden="true">{{ c.flag }}</span>{{ c.name }}
						</button>
					}
				</div>

				<!-- Visa grid -->
				<div class="stagger grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6" #revealRef>
					@for (v of filteredVisas(); track v.title) {
						<a [routerLink]="v.route" class="visa-card p-6 sm:p-8">

							<!-- Header -->
							<div class="flex items-start gap-4 mb-5">
								<div
									class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 bg-[#eef4ff]">
									{{ v.icon }}
								</div>
								<div class="min-w-0">
									<div class="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full mb-1"
										 style="background:linear-gradient(135deg,#eef4ff,#dce8ff);color:#1a35d4">
										{{ v.subclass }}
									</div>
									<h3 class="font-display text-lg font-bold text-[#1a2560] leading-snug">{{ v.title }}</h3>
									<div class="flex items-center gap-1 mt-1">
										<span class="text-base" aria-hidden="true">{{ v.flag }}</span>
										<span class="text-xs text-gray-400">{{ v.country }}</span>
									</div>
								</div>
							</div>

							<p class="text-gray-500 text-sm leading-relaxed mb-5">{{ v.desc }}</p>

							<!-- Stats mini grid -->
							<div class="grid grid-cols-2 gap-2.5 mb-5">
								@for (s of v.stats; track s.label) {
									<div class="bg-[#f8f9ff] rounded-xl p-3 border border-[#eef1ff]">
										<div class="font-bold text-[#1a35d4] text-sm">{{ s.value }}</div>
										<div class="text-gray-400 text-xs mt-0.5">{{ s.label }}</div>
									</div>
								}
							</div>

							<span class="inline-flex items-center gap-1.5 text-[#1a35d4] font-bold text-sm">
                Learn More
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </span>
						</a>
					}
				</div>
			</div>
		</section>

		<!-- ===== WHY GLOBAL NEXT ===== -->
		<section class="py-16 sm:py-20 bg-white" aria-labelledby="why-heading">
			<div class="container-custom">
				<div class="text-center mb-10 sm:mb-14 reveal" #revealRef>
					<span class="section-tag">The Global Next Advantage</span>
					<h2 id="why-heading" class="section-title mb-4">Why Choose Global Next for Your Visa?</h2>
					<p class="section-subtitle max-w-2xl mx-auto">
						Our MARA-registered agents bring deep expertise across all 5 destination countries.
					</p>
				</div>
				<div class="stagger grid sm:grid-cols-2 lg:grid-cols-4 gap-5" #revealRef>
					@for (a of advantages; track a.title) {
						<div class="adv-card">
							<div
								class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 bg-[#eef4ff]">
								{{ a.icon }}
							</div>
							<h3 class="font-display font-bold text-[#1a2560] text-base mb-2">{{ a.title }}</h3>
							<p class="text-gray-500 text-sm leading-relaxed">{{ a.desc }}</p>
						</div>
					}
				</div>
			</div>
		</section>

		<!-- ===== HOW IT WORKS ===== -->
		<section class="py-16 sm:py-20 bg-[#f8f9ff]" aria-labelledby="process-heading">
			<div class="container-custom">
				<div class="text-center mb-10 sm:mb-14 reveal" #revealRef>
					<span class="section-tag">Our Process</span>
					<h2 id="process-heading" class="section-title mb-4">How Your Visa Application Works</h2>
					<p class="section-subtitle max-w-xl mx-auto">
						A clear, transparent process designed to maximise your approval chances.
					</p>
				</div>
				<div class="stagger grid sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5" #revealRef>
					@for (s of processSteps; track s.n; let last = $last) {
						<div class="step-card">
							@if (!last) {
								<div class="step-connector hidden lg:block"></div>
							}
							<div
								class="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center text-xl font-display font-bold text-white"
								style="background:linear-gradient(135deg,#1a2560,#1a35d4);box-shadow:0 4px 12px rgba(26,53,212,.3)">
								{{ s.n }}
							</div>
							<div class="text-2xl mb-2" aria-hidden="true">{{ s.icon }}</div>
							<h3 class="font-display font-bold text-[#1a2560] text-sm sm:text-base mb-1.5">{{ s.title }}</h3>
							<p class="text-gray-500 text-xs sm:text-sm leading-relaxed">{{ s.desc }}</p>
						</div>
					}
				</div>
			</div>
		</section>

		<!-- ===== DESTINATION COUNTRIES ===== -->
		<section class="py-16 sm:py-20 bg-white" aria-labelledby="countries-heading">
			<div class="container-custom">
				<div class="text-center mb-10 sm:mb-12 reveal" #revealRef>
					<span class="section-tag">Destination Countries</span>
					<h2 id="countries-heading" class="section-title mb-4">We Handle Visas for All Major Study
						Destinations</h2>
				</div>
				<div class="stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" #revealRef>
					@for (d of destinations; track d.code) {
						<div class="rounded-2xl border border-[#eef1ff] bg-[#f8f9ff] p-5 hover:border-[#1a35d4]
                        hover:shadow-lg transition-all duration-200 group cursor-pointer">
							<div class="text-5xl mb-3 leading-none group-hover:scale-110 transition-transform"
								 aria-hidden="true">{{ d.flag }}
							</div>
							<h3 class="font-bold text-[#1a2560] text-sm mb-1">{{ d.name }}</h3>
							<div class="space-y-1">
								@for (v of d.visas; track v) {
									<div class="text-xs text-gray-500 flex items-center gap-1.5">
										<span class="w-1 h-1 rounded-full bg-[#1a35d4] flex-shrink-0"
											  aria-hidden="true"></span>
										{{ v }}
									</div>
								}
							</div>
						</div>
					}
				</div>
			</div>
		</section>

		<!-- ===== TESTIMONIALS ===== -->
		<section class="py-16 sm:py-20 bg-[#090e2b]" aria-labelledby="testi-heading">
			<div class="container-custom">
				<div class="text-center mb-10 sm:mb-12 reveal" #revealRef>
					<span
						class="text-[#00aaff] text-xs font-bold uppercase tracking-widest mb-3 block">Client Stories</span>
					<h2 id="testi-heading"
						class="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">
						Visa Approvals Across the Globe
					</h2>
					<p class="text-gray-400 max-w-xl mx-auto text-sm">Real results from students we've helped.</p>
				</div>
				<div class="stagger grid sm:grid-cols-2 lg:grid-cols-3 gap-5" #revealRef>
					@for (t of testimonials; track t.name) {
						<div class="testi-mini p-6">
							<div class="flex gap-1 mb-3">
								@for (s of [1, 2, 3, 4, 5]; track s) {
									<svg class="w-4 h-4" style="color:#00aaff" fill="currentColor" viewBox="0 0 20 20"
										 aria-hidden="true">
										<path
											d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
									</svg>
								}
							</div>
							<div
								class="inline-flex items-center gap-1.5 bg-white/8 rounded-full px-2.5 py-1 text-xs text-gray-300 mb-3">
								<span aria-hidden="true">{{ t.flag }}</span>{{ t.visa }}
							</div>
							<blockquote class="text-gray-300 text-sm leading-relaxed mb-4 italic">"{{ t.quote }}"
							</blockquote>
							<div class="flex items-center gap-3">
								<div
									class="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
									[style.background]="t.color">{{ t.initials }}
								</div>
								<div>
									<div class="font-semibold text-white text-sm">{{ t.name }}</div>
									<div class="text-gray-500 text-xs">{{ t.detail }}</div>
								</div>
							</div>
						</div>
					}
				</div>
			</div>
		</section>

		<!-- ===== CTA ===== -->
		<section class="py-16 sm:py-20 bg-cta-gradient" aria-label="Call to action">
			<div class="container-custom text-center reveal" #revealRef>
				<h2 class="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-5">
					Ready to Start Your Visa Application?
				</h2>
				<p class="text-white/80 text-base sm:text-lg max-w-xl mx-auto mb-8">
					Book a free consultation with our registered migration agents and get a clear roadmap for your visa
					journey.
				</p>
				<div class="flex flex-col sm:flex-row gap-4 justify-center">
					<a routerLink="/contact"
					   class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white font-bold rounded-xl text-sm sm:text-base transition-all hover:-translate-y-px"
					   style="color:#1a35d4;box-shadow:0 4px 20px rgba(255,255,255,.2)">
						Book Free Consultation
						<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
								  d="M17 8l4 4m0 0l-4 4m4-4H3"/>
						</svg>
					</a>
					<a routerLink="/services" class="btn-outline-white text-sm sm:text-base py-4 px-8 justify-center">
						All Services
					</a>
				</div>
			</div>
		</section>
	`,
})
export class VisaComponent implements AfterViewInit, OnDestroy {

	activeFilter = signal('ALL');

	setFilter(code: string): void {
		this.activeFilter.set(code);
	}

	readonly countryFilters = [
		{code: 'ALL', name: 'All Countries', flag: '🌏'},
		{code: 'AU', name: 'Australia', flag: '🇦🇺'},
		{code: 'UK', name: 'UK', flag: '🇬🇧'},
		{code: 'CA', name: 'Canada', flag: '🇨🇦'},
		{code: 'US', name: 'USA', flag: '🇺🇸'},
		{code: 'NZ', name: 'New Zealand', flag: '🇳🇿'},
	];

	readonly allVisas = [
		{
			countryCode: 'AU', country: 'Australia', flag: '🇦🇺',
			icon: '🎒', subclass: 'Subclass 500', title: 'Student Visa',
			route: '/visa/student-visa',
			desc: 'Study at a CRICOS-registered Australian institution. Required for courses longer than 3 months.',
			stats: [{value: '4–8 wks', label: 'Processing'}, {value: '98%', label: 'Approval rate'}],
		},
		{
			countryCode: 'AU', country: 'Australia', flag: '🇦🇺',
			icon: '🏛️', subclass: 'Subclass 485', title: 'Temporary Graduate Visa',
			route: '/visa/graduate-visa',
			desc: 'Live, study, and work in Australia after completing your qualification at an Australian institution.',
			stats: [{value: '2–4 yrs', label: 'Duration'}, {value: 'Full', label: 'Work rights'}],
		},
		{
			countryCode: 'AU', country: 'Australia', flag: '🇦🇺',
			icon: '✈️', subclass: 'Subclass 600', title: 'Tourist Visa',
			route: '/visa/tourist-visa',
			desc: 'Visit Australia for tourism, recreation, or to visit family and friends for up to 12 months.',
			stats: [{value: '3–12 mo', label: 'Stay duration'}, {value: '2–4 wks', label: 'Processing'}],
		},
		{
			countryCode: 'UK', country: 'United Kingdom', flag: '🇬🇧',
			icon: '🎓', subclass: 'Student Visa', title: 'UK Student Visa',
			route: '/visa/uk-student-visa',
			desc: 'Study at a UKVI-licensed higher education institution in the United Kingdom.',
			stats: [{value: '3 wks', label: 'Processing'}, {value: '2–5 yrs', label: 'Duration'}],
		},
		{
			countryCode: 'UK', country: 'United Kingdom', flag: '🇬🇧',
			icon: '🏅', subclass: 'Graduate Route', title: 'UK Graduate Route Visa',
			route: '/visa/uk-graduate-visa',
			desc: 'Work or look for work in the UK for 2–3 years after successfully completing your degree.',
			stats: [{value: '2–3 yrs', label: 'Duration'}, {value: 'Full', label: 'Work rights'}],
		},
		{
			countryCode: 'CA', country: 'Canada', flag: '🇨🇦',
			icon: '🎒', subclass: 'Study Permit', title: 'Canada Study Permit',
			route: '/visa/canada-study-permit',
			desc: 'Study at a Designated Learning Institution (DLI) in Canada for programs longer than 6 months.',
			stats: [{value: '8–12 wks', label: 'Processing'}, {value: 'Part-time', label: 'Work rights'}],
		},
		{
			countryCode: 'CA', country: 'Canada', flag: '🇨🇦',
			icon: '💼', subclass: 'PGWP', title: 'Post-Graduation Work Permit',
			route: '/visa/canada-pgwp',
			desc: 'Work anywhere in Canada for up to 3 years after completing your program at a DLI.',
			stats: [{value: 'Up to 3 yrs', label: 'Duration'}, {value: 'Open', label: 'Work permit'}],
		},
		{
			countryCode: 'US', country: 'United States', flag: '🇺🇸',
			icon: '🎓', subclass: 'F-1 Visa', title: 'US F-1 Student Visa',
			route: '/visa/us-f1-visa',
			desc: 'Full-time academic study at a SEVP-approved institution in the United States.',
			stats: [{value: '3–5 wks', label: 'Processing'}, {value: 'On campus', label: 'Work rights'}],
		},
		{
			countryCode: 'US', country: 'United States', flag: '🇺🇸',
			icon: '💡', subclass: 'OPT / STEM OPT', title: 'US OPT / STEM OPT',
			route: '/visa/us-opt',
			desc: 'Work authorisation for F-1 students — 1 year OPT plus up to 2-year STEM OPT extension.',
			stats: [{value: 'Up to 3 yrs', label: 'STEM OPT'}, {value: 'Full', label: 'Work rights'}],
		},
		{
			countryCode: 'NZ', country: 'New Zealand', flag: '🇳🇿',
			icon: '🎒', subclass: 'Student Visa', title: 'NZ Student Visa',
			route: '/visa/nz-student-visa',
			desc: 'Study at a New Zealand Education Provider (NZEP) for programs longer than 3 months.',
			stats: [{value: '3–6 wks', label: 'Processing'}, {value: '20 hrs/wk', label: 'Work rights'}],
		},
		{
			countryCode: 'NZ', country: 'New Zealand', flag: '🇳🇿',
			icon: '🌿', subclass: 'Post-Study Work', title: 'NZ Post-Study Work Visa',
			route: '/visa/nz-post-study',
			desc: 'Work in New Zealand for up to 3 years after completing your qualification.',
			stats: [{value: 'Up to 3 yrs', label: 'Duration'}, {value: 'Open', label: 'Work permit'}],
		},
		{
			countryCode: 'AU', country: 'Australia', flag: '🇦🇺',
			icon: '🌍', subclass: 'Subclass 189/190', title: 'Permanent Residency (AU)',
			route: '/visa/permanent-residency',
			desc: 'Skilled independent and state-sponsored PR visas for eligible graduates and workers.',
			stats: [{value: '6–12 mo', label: 'Processing'}, {value: 'Permanent', label: 'Stay rights'}],
		},
	];

	filteredVisas = () => {
		const f = this.activeFilter();
		return f === 'ALL' ? this.allVisas : this.allVisas.filter(v => v.countryCode === f);
	};

	readonly heroStats = [
		{value: '98%', label: 'Visa Approval Rate'},
		{value: '5,000+', label: 'Students Assisted'},
		{value: '12', label: 'Visa Types Handled'},
		{value: '5', label: 'Destination Countries'},
	];

	readonly advantages = [
		{
			icon: '📋',
			title: 'MARA Registered',
			desc: 'All our agents are MARA registered with spotless compliance records across all destination countries.'
		},
		{
			icon: '⚡',
			title: 'Fast Turnaround',
			desc: 'We prepare complete, accurate submissions to minimise processing delays and unnecessary delays.'
		},
		{
			icon: '🎯',
			title: '98% Success Rate',
			desc: 'Our meticulous review process ensures applications are right the first time — every time.'
		},
		{
			icon: '🔄',
			title: 'End-to-End Support',
			desc: 'From assessment through to final decision, our team is with you at every single step.'
		},
	];

	readonly processSteps = [
		{
			n: '01',
			icon: '💬',
			title: 'Free Assessment',
			desc: 'We review your profile and identify the best visa pathway for your goals.'
		},
		{
			n: '02',
			icon: '📋',
			title: 'Document Checklist',
			desc: 'We provide a tailored document checklist and review everything you gather.'
		},
		{
			n: '03',
			icon: '📝',
			title: 'Application Prep',
			desc: 'Our agents prepare your complete application package with all required forms.'
		},
		{
			n: '04',
			icon: '📤',
			title: 'Lodgement',
			desc: 'We lodge your application and monitor it with the relevant immigration authority.'
		},
		{
			n: '05',
			icon: '✅',
			title: 'Approval & Beyond',
			desc: 'We notify you of your outcome and guide your next steps post-approval.'
		},
	];

	readonly destinations = [
		{
			code: 'AU',
			name: 'Australia',
			flag: '🇦🇺',
			visas: ['Student (500)', 'Graduate (485)', 'Tourist (600)', 'PR 189/190']
		},
		{code: 'UK', name: 'United Kingdom', flag: '🇬🇧', visas: ['Student Visa', 'Graduate Route', 'Standard Visitor']},
		{code: 'CA', name: 'Canada', flag: '🇨🇦', visas: ['Study Permit', 'PGWP', 'Express Entry PR']},
		{code: 'US', name: 'United States', flag: '🇺🇸', visas: ['F-1 Student', 'OPT / STEM OPT', 'B-2 Tourist']},
		{code: 'NZ', name: 'New Zealand', flag: '🇳🇿', visas: ['Student Visa', 'Post-Study Work', 'Skilled Migrant']},
	];

	readonly testimonials = [
		{
			flag: '🇦🇺', visa: 'Student Visa 500', color: '#1a35d4', initials: 'PS',
			name: 'Priya Sharma', detail: 'Uni. of Melbourne',
			quote: 'Global Next handled my 500 visa from start to finish. Incredibly smooth — I had my approval in just 5 weeks.'
		},
		{
			flag: '🇬🇧', visa: 'UK Student Visa', color: '#c0392b', initials: 'AO',
			name: 'Amara Osei', detail: 'Uni. of Manchester',
			quote: 'The UK visa process is complex but Global Next made every step clear. Highly professional team.'
		},
		{
			flag: '🇨🇦', visa: 'Study Permit', color: '#c0392b', initials: 'LF',
			name: 'Lucas Ferreira', detail: 'Uni. of Toronto',
			quote: 'Got my study permit and PGWP guidance all in one place. The team knows Canadian immigration inside out.'
		},
		{
			flag: '🇺🇸', visa: 'F-1 Visa', color: '#1a2560', initials: 'FA',
			name: 'Fatima Al-Zahra', detail: 'MIT, Boston',
			quote: 'My F-1 visa felt daunting until Global Next walked me through the DS-160 and SEVIS prep. Approved first attempt.'
		},
		{
			flag: '🇦🇺', visa: 'Graduate Visa 485', color: '#00aaff', initials: 'WC',
			name: 'Wei Chen', detail: 'Monash University',
			quote: 'The 485 application was seamless. Global Next identified the right stream and we lodged within the deadline.'
		},
		{
			flag: '🇳🇿', visa: 'NZ Student Visa', color: '#059669', initials: 'NR',
			name: 'Nizhoni Running-water', detail: 'Uni. of Auckland',
			quote: 'Professional, thorough, and genuinely caring. My NZ student visa was granted with no additional requests.'
		},
	];

	private _observer!: IntersectionObserver;

	constructor(private el: ElementRef) {
	}

	ngAfterViewInit(): void {
		const els = this.el.nativeElement.querySelectorAll('.reveal,.reveal-l,.reveal-r,.stagger');
		this._observer = new IntersectionObserver(entries => {
			entries.forEach(e => {
				if (e.isIntersecting) {
					e.target.classList.add('in');
					this._observer.unobserve(e.target);
				}
			});
		}, {threshold: 0.12});
		els.forEach((el: Element) => this._observer.observe(el));
	}

	ngOnDestroy(): void {
		if (this._observer) this._observer.disconnect();
	}
}
