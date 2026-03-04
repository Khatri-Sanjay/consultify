import {
	Component, signal, ElementRef, AfterViewInit, OnDestroy, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
	selector: 'app-pte-ielts',
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

    /* exam tab */
    .exam-tab {
      display:flex; align-items:center; gap:.6rem;
      padding:.75rem 1.1rem; border-radius:.875rem;
      border:2px solid #eef1ff; background:#fff;
      color:#4b5563; font-size:.875rem; font-weight:600;
      cursor:pointer; transition:all .22s ease; flex:1; justify-content:center;
    }
    .exam-tab:hover { border-color:#1a35d4; color:#1a35d4; background:#eef4ff; }
    .exam-tab.active {
      background:linear-gradient(135deg,#1a35d4,#00aaff);
      border-color:transparent; color:#fff;
      box-shadow:0 4px 16px rgba(26,53,212,.3);
    }

    /* country tab */
    .c-tab {
      display:inline-flex; align-items:center; gap:.4rem;
      padding:.4rem .85rem; border-radius:999px;
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

    /* exam card */
    .exam-card {
      background:#fff; border-radius:1.25rem; border:1.5px solid #eef1ff;
      box-shadow:0 2px 18px rgba(26,37,96,.06);
      transition:all .25s ease; overflow:hidden;
    }

    /* package cards */
    .pkg-card {
      background:#fff; border-radius:1.25rem; border:2px solid #eef1ff;
      box-shadow:0 2px 18px rgba(26,37,96,.06);
      transition:all .25s ease; position:relative; overflow:hidden;
      display:flex; flex-direction:column;
    }
    .pkg-card:hover { transform:translateY(-4px); box-shadow:0 16px 44px rgba(26,37,96,.14); border-color:#1a35d4; }
    .pkg-card.featured { border-color:#1a35d4; box-shadow:0 8px 32px rgba(26,53,212,.2); }

    /* progress bar */
    .score-bar { height:6px; border-radius:999px; background:#eef1ff; overflow:hidden; }
    .score-fill { height:100%; border-radius:999px; background:linear-gradient(90deg,#1a35d4,#00aaff);
                  transition:width 1s ease; }

    /* sidebar */
    .sidebar-card {
      background:#fff; border-radius:1.25rem; border:1.5px solid #eef1ff;
      box-shadow:0 4px 24px rgba(26,37,96,.08); padding:1.75rem;
    }

    .grad-text {
      background:linear-gradient(90deg,#1a35d4,#00aaff);
      -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
    }
  `],
	template: `
    <section class="py-14 sm:py-16 bg-white" id="pte-ielts">
      <div class="container-custom">
        <div class="grid lg:grid-cols-3 gap-10 xl:gap-14">

          <!-- ── Main content ── -->
          <div class="lg:col-span-2">

            <!-- Header -->
            <div class="flex items-start gap-4 mb-8 reveal" #revealRef>
              <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                   style="background:linear-gradient(135deg,#f5f0ff,#ede9fe)">📝</div>
              <div>
                <h2 class="font-display text-2xl sm:text-3xl font-bold text-[#1a2560] leading-tight">
                  PTE / IELTS Preparation
                </h2>
                <p class="text-gray-500 text-sm mt-1">Achieve your target English proficiency score for any destination</p>
              </div>
            </div>

            <!-- Country filter -->
            <div class="mb-7 reveal" #revealRef>
              <p class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Destination country (score requirements vary):</p>
              <div class="flex flex-wrap gap-2">
                @for (c of countries; track c.code) {
                  <button class="c-tab" [class.active]="activeCountry() === c.code"
                          (click)="setCountry(c.code)">
                    <span aria-hidden="true">{{ c.flag }}</span>{{ c.name }}
                  </button>
                }
              </div>
            </div>

            <!-- Required scores info band -->
            <div class="bg-gradient-to-r from-[#eef4ff] to-[#e0edff] rounded-2xl p-5 sm:p-6 mb-8 reveal" #revealRef>
              <div class="flex items-center gap-3 mb-4">
                <span class="text-2xl" aria-hidden="true">{{ activeCountryInfo().flag }}</span>
                <h3 class="font-display font-bold text-[#1a2560]">
                  Required Scores for {{ activeCountryInfo().name }}
                </h3>
              </div>
              <div class="grid sm:grid-cols-2 gap-4">
                @for (req of activeCountryInfo().scoreReqs; track req.test) {
                  <div class="bg-white rounded-xl p-4">
                    <div class="flex items-center justify-between mb-2">
                      <span class="font-bold text-[#1a2560] text-sm">{{ req.test }}</span>
                      <span class="grad-text font-bold text-sm">{{ req.score }}</span>
                    </div>
                    <div class="score-bar">
                      <div class="score-fill" [style.width]="req.pct"></div>
                    </div>
                    <p class="text-gray-500 text-xs mt-1.5">{{ req.note }}</p>
                  </div>
                }
              </div>
            </div>

            <!-- Exam selector tabs -->
            <div class="flex gap-3 mb-7 reveal" #revealRef>
              @for (ex of exams; track ex.key) {
                <button class="exam-tab" [class.active]="activeExam() === ex.key"
                        (click)="setExam(ex.key)">
                  <span aria-hidden="true">{{ ex.icon }}</span>{{ ex.name }}
                </button>
              }
            </div>

            <!-- Exam detail card -->
            <div class="exam-card mb-10 reveal" #revealRef>
              <div class="p-6 sm:p-7"
                   style="background:linear-gradient(135deg,#0d1235 0%,#1a35d4 100%)">
                <div class="flex items-center gap-4 mb-3">
                  <span class="text-4xl" aria-hidden="true">{{ activeExamData().icon }}</span>
                  <div>
                    <h3 class="font-display text-xl font-bold text-white">{{ activeExamData().name }}</h3>
                    <p class="text-blue-200 text-sm">{{ activeExamData().subtitle }}</p>
                  </div>
                </div>
                <p class="text-blue-100/90 text-sm leading-relaxed">{{ activeExamData().desc }}</p>
              </div>
              <div class="p-6 sm:p-7">
                <div class="grid sm:grid-cols-2 gap-6 mb-6">
                  <!-- Key facts -->
                  <div>
                    <h4 class="font-bold text-[#1a2560] text-sm uppercase tracking-wide mb-3">Key Facts</h4>
                    <ul class="space-y-2">
                      @for (f of activeExamData().facts; track f) {
                        <li class="flex items-center gap-2 text-sm text-gray-600">
                          <svg class="w-4 h-4 flex-shrink-0" style="color:#1a35d4"
                               fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                          </svg>
                          {{ f }}
                        </li>
                      }
                    </ul>
                  </div>
                  <!-- Our results -->
                  <div>
                    <h4 class="font-bold text-[#1a2560] text-sm uppercase tracking-wide mb-3">Our Student Results</h4>
                    <div class="space-y-3">
                      @for (r of Array(activeExamData()?.results); track r.label) {
                        <div>
                          <div class="flex justify-between text-xs mb-1">
                            <span class="text-gray-500">{{ r.label }}</span>
                            <span class="font-bold text-[#1a35d4]">{{ r.value }}</span>
                          </div>
                          <div class="score-bar">
                            <div class="score-fill" [style.width]="r.pct"></div>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                </div>
                <!-- Improvement badge -->
                <div class="bg-[#eef4ff] rounded-xl p-4 flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                       style="background:linear-gradient(135deg,#1a35d4,#00aaff)">
                    <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                    </svg>
                  </div>
                  <div>
                    <span class="text-xs text-gray-500 block">Average improvement after coaching</span>
                    <span class="font-bold text-[#1a2560]">{{ activeExamData().improvement }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Coaching packages -->
            <!--<h3 class="font-display text-xl font-bold text-[#1a2560] mb-2 reveal" #revealRef>Coaching Packages</h3>
            <p class="text-gray-500 text-sm mb-6 reveal" #revealRef>
              All packages include both PTE and IELTS preparation. Select the intensity that fits your timeline.
            </p>
            <div class="stagger grid sm:grid-cols-3 gap-5 mb-10" #revealRef>
              @for (pkg of packages; track pkg.name) {
                <div class="pkg-card" [class.featured]="pkg.popular">

                  @if (pkg.popular) {
                    <div class="text-center py-2.5 text-xs font-bold text-white uppercase tracking-widest"
                         style="background:linear-gradient(135deg,#1a35d4,#00aaff)">
                      ⭐ Most Popular
                    </div>
                  }

                  <div class="p-6 sm:p-7 flex-1 flex flex-col">
                    <h4 class="font-display text-lg font-bold text-[#1a2560] mb-1">{{ pkg.name }}</h4>
                    <div class="font-display text-3xl font-bold grad-text mb-0.5">{{ pkg.price }}</div>
                    <div class="text-gray-400 text-xs mb-5">{{ pkg.duration }}</div>

                    <ul class="space-y-2 flex-1 mb-6">
                      @for (f of pkg.features; track f) {
                        <li class="flex items-start gap-2 text-sm text-gray-600">
                          <svg class="w-4 h-4 flex-shrink-0 mt-0.5" style="color:#00aaff"
                               fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                          </svg>
                          {{ f }}
                        </li>
                      }
                    </ul>

                    <a routerLink="/contact"
                       class="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm transition-all"
                       [style]="pkg.popular
                         ? 'background:linear-gradient(135deg,#1a35d4,#00aaff);color:#fff;box-shadow:0 4px 14px rgba(26,53,212,.3)'
                         : 'background:#fff;color:#1a35d4;border:2px solid #1a35d4'">
                      Get Started
                    </a>
                  </div>
                </div>
              }
            </div>-->

            <!-- FAQs -->
            <h3 class="font-display text-xl font-bold text-[#1a2560] mb-5 reveal" #revealRef>Frequently Asked Questions</h3>
            <div class="space-y-3 reveal" #revealRef>
              @for (faq of faqs; track faq.q; let i = $index) {
                <div class="border border-[#eef1ff] rounded-2xl overflow-hidden">
                  <button
                    class="w-full flex items-center justify-between px-5 py-4 text-left
                           font-semibold text-[#1a2560] text-sm hover:bg-[#f8f9ff] transition-colors"
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

            <!-- CTA card -->
            <div class="sidebar-card top-28 reveal-r" #revealRef>
              <div class="text-center mb-5">
                <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3"
                     style="background:linear-gradient(135deg,#f5f0ff,#ede9fe)">📝</div>
                <h3 class="font-display text-lg font-bold text-[#1a2560] mb-1">Book a Free Trial Lesson</h3>
                <p class="text-gray-500 text-sm">See how our coaching works before committing to a package.</p>
              </div>

              <a routerLink="/contact"
                 class="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-white text-sm mb-4 transition-all"
                 style="background:linear-gradient(135deg,#1a35d4,#00aaff);box-shadow:0 4px 16px rgba(26,53,212,.3)"
                 onmouseover="this.style.transform='translateY(-1px)'"
                 onmouseout="this.style.transform=''">
                Book Free Trial
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

            <!-- Test comparison mini table -->
            <div class="sidebar-card reveal-r" #revealRef>
              <h4 class="font-bold text-[#1a2560] text-sm uppercase tracking-wide mb-4">PTE vs IELTS — Quick Compare</h4>
              <div class="space-y-3 text-xs">
                @for (row of compareRows; track row.label) {
                  <div class="flex items-start justify-between gap-2">
                    <span class="text-gray-500 flex-shrink-0 w-20">{{ row.label }}</span>
                    <span class="text-[#1a35d4] font-semibold text-right">{{ row.pte }}</span>
                    <span class="text-gray-600 font-semibold text-right">{{ row.ielts }}</span>
                  </div>
                  <div class="h-px bg-[#eef1ff]"></div>
                }
                <div class="flex text-[10px] text-gray-400 justify-between px-0.5 pt-1">
                  <span></span><span class="font-bold text-[#1a35d4]">PTE</span>
                  <span class="font-bold text-gray-500">IELTS</span>
                </div>
              </div>
            </div>

            <!-- Score guide -->
            <div class="sidebar-card reveal-r" #revealRef>
              <h4 class="font-bold text-[#1a2560] text-sm uppercase tracking-wide mb-4">
                {{ activeCountryInfo().flag }} {{ activeCountryInfo().name }} Score Guide
              </h4>
              <div class="space-y-3">
                @for (s of activeCountryInfo().scoreGuide; track s.purpose) {
                  <div class="p-3 rounded-xl bg-[#f8f9ff] border border-[#eef1ff]">
                    <p class="text-xs font-bold text-[#1a2560] mb-1">{{ s.purpose }}</p>
                    <div class="flex gap-3">
                      <span class="text-xs text-gray-500">PTE: <strong class="text-[#1a35d4]">{{ s.pte }}</strong></span>
                      <span class="text-xs text-gray-500">IELTS: <strong class="text-[#1a35d4]">{{ s.ielts }}</strong></span>
                    </div>
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
export class PteIeltsComponent implements AfterViewInit, OnDestroy {

	activeExam    = signal('pte');
	activeCountry = signal('AU');
	openFaq       = signal<number | null>(null);

	setExam(key: string):    void { this.activeExam.set(key); }
	setCountry(code: string): void { this.activeCountry.set(code); }
	toggleFaq(i: number):   void { this.openFaq.set(this.openFaq() === i ? null : i); }

	readonly exams = [
		{ key: 'pte',   name: 'PTE Academic', icon: '💻' },
		{ key: 'ielts', name: 'IELTS',        icon: '📖' },
		{ key: 'toefl', name: 'TOEFL iBT',    icon: '🏛️' },
	];

	readonly examData: Record<string, any> = {
		pte: {
			icon: '💻', name: 'PTE Academic',
			subtitle: 'Computer-based · AI-scored · Results in 48 hrs',
			desc: "Pearson's PTE Academic is a computer-based English test, AI-scored with results in 48–72 hours. Accepted by all Australian & NZ institutions, UKVI, and Canadian DLIs.",
			facts: [
				'Computer-based, AI-scored (no examiner bias)',
				'Results in 48–72 hours',
				'Accepted by 3,000+ institutions worldwide',
				'Available year-round at 400+ test centres',
				'Unlimited retakes with no waiting period',
			],
			results: [
				{ label: 'Students who hit target score', value: '94%',  pct: '94%' },
				{ label: 'Average improvement',           value: '+18pts', pct: '72%' },
				{ label: 'Pass on first attempt',         value: '78%',  pct: '78%' },
			],
			improvement: '+15–20 PTE points in 6 weeks (avg.)',
		},
		ielts: {
			icon: '📖', name: 'IELTS Academic',
			subtitle: 'Paper & computer options · Examiner-scored',
			desc: "The world's most popular English test, jointly owned by British Council, IDP, and Cambridge. Available in paper and computer-delivered formats, accepted globally.",
			facts: [
				'Paper-based and computer-delivered options',
				'Results in 3–5 days (computer) / 13 days (paper)',
				'Globally recognised — 10,000+ institutions',
				'Examiner-marked speaking component',
				'Academic & General Training versions',
			],
			results: [
				{ label: 'Students who hit target band', value: '91%',  pct: '91%' },
				{ label: 'Average improvement',          value: '+1.0', pct: '80%' },
				{ label: 'Pass on first attempt',        value: '74%',  pct: '74%' },
			],
			improvement: '+0.5–1.0 band score in 6–8 weeks (avg.)',
		},
		toefl: {
			icon: '🏛️', name: 'TOEFL iBT',
			subtitle: 'Internet-based · ETS-scored · US universities',
			desc: "The TOEFL iBT is the most widely accepted test for US university admissions, administered by ETS. Also accepted in Canada, UK, and Australia.",
			facts: [
				'Internet-based test (iBT) or Home Edition',
				'Results in 4–8 days',
				'Accepted by 11,000+ US universities',
				'Reading, Listening, Speaking & Writing',
				'MyBest™ score option available',
			],
			results: [
				{ label: 'Students who hit target score', value: '89%',  pct: '89%' },
				{ label: 'Average improvement',           value: '+12pts', pct: '70%' },
				{ label: 'Pass on first attempt',         value: '71%',  pct: '71%' },
			],
			improvement: '+10–15 TOEFL points in 6–8 weeks (avg.)',
		},
	};

	activeExamData = computed(() => {
		return this.examData[this.activeExam()]
	});

	readonly countries = [
		{ code: 'AU', name: 'Australia',     flag: '🇦🇺' },
		{ code: 'UK', name: 'UK',            flag: '🇬🇧' },
		{ code: 'CA', name: 'Canada',        flag: '🇨🇦' },
		{ code: 'US', name: 'USA',           flag: '🇺🇸' },
		{ code: 'NZ', name: 'New Zealand',   flag: '🇳🇿' },
	];

	readonly countryInfo: Record<string, any> = {
		AU: {
			name: 'Australia', flag: '🇦🇺',
			scoreReqs: [
				{ test: 'PTE Academic',    score: '58+',    pct: '70%', note: 'Minimum for most universities; 65+ for G8' },
				{ test: 'IELTS Academic',  score: '6.0–6.5', pct: '72%', note: '6.5 overall with no band below 6.0 (typical)' },
				{ test: 'TOEFL iBT',       score: '79+',     pct: '65%', note: 'Minimum; 90+ for selective programs' },
				{ test: 'Student Visa 500',score: 'PTE 50 / IELTS 5.5', pct: '60%', note: 'Minimum for visa purposes' },
			],
			scoreGuide: [
				{ purpose: 'Student Visa (500)',    pte: '50+', ielts: '5.5+' },
				{ purpose: 'Most Universities',     pte: '58+', ielts: '6.0+' },
				{ purpose: 'Group of Eight (G8)',   pte: '65+', ielts: '6.5+' },
				{ purpose: 'Medicine / Law',        pte: '79+', ielts: '7.0+' },
			],
		},
		UK: {
			name: 'United Kingdom', flag: '🇬🇧',
			scoreReqs: [
				{ test: 'IELTS UKVI',      score: '5.5–6.5', pct: '72%', note: 'Must be UKVI-approved version of IELTS' },
				{ test: 'PTE Academic',    score: '59+',      pct: '70%', note: 'PTE accepted by most UK unis & UKVI' },
				{ test: 'TOEFL iBT',       score: '72+',      pct: '60%', note: 'Accepted by most universities; not UKVI Tier 4' },
				{ test: 'Student Visa',    score: 'B2 / IELTS 5.5+', pct: '60%', note: 'CEFR B2 level minimum for visa' },
			],
			scoreGuide: [
				{ purpose: 'Student Visa',        pte: 'B2 equiv.', ielts: '5.5+' },
				{ purpose: 'Most UK Universities',pte: '59+',        ielts: '6.0+' },
				{ purpose: 'Russell Group',       pte: '65+',        ielts: '6.5+' },
				{ purpose: 'Oxford / Cambridge',  pte: '76+',        ielts: '7.0+' },
			],
		},
		CA: {
			name: 'Canada', flag: '🇨🇦',
			scoreReqs: [
				{ test: 'IELTS Academic',  score: '6.0–6.5', pct: '72%', note: 'Most DLIs and study permit requirement' },
				{ test: 'CELPIP',          score: '7+',      pct: '70%', note: 'Canadian-specific; accepted by IRCC' },
				{ test: 'TOEFL iBT',       score: '83+',     pct: '66%', note: 'Accepted by most Canadian universities' },
				{ test: 'PTE Academic',    score: '58+',     pct: '68%', note: 'Accepted by select institutions' },
			],
			scoreGuide: [
				{ purpose: 'Study Permit',         pte: '58+', ielts: '6.0+' },
				{ purpose: 'Most DLIs',            pte: '60+', ielts: '6.5+' },
				{ purpose: 'Top Universities',     pte: '65+', ielts: '7.0+' },
				{ purpose: 'PR (Express Entry)',   pte: '79+', ielts: '7.0+' },
			],
		},
		US: {
			name: 'United States', flag: '🇺🇸',
			scoreReqs: [
				{ test: 'TOEFL iBT',       score: '79–100', pct: '72%', note: 'Primary test; score varies by university' },
				{ test: 'IELTS Academic',  score: '6.5–7.0', pct: '70%', note: 'Accepted by most US universities' },
				{ test: 'Duolingo',        score: '105+',    pct: '60%', note: 'Accepted by many but not all institutions' },
				{ test: 'PTE Academic',    score: '58+',     pct: '55%', note: 'Limited acceptance; check your institution' },
			],
			scoreGuide: [
				{ purpose: 'F-1 Student Visa',  pte: 'N/A', ielts: 'N/A (no language test needed)' },
				{ purpose: 'Most Universities', pte: '58+', ielts: '6.5+' },
				{ purpose: 'Top 50 Uni.',       pte: '65+', ielts: '7.0+' },
				{ purpose: 'Ivy League',        pte: '79+', ielts: '7.5+' },
			],
		},
		NZ: {
			name: 'New Zealand', flag: '🇳🇿',
			scoreReqs: [
				{ test: 'IELTS Academic',  score: '5.5–6.5', pct: '72%', note: 'Most NZ universities & visa requirement' },
				{ test: 'PTE Academic',    score: '42+',     pct: '60%', note: 'PTE 42 = IELTS 5.5 for visa purposes' },
				{ test: 'TOEFL iBT',       score: '46+',     pct: '55%', note: 'Accepted by all NZ universities' },
				{ test: 'Student Visa',    score: 'PTE 42 / IELTS 5.5', pct: '60%', note: 'Minimum visa requirement' },
			],
			scoreGuide: [
				{ purpose: 'Student Visa',       pte: '42+', ielts: '5.5+' },
				{ purpose: 'Most NZ Universities',pte: '50+', ielts: '6.0+' },
				{ purpose: 'Uni. of Auckland',   pte: '58+', ielts: '6.5+' },
				{ purpose: 'Medicine / Law',     pte: '65+', ielts: '7.0+' },
			],
		},
	};

	activeCountryInfo = () => this.countryInfo[this.activeCountry()];

	readonly packages = [
		{
			name: 'Starter', price: 'A$299', duration: '4 weeks · 8 sessions', popular: false,
			features: [
				'Group classes (max 8 students)',
				'Practice test set (3 full tests)',
				'Email support',
				'Score prediction report',
				'Study materials included',
			],
		},
		{
			name: 'Intensive', price: 'A$599', duration: '6 weeks · 18 sessions', popular: true,
			features: [
				'Small group coaching (max 5)',
				'Full practice test suite',
				'2× personal 1-on-1 sessions',
				'Speaking lab & mock interviews',
				'WhatsApp support Mon–Sat',
				'Score guarantee (terms apply)',
			],
		},
		{
			name: 'Premium 1-on-1', price: 'A$999', duration: '8 weeks · 24 sessions', popular: false,
			features: [
				'Fully personalised 1-on-1 sessions',
				'Unlimited mock tests',
				'Priority 24/7 support access',
				'Score guarantee (written)*',
				'Post-test debrief session',
				'Free retake module if needed',
			],
		},
	];

	readonly faqs = [
		{ q: 'Which test is better — PTE or IELTS?',
			a: 'Both are equally accepted by Australian universities and for visa purposes. PTE gives faster results (48–72 hrs) and is AI-scored, removing examiner subjectivity. IELTS has a human examiner for speaking, which some students find easier. We assess your learning style and recommend the best fit.' },
		{ q: 'How long does it take to improve my score?',
			a: 'Most students see measurable improvement within 4–6 weeks of structured coaching. The Intensive (6-week) package is our most popular choice for students with a specific target and timeline.' },
		{ q: 'Do I need to take the UKVI version of IELTS for a UK visa?',
			a: 'Yes. If you\'re applying for a UK Student Visa, you must take the UKVI-approved version of IELTS (IELTS for UKVI), not the standard Academic version. We guide you through booking the correct test.' },
		{ q: 'Is TOEFL accepted in Australia?',
			a: 'Yes, TOEFL iBT is accepted by all major Australian universities. However, it is not accepted for the Australian Student Visa (Subclass 500) — you\'ll need PTE, IELTS, or another approved test for visa purposes.' },
		{ q: 'What is the score guarantee?',
			a: 'Our Intensive and Premium packages include a conditional score guarantee: if you complete all sessions, submit all practice tests, and do not achieve your target score, we provide a free repeat of the coaching module.' },
	];

	readonly benefits = [
		'Free diagnostic assessment',
		'Both PTE & IELTS covered',
		'Flexible session timing',
		'Online & in-person options',
		'Score guarantee available',
	];

	readonly compareRows = [
		{ label: 'Format',    pte: 'Computer only', ielts: 'Paper or computer' },
		{ label: 'Results',   pte: '48–72 hours',   ielts: '3–13 days' },
		{ label: 'Scoring',   pte: 'AI (automated)', ielts: 'Human examiners' },
		{ label: 'Retakes',   pte: 'Anytime',        ielts: 'Next available date' },
		{ label: 'Fee (AUD)', pte: '~A$375',         ielts: '~A$395' },
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
