import { Injectable, Inject, DOCUMENT } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface SeoConfig {
	title?: string;
	description?: string;
	keywords?: string;
	image?: string;
	noIndex?: boolean;
}

@Injectable({ providedIn: 'root' })
export class SeoService {

	private readonly defaultTitle = 'Global Next | Study Abroad Nepal';
	private readonly defaultDescription =
		'Global Next Kathmandu helps students achieve their study abroad dreams.';
	private readonly defaultKeywords =
		'study abroad Nepal, student visa Nepal';
	private readonly defaultImage =
		'/assets/logo.png';

	constructor(
		private titleService: Title,
		private meta: Meta,
		@Inject(DOCUMENT) private document: Document
	) {}

	update(config?: SeoConfig): void {

		const seo: Required<SeoConfig> = {
			title: config?.title || this.defaultTitle,
			description: config?.description || this.defaultDescription,
			keywords: config?.keywords || this.defaultKeywords,
			image: config?.image || this.getAbsoluteImageUrl(this.defaultImage),
			noIndex: config?.noIndex ?? false
		};

		this.titleService.setTitle(seo.title);

		this.updateMetaTag('name', 'description', seo.description);
		this.updateMetaTag('name', 'keywords', seo.keywords);

		this.updateMetaTag('property', 'og:title', seo.title);
		this.updateMetaTag('property', 'og:description', seo.description);
		this.updateMetaTag('property', 'og:image', seo.image);
		this.updateMetaTag('property', 'og:type', 'website');
		this.updateMetaTag('property', 'og:url', this.document.URL);

		this.updateMetaTag('name', 'twitter:card', 'summary_large_image');
		this.updateMetaTag('name', 'twitter:title', seo.title);
		this.updateMetaTag('name', 'twitter:description', seo.description);
		this.updateMetaTag('name', 'twitter:image', seo.image);

		if (seo.noIndex) {
			this.updateMetaTag('name', 'robots', 'noindex, nofollow');
		} else {
			this.updateMetaTag('name', 'robots', 'index, follow');
		}

		this.setCanonical(this.document.URL);
	}


	private updateMetaTag(type: 'name' | 'property', key: string, content: string) {
		if (!content) return;
		this.meta.updateTag({ [type]: key, content });
	}

	private setCanonical(url: string): void {
		let link: HTMLLinkElement =
			this.document.querySelector("link[rel='canonical']") ||
			this.document.createElement('link');

		link.setAttribute('rel', 'canonical');
		link.setAttribute('href', url);

		if (!link.parentNode) {
			this.document.head.appendChild(link);
		}
	}

	private getAbsoluteImageUrl(path: string): string {
		if (path.startsWith('http')) {
			return path;
		}
		return `${this.document.location.origin}${path}`;
	}
}
