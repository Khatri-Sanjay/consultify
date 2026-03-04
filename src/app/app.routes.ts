import {Routes} from '@angular/router';
import {adminGuard, publicGuard} from './crux/guard/auth.guard';
import {
	DirectorNewsletterDetailComponent
} from './features/pages/director-newsletter/director-newsletter-detail/director-newsletter-detail.component';

export const routes: Routes = [

	{
		path: '',
		loadComponent: () =>
			import('./features/home-base/base.component')
				.then(m => m.BaseComponent),
		title: 'Study Abroad from Nepal | Australia, UK, Canada & USA | Global Next',

		data: {
			description: 'Global Next Kathmandu helps Nepali students with student visa, university admissions and IELTS/PTE coaching.',
			keywords: 'study abroad Nepal, Australia visa Nepal, UK student visa Nepal, Canada student visa Nepal',
		},

		children: [

			{
				path: '',
				loadComponent: () =>
					import('./features/pages/home/home.component')
						.then(m => m.HomeComponent),
			},

			{
				path: 'about',
				loadComponent: () =>
					import('./features/pages/about/about.component')
						.then(m => m.AboutComponent),
				title: 'About Global Next | Study Abroad Consultancy in Nepal',
				data: {
					description: 'Learn about Global Next, Nepal’s trusted consultancy for Australia, UK, Canada and USA study programs.',
					keywords: 'about Global Next Nepal, consultancy Kathmandu',
				}
			},

			{
				path: 'director-newsletter',
				loadComponent: () =>
					import('./features/pages/director-newsletter/director-newsletter.component')
						.then(m => m.DirectorNewsletterComponent),
				title: "Director's Newsletter | Global Next",
				data: {
					description: 'Insights, announcements and messages from the Director of Global Next.',
					keywords: 'director message Nepal, consultancy updates',
				}
			},

			{
				path: 'director-newsletter/:slug',
				loadComponent: () =>
					import('./features/pages/director-newsletter/director-newsletter-detail/director-newsletter-detail.component')
						.then(m => m.DirectorNewsletterDetailComponent),
			},

			{
				path: 'services',
				loadComponent: () =>
					import('./features/pages/our-services/our-services.component')
						.then(m => m.OurServicesComponent),
				title: 'Our Study Abroad Services | Global Next Nepal',
				data: {
					description: 'Explore student admission, visa processing, health insurance and exam preparation services.',
					keywords: 'study abroad services Nepal',
				}
			},

			{
				path: 'services/student-admission',
				loadComponent: () =>
					import('./features/pages/our-services/student-admission/student-admission.component')
						.then(m => m.StudentAdmissionComponent),
				title: 'Student Admission Services | Global Next',
				data: {
					description: 'Apply to top universities in Australia, UK, Canada and USA with expert admission support.',
					keywords: 'student admission Nepal, university application Nepal',
				}
			},

			{
				path: 'services/health-insurance',
				loadComponent: () =>
					import('./features/pages/our-services/health-insurance/health-insurance.component')
						.then(m => m.HealthInsuranceComponent),
				title: 'Overseas Student Health Insurance | Global Next',
				data: {
					description: 'Get overseas student health insurance assistance for Australia and other destinations.',
					keywords: 'health insurance for students Nepal',
				}
			},

			{
				path: 'services/pte-ielts',
				loadComponent: () =>
					import('./features/pages/our-services/pte-ielts/pte-ielts.component')
						.then(m => m.PteIeltsComponent),
				title: 'IELTS & PTE Coaching in Kathmandu | Global Next',
				data: {
					description: 'Professional IELTS and PTE preparation classes in Kathmandu with high success rate.',
					keywords: 'IELTS coaching Kathmandu, PTE classes Nepal',
				}
			},

			{
				path: 'visa',
				loadComponent: () =>
					import('./features/pages/visa/visa.component')
						.then(m => m.VisaComponent),
				title: 'Visa Consultancy Services | Global Next Nepal',
				data: {
					description: 'Expert visa guidance for Australia, UK, Canada and USA from Nepal.',
					keywords: 'visa consultancy Nepal, student visa Nepal',
				}
			},

			{
				path: 'visa/student-visa',
				loadComponent: () =>
					import('./features/pages/visa/student-visa/student-visa.component')
						.then(m => m.StudentVisaComponent),
				title: 'Student Visa Assistance | Global Next',
				data: {
					description: 'Complete student visa documentation and application assistance from Nepal.',
					keywords: 'student visa Nepal',
				}
			},

			{
				path: 'visa/graduate-visa',
				loadComponent: () =>
					import('./features/pages/visa/graduate-visa/graduate-visa.component')
						.then(m => m.GraduateVisaComponent),
				title: 'Graduate Visa Services | Global Next',
				data: {
					description: 'Post-study work and graduate visa assistance services.',
					keywords: 'graduate visa Nepal',
				}
			},

			{
				path: 'visa/tourist-visa',
				loadComponent: () =>
					import('./features/pages/visa/tourist-visa/tourist-visa.component')
						.then(m => m.TouristVisaComponent),
				title: 'Tourist Visa Services | Global Next',
				data: {
					description: 'Tourist visa application assistance from Nepal.',
					keywords: 'tourist visa Nepal',
				}
			},

			{
				path: 'blog',
				loadComponent: () =>
					import('./features/pages/blog/blog.component')
						.then(m => m.BlogComponent),
				title: 'Study Abroad Blog | Global Next',
				data: {
					description: 'Latest visa news, study abroad updates and tips for Nepali students.',
					keywords: 'study abroad blog Nepal',
				}
			},

			{
				path: 'blog/:slug',
				loadComponent: () =>
					import('./features/pages/blog/blog-post/blog-post.component')
						.then(m => m.BlogPostComponent),
			},

			{
				path: 'contact',
				loadComponent: () =>
					import('./features/pages/contact/contact.component')
						.then(m => m.ContactComponent),
				title: 'Contact Global Next | Kathmandu',
				data: {
					description: 'Visit or contact Global Next Kathmandu for study abroad consultation.',
					keywords: 'contact consultancy Nepal',
				}
			},

			{
				path: 'search',
				loadComponent: () =>
					import('./features/pages/search/search.component')
						.then(m => m.SearchComponent),
				title: 'Search | Global Next',
				data: {
					description: 'Search study abroad programs, blog posts and services.',
					keywords: 'search Global Next',
				}
			}

		]
	},

	{
		path: 'auth',
		canActivate: [publicGuard],
		children: [
			{
				path: 'login',
				loadComponent: () =>
					import('./features/auth/login/login.component')
						.then(m => m.LoginComponent),
			},
			{
				path: 'register',
				loadComponent: () =>
					import('./features/auth/register/register.component')
						.then(m => m.RegisterComponent),
			},
			{path: '', redirectTo: 'login', pathMatch: 'full'},
		],
	},

	{
		path: 'admin',
		canActivate: [adminGuard],
		loadComponent: () =>
			import('./features/admin/admin-shell/admin-shell.component').then(m => m.AdminShellComponent),
		children: [
			{
				path: 'dashboard',
				loadComponent: () =>
					import('./features/admin/dashboard/dashboard.component')
						.then(m => m.AdminDashboardComponent),
			},
			{
				path: 'users',
				loadComponent: () =>
					import('./features/admin/user-management/user-management.component')
						.then(m => m.UserManagementComponent),
			},
			{
				path: 'blogs',
				loadComponent: () =>
					import('./features/admin/blog-management/blog-management.component')
						.then(m => m.BlogManagementComponent),
			},
			{
				path: 'messages',
				loadComponent: () =>
					import('./features/admin/admin-message/admin-messages.component')
						.then(m => m.AdminMessagesComponent),
			},
			{
				path: 'newsletter',
				loadComponent: () =>
					import('./features/admin/news-letter-management/news-letter-management.component')
						.then(m => m.NewsletterManagementComponent),
			},
			{path: '', redirectTo: 'dashboard', pathMatch: 'full'},
		],
	},

	{
		path: '**',
		loadComponent: () =>
			import('./features/common/not-found/not-found.component')
				.then(m => m.NotFoundComponent),
		title: 'Page Not Found | Global Next',
		data: {
			description: 'The page you are looking for does not exist.',
			keywords: '404 error',
		}
	}
];
