import {
	Component,
	signal,
	ElementRef,
	AfterViewInit,
	OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
	selector: 'app-health-insurance',
	standalone: true,
	imports: [CommonModule, RouterModule],
	styles: [`

		:host { display:block; }

		/* ================= Animations ================= */
		.reveal,
		.reveal-l,
		.reveal-r,
		.stagger > * {
			opacity:0;
			transition:all .6s ease;
		}

		.reveal { transform:translateY(26px); }
		.reveal-l { transform:translateX(-26px); }
		.reveal-r { transform:translateX(26px); }
		.stagger > * { transform:translateY(20px); }

		.reveal.in,
		.reveal-l.in,
		.reveal-r.in { opacity:1; transform:none; }

		.stagger.in > * {
			opacity:1;
			transform:none;
		}

		/* ================= Country Tabs ================= */
		.c-tab {
			display:inline-flex;
			align-items:center;
			gap:.4rem;
			padding:.35rem .75rem;
			border-radius:999px;
			border:1.5px solid #dde3ff;
			background:#fff;
			color:#4b5563;
			font-size:.75rem;
			font-weight:500;
			cursor:pointer;
			transition:.2s;
			white-space:nowrap;
			flex-shrink:0;
		}

		@media (min-width:640px){
			.c-tab{
				padding:.4rem .85rem;
				font-size:.8rem;
			}
		}

		.c-tab:hover {
			border-color:#1a35d4;
			color:#1a35d4;
			background:#eef4ff;
		}

		.c-tab.active {
			background:linear-gradient(135deg,#1a35d4,#00aaff);
			border-color:transparent;
			color:#fff;
			font-weight:600;
			box-shadow:0 4px 14px rgba(26,53,212,.28);
		}

		/* ================= Cards ================= */
		.info-card {
			background:#fff;
			border-radius:1rem;
			border:1.5px solid #eef1ff;
			box-shadow:0 2px 16px rgba(26,37,96,.06);
			padding:1.2rem;
			transition:.25s;
		}

		@media (min-width:640px){
			.info-card{ padding:1.5rem; }
		}

		.info-card:hover {
			border-color:#1a35d4;
			box-shadow:0 10px 28px rgba(26,37,96,.11);
		}

		.sidebar-card {
			background:#fff;
			border-radius:1.25rem;
			border:1.5px solid #eef1ff;
			box-shadow:0 4px 24px rgba(26,37,96,.08);
			padding:1.25rem;
		}

		@media (min-width:640px){
			.sidebar-card{ padding:1.75rem; }
		}

		/* ================= Table ================= */
		.provider-table {
			width:100%;
			border-collapse:separate;
			border-spacing:0;
			min-width:720px;
		}

		.provider-table th {
			background:linear-gradient(135deg,#1a2560,#1a35d4);
			color:#fff;
			padding:.75rem 1rem;
			font-size:.75rem;
			text-transform:uppercase;
			letter-spacing:.04em;
			text-align:left;
		}

		.provider-table td {
			padding:.85rem 1rem;
			font-size:.85rem;
			border-bottom:1px solid #eef1ff;
		}

		.provider-table tbody tr:nth-child(even) {
			background:#f8f9ff;
		}

	`],
	template: `

		<section class="py-10 sm:py-14 md:py-16 bg-white">

			<div class="container-custom">

				<div class="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 xl:gap-14">

					<!-- ================= MAIN ================= -->
					<div class="lg:col-span-2">

						<!-- Header -->
						<div class="flex items-start gap-4 mb-8 reveal">
							<div class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl"
								 style="background:linear-gradient(135deg,#fff0f0,#ffe0e0)">
								🏥
							</div>

							<div>
								<h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-[#1a2560] leading-tight">
									International Student Health Insurance
								</h2>
								<p class="text-gray-500 text-sm mt-1">
									Mandatory health cover for your destination country
								</p>
							</div>
						</div>

						<!-- Country Tabs -->
						<div class="mb-8 reveal">
							<p class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
								Select destination:
							</p>

							<div class="flex gap-2 overflow-x-auto pb-2">
								@for (c of countries; track c.code) {
									<button
										class="c-tab"
										[class.active]="activeCountry() === c.code"
										(click)="setCountry(c.code)">
										{{ c.flag }} {{ c.name }}
									</button>
								}
							</div>
						</div>

						<!-- Alert -->
						<div class="rounded-2xl p-5 mb-8 border reveal"
							 [style.background]="activeData().alertBg"
							 [style.borderColor]="activeData().alertBorder">

							<h3 class="font-bold mb-2"
								[style.color]="activeData().alertHeadingColor">
								{{ activeData().alertTitle }}
							</h3>

							<p class="text-sm leading-relaxed"
							   [style.color]="activeData().alertTextColor">
								{{ activeData().alertText }}
							</p>
						</div>

						<!-- Intro -->
						<p class="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed mb-8 reveal">
							{{ activeData().intro }}
						</p>

						<!-- Provider Table -->
						<div class="w-full overflow-x-auto rounded-2xl border border-[#eef1ff] shadow-sm mb-10 reveal">
							<table class="provider-table">
								<thead>
								<tr>
									<th>Provider</th>
									<th>Annual</th>
									<th>Hospital</th>
									<th>Extras</th>
									<th>Rating</th>
								</tr>
								</thead>
								<tbody>
									@for (p of activeData().providers; track p.name) {
										<tr>
											<td class="font-semibold text-[#1a2560]">{{ p.name }}</td>
											<td>{{ p.cost }}</td>
											<td>{{ p.hospital }}</td>
											<td>{{ p.extras }}</td>
											<td>{{ p.stars }}/5</td>
										</tr>
									}
								</tbody>
							</table>
						</div>

					</div>

					<!-- ================= SIDEBAR ================= -->
					<div class="space-y-6">

						<div class="sidebar-card lg:sticky lg:top-28 reveal-r">
							<div class="text-center mb-5">
								<div class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3"
									 style="background:linear-gradient(135deg,#eef4ff,#dce8ff)">
									🏥
								</div>

								<h3 class="font-bold text-[#1a2560] mb-2">
									Get Free Advice
								</h3>

								<p class="text-gray-500 text-sm">
									We compare and recommend the best cover for your situation — free.
								</p>
							</div>

							<a routerLink="/contact"
							   class="flex items-center justify-center w-full py-3 rounded-xl font-bold text-white text-sm"
							   style="background:linear-gradient(135deg,#1a35d4,#00aaff)">
								Contact Us
							</a>
						</div>

					</div>

				</div>
			</div>
		</section>

	`,
})
export class HealthInsuranceComponent
	implements AfterViewInit, OnDestroy {

	activeCountry = signal('AU');
	setCountry(code: string){ this.activeCountry.set(code); }

	readonly countries = [
		{ code:'AU', name:'Australia', flag:'🇦🇺' },
		{ code:'UK', name:'UK', flag:'🇬🇧' },
		{ code:'CA', name:'Canada', flag:'🇨🇦' },
		{ code:'US', name:'USA', flag:'🇺🇸' },
		{ code:'NZ', name:'New Zealand', flag:'🇳🇿' },
	];

	readonly countryData: Record<string, any> = {
		AU: {
			name: 'Australia',
			flag: '🇦🇺',
			alertBg: '#fff7ed', alertBorder: '#fed7aa',
			alertIcon: '⚠️', alertHeadingColor: '#92400e',
			alertTitle: 'OSHC is Mandatory',
			alertText: 'Overseas Student Health Cover (OSHC) is a condition of your Australian Student Visa (Subclass 500). You must maintain valid OSHC for the entire duration of your stay in Australia.',
			alertTextColor: '#92400e',
			intro: 'Choosing the right OSHC provider is more than price comparison. We assess your health needs, institution requirements, and budget to recommend the best cover for your Australian study journey.',
			quickFacts: [
				{ label: 'Cover type',       value: 'OSHC' },
				{ label: 'Mandatory?',       value: 'Yes — Visa condition' },
				{ label: 'Min. period',      value: 'Full visa duration' },
				{ label: 'Who regulates it', value: 'Australian Govt.' },
				{ label: 'Avg. annual cost', value: 'A$510 – A$620' },
			],
			providers: [
				{ name: 'Medibank',     badge: 'Most Popular', cost: 'A$620', hospital: 'Full cover', extras: 'Yes',      stars: 5 },
				{ name: 'BUPA',                                cost: 'A$590', hospital: 'Full cover', extras: 'Yes',      stars: 4 },
				{ name: 'Allianz Care',                        cost: 'A$540', hospital: 'Full cover', extras: 'Optional', stars: 4 },
				{ name: 'NIB',                                 cost: 'A$580', hospital: 'Full cover', extras: 'Yes',      stars: 4 },
				{ name: 'AHM',         badge: 'Best Value',   cost: 'A$510', hospital: 'Full cover', extras: 'Optional', stars: 3 },
			],
		},
		UK: {
			name: 'United Kingdom',
			flag: '🇬🇧',
			alertBg: '#eff6ff', alertBorder: '#bfdbfe',
			alertIcon: '🇬🇧', alertHeadingColor: '#1e3a8a',
			alertTitle: 'NHS Immigration Health Surcharge',
			alertText: 'UK Student Visa applicants must pay the Immigration Health Surcharge (IHS) upfront as part of their visa application. This gives access to the NHS for the visa duration.',
			alertTextColor: '#1e40af',
			intro: 'UK student visa holders pay the Immigration Health Surcharge, which covers NHS usage. We advise on additional private health insurance to top up waiting times and cover extras not included in NHS.',
			quickFacts: [
				{ label: 'Cover type',    value: 'NHS via IHS + optional private' },
				{ label: 'IHS cost',      value: '£776 / year (2024)' },
				{ label: 'Paid when?',    value: 'At visa application' },
				{ label: 'Top-up cover?', value: 'Recommended' },
				{ label: 'Regulator',     value: 'UKVI / NHS England' },
			],
			providers: [
				{ name: 'AXA Health',    badge: 'Most Popular', cost: '£42/mo', hospital: 'Private',    extras: 'Included', stars: 5 },
				{ name: 'Bupa UK',                              cost: '£38/mo', hospital: 'Private',    extras: 'Included', stars: 4 },
				{ name: 'Vitality',      badge: 'Best Value',   cost: '£30/mo', hospital: 'Private',    extras: 'Optional', stars: 4 },
				{ name: 'WPA',                                  cost: '£35/mo', hospital: 'Private',    extras: 'Included', stars: 3 },
				{ name: 'Freedom Health',                       cost: '£28/mo', hospital: 'Day surgery', extras: 'No',      stars: 3 },
			],
		},
		CA: {
			name: 'Canada',
			flag: '🇨🇦',
			alertBg: '#f0fdf4', alertBorder: '#bbf7d0',
			alertIcon: '🍁', alertHeadingColor: '#14532d',
			alertTitle: 'Provincial Health Coverage Varies',
			alertText: "Canada's health coverage depends on your province of study. Some provinces (BC, Alberta) cover international students; others require private insurance. We help you navigate what applies to you.",
			alertTextColor: '#15803d',
			intro: 'Health insurance for international students in Canada varies significantly by province. From UHIP in Ontario to MSP in BC, we clarify your entitlements and top-up gaps with private coverage.',
			quickFacts: [
				{ label: 'Varies by?',     value: 'Province' },
				{ label: 'Ontario (UHIP)', value: 'C$756/year' },
				{ label: 'BC (MSP)',       value: 'Free after 3 months' },
				{ label: 'Alberta',        value: 'AHCIP — free for students' },
				{ label: 'Private top-up', value: 'C$300–C$600/year' },
			],
			providers: [
				{ name: 'Guard.me',       badge: 'International', cost: 'C$480', hospital: 'Full', extras: 'Included', stars: 5 },
				{ name: 'Manulife',                               cost: 'C$520', hospital: 'Full', extras: 'Included', stars: 4 },
				{ name: 'Sun Life',       badge: 'Most Popular',  cost: 'C$495', hospital: 'Full', extras: 'Optional', stars: 4 },
				{ name: 'Blue Cross',                             cost: 'C$450', hospital: 'Full', extras: 'Optional', stars: 3 },
				{ name: 'CUPE/UHIP',      badge: 'Mandatory ON',  cost: 'C$756', hospital: 'Full', extras: 'No',       stars: 3 },
			],
		},
		US: {
			name: 'United States',
			flag: '🇺🇸',
			alertBg: '#faf5ff', alertBorder: '#e9d5ff',
			alertIcon: '🏛️', alertHeadingColor: '#4c1d95',
			alertTitle: 'University Health Plans Required',
			alertText: "Most US universities require F-1 students to enrol in their mandatory Student Health Insurance Plan (SHIP). You may waive it if you have comparable coverage — we help you decide.",
			alertTextColor: '#5b21b6',
			intro: 'US university health plans vary greatly in cost and coverage. We review your university\'s SHIP requirements and compare them with independent international student health plans to find your best option.',
			quickFacts: [
				{ label: 'Type',           value: 'University SHIP (mandatory)' },
				{ label: 'Annual cost',    value: '$1,500 – $4,000' },
				{ label: 'Waiver option?', value: 'Yes — if comparable plan' },
				{ label: 'Regulator',      value: 'Per university / state' },
				{ label: 'Deductible',     value: 'Typically $250–$500' },
			],
			providers: [
				{ name: 'Aetna Student',    badge: 'Largest Network', cost: '$2,800', hospital: 'Full', extras: 'Included', stars: 5 },
				{ name: 'UnitedHealthcare',                           cost: '$2,650', hospital: 'Full', extras: 'Included', stars: 4 },
				{ name: 'ISO Student',      badge: 'International',   cost: '$1,800', hospital: 'Major', extras: 'Optional', stars: 4 },
				{ name: 'IMG Global',                                 cost: '$1,500', hospital: 'Major', extras: 'Optional', stars: 3 },
				{ name: 'GeoBlue',          badge: 'Best Value',      cost: '$1,400', hospital: 'Major', extras: 'No',       stars: 3 },
			],
		},
		NZ: {
			name: 'New Zealand',
			flag: '🇳🇿',
			alertBg: '#ecfdf5', alertBorder: '#a7f3d0',
			alertIcon: '🌿', alertHeadingColor: '#065f46',
			alertTitle: 'ACC Covers Accidents — Not Illness',
			alertText: "New Zealand's Accident Compensation Corporation (ACC) covers injuries, but does NOT cover illness or pre-existing conditions. International students must have comprehensive health insurance.",
			alertTextColor: '#047857',
			intro: 'While NZ\'s ACC scheme is excellent for injury cover, international students need private health insurance for illness, specialist visits, and prescription costs. We guide you to the right policy.',
			quickFacts: [
				{ label: 'ACC covers',       value: 'Accidents only' },
				{ label: 'Private required', value: 'Yes — for illness' },
				{ label: 'Annual cost',      value: 'NZ$450 – NZ$750' },
				{ label: 'Visa requirement', value: 'Comprehensive cover' },
				{ label: 'Regulator',        value: 'Immigration NZ' },
			],
			providers: [
				{ name: 'Southern Cross',  badge: 'Most Popular',  cost: 'NZ$620', hospital: 'Full',   extras: 'Included', stars: 5 },
				{ name: 'nib NZ',                                  cost: 'NZ$590', hospital: 'Full',   extras: 'Optional', stars: 4 },
				{ name: 'AIA NZ',          badge: 'Best Coverage', cost: 'NZ$710', hospital: 'Full',   extras: 'Included', stars: 4 },
				{ name: 'Unicare',                                 cost: 'NZ$480', hospital: 'Major',  extras: 'No',       stars: 3 },
				{ name: 'Pacific Cross',   badge: 'Budget option', cost: 'NZ$450', hospital: 'Basic',  extras: 'No',       stars: 3 },
			],
		},
	};

	activeData = () => this.countryData[this.activeCountry()];

	private _observer!: IntersectionObserver;

	constructor(private el:ElementRef){}

	ngAfterViewInit(){
		const els = this.el.nativeElement.querySelectorAll('.reveal,.reveal-l,.reveal-r,.stagger');
		this._observer = new IntersectionObserver(entries=>{
			entries.forEach(e=>{
				if(e.isIntersecting){
					e.target.classList.add('in');
					this._observer.unobserve(e.target);
				}
			});
		},{threshold:.12});
		els.forEach((el:Element)=>this._observer.observe(el));
	}

	ngOnDestroy(){
		if(this._observer) this._observer.disconnect();
	}

}
