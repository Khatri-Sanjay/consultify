import {
	Component, signal, ElementRef, AfterViewInit, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
	selector: 'app-graduate-visa',
	standalone: true,
	imports: [CommonModule, RouterModule],
	styles: [`
		:host { display: block; }

		.reveal { opacity:0; transform:translateY(26px); transition:opacity .6s ease,transform .6s ease; }
		.reveal.in { opacity:1; transform:none; }
		.reveal-l { opacity:0; transform:translateX(-26px); transition:opacity .6s ease,transform .6s ease; }
		.reveal-l.in { opacity:1; transform:none; }
		.reveal-r { opacity:0; transform:translateX(26px); transition:opacity .6s ease,transform .6s ease; }
		.reveal-r.in { opacity:1; transform:none; }
		.stagger > * { opacity:0; transform:translateY(22px); transition:opacity .52s ease,transform .52s ease; }
		.stagger.in > *:nth-child(1){transition-delay:.00s;opacity:1;transform:none;}
		.stagger.in > *:nth-child(2){transition-delay:.08s;opacity:1;transform:none;}
		.stagger.in > *:nth-child(3){transition-delay:.16s;opacity:1;transform:none;}
		.stagger.in > *:nth-child(4){transition-delay:.24s;opacity:1;transform:none;}
		.stagger.in > *:nth-child(5){transition-delay:.32s;opacity:1;transform:none;}
		.stagger.in > *:nth-child(6){transition-delay:.40s;opacity:1;transform:none;}

		.c-tab {
			display:inline-flex; align-items:center; gap:.4rem;
			padding:.42rem .88rem; border-radius:999px;
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

		.req-item {
			background:#fff; border-radius:1rem; border:1.5px solid #eef1ff;
			box-shadow:0 2px 14px rgba(26,37,96,.05); padding:1.2rem 1.4rem;
			transition:all .2s ease;
		}
		.req-item:hover { border-color:#1a35d4; box-shadow:0 8px 24px rgba(26,37,96,.10); }

		.tl-item { position:relative; padding-left:2.5rem; }
		.tl-item::before {
			content:''; position:absolute; left:.6rem; top:1.8rem;
			width:2px; height:calc(100% - .5rem);
			background:linear-gradient(180deg,#1a35d4,#00aaff); opacity:.2;
		}
		.tl-item:last-child::before { display:none; }
		.tl-dot {
			position:absolute; left:0; top:.4rem;
			width:1.3rem; height:1.3rem; border-radius:50%;
			background:linear-gradient(135deg,#1a35d4,#00aaff);
			box-shadow:0 2px 8px rgba(26,53,212,.35);
			display:flex; align-items:center; justify-content:center;
		}

		.comp-card {
			border-radius:1.1rem; border:1.5px solid #eef1ff;
			background:#fff; overflow:hidden; transition:all .22s ease;
		}
		.comp-card:hover { border-color:#1a35d4; box-shadow:0 10px 28px rgba(26,37,96,.10); }

		.sidebar-card {
			background:#fff; border-radius:1.25rem; border:1.5px solid #eef1ff;
			box-shadow:0 4px 24px rgba(26,37,96,.08); padding:1.75rem;
		}

		.grad-text {
			background:linear-gradient(90deg,#1a35d4,#00aaff);
			-webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
		}

		.faq-btn { transition:background .15s; }
		.faq-btn:hover { background:#f8f9ff; }
		.rotate-180 { transform:rotate(180deg); }
	`],
	template: `
		<section class="py-14 sm:py-16 bg-white" id="graduate-visa">
			<div class="container-custom">
				<div class="grid lg:grid-cols-3 gap-10 xl:gap-14">

					<div class="lg:col-span-2">

						<!-- Header -->
						<div class="flex items-start gap-4 mb-8 reveal" #revealRef>
							<div class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 bg-[#eef4ff]">🏛️</div>
							<div>
								<div class="inline-block text-[11px] font-bold px-3 py-1 rounded-full mb-1.5 grad-text border border-[#dce8ff]">
									Post-Study Work Visa
								</div>
								<h2 class="font-display text-2xl sm:text-3xl font-bold text-[#1a2560] leading-tight">
									Graduate &amp; Post-Study Work Visas
								</h2>
								<p class="text-gray-500 text-sm mt-1">Work rights after graduation — across 5 countries</p>
							</div>
						</div>

						<!-- Country tabs -->
						<div class="mb-7 reveal" #revealRef>
							<p class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Select destination country:</p>
							<div class="flex flex-wrap gap-2">
								@for (c of countries; track c.code) {
									<button class="c-tab" [class.active]="activeCountry() === c.code"
											(click)="setCountry(c.code)">
										<span aria-hidden="true">{{ c.flag }}</span>{{ c.name }}
									</button>
								}
							</div>
						</div>

						<!-- Visa hero band -->
						<div class="rounded-2xl p-6 sm:p-7 mb-8 reveal" #revealRef
							 style="background:linear-gradient(135deg,#0d1235 0%,#1a35d4 60%,#00aaff 100%)">
							<div class="flex items-start gap-4">
								<span class="text-5xl leading-none flex-shrink-0" aria-hidden="true">{{ activeData().flag }}</span>
								<div class="min-w-0">
									<div class="text-[#00aaff] text-xs font-bold uppercase tracking-wider mb-1">{{ activeData().subclass }}</div>
									<h3 class="font-display text-xl sm:text-2xl font-bold text-white mb-2">{{ activeData().visaName }}</h3>
									<p class="text-blue-100/90 text-sm leading-relaxed">{{ activeData().intro }}</p>
								</div>
							</div>
							<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
								@for (s of activeData().quickStats; track s.label) {
									<div class="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
										<div class="font-bold text-white text-base">{{ s.value }}</div>
										<div class="text-blue-200 text-xs mt-0.5">{{ s.label }}</div>
									</div>
								}
							</div>
						</div>

						<!-- Eligibility -->
						<h3 class="font-display text-xl font-bold text-[#1a2560] mb-5 reveal" #revealRef>
							Eligibility — {{ activeData().flag }} {{ activeData().country }}
						</h3>
						<div class="stagger space-y-3 mb-10" #revealRef>
							@for (r of activeData().requirements; track r.title) {
								<div class="req-item">
									<div class="flex items-center gap-3 mb-1">
										<span class="text-xl" aria-hidden="true">{{ r.icon }}</span>
										<h4 class="font-bold text-[#1a2560] text-sm sm:text-base">{{ r.title }}</h4>
										@if (r.mandatory) {
											<span class="text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto flex-shrink-0"
												  style="background:#fef3c7;color:#92400e">Required</span>
										}
									</div>
									<p class="text-gray-500 text-sm leading-relaxed pl-8">{{ r.desc }}</p>
								</div>
							}
						</div>

						<!-- Application timeline -->
						<h3 class="font-display text-xl font-bold text-[#1a2560] mb-6 reveal" #revealRef>Application Timeline</h3>
						<div class="space-y-4 mb-10 reveal" #revealRef>
							@for (t of Array(activeData().timeline); track t.step) {
								<div class="tl-item">
									<div class="tl-dot">
										<svg class="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 8 8" aria-hidden="true">
											<circle cx="4" cy="4" r="3"/>
										</svg>
									</div>
									<div class="bg-white border border-[#eef1ff] rounded-xl p-4">
										<div class="flex items-center gap-2 mb-1.5">
											<span class="text-xs font-bold px-2 py-0.5 rounded-full bg-[#eef4ff] text-[#1a35d4]">{{ t.when }}</span>
											<h4 class="font-bold text-[#1a2560] text-sm">{{ t.step }}</h4>
										</div>
										<p class="text-gray-500 text-xs sm:text-sm leading-relaxed">{{ t.desc }}</p>
									</div>
								</div>
							}
						</div>

						<!-- Cross-country comparison -->
						<h3 class="font-display text-xl font-bold text-[#1a2560] mb-2 reveal" #revealRef>
							Compare Post-Study Work Options Across Countries
						</h3>
						<p class="text-gray-500 text-sm mb-5 reveal" #revealRef>All 5 countries offer post-study work rights — here's how they compare.</p>
						<div class="stagger grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10" #revealRef>
							@for (c of countryComparison; track c.code) {
								<div class="comp-card">
									<div class="p-4 border-b border-[#eef1ff] flex items-center gap-3">
										<span class="text-2xl" aria-hidden="true">{{ c.flag }}</span>
										<div>
											<p class="font-bold text-[#1a2560] text-sm">{{ c.name }}</p>
											<p class="text-xs text-gray-400">{{ c.visaName }}</p>
										</div>
									</div>
									<div class="p-4 space-y-2.5">
										<div class="flex justify-between text-xs">
											<span class="text-gray-500">Duration</span>
											<span class="font-bold text-[#1a35d4]">{{ c.duration }}</span>
										</div>
										<div class="flex justify-between text-xs">
											<span class="text-gray-500">Work type</span>
											<span class="font-bold text-[#1a35d4]">{{ c.workType }}</span>
										</div>
										<div class="flex justify-between text-xs">
											<span class="text-gray-500">PR pathway?</span>
											<span class="font-bold" [style.color]="c.prPathway ? '#059669' : '#6b7280'">{{ c.prPathway ? '✅ Yes' : '—' }}</span>
										</div>
										<div class="flex justify-between text-xs">
											<span class="text-gray-500">Apply within</span>
											<span class="font-bold text-[#1a35d4]">{{ c.applyWithin }}</span>
										</div>
									</div>
								</div>
							}
						</div>

						<!-- FAQs -->
						<h3 class="font-display text-xl font-bold text-[#1a2560] mb-5 reveal" #revealRef>Frequently Asked Questions</h3>
						<div class="space-y-3 reveal" #revealRef>
							@for (faq of activeData().faqs; track faq.q; let i = $index) {
								<div class="border border-[#eef1ff] rounded-2xl overflow-hidden">
									<button class="faq-btn w-full flex items-center justify-between px-5 py-4 text-left
                                 font-semibold text-[#1a2560] text-sm"
											(click)="toggleFaq(i)"
											[attr.aria-expanded]="openFaq() === i">
										{{ faq.q }}
										<svg class="w-4 h-4 flex-shrink-0 ml-3 transition-transform duration-200"
											 style="color:#1a35d4"
											 [class.rotate-180]="openFaq() === i"
											 fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
										</svg>
									</button>
									@if (openFaq() === i) {
										<div class="px-5 pb-4 text-sm text-gray-600 leading-relaxed bg-[#f8f9ff] border-t border-[#eef1ff]">
											{{ faq.a }}
										</div>
									}
								</div>
							}
						</div>

					</div>

					<!-- ── Sidebar ── -->
					<div class="space-y-5">

						<div class="sidebar-card top-28 reveal-r" #revealRef>
							<div class="text-center mb-5">
								<div class="w-14 h-14 rounded-2xl bg-[#eef4ff] flex items-center justify-center text-2xl mx-auto mb-3">🏛️</div>
								<h3 class="font-display text-lg font-bold text-[#1a2560] mb-1">Apply for Your Graduate Visa</h3>
								<p class="text-gray-500 text-sm">Get expert guidance on your post-study work rights.</p>
							</div>
							<a routerLink="/contact"
							   class="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-white text-sm mb-4 transition-all"
							   style="background:linear-gradient(135deg,#1a35d4,#00aaff);box-shadow:0 4px 16px rgba(26,53,212,.3)"
							   onmouseover="this.style.transform='translateY(-1px)'"
							   onmouseout="this.style.transform=''">
								Book Free Assessment
								<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
								</svg>
							</a>
							<ul class="space-y-2.5">
								@for (b of sidebarBenefits; track b) {
									<li class="flex items-center gap-2 text-sm text-gray-600">
										<svg class="w-4 h-4 flex-shrink-0" style="color:#00aaff"
											 fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
										</svg>
										{{ b }}
									</li>
								}
							</ul>
						</div>

						<div class="sidebar-card reveal-r" #revealRef>
							<h4 class="font-bold text-[#1a2560] text-sm uppercase tracking-wide mb-4">
								{{ activeData().flag }} Key Facts — {{ activeData().country }}
							</h4>
							<div class="space-y-3">
								@for (f of activeData().keyFacts; track f.label) {
									<div class="flex justify-between items-start gap-2">
										<span class="text-xs text-gray-500 leading-snug">{{ f.label }}</span>
										<span class="text-xs font-bold text-[#1a35d4] text-right leading-snug max-w-[55%]">{{ f.value }}</span>
									</div>
									<div class="h-px bg-[#eef1ff]"></div>
								}
							</div>
						</div>

						<div class="sidebar-card reveal-r" #revealRef>
							<h4 class="font-bold text-[#1a2560] text-sm uppercase tracking-wide mb-4">Related Pathways</h4>
							<div class="space-y-2.5">
								@for (rv of relatedLinks; track rv.title) {
									<a [routerLink]="rv.route"
									   class="flex items-center gap-3 p-3 rounded-xl border border-[#eef1ff]
                            hover:border-[#1a35d4] hover:bg-[#eef4ff] transition-all group">
										<span class="text-xl flex-shrink-0" aria-hidden="true">{{ rv.icon }}</span>
										<div class="min-w-0">
											<p class="text-sm font-semibold text-[#1a2560] group-hover:text-[#1a35d4] transition-colors leading-snug">{{ rv.title }}</p>
											<p class="text-xs text-gray-400 truncate">{{ rv.sub }}</p>
										</div>
										<svg class="w-4 h-4 text-gray-300 group-hover:text-[#1a35d4] flex-shrink-0 ml-auto"
											 fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
										</svg>
									</a>
								}
							</div>
						</div>

					</div>

				</div>
			</div>
		</section>
	`,
})
export class GraduateVisaComponent implements AfterViewInit, OnDestroy {

	activeCountry = signal('AU');
	openFaq       = signal<number | null>(null);

	setCountry(code: string): void { this.activeCountry.set(code); this.openFaq.set(null); }
	toggleFaq(i: number): void { this.openFaq.set(this.openFaq() === i ? null : i); }

	readonly countries = [
		{ code: 'AU', name: 'Australia',   flag: '🇦🇺' },
		{ code: 'UK', name: 'UK',          flag: '🇬🇧' },
		{ code: 'CA', name: 'Canada',      flag: '🇨🇦' },
		{ code: 'US', name: 'USA',         flag: '🇺🇸' },
		{ code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
	];

	readonly countryData: Record<string, any> = {
		AU: {
			country: 'Australia', flag: '🇦🇺', subclass: 'Subclass 485',
			visaName: 'Temporary Graduate Visa (Subclass 485)',
			intro: 'Allows recent graduates to live, work, and study in Australia after completing an eligible Australian qualification. Two streams: Graduate Work and Post-Study Work.',
			quickStats: [
				{ value: '2–5 yrs', label: 'Duration' },
				{ value: 'Unlimited', label: 'Work rights' },
				{ value: '6 months', label: 'Apply within' },
				{ value: 'PR pathway', label: 'Points for PR' },
			],
			requirements: [
				{ icon: '🎓', title: 'Complete an eligible Australian qualification', mandatory: true,  desc: 'Must have completed at least 2 years of full-time study at an Australian institution and hold a qualification at bachelor level or above.' },
				{ icon: '📝', title: 'English language requirement',                  mandatory: true,  desc: 'Minimum IELTS 6.0 overall (or equivalent PTE 50) with no band below 5.0 for the Post-Study Work stream.' },
				{ icon: '🩺', title: 'Health and character requirements',             mandatory: true,  desc: 'Must meet Australian health and character requirements, including medical examination if required.' },
				{ icon: '⏰', title: 'Apply within 6 months of graduation',           mandatory: true,  desc: 'Must apply before the 6-month deadline from the date of your final results notification.' },
				{ icon: '📍', title: 'Must be in Australia when applying',            mandatory: true,  desc: 'You must be physically present in Australia when your 485 visa application is lodged.' },
				{ icon: '🌏', title: 'Skills assessment (Graduate Work stream only)', mandatory: false, desc: 'If applying under the Graduate Work stream, a positive skills assessment by a relevant assessing authority is required.' },
			],
			timeline: [
				{ when: 'Before applying', step: 'Confirm your final results',     desc: 'Receive written confirmation of your final results and ensure your qualification is eligible.' },
				{ when: 'Within 6 months', step: 'Lodge your 485 application',     desc: 'Lodge online via ImmiAccount while physically in Australia before the 6-month deadline.' },
				{ when: '3–4 months wait', step: 'Processing period',              desc: 'Department of Home Affairs assesses your application, health, and character requirements.' },
				{ when: 'During wait',     step: 'Bridging visa applies',          desc: 'You\'re on a Bridging Visa A with work rights while your 485 is being processed.' },
				{ when: 'After approval',  step: 'Start building PR points',       desc: 'Your time on a 485 visa counts towards Australian work experience for the skilled migration points test.' },
			],
			faqs: [
				{ q: 'What\'s the difference between Graduate Work and Post-Study Work stream?',
					a: 'The Graduate Work stream is for graduates with qualifications closely related to occupations on the Medium and Long-term Strategic Skills List (MLTSSL). The Post-Study Work stream is available to bachelor, masters, or doctoral graduates who studied in Australia for 2+ years — no occupation requirement.' },
				{ q: 'Can a 485 visa lead to Permanent Residency?',
					a: 'Yes. Work experience gained on a 485 visa counts towards the points test for the Skilled Independent visa (189) and Skilled Nominated visa (190). Many 485 holders use this time to accumulate points and get a state nomination for PR.' },
				{ q: 'What are the work rights on a 485 visa?',
					a: 'Full, unlimited work rights. You can work in any occupation for any employer, and you can change jobs freely. There are no restrictions on the number of hours or type of work.' },
				{ q: 'How long is the Post-Study Work stream 485 visa?',
					a: 'The duration depends on your qualification level and where you studied. Bachelor degrees: 2 years. Bachelor (Honours): 2 years. Masters by coursework: 3 years. Masters by research: 3 years. Doctoral: 4 years. Regional study may add 2 extra years.' },
			],
			keyFacts: [
				{ label: 'Visa subclass',       value: 'Subclass 485' },
				{ label: 'Two streams',         value: 'Graduate Work / Post-Study Work' },
				{ label: 'Apply within',        value: '6 months of final results' },
				{ label: 'Must be in AUS?',     value: 'Yes — at time of lodgement' },
				{ label: 'Duration (bachelors)', value: '2 years' },
				{ label: 'Duration (doctoral)', value: '4 years' },
				{ label: 'Visa fee',            value: 'A$1,895 (approx.)' },
			],
		},
		UK: {
			country: 'United Kingdom', flag: '🇬🇧', subclass: 'Graduate Route Visa',
			visaName: 'UK Graduate Route Visa',
			intro: 'The Graduate Route allows international students who completed a UK degree at bachelor level or above to stay and work (or look for work) for 2–3 years without needing a job offer.',
			quickStats: [
				{ value: '2–3 yrs', label: 'Duration' },
				{ value: 'Unrestricted', label: 'Work rights' },
				{ value: '£0',      label: 'No employer required' },
				{ value: 'Skilled Worker', label: 'Visa switch option' },
			],
			requirements: [
				{ icon: '🎓', title: 'Complete a UK bachelor\'s degree or above', mandatory: true,  desc: 'Must have completed and passed a bachelor\'s, master\'s, or doctoral degree at a licensed UK higher education provider.' },
				{ icon: '📚', title: 'Study at a licensed UK provider',           mandatory: true,  desc: 'Your university or college must hold a Student Route licence from UKVI at the time you graduate.' },
				{ icon: '🇬🇧', title: 'Be in the UK on a valid Student Visa',    mandatory: true,  desc: 'You must apply from within the UK while your Student Visa is still valid — before it expires.' },
				{ icon: '💷', title: 'Financial requirement',                    mandatory: false, desc: 'No specific financial requirement for the Graduate Route — you can apply without a job offer or minimum salary.' },
				{ icon: '🩺', title: 'Health & character',                       mandatory: true,  desc: 'Must pass the standard UK visa health and character checks. No additional medical exam required.' },
			],
			timeline: [
				{ when: 'Before applying',   step: 'Confirm your award',        desc: 'Receive official confirmation from your university that you have passed and been awarded your degree.' },
				{ when: 'While visa valid',  step: 'Apply for Graduate Route',  desc: 'Apply online via the UKVI portal from within the UK before your current Student Visa expires.' },
				{ when: '4–8 weeks wait',    step: 'Processing period',         desc: 'UKVI reviews your application. You\'re on a section 3C leave while waiting (no need for a Bridging Visa).' },
				{ when: 'After approval',    step: 'Start working',             desc: 'You can work in virtually any job at any salary — there\'s no employer or salary requirement on this visa.' },
				{ when: 'During Graduate',   step: 'Switch to Skilled Worker',  desc: 'If you find an eligible employer, you can switch to a Skilled Worker visa for longer-term stay and PR eligibility.' },
			],
			faqs: [
				{ q: 'Do I need a job offer for the UK Graduate Route?',
					a: 'No. The Graduate Route is unique in that there is no salary minimum, no employer sponsorship, and no specific job offer required. You can look for work or start working in any role.' },
				{ q: 'Can I extend the Graduate Route visa?',
					a: 'No. The Graduate Route cannot be extended. After 2 years (or 3 for PhD graduates), you must leave the UK or switch to another visa category, such as the Skilled Worker visa.' },
				{ q: 'Does Graduate Route time count towards UK settlement (ILR)?',
					a: 'No. Time on the Graduate Route does not count towards Indefinite Leave to Remain (ILR). Only time on specific qualifying visas like Skilled Worker, Global Talent, or Family visas counts towards ILR.' },
				{ q: 'Can I bring family members on the Graduate Route?',
					a: 'Yes. Eligible dependants (partner/spouse and children) who were already your dependants on your Student Visa can apply to join you or remain in the UK as your dependants on the Graduate Route.' },
			],
			keyFacts: [
				{ label: 'Visa type',       value: 'Graduate Route' },
				{ label: 'Apply from',      value: 'Within the UK (online)' },
				{ label: 'Apply while',     value: 'Student Visa still valid' },
				{ label: 'Duration (UG/PG)', value: '2 years' },
				{ label: 'Duration (PhD)', value: '3 years' },
				{ label: 'Visa fee',       value: '£822' },
				{ label: 'Salary req.',    value: 'None — any salary accepted' },
			],
		},
		CA: {
			country: 'Canada', flag: '🇨🇦', subclass: 'PGWP',
			visaName: 'Post-Graduation Work Permit (PGWP)',
			intro: 'The PGWP allows eligible graduates from a Canadian DLI to work anywhere in Canada for any employer, for up to 3 years. PGWP experience is a key pathway to Canadian PR.',
			quickStats: [
				{ value: 'Up to 3 yrs', label: 'Duration' },
				{ value: 'Open permit', label: 'Work type' },
				{ value: 'PR pathway', label: 'Express Entry' },
				{ value: '180 days', label: 'Apply within' },
			],
			requirements: [
				{ icon: '🎓', title: 'Complete a program at an eligible DLI',    mandatory: true,  desc: 'Must graduate from a Designated Learning Institution with a program of at least 8 months in duration.' },
				{ icon: '⏰', title: 'Apply within 180 days of final transcript', mandatory: true,  desc: 'You must apply for PGWP within 180 days of receiving your final marks transcript or graduation letter.' },
				{ icon: '📋', title: 'Valid Study Permit at time of graduation',  mandatory: true,  desc: 'Your study permit must still be valid (or have expired within 90 days) when you apply.' },
				{ icon: '🎯', title: 'Full-time study in Canada',                 mandatory: true,  desc: 'Must have studied full-time for most of your program. Online study limits may restrict PGWP eligibility.' },
				{ icon: '🏫', title: 'Program must now be PGWP-eligible',         mandatory: true,  desc: 'Since 2024, only programs at public institutions and certain private institutions qualify. Eligibility has changed — we verify current rules.' },
			],
			timeline: [
				{ when: 'While studying',    step: 'Confirm DLI PGWP eligibility', desc: 'Verify your institution and program are currently on the PGWP-eligible list (important post-2024 changes).' },
				{ when: 'At graduation',     step: 'Receive final marks',          desc: 'Request your official final transcript and/or a letter from your institution confirming graduation.' },
				{ when: 'Within 180 days',   step: 'Apply for PGWP online',        desc: 'Apply via the IRCC portal while in Canada (or from abroad if your study permit was valid at graduation).' },
				{ when: '3–5 months wait',   step: 'Processing period',            desc: 'IRCC processes your PGWP application. You can work under implied status or a bridging open work permit.' },
				{ when: 'After approval',    step: 'Build CRS score for PR',       desc: 'Canadian work experience gained on a PGWP significantly boosts your Comprehensive Ranking System (CRS) score for Express Entry.' },
			],
			faqs: [
				{ q: 'How long is my PGWP?',
					a: 'The length of your PGWP is based on the length of your study program. Programs of 8 months to less than 2 years → PGWP up to the program length. Programs of 2 years or more → 3-year PGWP.' },
				{ q: 'Can PGWP experience be used for Canadian PR?',
					a: 'Yes — this is one of the best features of studying in Canada. Skilled work experience on a PGWP earns you Canadian Experience Class (CEC) eligibility and CRS points under the Federal Skilled Worker program, both part of Express Entry.' },
				{ q: 'Has PGWP eligibility changed recently?',
					a: 'Yes. As of 2024, IRCC tightened PGWP eligibility. Only certain programs (particularly in fields like healthcare, STEM, agriculture) at eligible institutions qualify. We always verify current eligibility before you apply.' },
				{ q: 'What happens if I can\'t find work in Canada on my PGWP?',
					a: 'Your PGWP clock continues whether you\'re working or not. To maximise CRS points, you want to start accumulating eligible work experience as soon as possible. We can advise on your PR strategy.' },
			],
			keyFacts: [
				{ label: 'Permit type',     value: 'Open Work Permit (PGWP)' },
				{ label: 'Apply within',    value: '180 days of final transcript' },
				{ label: 'Duration',        value: 'Up to 3 years' },
				{ label: 'Work rights',     value: 'Any employer, any job' },
				{ label: 'PR pathway',      value: 'CEC / Express Entry' },
				{ label: 'Permit fee',      value: 'C$255 (+ C$100 biometrics)' },
				{ label: 'Min. program',    value: '8 months at eligible DLI' },
			],
		},
		US: {
			country: 'United States', flag: '🇺🇸', subclass: 'OPT / STEM OPT',
			visaName: 'Optional Practical Training (OPT & STEM OPT)',
			intro: 'OPT allows F-1 students to work in the US in a field related to their major for up to 12 months. STEM graduates can apply for a 24-month STEM OPT extension — up to 3 years total.',
			quickStats: [
				{ value: 'Up to 3 yrs', label: 'STEM OPT total' },
				{ value: 'EAD required', label: 'Work authorisation' },
				{ value: '90 days', label: 'Apply before grad.' },
				{ value: 'H-1B pathway', label: 'Employer sponsor' },
			],
			requirements: [
				{ icon: '🎓', title: 'Complete a full academic year of F-1 study', mandatory: true,  desc: 'Must have completed at least one full academic year of full-time F-1 study at a SEVP-approved institution.' },
				{ icon: '📋', title: 'DSO recommendation and updated I-20',        mandatory: true,  desc: 'Your Designated School Official (DSO) must recommend OPT and issue a new I-20 endorsing the OPT period.' },
				{ icon: '🏛️', title: 'Apply to USCIS for EAD card',               mandatory: true,  desc: 'Submit Form I-765 to USCIS to obtain your Employment Authorization Document (EAD). Processing takes 90–150 days.' },
				{ icon: '🔬', title: 'STEM degree for STEM OPT extension',         mandatory: false, desc: 'For the 24-month STEM OPT extension, your degree must be in a STEM field on the USCIS STEM Designated Degree Program list.' },
				{ icon: '🏢', title: 'E-Verify employer for STEM OPT',             mandatory: false, desc: 'Your employer must be enrolled in E-Verify to be eligible to employ you on a STEM OPT extension.' },
			],
			timeline: [
				{ when: '90 days before grad.', step: 'Request OPT recommendation', desc: 'Contact your DSO and request an OPT recommendation and a new I-20 with the OPT endorsement.' },
				{ when: '90 days before grad.', step: 'File I-765 with USCIS',      desc: 'Submit your Employment Authorization Document application to USCIS (can be filed up to 90 days before graduation).' },
				{ when: '90–150 days wait',     step: 'Receive EAD card',           desc: 'USCIS processes your application and mails your EAD card. You can start work on your EAD start date.' },
				{ when: '60 days before OPT ends', step: 'Apply for STEM OPT',     desc: 'STEM graduates must apply through their DSO for the 24-month extension at least 90 days before OPT expires.' },
				{ when: 'During STEM OPT',      step: 'H-1B lottery participation', desc: 'Many employers sponsor F-1 OPT holders for an H-1B visa. You can enter the April H-1B lottery while on STEM OPT.' },
			],
			faqs: [
				{ q: 'What\'s the difference between pre-completion and post-completion OPT?',
					a: 'Pre-completion OPT can be used while you\'re still studying (part-time during school, full-time during breaks). Post-completion OPT is used after graduation and is the most common. The total OPT allotment is 12 months regardless of timing.' },
				{ q: 'What counts as a STEM degree for STEM OPT?',
					a: 'Your degree must be in a field listed on the USCIS STEM Designated Degree Program list, which includes computer science, engineering, mathematics, and physical sciences, among others. We confirm whether your specific degree qualifies.' },
				{ q: 'What is the 90-day unemployment rule?',
					a: 'F-1 students on post-completion OPT can only have 90 cumulative days of unemployment. On STEM OPT, this limit increases to 150 days. Exceeding these limits violates F-1 status.' },
				{ q: 'Can I change employers on STEM OPT?',
					a: 'Yes, but your new employer must also be enrolled in E-Verify, and you must report the change to your DSO within 10 days via your school\'s OPT reporting portal.' },
			],
			keyFacts: [
				{ label: 'Application',       value: 'Form I-765 to USCIS' },
				{ label: 'Standard OPT',      value: '12 months' },
				{ label: 'STEM extension',    value: '24 months (36 total)' },
				{ label: 'E-Verify',          value: 'Required for STEM OPT employer' },
				{ label: 'Processing time',   value: '90–150 days (I-765)' },
				{ label: 'EAD fee',           value: '$410 (USCIS filing fee)' },
				{ label: 'H-1B pathway?',     value: 'Yes — employer can sponsor' },
			],
		},
		NZ: {
			country: 'New Zealand', flag: '🇳🇿', subclass: 'Post-Study Work Visa',
			visaName: 'NZ Post-Study Work Visa',
			intro: 'Allows eligible graduates from New Zealand institutions to work for up to 3 years after completing their qualification. An open work visa — work for any employer in any role.',
			quickStats: [
				{ value: 'Up to 3 yrs', label: 'Duration' },
				{ value: 'Open visa', label: 'Work type' },
				{ value: 'PR pathway', label: 'Skilled Migrant' },
				{ value: 'Level 7+', label: 'Qualification req.' },
			],
			requirements: [
				{ icon: '🎓', title: 'Level 7+ qualification from a NZ institution', mandatory: true,  desc: 'Must have completed a bachelor\'s degree or higher (NZQF Level 7 or above) at an approved NZ institution.' },
				{ icon: '📍', title: 'Study in New Zealand for at least 30 weeks', mandatory: true,  desc: 'Your program must have involved at least 30 weeks of studying inside New Zealand.' },
				{ icon: '⏰', title: 'Apply within 3 months of completing study',   mandatory: true,  desc: 'Apply for the PSWV within 3 months of your course completion date.' },
				{ icon: '🏥', title: 'Health and character requirements',           mandatory: true,  desc: 'Must meet standard Immigration NZ health and character requirements.' },
				{ icon: '💳', title: 'Passport validity',                           mandatory: true,  desc: 'Your passport must be valid for the full duration of the work visa.' },
			],
			timeline: [
				{ when: 'Before applying',   step: 'Confirm qualification level',   desc: 'Verify your qualification is at NZQF Level 7 or above and that your institution is approved.' },
				{ when: 'Within 3 months',   step: 'Apply online at INZ',           desc: 'Apply for the Post-Study Work Visa online via the Immigration NZ portal.' },
				{ when: '3–6 weeks wait',    step: 'Processing period',             desc: 'Immigration NZ reviews your application, health, and character checks.' },
				{ when: 'After approval',    step: 'Start working in NZ',           desc: 'Work for any employer in any role — the open work visa has no employer or occupation restriction.' },
				{ when: 'During visa',       step: 'Accrue Skilled Migrant points', desc: 'NZ work experience and qualifications count towards the Skilled Migrant Category PR pathway.' },
			],
			faqs: [
				{ q: 'Can the NZ Post-Study Work Visa lead to Permanent Residency?',
					a: 'Yes. New Zealand work experience on a PSWV earns points under the Skilled Migrant Category (SMC). An SMC Expression of Interest with sufficient points can lead to an invitation to apply for Residence.' },
				{ q: 'Can I bring my partner on the Post-Study Work Visa?',
					a: 'Yes. Your partner or spouse can apply for a Partner of a Worker visa if you are working in New Zealand on a PSWV. They receive open work rights (partner of a skilled migrant or post-study worker).' },
				{ q: 'Does regional study in NZ give a longer PSWV?',
					a: 'Not directly through the standard PSWV, but New Zealand\'s regional growth policies may offer additional points or incentives if you studied and work in certain regions. We advise on this as part of your PR strategy.' },
				{ q: 'What is the minimum qualification for the PSWV?',
					a: 'The qualification must be at least NZQF Level 7 (bachelor\'s degree). Shorter qualifications (diplomas, certificates) may qualify for a different, shorter work visa. We assess your specific qualification.' },
			],
			keyFacts: [
				{ label: 'Visa type',         value: 'Post-Study Work Visa (INZ)' },
				{ label: 'Apply within',      value: '3 months of completion' },
				{ label: 'Min. qualification',value: 'NZQF Level 7 (degree)' },
				{ label: 'Duration',          value: 'Up to 3 years' },
				{ label: 'Work type',         value: 'Open — any employer' },
				{ label: 'Visa fee',          value: 'NZ$700 (approx.)' },
				{ label: 'PR pathway?',       value: 'Skilled Migrant Category' },
			],
		},
	};

	activeData = () => this.countryData[this.activeCountry()];

	readonly countryComparison = [
		{ code: 'AU', name: 'Australia',     flag: '🇦🇺', visaName: 'Subclass 485',           duration: '2–4 years',   workType: 'Unrestricted', prPathway: true,  applyWithin: '6 months of results' },
		{ code: 'UK', name: 'United Kingdom', flag: '🇬🇧', visaName: 'Graduate Route',          duration: '2–3 years',   workType: 'Any employer', prPathway: false, applyWithin: 'Before Student Visa expires' },
		{ code: 'CA', name: 'Canada',         flag: '🇨🇦', visaName: 'PGWP',                    duration: 'Up to 3 yrs', workType: 'Open permit',  prPathway: true,  applyWithin: '180 days of transcript' },
		{ code: 'US', name: 'United States',  flag: '🇺🇸', visaName: 'OPT / STEM OPT',          duration: '1–3 years',   workType: 'STEM related', prPathway: false, applyWithin: '90 days before graduation' },
		{ code: 'NZ', name: 'New Zealand',    flag: '🇳🇿', visaName: 'Post-Study Work Visa',    duration: 'Up to 3 yrs', workType: 'Open visa',    prPathway: true,  applyWithin: '3 months of completion' },
	];

	readonly sidebarBenefits = [
		'MARA registered agents',
		'All 5 countries covered',
		'Application strategy advice',
		'PR planning included',
		'98% visa success rate',
	];

	readonly relatedLinks = [
		{ icon: '🎒', title: 'Student Visa',       sub: 'Visa to study at university',   route: '/visa/student-visa' },
		{ icon: '🌍', title: 'Permanent Residency', sub: 'Long-term PR pathways',         route: '/visa/permanent-residency' },
		{ icon: '✈️', title: 'Tourist Visa',        sub: 'Visit family or for tourism',   route: '/visa/tourist-visa' },
		{ icon: '📝', title: 'PTE / IELTS Prep',    sub: 'Achieve required test scores',  route: '/services/pte-ielts' },
	];

	private _observer!: IntersectionObserver;

	constructor(private el: ElementRef) {}

	ngAfterViewInit(): void {
		const els = this.el.nativeElement.querySelectorAll('.reveal,.reveal-l,.reveal-r,.stagger');
		this._observer = new IntersectionObserver(entries => {
			entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); this._observer.unobserve(e.target); } });
		}, { threshold: 0.12 });
		els.forEach((el: Element) => this._observer.observe(el));
	}

	ngOnDestroy(): void { if (this._observer) this._observer.disconnect(); }

	protected readonly Array = Array;
}
