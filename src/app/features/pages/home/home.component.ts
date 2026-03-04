import {
	Component, signal, OnInit, OnDestroy,
	ElementRef, AfterViewInit, NgZone, ChangeDetectorRef, ViewChild
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

interface Country {
	code: string;
	name: string;
	flag: string;
	tagline: string;
	highlight: string;
	heroImage: string;          // Unsplash URL
	galleryImages: string[];    // 3 landmark images
	videoUrl: string;           // Full YouTube watch or embed URL
	videoTitle: string;
	accentColor: string;
	facts: { value: string; label: string }[];
	visaTypes: { icon: string; title: string; subtitle: string; route: string }[];
	mapHeading: string;
	mapDesc: string;
	universities: string;
	landmark: string;           // Famous landmark name shown in image caption
}

@Component({
	selector: 'app-home',
	standalone: true,
	imports: [CommonModule, RouterModule],
	styles: [`
		:host {
			display: block;
		}

		/* ─────────────────────────────────────────────────
		   Country bar
		───────────────────────────────────────────────── */
		.country-bar {
			background: #0d1235;
			border-bottom: 1px solid rgba(26, 53, 212, 0.22);
			padding: 0.55rem 0;
			position: sticky;
			top: 72px;
			z-index: 40;
		}

		@media (min-width: 1024px) {
			.country-bar {
				top: 80px;
			}
		}

		.country-pill {
			position: relative;
			overflow: hidden;
			display: inline-flex;
			align-items: center;
			gap: 0.45rem;
			padding: 0.4rem 0.9rem;
			border-radius: 999px;
			border: 1.5px solid rgba(255, 255, 255, 0.1);
			background: transparent;
			color: rgba(255, 255, 255, 0.55);
			font-size: 0.8rem;
			font-family: 'DM Sans', sans-serif;
			font-weight: 500;
			cursor: pointer;
			transition: all 0.22s ease;
			white-space: nowrap;
		}

		.country-pill:hover {
			border-color: rgba(0, 170, 255, 0.5);
			color: #fff;
			background: rgba(26, 53, 212, 0.25);
		}

		.country-pill.active {
			background: linear-gradient(135deg, rgba(26, 53, 212, 0.55), rgba(0, 170, 255, 0.3));
			border-color: rgba(0, 170, 255, 0.65);
			color: #fff;
			font-weight: 600;
		}

		.pill-timer {
			position: absolute;
			bottom: 0;
			left: 0;
			height: 2px;
			background: linear-gradient(90deg, #1a35d4, #00aaff);
			border-radius: 0 0 999px 999px;
			transition: width 0.08s linear;
		}

		/* ─────────────────────────────────────────────────
		   Hero with full-bleed image
		───────────────────────────────────────────────── */
		.hero-section {
			position: relative;
			min-height: 92vh;
			display: flex;
			align-items: center;
			overflow: hidden;
		}

		.hero-bg-image {
			position: absolute;
			inset: 0;
			background-size: cover;
			background-position: center;
			transition: opacity 0.7s ease, background-image 0s;
		}

		.hero-bg-image::after {
			content: '';
			position: absolute;
			inset: 0;
			background: linear-gradient(
				105deg,
				rgba(9, 14, 43, 0.92) 0%,
				rgba(9, 14, 43, 0.78) 45%,
				rgba(9, 14, 43, 0.38) 100%
			);
		}

		.hero-overlay-gradient {
			position: absolute;
			inset: 0;
			background: linear-gradient(to top, rgba(9, 14, 43, 0.85) 0%, transparent 55%);
			pointer-events: none;
		}

		/* ─────────────────────────────────────────────────
		   Typewriter / cursor
		───────────────────────────────────────────────── */
		.tw-cursor {
			display: inline-block;
			width: 3px;
			height: 0.88em;
			background: #00aaff;
			margin-left: 2px;
			vertical-align: middle;
			border-radius: 1px;
			animation: cursorBlink 0.75s step-end infinite;
		}

		@keyframes cursorBlink {
			0%, 100% {
				opacity: 1;
			}
			50% {
				opacity: 0;
			}
		}

		/* ─────────────────────────────────────────────────
		   Gallery strip
		───────────────────────────────────────────────── */
		.gallery-strip {
			display: grid;
			grid-template-columns: 1fr 1fr 1fr;
			gap: 0.5rem;
			border-radius: 1.25rem;
			overflow: hidden;
		}

		.gallery-img {
			aspect-ratio: 3/4;
			object-fit: cover;
			width: 100%;
			transition: transform 0.4s ease, filter 0.4s ease;
			filter: brightness(0.88) saturate(1.1);
		}

		.gallery-img:hover {
			transform: scale(1.04);
			filter: brightness(1) saturate(1.2);
		}

		/* ─────────────────────────────────────────────────
		   Video section
		───────────────────────────────────────────────── */
		.video-wrap {
			position: relative;
			border-radius: 1.5rem;
			overflow: hidden;
			box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
			aspect-ratio: 16/9;
			background: #0d1235;
		}

		.video-wrap iframe {
			width: 100%;
			height: 100%;
			display: block;
			border: none;
		}

		.video-overlay {
			position: absolute;
			inset: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			cursor: pointer;
			transition: opacity 0.3s ease;
			background: linear-gradient(135deg, rgba(9, 14, 43, 0.45), rgba(26, 53, 212, 0.25));
		}

		.video-overlay:hover {
			opacity: 0;
		}

		.play-btn {
			width: 5rem;
			height: 5rem;
			border-radius: 50%;
			background: rgba(255, 255, 255, 0.18);
			backdrop-filter: blur(8px);
			border: 2px solid rgba(255, 255, 255, 0.4);
			display: flex;
			align-items: center;
			justify-content: center;
			transition: transform 0.25s ease, background 0.25s ease;
		}

		.play-btn:hover {
			transform: scale(1.12);
			background: rgba(0, 170, 255, 0.35);
		}

		/* ─────────────────────────────────────────────────
		   Country showcase cards
		───────────────────────────────────────────────── */
		.showcase-card {
			border-radius: 1.25rem;
			overflow: hidden;
			cursor: pointer;
			position: relative;
			transition: transform 0.28s ease, box-shadow 0.28s ease;
			border: 2px solid transparent;
		}

		.showcase-card:hover {
			transform: translateY(-6px);
			box-shadow: 0 24px 48px rgba(0, 0, 0, 0.22);
		}

		.showcase-card.active {
			border-color: #1a35d4;
			box-shadow: 0 0 0 4px rgba(26, 53, 212, 0.18);
		}

		.showcase-img {
			width: 100%;
			aspect-ratio: 4/3;
			object-fit: cover;
			transition: transform 0.45s ease;
		}

		.showcase-card:hover .showcase-img {
			transform: scale(1.06);
		}

		.showcase-overlay {
			position: absolute;
			inset: 0;
			background: linear-gradient(to top, rgba(9, 14, 43, 0.85) 0%, transparent 55%);
			transition: opacity 0.3s;
		}

		.showcase-card.active .showcase-overlay {
			background: linear-gradient(to top, rgba(26, 53, 212, 0.75) 0%, transparent 55%);
		}

		/* ─────────────────────────────────────────────────
		   Animations & reveals
		───────────────────────────────────────────────── */
		.hero-enter {
			animation: heroIn 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
		}

		@keyframes heroIn {
			from {
				opacity: 0;
				transform: translateY(22px);
			}
			to {
				opacity: 1;
				transform: none;
			}
		}

		.reveal {
			opacity: 0;
			transform: translateY(30px);
			transition: opacity .65s ease, transform .65s ease;
		}

		.reveal.is-visible {
			opacity: 1;
			transform: none;
		}

		.reveal-l {
			opacity: 0;
			transform: translateX(-30px);
			transition: opacity .65s ease, transform .65s ease;
		}

		.reveal-l.is-visible {
			opacity: 1;
			transform: none;
		}

		.reveal-r {
			opacity: 0;
			transform: translateX(30px);
			transition: opacity .65s ease, transform .65s ease;
		}

		.reveal-r.is-visible {
			opacity: 1;
			transform: none;
		}

		.stagger > * {
			opacity: 0;
			transform: translateY(24px);
			transition: opacity .55s ease, transform .55s ease;
		}

		.stagger.is-visible > *:nth-child(1) {
			transition-delay: .00s;
			opacity: 1;
			transform: none;
		}

		.stagger.is-visible > *:nth-child(2) {
			transition-delay: .09s;
			opacity: 1;
			transform: none;
		}

		.stagger.is-visible > *:nth-child(3) {
			transition-delay: .18s;
			opacity: 1;
			transform: none;
		}

		.stagger.is-visible > *:nth-child(4) {
			transition-delay: .27s;
			opacity: 1;
			transform: none;
		}

		.stagger.is-visible > *:nth-child(5) {
			transition-delay: .36s;
			opacity: 1;
			transform: none;
		}

		.stagger.is-visible > *:nth-child(6) {
			transition-delay: .45s;
			opacity: 1;
			transform: none;
		}

		@keyframes float {
			0%, 100% {
				transform: translateY(0);
			}
			50% {
				transform: translateY(-12px);
			}
		}

		.anim-float {
			animation: float 5s ease-in-out infinite;
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

		.pulse-dot {
			animation: pdot 2s ease-in-out infinite;
		}

		@keyframes shimmer {
			from {
				transform: translateX(-100%);
			}
			to {
				transform: translateX(100%);
			}
		}

		.shimmer::after {
			content: '';
			position: absolute;
			inset: 0;
			background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.07), transparent);
			animation: shimmer 2.5s ease-in-out infinite;
		}

		.c-fade {
			animation: cFade .4s ease both;
		}

		@keyframes cFade {
			from {
				opacity: 0;
				transform: translateY(6px);
			}
			to {
				opacity: 1;
				transform: none;
			}
		}

		/* ─────────────────────────────────────────────────
		   Stat numbers
		───────────────────────────────────────────────── */
		.stat-num {
			font-family: 'Playfair Display', serif;
			font-size: clamp(2rem, 5vw, 3rem);
			font-weight: 700;
			background: linear-gradient(135deg, #1a35d4, #00aaff);
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
			background-clip: text;
			line-height: 1;
		}

		/* ─────────────────────────────────────────────────
		   Service cards
		───────────────────────────────────────────────── */
		.svc-card {
			background: #fff;
			border-radius: 1.1rem;
			border: 1.5px solid #eef1ff;
			box-shadow: 0 2px 20px rgba(26, 37, 96, .06);
			transition: all .25s ease;
			text-decoration: none;
			display: block;
		}

		.svc-card:hover {
			transform: translateY(-4px);
			box-shadow: 0 16px 44px rgba(26, 37, 96, .14);
			border-color: #b9d1ff;
		}

		.feat-icon {
			width: 3rem;
			height: 3rem;
			border-radius: .875rem;
			display: flex;
			align-items: center;
			justify-content: center;
			background: #eef4ff;
			transition: background .2s;
			flex-shrink: 0;
		}

		.svc-card:hover .feat-icon {
			background: linear-gradient(135deg, #1a35d4, #00aaff);
		}

		/* ─────────────────────────────────────────────────
		   Steps
		───────────────────────────────────────────────── */
		.step-card {
			text-align: center;
			padding: 2rem 1.5rem;
			border-radius: 1.25rem;
			background: #fff;
			border: 1.5px solid #eef1ff;
			box-shadow: 0 2px 20px rgba(26, 37, 96, .05);
			transition: all .25s ease;
			position: relative;
		}

		.step-card:hover {
			border-color: #1a35d4;
			transform: translateY(-4px);
			box-shadow: 0 14px 36px rgba(26, 37, 96, .12);
		}

		.step-icon {
			width: 5rem;
			height: 5rem;
			margin: 0 auto 1.25rem;
			border-radius: 1.25rem;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 2rem;
			background: #eef4ff;
			border: 2px solid #dce8ff;
			position: relative;
			transition: background .25s;
		}

		.step-card:hover .step-icon {
			background: linear-gradient(135deg, #1a35d4, #00aaff);
			border-color: transparent;
		}

		.step-num {
			position: absolute;
			top: -8px;
			right: -8px;
			width: 1.6rem;
			height: 1.6rem;
			border-radius: 50%;
			background: linear-gradient(135deg, #1a35d4, #00aaff);
			color: #fff;
			font-size: .7rem;
			font-weight: 700;
			display: flex;
			align-items: center;
			justify-content: center;
			box-shadow: 0 2px 8px rgba(26, 53, 212, .4);
		}

		.step-connector {
			position: absolute;
			top: 40px;
			left: calc(50% + 2.8rem);
			right: calc(-50% + 2.8rem);
			height: 2px;
			background: linear-gradient(90deg, #1a35d4, #00aaff);
			opacity: .25;
		}

		/* ─────────────────────────────────────────────────
		   Testimonials
		───────────────────────────────────────────────── */
		.testi-card {
			background: rgba(255, 255, 255, .04);
			border: 1px solid rgba(255, 255, 255, .08);
			border-radius: 1.1rem;
			transition: all .25s ease;
		}

		.testi-card:hover {
			background: rgba(255, 255, 255, .08);
			border-color: rgba(0, 170, 255, .25);
			transform: translateY(-3px);
		}

		/* ─────────────────────────────────────────────────
		   Grad text
		───────────────────────────────────────────────── */
		.grad-text {
			background: linear-gradient(90deg, #1a35d4, #00aaff);
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
			background-clip: text;
		}

		/* ─────────────────────────────────────────────────
		   Image with glass caption
		───────────────────────────────────────────────── */
		.img-caption-wrap {
			position: relative;
			border-radius: 1.25rem;
			overflow: hidden;
		}

		.img-caption-wrap img {
			width: 100%;
			height: 100%;
			object-fit: cover;
			display: block;
		}

		.img-caption {
			position: absolute;
			bottom: 0.75rem;
			left: 0.75rem;
			right: 0.75rem;
			background: rgba(9, 14, 43, 0.72);
			backdrop-filter: blur(10px);
			border: 1px solid rgba(255, 255, 255, 0.1);
			border-radius: 0.75rem;
			padding: 0.6rem 0.875rem;
			display: flex;
			align-items: center;
			justify-content: space-between;
		}

		/* ─────────────────────────────────────────────────
		   Landscape hero carousel indicator dots
		───────────────────────────────────────────────── */
		.hero-dot {
			width: 6px;
			height: 6px;
			border-radius: 50%;
			background: rgba(255, 255, 255, 0.35);
			transition: all 0.25s;
			cursor: pointer;
			border: none;
			padding: 0;
		}

		.hero-dot.active {
			width: 22px;
			border-radius: 3px;
			background: #00aaff;
		}

		/* image loading skeleton */
		.img-skeleton {
			background: linear-gradient(90deg, #1a2560 25%, #1e2f70 50%, #1a2560 75%);
			background-size: 200% 100%;
			animation: skeleton 1.6s ease-in-out infinite;
		}

		@keyframes skeleton {
			0% {
				background-position: 200% 0;
			}
			100% {
				background-position: -200% 0;
			}
		}
	`],
	template: `
		<!-- ═══════════════════════════════════════
			 COUNTRY SELECTOR BAR
		═══════════════════════════════════════ -->
		<nav class="country-bar" aria-label="Select destination country"
			 (mouseenter)="pauseRotate()" (mouseleave)="resumeRotate()">
			<div class="container-custom">
				<div class="flex items-center gap-2 overflow-x-auto scrollbar-hide py-0.5">
          <span class="text-gray-500 text-[0.7rem] font-bold uppercase tracking-wider mr-1
                       whitespace-nowrap flex-shrink-0 hidden sm:block">Study in:</span>

					@for (c of countries; track c.code) {
						<button class="country-pill" [class.active]="activeCountry().code === c.code"
								(click)="selectCountry(c, true)"
								[attr.aria-current]="activeCountry().code === c.code ? 'true' : null">
							<span class="text-base leading-none" aria-hidden="true">{{ c.flag }}</span>
							{{ c.name }}
							@if (activeCountry().code === c.code) {
								<span class="pill-timer" [style.width]="progress() + '%'"></span>
							}
						</button>
					}

					<button class="ml-1 w-7 h-7 rounded-full border border-white/15 flex items-center justify-center
                         text-gray-400 hover:text-white hover:border-white/40 transition-all flex-shrink-0"
							[title]="isRotating() ? 'Pause' : 'Play'"
							(click)="toggleRotate()" aria-label="Toggle auto-rotation">
						@if (isRotating()) {
							<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
								<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
							</svg>
						} @else {
							<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
								<path d="M8 5v14l11-7z"/>
							</svg>
						}
					</button>
				</div>
			</div>
		</nav>

		<!-- ═══════════════════════════════════════
			 HERO — Full-bleed country image bg
		═══════════════════════════════════════ -->
		<section class="hero-section" aria-label="Hero banner">

			<!-- Animated background image -->
			<div class="hero-bg-image"
				 [style.background-image]="'url(' + activeCountry().heroImage + ')'">
			</div>
			<div class="hero-overlay-gradient"></div>

			<div class="container-custom relative z-10 w-full py-16 sm:py-20">
				<div class="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

					<!-- Left: Text content -->
					<div class="hero-enter" [attr.data-key]="activeCountry().code">

						<div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm
                        border border-white/20 rounded-full px-4 py-2
                        text-blue-200 text-xs sm:text-sm font-medium mb-6">
							<span class="w-2 h-2 rounded-full bg-[#00aaff] pulse-dot flex-shrink-0"></span>
							Nepal's #1 Study Abroad Consultancy · Est. 2015
						</div>

						<!-- flag + country -->
						<div class="flex items-center gap-3 mb-4">
							<span class="text-[#00aaff] text-5xl leading-none">{{ activeCountry().flag }}</span>
							<div>
								<p class="text-[#00aaff] text-xs font-bold uppercase tracking-wider">Study
									Destination</p>
								<p class="text-white font-bold text-lg leading-tight">{{ activeCountry().name }}</p>
							</div>
						</div>

						<h1 class="font-display font-bold text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-[4rem]
                       text-white leading-[1.1] mb-5">
							{{ activeCountry().tagline }}<span class="grad-text">{{ typedText() }}</span><span
							class="tw-cursor" [style.display]="cursorOn() ? 'inline-block' : 'none'"></span>
							<br>
							<span class="text-white">Starts Here</span>
						</h1>

						<p class="text-base sm:text-lg text-blue-100/90 leading-relaxed mb-8 max-w-xl">
							Expert guidance for Nepali students — from university admissions and visa applications
							to English test preparation. We've helped over
							<strong class="text-[#00aaff] font-semibold">5,000 students</strong>
							reach <strong class="text-white">{{ activeCountry().name }}</strong>.
						</p>

						<div class="flex flex-col xs:flex-row gap-3 sm:gap-4 mb-10">
							<a routerLink="/contact"
							   class="inline-flex items-center justify-center gap-2 px-7 py-4
                        rounded-xl font-bold text-white text-sm sm:text-base transition-all"
							   style="background:linear-gradient(135deg,#f97316,#ea580c);
                        box-shadow:0 4px 18px rgba(249,115,22,0.45)"
							   onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 10px 30px rgba(249,115,22,.5)'"
							   onmouseout="this.style.transform='';this.style.boxShadow='0 4px 18px rgba(249,115,22,.45)'">
								Book Free Consultation
								<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
										  d="M17 8l4 4m0 0l-4 4m4-4H3"/>
								</svg>
							</a>
							<button (click)="openVideo()"
									class="inline-flex items-center justify-center gap-2.5 px-7 py-4
                             rounded-xl font-bold text-white text-sm sm:text-base transition-all
                             bg-white/12 backdrop-blur border border-white/25 hover:bg-white/20">
								<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
									<path d="M8 5v14l11-7z"/>
								</svg>
								Watch {{ activeCountry().name }} Guide
							</button>
						</div>

						<!-- Trust badges -->
						<div class="flex flex-wrap items-center gap-x-5 gap-y-2 pt-7 border-t border-white/10">
							@for (b of trustBadges; track b.label) {
								<div class="flex items-center gap-1.5">
									<span class="text-xl leading-none">{{ b.icon }}</span>
									<span class="text-blue-200 text-xs sm:text-sm font-medium">{{ b.label }}</span>
								</div>
							}
						</div>
					</div>

					<!-- Right: Gallery strip + floating card -->
					<div class="hidden lg:block relative">
						<div class="gallery-strip">
							@for (img of activeCountry().galleryImages; track img; let i = $index) {
								<div class="relative overflow-hidden"
									 [style.border-radius]="i===0 ? '1rem 0 0 1rem' : i===2 ? '0 1rem 1rem 0' : '0'"
									 [style.margin-top]="i===1 ? '2.5rem' : '0'">
									<img [src]="img"
										 [alt]="activeCountry().name + ' landmark ' + (i+1)"
										 class="gallery-img"
										 loading="eager"
										 onerror="this.src='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80'"/>
								</div>
							}
						</div>

						<!-- Floating stats card -->
						<div
							class="absolute -bottom-6 -left-8 bg-white rounded-2xl shadow-2xl p-4 min-w-[200px] anim-float">
							<div class="flex items-center gap-3 mb-2">
								<div class="w-10 h-10 rounded-xl flex items-center justify-center text-2xl"
									 style="background:#eef4ff">{{ activeCountry().flag }}
								</div>
								<div>
									<p class="text-xs text-gray-400 font-medium">Visa Success Rate</p>
									<p class="font-display text-xl font-bold grad-text">98%</p>
								</div>
							</div>
							<div class="h-1.5 rounded-full bg-gray-100 overflow-hidden">
								<div class="h-full rounded-full"
									 style="width:98%;background:linear-gradient(90deg,#1a35d4,#00aaff)"></div>
							</div>
						</div>

						<!-- Floating students badge -->
						<div class="absolute -top-4 -right-4 rounded-2xl text-white px-4 py-3 shadow-xl"
							 style="background:linear-gradient(135deg,#0d1235,#1a35d4)">
							<p class="text-xs text-blue-300 font-medium">Students helped</p>
							<p class="font-display text-2xl font-bold">5,000+</p>
						</div>
					</div>
				</div>

				<!-- Country indicator dots -->
				<div class="flex items-center justify-center gap-2 mt-10 sm:mt-14">
					@for (c of countries; track c.code) {
						<button class="hero-dot" [class.active]="activeCountry().code === c.code"
								(click)="selectCountry(c, true)"
								[attr.aria-label]="'Show ' + c.name">
						</button>
					}
				</div>
			</div>
		</section>

		<!-- ═══════════════════════════════════════
			 STATS
		═══════════════════════════════════════ -->
		<section class="py-14 bg-white border-b border-[#eef1ff]">
			<div class="container-custom">
				<div class="stagger grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8" #revealRef>
					@for (s of animStats; track s.label) {
						<div class="text-center group py-2">
							<div
								class="stat-num mb-1.5 group-hover:scale-105 transition-transform duration-300">{{ s.display }}
							</div>
							<div class="text-gray-500 text-xs sm:text-sm font-medium">{{ s.label }}</div>
						</div>
					}
				</div>
			</div>
		</section>

		<!-- ═══════════════════════════════════════
			 COUNTRY SHOWCASE WITH IMAGES
		═══════════════════════════════════════ -->
		<section class="py-16 sm:py-20 bg-[#f8f9ff]" aria-labelledby="dest-heading"
				 (mouseenter)="pauseRotate()" (mouseleave)="resumeRotate()">
			<div class="container-custom">
				<div class="text-center mb-10 sm:mb-14 reveal" #revealRef>
					<span class="section-tag">Our Destinations</span>
					<h2 id="dest-heading" class="section-title mb-4">
						World's Top Study Destinations<br class="hidden sm:block"> for Nepali Students
					</h2>
					<p class="section-subtitle max-w-2xl mx-auto">
						Click a destination to explore universities, visa pathways, and real student stories.
					</p>
				</div>

				<!-- Big showcase grid -->
				<div class="stagger grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-10" #revealRef>
					@for (c of countries; track c.code) {
						<div class="showcase-card" [class.active]="activeCountry().code === c.code"
							 (click)="selectCountry(c, true)"
							 role="button" tabindex="0"
							 [attr.aria-pressed]="activeCountry().code === c.code"
							 (keydown.enter)="selectCountry(c, true)">
							<div style="overflow:hidden; border-radius: inherit;">
								<img [src]="c.heroImage"
									 [alt]="'Study in ' + c.name"
									 class="showcase-img"
									 loading="lazy"
									 onerror="this.src='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80'"/>
							</div>
							<div class="showcase-overlay"></div>
							<div class="absolute bottom-0 left-0 right-0 p-4">
								<div class="text-3xl mb-1 leading-none">{{ c.flag }}</div>
								<p class="font-bold text-white text-sm leading-tight">{{ c.name }}</p>
								<p class="text-[#00aaff] text-xs font-semibold mt-0.5">{{ c.universities }} unis</p>
								@if (activeCountry().code === c.code) {
									<div class="mt-2 h-0.5 w-10 rounded"
										 style="background:linear-gradient(90deg,#fff,#00aaff)"></div>
								}
							</div>
						</div>
					}
				</div>

				<!-- Active country deep-dive: image + facts -->
				<div class="grid lg:grid-cols-2 gap-8 reveal" #revealRef>

					<!-- Gallery of 3 landmark images -->
					<div class="reveal-l" #revealRef>
						<div class="flex items-center gap-3 mb-4">
							<span class="text-3xl">{{ activeCountry().flag }}</span>
							<div>
								<h3 class="font-display text-xl font-bold text-[#1a2560]">{{ activeCountry().name }}</h3>
								<p class="text-gray-500 text-sm">{{ activeCountry().mapDesc }}</p>
							</div>
						</div>
						<div class="grid grid-cols-3 gap-3">
							@for (img of activeCountry().galleryImages; track img; let i = $index) {
								<div class="img-caption-wrap" [style.aspect-ratio]="i === 0 ? '1/1.25' : '1/1.1'">
									<img [src]="img"
										 [alt]="activeCountry().name + ' image ' + (i+1)"
										 class="w-full h-full object-cover rounded-xl"
										 loading="lazy"
										 onerror="this.src='https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=400&q=80'"/>
								</div>
							}
						</div>
					</div>

					<!-- Country facts + visa types -->
					<div class="reveal-r" #revealRef>
						<div class="grid grid-cols-2 gap-3 mb-5">
							@for (f of activeCountry().facts; track f.label) {
								<div class="bg-white rounded-2xl border border-[#eef1ff] p-4 text-center
                            hover:border-[#1a35d4] transition-colors">
									<div
										class="font-display text-xl sm:text-2xl font-bold grad-text mb-0.5">{{ f.value }}
									</div>
									<div class="text-xs text-gray-500 leading-snug">{{ f.label }}</div>
								</div>
							}
						</div>

						<h4 class="font-bold text-[#1a2560] text-sm uppercase tracking-wide mb-3">Visa Pathways</h4>
						<div class="space-y-2.5">
							@for (v of activeCountry().visaTypes; track v.title) {
								<a [routerLink]="v.route"
								   class="flex items-center gap-4 p-4 rounded-2xl bg-white border border-[#eef1ff]
                          hover:border-[#1a35d4] hover:bg-[#eef4ff] transition-all group">
									<div class="w-10 h-10 rounded-xl bg-[#eef4ff] group-hover:bg-white flex items-center
                              justify-center text-xl transition-colors flex-shrink-0">{{ v.icon }}
									</div>
									<div class="flex-1 min-w-0">
										<h5 class="font-bold text-[#1a2560] text-sm group-hover:text-[#1a35d4] transition-colors leading-snug">{{ v.title }}</h5>
										<p class="text-xs text-gray-500 mt-0.5 truncate">{{ v.subtitle }}</p>
									</div>
									<svg
										class="w-4 h-4 text-gray-300 group-hover:text-[#1a35d4] group-hover:translate-x-1 transition-all flex-shrink-0"
										fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
											  d="M9 5l7 7-7 7"/>
									</svg>
								</a>
							}
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- ═══════════════════════════════════════
			 VIDEO SECTION
		═══════════════════════════════════════ -->
		<!--<section class="py-16 sm:py-20 bg-[#090e2b]" aria-labelledby="video-heading">
			<div class="container-custom">
				<div class="text-center mb-10 reveal" #revealRef>
					<span
						class="text-[#00aaff] text-xs font-bold uppercase tracking-widest mb-3 block">Country Guides</span>
					<h2 id="video-heading"
						class="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
						Watch Our {{ activeCountry().name }} Study Guide
					</h2>
					<p class="text-gray-400 max-w-xl mx-auto text-sm sm:text-base">
						Real insights from our expert counsellors — what you need to know before applying.
					</p>
				</div>

				<div class="grid lg:grid-cols-2 gap-8 items-start">

					&lt;!&ndash; Main video &ndash;&gt;
					<div class="reveal-l" #revealRef>
						<div class="video-wrap shimmer relative">
							@if (showVideo()) {
								<iframe
									[src]="safeVideoUrl()"
									[title]="activeCountry().videoTitle"
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
									allowfullscreen
									loading="lazy">
								</iframe>
							} @else {
								&lt;!&ndash; Video thumbnail poster &ndash;&gt;
								<img [src]="activeCountry().heroImage"
									 [alt]="activeCountry().videoTitle"
									 class="w-full h-full object-cover absolute inset-0"
									 loading="lazy"/>
								<div class="absolute inset-0 bg-gradient-to-br from-[#090e2b]/60 to-[#1a35d4]/30"></div>
								<div class="absolute inset-0 flex flex-col items-center justify-center gap-4">
									<button (click)="openVideo()"
											class="play-btn"
											[attr.aria-label]="'Play ' + activeCountry().videoTitle">
										<svg class="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
											<path d="M8 5v14l11-7z"/>
										</svg>
									</button>
									<p class="text-white font-semibold text-sm text-center px-4">{{ activeCountry().videoTitle }}</p>
								</div>
							}
						</div>

						&lt;!&ndash; Country tab switcher for videos &ndash;&gt;
						<div class="flex gap-2 mt-4 flex-wrap">
							@for (c of countries; track c.code) {
								<button
									(click)="selectCountry(c, true); showVideo.set(false)"
									class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
									[class.bg-white]="activeCountry().code === c.code"
									[class.text-blue-700]="activeCountry().code === c.code"
									[class.shadow-md]="activeCountry().code === c.code"
									[class.bg-white-10]="activeCountry().code !== c.code"
									[class.text-gray-400]="activeCountry().code !== c.code"
									[style.background]="activeCountry().code !== c.code ? 'rgba(255,255,255,0.07)' : ''"
									[style.color]="activeCountry().code !== c.code ? 'rgba(255,255,255,0.5)' : ''">
									{{ c.flag }} {{ c.name }}
								</button>
							}
						</div>
					</div>

					&lt;!&ndash; Video sidebar: more videos / tips &ndash;&gt;
					<div class="space-y-4 reveal-r" #revealRef>
						<h3 class="text-white font-bold text-sm uppercase tracking-wide mb-2">More Guides</h3>
						@for (c of countries; track c.code) {
							<div class="flex gap-4 rounded-2xl p-3 cursor-pointer transition-all"
								 [class.bg-white-8]="true"
								 [style.background]="activeCountry().code === c.code ? 'rgba(26,53,212,0.25)' : 'rgba(255,255,255,0.05)'"
								 [style.border]="activeCountry().code === c.code ? '1px solid rgba(0,170,255,0.3)' : '1px solid rgba(255,255,255,0.06)'"
								 (click)="selectCountry(c, true); showVideo.set(false)">
								<div class="w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 relative">
									<img [src]="c.heroImage" [alt]="c.name"
										 class="w-full h-full object-cover"
										 loading="lazy"
										 onerror="this.src='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=70'"/>
									<div class="absolute inset-0 flex items-center justify-center bg-black/30">
										<svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
											<path d="M8 5v14l11-7z"/>
										</svg>
									</div>
								</div>
								<div class="flex-1 min-w-0">
									<div class="flex items-center gap-1.5 mb-1">
										<span class="text-sm">{{ c.flag }}</span>
										<span class="text-white font-semibold text-sm">{{ c.name }}</span>
									</div>
									<p class="text-gray-400 text-xs leading-snug line-clamp-2">{{ c.videoTitle }}</p>
									<p class="text-[#00aaff] text-xs font-semibold mt-1">{{ c.universities }}
										universities</p>
								</div>
							</div>
						}
					</div>
				</div>
			</div>
		</section>-->

		<!-- ═══════════════════════════════════════
			 SERVICES
		═══════════════════════════════════════ -->
		<section class="py-16 sm:py-20 bg-white" aria-labelledby="svc-heading">
			<div class="container-custom">
				<div class="text-center mb-10 sm:mb-14 reveal" #revealRef>
					<span class="section-tag">What We Do</span>
					<h2 id="svc-heading" class="section-title mb-4">
						Comprehensive Services for<br class="hidden sm:block">
						Your Journey to <span
						class="c-fade grad-text">{{ activeCountry().flag }} {{ activeCountry().name }}</span>
					</h2>
					<p class="section-subtitle max-w-2xl mx-auto">
						From PTE/IELTS coaching to visa lodgement, we guide you through every step.
					</p>
				</div>
				<div class="stagger grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6" #revealRef>
					@for (svc of services; track svc.title) {
						<a [routerLink]="svc.route" class="svc-card p-6 sm:p-8">
							<div class="feat-icon mb-5">
								<span class="text-2xl leading-none">{{ svc.icon }}</span>
							</div>
							<h3 class="font-display text-lg sm:text-xl font-bold text-[#1a2560] mb-2.5">{{ svc.title }}</h3>
							<p class="text-gray-500 text-sm leading-relaxed mb-4">{{ svc.description }}</p>
							<span class="inline-flex items-center gap-1.5 text-[#1a35d4] font-bold text-sm">
                Learn More
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </span>
						</a>
					}
				</div>
				<div class="text-center mt-8 reveal" #revealRef>
					<a routerLink="/services" class="btn-outline">View All Services</a>
				</div>
			</div>
		</section>

		<!-- ═══════════════════════════════════════
			 HOW IT WORKS
		═══════════════════════════════════════ -->
		<section class="py-16 sm:py-20 bg-[#f8f9ff]" aria-labelledby="how-heading">
			<div class="container-custom">
				<div class="text-center mb-10 sm:mb-14 reveal" #revealRef>
					<span class="section-tag">Our Process</span>
					<h2 id="how-heading" class="section-title mb-4">How We Get You There</h2>
					<p class="section-subtitle max-w-xl mx-auto">A transparent 4-step journey from dream to
						destination.</p>
				</div>
				<div class="stagger grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6" #revealRef>
					@for (step of processSteps; track step.number; let last = $last) {
						<div class="step-card">
							@if (!last) {
								<div class="step-connector hidden lg:block"></div>
							}
							<div class="step-icon">
								<span>{{ step.icon }}</span>
								<span class="step-num">{{ step.number }}</span>
							</div>
							<h3 class="font-display font-bold text-[#1a2560] mb-2 text-base sm:text-lg">{{ step.title }}</h3>
							<p class="text-gray-500 text-sm leading-relaxed">{{ step.description }}</p>
						</div>
					}
				</div>
			</div>
		</section>

		<!-- ═══════════════════════════════════════
			 TESTIMONIALS
		═══════════════════════════════════════ -->
		<section class="py-16 sm:py-20 bg-[#090e2b]" aria-labelledby="testi-heading">
			<div class="container-custom">
				<div class="text-center mb-10 sm:mb-14 reveal" #revealRef>
					<span
						class="text-[#00aaff] text-xs font-bold uppercase tracking-widest mb-3 block">Student Stories</span>
					<h2 id="testi-heading"
						class="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
						Trusted by 5,000+ Nepali Students
					</h2>
					<p class="text-gray-400 max-w-xl mx-auto text-sm sm:text-base">
						Real experiences from students across Nepal who achieved their international study dreams.
					</p>
				</div>
				<div class="stagger grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6" #revealRef>
					@for (t of testimonials; track t.name) {
						<div class="testi-card p-6 sm:p-8">
							<div class="flex gap-1 mb-4">
								@for (s of [1, 2, 3, 4, 5]; track s) {
									<svg class="w-4 h-4 flex-shrink-0" style="color:#00aaff" fill="currentColor"
										 viewBox="0 0 20 20">
										<path
											d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
									</svg>
								}
							</div>
							<div
								class="inline-flex items-center gap-1.5 bg-white/8 rounded-full px-3 py-1.5 text-xs text-gray-300 mb-4">
								<span>{{ t.countryFlag }}</span> {{ t.country }}
							</div>
							<blockquote class="text-gray-300 text-sm leading-relaxed mb-5 italic">"{{ t.quote }}"
							</blockquote>
							<div class="flex items-center gap-3">
								<div
									class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
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

		<!-- ═══════════════════════════════════════
			 CTA
		═══════════════════════════════════════ -->
		<section class="py-16 sm:py-20 bg-cta-gradient" aria-label="Call to action">
			<div class="container-custom text-center reveal" #revealRef>
				<h2 class="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5">
					Ready to Begin Your Journey to<br class="hidden sm:block">
					<span class="c-fade">{{ activeCountry().flag }} {{ activeCountry().name }}?</span>
				</h2>
				<p class="text-white/80 text-base sm:text-xl max-w-xl mx-auto mb-7">
					Book your free consultation at our Kathmandu office or online — no obligation.
				</p>
				<div class="flex items-center justify-center flex-wrap gap-2 sm:gap-3 mb-8">
					@for (c of countries; track c.code) {
						<button class="text-2xl sm:text-3xl transition-all duration-200 hover:scale-125 rounded-lg p-1"
								[class.scale-125]="activeCountry().code === c.code"
								[title]="'Study in ' + c.name"
								(click)="selectCountry(c, true)"
								[attr.aria-label]="'Show ' + c.name + ' info'">{{ c.flag }}
						</button>
					}
				</div>
				<div class="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center">
					<a routerLink="/contact"
					   class="inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-3.5 sm:py-4
                    bg-white font-bold rounded-xl text-sm sm:text-base transition-all hover:-translate-y-px"
					   style="color:#1a35d4;box-shadow:0 4px 20px rgba(255,255,255,.2)">
						Book Free Consultation
						<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
								  d="M17 8l4 4m0 0l-4 4m4-4H3"/>
						</svg>
					</a>
					<a routerLink="/services"
					   class="btn-outline-white text-sm sm:text-base py-3.5 sm:py-4 px-7 sm:px-8 justify-center">
						Browse Services
					</a>
				</div>
			</div>
		</section>
	`,
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

	/* ── Countries with real Unsplash images + YouTube IDs ── */
	readonly countries: Country[] = [
		{
			code: 'AU', name: 'Australia', flag: '🇦🇺',
			tagline: 'Your Pathway to ', highlight: 'Australia', universities: '40+',
			accentColor: '#00aaff',
			heroImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=85&auto=format&fit=crop',
			galleryImages: [
				'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=600&q=80&auto=format&fit=crop',  // Sydney Opera House
				'https://images.unsplash.com/photo-1546268060-2592ff93ee24?w=600&q=80&auto=format&fit=crop',  // Melbourne
				'https://images.unsplash.com/photo-1438840610096-851130518978?w=600&q=80&auto=format&fit=crop', // Great Ocean Road
			],
			videoUrl: 'assets/videos/aus.mp4',
			videoTitle: 'Study in Australia — Complete Guide for Nepali Students 2025',
			landmark: 'Sydney Opera House',
			facts: [
				{value: '40+', label: 'Top 100 World Universities'},
				{value: '700k+', label: 'International Students'},
				{value: '2nd', label: 'Most Popular Study Destination'},
				{value: 'A$30k', label: 'Average Graduate Salary'},
			],
			visaTypes: [
				{
					icon: '🎒',
					title: 'Student Visa (Subclass 500)',
					subtitle: 'Study at a registered Australian institution',
					route: '/visa/student-visa'
				},
				{
					icon: '🏛️',
					title: 'Temporary Graduate Visa (485)',
					subtitle: 'Work and live in Australia after graduation',
					route: '/visa/graduate-visa'
				},
				{
					icon: '✈️',
					title: 'Tourist Visa (Subclass 600)',
					subtitle: 'Visit Australia for tourism or business',
					route: '/visa/tourist-visa'
				},
			],
			mapHeading: 'World-Class Education Awaits',
			mapDesc: 'From Melbourne to Sydney, access top-ranking universities with our expert guidance.',
		},
		{
			code: 'UK', name: 'United Kingdom', flag: '🇬🇧',
			tagline: 'Begin Your Future in ', highlight: 'the UK', universities: '130+',
			accentColor: '#1a35d4',
			heroImage: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600&q=85&auto=format&fit=crop',
			galleryImages: [
				'https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?w=600&q=80&auto=format&fit=crop', // Big Ben
				'https://images.unsplash.com/photo-1607861716497-e65ab29fc7ac?w=600&q=80&auto=format&fit=crop', // Oxford
				'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=600&q=80&auto=format&fit=crop', // London Bridge
			],
			videoUrl: 'assets/videos/london.mp4',
			videoTitle: 'Study in the UK — Visa Guide & Top Universities for Nepali Students',
			landmark: 'University of Oxford',
			facts: [
				{value: '130+', label: 'World-Class Universities'},
				{value: '600k+', label: 'International Students'},
				{value: '2 yrs', label: 'Post-Study Work Visa'},
				{value: '£28k', label: 'Average Graduate Salary'},
			],
			visaTypes: [
				{
					icon: '🎓',
					title: 'UK Student Visa',
					subtitle: 'Study at a licensed UK Higher Education provider',
					route: '/visa/uk-student-visa'
				},
				{
					icon: '🏅',
					title: 'Graduate Route Visa',
					subtitle: '2-3 year post-study work visa for graduates',
					route: '/visa/uk-graduate-visa'
				},
				{
					icon: '✈️',
					title: 'Standard Visitor Visa',
					subtitle: 'Visit the UK for tourism, business or family',
					route: '/visa/uk-visitor-visa'
				},
			],
			mapHeading: 'Gateway to British Excellence',
			mapDesc: "From Oxford to Edinburgh, access some of the world's most prestigious universities.",
		},
		{
			code: 'CA', name: 'Canada', flag: '🇨🇦',
			tagline: 'Build Your Future in ', highlight: 'Canada', universities: '100+',
			accentColor: '#dc2626',
			heroImage: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=1600&q=85&auto=format&fit=crop',
			galleryImages: [
				'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600&q=80&auto=format&fit=crop', // Toronto skyline
				'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80&auto=format&fit=crop', // Vancouver
				'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80&auto=format&fit=crop', // Niagara
			],
			videoUrl: 'assets/videos/canada.mp4',
			videoTitle: 'Study in Canada — Study Permit & PR Pathway for Nepali Students 2025',
			landmark: 'University of Toronto',
			facts: [
				{value: '100+', label: 'Designated Learning Institutions'},
				{value: '3 yrs', label: 'Post-Graduation Work Permit'},
				{value: 'PR', label: 'Clear Pathway to Residency'},
				{value: 'C$55k', label: 'Average Graduate Salary'},
			],
			visaTypes: [
				{
					icon: '🎒',
					title: 'Canada Study Permit',
					subtitle: 'Study at a Designated Learning Institution',
					route: '/visa/canada-study-permit'
				},
				{
					icon: '💼',
					title: 'Post-Graduation Work Permit',
					subtitle: 'Work in Canada for up to 3 years after graduation',
					route: '/visa/canada-pgwp'
				},
				{
					icon: '🌿',
					title: 'Express Entry (PR)',
					subtitle: 'Skilled worker pathway to permanent residency',
					route: '/visa/canada-pr'
				},
			],
			mapHeading: 'The Land of Opportunity',
			mapDesc: 'Canada offers world-class education and the clearest pathway from student to permanent resident.',
		},
		{
			code: 'US', name: 'United States', flag: '🇺🇸',
			tagline: 'Achieve Your American ', highlight: 'Dream', universities: '4,000+',
			accentColor: '#2563eb',
			heroImage: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1600&q=85&auto=format&fit=crop',
			galleryImages: [
				'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600&q=80&auto=format&fit=crop', // NYC
				'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=600&q=80&auto=format&fit=crop', // Harvard
				'https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?w=600&q=80&auto=format&fit=crop', // Golden Gate
			],
			videoUrl: 'assets/videos/usa.mp4',
			videoTitle: 'Study in the USA — F-1 Visa Guide for Nepali Students',
			landmark: 'Harvard University, Cambridge',
			facts: [
				{value: '4k+', label: 'Accredited Universities'},
				{value: '3 yrs', label: 'STEM OPT Extension'},
				{value: 'Top 10', label: 'Universities Globally'},
				{value: '$70k', label: 'Average Graduate Salary'},
			],
			visaTypes: [
				{
					icon: '🎓',
					title: 'F-1 Student Visa',
					subtitle: 'Full-time academic study at a SEVP-approved institution',
					route: '/visa/us-f1-visa'
				},
				{
					icon: '💡',
					title: 'OPT / STEM OPT',
					subtitle: 'Work authorization during and after your degree',
					route: '/visa/us-opt'
				},
				{
					icon: '✈️',
					title: 'B-2 Tourist Visa',
					subtitle: 'Visit the USA for tourism or medical treatment',
					route: '/visa/us-b2-visa'
				},
			],
			mapHeading: 'Top of the World Rankings',
			mapDesc: "Access the world's top-ranked universities with our expert F-1 visa support and OPT guidance.",
		},
		{
			code: 'NZ', name: 'New Zealand', flag: '🇳🇿',
			tagline: 'Discover Your Path in ', highlight: 'New Zealand', universities: '8',
			accentColor: '#059669',
			heroImage: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=1600&q=85&auto=format&fit=crop',
			galleryImages: [
				'https://images.unsplash.com/photo-1589802829985-817e51171b92?w=600&q=80&auto=format&fit=crop', // Auckland
				'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80&auto=format&fit=crop', // NZ mountains
				'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=600&q=80&auto=format&fit=crop', // NZ landscape
			],
			videoUrl: 'assets/videos/nz.mp4',
			videoTitle: 'Study in New Zealand — Complete Guide for Nepali Students',
			landmark: 'University of Auckland',
			facts: [
				{value: '8', label: 'World-Class Universities'},
				{value: '3 yrs', label: 'Post-Study Work Visa'},
				{value: '#1', label: "World's Most Peaceful Country"},
				{value: 'NZ$52k', label: 'Average Graduate Salary'},
			],
			visaTypes: [
				{
					icon: '🎒',
					title: 'NZ Student Visa',
					subtitle: 'Study at a New Zealand Education Provider',
					route: '/visa/nz-student-visa'
				},
				{
					icon: '🌿',
					title: 'Post-Study Work Visa',
					subtitle: 'Work in NZ for up to 3 years after graduation',
					route: '/visa/nz-post-study'
				},
				{
					icon: '🏡',
					title: 'Skilled Migrant Category',
					subtitle: 'Pathway to permanent residency in NZ',
					route: '/visa/nz-skilled-migrant'
				},
			],
			mapHeading: 'Naturally Extraordinary',
			mapDesc: 'Experience world-class education in one of the most beautiful and welcoming countries on Earth.',
		},
	];

	/* ── Reactive state ── */
	activeCountry = signal<Country>(this.countries[0]);
	isRotating = signal(true);
	progress = signal(0);
	typedText = signal('');
	cursorOn = signal(true);
	showVideo = signal(false);

	/* ── Animated stats ── */
	animStats = [
		{label: 'Students Assisted', display: '0', target: 5000, suffix: '+', format: 'k'},
		{label: 'Visa Success Rate', display: '0%', target: 98, suffix: '%', format: 'n'},
		{label: 'Years of Experience', display: '0', target: 9, suffix: '+', format: 'n'},
		{label: 'Destination Countries', display: '0', target: 5, suffix: '', format: 'n'},
	];
	private _statsRan = false;

	/* ── Timers ── */
	private _tickTimer: ReturnType<typeof setInterval> | null = null;
	private _twTimeout: ReturnType<typeof setTimeout> | null = null;
	private _elapsed = 0;
	private _paused = false;
	private readonly ROTATE_MS = 5500;
	private readonly TICK_MS = 50;

	private _observer!: IntersectionObserver;

	constructor(
		private elRef: ElementRef,
		private zone: NgZone,
		private cdr: ChangeDetectorRef,
		private sanitizer: DomSanitizer,
	) {
	}

	ngOnInit(): void {
		this.startRotate();
		this.runTypewriter(this.activeCountry().highlight);
	}

	ngAfterViewInit(): void {
		this.setupReveal();
	}

	ngOnDestroy(): void {
		this.stopRotate();
		if (this._twTimeout) clearTimeout(this._twTimeout);
		if (this._observer) this._observer.disconnect();
	}

	safeVideoUrl(): SafeResourceUrl {
		const raw = this.activeCountry().videoUrl;
		let videoId = '';

		// Handle youtube.com/watch?v=ID
		const watchMatch = raw.match(/[?&]v=([^&#]+)/);
		if (watchMatch) {
			videoId = watchMatch[1];
		}

		// Handle youtu.be/ID
		const shortMatch = raw.match(/youtu\.be\/([^?&#]+)/);
		if (shortMatch) {
			videoId = shortMatch[1];
		}

		// Handle youtube.com/embed/ID (already an embed URL)
		const embedMatch = raw.match(/youtube\.com\/embed\/([^?&#]+)/);
		if (embedMatch) {
			videoId = embedMatch[1];
		}

		const embedUrl = videoId
			? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`
			: raw; // fallback: use URL as-is

		return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
	}

	openVideo(): void {
		this.showVideo.set(true);
	}

	/* ── Country selection ── */
	selectCountry(c: Country, manual = false): void {
		if (this.activeCountry().code === c.code) return;
		this.showVideo.set(false);
		this.activeCountry.set(c);
		this.runTypewriter(c.highlight);
		if (manual) {
			this._elapsed = 0;
			this.progress.set(0);
		}
	}

	/* ── Auto-rotate ── */
	private startRotate(): void {
		this.stopRotate();
		this._elapsed = 0;
		this.progress.set(0);
		this.isRotating.set(true);

		this.zone.runOutsideAngular(() => {
			this._tickTimer = setInterval(() => {
				if (this._paused) return;
				this._elapsed += this.TICK_MS;
				const pct = Math.min((this._elapsed / this.ROTATE_MS) * 100, 100);

				this.zone.run(() => {
					this.progress.set(pct);
					if (this._elapsed >= this.ROTATE_MS) {
						this._elapsed = 0;
						this.advanceCountry();
					}
				});
			}, this.TICK_MS);
		});
	}

	private stopRotate(): void {
		if (this._tickTimer) {
			clearInterval(this._tickTimer);
			this._tickTimer = null;
		}
	}

	private advanceCountry(): void {
		const idx = this.countries.findIndex(c => c.code === this.activeCountry().code);
		const next = this.countries[(idx + 1) % this.countries.length];
		this.showVideo.set(false);
		this.activeCountry.set(next);
		this.runTypewriter(next.highlight);
		this.progress.set(0);
	}

	pauseRotate(): void {
		this._paused = true;
	}

	resumeRotate(): void {
		this._paused = false;
	}

	toggleRotate(): void {
		if (this.isRotating()) {
			this.stopRotate();
			this.isRotating.set(false);
		} else {
			this.startRotate();
		}
	}

	/* ── Typewriter ── */
	private runTypewriter(text: string): void {
		if (this._twTimeout) clearTimeout(this._twTimeout);
		this.typedText.set('');
		this.cursorOn.set(true);
		let i = 0;

		const type = () => {
			if (i <= text.length) {
				this.typedText.set(text.slice(0, i));
				i++;
				this._twTimeout = setTimeout(type, i === 1 ? 120 : 60);
			} else {
				this._twTimeout = setTimeout(() => this.cursorOn.set(false), 1500);
			}
		};
		this._twTimeout = setTimeout(type, 180);
	}

	/* ── Scroll reveal + count-up ── */
	private setupReveal(): void {
		const els = this.elRef.nativeElement.querySelectorAll('.reveal, .reveal-l, .reveal-r, .stagger');

		this._observer = new IntersectionObserver(entries => {
			entries.forEach(entry => {
				if (!entry.isIntersecting) return;
				const el = entry.target as HTMLElement;
				el.classList.add('is-visible');

				if (el.classList.contains('stagger') && el.querySelector('.stat-num') && !this._statsRan) {
					this._statsRan = true;
					this.zone.run(() => this.countUpStats());
				}
				this._observer.unobserve(el);
			});
		}, {threshold: 0.14});

		els.forEach((el: Element) => this._observer.observe(el));
	}

	private countUpStats(): void {
		const FPS = 60;
		const INTERVAL = 1800 / FPS;
		this.animStats.forEach(stat => {
			let cur = 0;
			const step = stat.target / FPS;
			const t = setInterval(() => {
				cur = Math.min(cur + step, stat.target);
				const n = Math.floor(cur);
				stat.display = stat.format === 'k' && stat.target >= 1000
					? (n / 1000).toFixed(1).replace('.0', '') + 'k' + stat.suffix
					: n + stat.suffix;
				if (cur >= stat.target) {
					stat.display = stat.format === 'k' && stat.target >= 1000
						? (stat.target / 1000).toFixed(1).replace('.0', '') + 'k' + stat.suffix
						: stat.target + stat.suffix;
					clearInterval(t);
				}
				this.cdr.markForCheck();
			}, INTERVAL);
		});
	}

	/* ── Static data ── */
	readonly trustBadges = [
		{icon: '✅', label: 'PIER Certified'},
		{icon: '🏆', label: '9+ Years Exp.'},
		{icon: '⭐', label: '4.9★ Rated'},
		{icon: '🌏', label: '5 Destinations'},
	];

	readonly services = [
		{
			icon: '🎓', title: 'Student Admission',
			description: 'Expert guidance for university applications across Australia, UK, Canada, USA & NZ — from course selection to offer letter.',
			route: '/services/student-admission'
		},
		{
			icon: '🏥', title: 'Health Insurance (OSHC/UKVI)',
			description: 'Helping Nepali students select and manage the required health cover for every destination country.',
			route: '/services/health-insurance'
		},
		{
			icon: '📝', title: 'PTE / IELTS Preparation',
			description: 'Structured coaching at our Kathmandu centre to help you achieve your target English proficiency score.',
			route: '/services/pte-ielts'
		},
		{
			icon: '🛂', title: 'Student Visa Applications',
			description: 'End-to-end support for student visa lodgement in Australia, UK, Canada, USA and New Zealand.',
			route: '/visa/student-visa'
		},
		{
			icon: '🏛️', title: 'Post-Study Work Visas',
			description: 'Guidance for post-graduation work rights available in multiple countries for eligible graduates.',
			route: '/visa/graduate-visa'
		},
		{
			icon: '🌍', title: 'Permanent Residency',
			description: 'Strategic migration planning for PR pathways in Canada, Australia, New Zealand and beyond.',
			route: '/visa/permanent-residency'
		},
	];

	readonly processSteps = [
		{
			number: 1, icon: '💬', title: 'Free Consultation',
			description: 'Book a no-obligation 30-min session at our Kathmandu office or online via Zoom/Viber.'
		},
		{
			number: 2, icon: '📋', title: 'Profile Assessment',
			description: 'We assess your academic background, goals, budget, and identify the best visa pathway.'
		},
		{
			number: 3, icon: '📁', title: 'Application & Lodgement',
			description: 'We prepare, review, and lodge your complete application with all required documents.'
		},
		{
			number: 4, icon: '✅', title: 'Visa Approved!',
			description: 'Celebrate your approval and receive our pre-departure briefing to prepare for arrival.'
		},
	];

	readonly testimonials = [
		{
			name: 'Aarav Shrestha',
			initials: 'AS',
			detail: 'Student Visa · Uni of Melbourne, AUS',
			color: '#1a35d4',
			country: 'Australia',
			countryFlag: '🇦🇺',
			quote: 'Global Next made my Australian visa process incredibly smooth. Their team was responsive and helped me through every document. Got my visa in 5 weeks!'
		},
		{
			name: 'Samiksha Gurung',
			initials: 'SG',
			detail: 'Student Visa · Uni of Manchester, UK',
			color: '#7c3aed',
			country: 'UK',
			countryFlag: '🇬🇧',
			quote: 'Getting my UK student visa felt overwhelming until I found Global Next in Kathmandu. Their document checklist and preparation coaching was second to none.'
		},
		{
			name: 'Roshan Tamang',
			initials: 'RT',
			detail: 'Study Permit · Uni of Toronto, Canada',
			color: '#dc2626',
			country: 'Canada',
			countryFlag: '🇨🇦',
			quote: 'Global Next guided me from my study permit all the way to planning for Canadian PR. An incredible team with in-depth knowledge of immigration!'
		},
		{
			name: 'Nisha Paudel',
			initials: 'NP',
			detail: 'F-1 Visa · Arizona State University',
			color: '#0284c7',
			country: 'United States',
			countryFlag: '🇺🇸',
			quote: 'Getting my F-1 visa felt daunting, but Global Next simplified every step — from the I-20 to SEVIS and visa interview prep. Highly recommended!'
		},
		{
			name: 'Bikash Karki',
			initials: 'BK',
			detail: 'Graduate 485 · Monash University, AUS',
			color: '#00aaff',
			country: 'Australia',
			countryFlag: '🇦🇺',
			quote: 'After graduation I was unsure about the 485 visa. Global Next guided me through every step. I now have my visa and a great job in Melbourne.'
		},
		{
			name: 'Priya Maharjan',
			initials: 'PM',
			detail: 'Student Visa · Uni of Auckland, NZ',
			color: '#059669',
			country: 'New Zealand',
			countryFlag: '🇳🇿',
			quote: 'New Zealand was my dream and Global Next made it real. From course selection to arrival support — they were with me at every single step.'
		},
	];
}
