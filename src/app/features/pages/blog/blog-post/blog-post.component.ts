import {
	Component, signal, OnInit, inject,
	ElementRef, AfterViewInit, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { BlogService, BlogPost } from '../../../../shared-services/api-service/blog.service';

@Component({
	selector: 'app-blog-post',
	standalone: true,
	imports: [CommonModule, RouterModule],
	styles: [`
		:host { display: block; }

		.rv { opacity:0; transform:translateY(24px); transition:opacity .6s ease,transform .6s ease; }
		.rv.in { opacity:1; transform:none; }
		.rv-l { opacity:0; transform:translateX(-24px); transition:opacity .6s ease,transform .6s ease; }
		.rv-l.in { opacity:1; transform:none; }

		.hero-media { position:relative; overflow:hidden; border-radius:1.5rem; border:1.5px solid #eef1ff; box-shadow:0 8px 40px rgba(26,37,96,.12); }
		.hero-media img,.hero-media video { width:100%; display:block; max-height:520px; object-fit:cover; }
		.hero-media iframe { width:100%; aspect-ratio:16/9; border:none; display:block; }
		.hero-media-emoji { width:100%; aspect-ratio:16/9; display:flex; align-items:center; justify-content:center; font-size:6rem; }

		.prose-body { color:#374151; font-size:.9625rem; line-height:1.85; }
		.prose-body h2 { font-family:'Playfair Display',Georgia,serif; font-size:1.5rem; font-weight:700; color:#1a2560; margin:2rem 0 .75rem; padding-bottom:.5rem; border-bottom:2px solid #eef1ff; }
		.prose-body h3 { font-family:'Playfair Display',Georgia,serif; font-size:1.15rem; font-weight:700; color:#1a2560; margin:1.5rem 0 .5rem; }
		.prose-body p { margin-bottom:1.2rem; }
		.prose-body ul { list-style:disc; padding-left:1.4rem; margin-bottom:1.2rem; }
		.prose-body ol { list-style:decimal; padding-left:1.4rem; margin-bottom:1.2rem; }
		.prose-body li { margin-bottom:.4rem; }
		.prose-body strong { color:#1a2560; font-weight:700; }
		.prose-body a { color:#1a35d4; text-decoration:underline; }
		.prose-body blockquote { border-left:4px solid #1a35d4; margin:1.5rem 0; padding:.75rem 1.25rem; background:#f0f4ff; border-radius:0 .75rem .75rem 0; font-style:italic; }
		.prose-body code { background:#f0f4ff; color:#1a35d4; font-size:.85em; padding:.15em .4em; border-radius:.3rem; font-family:monospace; }
		.prose-body hr { border:none; border-top:2px solid #eef1ff; margin:2rem 0; }

		.cat-chip { display:inline-block; font-size:.7rem; font-weight:700; padding:.25rem .65rem; border-radius:999px; background:#eef4ff; color:#1a35d4; }
		.s-card { background:#fff; border-radius:1.25rem; border:1.5px solid #eef1ff; box-shadow:0 2px 16px rgba(26,37,96,.06); padding:1.4rem; }

		.rel-card { background:#fff; border-radius:1rem; border:1.5px solid #eef1ff; overflow:hidden; text-decoration:none; color:inherit; display:block; transition:all .22s ease; }
		.rel-card:hover { border-color:#1a35d4; transform:translateY(-3px); box-shadow:0 12px 32px rgba(26,37,96,.12); }
		.rel-thumb { aspect-ratio:16/9; overflow:hidden; background:#eef4ff; display:flex; align-items:center; justify-content:center; font-size:2.5rem; }
		.rel-thumb img { width:100%; height:100%; object-fit:cover; display:block; }

		.toc-link { display:block; padding:.35rem .75rem; font-size:.8rem; color:#4b5563; font-weight:500; border-left:2px solid #eef1ff; text-decoration:none; transition:all .15s; }
		.toc-link:hover { color:#1a35d4; border-color:#1a35d4; background:#f8f9ff; }

		@keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
		.skeleton { border-radius:.75rem; background:linear-gradient(90deg,#f0f2ff 25%,#e4e8ff 50%,#f0f2ff 75%); background-size:800px 100%; animation:shimmer 1.4s infinite; }
	`],
	template: `

		<!-- ══ LOADING ══ -->
		@if (loading()) {
			<div style="background:linear-gradient(135deg,#0d1235 0%,#1a35d4 60%,#00aaff 100%)" class="py-12 sm:py-16">
				<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
					<div class="skeleton h-4 w-32 rounded-full"></div>
					<div class="skeleton h-10 w-3/4 rounded-xl"></div>
					<div class="skeleton h-6 w-1/2 rounded-xl"></div>
					<div class="flex gap-3 pt-2">
						<div class="skeleton w-11 h-11 rounded-full flex-shrink-0"></div>
						<div class="space-y-2 flex-1">
							<div class="skeleton h-3 w-28 rounded"></div>
							<div class="skeleton h-3 w-20 rounded"></div>
						</div>
					</div>
				</div>
			</div>
			<div class="py-12 bg-[#f8f9ff]">
				<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
					<div class="grid lg:grid-cols-3 gap-10">
						<div class="lg:col-span-2 space-y-5">
							<div class="skeleton h-72 rounded-2xl"></div>
							<div class="bg-white rounded-2xl border border-[#eef1ff] p-8 space-y-4">
								<div class="skeleton h-4 w-full rounded"></div>
								<div class="skeleton h-4 w-5/6 rounded"></div>
								<div class="skeleton h-4 w-4/6 rounded"></div>
								<div class="skeleton h-8 w-1/3 rounded-xl mt-2"></div>
								<div class="skeleton h-4 w-full rounded"></div>
								<div class="skeleton h-4 w-full rounded"></div>
								<div class="skeleton h-4 w-2/3 rounded"></div>
							</div>
						</div>
						<div class="space-y-4">
							<div class="skeleton h-40 rounded-2xl"></div>
							<div class="skeleton h-48 rounded-2xl"></div>
							<div class="skeleton h-36 rounded-2xl"></div>
						</div>
					</div>
				</div>
			</div>
		}

		<!-- ══ ERROR ══ -->
		@if (!loading() && errMsg()) {
			<div class="min-h-screen flex items-center justify-center bg-[#f8f9ff]">
				<div class="text-center py-20 px-4">
					<div class="text-7xl mb-5">⚠️</div>
					<h1 class="text-2xl font-bold text-[#1a2560] mb-3">Failed to Load Article</h1>
					<p class="text-gray-400 text-sm mb-6">{{ errMsg() }}</p>
					<div class="flex gap-3 justify-center flex-wrap">
						<button (click)="loadPost()"
								class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white border-none cursor-pointer"
								style="background:linear-gradient(135deg,#1a35d4,#00aaff)">
							🔄 Try Again
						</button>
						<a routerLink="/blog"
						   class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border border-[#dde3ff] text-[#1a2560] no-underline">
							← Back to Blog
						</a>
					</div>
				</div>
			</div>
		}

		<!-- ══ 404 ══ -->
		@if (!loading() && !errMsg() && !post()) {
			<div class="min-h-screen flex items-center justify-center bg-[#f8f9ff]">
				<div class="text-center py-20 px-4">
					<div class="text-7xl mb-5" aria-hidden="true">🔍</div>
					<h1 class="text-3xl font-bold text-[#1a2560] mb-3">Article Not Found</h1>
					<p class="text-gray-500 text-sm mb-6">This article may have been moved or deleted.</p>
					<a routerLink="/blog"
					   class="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm no-underline"
					   style="background:linear-gradient(135deg,#1a35d4,#00aaff)">
						← Back to Blog
					</a>
				</div>
			</div>
		}

		<!-- ══ ARTICLE ══ -->
		@if (!loading() && !errMsg() && post()) {

			<!-- HERO -->
			<section style="background:linear-gradient(135deg,#0d1235 0%,#1a35d4 60%,#00aaff 100%)"
					 class="py-12 sm:py-16 relative overflow-hidden">
				<div class="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
					 style="background:radial-gradient(circle,rgba(0,170,255,.15) 0%,transparent 70%);transform:translate(30%,-30%)"></div>
				<div class="absolute bottom-0 left-0 w-72 h-72 rounded-full pointer-events-none"
					 style="background:radial-gradient(circle,rgba(26,53,212,.2) 0%,transparent 70%);transform:translate(-30%,30%)"></div>

				<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
					<nav aria-label="Breadcrumb" class="mb-6">
						<ol class="flex items-center gap-2 text-sm flex-wrap">
							<li><a routerLink="/" class="text-blue-300 hover:text-white transition-colors">Home</a></li>
							<li class="text-blue-400">/</li>
							<li><a routerLink="/blog" class="text-blue-300 hover:text-white transition-colors">Blog</a></li>
							<li class="text-blue-400">/</li>
							<li><span class="text-white font-medium" aria-current="page">{{ post()!.category }}</span></li>
						</ol>
					</nav>

					<div class="max-w-3xl">
						<div class="flex flex-wrap items-center gap-2 mb-5">
							<span class="cat-chip">{{ post()!.category }}</span>
							@if (post()!.mediaType === 'youtube') {
								<span class="cat-chip" style="background:#fee2e2;color:#dc2626">▶ YouTube Video</span>
							} @else if (post()!.mediaType === 'video') {
								<span class="cat-chip" style="background:#ede9fe;color:#7c3aed">▶ Video</span>
							}
							@for (tag of (post()!.tags ?? []).slice(0, 3); track tag) {
								<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-blue-100">#{{ tag }}</span>
							}
						</div>

						<h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.15] mb-5">
							{{ post()!.title }}
						</h1>
						<p class="text-blue-100/90 text-base sm:text-xl leading-relaxed mb-6 max-w-2xl">
							{{ post()!.excerpt }}
						</p>

						<div class="flex flex-wrap items-center gap-5 text-sm">
							<div class="flex items-center gap-3">
								<div class="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
									 [style.background]="post()!.authorColor || '#1a35d4'">
									{{ post()!.initials }}
								</div>
								<div>
									<p class="font-bold text-white">{{ post()!.author }}</p>
									<p class="text-blue-200 text-xs">{{ post()!.authorRole }}</p>
								</div>
							</div>
							<div class="flex items-center gap-4 text-blue-200 text-xs">
								<span class="flex items-center gap-1">
									<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
											  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
									</svg>
									<time>{{ svc.formatDate(post()!.createdAt) }}</time>
								</span>
								<span class="flex items-center gap-1">
									<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
											  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
									</svg>
									{{ post()!.readTime }}
								</span>
							</div>
						</div>
					</div>
				</div>
			</section>

			<!-- BODY -->
			<div class="py-12 sm:py-16 bg-[#f8f9ff]">
				<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
					<div class="grid lg:grid-cols-3 gap-10 xl:gap-14 items-start">

						<!-- Article -->
						<article class="lg:col-span-2 rv-l">

							<!-- Hero media -->
							<div class="hero-media mb-8">
								@if (post()!.mediaType === 'image' && post()!.imageUrl) {
									<img [src]="post()!.imageUrl" [alt]="post()!.imageAlt || post()!.title" loading="eager"/>
								} @else if (post()!.mediaType === 'youtube' && post()!.youtubeId) {
									<iframe [src]="safeYtEmbed(post()!.youtubeId!)"
											title="Video: {{ post()!.title }}"
											allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
											allowfullscreen loading="lazy">
									</iframe>
								} @else if (post()!.mediaType === 'video' && post()!.videoUrl) {
									<video [src]="post()!.videoUrl" controls preload="metadata" [attr.aria-label]="post()!.title">
										Your browser does not support HTML5 video.
									</video>
								} @else {
									<div class="hero-media-emoji"
										 [style.background]="'linear-gradient(135deg,' + (post()!.authorColor || '#1a35d4') + '18,' + (post()!.authorColor || '#1a35d4') + '30)'">
										{{ post()!.fallbackEmoji || catEmoji(post()!.category) }}
									</div>
								}
							</div>

							<!-- Content card -->
							<div class="bg-white rounded-2xl border border-[#eef1ff] shadow-[0_2px_24px_rgba(26,37,96,.07)] p-7 sm:p-10">
								<div class="prose-body" [innerHTML]="bodyHtml()"></div>

								@if ((post()!.tags ?? []).length > 0) {
									<div class="flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-[#eef1ff]">
										<span class="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">Tags:</span>
										@for (tag of post()!.tags; track tag) {
											<span class="text-[11px] font-semibold px-2.5 py-1 rounded-full border border-[#dde3ff] bg-[#f8f9ff] text-[#1a35d4]">
												#{{ tag }}
											</span>
										}
									</div>
								}

								<!-- Share -->
								<div class="flex flex-wrap items-center gap-3 mt-5">
									<span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Share:</span>
									<a [href]="shareTwitter()" target="_blank" rel="noopener"
									   class="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-[#1da1f2]/10 text-[#1da1f2] hover:bg-[#1da1f2]/20 transition-colors">
										<svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
											<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
										</svg>
										X / Twitter
									</a>
									<a [href]="shareFacebook()" target="_blank" rel="noopener"
									   class="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-[#1877f2]/10 text-[#1877f2] hover:bg-[#1877f2]/20 transition-colors">
										<svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
											<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
										</svg>
										Facebook
									</a>
									<a [href]="shareLinkedIn()" target="_blank" rel="noopener"
									   class="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-[#0077b5]/10 text-[#0077b5] hover:bg-[#0077b5]/20 transition-colors">
										<svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
											<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/>
										</svg>
										LinkedIn
									</a>
								</div>
							</div>

							<!-- Author bio -->
							<div class="bg-white rounded-2xl border border-[#eef1ff] shadow-[0_2px_18px_rgba(26,37,96,.06)] p-6 sm:p-8 mt-6 flex items-start gap-5">
								<div class="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
									 [style.background]="post()!.authorColor || '#1a35d4'">
									{{ post()!.initials }}
								</div>
								<div>
									<p class="font-bold text-[#1a2560] text-lg">{{ post()!.author }}</p>
									<p class="text-[#1a35d4] text-xs font-semibold mb-2">{{ post()!.authorRole }}</p>
									<p class="text-gray-500 text-sm leading-relaxed">
										Our {{ post()!.authorRole }} brings years of hands-on experience helping
										international students navigate visa applications, university admissions, and
										English test preparation across Australia, UK, Canada, USA, and New Zealand.
									</p>
									<a routerLink="/contact"
									   class="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-[#1a35d4] hover:underline">
										Book a consultation with {{ post()!.author.split(' ')[0] }} →
									</a>
								</div>
							</div>

						</article>

						<!-- Sidebar -->
						<aside class="space-y-5 lg:sticky lg:top-28">

							@if (tocItems().length > 0) {
								<div class="s-card rv">
									<h3 class="font-bold text-[#1a2560] text-xs uppercase tracking-wider mb-3">
										📋 In This Article
									</h3>
									<nav aria-label="Table of contents">
										@for (h of tocItems(); track h.id) {
											<a [href]="'#' + h.id" class="toc-link"
											   (click)="onTocClick($event, h.id)">{{ h.text }}</a>
										}
									</nav>
								</div>
							}

							<div class="rv"
								 style="background:linear-gradient(135deg,#0d1235,#1a35d4);border-radius:1.25rem;padding:1.5rem">
								<div class="text-3xl mb-2">🎓</div>
								<h3 class="text-base font-bold text-white mb-2">Need Help?</h3>
								<p class="text-blue-200 text-sm leading-relaxed mb-4">
									Book a free consultation with our migration agents and education consultants.
								</p>
								<a routerLink="/contact"
								   class="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white font-bold text-[#1a35d4] text-sm hover:bg-[#eef4ff] transition-colors no-underline">
									Book Free Consultation →
								</a>
							</div>

							@if (sameCatPosts().length > 0) {
								<div class="s-card rv">
									<h3 class="font-bold text-[#1a2560] text-xs uppercase tracking-wider mb-3">
										More in {{ post()!.category }}
									</h3>
									<div class="space-y-3">
										@for (p of sameCatPosts(); track p.id) {
											<a [routerLink]="['/blog', p.slug]" class="flex items-start gap-3 group no-underline">
												<div class="w-14 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#eef4ff] flex items-center justify-center text-lg">
													@if (p.mediaType === 'image' && p.imageUrl) {
														<img [src]="p.imageUrl" [alt]="p.title" loading="lazy" class="w-full h-full object-cover"/>
													} @else if (p.mediaType === 'youtube' && p.youtubeId) {
														<img [src]="ytThumb(p.youtubeId)" [alt]="p.title" loading="lazy" class="w-full h-full object-cover"/>
													} @else {
														{{ p.fallbackEmoji || catEmoji(p.category) }}
													}
												</div>
												<div class="min-w-0">
													<p class="text-xs font-bold text-[#1a2560] line-clamp-2 leading-snug group-hover:text-[#1a35d4] transition-colors">
														{{ p.title }}
													</p>
													<p class="text-[10px] text-gray-400 mt-0.5">{{ p.readTime }}</p>
												</div>
											</a>
										}
									</div>
								</div>
							}

							@if ((post()!.tags ?? []).length > 0) {
								<div class="s-card rv">
									<h3 class="font-bold text-[#1a2560] text-xs uppercase tracking-wider mb-3">Tags</h3>
									<div class="flex flex-wrap gap-1.5">
										@for (tag of post()!.tags; track tag) {
											<a [routerLink]="['/blog']" [queryParams]="{q: tag}"
											   class="text-[11px] font-semibold px-2.5 py-1 rounded-full border border-[#dde3ff] bg-white text-gray-500 hover:border-[#1a35d4] hover:text-[#1a35d4] hover:bg-[#eef4ff] transition-all no-underline">
												#{{ tag }}
											</a>
										}
									</div>
								</div>
							}

						</aside>
					</div>

					<!-- Related posts -->
					@if (relatedPosts().length > 0) {
						<div class="mt-14 rv">
							<div class="flex items-center justify-between mb-6">
								<h2 class="text-2xl font-bold text-[#1a2560]">Related Articles</h2>
								<a routerLink="/blog" class="text-sm font-bold text-[#1a35d4] hover:underline">
									All Articles →
								</a>
							</div>
							<div class="grid sm:grid-cols-3 gap-5">
								@for (p of relatedPosts(); track p.id) {
									<a class="rel-card" [routerLink]="['/blog', p.slug]">
										<div class="rel-thumb">
											@if (p.mediaType === 'image' && p.imageUrl) {
												<img [src]="p.imageUrl" [alt]="p.title" loading="lazy"/>
											} @else if (p.mediaType === 'youtube' && p.youtubeId) {
												<img [src]="ytThumb(p.youtubeId)" [alt]="p.title" loading="lazy" class="w-full h-full object-cover"/>
											} @else {
												{{ p.fallbackEmoji || catEmoji(p.category) }}
											}
										</div>
										<div class="p-4">
											<span class="cat-chip mb-2 inline-block">{{ p.category }}</span>
											<h3 class="text-sm font-bold text-[#1a2560] leading-snug line-clamp-2 mb-2">
												{{ p.title }}
											</h3>
											<p class="text-[10px] text-gray-400">
												{{ svc.formatDate(p.createdAt) }} · {{ p.readTime }}
											</p>
										</div>
									</a>
								}
							</div>
						</div>
					}

				</div>
			</div>

			<!-- BOTTOM CTA -->
			<section class="py-14 sm:py-16"
					 style="background:linear-gradient(135deg,#0d1235 0%,#1a35d4 55%,#00aaff 100%)">
				<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center rv">
					<h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-5">
						Need Personalised Guidance?
					</h2>
					<p class="text-white/80 text-base sm:text-lg max-w-xl mx-auto mb-8">
						Book a free consultation with our registered migration agents and education consultants.
					</p>
					<div class="flex flex-col sm:flex-row gap-4 justify-center">
						<a routerLink="/contact"
						   class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white font-bold rounded-xl text-sm sm:text-base transition-all hover:-translate-y-px no-underline"
						   style="color:#1a35d4;box-shadow:0 4px 20px rgba(255,255,255,.2)">
							Book Free Consultation
							<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
							</svg>
						</a>
						<a routerLink="/blog"
						   class="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-sm sm:text-base border-2 border-white/40 text-white hover:bg-white/10 transition-all no-underline">
							← Back to Blog
						</a>
					</div>
				</div>
			</section>

		}
	`,
})
export class BlogPostComponent implements OnInit, AfterViewInit, OnDestroy {

	private route = inject(ActivatedRoute);
	svc = inject(BlogService);
	private sanitizer = inject(DomSanitizer);
	private el = inject(ElementRef);
	private meta = inject(Meta);
	private titleSvc = inject(Title);
	private subs: Subscription[] = [];

	post = signal<BlogPost | undefined>(undefined);
	loading = signal(true);
	errMsg = signal('');
	bodyHtml = signal('');
	tocItems = signal<{ id: string; text: string }[]>([]);
	sameCatPosts = signal<BlogPost[]>([]);
	relatedPosts = signal<BlogPost[]>([]);

	private _obs!: IntersectionObserver;

	// ── Helpers ──────────────────────────────────────────────────────
	safeYtEmbed(id: string): SafeResourceUrl {
		return this.sanitizer.bypassSecurityTrustResourceUrl(
			`https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`
		);
	}

	ytThumb(id: string): string {
		return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
	}

	catEmoji(cat: string): string {
		const m: Record<string, string> = {
			'Visa News': '📋', 'Study Tips': '📚', 'Scholarships': '🎓',
			'Life Abroad': '🌏', 'PTE / IELTS': '📝', 'University Guide': '🏫',
		};
		return m[cat] ?? '📰';
	}

	shareTwitter(): string {
		return `https://twitter.com/intent/tweet?text=${encodeURIComponent(this.post()?.title ?? '')}&url=${encodeURIComponent(window.location.href)}`;
	}

	shareFacebook(): string {
		return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
	}

	shareLinkedIn(): string {
		return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
	}

	onTocClick(e: Event, id: string): void {
		e.preventDefault();
		document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	// ── Load ─────────────────────────────────────────────────────────
	loadPost(): void {
		const slug = (this.route.snapshot.paramMap.get('slug') || this.route.snapshot.paramMap.get('id')) ?? '';

		this.loading.set(true);
		this.errMsg.set('');

		this.subs.push(
			this.svc.getPostBySlug(slug).subscribe({
				next: (found) => {
					this.post.set(found ?? undefined);
					this.loading.set(false);
					if (found) this.processPost(found);
					setTimeout(() => this.observeElements(), 100);
				},
				error: (e) => {
					this.errMsg.set(e?.message ?? 'Failed to load article.');
					this.loading.set(false);
					setTimeout(() => this.observeElements(), 100);
				}
			})
		);
	}

	private processPost(found: BlogPost): void {
		// Set body HTML
		this.bodyHtml.set(found.content ?? `<p>${found.excerpt}</p>`);

		// Build TOC from headings
		const parser = new DOMParser();
		const doc = parser.parseFromString(found.content ?? '', 'text/html');
		this.tocItems.set(
			Array.from(doc.querySelectorAll('h2,h3')).map(h => ({
				id: h.textContent!.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
				text: h.textContent!.trim(),
			}))
		);

		// SEO
		this.titleSvc.setTitle(`${found.title} | Global Next Blog`);
		this.meta.updateTag({ name: 'description', content: found.excerpt });
		this.meta.updateTag({ property: 'og:title', content: found.title });
		this.meta.updateTag({ property: 'og:description', content: found.excerpt });
		if (found.imageUrl) this.meta.updateTag({ property: 'og:image', content: found.imageUrl });

		// Load related posts from service
		this.subs.push(
			this.svc.getAllPosts().subscribe({
				next: (all) => {
					const pub = all.filter(p => p.published !== false && p.id !== found.id);

					this.sameCatPosts.set(
						pub.filter(p => p.category === found.category).slice(0, 4)
					);

					const byTags = pub
						.filter(p => p.category !== found.category)
						.filter(p => (p.tags ?? []).some(t => (found.tags ?? []).includes(t)));

					this.relatedPosts.set(
						byTags.length >= 3 ? byTags.slice(0, 3) : pub.slice(0, 3)
					);

					setTimeout(() => this.observeElements(), 50);
				},
				error: () => { /* sidebar fails silently */ }
			})
		);
	}

	// ── Scroll reveal ─────────────────────────────────────────────────
	private observeElements(): void {
		if (!this._obs) return;
		this.el.nativeElement.querySelectorAll('.rv,.rv-l')
			.forEach((el: Element) => {
				el.classList.remove('in');
				this._obs.observe(el);
			});
	}

	// ── Lifecycle ─────────────────────────────────────────────────────
	ngOnInit(): void {
		this.loadPost();
	}

	ngAfterViewInit(): void {
		this._obs = new IntersectionObserver(entries => {
			entries.forEach(e => {
				if (e.isIntersecting) {
					e.target.classList.add('in');
					this._obs.unobserve(e.target);
				}
			});
		}, { threshold: 0.10 });
		this.observeElements();
	}

	ngOnDestroy(): void {
		this.subs.forEach(s => s.unsubscribe());
		this._obs?.disconnect();
	}
}
