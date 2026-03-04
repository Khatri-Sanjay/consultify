import { Injectable } from '@angular/core';
import {
	collection,
	query,
	where,
	orderBy,
	limit,
	getDocs,
	getDoc,
	doc,
	addDoc,
	updateDoc,
	deleteDoc,
	serverTimestamp,
	Timestamp,
	increment,
} from 'firebase/firestore';
import { db } from '../../crux/config/firebase.config';
import { catchError, from, map, Observable, of } from 'rxjs';

export type NewsletterTag =
	| 'Policy Update'
	| 'Scholarships'
	| 'Year in Review'
	| 'Visa News'
	| 'University Update'
	| 'Student Story'
	| 'General';

export type NewsletterStatus = 'draft' | 'published';

export interface Newsletter {
	id?: string;
	title: string;
	excerpt: string;
	content: string;
	tag: NewsletterTag;
	status: NewsletterStatus;
	month: string;
	year: string;
	readTime: string;
	coverImage?: string;
	author: string;
	authorTitle: string;
	authorAvatar?: string;
	viewCount: number;
	featured: boolean;
	slug: string;
	publishedAt?: Timestamp | Date;
	createdAt?: Timestamp | Date;
	updatedAt?: Timestamp | Date;
}

@Injectable({ providedIn: 'root' })
export class NewsletterService {
	private readonly COL = 'newsletters';
	private _cache: Newsletter[] | null = null;

	getNewsletters(limitN = 50): Observable<Newsletter[]> {
		if (this._cache) return of(this._cache);

		const q = query(
			collection(db, this.COL),
			where('status', '==', 'published'),
			orderBy('publishedAt', 'desc'),
			limit(limitN)
		);
		return from(getDocs(q)).pipe(
			map(snap => {
				const data = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Newsletter, 'id'>) }));
				this._cache = data;
				return data;
			}),
			catchError(err => { throw new Error(err); })
		);
	}

	getLatest(count = 3): Observable<Newsletter[]> {
		const q = query(
			collection(db, this.COL),
			where('status', '==', 'published'),
			orderBy('publishedAt', 'desc'),
			limit(count)
		);
		return from(getDocs(q)).pipe(
			map(snap => snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Newsletter, 'id'>) })))
		);
	}

	getByTag(tag: NewsletterTag): Observable<Newsletter[]> {
		const q = query(
			collection(db, this.COL),
			where('status', '==', 'published'),
			where('tag', '==', tag),
			orderBy('publishedAt', 'desc')
		);
		return from(getDocs(q)).pipe(
			map(snap => snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Newsletter, 'id'>) })))
		);
	}

	getNewsletterBySlug(slug: string): Observable<Newsletter | null> {
		const q = query(collection(db, this.COL), where('slug', '==', slug), limit(1));
		return from(getDocs(q)).pipe(
			map(snap => {
				if (snap.empty) return null;
				const d = snap.docs[0];
				return { id: d.id, ...(d.data() as Omit<Newsletter, 'id'>) };
			})
		);
	}

	getAllForAdmin(): Observable<Newsletter[]> {
		const q = query(collection(db, this.COL), orderBy('createdAt', 'desc'));
		return from(getDocs(q)).pipe(
			map(snap => snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Newsletter, 'id'>) })))
		);
	}

	create(newsletter: Omit<Newsletter, 'id' | 'createdAt' | 'updatedAt' | 'slug' | 'viewCount'>): Observable<string> {
		const isPublished = newsletter.status === 'published';
		const data = {
			...this.clean(newsletter),
			slug: this.slugify(newsletter.title),
			viewCount: 0,
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
			publishedAt: isPublished ? serverTimestamp() : null,
		};

		return from(addDoc(collection(db, this.COL), data)).pipe(
			map(ref => {
				this.clearCache();
				return ref.id;
			})
		);
	}

	update(id: string, data: Partial<Newsletter>): Observable<void> {
		const updates: any = {
			...this.clean(data),
			updatedAt: serverTimestamp(),
		};

		// If transitioning to published for the first time
		if (data.status === 'published') {
			updates.publishedAt = serverTimestamp();
		}

		return from(updateDoc(doc(db, this.COL, id), updates)).pipe(
			map(() => this.clearCache())
		);
	}

	delete(id: string): Observable<void> {
		return from(deleteDoc(doc(db, this.COL, id))).pipe(
			map(() => this.clearCache())
		);
	}

	incrementViews(id: string): void {
		updateDoc(doc(db, this.COL, id), { viewCount: increment(1) }).catch(() => {});
	}

	// ── Utilities ──────────────────────────────────────────────

	clearCache(): void { this._cache = null; }

	private clean<T extends object>(obj: T): Partial<T> {
		return Object.fromEntries(
			Object.entries(obj).filter(([, v]) => v !== undefined)
		) as Partial<T>;
	}

	slugify(title: string): string {
		return title
			.toLowerCase()
			.replace(/[^\w\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-')
			.trim() + '-' + Date.now().toString().slice(-4); // Adding short timestamp for uniqueness
	}

	readTime(content: string): string {
		const words = content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
		return `${Math.max(1, Math.ceil(words / 200))} min read`;
	}

	formatDate(ts?: Timestamp | Date): string {
		if (!ts) return '—';
		const d = ts instanceof Date ? ts : (ts as Timestamp).toDate();
		return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
	}
}
