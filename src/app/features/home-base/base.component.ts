import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {NavbarComponent} from './navbar/navbar.component';
import {FooterComponent} from './footer/footer.component';
import {ScrollUpComponent} from '../common/scroll-up/scroll-up.component';

@Component({
	selector: 'app-root',
	imports: [RouterOutlet, NavbarComponent, FooterComponent, ScrollUpComponent],
	template: `
		<div class="flex flex-col min-h-screen scrollbar-hide">
			<app-navbar/>
			<main id="main-content" class="flex-1 pt-20" role="main">
				<router-outlet></router-outlet>
			</main>
			<app-footer></app-footer>
			<app-scroll-up/>
		</div>
	`,
	styles: [``]
})
export class BaseComponent {}
