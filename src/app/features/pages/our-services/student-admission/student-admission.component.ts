import {
	Component, signal, ElementRef, AfterViewInit, OnDestroy, NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
	selector: 'app-student-admission',
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
    .stagger > * { opacity:0; transform:translateY(20px); transition:opacity .5s ease,transform .5s ease; }
    .stagger.in > *:nth-child(1){transition-delay:.00s;opacity:1;transform:none;}
    .stagger.in > *:nth-child(2){transition-delay:.08s;opacity:1;transform:none;}
    .stagger.in > *:nth-child(3){transition-delay:.16s;opacity:1;transform:none;}
    .stagger.in > *:nth-child(4){transition-delay:.24s;opacity:1;transform:none;}
    .stagger.in > *:nth-child(5){transition-delay:.32s;opacity:1;transform:none;}
    .stagger.in > *:nth-child(6){transition-delay:.40s;opacity:1;transform:none;}

    .feat-card {
      background:#fff; border-radius:1rem; border:1.5px solid #eef1ff;
      box-shadow:0 2px 16px rgba(26,37,96,.06); padding:1.5rem;
      transition:all .22s ease;
    }
    .feat-card:hover { border-color:#1a35d4; transform:translateY(-3px); box-shadow:0 12px 32px rgba(26,37,96,.12); }
    .feat-icon {
      width:2.75rem; height:2.75rem; border-radius:.875rem;
      display:flex; align-items:center; justify-content:center;
      background:#eef4ff; font-size:1.3rem; margin-bottom:1rem;
      transition:background .2s;
    }
    .feat-card:hover .feat-icon { background:linear-gradient(135deg,#1a35d4,#00aaff); }

    .country-tab {
      display:inline-flex; align-items:center; gap:.4rem;
      padding:.4rem .85rem; border-radius:999px;
      border:1.5px solid #dde3ff; background:#fff;
      color:#4b5563; font-size:.8rem; font-weight:500;
      cursor:pointer; transition:all .2s; white-space:nowrap;
    }
    .country-tab:hover { border-color:#1a35d4; color:#1a35d4; background:#eef4ff; }
    .country-tab.active {
      background:linear-gradient(135deg,#1a35d4,#00aaff);
      border-color:transparent; color:#fff; font-weight:600;
      box-shadow:0 4px 14px rgba(26,53,212,.28);
    }

    .uni-tag {
      display:inline-flex; align-items:center; gap:.4rem;
      padding:.45rem .9rem; border-radius:.6rem;
      background:#eef4ff; border:1px solid #dce8ff;
      font-size:.8rem; font-weight:600; color:#1a2560;
      transition:all .18s ease;
    }
    .uni-tag:hover { background:#1a35d4; color:#fff; border-color:#1a35d4; }

    .timeline-item {
      position:relative; padding-left:2.5rem;
    }
    .timeline-item::before {
      content:''; position:absolute; left:.6rem; top:1.75rem;
      width:2px; height:calc(100% - 1rem);
      background:linear-gradient(180deg,#1a35d4,#00aaff); opacity:.2;
    }
    .timeline-item:last-child::before { display:none; }
    .timeline-dot {
      position:absolute; left:0; top:.35rem;
      width:1.25rem; height:1.25rem; border-radius:50%;
      background:linear-gradient(135deg,#1a35d4,#00aaff);
      box-shadow:0 2px 8px rgba(26,53,212,.35);
      display:flex; align-items:center; justify-content:center;
    }

    .grad-text {
      background:linear-gradient(90deg,#1a35d4,#00aaff);
      -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
    }
    .sidebar-card {
      background:#fff; border-radius:1.25rem; border:1.5px solid #eef1ff;
      box-shadow:0 4px 24px rgba(26,37,96,.08); padding:1.75rem;
    }
  `],
	template: `
    <section class="py-14 sm:py-16 bg-white" id="student-admission">
      <div class="container-custom">
        <div class="grid lg:grid-cols-3 gap-10 xl:gap-14">

          <div class="lg:col-span-2">

            <div class="flex items-start gap-4 mb-8 reveal" #revealRef>
              <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                   style="background:linear-gradient(135deg,#eef4ff,#dce8ff)">🎓</div>
              <div>
                <h2 class="font-display text-2xl sm:text-3xl font-bold text-[#1a2560] leading-tight">Student Admission</h2>
                <p class="text-gray-500 text-sm mt-1">University &amp; college application support across 5 countries</p>
              </div>
            </div>

            <p class="text-gray-600 leading-relaxed mb-8 text-base sm:text-lg reveal" #revealRef>
              Navigating global university admissions can be complex. Our education counsellors have
              relationships with over <strong class="text-[#1a2560]">50+ partner institutions</strong> across
              Australia, UK, Canada, USA and New Zealand, and will guide you from course selection right through to
              receiving and accepting your offer letter.
            </p>

            <div class="mb-8 reveal" #revealRef>
              <p class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Select destination:</p>
              <div class="flex flex-wrap gap-2">
                @for (c of countries; track c.code) {
                  <button class="country-tab" [class.active]="activeCountry() === c.code"
                          (click)="setCountry(c.code)">
                    <span aria-hidden="true">{{ c.flag }}</span>{{ c.name }}
                  </button>
                }
              </div>
            </div>

            <!-- Country-specific info -->
            <div class="bg-gradient-to-r from-[#eef4ff] to-[#e0edff] rounded-2xl p-5 sm:p-6 mb-8 reveal" #revealRef>
              <div class="flex items-center gap-3 mb-3">
                <span class="text-3xl" aria-hidden="true">{{ activeCountryData().flag }}</span>
                <h3 class="font-display font-bold text-[#1a2560] text-lg">{{ activeCountryData().name }} Admissions</h3>
              </div>
              <p class="text-[#1a35d4]/80 text-sm leading-relaxed mb-4">{{ activeCountryData().desc }}</p>
              <div class="grid sm:grid-cols-2 gap-3">
                @for (h of activeCountryData().highlights; track h) {
                  <div class="flex items-center gap-2 text-sm">
                    <svg class="w-4 h-4 flex-shrink-0" style="color:#1a35d4"
                         fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span class="text-[#1a2560] font-medium">{{ h }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- What we help with -->
            <h3 class="font-display text-xl font-bold text-[#1a2560] mb-5 reveal" #revealRef>What We Help You With</h3>
            <div class="stagger grid sm:grid-cols-2 gap-4 mb-10" #revealRef>
              @for (f of features; track f.title) {
                <div class="feat-card">
                  <div class="feat-icon">{{ f.icon }}</div>
                  <h4 class="font-bold text-[#1a2560] mb-1.5 text-sm sm:text-base">{{ f.title }}</h4>
                  <p class="text-gray-500 text-sm leading-relaxed">{{ f.desc }}</p>
                </div>
              }
            </div>

            <!-- Application timeline -->
            <h3 class="font-display text-xl font-bold text-[#1a2560] mb-6 reveal" #revealRef>Application Timeline</h3>
            <div class="space-y-5 mb-10 reveal" #revealRef>
              @for (t of timeline; track t.step) {
                <div class="timeline-item">
                  <div class="timeline-dot">
                    <svg class="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 8 8" aria-hidden="true">
                      <circle cx="4" cy="4" r="3"/>
                    </svg>
                  </div>
                  <div class="bg-white border border-[#eef1ff] rounded-xl p-4">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-[#eef4ff] text-[#1a35d4]">{{ t.timeframe }}</span>
                      <h4 class="font-bold text-[#1a2560] text-sm">{{ t.step }}</h4>
                    </div>
                    <p class="text-gray-500 text-xs sm:text-sm leading-relaxed">{{ t.desc }}</p>
                  </div>
                </div>
              }
            </div>

            <!-- Partner universities -->
            <h3 class="font-display text-xl font-bold text-[#1a2560] mb-5 reveal" #revealRef>
              Partner Universities &amp; Institutions
            </h3>
            <div class="stagger flex flex-wrap gap-2.5" #revealRef>
              @for (u of partnerUnis; track u.name) {
                <span class="uni-tag">
                  <span aria-hidden="true">{{ u.flag }}</span>{{ u.name }}
                </span>
              }
            </div>

          </div>

          <!-- ── Sidebar ── -->
          <div class="space-y-5">

            <!-- CTA card -->
            <div class="sidebar-card top-28 reveal-r" #revealRef>
              <div class="text-center mb-5">
                <div class="w-14 h-14 rounded-2xl bg-[#eef4ff] flex items-center justify-center text-2xl mx-auto mb-3">🎓</div>
                <h3 class="font-display text-lg font-bold text-[#1a2560] mb-1">Start Your Application</h3>
                <p class="text-gray-500 text-sm">Book a free session with our education counsellors.</p>
              </div>

              <a routerLink="/contact"
                 class="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-white text-sm mb-4 transition-all"
                 style="background:linear-gradient(135deg,#1a35d4,#00aaff);box-shadow:0 4px 16px rgba(26,53,212,.3)"
                 onmouseover="this.style.transform='translateY(-1px)'"
                 onmouseout="this.style.transform=''">
                Book Free Session
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </a>

              <ul class="space-y-2.5">
                @for (b of benefits; track b) {
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

            <!-- Stats card -->
            <div class="sidebar-card reveal-r" #revealRef>
              <h4 class="font-bold text-[#1a2560] text-sm uppercase tracking-wide mb-4">Our Track Record</h4>
              <div class="space-y-4">
                @for (s of admissionStats; track s.label) {
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">{{ s.label }}</span>
                    <span class="font-bold text-[#1a35d4] text-base">{{ s.value }}</span>
                  </div>
                  <div class="h-1.5 bg-[#eef1ff] rounded-full">
                    <div class="h-full rounded-full" [style.width]="s.pct"
                         style="background:linear-gradient(90deg,#1a35d4,#00aaff)"></div>
                  </div>
                }
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  `,
})
export class StudentAdmissionComponent implements AfterViewInit, OnDestroy {

	activeCountry = signal('AU');
	setCountry(code: string): void { this.activeCountry.set(code); }

	readonly countries = [
		{ code: 'AU', name: 'Australia',     flag: '🇦🇺' },
		{ code: 'UK', name: 'UK',            flag: '🇬🇧' },
		{ code: 'CA', name: 'Canada',        flag: '🇨🇦' },
		{ code: 'US', name: 'USA',           flag: '🇺🇸' },
		{ code: 'NZ', name: 'New Zealand',   flag: '🇳🇿' },
	];

	readonly countryInfo: Record<string, { name:string; flag:string; desc:string; highlights:string[] }> = {
		AU: { name:'Australia', flag:'🇦🇺',
			desc:'Australia is the 2nd most popular study destination with 40+ top-100 universities, post-study work rights, and clear PR pathways.',
			highlights:['IELTS / PTE required','Offer letter triggers CoE','Must obtain Student Visa (500)','OSHC mandatory for full stay'] },
		UK: { name:'United Kingdom', flag:'🇬🇧',
			desc:'The UK is home to Oxford, Cambridge, and 130+ world-class universities with a 2-year Graduate Route visa post-graduation.',
			highlights:['UKVI-approved English test','CAS issued by university','Student visa via UKVI portal','UKVI health surcharge applies'] },
		CA: { name:'Canada', flag:'🇨🇦',
			desc:'Canada offers 100+ Designated Learning Institutions, a 3-year PGWP, and one of the fastest PR pathways globally.',
			highlights:['IELTS / CELPIP / TEF accepted','DLI acceptance letter required','Study Permit application','PGWP up to 3 years post-study'] },
		US: { name:'United States', flag:'🇺🇸',
			desc:"The USA hosts the world's top-ranked universities with 4,000+ accredited institutions and STEM OPT opportunities.",
			highlights:['SAT / ACT / TOEFL required','I-20 issued by SEVP school','F-1 student visa (DS-160)','OPT & STEM OPT after graduation'] },
		NZ: { name:'New Zealand', flag:'🇳🇿',
			desc:"New Zealand offers 8 world-class universities, a safe welcoming environment, and a 3-year post-study work visa.",
			highlights:['IELTS / PTE accepted','Offer letter required','Student visa application','Post-Study Work Visa (3 yrs)'] },
	};

	activeCountryData = () => this.countryInfo[this.activeCountry()];

	readonly features = [
		{ icon: '🔍', title: 'Course Selection',    desc: 'We match your academic profile, career goals, and budget to the right courses and institutions.' },
		{ icon: '📋', title: 'Application Mgmt',    desc: 'We prepare and submit your complete application, ensuring all requirements are met precisely.' },
		{ icon: '💰', title: 'Scholarship Guidance', desc: "We identify scholarships you're eligible for and guide you through the application process." },
		{ icon: '✉️', title: 'Offer Letter Review',  desc: 'We review every condition in your offer letter and explain exactly what you need to do next.' },
		{ icon: '📑', title: 'Document Preparation', desc: 'SOPs, LORs, transcripts, financial evidence — we help you compile a compelling application package.' },
		{ icon: '🎯', title: 'Post-Offer Support',   desc: 'Visa lodgement, pre-departure checklist, and arrival support to make your transition smooth.' },
	];

	readonly timeline = [
		{ timeframe: '4–6 months', step: 'Course Research & Shortlisting', desc: 'We review your profile, goals, and eligibility to shortlist the best matching courses and institutions.' },
		{ timeframe: '3–4 months', step: 'Application Preparation',        desc: 'SOP writing, reference letters, academic transcripts, and all supporting documents are prepared.' },
		{ timeframe: '2–3 months', step: 'Application Lodgement',          desc: 'We submit your application and track it through the institution\'s admission portal.' },
		{ timeframe: '4–8 weeks',  step: 'Offer Letter & Acceptance',      desc: 'We review your conditional/unconditional offer and guide your formal acceptance.' },
		{ timeframe: '6–8 weeks',  step: 'Visa Application',               desc: 'We prepare and lodge your student visa application with the full supporting dossier.' },
	];

	readonly partnerUnis = [
		{ flag:'🇦🇺', name:'Uni. of Melbourne' },
		{ flag:'🇦🇺', name:'Monash University' },
		{ flag:'🇦🇺', name:'RMIT University' },
		{ flag:'🇦🇺', name:'La Trobe University' },
		{ flag:'🇦🇺', name:'Deakin University' },
		{ flag:'🇦🇺', name:'Swinburne Uni.' },
		{ flag:'🇬🇧', name:'Uni. of Manchester' },
		{ flag:'🇬🇧', name:'Kings College London' },
		{ flag:'🇬🇧', name:'Uni. of Edinburgh' },
		{ flag:'🇨🇦', name:'Uni. of Toronto' },
		{ flag:'🇨🇦', name:'UBC Vancouver' },
		{ flag:'🇺🇸', name:'Northeastern Uni.' },
		{ flag:'🇳🇿', name:'Uni. of Auckland' },
		{ flag:'🇳🇿', name:'Victoria Uni. of Wellington' },
	];

	readonly benefits = [
		'Free initial consultation',
		'No placement fees to students',
		'Access to 50+ institutions',
		'Application tracking portal',
		'Ongoing post-placement support',
	];

	readonly admissionStats = [
		{ label: 'Offer Letter Success', value: '99%', pct: '99%' },
		{ label: 'Visa Approval Rate',   value: '98%', pct: '98%' },
		{ label: 'Scholarship Secured',  value: '72%', pct: '72%' },
		{ label: 'Students Who Return',  value: '85%', pct: '85%' },
	];

	private _observer!: IntersectionObserver;

	constructor(private el: ElementRef, private zone: NgZone) {}

	ngAfterViewInit(): void {
		const els = this.el.nativeElement.querySelectorAll('.reveal,.reveal-l,.reveal-r,.stagger');
		this._observer = new IntersectionObserver(entries => {
			entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); this._observer.unobserve(e.target); } });
		}, { threshold: 0.12 });
		els.forEach((el: Element) => this._observer.observe(el));
	}

	ngOnDestroy(): void { if (this._observer) this._observer.disconnect(); }
}
