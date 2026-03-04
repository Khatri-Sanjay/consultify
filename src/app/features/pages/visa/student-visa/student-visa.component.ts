import {
	Component, signal, ElementRef, AfterViewInit, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
	selector: 'app-student-visa',
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

    /* country tab */
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

    /* requirement item */
    .req-item {
      background:#fff; border-radius:1rem; border:1.5px solid #eef1ff;
      box-shadow:0 2px 14px rgba(26,37,96,.05); padding:1.2rem 1.4rem;
      transition:all .2s ease;
    }
    .req-item:hover { border-color:#1a35d4; box-shadow:0 8px 24px rgba(26,37,96,.10); }

    /* timeline */
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

    /* checklist item */
    .cl-item {
      display:flex; align-items:flex-start; gap:.75rem;
      padding:1rem 1.2rem; border-radius:.875rem;
      background:#fff; border:1px solid #eef1ff;
      transition:border-color .18s;
    }
    .cl-item:hover { border-color:#1a35d4; }

    /* sidebar */
    .sidebar-card {
      background:#fff; border-radius:1.25rem; border:1.5px solid #eef1ff;
      box-shadow:0 4px 24px rgba(26,37,96,.08); padding:1.75rem;
    }

    .grad-text {
      background:linear-gradient(90deg,#1a35d4,#00aaff);
      -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
    }

    /* FAQ */
    .faq-btn { transition:background .15s; }
    .faq-btn:hover { background:#f8f9ff; }
    .rotate-180 { transform:rotate(180deg); }
  `],
	template: `
    <section class="py-14 sm:py-16 bg-white" id="student-visa">
      <div class="container-custom">
        <div class="grid lg:grid-cols-3 gap-10 xl:gap-14">

          <!-- ── Main ── -->
          <div class="lg:col-span-2">

            <!-- Header -->
            <div class="flex items-start gap-4 mb-8 reveal" #revealRef>
              <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 bg-[#eef4ff]">🎒</div>
              <div>
                <div class="inline-block text-[11px] font-bold px-3 py-1 rounded-full mb-1.5 grad-text border border-[#dce8ff]">
                  Student Visa
                </div>
                <h2 class="font-display text-2xl sm:text-3xl font-bold text-[#1a2560] leading-tight">
                  International Student Visa Guide
                </h2>
                <p class="text-gray-500 text-sm mt-1">Visa requirements &amp; process for your chosen destination</p>
              </div>
            </div>

            <!-- Country tabs -->
            <div class="mb-7 reveal" #revealRef>
              <p class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Select your destination country:</p>
              <div class="flex flex-wrap gap-2">
                @for (c of countries; track c.code) {
                  <button class="c-tab" [class.active]="activeCountry() === c.code"
                          (click)="setCountry(c.code)">
                    <span aria-hidden="true">{{ c.flag }}</span>{{ c.name }}
                  </button>
                }
              </div>
            </div>

            <!-- Country info header -->
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
              <!-- Quick stats -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                @for (s of activeData().quickStats; track s.label) {
                  <div class="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
                    <div class="font-bold text-white text-base">{{ s.value }}</div>
                    <div class="text-blue-200 text-xs mt-0.5">{{ s.label }}</div>
                  </div>
                }
              </div>
            </div>

            <!-- Eligibility requirements -->
            <h3 class="font-display text-xl font-bold text-[#1a2560] mb-5 reveal" #revealRef>
              Eligibility Requirements — {{ activeData().flag }} {{ activeData().country }}
            </h3>
            <div class="stagger space-y-3 mb-10" #revealRef>
              @for (r of activeData().requirements; track r.title) {
                <div class="req-item">
                  <div class="flex items-center gap-3 mb-1">
                    <span class="text-xl" aria-hidden="true">{{ r.icon }}</span>
                    <h4 class="font-bold text-[#1a2560] text-sm sm:text-base">{{ r.title }}</h4>
                    @if (r.mandatory) {
                      <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto flex-shrink-0"
                            style="background:#fef3c7;color:#92400e">Mandatory</span>
                    }
                  </div>
                  <p class="text-gray-500 text-sm leading-relaxed pl-8">{{ r.desc }}</p>
                </div>
              }
            </div>

            <!-- Document checklist -->
            <h3 class="font-display text-xl font-bold text-[#1a2560] mb-5 reveal" #revealRef>
              Document Checklist — {{ activeData().flag }} {{ activeData().country }}
            </h3>
            <div class="stagger grid sm:grid-cols-2 gap-3 mb-10" #revealRef>
              @for (doc of activeData().documents; track doc.name) {
                <div class="cl-item">
                  <div class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                       style="background:linear-gradient(135deg,#1a35d4,#00aaff)">
                    <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-[#1a2560]">{{ doc.name }}</p>
                    @if (doc.note) {
                      <p class="text-xs text-gray-400 mt-0.5">{{ doc.note }}</p>
                    }
                  </div>
                </div>
              }
            </div>

            <!-- Application timeline -->
            <h3 class="font-display text-xl font-bold text-[#1a2560] mb-6 reveal" #revealRef>Application Timeline</h3>
            <div class="space-y-4 mb-10 reveal" #revealRef>
              @for (t of activeData().timeline; track t.step) {
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

            <!-- FAQs -->
            <h3 class="font-display text-xl font-bold text-[#1a2560] mb-5 reveal" #revealRef>
              Frequently Asked Questions
            </h3>
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

            <!-- CTA -->
            <div class="sidebar-card top-28 reveal-r" #revealRef>
              <div class="text-center mb-5">
                <div class="w-14 h-14 rounded-2xl bg-[#eef4ff] flex items-center justify-center text-2xl mx-auto mb-3">🎒</div>
                <h3 class="font-display text-lg font-bold text-[#1a2560] mb-1">Start Your Visa Application</h3>
                <p class="text-gray-500 text-sm">Book a free assessment with our registered migration agents.</p>
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

            <!-- Key facts -->
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

            <!-- Related visas -->
            <div class="sidebar-card reveal-r" #revealRef>
              <h4 class="font-bold text-[#1a2560] text-sm uppercase tracking-wide mb-4">Related Visa Pathways</h4>
              <div class="space-y-2.5">
                @for (rv of relatedVisas; track rv.title) {
                  <a [routerLink]="rv.route"
                     class="flex items-center gap-3 p-3 rounded-xl border border-[#eef1ff]
                            hover:border-[#1a35d4] hover:bg-[#eef4ff] transition-all group">
                    <span class="text-xl flex-shrink-0" aria-hidden="true">{{ rv.icon }}</span>
                    <div class="min-w-0">
                      <p class="text-sm font-semibold text-[#1a2560] group-hover:text-[#1a35d4] transition-colors leading-snug">
                        {{ rv.title }}
                      </p>
                      <p class="text-xs text-gray-400 truncate">{{ rv.sub }}</p>
                    </div>
                    <svg class="w-4 h-4 text-gray-300 group-hover:text-[#1a35d4] flex-shrink-0 ml-auto transition-colors"
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
export class StudentVisaComponent implements AfterViewInit, OnDestroy {

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
			country: 'Australia', flag: '🇦🇺', subclass: 'Subclass 500',
			visaName: 'Student Visa (Subclass 500)',
			intro: 'Required for international students enrolled in a CRICOS-registered course of study in Australia. You must maintain enrolment and meet attendance requirements.',
			quickStats: [
				{ value: '4–8 wks', label: 'Processing time' },
				{ value: '98%',     label: 'Approval rate' },
				{ value: 'Full',    label: 'Work rights' },
				{ value: 'OSHC',    label: 'Health cover' },
			],
			requirements: [
				{ icon: '🏫', title: 'CoE — Confirmation of Enrolment',  mandatory: true,  desc: 'You must have a valid CoE from a CRICOS-registered institution before you can apply for your student visa.' },
				{ icon: '💰', title: 'Genuine Temporary Entrant (GTE)',   mandatory: true,  desc: 'You must demonstrate that you genuinely intend to stay temporarily in Australia for study purposes.' },
				{ icon: '📊', title: 'Financial Capacity',                mandatory: true,  desc: 'Evidence of sufficient funds to cover tuition, living costs (A$21,041/yr), and return airfare.' },
				{ icon: '📝', title: 'English Language Proficiency',      mandatory: true,  desc: 'PTE, IELTS, TOEFL or equivalent test showing required proficiency level for your course.' },
				{ icon: '🏥', title: 'Overseas Student Health Cover',     mandatory: true,  desc: 'OSHC must be purchased before lodging your visa application and maintained for the full duration.' },
				{ icon: '🩺', title: 'Health Examinations',               mandatory: false, desc: 'Depending on your country of citizenship, you may need to undertake a medical exam and chest X-ray.' },
			],
			documents: [
				{ name: 'Valid Passport',                    note: 'Must be valid for at least 6 months beyond intended stay' },
				{ name: 'Confirmation of Enrolment (CoE)',   note: 'From your CRICOS-registered institution' },
				{ name: 'English test results',              note: 'PTE, IELTS, TOEFL or equivalent' },
				{ name: 'Financial evidence',                note: 'Bank statements, scholarship letters, sponsor letters' },
				{ name: 'OSHC policy document',              note: 'Must cover full duration of your course' },
				{ name: 'GTE statement',                     note: 'Personal statement demonstrating genuine study intentions' },
				{ name: 'Academic transcripts',              note: 'All previous study records' },
				{ name: 'Health insurance clearance',        note: 'If applicable for your citizenship' },
			],
			timeline: [
				{ when: '4–6 months before',  step: 'Receive your CoE',         desc: 'Accept your offer from the institution and pay your deposit to receive your CoE.' },
				{ when: '3–4 months before',  step: 'Purchase OSHC',            desc: 'Select and purchase your OSHC policy from an approved Australian provider.' },
				{ when: '3 months before',    step: 'Complete health exams',    desc: 'If required for your citizenship, complete medical and chest X-ray with a panel physician.' },
				{ when: '2–3 months before',  step: 'Lodge visa application',   desc: 'Submit your complete application via ImmiAccount with all supporting documents.' },
				{ when: '4–8 weeks wait',     step: 'Processing period',        desc: 'Department of Home Affairs reviews your application. You may receive requests for additional info.' },
				{ when: 'Before travel',      step: 'Visa granted',             desc: 'You\'ll receive your visa grant notice by email. Review all conditions carefully.' },
			],
			faqs: [
				{ q: 'Can I work on a Student Visa (500)?',
					a: 'Yes. Once you begin your course, you can work up to 48 hours per fortnight during study and unlimited hours during scheduled course breaks.' },
				{ q: 'What is the GTE requirement?',
					a: 'The Genuine Temporary Entrant (GTE) requirement means you must demonstrate that your intention is to study temporarily in Australia, not to remain permanently through a student visa pathway.' },
				{ q: 'Can my family come with me?',
					a: 'Yes. Your spouse/partner and dependent children can apply as secondary applicants on your student visa. They receive the same work rights as the primary applicant if you are studying at masters or doctoral level.' },
				{ q: 'What happens if I change courses?',
					a: 'If you change to a different course or institution, you must obtain a new CoE and notify the Department. Some changes may require you to apply for a new visa.' },
			],
			keyFacts: [
				{ label: 'Visa subclass',        value: 'Subclass 500' },
				{ label: 'Application portal',   value: 'ImmiAccount (online)' },
				{ label: 'Processing time',      value: '4–8 weeks (approx.)' },
				{ label: 'Visa fee',             value: 'A$710 (approx.)' },
				{ label: 'Work rights',          value: '48 hrs/fortnight during study' },
				{ label: 'Health cover',         value: 'OSHC mandatory' },
				{ label: 'Min. financial req.',  value: 'A$21,041/yr living costs' },
			],
		},
		UK: {
			country: 'United Kingdom', flag: '🇬🇧', subclass: 'UK Student Visa',
			visaName: 'UK Student Visa (CAS-based)',
			intro: 'The UK Student Visa replaced the Tier 4 Student Visa. You need a Confirmation of Acceptance for Studies (CAS) from a UKVI-licensed sponsor to apply.',
			quickStats: [
				{ value: '3 wks',    label: 'Processing time' },
				{ value: '5 yrs',    label: 'Max. duration' },
				{ value: '20 hrs/wk',label: 'Term-time work' },
				{ value: 'IHS',      label: 'Health surcharge' },
			],
			requirements: [
				{ icon: '🏫', title: 'Confirmation of Acceptance for Studies (CAS)', mandatory: true,  desc: 'A unique CAS reference number issued by your UK-licensed higher education provider (sponsor).' },
				{ icon: '💰', title: 'Financial Requirements',                        mandatory: true,  desc: 'Evidence of £1,334/month for courses outside London or £1,334/month in London for up to 9 months.' },
				{ icon: '📝', title: 'English Language (UKVI-approved test)',         mandatory: true,  desc: 'Must be a UKVI Secure English Language Test (SELT) from an approved provider — standard IELTS not accepted for visa.' },
				{ icon: '🩺', title: 'Immigration Health Surcharge (IHS)',            mandatory: true,  desc: 'Must be paid upfront at £776/year as part of the visa application. Grants access to the NHS.' },
				{ icon: '📋', title: 'ATAS Clearance (selected subjects)',            mandatory: false, desc: 'Academic Technology Approval Scheme clearance required for certain sensitive subjects (e.g., advanced engineering, physics).' },
				{ icon: '🛂', title: 'Tuberculosis Test',                             mandatory: false, desc: 'Required if you are from certain countries and your course is 6 months or longer.' },
			],
			documents: [
				{ name: 'CAS Reference Number',         note: 'From your UK licensed higher education provider' },
				{ name: 'Valid Passport',               note: 'Must cover your intended stay duration' },
				{ name: 'UKVI English test result',     note: 'Must be a SELT from an approved centre' },
				{ name: 'Financial evidence',           note: 'Bank statements covering 28 consecutive days' },
				{ name: 'IHS payment receipt',          note: 'Immigration Health Surcharge paid online' },
				{ name: 'Passport-size photo',          note: 'Must meet UK visa photo requirements' },
				{ name: 'TB test certificate',          note: 'If applicable for your country of citizenship' },
				{ name: 'ATAS certificate',             note: 'If required for your specific subject of study' },
			],
			timeline: [
				{ when: '6 months before',     step: 'Receive unconditional offer', desc: 'Accept your offer from your UK institution and request your CAS reference number.' },
				{ when: '3 months before',     step: 'Take UKVI English test',      desc: 'Book and complete your UKVI-approved Secure English Language Test (SELT).' },
				{ when: '3 months before',     step: 'Prepare financial evidence',  desc: 'Ensure 28 consecutive days of bank statements showing required balance.' },
				{ when: '3 months before',     step: 'Apply for UK Student Visa',   desc: 'Apply online, pay IHS, book biometrics appointment at a Visa Application Centre.' },
				{ when: '3 weeks wait',        step: 'Biometrics & decision',       desc: 'Attend your VAC appointment. Standard processing is approximately 3 weeks.' },
				{ when: 'Before travel',       step: 'Collect BRP on arrival',      desc: 'Your Biometric Residence Permit (BRP) will be available for collection in the UK.' },
			],
			faqs: [
				{ q: 'Can I use regular IELTS for my UK Student Visa?',
					a: 'No. You must take the UKVI-approved version of IELTS (IELTS for UKVI), which is administered at specific approved centres. Standard IELTS from British Council or IDP is not accepted for visa purposes.' },
				{ q: 'What is the Immigration Health Surcharge?',
					a: 'The IHS is a fee paid upfront when applying for your UK visa, currently £776/year. It grants you access to the NHS during your stay. It must be paid as part of the online visa application process.' },
				{ q: 'How much money do I need to show for a UK Student Visa?',
					a: 'You must show you have held at least £1,334/month (outside London) or £1,334/month (London) for a minimum of 28 consecutive days, up to 9 months of course fees if less than this are held in your CAS.' },
				{ q: 'Can I work on a UK Student Visa?',
					a: 'Yes. Most UK Student Visa holders can work up to 20 hours per week during term time and full-time during vacations. Check the specific work restriction shown on your visa/BRP.' },
			],
			keyFacts: [
				{ label: 'Visa type',          value: 'UK Student Visa' },
				{ label: 'Application method', value: 'Online + biometrics' },
				{ label: 'Processing time',    value: '3 weeks (standard)' },
				{ label: 'Visa fee',           value: '£363 (outside UK)' },
				{ label: 'Work rights',        value: '20 hrs/week term-time' },
				{ label: 'Health surcharge',   value: '£776/year (IHS)' },
				{ label: 'Financial req.',     value: '£1,334/month for 28 days' },
			],
		},
		CA: {
			country: 'Canada', flag: '🇨🇦', subclass: 'Study Permit',
			visaName: 'Canada Study Permit',
			intro: 'A Study Permit is required to study at a Designated Learning Institution (DLI) in Canada for programs longer than 6 months. You may also need a Temporary Resident Visa (TRV) or eTA.',
			quickStats: [
				{ value: '8–12 wks', label: 'Processing time' },
				{ value: '20 hrs/wk',label: 'Off-campus work' },
				{ value: 'PGWP',     label: 'Post-grad pathway' },
				{ value: 'DLI req.',  label: 'Institution type' },
			],
			requirements: [
				{ icon: '🏫', title: 'Acceptance Letter from a DLI',  mandatory: true,  desc: 'A letter of acceptance from a Designated Learning Institution (DLI) is required to apply.' },
				{ icon: '💰', title: 'Financial Proof',               mandatory: true,  desc: 'Funds to cover tuition, living expenses (C$10,000/yr) and return transportation.' },
				{ icon: '📝', title: 'English / French Proficiency',  mandatory: true,  desc: 'IELTS, TOEFL, CELPIP, or TEF test results meeting your institution\'s requirements.' },
				{ icon: '🩺', title: 'Medical Examination',           mandatory: false, desc: 'Required if you are from a designated country or have lived in a designated country for 6+ months.' },
				{ icon: '🔒', title: 'Police Clearance',              mandatory: false, desc: 'May be required depending on your country of citizenship and intended study duration.' },
				{ icon: '🎯', title: 'SOP — Statement of Purpose',    mandatory: false, desc: 'A well-crafted statement explaining your study plans, financial situation, and intention to return home.' },
			],
			documents: [
				{ name: 'DLI Acceptance Letter',       note: 'From a Designated Learning Institution' },
				{ name: 'Valid Passport',              note: 'Valid for your entire study period' },
				{ name: 'English/French test results', note: 'IELTS, TOEFL, CELPIP or TEF' },
				{ name: 'Financial evidence',          note: 'Bank statements, sponsor letters, scholarship proof' },
				{ name: 'Statement of Purpose (SOP)',  note: 'Explaining study intent and return plans' },
				{ name: 'Provincial Attestation Letter', note: 'Required since 2024 for most provinces' },
				{ name: 'Police clearance certificate', note: 'If required for your citizenship' },
				{ name: 'Medical exam results',        note: 'If applicable for your country of citizenship' },
			],
			timeline: [
				{ when: '6 months before',   step: 'Receive DLI acceptance letter', desc: 'Receive your acceptance letter from your Canadian DLI and obtain your Provincial Attestation Letter (PAL).' },
				{ when: '5 months before',   step: 'Gather financial documents',    desc: 'Compile bank statements and financial evidence showing ability to support yourself.' },
				{ when: '4–5 months before', step: 'Create IRCC account & apply',   desc: 'Apply online via the IRCC portal, upload all documents, and pay the study permit fee.' },
				{ when: '8–12 weeks wait',   step: 'Processing period',             desc: 'IRCC processes your application. You may receive a Port of Entry (POE) Letter of Introduction.' },
				{ when: 'On arrival',        step: 'Get study permit stamped',      desc: 'Present your POE letter and documents to a CBSA officer, who will issue your physical study permit.' },
			],
			faqs: [
				{ q: 'What is a Provincial Attestation Letter (PAL)?',
					a: 'As of January 2024, most international students must obtain a PAL from the province where they plan to study before applying for a study permit. Quebec has its own equivalent (CAQ). We help you apply for the right provincial document.' },
				{ q: 'Can I work while studying in Canada?',
					a: 'Yes. Study permit holders can work up to 20 hours per week off-campus during regular academic sessions and full-time during scheduled breaks. As of November 2024, eligibility varies — we confirm the current rules for your situation.' },
				{ q: 'Do I need a TRV as well as a Study Permit?',
					a: 'Depending on your citizenship, you may need both a Study Permit and a Temporary Resident Visa (TRV) or Electronic Travel Authorization (eTA). Citizens of visa-exempt countries typically need only an eTA. We clarify exactly what you need.' },
				{ q: 'What is the PGWP and when can I apply?',
					a: 'The Post-Graduation Work Permit (PGWP) allows you to work in Canada for up to 3 years after completing your program at an eligible DLI. You must apply within 180 days of receiving your final marks.' },
			],
			keyFacts: [
				{ label: 'Permit type',       value: 'Study Permit (IRCC)' },
				{ label: 'Application portal', value: 'IRCC Online (MyCIC)' },
				{ label: 'Processing time',   value: '8–12 weeks (online)' },
				{ label: 'Permit fee',        value: 'C$150' },
				{ label: 'Work rights',       value: '20 hrs/week off-campus' },
				{ label: 'PAL required?',     value: 'Yes (most provinces, 2024+)' },
				{ label: 'PGWP eligible?',    value: 'Yes — from eligible DLIs' },
			],
		},
		US: {
			country: 'United States', flag: '🇺🇸', subclass: 'F-1 Visa',
			visaName: 'F-1 Student Visa',
			intro: 'The F-1 is the most common student visa for academic study at US universities and colleges. You must be enrolled full-time at a SEVP-approved institution and maintain your SEVIS record.',
			quickStats: [
				{ value: '3–5 wks', label: 'Processing time' },
				{ value: 'On campus', label: 'Work rights' },
				{ value: 'OPT/CPT', label: 'Work authorisation' },
				{ value: 'SEVIS',   label: 'Tracking system' },
			],
			requirements: [
				{ icon: '🏫', title: 'I-20 from SEVP-Approved School', mandatory: true,  desc: 'Your school\'s DSO issues a Form I-20 (Certificate of Eligibility), which is the basis for your F-1 visa application.' },
				{ icon: '💳', title: 'SEVIS Fee Payment (I-901)',       mandatory: true,  desc: 'You must pay the SEVIS fee (currently $350 for F-1) and obtain a SEVIS ID before your visa interview.' },
				{ icon: '📝', title: 'DS-160 Application Form',         mandatory: true,  desc: 'Complete the Online Nonimmigrant Visa Application (DS-160) on the US Department of State website.' },
				{ icon: '💰', title: 'Financial Evidence',              mandatory: true,  desc: 'Bank statements, scholarship letters or sponsor letters showing ability to fund your entire program.' },
				{ icon: '🎙️', title: 'Visa Interview at US Embassy',   mandatory: true,  desc: 'Schedule and attend an F-1 visa interview at the nearest US Embassy or Consulate in your home country.' },
				{ icon: '🔗', title: 'Ties to Home Country',            mandatory: true,  desc: 'Demonstrate strong ties to your home country that will compel you to return after completing your studies.' },
			],
			documents: [
				{ name: 'Form I-20',                     note: 'Issued by your SEVP-approved US school' },
				{ name: 'DS-160 confirmation page',      note: 'Completed online application form' },
				{ name: 'SEVIS fee receipt (I-901)',     note: 'Proof of SEVIS fee payment' },
				{ name: 'Valid Passport',                note: 'Valid for at least 6 months beyond intended stay' },
				{ name: 'Visa interview appointment confirmation', note: 'From the US Embassy or Consulate' },
				{ name: 'Financial documents',           note: 'Bank statements, scholarship/sponsor letters' },
				{ name: 'Academic transcripts',          note: 'All previous study records and English test results' },
				{ name: 'Passport-sized photo',          note: 'Must meet US visa photo specifications' },
			],
			timeline: [
				{ when: '6+ months before',   step: 'Receive I-20 from school',      desc: 'Once enrolled, your DSO will issue your Form I-20 with your SEVIS ID and program details.' },
				{ when: '5 months before',    step: 'Pay SEVIS fee',                 desc: 'Pay the I-901 SEVIS fee online at fmjfee.com and save your receipt.' },
				{ when: '5 months before',    step: 'Complete DS-160',               desc: 'Fill out the Online Nonimmigrant Visa Application DS-160 and download the confirmation page.' },
				{ when: '3–4 months before',  step: 'Schedule Embassy interview',   desc: 'Book your F-1 visa interview appointment at the nearest US Embassy or Consulate.' },
				{ when: 'Interview day',      step: 'Attend visa interview',         desc: 'Present all documents, answer the officer\'s questions about your program and funding plans.' },
				{ when: '3–5 weeks after',    step: 'Receive F-1 visa',             desc: 'If approved, your passport is returned with the F-1 visa stamp. You can enter the US up to 30 days before your program start date.' },
			],
			faqs: [
				{ q: 'Can I work in the US on an F-1 visa?',
					a: 'On-campus employment is permitted up to 20 hours per week during study. Off-campus employment is only available through authorised programs like CPT (Curricular Practical Training) or OPT (Optional Practical Training) after completing your first academic year.' },
				{ q: 'What is OPT and how does it work?',
					a: 'Optional Practical Training (OPT) allows F-1 students to work in the US in a field related to their major for up to 12 months after graduation (or up to 36 months for STEM graduates). You must apply for an EAD (Employment Authorisation Document) from USCIS.' },
				{ q: 'Can I attend my F-1 visa interview in any US Embassy?',
					a: 'F-1 interviews are typically conducted at the US Embassy or Consulate in your home country. It is possible to apply in a third country, but this can complicate the process. We advise on the best approach for your situation.' },
				{ q: 'What is the difference between F-1 and J-1 visas?',
					a: 'F-1 is for academic degree students. J-1 is for exchange visitors (including some students and research scholars) in government-recognised exchange programs. Most university students should apply for an F-1 visa.' },
			],
			keyFacts: [
				{ label: 'Visa type',         value: 'F-1 Nonimmigrant Student' },
				{ label: 'Application form',  value: 'DS-160 + I-20 + I-901' },
				{ label: 'Processing time',   value: '3–5 weeks post-interview' },
				{ label: 'Visa fee',          value: '$185 MRV fee + $350 SEVIS' },
				{ label: 'Work rights',       value: 'On-campus only (20 hrs/wk)' },
				{ label: 'OPT available?',    value: 'Yes — 12 months (36 STEM)' },
				{ label: 'Entry before start',value: 'Up to 30 days before I-20 start' },
			],
		},
		NZ: {
			country: 'New Zealand', flag: '🇳🇿', subclass: 'Student Visa',
			visaName: 'New Zealand Student Visa',
			intro: 'Required to study in New Zealand for programs longer than 3 months at a New Zealand Education Provider (NZEP). Visa conditions include health and character requirements.',
			quickStats: [
				{ value: '3–6 wks',  label: 'Processing time' },
				{ value: '20 hrs/wk', label: 'Work rights' },
				{ value: '3 yrs',    label: 'Post-study work' },
				{ value: 'NZeTA',    label: 'Entry permit' },
			],
			requirements: [
				{ icon: '🏫', title: 'Offer of Place from NZEP',          mandatory: true,  desc: 'A formal letter of offer from a New Zealand Education Provider, confirming your acceptance and course details.' },
				{ icon: '💰', title: 'Financial Requirements',             mandatory: true,  desc: 'Evidence of NZ$15,000+ per year (or per semester if shorter) to cover living and study costs.' },
				{ icon: '📝', title: 'English Language Proficiency',       mandatory: true,  desc: 'IELTS (5.0+), PTE (42+), or equivalent. Some institutions accept own English assessments.' },
				{ icon: '🏥', title: 'Comprehensive Health Insurance',     mandatory: true,  desc: 'Must have health insurance for the duration of your stay. NZ ACC covers injuries only, not illness.' },
				{ icon: '🩺', title: 'Medical Certificate',                mandatory: false, desc: 'Required if your course is 24 months or longer, or if you are from a country with high TB risk.' },
				{ icon: '👮', title: 'Police Certificate',                 mandatory: false, desc: 'Required for applicants aged 17 and over applying for a visa of more than 24 months.' },
			],
			documents: [
				{ name: 'Offer of Place letter',           note: 'From your New Zealand institution (NZEP)' },
				{ name: 'Valid Passport',                  note: 'Valid for at least 3 months beyond your intended stay' },
				{ name: 'English test results',            note: 'IELTS, PTE, or equivalent' },
				{ name: 'Financial evidence',              note: 'Bank statements, scholarship or sponsor letters' },
				{ name: 'Health insurance policy',         note: 'Comprehensive cover for full stay duration' },
				{ name: 'Medical certificate',             note: 'If required for your course length or nationality' },
				{ name: 'Police clearance',                note: 'If required for your age and visa duration' },
				{ name: 'Passport-sized photo',            note: 'Meeting Immigration NZ specifications' },
			],
			timeline: [
				{ when: '4–6 months before',  step: 'Receive your offer letter',     desc: 'Accept your offer from your NZ institution and receive your formal Offer of Place letter.' },
				{ when: '3–4 months before',  step: 'Purchase health insurance',     desc: 'Get comprehensive health insurance covering the full duration of your study and stay in NZ.' },
				{ when: '3 months before',    step: 'Apply online via Immigration NZ', desc: 'Complete your student visa application on the INZ online portal and upload all supporting documents.' },
				{ when: '3–6 weeks wait',     step: 'Processing period',             desc: 'Immigration NZ reviews your application. Additional health or character checks may be requested.' },
				{ when: 'Before travel',      step: 'Visa and NZeTA issued',         desc: 'Receive your visa grant. Most nationalities also need an NZeTA (Electronic Travel Authority) to board flights to NZ.' },
			],
			faqs: [
				{ q: 'Do I need an NZeTA as well as a student visa?',
					a: 'If you are a citizen of an NZeTA-required country, you need an NZeTA to board any flight to New Zealand — even if you already have a student visa. The NZeTA is a separate online application costing NZ$17 and is usually approved instantly.' },
				{ q: 'Can I work on a NZ Student Visa?',
					a: 'Yes. Student visa holders studying at degree level or above can work up to 20 hours per week during term and full-time during semester breaks. Partner/spouse visas for eligible partners also include open work rights.' },
				{ q: 'What is the Post-Study Work Visa?',
					a: 'The Post-Study Work Visa allows eligible graduates to work anywhere in NZ for up to 3 years after completing a qualification of at least Level 7 (bachelor\'s degree equivalent) at an approved NZ institution.' },
				{ q: 'Does NZ ACC cover me as an international student?',
					a: 'ACC (Accident Compensation Corporation) covers accidents, but not illness, pre-existing conditions, or routine medical care. This is why comprehensive health insurance is mandatory — it covers the gaps ACC doesn\'t.' },
			],
			keyFacts: [
				{ label: 'Visa type',          value: 'Student Visa (Immigration NZ)' },
				{ label: 'Application method', value: 'Immigration NZ online portal' },
				{ label: 'Processing time',    value: '3–6 weeks (approx.)' },
				{ label: 'Visa fee',           value: 'NZ$375 (approx.)' },
				{ label: 'Work rights',        value: '20 hrs/week (degree level+)' },
				{ label: 'Health insurance',   value: 'Mandatory comprehensive cover' },
				{ label: 'Post-study work',    value: 'Up to 3 years via PSWV' },
			],
		},
	};

	activeData = () => this.countryData[this.activeCountry()];

	readonly sidebarBenefits = [
		'Free initial assessment',
		'MARA registered agents',
		'All 5 countries covered',
		'Document review included',
		'98% visa success rate',
	];

	readonly relatedVisas = [
		{ icon: '🏛️', title: 'Graduate Visa',        sub: 'Post-study work rights',   route: '/visa/graduate-visa' },
		{ icon: '✈️', title: 'Tourist Visa',          sub: 'Visitor & tourism entry',  route: '/visa/tourist-visa' },
		{ icon: '🌍', title: 'Permanent Residency',   sub: 'Long-term pathway options', route: '/visa/permanent-residency' },
		{ icon: '📝', title: 'PTE / IELTS Prep',      sub: 'Achieve your required score', route: '/services/pte-ielts' },
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
}
