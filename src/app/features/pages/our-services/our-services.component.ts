import {
	Component, signal, OnInit, OnDestroy,
	ElementRef, AfterViewInit, NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
	selector: 'app-services',
	standalone: true,
	imports: [CommonModule, RouterModule],
	styles: [`
    :host { display: block; }

    /* ── Scroll reveal ─────────────────────────────────── */
    .reveal {
      opacity: 0; transform: translateY(28px);
      transition: opacity .6s ease, transform .6s ease;
    }
    .reveal.in { opacity: 1; transform: none; }

    .stagger > * {
      opacity: 0; transform: translateY(22px);
      transition: opacity .5s ease, transform .5s ease;
    }
    .stagger.in > *:nth-child(1) { transition-delay: .00s; opacity:1; transform:none; }
    .stagger.in > *:nth-child(2) { transition-delay: .08s; opacity:1; transform:none; }
    .stagger.in > *:nth-child(3) { transition-delay: .16s; opacity:1; transform:none; }
    .stagger.in > *:nth-child(4) { transition-delay: .24s; opacity:1; transform:none; }
    .stagger.in > *:nth-child(5) { transition-delay: .32s; opacity:1; transform:none; }
    .stagger.in > *:nth-child(6) { transition-delay: .40s; opacity:1; transform:none; }

    /* ── Service card ──────────────────────────────────── */
    .svc-card {
      background: #fff; border-radius: 1.1rem;
      border: 1.5px solid #eef1ff;
      box-shadow: 0 2px 18px rgba(26,37,96,.06);
      transition: all .25s ease; text-decoration: none; display: block;
    }
    .svc-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 16px 44px rgba(26,37,96,.14);
      border-color: #1a35d4;
    }
    .svc-icon {
      width: 3.5rem; height: 3.5rem; border-radius: 1rem;
      display: flex; align-items: center; justify-content: center;
      background: #eef4ff; font-size: 1.6rem;
      transition: background .2s;
    }
    .svc-card:hover .svc-icon { background: linear-gradient(135deg,#1a35d4,#00aaff); }

    /* ── Process step ──────────────────────────────────── */
    .step-box {
      text-align: center; padding: 2rem 1.5rem; border-radius: 1.25rem;
      background: #fff; border: 1.5px solid #eef1ff;
      box-shadow: 0 2px 18px rgba(26,37,96,.05);
      transition: all .25s ease; position: relative;
    }
    .step-box:hover { border-color:#1a35d4; transform:translateY(-4px); box-shadow:0 14px 36px rgba(26,37,96,.12); }
    .step-num-badge {
      width: 3.5rem; height: 3.5rem; border-radius: 1rem; margin: 0 auto 1.1rem;
      display: flex; align-items: center; justify-content: center;
      font-family: 'Playfair Display',serif; font-size: 1.4rem; font-weight: 700;
      color: #fff; background: linear-gradient(135deg,#1a2560,#1a35d4);
      box-shadow: 0 4px 14px rgba(26,53,212,.35);
    }
    .step-connector {
      position: absolute; top: 1.75rem;
      left: calc(50% + 1.9rem); right: calc(-50% + 1.9rem);
      height: 2px; background: linear-gradient(90deg,#1a35d4,#00aaff); opacity: .22;
    }

    /* ── Country filter pills ──────────────────────────── */
    .c-pill {
      display: inline-flex; align-items: center; gap: .4rem;
      padding: .4rem .9rem; border-radius: 999px;
      border: 1.5px solid #dde3ff; background: #fff;
      color: #4b5563; font-size: .8rem; font-family:'DM Sans',sans-serif;
      font-weight: 500; cursor: pointer; transition: all .2s ease; white-space: nowrap;
    }
    .c-pill:hover { border-color:#1a35d4; color:#1a35d4; background:#eef4ff; }
    .c-pill.active {
      background: linear-gradient(135deg,#1a35d4,#00aaff);
      border-color: transparent; color: #fff; font-weight: 600;
      box-shadow: 0 4px 14px rgba(26,53,212,.3);
    }

    .gn-subnav {
      background: #fff; border-bottom: 1px solid #eef1ff;
      position: sticky; top: 72px; z-index: 30;
    }
    @media(min-width:1024px){ .gn-subnav { top:80px; } }

    .gn-subnav-link {
      display: flex; align-items: center; gap: .4rem; flex-shrink: 0;
      padding: 1rem 0; border-bottom: 2px solid transparent;
      font-size: .875rem; font-weight: 600; color: #6b7280;
      text-decoration: none; white-space: nowrap;
      transition: color .15s, border-color .15s;
    }
    .gn-subnav-link:hover { color:#1a35d4; border-color:#b9d1ff; }
    .gn-subnav-link.active { color:#1a35d4; border-color:#1a35d4; }

    .why-card {
      background: #fff; border-radius: 1rem; border:1.5px solid #eef1ff;
      box-shadow:0 2px 16px rgba(26,37,96,.05); padding:1.75rem;
      transition: all .22s ease;
    }
    .why-card:hover { border-color:#1a35d4; box-shadow:0 12px 32px rgba(26,37,96,.11); }

    .grad-text {
      background: linear-gradient(90deg,#1a35d4,#00aaff);
      -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
    }
  `],
	template: `
    <section class="hero-bg py-16 sm:py-20 relative overflow-hidden" aria-label="Services hero">
      <div class="container-custom relative z-10">
        <nav aria-label="Breadcrumb" class="mb-6">
          <ol class="flex items-center gap-2 text-sm">
            <li><a routerLink="/" class="text-blue-300 hover:text-white transition-colors">Home</a></li>
            <li class="text-blue-400" aria-hidden="true">/</li>
            <li><span class="text-white font-medium" aria-current="page">Services</span></li>
          </ol>
        </nav>

        <div class="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm
                        border border-white/20 rounded-full px-4 py-2 text-blue-200 text-xs font-medium mb-6">
              <span class="w-2 h-2 rounded-full bg-[#00aaff]" style="animation:pdot 2s ease-in-out infinite" aria-hidden="true"></span>
              Comprehensive Global Services
            </div>
            <h1 class="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-5">
              Services Built for<br>
              <span class="grad-text">Your Journey</span>
            </h1>
            <p class="text-blue-100/90 text-base sm:text-xl max-w-xl leading-relaxed mb-8">
              End-to-end support for your global education and migration journey —
              across Australia, UK, Canada, USA, and New Zealand.
            </p>
            <div class="flex flex-wrap gap-3">
              <a routerLink="/contact"
                 class="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm transition-all"
                 style="background:linear-gradient(135deg,#f97316,#ea580c);box-shadow:0 4px 16px rgba(249,115,22,.38)"
                 onmouseover="this.style.transform='translateY(-1px)'"
                 onmouseout="this.style.transform=''">
                Book Free Consultation
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </a>
              <a routerLink="/visa" class="btn-outline-white text-sm py-3 px-6 justify-center">
                View Visa Services
              </a>
            </div>
          </div>

          <!-- Hero stats -->
          <div class="hidden lg:grid grid-cols-2 gap-4">
            @for (hs of heroStats; track hs.label) {
              <div class="bg-white/8 backdrop-blur border border-white/12 rounded-2xl p-5 text-center">
                <div class="font-display text-3xl font-bold mb-1 text-white">{{ hs.value }}</div>
                <div class="text-white text-sm">{{ hs.label }}</div>
              </div>
            }
          </div>
        </div>
      </div>
    </section>

    <nav class="gn-subnav" aria-label="Service sections">
      <div class="container-custom flex items-center gap-6 overflow-x-auto scrollbar-hide">
        <a routerLink="/services/student-admission" routerLinkActive="active"
           class="gn-subnav-link">🎓 Student Admission</a>
        <a routerLink="/services/health-insurance" routerLinkActive="active"
           class="gn-subnav-link">🏥 Health Insurance</a>
        <a routerLink="/services/pte-ielts" routerLinkActive="active"
           class="gn-subnav-link">📝 PTE / IELTS</a>
      </div>
    </nav>

    <router-outlet />

    <section class="py-16 sm:py-20 bg-[#f8f9ff]" aria-labelledby="all-services-heading">
      <div class="container-custom">

        <div class="text-center mb-10 reveal" #revealRef>
          <span class="section-tag">All Services</span>
          <h2 id="all-services-heading" class="section-title mb-4">Everything You Need in One Place</h2>
          <p class="section-subtitle max-w-2xl mx-auto">
            Our expert team handles every aspect of your global education and migration journey.
          </p>
        </div>

        <!-- Country filter -->
        <div class="flex items-center flex-wrap gap-2 justify-center mb-10 reveal" #revealRef>
          <span class="text-xs font-bold uppercase tracking-wider text-gray-400 mr-1">Filter by country:</span>
          @for (c of countryFilters; track c.code) {
            <button class="c-pill" [class.active]="activeFilter() === c.code"
                    (click)="setFilter(c.code)">
              <span aria-hidden="true">{{ c.flag }}</span>{{ c.name }}
            </button>
          }
        </div>

        <!-- Service grid -->
        <div class="stagger grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6" #revealRef>
          @for (svc of filteredServices(); track svc.title) {
            <a [routerLink]="svc.route" class="svc-card p-6 sm:p-8">
              <div class="flex items-start gap-4 mb-5">
                <div class="svc-icon flex-shrink-0">{{ svc.icon }}</div>
                <div class="min-w-0">
                  <h3 class="font-display text-lg font-bold text-[#1a2560] leading-snug mb-1">{{ svc.title }}</h3>
                  <div class="flex flex-wrap gap-1 mt-1">
                    @for (c of svc.countries; track c) {
                      <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#eef4ff] text-[#1a35d4]">{{ c }}</span>
                    }
                  </div>
                </div>
              </div>
              <p class="text-gray-500 text-sm leading-relaxed mb-5">{{ svc.desc }}</p>
              <ul class="space-y-1.5 mb-5">
                @for (f of svc.features.slice(0,3); track f) {
                  <li class="flex items-start gap-2 text-sm text-gray-600">
                    <svg class="w-4 h-4 mt-0.5 flex-shrink-0" style="color:#1a35d4"
                         fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                    </svg>
                    {{ f }}
                  </li>
                }
              </ul>
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

    <!-- ===== WHY CHOOSE US ===== -->
    <section class="py-16 sm:py-20 bg-white" aria-labelledby="why-heading">
      <div class="container-custom">
        <div class="text-center mb-10 sm:mb-14 reveal" #revealRef>
          <span class="section-tag">Why Global Next</span>
          <h2 id="why-heading" class="section-title mb-4">The Global Next Difference</h2>
          <p class="section-subtitle max-w-2xl mx-auto">
            Trusted by 5,000+ students across 5 countries — here's why they choose us.
          </p>
        </div>
        <div class="stagger grid sm:grid-cols-2 lg:grid-cols-4 gap-5" #revealRef>
          @for (w of whyUs; track w.title) {
            <div class="why-card">
              <div class="w-12 h-12 rounded-xl bg-[#eef4ff] flex items-center justify-center text-2xl mb-4">{{ w.icon }}</div>
              <h3 class="font-display font-bold text-[#1a2560] text-base mb-2">{{ w.title }}</h3>
              <p class="text-gray-500 text-sm leading-relaxed">{{ w.desc }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ===== HOW IT WORKS ===== -->
    <section class="py-16 sm:py-20 bg-[#f8f9ff]" aria-labelledby="hiw-heading">
      <div class="container-custom">
        <div class="text-center mb-10 sm:mb-14 reveal" #revealRef>
          <span class="section-tag">How It Works</span>
          <h2 id="hiw-heading" class="section-title mb-4">Simple 4-Step Process</h2>
          <p class="section-subtitle max-w-xl mx-auto">From first conversation to visa approval — we're with you every step.</p>
        </div>
        <div class="stagger grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6" #revealRef>
          @for (s of steps; track s.n; let last = $last) {
            <div class="step-box">
              @if (!last) { <div class="step-connector hidden lg:block"></div> }
              <div class="step-num-badge">{{ s.n }}</div>
              <div class="text-3xl mb-3" aria-hidden="true">{{ s.icon }}</div>
              <h3 class="font-display font-bold text-[#1a2560] mb-2 text-base sm:text-lg">{{ s.title }}</h3>
              <p class="text-gray-500 text-sm leading-relaxed">{{ s.desc }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ===== DESTINATIONS BANNER ===== -->
    <section class="py-16 sm:py-20 bg-[#090e2b]" aria-label="Destination countries">
      <div class="container-custom">
        <div class="text-center mb-10 reveal" #revealRef>
          <h2 class="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
            We Serve Students Heading to
          </h2>
          <p class="text-gray-400 max-w-xl mx-auto">Our services are fully tailored to your destination country's requirements.</p>
        </div>
        <div class="stagger grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4" #revealRef>
          @for (d of destinations; track d.code) {
            <div class="text-center bg-white/5 border border-white/8 hover:border-[#1a35d4]
                        hover:bg-white/10 rounded-2xl p-5 sm:p-6 transition-all duration-200
                        cursor-pointer group">
              <div class="text-4xl text-white sm:text-5xl mb-3 leading-none group-hover:scale-110 transition-transform" aria-hidden="true">{{ d.flag }}</div>
              <p class="font-bold text-white text-xs sm:text-sm">{{ d.name }}</p>
              <p class="text-[#00aaff] text-xs mt-1 font-semibold">{{ d.tag }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ===== CTA ===== -->
    <section class="py-16 sm:py-20 bg-cta-gradient" aria-label="Call to action">
      <div class="container-custom text-center reveal" #revealRef>
        <h2 class="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-5">
          Ready to Get Started?
        </h2>
        <p class="text-white/80 text-base sm:text-lg max-w-xl mx-auto mb-8">
          Book a free consultation and let our experts build your personalised education and migration roadmap.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a routerLink="/contact"
             class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white font-bold rounded-xl text-sm sm:text-base transition-all hover:-translate-y-px"
             style="color:#1a35d4;box-shadow:0 4px 20px rgba(255,255,255,.2)">
            Book Free Consultation
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </a>
          <a routerLink="/visa" class="btn-outline-white text-sm sm:text-base py-4 px-8 justify-center">
            Explore Visa Services
          </a>
        </div>
      </div>
    </section>
  `,
})
export class OurServicesComponent implements OnInit, AfterViewInit, OnDestroy {

	activeFilter = signal('ALL');

	readonly countryFilters = [
		{ code: 'ALL', name: 'All Countries', flag: '🌏' },
		{ code: 'AU',  name: 'Australia',     flag: '🇦🇺' },
		{ code: 'UK',  name: 'UK',            flag: '🇬🇧' },
		{ code: 'CA',  name: 'Canada',        flag: '🇨🇦' },
		{ code: 'US',  name: 'USA',           flag: '🇺🇸' },
		{ code: 'NZ',  name: 'New Zealand',   flag: '🇳🇿' },
	];

	setFilter(code: string): void { this.activeFilter.set(code); }

	readonly allServices = [
		{
			icon: '🎓', title: 'Student Admission',
			route: '/services/student-admission', countries: ['AU','UK','CA','US','NZ'],
			desc: 'End-to-end university and college application support — from course selection to offer letter acceptance.',
			features: ['Course selection & shortlisting','Application lodgement','Scholarship identification','Offer letter review'],
		},
		{
			icon: '🏥', title: 'Health Insurance (OSHC/UKVI)',
			route: '/services/health-insurance', countries: ['AU','UK'],
			desc: 'Expert advice on selecting and managing mandatory health cover for your destination country.',
			features: ['Provider comparison','Policy setup','Claims guidance','Renewals management'],
		},
		{
			icon: '📝', title: 'PTE / IELTS Preparation',
			route: '/services/pte-ielts', countries: ['AU','UK','CA','US','NZ'],
			desc: 'Structured coaching with expert trainers to help you achieve your target English proficiency score.',
			features: ['Diagnostic assessment','1-on-1 coaching','Mock tests & feedback','Speaking labs'],
		},
		{
			icon: '🛂', title: 'Student Visa Applications',
			route: '/visa/student-visa', countries: ['AU','UK','CA','US','NZ'],
			desc: 'Complete support for student visa lodgement with 98% success rate across all 5 destination countries.',
			features: ['Document checklist','Form preparation','Lodgement support','Status tracking'],
		},
		{
			icon: '🏛️', title: 'Post-Study Work Visa',
			route: '/visa/graduate-visa', countries: ['AU','UK','CA','NZ'],
			desc: 'Maximise your time abroad with expert guidance on post-graduation work rights.',
			features: ['485 Visa (AU)','Graduate Route (UK)','PGWP (Canada)','Post-Study (NZ)'],
		},
		{
			icon: '🌍', title: 'Permanent Residency',
			route: '/services/permanent-residency', countries: ['AU','CA','NZ'],
			desc: 'Strategic PR planning — from skills assessment to expression of interest and final lodgement.',
			features: ['Skills assessment','Points calculation','EOI submission','PR visa lodgement'],
		},
	];

	filteredServices = () => {
		const f = this.activeFilter();
		return f === 'ALL'
			? this.allServices
			: this.allServices.filter(s => s.countries.includes(f));
	};

	readonly heroStats = [
		{ value: '5,000+', label: 'Students Assisted' },
		{ value: '98%',    label: 'Visa Success Rate' },
		{ value: '5',      label: 'Destination Countries' },
		{ value: '50+',    label: 'Partner Universities' },
	];

	readonly whyUs = [
		{ icon: '🏆', title: 'Registered Agents', desc: 'MARA-registered migration agents with 10+ years of experience across all major destinations.' },
		{ icon: '🎯', title: '98% Success Rate', desc: 'Our meticulous approach and attention to detail delivers industry-leading visa approval rates.' },
		{ icon: '🌏', title: '5 Countries', desc: 'Deep expertise in Australia, UK, Canada, USA and New Zealand immigration systems.' },
		{ icon: '💬', title: '24/7 Support', desc: 'Dedicated support team available throughout your entire application journey.' },
	];

	readonly steps = [
		{ n: '01', icon: '💬', title: 'Free Consultation', desc: 'Discuss your goals and situation with our expert team — no obligation.' },
		{ n: '02', icon: '📋', title: 'Personalised Plan',  desc: 'Receive a tailored pathway and checklist built specifically for your case.' },
		{ n: '03', icon: '📁', title: 'Document Support',  desc: 'We guide you through gathering, preparing, and reviewing all required documents.' },
		{ n: '04', icon: '✅', title: 'Lodgement & Approval', desc: 'We lodge your application and support you right through to approval.' },
	];

	readonly destinations = [
		{ code: 'AU', name: 'Australia',     flag: '🇦🇺', tag: 'Subclass 500 · 485' },
		{ code: 'UK', name: 'United Kingdom', flag: '🇬🇧', tag: 'Student · Graduate Route' },
		{ code: 'CA', name: 'Canada',         flag: '🇨🇦', tag: 'Study Permit · PGWP' },
		{ code: 'US', name: 'United States',  flag: '🇺🇸', tag: 'F-1 · OPT · STEM OPT' },
		{ code: 'NZ', name: 'New Zealand',    flag: '🇳🇿', tag: 'Student · Skilled Migrant' },
	];

	private _observer!: IntersectionObserver;

	constructor(private elRef: ElementRef, private zone: NgZone) {
		}

	ngOnInit(): void {}

	ngAfterViewInit(): void {
		const els = this.elRef.nativeElement.querySelectorAll('.reveal, .stagger');
		this._observer = new IntersectionObserver(entries => {
			entries.forEach(e => {
				if (e.isIntersecting) { e.target.classList.add('in'); this._observer.unobserve(e.target); }
			});
		}, { threshold: 0.12 });
		els.forEach((el: Element) => this._observer.observe(el));
	}

	ngOnDestroy(): void { if (this._observer) this._observer.disconnect(); }
}
