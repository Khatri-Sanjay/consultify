export interface NavItem {
	label: string;
	route?: string;
	icon?: string;
	description?: string;
	children?: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
	{
		label: 'About Us',
		route: '/about',
		children: [
			{
				label: "Director's Newsletter",
				route: '/director-newsletter',
				icon: '📰',
				description: 'Latest updates from our director',
			},
		],
	},
	{
		label: 'Our Services',
		route: '/services',
		children: [
			{
				label: 'Student Admission',
				route: '/services/student-admission',
				icon: '🎓',
				description: 'University & college applications',
			},
			{
				label: 'Health Insurance',
				route: '/services/health-insurance',
				icon: '🏥',
				description: 'OSHC cover guidance',
			},
			{
				label: 'PTE / IELTS Preparation',
				route: '/services/pte-ielts',
				icon: '📝',
				description: 'English proficiency coaching',
			},
		],
	},
	{
		label: 'Visa',
		route: '/visa',
		children: [
			{
				label: 'Student Visa',
				route: '/visa/student-visa',
				icon: '🎒',
				description: 'Subclass 500',
			},
			{
				label: 'Temporary Graduate Visa',
				route: '/visa/graduate-visa',
				icon: '🏛️',
				description: 'Subclass 485',
			},
			{
				label: 'Tourist Visa (Subclass 600)',
				route: '/visa/tourist-visa',
				icon: '✈️',
				description: 'Visitor visa for Australia',
			},
		],
	},
	{ label: 'Blog', route: '/blog' },
	{ label: 'Contact Us', route: '/contact' },
];
