import {
	Component, signal, ElementRef, AfterViewInit, OnDestroy
} from '@angular/core';
import {RouterModule} from '@angular/router';

const BASE_STYLES = `
  :host { display: block; }
  .reveal   { opacity:0; transform:translateY(26px); transition:opacity .6s ease,transform .6s ease; }
  .reveal.in { opacity:1; transform:none; }
  .reveal-r { opacity:0; transform:translateX(26px); transition:opacity .6s ease,transform .6s ease; }
  .reveal-r.in { opacity:1; transform:none; }
  .stagger > * { opacity:0; transform:translateY(20px); transition:opacity .5s ease,transform .5s ease; }
  .stagger.in > *:nth-child(1){transition-delay:.00s;opacity:1;transform:none;}
  .stagger.in > *:nth-child(2){transition-delay:.08s;opacity:1;transform:none;}
  .stagger.in > *:nth-child(3){transition-delay:.16s;opacity:1;transform:none;}
  .stagger.in > *:nth-child(4){transition-delay:.24s;opacity:1;transform:none;}
  .stagger.in > *:nth-child(5){transition-delay:.32s;opacity:1;transform:none;}
  .stagger.in > *:nth-child(6){transition-delay:.40s;opacity:1;transform:none;}
  .c-tab {
    display:inline-flex; align-items:center; gap:.4rem;
    padding:.4rem .9rem; border-radius:999px;
    border:1.5px solid #dde3ff; background:#fff;
    color:#4b5563; font-size:.8rem; font-weight:500;
    cursor:pointer; transition:all .2s; white-space:nowrap;
  }
  .c-tab:hover { border-color:#1a35d4; color:#1a35d4; background:#eef4ff; }
  .c-tab.active {
    background:linear-gradient(135deg,#1a35d4,#00aaff);
    border-color:transparent; color:#fff; font-weight:600;
    box-shadow:0 4px 14px rgba(26,53,212,.28);
  }
  .info-card {
    background:#fff; border-radius:1rem; border:1.5px solid #eef1ff;
    box-shadow:0 2px 16px rgba(26,37,96,.06); padding:1.25rem;
    transition:all .2s ease;
  }
  .info-card:hover { border-color:#1a35d4; box-shadow:0 8px 24px rgba(26,37,96,.1); }
  .sidebar-card {
    background:#fff; border-radius:1.25rem; border:1.5px solid #eef1ff;
    box-shadow:0 4px 24px rgba(26,37,96,.08); padding:1.75rem;
  }
  .panel-enter { animation: panelIn .3s ease both; }
  @keyframes panelIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
`;

@Component({
	selector: 'app-tourist-visa',
	standalone: true,
	imports: [RouterModule],
	styles: [BASE_STYLES],
	template: `
		<!-- Hero -->
		<section class="hero-bg py-20 relative overflow-hidden">
			<div class="container-custom relative z-10">
				<nav class="breadcrumb mb-6" aria-label="Breadcrumb">
					<ol class="flex items-center gap-2">
						<li><a routerLink="/">Home</a></li>
						<li class="text-blue-400">/</li>
						<li><a routerLink="/visa">Visa Services</a></li>
						<li class="text-blue-400">/</li>
						<li><span aria-current="page">Tourist / Visitor Visa</span></li>
					</ol>
				</nav>
				<div class="flex items-center gap-4 mb-4">
					<span class="text-5xl">✈️</span>
					<div>
						<p class="text-blue-200 text-sm font-semibold uppercase tracking-widest mb-1">Visa Type</p>
						<h1 class="font-display text-4xl md:text-5xl font-bold text-white">Tourist / Visitor Visa</h1>
					</div>
				</div>
				<p class="text-blue-100 text-xl max-w-2xl">
					Visit family, explore, or attend events — visitor visa guidance for every destination.
				</p>
				<div class="flex flex-wrap gap-3 mt-8">
					@for (c of countries; track c.code) {
						<button (click)="setCountry(c.code)"
								[class.ring-2]="active().code === c.code" [class.ring-white]="active().code === c.code"
								class="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20
                     text-white text-sm font-semibold backdrop-blur-sm transition-all border border-white/20">
							<span>{{ c.flag }}</span><span>{{ c.name }}</span>
						</button>
					}
				</div>
			</div>
		</section>

		<!-- Sticky tab bar -->
		<div class="bg-white border-b border-[#dde3ff] sticky top-20 z-30"
			 style="box-shadow:0 4px 24px rgba(26,37,96,.07)">
			<div class="container-custom">
				<div class="flex items-center gap-2 overflow-x-auto scrollbar-hide py-3">
					<span
						class="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1 flex-shrink-0">Country:</span>
					@for (c of countries; track c.code) {
						<button class="c-tab" [class.active]="active().code === c.code" (click)="setCountry(c.code)">
							<span>{{ c.flag }}</span>{{ c.name }}
						</button>
					}
				</div>
			</div>
		</div>

		<!-- Content -->
		<section class="py-14 sm:py-16 bg-white">
			<div class="container-custom">
				<div class="grid lg:grid-cols-3 gap-10 xl:gap-14">
					<div class="lg:col-span-2 panel-enter" [attr.data-country]="active().code">

						<!-- Header -->
						<div class="flex items-start gap-4 mb-8 reveal" #revRef>
							<div class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
								 [style.background]="active().iconBg">{{ active().flag }}
							</div>
							<div>
								<span
									class="text-xs font-bold text-[#1a35d4] uppercase tracking-widest">{{ active().visaName }}</span>
								<h2 class="font-display text-2xl sm:text-3xl font-bold text-[#1a2560] mt-1">{{ active().headline }}</h2>
							</div>
						</div>

						<!-- Alert -->
						<div class="rounded-2xl p-5 mb-8 border reveal" #revRef
							 [style.background]="active().alertBg" [style.borderColor]="active().alertBorder">
							<div class="flex items-start gap-3">
								<span class="text-2xl flex-shrink-0">{{ active().alertIcon }}</span>
								<div>
									<h3 class="font-bold mb-1"
										[style.color]="active().alertHeadingColor">{{ active().alertTitle }}</h3>
									<p class="text-sm leading-relaxed"
									   [style.color]="active().alertTextColor">{{ active().alertText }}</p>
								</div>
							</div>
						</div>

						<p class="text-gray-600 leading-relaxed mb-8 text-base sm:text-lg reveal"
						   #revRef>{{ active().intro }}</p>

						<!-- Streams -->
						<h3 class="font-display text-xl font-bold text-[#1a2560] mb-5 reveal" #revRef>Visit Streams</h3>
						<div class="stagger grid sm:grid-cols-3 gap-5 mb-10" #revRef>
							@for (s of active().streams; track s.name) {
								<div class="bg-white rounded-2xl border border-[#eef1ff] p-6 text-center
                            shadow-[0_2px_12px_rgba(26,37,96,.05)] hover:border-[#1a35d4] transition-all">
									<span class="text-4xl mb-4 block">{{ s.icon }}</span>
									<h4 class="font-bold text-[#1a2560] text-sm mb-2">{{ s.name }}</h4>
									<p class="text-gray-500 text-xs leading-relaxed">{{ s.desc }}</p>
								</div>
							}
						</div>

						<!-- Requirements & details side by side -->
						<div class="grid md:grid-cols-2 gap-8 reveal" #revRef>
							<div>
								<h3 class="font-display text-lg font-bold text-[#1a2560] mb-5">Typical Requirements</h3>
								<ul class="space-y-3">
									@for (r of active().requirements; track r) {
										<li class="flex items-start gap-3 text-sm text-gray-600">
											<svg class="w-5 h-5 flex-shrink-0 mt-0.5" style="color:#1a35d4" fill="none"
												 viewBox="0 0 24 24" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
													  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
											</svg>
											{{ r }}
										</li>
									}
								</ul>
							</div>
							<div>
								<h3 class="font-display text-lg font-bold text-[#1a2560] mb-5">Key Details</h3>
								<div class="space-y-0">
									@for (d of active().details; track d.label) {
										<div class="flex justify-between py-3 border-b border-[#eef1ff] text-sm">
											<span class="text-gray-500">{{ d.label }}</span>
											<span class="font-semibold text-[#1a2560]">{{ d.value }}</span>
										</div>
									}
								</div>
							</div>
						</div>
					</div>

					<!-- Sidebar -->
					<div class="space-y-5">
						<div class="sidebar-card top-28 reveal-r" #revRef>
							<div class="text-center mb-5">
								<div class="text-4xl mb-2">{{ active().flag }}</div>
								<h3 class="font-display text-lg font-bold text-[#1a2560] mb-1">{{ active().name }}
									Visitor Visa</h3>
								<p class="text-gray-500 text-sm">Expert help with your visitor visa application.</p>
							</div>
							<a routerLink="/contact"
							   class="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-white
                        text-sm mb-4 transition-all hover:-translate-y-0.5"
							   style="background:linear-gradient(135deg,#1a35d4,#00aaff);box-shadow:0 4px 16px rgba(26,53,212,.3)">
								Apply Now — Free Consultation
								<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
										  d="M17 8l4 4m0 0l-4 4m4-4H3"/>
								</svg>
							</a>
							<ul class="space-y-2.5">
								@for (b of ctaBullets; track b) {
									<li class="flex items-center gap-2 text-sm text-gray-600">
										<svg class="w-4 h-4 flex-shrink-0" style="color:#00aaff" fill="none"
											 viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
												  d="M5 13l4 4L19 7"/>
										</svg>
										{{ b }}
									</li>
								}
							</ul>
						</div>

						<div class="sidebar-card reveal-r" #revRef>
							<h4 class="font-bold text-[#1a2560] text-sm uppercase tracking-wide mb-4 flex items-center gap-2">
								<span style="color:#00aaff">ℹ️</span> Quick Facts — {{ active().name }}
							</h4>
							<div class="space-y-3">
								@for (f of active().quickFacts; track f.label) {
									<div class="flex justify-between items-start gap-2">
										<span class="text-xs text-gray-500 leading-snug">{{ f.label }}</span>
										<span
											class="text-xs font-bold text-[#1a35d4] text-right leading-snug">{{ f.value }}</span>
									</div>
									<div class="h-px bg-[#eef1ff]"></div>
								}
							</div>
						</div>

						<div class="sidebar-card reveal-r" #revRef>
							<h4 class="font-bold text-[#1a2560] text-sm uppercase tracking-wide mb-3">Other
								Destinations</h4>
							<div class="space-y-1.5">
								@for (c of otherCountries(); track c.code) {
									<button (click)="setCountry(c.code)"
											class="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium
                           text-gray-600 hover:bg-[#eef4ff] hover:text-[#1a35d4] transition-colors text-left">
										<span class="text-xl">{{ c.flag }}</span><span>{{ c.name }}</span>
										<svg class="w-4 h-4 ml-auto text-gray-300" fill="none" viewBox="0 0 24 24"
											 stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
												  d="M9 5l7 7-7 7"/>
										</svg>
									</button>
								}
							</div>
						</div>
						<a routerLink="/visa"
						   class="block text-center text-sm text-[#1a35d4] hover:underline font-semibold">← All Visa
							Types</a>
					</div>
				</div>
			</div>
		</section>
	`,
})
export class TouristVisaComponent implements AfterViewInit, OnDestroy {

	readonly countries = [
		{code: 'AU', name: 'Australia', flag: '🇦🇺'},
		{code: 'UK', name: 'UK', flag: '🇬🇧'},
		{code: 'CA', name: 'Canada', flag: '🇨🇦'},
		{code: 'US', name: 'USA', flag: '🇺🇸'},
		{code: 'NZ', name: 'New Zealand', flag: '🇳🇿'},
	];

	readonly activeCode = signal<string>('AU');

	setCountry(code: string) {
		this.activeCode.set(code);
	}

	active = () => this.data[this.activeCode()];
	otherCountries = () => this.countries.filter(c => c.code !== this.activeCode());

	readonly data: Record<string, any> = {
		AU: {
			code: 'AU',
			name: 'Australia',
			flag: '🇦🇺',
			iconBg: '#dce8ff',
			visaName: 'Subclass 600',
			headline: 'Visitor Visa — Australia',
			alertBg: '#eff6ff',
			alertBorder: '#bfdbfe',
			alertIcon: '👨‍👩‍👧',
			alertHeadingColor: '#1e3a8a',
			alertTextColor: '#1e40af',
			alertTitle: 'Ideal for Student Family Members',
			alertText: 'Parents and family members of international students in Australia commonly use the Subclass 600. We specialise in applications for student family visits.',
			intro: "The Visitor Visa (Subclass 600) allows visits to Australia for tourism, recreation, visiting family, or certain business activities. It's available as single or multiple-entry.",
			streams: [
				{icon: '🌏', name: 'Tourist Stream', desc: 'Tourism, recreation, or visiting family members.'},
				{icon: '💼', name: 'Business Visitor Stream', desc: 'Attend meetings or conferences — not working.'},
				{
					icon: '🤝',
					name: 'Sponsored Family Stream',
					desc: 'Family sponsored by an Australian resident/citizen.'
				},
			],
			requirements: [
				'Valid passport (6+ months validity)',
				'Completed online application (IMMI)',
				'Bank statements showing financial capacity',
				'Ties to home country — employment, property',
				'Return flight or evidence of intent to depart',
				'Invitation letter if visiting a family member',
			],
			details: [
				{label: 'Max stay', value: '3, 6, or 12 months'},
				{label: 'Processing', value: '14–28 days'},
				{label: 'Multiple entries', value: 'Yes (usually)'},
				{label: 'Work rights', value: 'None'},
				{label: 'Study allowed', value: 'Up to 3 months'},
				{label: 'Visa fee', value: 'From A$145'},
			],
			quickFacts: [
				{label: 'Visa subclass', value: 'Subclass 600'},
				{label: 'Max stay', value: 'Up to 12 months'},
				{label: 'Processing', value: '14–28 days'},
				{label: 'Work rights', value: 'None'},
				{label: 'Visa fee', value: 'From A$145'},
			],
		},
		UK: {
			code: 'UK',
			name: 'UK',
			flag: '🇬🇧',
			iconBg: '#fef2f2',
			visaName: 'Standard Visitor Visa',
			headline: 'Standard Visitor Visa — UK',
			alertBg: '#eff6ff',
			alertBorder: '#bfdbfe',
			alertIcon: '🇬🇧',
			alertHeadingColor: '#1e3a8a',
			alertTextColor: '#1e40af',
			alertTitle: 'ETA Now Required for Many Nationalities',
			alertText: 'From 2024, nationals of many countries need an Electronic Travel Authorisation (ETA) before visiting the UK, even for short stays. We can advise which applies to you.',
			intro: 'The UK Standard Visitor Visa allows visits for tourism, visiting family, attending events, or short business activities. It is valid for up to 6 months per visit.',
			streams: [
				{icon: '🏰', name: 'Tourism', desc: 'Sightseeing, recreation, and leisure visits.'},
				{icon: '👨‍👩‍👧', name: 'Family Visit', desc: 'Visit family or friends settled in the UK.'},
				{icon: '💼', name: 'Business Visit', desc: 'Attend meetings, conferences, or training.'},
			],
			requirements: [
				'Valid passport with at least 6 months validity',
				'Online UK Visitor Visa application (VAF1A)',
				'Bank statements (last 3–6 months)',
				'Proof of accommodation in the UK',
				'Evidence of employment or financial ties at home',
				'Invitation letter if staying with family',
			],
			details: [
				{label: 'Max stay per visit', value: '6 months'},
				{label: 'Visa validity', value: 'Up to 10 years'},
				{label: 'Processing', value: '3 weeks typical'},
				{label: 'Work rights', value: 'None'},
				{label: 'Study allowed', value: 'Up to 6 months'},
				{label: 'Visa fee', value: '£115'},
			],
			quickFacts: [
				{label: 'Visa name', value: 'Standard Visitor Visa'},
				{label: 'Max stay', value: '6 months per visit'},
				{label: 'Visa validity', value: 'Up to 10 years'},
				{label: 'Visa fee', value: '£115'},
				{label: 'Work rights', value: 'None'},
			],
		},
		CA: {
			code: 'CA',
			name: 'Canada',
			flag: '🇨🇦',
			iconBg: '#fff1f2',
			visaName: 'Temporary Resident Visa (TRV)',
			headline: 'Visitor Visa (TRV) — Canada',
			alertBg: '#f0fdf4',
			alertBorder: '#bbf7d0',
			alertIcon: '🍁',
			alertHeadingColor: '#14532d',
			alertTextColor: '#15803d',
			alertTitle: 'eTA for Visa-Exempt Countries',
			alertText: 'Citizens of visa-exempt countries (e.g. UK, Australia) need an Electronic Travel Authorisation (eTA) instead of a TRV. We help both TRV and eTA applicants.',
			intro: "Canada's Temporary Resident Visa (TRV) allows visits for tourism, family visits, or attending events. Biometrics are required for most applicants, which must be completed at a Visa Application Centre.",
			streams: [
				{icon: '🍂', name: 'Tourism & Recreation', desc: 'Explore Canada\'s natural beauty and cities.'},
				{icon: '👨‍👩‍👧', name: 'Family Visit', desc: 'Visit family members residing in Canada.'},
				{icon: '🎓', name: 'Visiting Students', desc: 'Parents/relatives visiting international students.'},
			],
			requirements: [
				'Valid passport',
				'Completed IMM5257 application form',
				'Bank statements and proof of funds',
				'Ties to home country',
				'Purpose of visit explanation',
				'Biometrics at a Visa Application Centre',
			],
			details: [
				{label: 'Max stay', value: 'Up to 6 months'},
				{label: 'Visa validity', value: 'Up to 10 years'},
				{label: 'Processing', value: '2–8 weeks'},
				{label: 'Work rights', value: 'None'},
				{label: 'Study allowed', value: 'Up to 6 months'},
				{label: 'Visa fee', value: 'CAD $100'},
			],
			quickFacts: [
				{label: 'Visa name', value: 'Temporary Resident Visa'},
				{label: 'Max stay', value: 'Up to 6 months'},
				{label: 'Biometrics', value: 'Required at VAC'},
				{label: 'Visa fee', value: 'CAD $100'},
				{label: 'Work rights', value: 'None'},
			],
		},
		US: {
			code: 'US',
			name: 'USA',
			flag: '🇺🇸',
			iconBg: '#eff6ff',
			visaName: 'B-1 / B-2 Visitor Visa',
			headline: 'Visitor Visa (B-1/B-2) — USA',
			alertBg: '#faf5ff',
			alertBorder: '#e9d5ff',
			alertIcon: '🗽',
			alertHeadingColor: '#4c1d95',
			alertTextColor: '#5b21b6',
			alertTitle: 'ESTA for Visa Waiver Program Countries',
			alertText: 'Citizens of Visa Waiver Program (VWP) countries (e.g. UK, Australia, NZ) may use ESTA instead of a B-2 visa for stays up to 90 days. We advise which route applies to your nationality.',
			intro: 'The B-1/B-2 Visitor Visa allows US visits for tourism (B-2), business (B-1), or both. It requires a consular interview and demonstration of strong ties to your home country.',
			streams: [
				{icon: '🗽', name: 'B-2 Tourism', desc: 'Tourism, vacation, recreation, or visiting family.'},
				{icon: '💼', name: 'B-1 Business', desc: 'Meetings, negotiations, or professional events.'},
				{icon: '🏥', name: 'Medical Visit', desc: 'Seeking medical treatment in the United States.'},
			],
			requirements: [
				'Valid passport (valid 6+ months beyond stay)',
				'Completed DS-160 Online Nonimmigrant Application',
				'Consular interview — required for most nationalities',
				'MRV visa fee payment receipt',
				'Financial evidence — bank statements',
				'Strong ties to home country — employment, family',
			],
			details: [
				{label: 'Max stay', value: 'Up to 6 months'},
				{label: 'Visa validity', value: 'Up to 10 years'},
				{label: 'Processing', value: '4–12 weeks'},
				{label: 'Interview', value: 'Required'},
				{label: 'Work rights', value: 'None'},
				{label: 'Visa fee', value: 'USD $185 (MRV)'},
			],
			quickFacts: [
				{label: 'Visa name', value: 'B-1/B-2 Visitor Visa'},
				{label: 'Max stay', value: 'Up to 6 months'},
				{label: 'Interview', value: 'Required'},
				{label: 'Visa fee', value: 'USD $185'},
				{label: 'ESTA option', value: 'VWP countries — 90 days'},
			],
		},
		NZ: {
			code: 'NZ',
			name: 'New Zealand',
			flag: '🇳🇿',
			iconBg: '#f0fdf4',
			visaName: 'Visitor Visa',
			headline: 'Visitor Visa — New Zealand',
			alertBg: '#ecfdf5',
			alertBorder: '#a7f3d0',
			alertIcon: '🌿',
			alertHeadingColor: '#065f46',
			alertTextColor: '#047857',
			alertTitle: 'NZeTA for Visa-Waiver Nationalities',
			alertText: 'Many nationalities (including UK, Canada, USA) require an NZeTA (Electronic Travel Authority) and International Visitor Levy rather than a full visitor visa. We help you identify which applies.',
			intro: 'The New Zealand Visitor Visa allows stays of up to 9 months for tourism, family visits, or approved business activities. NZ is a popular destination for parents visiting international students.',
			streams: [
				{icon: '🥝', name: 'Tourism', desc: 'Tourism, adventure activities, and recreation.'},
				{icon: '👨‍👩‍👧', name: 'Family Visit', desc: 'Visit family members living or studying in NZ.'},
				{icon: '💼', name: 'Business', desc: 'Attend events or meetings without working.'},
			],
			requirements: [
				'Valid passport (valid 3+ months beyond departure)',
				'Completed online INZ visitor visa application',
				'Bank statements showing sufficient funds',
				'Onward or return travel evidence',
				'Accommodation evidence while in NZ',
				'Medical / police certs for longer stays',
			],
			details: [
				{label: 'Max stay', value: 'Up to 9 months'},
				{label: 'Processing', value: '1–4 weeks'},
				{label: 'Multiple entries', value: 'Yes (usually)'},
				{label: 'Work rights', value: 'None'},
				{label: 'Study allowed', value: 'Up to 3 months'},
				{label: 'Visa fee', value: 'NZD $210'},
			],
			quickFacts: [
				{label: 'Visa name', value: 'Visitor Visa'},
				{label: 'Max stay', value: 'Up to 9 months'},
				{label: 'Processing', value: '1–4 weeks'},
				{label: 'Visa fee', value: 'NZD $210'},
				{label: 'Work rights', value: 'None'},
			],
		},
	};

	readonly ctaBullets = ['Free consultation', 'Fast document review', 'No hidden fees', 'Family visit specialists'];
	private _obs!: IntersectionObserver;

	constructor(private el: ElementRef) {
	}

	ngAfterViewInit() {
		const els = this.el.nativeElement.querySelectorAll('.reveal,.reveal-r,.stagger');
		this._obs = new IntersectionObserver(entries => {
			entries.forEach(e => {
				if (e.isIntersecting) {
					e.target.classList.add('in');
					this._obs.unobserve(e.target);
				}
			});
		}, {threshold: 0.1});
		els.forEach((e: Element) => this._obs.observe(e));
	}

	ngOnDestroy() {
		if (this._obs) this._obs.disconnect();
	}
}
