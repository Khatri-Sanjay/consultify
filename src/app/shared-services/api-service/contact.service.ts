import { Injectable } from '@angular/core';
import {
	collection,
	addDoc,
	query,
	orderBy,
	getDocs,
	updateDoc,
	deleteDoc,
	doc,
	serverTimestamp,
	Timestamp,
	where,
	limit,
} from 'firebase/firestore';
import { db } from '../../crux/config/firebase.config';
import { from, map, Observable, catchError } from 'rxjs';

export type MessageStatus = 'new' | 'read' | 'replied' | 'archived';

export interface ContactMessage {
	id?: string;
	fullName: string;
	email: string;
	phone?: string;
	country?: string;
	service: string;
	source?: string;
	message: string;
	status: MessageStatus;
	createdAt?: Timestamp | Date;
	updatedAt?: Timestamp | Date;
	initials?: string;
	avatarColor?: string;
}

const AVATAR_COLORS = [
	'#e63946','#457b9d','#2a9d8f','#e9c46a','#f4a261',
	'#a8dadc','#6d6875','#b5838d','#52b788','#4361ee',
];

function colorFromName(name: string): string {
	let h = 0;
	for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
	return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function initialsFromName(name: string): string {
	return name.split(' ').map(n => n[0] ?? '').join('').toUpperCase().slice(0, 2);
}

@Injectable({ providedIn: 'root' })
export class ContactService {
	private readonly COL = 'contact_messages';

	/** Called from the contact form – saves a new submission */
	submit(data: Omit<ContactMessage, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'initials' | 'avatarColor'>): Observable<string> {
		const payload: Omit<ContactMessage, 'id'> = {
			...data,
			status: 'new',
			initials: initialsFromName(data.fullName),
			avatarColor: colorFromName(data.fullName),
			createdAt: serverTimestamp() as unknown as Timestamp,
			updatedAt: serverTimestamp() as unknown as Timestamp,
		};
		return from(addDoc(collection(db, this.COL), payload)).pipe(
			map(ref => ref.id),
			catchError(err => { throw new Error(err); })
		);
	}

	/** Admin: fetch all messages ordered by newest first */
	getAll(): Observable<ContactMessage[]> {
		const q = query(collection(db, this.COL), orderBy('createdAt', 'desc'));
		return from(getDocs(q)).pipe(
			map(snap =>
				snap.docs.map(d => ({
					id: d.id,
					...(d.data() as Omit<ContactMessage, 'id'>)
				}))
			),
			catchError(err => { throw new Error(err); })
		);
	}

	/** Admin: fetch only unread messages */
	getNew(): Observable<ContactMessage[]> {
		const q = query(
			collection(db, this.COL),
			where('status', '==', 'new'),
			orderBy('createdAt', 'desc')
		);
		return from(getDocs(q)).pipe(
			map(snap => snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<ContactMessage, 'id'>) }))),
			catchError(err => { throw new Error(err); })
		);
	}

	/** Admin: update status */
	updateStatus(id: string, status: MessageStatus): Observable<void> {
		return from(
			updateDoc(doc(db, this.COL, id), { status, updatedAt: serverTimestamp() })
		).pipe(catchError(err => { throw new Error(err); }));
	}

	/** Admin: delete a message */
	delete(id: string): Observable<void> {
		return from(deleteDoc(doc(db, this.COL, id))).pipe(
			map(() => void 0),
			catchError(err => { throw new Error(err); })
		);
	}

	/** Utility – format Firestore timestamp for display */
	formatDate(ts?: Timestamp | Date): string {
		if (!ts) return '—';
		const d = ts instanceof Date ? ts : (ts as Timestamp).toDate();
		return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
	}

	/** Utility – relative time ("2 hours ago") */
	relativeTime(ts?: Timestamp | Date): string {
		if (!ts) return '';
		const d = ts instanceof Date ? ts : (ts as Timestamp).toDate();
		const diff = (Date.now() - d.getTime()) / 1000;
		if (diff < 60)    return 'Just now';
		if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
		if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
		if (diff < 604800)return `${Math.floor(diff / 86400)}d ago`;
		return this.formatDate(ts);
	}
}
