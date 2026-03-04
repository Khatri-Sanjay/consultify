import {
	Component, OnInit, OnDestroy, signal, computed, inject
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {Subject, takeUntil, firstValueFrom} from 'rxjs';
import {ContactMessage, ContactService, MessageStatus} from '../../../shared-services/api-service/contact.service';
import {DeleteModalService} from '../../common/delete-modal/service/delete-modal.service';

type FilterTab = 'all' | MessageStatus;

@Component({
	selector: 'app-admin-messages',
	standalone: true,
	imports: [CommonModule, RouterModule, FormsModule],
	styleUrl: './admin-messages.component.css',
	templateUrl: './admin-messages.component.html',
})
export class AdminMessagesComponent implements OnInit, OnDestroy {

	private readonly svc = inject(ContactService);
	private readonly deleteModal = inject(DeleteModalService);
	private readonly destroy$ = new Subject<void>();

	// ── State signals ─────────────────────────────────────────────
	all = signal<ContactMessage[]>([]);
	loading = signal(true);
	error = signal<string | null>(null);
	selected = signal<ContactMessage | null>(null);
	actionId = signal<string | null>(null);
	toast = signal<string | null>(null);
	toastType = signal<'success' | 'delete'>('success');
	activeTab = signal<FilterTab>('all');

	// ── Pagination ────────────────────────────────────────────────
	page = signal(1);
	pageSize = signal(10);

	totalPages(total: number): number {
		return Math.max(1, Math.ceil(total / this.pageSize()));
	}

	pagedRows(rows: ContactMessage[]): ContactMessage[] {
		const s = (this.page() - 1) * this.pageSize();
		return rows.slice(s, s + this.pageSize());
	}

	pageStart(total: number): number {
		return total === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1;
	}

	pageEnd(total: number): number {
		return Math.min(this.page() * this.pageSize(), total);
	}

	pageNumbers(total: number): (number | '...')[] {
		const t = this.totalPages(total);
		const c = this.page();
		const pages: (number | '...')[] = [];
		if (t <= 7) {
			for (let i = 1; i <= t; i++) pages.push(i);
		} else {
			pages.push(1);
			if (c > 3) pages.push('...');
			for (let p = Math.max(2, c - 1); p <= Math.min(t - 1, c + 1); p++) pages.push(p);
			if (c < t - 2) pages.push('...');
			pages.push(t);
		}
		return pages;
	}

	goPage(p: number): void {
		this.page.set(p);
	}

	prevPage(): void {
		if (this.page() > 1) this.page.update(p => p - 1);
	}

	nextPage(total: number): void {
		if (this.page() < this.totalPages(total)) this.page.update(p => p + 1);
	}

	onPageSizeChange(size: number): void {
		this.pageSize.set(size);
		this.page.set(1);
	}

	// ── Filters ───────────────────────────────────────────────────
	searchQuery = '';
	serviceFilter = '';

	onSearch(q: string): void {
		this.searchVal.set(q);
		this.page.set(1);
	}

	onService(s: string): void {
		this.serviceVal.set(s);
		this.page.set(1);
	}

	private searchVal = signal('');
	private serviceVal = signal('');

	filtered = computed(() => {
		const q = this.searchVal();
		const svc = this.serviceVal();
		const tab = this.activeTab();
		return this.all().filter(m => {
			const byTab = tab === 'all' || m.status === tab;
			const bySearch = !q
				|| m.fullName.toLowerCase().includes(q.toLowerCase())
				|| m.email.toLowerCase().includes(q.toLowerCase())
				|| (m.phone ?? '').includes(q);
			const bySvc = !svc || m.service === svc;
			return byTab && bySearch && bySvc;
		});
	});

	// ── Counts ────────────────────────────────────────────────────
	counts = computed(() => {
		const a = this.all();
		return {
			all: a.length,
			new: a.filter(m => m.status === 'new').length,
			read: a.filter(m => m.status === 'read').length,
			replied: a.filter(m => m.status === 'replied').length,
			archived: a.filter(m => m.status === 'archived').length,
		};
	});

	// ── Static data ───────────────────────────────────────────────
	readonly tabs: { label: string; value: FilterTab; icon: string }[] = [
		{label: 'All', value: 'all', icon: '📋'},
		{label: 'New', value: 'new', icon: '🔵'},
		{label: 'Read', value: 'read', icon: '👁️'},
		{label: 'Replied', value: 'replied', icon: '✅'},
		{label: 'Archived', value: 'archived', icon: '🗄️'},
	];

	readonly statuses: { value: MessageStatus; label: string; icon: string }[] = [
		{value: 'new', label: 'New', icon: '🔵'},
		{value: 'read', label: 'Read', icon: '👁️'},
		{value: 'replied', label: 'Replied', icon: '✅'},
		{value: 'archived', label: 'Archive', icon: '🗄️'},
	];

	readonly serviceOptions = [
		'Student Admission', 'Health Insurance (OSHC / IHS)', 'PTE / IELTS Preparation',
		'Student Visa', 'Temporary Graduate / Post-Study Work Visa', 'Tourist / Visitor Visa',
		'Permanent Residency (PR)', 'General Enquiry',
	];

	ngOnInit(): void {
		this.load();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	// ── Data ──────────────────────────────────────────────────────
	load(): void {
		this.loading.set(true);
		this.error.set(null);
		this.svc.getAll().pipe(takeUntil(this.destroy$)).subscribe({
			next: msgs => {
				this.all.set(msgs);
				this.loading.set(false);
			},
			error: err => {
				this.error.set('Failed to load messages.');
				this.loading.set(false);
				console.error(err);
			}
		});
	}

	setTab(tab: FilterTab): void {
		this.activeTab.set(tab);
		this.page.set(1);
	}

	open(msg: ContactMessage): void {
		this.selected.set(msg);
		if (msg.status === 'new' && msg.id) this.changeStatus(msg, 'read', false);
	}

	close(): void {
		this.selected.set(null);
	}

	changeStatus(msg: ContactMessage, next: MessageStatus, showToast = true): void {
		if (!msg.id || msg.status === next) return;
		this.actionId.set(msg.id);
		this.svc.updateStatus(msg.id, next).pipe(takeUntil(this.destroy$)).subscribe({
			next: () => {
				this.all.update(list => list.map(m => m.id === msg.id ? {...m, status: next} : m));
				if (this.selected()?.id === msg.id) this.selected.update(s => s ? {...s, status: next} : s);
				this.actionId.set(null);
				if (showToast) this.showToast(`Marked as ${next}`, 'success');
			},
			error: err => {
				console.error(err);
				this.actionId.set(null);
			}
		});
	}

	startDelete(msg: ContactMessage): void {
		this.deleteModal.open({
			title: msg.fullName,
			subtitle: msg.email,
			meta: msg.service,
			avatarText: this.initials(msg.fullName),
			avatarColor: this.avatarColor(msg),
			onConfirm: async () => {
				if (!msg.id) return;
				await firstValueFrom(this.svc.delete(msg.id));
				this.all.update(list => list.filter(m => m.id !== msg.id));
				if (this.selected()?.id === msg.id) this.selected.set(null);
				this.showToast(`Deleted message from ${msg.fullName}`, 'delete');
				this.load();
			},
		});
	}

	// ── Helpers ───────────────────────────────────────────────────
	tabChipClass(value: FilterTab): string {
		const map: Record<FilterTab, string> = {
			all: 'fchip-blue',
			new: 'fchip-blue',
			read: 'fchip-amber',
			replied: 'fchip-green',
			archived: 'fchip-purple',
		};
		return map[value] ?? '';
	}

	badgeClass(status: MessageStatus): string {
		return {new: 'b-new', read: 'b-read', replied: 'b-replied', archived: 'b-archived'}[status] ?? '';
	}

	mailtoLink(msg: ContactMessage): string {
		const sub = encodeURIComponent(`Re: Your enquiry about ${msg.service}`);
		const body = encodeURIComponent(`Dear ${msg.fullName.split(' ')[0]},\n\nThank you for reaching out to Global Next Nepal.\n\n`);
		return `mailto:${msg.email}?subject=${sub}&body=${body}`;
	}

	whatsappLink(msg: ContactMessage): string {
		if (!msg.phone) return '';
		const num = msg.phone.replace(/[^\d+]/g, '');
		const text = encodeURIComponent(`Hi ${msg.fullName.split(' ')[0]}, thank you for contacting Global Next Nepal!`);
		return `https://wa.me/${num}?text=${text}`;
	}

	avatarColor(msg: ContactMessage): string {
		if (msg.avatarColor) return msg.avatarColor;
		const palette = ['#1a35d4', '#7c3aed', '#059669', '#d97706', '#e63946', '#0891b2'];
		let h = 0;
		for (let i = 0; i < msg.fullName.length; i++) h = (h * 31 + msg.fullName.charCodeAt(i)) & 0xffffffff;
		return palette[Math.abs(h) % palette.length];
	}

	initials(name: string): string {
		return name.split(' ').map(n => n[0] ?? '').join('').toUpperCase().slice(0, 2);
	}

	formatDate(ts: any): string {
		return this.svc.formatDate(ts);
	}

	relativeTime(ts: any): string {
		return this.svc.relativeTime(ts);
	}

	private showToast(msg: string, type: 'success' | 'delete' = 'success'): void {
		this.toastType.set(type);
		this.toast.set(msg);
		setTimeout(() => this.toast.set(null), 3000);
	}
}
