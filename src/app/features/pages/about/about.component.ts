import { Component, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-about',
	standalone: true,
	imports: [CommonModule, RouterModule],
	styles: [`
    :host { display: block; }

    /* ── Scroll reveal ─────────────────────────────── */
    .reveal   { opacity:0; transform:translateY(28px);  transition:opacity .65s ease,transform .65s ease; }
    .reveal.in{ opacity:1; transform:none; }
    .reveal-l { opacity:0; transform:translateX(-28px); transition:opacity .65s ease,transform .65s ease; }
    .reveal-l.in{ opacity:1; transform:none; }
    .reveal-r { opacity:0; transform:translateX(28px);  transition:opacity .65s ease,transform .65s ease; }
    .reveal-r.in{ opacity:1; transform:none; }
    .stagger > * { opacity:0; transform:translateY(22px); transition:opacity .5s ease,transform .5s ease; }
    .stagger.in > * { opacity:1; transform:none; }
    .stagger.in > *:nth-child(1){ transition-delay:.00s; }
    .stagger.in > *:nth-child(2){ transition-delay:.09s; }
    .stagger.in > *:nth-child(3){ transition-delay:.18s; }
    .stagger.in > *:nth-child(4){ transition-delay:.27s; }
    .stagger.in > *:nth-child(5){ transition-delay:.36s; }
    .stagger.in > *:nth-child(6){ transition-delay:.45s; }

    /* ── Stat card ─────────────────────────────────── */
    .stat-card {
      background:#fff;
      border:1.5px solid #eef1ff;
      border-radius:1.25rem;
      box-shadow:0 2px 18px rgba(26,37,96,.06);
      padding:1.5rem 1.25rem;
      text-align:center;
      transition:all .22s ease;
    }
    .stat-card:hover {
      border-color:#1a35d4;
      box-shadow:0 10px 28px rgba(26,37,96,.11);
      transform:translateY(-3px);
    }

    /* ── Team card ─────────────────────────────────── */
    .team-card {
      background:#fff;
      border:1.5px solid #eef1ff;
      border-radius:1.25rem;
      box-shadow:0 2px 16px rgba(26,37,96,.05);
      padding:1.75rem 1.25rem;
      text-align:center;
      transition:all .25s ease;
      position:relative;
      overflow:hidden;
    }
    .team-card::before {
      content:'';
      position:absolute;
      inset:0;
      background:linear-gradient(135deg,transparent 60%,rgba(26,53,212,.04));
      opacity:0;
      transition:opacity .25s;
    }
    .team-card:hover { border-color:#1a35d4; box-shadow:0 14px 36px rgba(26,37,96,.13); transform:translateY(-4px); }
    .team-card:hover::before { opacity:1; }

    /* ── Value card ────────────────────────────────── */
    .value-card {
      background:#fff;
      border:1.5px solid #eef1ff;
      border-radius:1rem;
      padding:1.25rem;
      transition:all .22s ease;
    }
    .value-card:hover { border-color:#1a35d4; box-shadow:0 8px 24px rgba(26,37,96,.09); }

    /* ── Timeline ──────────────────────────────────── */
    .timeline-line {
      position:absolute;
      left:1.1rem;
      top:2.5rem;
      bottom:0;
      width:2px;
      background:linear-gradient(to bottom,#1a35d4,#00aaff,transparent);
    }
    .timeline-dot {
      width:1.25rem; height:1.25rem; border-radius:50%;
      background:linear-gradient(135deg,#1a35d4,#00aaff);
      border:3px solid #fff;
      box-shadow:0 0 0 2px #1a35d4;
      flex-shrink:0; margin-top:.15rem;
    }

    /* ── Accred pill ───────────────────────────────── */
    .accred-pill {
      background:#fff;
      border:1.5px solid #eef1ff;
      border-radius:99px;
      padding:.5rem 1.25rem;
      font-size:.8rem;
      font-weight:700;
      color:#1a2560;
      box-shadow:0 2px 10px rgba(26,37,96,.05);
      transition:all .2s ease;
    }
    .accred-pill:hover { border-color:#1a35d4; color:#1a35d4; transform:translateY(-2px); }

    /* ── Grad text ─────────────────────────────────── */
    .grad-text {
      background:linear-gradient(90deg,#1a35d4,#00aaff);
      -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
    }

    /* ── Avatar ring ───────────────────────────────── */
    .avatar-ring {
      width:4rem; height:4rem; border-radius:1.125rem;
      display:flex; align-items:center; justify-content:center;
      font-size:1.1rem; font-weight:800; color:#fff;
      margin:0 auto 1rem;
      position:relative;
    }
    .avatar-ring::after {
      content:'';
      position:absolute;
      inset:-3px;
      border-radius:1.375rem;
      background:linear-gradient(135deg,currentColor,transparent);
      opacity:.25;
      z-index:-1;
    }

    @keyframes pdot {
      0%,100%{opacity:1;transform:scale(1);}
      50%{opacity:.45;transform:scale(.82);}
    }
    @keyframes countUp {
      from { opacity:0; transform:scale(.8) translateY(10px); }
      to   { opacity:1; transform:none; }
    }
    .count-in { animation:countUp .5s cubic-bezier(.34,1.4,.64,1) both; }
  `],
	template: `
    <!-- ===== HERO ===== -->
    <section class="hero-bg py-20 sm:py-24 relative overflow-hidden" aria-label="About hero">
      <div class="container-custom relative z-10">

        <nav aria-label="Breadcrumb" class="mb-6">
          <ol class="flex items-center gap-2 text-sm">
            <li><a routerLink="/" class="text-blue-300 hover:text-white transition-colors">Home</a></li>
            <li class="text-blue-400" aria-hidden="true">/</li>
            <li><span class="text-white font-medium" aria-current="page">About Us</span></li>
          </ol>
        </nav>

        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm
                        border border-white/20 rounded-full px-4 py-2 text-blue-200 text-xs font-medium mb-6">
              <span class="w-2 h-2 rounded-full bg-[#00aaff]"
                    style="animation:pdot 2s ease-in-out infinite" aria-hidden="true"></span>
              Trusted by thousands of Nepali students
            </div>
            <h1 class="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-5">
              About<br>
              <span class="grad-text">Global Next</span>
            </h1>
            <p class="text-blue-100/90 text-base sm:text-xl max-w-xl leading-relaxed mb-8">
              Nepal's leading study abroad consultancy — helping ambitious students from Kathmandu and
              across the country reach universities in Australia, UK, Canada, USA, and New Zealand since 2015.
            </p>
            <div class="flex flex-wrap gap-3">
              <a routerLink="/contact"
                 class="inline-flex items-center gap-2 font-bold text-sm px-5 py-3 rounded-xl text-white transition-all hover:-translate-y-px"
                 style="background:linear-gradient(135deg,#1a35d4,#00aaff);box-shadow:0 4px 18px rgba(26,53,212,.35)">
                Book Free Consultation
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </a>
              <a routerLink="/services"
                 class="inline-flex items-center gap-2 bg-white/12 backdrop-blur border border-white/20
                        text-white font-semibold text-sm px-5 py-3 rounded-xl hover:bg-white/20 transition-all">
                Our Services
              </a>
            </div>
          </div>

          <!-- Hero stats grid -->
          <div class="hidden lg:grid grid-cols-2 gap-4">
            @for (s of heroStats; track s.label) {
              <div class="bg-white/8 backdrop-blur border border-white/12 rounded-2xl p-5">
                <div class="text-2xl mb-2" aria-hidden="true">{{ s.icon }}</div>
                <div class="font-display text-3xl font-bold text-white mb-1">{{ s.value }}</div>
                <div class="text-blue-200 text-sm leading-snug">{{ s.label }}</div>
              </div>
            }
          </div>
        </div>
      </div>
    </section>

    <!-- ===== STATS BAR ===== -->
    <section class="py-10 bg-[#f8f9ff]" aria-label="Key statistics">
      <div class="container-custom">
        <div class="stagger grid grid-cols-2 lg:grid-cols-4 gap-4" #revealRef>
          @for (s of stats; track s.label) {
            <div class="stat-card">
              <div class="text-2xl mb-2" aria-hidden="true">{{ s.icon }}</div>
              <div class="font-display text-3xl font-bold grad-text mb-1">{{ s.value }}</div>
              <div class="text-gray-500 text-sm font-medium">{{ s.label }}</div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ===== OUR STORY ===== -->
    <section class="py-16 sm:py-20 bg-white" aria-labelledby="story-heading">
      <div class="container-custom">
        <div class="grid lg:grid-cols-2 gap-14 items-start">

          <!-- Story text -->
          <div class="reveal-l" #revealRef>
            <span class="section-tag">Our Story</span>
            <h2 id="story-heading" class="section-title mt-3 mb-6">
              Empowering Nepali Students<br>
              <span class="grad-text">Since 2015</span>
            </h2>
            <p class="text-gray-600 leading-relaxed mb-5">
              Global Next was founded in Kathmandu with a single mission: to make quality education abroad
              genuinely accessible for Nepali students. What began as a small team of passionate advisors
              has grown into Nepal's most trusted study abroad consultancy, with thousands of successful
              placements across five countries.
            </p>
            <p class="text-gray-600 leading-relaxed mb-5">
              We understand the unique challenges Nepali students face — navigating complex visa requirements,
              choosing the right institution, managing finances, and preparing for life in a new country.
              Our consultants have walked this path themselves, giving us the empathy and insight to guide
              you every step of the way.
            </p>
            <p class="text-gray-600 leading-relaxed mb-8">
              From our office in New Baneshwor, Kathmandu, we serve students from all 77 districts of Nepal —
              in person, online, and over the phone. Our 98% visa success rate speaks to the quality and
              care we bring to every single application.
            </p>

            <div class="grid grid-cols-2 gap-4 mb-8">
              @for (v of values; track v.title) {
                <div class="value-card flex items-start gap-3">
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                       style="background:linear-gradient(135deg,#eef4ff,#dce8ff)">
                    {{ v.icon }}
                  </div>
                  <div>
                    <h3 class="font-bold text-[#1a2560] text-sm mb-0.5">{{ v.title }}</h3>
                    <p class="text-gray-500 text-xs leading-relaxed">{{ v.desc }}</p>
                  </div>
                </div>
              }
            </div>

            <a routerLink="/contact"
               class="inline-flex items-center gap-2 font-bold text-sm px-6 py-3.5 rounded-xl text-white transition-all hover:-translate-y-px"
               style="background:linear-gradient(135deg,#1a35d4,#00aaff);box-shadow:0 4px 16px rgba(26,53,212,.3)">
              Talk to Our Team
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </a>
          </div>

          <!-- Timeline -->
          <div class="reveal-r" #revealRef>
            <h3 class="font-display text-xl font-bold text-[#1a2560] mb-8">Our Journey</h3>
            <div class="relative pl-8">
              <div class="timeline-line" aria-hidden="true"></div>
              <div class="space-y-8">
                @for (t of timeline; track t.year) {
                  <div class="flex gap-4 relative">
                    <div class="timeline-dot" aria-hidden="true"></div>
                    <div class="flex-1 pb-1">
                      <div class="flex items-center gap-3 mb-1.5">
                        <span class="font-display text-xs font-bold px-2.5 py-0.5 rounded-full text-white"
                              style="background:linear-gradient(135deg,#1a35d4,#00aaff)">
                          {{ t.year }}
                        </span>
                        <h4 class="font-bold text-[#1a2560] text-sm">{{ t.title }}</h4>
                      </div>
                      <p class="text-gray-500 text-xs leading-relaxed">{{ t.desc }}</p>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- ===== TEAM ===== -->
    <section class="py-16 sm:py-20 bg-[#f8f9ff]" aria-labelledby="team-heading">
      <div class="container-custom">
        <div class="text-center mb-12 reveal" #revealRef>
          <span class="section-tag">People</span>
          <h2 id="team-heading" class="section-title mt-3 mb-3">Meet Our Team</h2>
          <p class="section-subtitle max-w-xl mx-auto">
            A dedicated group of education counsellors and visa specialists who are passionate about
            helping Nepali students achieve their international study goals.
          </p>
        </div>

        <div class="stagger grid grid-cols-2 lg:grid-cols-4 gap-5" #revealRef>
          @for (m of team; track m.name) {
            <div class="team-card">
              <div class="avatar-ring" [style.background]="m.color">
                {{ m.initials }}
              </div>
              <h4 class="font-bold text-[#1a2560] text-sm mb-0.5">{{ m.name }}</h4>
              <p class="text-xs font-semibold mb-1.5" style="color:#1a35d4">{{ m.role }}</p>
              <p class="text-gray-400 text-xs mb-3">{{ m.cred }}</p>
              <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
                   style="background:#eef4ff; color:#1a35d4">
                {{ m.badge }}
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ===== WHY CHOOSE US ===== -->
    <section class="py-16 sm:py-20 bg-white" aria-labelledby="why-heading">
      <div class="container-custom">
        <div class="grid lg:grid-cols-2 gap-14 items-center">

          <!-- Left: dark card -->
          <div class="rounded-3xl p-8 sm:p-10 reveal-l" #revealRef
               style="background:linear-gradient(135deg,#0d1235 0%,#1a35d4 100%)">
            <span class="inline-block text-xs font-bold text-blue-300 uppercase tracking-widest mb-4">
              Why Global Next?
            </span>
            <h2 id="why-heading" class="font-display text-2xl sm:text-3xl font-bold text-white mb-6 leading-tight">
              Nepal's Most Trusted<br>Study Abroad Partner
            </h2>
            <p class="text-blue-200 text-sm leading-relaxed mb-8">
              We don't just process applications — we invest in your future. From the first free consultation
              to post-arrival support, we're by your side every step of the way.
            </p>
            <div class="space-y-4">
              @for (r of reasons; track r.title) {
                <div class="flex items-start gap-3">
                  <div class="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-sm flex-shrink-0">
                    {{ r.icon }}
                  </div>
                  <div>
                    <h4 class="font-bold text-white text-sm mb-0.5">{{ r.title }}</h4>
                    <p class="text-blue-300 text-xs leading-relaxed">{{ r.desc }}</p>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Right: feature grid -->
          <div class="stagger grid grid-cols-2 gap-4 reveal-r" #revealRef>
            @for (f of features; track f.title) {
              <div class="bg-[#f8f9ff] rounded-2xl border border-[#eef1ff] p-5 hover:border-[#1a35d4] hover:bg-white transition-all">
                <div class="text-2xl mb-3">{{ f.icon }}</div>
                <h4 class="font-bold text-[#1a2560] text-sm mb-1">{{ f.title }}</h4>
                <p class="text-gray-500 text-xs leading-relaxed">{{ f.desc }}</p>
              </div>
            }
          </div>

        </div>
      </div>
    </section>

    <!-- ===== ACCREDITATIONS ===== -->
    <section class="py-14 bg-[#f8f9ff]" aria-labelledby="accred-heading">
      <div class="container-custom">
        <div class="text-center mb-8 reveal" #revealRef>
          <h2 id="accred-heading" class="font-display text-2xl font-bold text-[#1a2560] mb-2">
            Accreditations & Partnerships
          </h2>
          <p class="text-gray-500 text-sm">Officially recognised and partnered with leading bodies worldwide.</p>
        </div>
        <div class="stagger flex flex-wrap justify-center gap-3" #revealRef>
          @for (a of accreditations; track a.name) {
            <div class="accred-pill flex items-center gap-2">
              <span>{{ a.icon }}</span>
              {{ a.name }}
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ===== CTA ===== -->
    <section class="py-14 sm:py-16 bg-cta-gradient" aria-label="Call to action">
      <div class="container-custom text-center reveal" #revealRef>
        <h2 class="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-5">
          Ready to Begin Your Journey?
        </h2>
        <p class="text-white/80 text-base sm:text-lg max-w-xl mx-auto mb-8">
          Join thousands of Nepali students who trusted Global Next to guide them to the world's best universities.
          Your free consultation is just one click away.
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
          <a routerLink="/services" class="btn-outline-white text-sm sm:text-base py-4 px-8 justify-center">
            Explore Services
          </a>
        </div>
      </div>
    </section>
	`,
})
export class AboutComponent implements AfterViewInit, OnDestroy {

	// ── Data ───────────────────────────────────────────────────

	readonly heroStats = [
		{ icon: '🎓', value: '5,000+', label: 'Students placed abroad' },
		{ icon: '🌏', value: '5',      label: 'Destination countries' },
		{ icon: '🎯', value: '98%',    label: 'Visa success rate' },
		{ icon: '📅', value: '9+',     label: 'Years of experience' },
	];

	readonly stats = [
		{ icon: '🎓', value: '5,000+', label: 'Students Placed'      },
		{ icon: '🤝', value: '200+',   label: 'University Partners'  },
		{ icon: '🎯', value: '98%',    label: 'Visa Success Rate'    },
		{ icon: '⭐', value: '4.9/5',  label: 'Student Satisfaction' },
	];

	readonly values = [
		{ icon: '🎯', title: 'Expert Guidance',       desc: 'Experienced counsellors who know every destination country inside-out' },
		{ icon: '🤝', title: 'Personalised Service',  desc: 'Tailored advice based on your background, budget, and goals' },
		{ icon: '🔒', title: 'Full Transparency',     desc: 'Clear fees, honest timelines — no hidden surprises, ever' },
		{ icon: '⚡', title: 'Fast Processing',        desc: 'Streamlined workflows so your application moves without delays' },
	];

	readonly timeline = [
		{
			year: '2015',
			title: 'Founded in Kathmandu',
			desc: 'Global Next opens its doors in New Baneshwor with a team of 3 passionate advisors and a dream to help Nepali students study abroad.',
		},
		{
			year: '2017',
			title: 'Australia & UK Specialisation',
			desc: 'We become official partners with 30+ Australian universities and open a dedicated UK admissions desk.',
		},
		{
			year: '2019',
			title: 'PTE & IELTS Centre Launched',
			desc: 'Our in-house test preparation centre opens, offering full-length mock tests, coaching classes, and score guarantee programmes.',
		},
		{
			year: '2021',
			title: 'Canada & USA Expansion',
			desc: 'We add Canadian Study Permits and US F-1 visa services, plus New Zealand, rounding out our five-country offering.',
		},
		{
			year: '2023',
			title: '5,000 Students Milestone',
			desc: 'We celebrate placing our 5,000th student abroad — a milestone reflecting the trust Nepali families place in Global Next.',
		},
		{
			year: '2025',
			title: 'Nationwide Reach',
			desc: 'With online consultations now available, we serve students from all 77 districts of Nepal and Nepali diaspora worldwide.',
		},
	];

	readonly team = [
		{
			name: 'Rajesh Shrestha',   initials: 'RS',
			role: 'Founder & Director',
			cred: 'MA Education — University of Melbourne',
			badge: '🇦🇺 Australia Expert',
			color: '#1d4ed8',
		},
		{
			name: 'Sujata Adhikari',   initials: 'SA',
			role: 'Head of Admissions',
			cred: 'BSc. Hons — University of Leeds',
			badge: '🇬🇧 UK Expert',
			color: '#059669',
		},
		{
			name: 'Bikash Tamang',     initials: 'BT',
			role: 'Canada & USA Advisor',
			cred: 'MBA — University of Toronto',
			badge: '🇨🇦 Canada Expert',
			color: '#d97706',
		},
		{
			name: 'Anita Gurung',      initials: 'AG',
			role: 'PTE / IELTS Trainer',
			cred: 'CELTA Certified — British Council',
			badge: '📝 Test Prep Expert',
			color: '#7c3aed',
		},
		{
			name: 'Dipesh Khadka',     initials: 'DK',
			role: 'Visa Consultant',
			cred: '8+ yrs Australian visa experience',
			badge: '🎒 Visa Specialist',
			color: '#dc2626',
		},
		{
			name: 'Prativa Rai',       initials: 'PR',
			role: 'Student Support Officer',
			cred: 'Pre-departure & arrival support',
			badge: '💛 Student Care',
			color: '#0284c7',
		},
		{
			name: 'Sujan Maharjan',    initials: 'SM',
			role: 'NZ & Pacific Advisor',
			cred: 'BBA — University of Auckland',
			badge: '🇳🇿 NZ Expert',
			color: '#065f46',
		},
		{
			name: 'Roshani Paudel',    initials: 'RP',
			role: 'Finance & Scholarship',
			cred: 'Education Finance Specialist',
			badge: '💰 Scholarships',
			color: '#9333ea',
		},
	];

	readonly reasons = [
		{
			icon: '🏆',
			title: '98% Visa Success Rate',
			desc: 'Our meticulous preparation and deep knowledge of immigration requirements translates into results.',
		},
		{
			icon: '🎓',
			title: '200+ University Partners',
			desc: 'Direct partnerships mean faster responses, fee waivers, and exclusive scholarship access for our students.',
		},
		{
			icon: '🗣️',
			title: 'Nepali-speaking Counsellors',
			desc: 'Communicate in Nepali or English — no language barriers when planning your future.',
		},
		{
			icon: '🛡️',
			title: 'End-to-end Support',
			desc: 'From course selection to post-arrival settlement — we\'re with you every step of the journey.',
		},
	];

	readonly features = [
		{ icon: '🎯', title: 'Free Consultation',     desc: 'No-cost initial session with a senior counsellor — no obligation' },
		{ icon: '📋', title: 'Document Checklist',    desc: 'Comprehensive, country-specific checklists so nothing is missed' },
		{ icon: '✈️', title: 'Pre-Departure Briefing', desc: 'Know exactly what to expect before you board your flight' },
		{ icon: '📱', title: 'Online Sessions',        desc: 'Video consultations available from anywhere in Nepal or abroad' },
		{ icon: '💡', title: 'Scholarship Guidance',  desc: 'We identify and apply for scholarships and fee waivers on your behalf' },
		{ icon: '🔄', title: 'Post-Arrival Help',     desc: 'Bank accounts, SIM cards, housing — we support you after you land' },
	];

	readonly accreditations = [
		{ icon: '🏛️', name: 'PIER Certified' },
		{ icon: '🎓', name: 'NACSA Member' },
		{ icon: '🤝', name: 'British Council Partner' },
		{ icon: '🇦🇺', name: 'Study Australia Partner' },
		{ icon: '🇬🇧', name: 'Study UK Partner' },
		{ icon: '🇨🇦', name: 'EduCanada Network' },
		{ icon: '🇺🇸', name: 'EducationUSA Adviser' },
		{ icon: '🇳🇿', name: 'ENZ Agent Member' },
		{ icon: '📝', name: 'PTE Authorised Prep Centre' },
		{ icon: '📝', name: 'IELTS Prep Partner' },
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
		}, { threshold: 0.12 });
		els.forEach((el: Element) => this._observer.observe(el));
	}

	ngOnDestroy(): void { if (this._observer) this._observer.disconnect(); }
}
