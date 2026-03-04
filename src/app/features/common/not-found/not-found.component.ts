import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
	selector: 'app-not-found',
	standalone: true,
	imports: [RouterModule],
	template: `
		<section class="py-32 text-center">
			<div class="container-custom max-w-lg">
				<div class="text-8xl mb-8" aria-hidden="true">🗺️</div>
				<h1 class="font-display text-7xl font-bold text-primary-100 mb-2">404</h1>
				<h2 class="font-display text-2xl font-bold text-gray-900 mb-4">Page Not Found</h2>
				<p class="text-gray-500 leading-relaxed mb-10">
					The page you're looking for doesn't exist or has been moved.
					Let's get you back on the right path.
				</p>
				<div class="flex flex-col sm:flex-row gap-4 justify-center">
					<a routerLink="/"        class="btn btn-primary">Go Home</a>
					<a routerLink="/contact" class="btn btn-outline">Contact Us</a>
				</div>
			</div>
		</section>
	`,
})
export class NotFoundComponent {}
