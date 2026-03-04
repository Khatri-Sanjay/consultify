import {
	Component,
	HostListener,
	OnInit,
	OnDestroy,
	signal,
	inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { NAV_ITEMS } from './nav-data';


@Component({
	selector: 'app-navbar',
	standalone: true,
	imports: [CommonModule, RouterModule, FormsModule],
	styles: [`
		/* ── Logo ───────────────────────────────────────────── */
		.gn-logo-img {
			height: 44px;
			width: auto;
			max-width: 185px;
			object-fit: contain;
		}

		/* ── Hamburger bars ─────────────────────────────────── */
		.hb {
			display: block; height: 2px; width: 22px;
			border-radius: 9999px; background: #1a2560;
			transition: transform .3s, opacity .2s, width .2s;
			transform-origin: center;
		}

		/* ── Dropdown animation ─────────────────────────────── */
		.gn-drop {
			animation: gnDrop 0.2s cubic-bezier(0.16,1,0.3,1) both;
		}
		@keyframes gnDrop {
			from { opacity: 0; transform: translateY(-6px) scale(0.98); }
			to   { opacity: 1; transform: translateY(0)    scale(1);    }
		}

		/* ── Mobile drawer ──────────────────────────────────── */
		.gn-mobile-drawer {
			animation: gnDrop 0.22s cubic-bezier(0.16,1,0.3,1) both;
		}

		/* ── Searchbar slide ────────────────────────────────── */
		.gn-searchbar {
			animation: gnDrop 0.2s ease both;
		}
	`],
	template: `
		<header
			role="banner"
			class="fixed top-0 inset-x-0 z-50 bg-white transition-all duration-300"
			[class.shadow-[0_4px_24px_rgba(26,37,96,0.10)]]="scrolled() || mobileOpen()"
			[class.border-b]="true"
			[class.border-[#eef1ff]]="true"
		>
			<nav class="container-custom" role="navigation" aria-label="Main navigation">
				<div class="flex items-center justify-between h-[72px] lg:h-20">

					<!-- ── Logo ──────────────────────────────────────── -->
					<a routerLink="/" aria-label="Global Next — homepage" class="flex-shrink-0 flex items-center">
						<img
							src="assets/images/logo.png"
							alt="Global Next"
							class="gn-logo-img"
							onerror="this.style.display='none'; this.nextElementSibling.removeAttribute('hidden');"
						/>
						<!-- SVG fallback — color-matched to logo exactly -->
						<span hidden class="flex items-center gap-2.5 select-none" aria-hidden="true">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Globe body -->
                <circle cx="17" cy="20" r="12" fill="#1a35d4" opacity=".22"/>
                <circle cx="17" cy="20" r="12" stroke="#1a2560" stroke-width="1.3" fill="none"/>
                <line x1="5" y1="20" x2="29" y2="20" stroke="#1a2560" stroke-width="1" opacity=".5"/>
                <ellipse cx="17" cy="20" rx="5.5" ry="12" fill="none" stroke="#1a2560" stroke-width="1" opacity=".5"/>
				  <!-- Arrow — cyan -->
                <path d="M22 4L30 4L30 11" stroke="#00aaff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18.5 7.5L30 4" stroke="#00aaff" stroke-width="2.2" stroke-linecap="round"/>
              </svg>
              <span style="font-family:'DM Sans',sans-serif; font-weight:800; font-size:1.2rem; letter-spacing:-0.02em; line-height:1;">
                <span style="color:#1a2560">GLOBAL </span><!--
                --><span style="background:linear-gradient(90deg,#1a35d4,#00aaff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">NEXT</span>
              </span>
            </span>
					</a>

					<!-- ── Desktop nav links ──────────────────────────── -->
					<div class="hidden lg:flex items-center gap-0.5 xl:gap-1" role="menubar">
						@for (item of navItems; track item.label) {
							<div class="relative" role="none">

								@if (item.children?.length) {
									<button
										role="menuitem"
										class="flex items-center gap-1 text-sm font-semibold px-3 py-2 rounded-xl
                           transition-colors duration-150 text-[#1a2560]
                           hover:text-[#1a35d4] hover:bg-[#eef1ff]"
										[attr.aria-expanded]="openDropdown() === item.label"
										aria-haspopup="true"
										(mouseenter)="setDropdown(item.label)"
										(mouseleave)="clearDropdownDelayed()"
										(click)="toggleDropdown(item.label)"
										(keydown.escape)="clearDropdown()"
									>
										{{ item.label }}
										<svg class="w-3.5 h-3.5 transition-transform duration-200 flex-shrink-0"
											 [class.rotate-180]="openDropdown() === item.label"
											 style="color:#00aaff"
											 fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
										</svg>
									</button>

									@if (openDropdown() === item.label) {
										<div
											class="gn-drop absolute top-[calc(100%+8px)] left-0 z-50 bg-white
                             rounded-2xl border border-[#eef1ff] min-w-[260px] py-2
                             shadow-[0_8px_40px_rgba(26,37,96,0.14)]"
											role="menu"
											[attr.aria-label]="item.label + ' submenu'"
											(mouseenter)="setDropdown(item.label)"
											(mouseleave)="clearDropdownDelayed()"
										>
											@if (item.route) {
												<a [routerLink]="item.route" role="menuitem"
												   class="flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold
                                  text-[#1a2560] border-b border-[#eef1ff] mb-1
                                  hover:bg-[#eef4ff] transition-colors"
												   (click)="clearDropdown()">
													<svg class="w-4 h-4 flex-shrink-0" style="color:#1a35d4"
														 fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 6h16M4 12h10"/>
													</svg>
													View All {{ item.label }}
												</a>
											}
											@for (child of item.children; track child.label) {
												<a [routerLink]="child.route" role="menuitem"
												   class="flex items-center gap-3 px-4 py-2.5 mx-1.5 text-sm font-medium
                                  text-[#374151] rounded-xl hover:bg-[#eef4ff] hover:text-[#1a2560]
                                  transition-all duration-100 hover:pl-5"
												   (click)="clearDropdown()">
                          <span class="w-8 h-8 rounded-xl bg-[#eef4ff] flex items-center
                                       justify-center text-base flex-shrink-0">
                            {{ child.icon }}
                          </span>
													<div class="min-w-0">
														<span class="block font-semibold text-[#1a2560] leading-tight truncate">{{ child.label }}</span>
														@if (child.description) {
															<span class="block text-xs text-gray-400 mt-0.5 truncate">{{ child.description }}</span>
														}
													</div>
												</a>
											}
										</div>
									}

								} @else {
									<a [routerLink]="item.route" role="menuitem"
									   class="flex items-center text-sm font-semibold px-3 py-2 rounded-xl
                            transition-colors duration-150 text-[#1a2560]
                            hover:text-[#1a35d4] hover:bg-[#eef1ff]"
									   routerLinkActive="!text-[#1a35d4] !bg-[#eef4ff]"
									   [routerLinkActiveOptions]="{ exact: item.route === '/' }">
										{{ item.label }}
									</a>
								}

							</div>
						}
					</div>

					<!-- ── Desktop: Search + CTA ──────────────────────── -->
					<div class="hidden lg:flex items-center gap-2.5">
						<button
							class="w-9 h-9 flex items-center justify-center rounded-xl transition-colors
                     text-[#1a2560] hover:text-[#1a35d4] hover:bg-[#eef1ff]"
							(click)="toggleSearch()"
							[attr.aria-expanded]="searchOpen()"
							aria-label="Toggle search"
						>
							<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
								@if (searchOpen()) {
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
								} @else {
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
								}
							</svg>
						</button>

						<div class="w-px h-6 bg-[#dde3ff]" aria-hidden="true"></div>

						<!-- CTA — gradient matching NEXT text -->
						<a routerLink="/contact"
						   class="inline-flex items-center gap-2 text-sm font-bold text-white
                      px-5 py-2.5 rounded-xl transition-all duration-200
                      hover:-translate-y-px"
						   style="background: linear-gradient(135deg, #1a35d4 0%, #00aaff 100%);
                      box-shadow: 0 4px 16px rgba(26,53,212,0.35);"
						   onmouseover="this.style.boxShadow='0 8px 24px rgba(26,53,212,0.50)'"
						   onmouseout="this.style.boxShadow='0 4px 16px rgba(26,53,212,0.35)'"
						>
							Free Consultation
							<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
							</svg>
						</a>
					</div>

					<!-- ── Mobile: Search + Hamburger ─────────────────── -->
					<div class="flex lg:hidden items-center gap-1">
						<button
							class="w-10 h-10 flex items-center justify-center rounded-xl transition-colors
                     text-[#1a2560] hover:bg-[#eef1ff]"
							(click)="toggleSearch()"
							aria-label="Toggle search"
						>
							<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
							</svg>
						</button>

						<button
							class="w-10 h-10 flex items-center justify-center rounded-xl transition-colors
                     text-[#1a2560] hover:bg-[#eef1ff]"
							(click)="toggleMobileMenu()"
							[attr.aria-expanded]="mobileOpen()"
							aria-controls="mobile-menu"
							aria-label="Toggle mobile navigation"
						>
							<div class="flex flex-col justify-between w-[22px] h-[16px]">
								<span class="hb" [style.transform]="mobileOpen() ? 'translateY(7px) rotate(45deg)' : ''"></span>
								<span class="hb" [style.opacity]="mobileOpen() ? '0' : '1'" [style.width]="mobileOpen() ? '0' : '22px'"></span>
								<span class="hb" [style.transform]="mobileOpen() ? 'translateY(-7px) rotate(-45deg)' : ''"></span>
							</div>
						</button>
					</div>

				</div>

				<!-- ── Search bar ──────────────────────────────────── -->
				@if (searchOpen()) {
					<div class="gn-searchbar border-t border-[#eef1ff] py-3 pb-4">
						<form (ngSubmit)="submitSearch()" role="search">
							<div class="relative max-w-2xl mx-auto">
								<label for="nav-search" class="sr-only">Search Global Next</label>
								<svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
									 style="color:#1a35d4"
									 fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
								</svg>
								<input
									id="nav-search"
									type="search"
									name="q"
									[(ngModel)]="searchQuery"
									placeholder="Search services, visas, destinations…"
									class="form-input pl-12 pr-28"
									autocomplete="off"
									autofocus
									(keydown.escape)="closeSearch()"
								/>
								<button
									type="submit"
									class="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-bold text-white
                         px-4 py-2 rounded-lg transition-all"
									style="background: linear-gradient(135deg,#1a35d4,#00aaff)"
								>
									Search
								</button>
							</div>
						</form>
					</div>
				}

			</nav>

			<!-- ── Mobile drawer ──────────────────────────────────── -->
			@if (mobileOpen()) {
				<div
					id="mobile-menu"
					role="navigation"
					aria-label="Mobile navigation"
					class="gn-mobile-drawer lg:hidden bg-white border-t border-[#eef1ff]
                 shadow-[0_12px_40px_rgba(26,37,96,0.12)]
                 max-h-[80vh] overflow-y-auto"
				>
					<div class="container-custom py-4 space-y-1 pb-6">

						@for (item of navItems; track item.label) {
							@if (item.children?.length) {
								<div>
									<button
										class="w-full flex items-center justify-between px-4 py-3.5 rounded-xl
                           text-[#1a2560] font-bold text-[0.9375rem]
                           hover:bg-[#eef4ff] transition-colors"
										(click)="toggleMobileSection(item.label)"
										[attr.aria-expanded]="mobileSection() === item.label"
									>
										{{ item.label }}
										<svg class="w-4 h-4 transition-transform duration-200 flex-shrink-0"
											 [class.rotate-180]="mobileSection() === item.label"
											 style="color:#00aaff"
											 fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
										</svg>
									</button>

									@if (mobileSection() === item.label) {
										<div class="ml-3 mt-1 space-y-0.5 pb-1">
											@if (item.route) {
												<a [routerLink]="item.route"
												   class="flex items-center gap-2 px-4 py-2.5 text-sm font-bold
                                  rounded-xl hover:bg-[#eef4ff] transition-colors"
												   style="color:#1a35d4"
												   (click)="closeMobileMenu()">
													<svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24"
														 stroke="currentColor" aria-hidden="true">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
													</svg>
													View All {{ item.label }}
												</a>
											}
											@for (child of item.children; track child.label) {
												<a [routerLink]="child.route"
												   class="flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl
                                  text-[#374151] hover:bg-[#eef4ff] hover:text-[#1a2560] transition-colors"
												   (click)="closeMobileMenu()">
                          <span class="w-8 h-8 rounded-xl bg-[#eef4ff] flex items-center
                                       justify-center text-base flex-shrink-0">
                            {{ child.icon }}
                          </span>
													<span class="font-semibold text-[#1a2560]">{{ child.label }}</span>
												</a>
											}
										</div>
									}
								</div>

							} @else {
								<a [routerLink]="item.route"
								   class="flex px-4 py-3.5 rounded-xl text-[#1a2560] font-bold text-[0.9375rem]
                          hover:bg-[#eef4ff] hover:text-[#1a35d4] transition-colors"
								   routerLinkActive="text-[#1a35d4] bg-[#eef4ff]"
								   (click)="closeMobileMenu()">
									{{ item.label }}
								</a>
							}
						}

						<!-- Mobile CTA -->
						<div class="pt-4 border-t border-[#eef1ff]">
							<a routerLink="/contact"
							   class="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl
                        text-white font-bold text-[0.9375rem] transition-all"
							   style="background: linear-gradient(135deg, #1a35d4 0%, #00aaff 100%);
                        box-shadow: 0 4px 16px rgba(26,53,212,0.30);"
							   (click)="closeMobileMenu()">
								Book Free Consultation
								<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
								</svg>
							</a>

							<!-- Contact quick links on mobile -->
							<div class="flex items-center justify-center gap-4 mt-3">
								<a href="tel:+61390000000"
								   class="flex items-center gap-1.5 text-sm font-semibold text-[#1a2560] hover:text-[#1a35d4]">
									<svg class="w-4 h-4" style="color:#00aaff" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
											  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
									</svg>
									Call Us
								</a>
								<a href="mailto:info@globalnext.com.au"
								   class="flex items-center gap-1.5 text-sm font-semibold text-[#1a2560] hover:text-[#1a35d4]">
									<svg class="w-4 h-4" style="color:#00aaff" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
											  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
									</svg>
									Email Us
								</a>
							</div>
						</div>

					</div>
				</div>
			}

		</header>

		<!-- Click-away backdrops -->
		@if (openDropdown()) {
			<div class="fixed inset-0 z-40" aria-hidden="true" (click)="clearDropdown()"></div>
		}
		@if (mobileOpen()) {
			<div class="fixed inset-0 z-40 lg:hidden bg-[#1a2560]/10"
				 aria-hidden="true" (click)="closeMobileMenu()"></div>
		}
	`,
})
export class NavbarComponent implements OnInit, OnDestroy {
	readonly navItems = NAV_ITEMS;

	scrolled      = signal(false);
	mobileOpen    = signal(false);
	searchOpen    = signal(false);
	openDropdown  = signal<string | null>(null);
	mobileSection = signal<string | null>(null);
	searchQuery   = '';

	private _dropdownTimer: ReturnType<typeof setTimeout> | null = null;
	private _routerSub!: Subscription;
	private router = inject(Router);

	ngOnInit(): void {
		this._routerSub = this.router.events
			.pipe(filter((e) => e instanceof NavigationEnd))
			.subscribe(() => {
				this.clearDropdown();
				this.closeMobileMenu();
				this.closeSearch();
			});
	}

	ngOnDestroy(): void {
		this._routerSub?.unsubscribe();
		if (this._dropdownTimer) clearTimeout(this._dropdownTimer);
	}

	@HostListener('window:scroll')
	onScroll(): void { this.scrolled.set(window.scrollY > 30); }

	@HostListener('document:keydown.escape')
	onEsc(): void {
		this.clearDropdown();
		this.closeSearch();
		if (this.mobileOpen()) this.closeMobileMenu();
	}

	setDropdown(label: string): void {
		if (this._dropdownTimer) clearTimeout(this._dropdownTimer);
		this.openDropdown.set(label);
	}
	clearDropdown(): void { this.openDropdown.set(null); }
	clearDropdownDelayed(): void {
		this._dropdownTimer = setTimeout(() => this.openDropdown.set(null), 150);
	}
	toggleDropdown(label: string): void {
		this.openDropdown.set(this.openDropdown() === label ? null : label);
	}

	toggleMobileMenu(): void {
		const next = !this.mobileOpen();
		this.mobileOpen.set(next);
		document.body.style.overflow = next ? 'hidden' : '';
		if (!next) this.mobileSection.set(null);
	}
	closeMobileMenu(): void {
		this.mobileOpen.set(false);
		this.mobileSection.set(null);
		document.body.style.overflow = '';
	}
	toggleMobileSection(label: string): void {
		this.mobileSection.set(this.mobileSection() === label ? null : label);
	}

	toggleSearch(): void {
		this.searchOpen.update((v) => !v);
		if (!this.searchOpen()) this.searchQuery = '';
	}
	closeSearch(): void {
		this.searchOpen.set(false);
		this.searchQuery = '';
	}
	submitSearch(): void {
		const q = this.searchQuery.trim();
		if (!q) return;
		this.router.navigate(['/search'], { queryParams: { q } });
		this.closeSearch();
	}
}
