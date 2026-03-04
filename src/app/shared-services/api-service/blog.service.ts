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
} from 'firebase/firestore';

import { db } from '../../crux/config/firebase.config';
import {catchError, from, map, Observable, of} from 'rxjs';

export type MediaType = 'image' | 'youtube' | 'video' | 'none';

export interface BlogPost {
	id?: string;
	title: string;
	slug: string;
	excerpt: string;
	content: string;
	category: string;
	tags: string[];
	author: string;
	authorRole: string;
	initials: string;
	authorColor: string;
	featured: boolean;
	published: boolean;
	readTime: string;
	mediaType: MediaType;
	imageUrl?: string;
	imageAlt?: string;
	videoUrl?: string;
	youtubeId?: string;
	fallbackEmoji?: string;
	createdAt?: Timestamp | Date;
	updatedAt?: Timestamp | Date;
}

@Injectable({ providedIn: 'root' })
export class BlogService {
	private readonly COL = 'posts';

	private _cache: BlogPost[] | null = null;

	getPosts(limitN = 50): Observable<BlogPost[]> {
		if (this._cache) return of(this._cache);

		const q = query(
			collection(db, this.COL),
			where('published', '==', true),
			orderBy('createdAt', 'desc'),
			limit(limitN)
		);
		return from(getDocs(q)).pipe(
			map(snap => {
				const posts = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<BlogPost, 'id'>) }));
				this._cache = posts; // cache it
				return posts;
			}),
			catchError(err => { throw new Error(err); })
		);
	}

	clearCache(): void { this._cache = null; }

	getAllPosts(): Observable<BlogPost[]> {
		const q = query(
			collection(db, this.COL),
			orderBy('createdAt', 'desc')
		);
		return from(getDocs(q)).pipe(
			map(snap =>
				snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<BlogPost, 'id'>) }))
			),
			catchError(err => { throw new Error(err); })
		);
	}

	getAllPublished(): Observable<BlogPost[]> {
		const q = query(
			collection(db, this.COL),
			where('published', '==', true),
			orderBy('createdAt', 'desc')
		);

		return from(getDocs(q)).pipe(
			map(snap =>
				snap.docs.map(d => ({
					id: d.id,
					...(d.data() as Omit<BlogPost, 'id'>)
				}))
			),
			catchError(err => { throw new Error(err); })
		);
	}

	getPost(id: string): Observable<BlogPost | null> {
		return from(getDoc(doc(db, this.COL, id))).pipe(
			map(snap =>
				snap.exists() ? { id: snap.id, ...(snap.data() as Omit<BlogPost, 'id'>) } : null
			),
			catchError(err => { throw new Error(err); })
		);
	}

	getPostBySlug(slug: string): Observable<BlogPost | null> {
		const q = query(
			collection(db, this.COL),
			where('slug', '==', slug),
			limit(1)
		);
		return from(getDocs(q)).pipe(
			map(snap => {
				if (snap.empty) return null;
				const d = snap.docs[0];
				return { id: d.id, ...(d.data() as Omit<BlogPost, 'id'>) };
			}),
			catchError(err => { throw new Error(err); })
		);
	}

	getByCategory(category: string): Observable<BlogPost[]> {
		const q = query(
			collection(db, this.COL),
			where('published', '==', true),
			where('category', '==', category),
			orderBy('createdAt', 'desc')
		);
		return from(getDocs(q)).pipe(
			map(snap =>
				snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<BlogPost, 'id'>) }))
			),
			catchError(err => { throw new Error(err); })
		);
	}

	create(post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Observable<string> {
		return from(
			addDoc(collection(db, this.COL), {
				...this.clean(post),
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp(),
			})
		).pipe(
			map(ref => ref.id),
			catchError(err => { throw new Error(err); })
		);
	}

	update(id: string, data: Partial<BlogPost>): Observable<void> {
		return from(
			updateDoc(doc(db, this.COL, id), {
				...this.clean(data),
				updatedAt: serverTimestamp(),
			})
		).pipe(catchError(err => { throw new Error(err); }));
	}

	delete(post: BlogPost): Observable<void> {
		if (!post.id) return from(Promise.resolve());
		return from(deleteDoc(doc(db, this.COL, post.id))).pipe(
			map(() => void 0),
			catchError(err => { throw new Error(err); })
		);
	}

	togglePublish(id: string, current: boolean): Observable<void> {
		return from(
			updateDoc(doc(db, this.COL, id), {
				published: !current,
				updatedAt: serverTimestamp(),
			})
		).pipe(catchError(err => { throw new Error(err); }));
	}

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
			.trim();
	}

	readTime(content: string): string {
		const words = content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
		return `${Math.max(1, Math.ceil(words / 200))} min read`;
	}

	initials(name: string): string {
		return name.split(' ').map(n => n[0] ?? '').join('').toUpperCase().slice(0, 2);
	}

	formatDate(ts?: Timestamp | Date): string {
		if (!ts) return '—';
		const d = ts instanceof Date ? ts : (ts as Timestamp).toDate();
		return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
	}
}

