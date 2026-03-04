import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {OfficeDetails} from '../../../crux/data/common';

@Component({
	selector: 'app-footer',
	standalone: true,
	imports: [CommonModule, RouterModule],
	templateUrl: './footer.component.html'
})
export class FooterComponent {
	readonly currentYear = new Date().getFullYear();

	readonly socialLinks = Object.entries(OfficeDetails.social)
		.filter(([key]) => !['twitter', 'tiktok'].includes(key))
		.map(([key, value]) => ({
			id: key as 'facebook' | 'instagram' | 'linkedin' | 'youtube',
			label: key.charAt(0).toUpperCase() + key.slice(1),
			href: value
		}));

	readonly contactInfo: {
		id: 'address' | 'phone' | 'email' | 'hours';
		label: string;
		value: string;
		href?: string;
	}[] = [
		{
			id: 'address',
			label: 'Address',
			value: `${OfficeDetails.office.addressLine}, ${OfficeDetails.office.city} ${OfficeDetails.office.postalCode}, ${OfficeDetails.office.country}`,
			href: OfficeDetails.office.googleMaps
		},
		{
			id: 'phone',
			label: 'Phone',
			value: OfficeDetails.contact.phoneLandline,
			href: `tel:${OfficeDetails.contact.phoneLandline.replace(/-/g, '')}`
		},
		{
			id: 'email',
			label: 'Email',
			value: OfficeDetails.contact.email,
			href: `mailto:${OfficeDetails.contact.email}`
		},
		{
			id: 'hours',
			label: 'Hours',
			value: `${OfficeDetails.contact.officeHours} ${OfficeDetails.contact.timezone}`
		}
	];

	readonly serviceLinks = [
		{ label: 'Student Admission',       route: '/services/student-admission' },
		{ label: 'Health Insurance (OSHC)', route: '/services/health-insurance' },
		{ label: 'PTE / IELTS Preparation', route: '/services/pte-ielts' },
		{ label: 'All Services',            route: '/services' },
	];

	readonly visaLinks = [
		{ label: 'Student Visa (Subclass 500)',      route: '/visa/student-visa' },
		{ label: 'Temporary Graduate Visa (485)',    route: '/visa/graduate-visa' },
		{ label: 'Tourist Visa (Subclass 600)',      route: '/visa/tourist-visa' },
		{ label: 'UK Student Visa',                  route: '/visa' },
		{ label: 'Canada Study Permit',              route: '/visa' },
		{ label: 'US F-1 Student Visa',              route: '/visa' },
		{ label: 'All Visa Services',                route: '/visa' },
	];

	readonly destinations = [
		{ code: 'AU', name: 'Australia',     flag: '🇦🇺', route: '/' },
		{ code: 'GB', name: 'UK',            flag: '🇬🇧', route: '/' },
		{ code: 'CA', name: 'Canada',        flag: '🇨🇦', route: '/' },
		{ code: 'US', name: 'USA',           flag: '🇺🇸', route: '/' },
		{ code: 'NZ', name: 'New Zealand',   flag: '🇳🇿', route: '/' },
	];
}
