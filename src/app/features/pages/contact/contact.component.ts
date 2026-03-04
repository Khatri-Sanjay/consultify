import {
	Component, signal, ElementRef, AfterViewInit, OnDestroy
} from '@angular/core';
import {RouterModule} from '@angular/router';
import {ReactiveFormsModule, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {OfficeDetails} from '../../../crux/data/common';
import {SafeUrlPipe} from '../../../crux/pipes/safe-url.pipe';
import {ContactService} from '../../../shared-services/api-service/contact.service';

@Component({
	selector: 'app-contact',
	standalone: true,
	imports: [CommonModule, RouterModule, ReactiveFormsModule, SafeUrlPipe],
	styleUrl: './contact.component.css',
	templateUrl: './contact.component.html'
})
export class ContactComponent implements AfterViewInit, OnDestroy {

	form: FormGroup;
	submitted = signal(false);
	loading = signal(false);
	formDirty = signal(false);
	openFaq = signal<number | null>(null);
	submitError = signal<string | null>(null);   // ← NEW — show error if Firestore fails

	get msgLen(): number {
		return this.form.get('message')?.value?.length ?? 0;
	}

	get formProgress(): number {
		const fields = ['fullName', 'email', 'service', 'message'];
		const filled = fields.filter(f => {
			const v = this.form.get(f)?.value;
			return v && v.toString().trim().length > 0;
		}).length;
		return Math.round((filled / fields.length) * 100);
	}

	toggleFaq(i: number): void {
		this.openFaq.set(this.openFaq() === i ? null : i);
	}

	invalid(field: string): boolean {
		const ctrl = this.form.get(field);
		return !!(ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty));
	}

	submit(): void {
		this.formDirty.set(true);
		this.submitError.set(null);
		this.form.markAllAsTouched();
		if (this.form.invalid) return;

		this.loading.set(true);
		const v = this.form.value;

		this.contactService.submit({
			fullName: v.fullName,
			email: v.email,
			phone: v.phone || undefined,
			country: v.country || undefined,
			service: v.service,
			source: v.source || undefined,
			message: v.message,
		}).subscribe({
			next: () => {
				this.loading.set(false);
				this.submitted.set(true);
			},
			error: (err) => {
				this.loading.set(false);
				this.submitError.set('Something went wrong. Please try again or contact us directly.');
				console.error('Contact form submit error:', err);
			}
		});
	}

	reset(): void {
		this.form.reset();
		this.submitted.set(false);
		this.formDirty.set(false);
		this.submitError.set(null);
	}


	readonly heroStats = [
		{value: '5', label: 'Countries Covered'},
		{value: '98%', label: 'Visa Success Rate'},
		{value: '24h', label: 'Response Time'},
	];

	readonly destinations = [
		{flag: '🇦🇺', country: 'Australia', visas: '500+'},
		{flag: '🇬🇧', country: 'UK', visas: '300+'},
		{flag: '🇨🇦', country: 'Canada', visas: '200+'},
		{flag: '🇺🇸', country: 'USA', visas: '150+'},
		{flag: '🇳🇿', country: 'New Zealand', visas: '120+'},
	];

	readonly contactCards = [
		{
			label: 'Phone', value: OfficeDetails.contact.phoneLandline,
			sub: `${OfficeDetails.contact.officeHours} ${OfficeDetails.contact.timezone}`,
			href: `tel:${OfficeDetails.contact.phoneLandline.replace(/-/g, '')}`, external: false, iconType: 'phone'
		},
		{
			label: 'Email', value: OfficeDetails.contact.email, sub: 'We reply within 24h',
			href: `mailto:${OfficeDetails.contact.email}`, external: false, iconType: 'email'
		},
		{
			label: 'WhatsApp', value: OfficeDetails.contact.mobile, sub: 'Quick chat available',
			href: `https://wa.me/${OfficeDetails.contact.mobile.replace('+', '')}`, external: true, iconType: 'whatsapp'
		},
		{
			label: 'Address', value: OfficeDetails.office.fullAddress,
			sub: `${OfficeDetails.office.city} ${OfficeDetails.office.postalCode}, ${OfficeDetails.office.country}`,
			href: OfficeDetails.office.googleMaps, external: true, iconType: 'address'
		}
	];

	readonly officeInfo = [
		{
			label: 'Address',
			value: `${OfficeDetails.office.addressLine}, ${OfficeDetails.office.city} ${OfficeDetails.office.postalCode}`,
			sub: `Near ${OfficeDetails.office.area}, ${OfficeDetails.office.country}`, iconType: 'address'
		},
		{
			label: 'Phone', value: OfficeDetails.contact.phoneLandline,
			sub: `Mobile: ${OfficeDetails.contact.mobile}`, iconType: 'phone'
		},
		{label: 'Email', value: OfficeDetails.contact.email, sub: null, iconType: 'email'},
		{
			label: 'Office Hours', value: OfficeDetails.contact.officeHours,
			sub: `${OfficeDetails.contact.timezone} — Appointments preferred`, iconType: 'clock'
		}
	];

	readonly socials = Object.entries(OfficeDetails.social).map(([name, url]) => ({
		name: name.charAt(0).toUpperCase() + name.slice(1), url, iconType: name
	}));

	readonly quickLinks = [
		{icon: '🎓', label: 'Student Admission', route: '/services/student-admission'},
		{icon: '🎒', label: 'Student Visa', route: '/visa/student-visa'},
		{icon: '🏛️', label: 'Graduate Visa', route: '/visa/graduate-visa'},
		{icon: '📝', label: 'PTE / IELTS Prep', route: '/services/pte-ielts'},
		{icon: '🏥', label: 'Health Insurance', route: '/services/health-insurance'},
	];

	readonly countryOptions = ['🇦🇺 Australia', '🇬🇧 United Kingdom', '🇨🇦 Canada', '🇺🇸 United States', '🇳🇿 New Zealand'];

	readonly serviceOptions = [
		'Student Admission', 'Health Insurance (OSHC / IHS)', 'PTE / IELTS Preparation',
		'Student Visa', 'Temporary Graduate / Post-Study Work Visa', 'Tourist / Visitor Visa',
		'Permanent Residency (PR)', 'General Enquiry',
	];

	readonly sourceOptions = [
		'Google Search', 'Facebook', 'Instagram', 'TikTok', 'LinkedIn',
		'Friend / Family Referral', 'School / College', 'Other'
	];

	readonly transport = [
		{
			icon: '🚌',
			mode: 'Public Bus',
			desc: 'Frequent microbus and city bus routes stop at Baneshwor Chowk — 2 min walk to our office.'
		},
		{
			icon: '🅿️',
			mode: 'Parking',
			desc: 'Street parking available on New Baneshwor Road. Paid parking lot 50m from entrance.'
		},
	];

	readonly faqs = [
		{
			q: 'Is the initial consultation really free?',
			a: 'Yes, completely free with no obligation. Our initial consultations last 30–45 minutes and cover your academic background, goals, eligibility, and the best study-abroad pathway for you.'
		},
		{
			q: 'How long does it take to get a student visa approved?',
			a: 'Processing times vary by destination — typically 4–8 weeks for an Australian Student Visa (Subclass 500), 3 weeks for a UK Student Visa, and 8–12 weeks for a Canadian Study Permit. We give you accurate, up-to-date timeframes for your specific situation.'
		},
		{
			q: 'Can I meet online or do I need to visit your office?',
			a: 'Both options are available. We offer video consultations via Zoom or Viber for clients across Nepal and abroad. In-person appointments are welcome at our New Baneshwor, Kathmandu office, Sun–Fri 9am–5pm.'
		},
		{
			q: 'What countries do you help Nepali students apply to?',
			a: 'We specialise in Australia, United Kingdom, Canada, United States, and New Zealand — covering student visas, post-study work visas, tourist visas, and permanent residency pathways for all five countries.'
		},
		{
			q: 'Do you help with PTE and IELTS preparation?',
			a: 'Yes! We offer dedicated PTE Academic and IELTS preparation classes at our Kathmandu centre, taught by experienced trainers. Many of our students achieve their target scores within one or two attempts.'
		},
		{
			q: 'What documents do I need to apply for a student visa from Nepal?',
			a: "Typically you'll need a valid passport, offer letter from the institution, financial evidence, academic transcripts, English test results, and a Statement of Purpose. Our consultants will give you a tailored checklist for your chosen destination."
		},
	];

	private _observer!: IntersectionObserver;

	constructor(
		private fb: FormBuilder,
		private el: ElementRef,
		private contactService: ContactService,
	) {
		this.form = this.fb.group({
			fullName: ['', [Validators.required, Validators.minLength(6)]],
			email: ['', [Validators.required, Validators.email]],
			phone: ['', [Validators.pattern(/^[+\d\s\-().]{6,20}$/)]],
			country: [''],
			service: ['', Validators.required],
			source: [''],
			message: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(1000)]],
		});
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
		}, {threshold: 0.12});
		els.forEach((el: Element) => this._observer.observe(el));
	}

	ngOnDestroy(): void {
		if (this._observer) this._observer.disconnect();
	}

	protected readonly OfficeDetails = OfficeDetails;
}
