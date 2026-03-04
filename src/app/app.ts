import {Component, OnInit, signal} from '@angular/core';
import {ActivatedRoute, NavigationEnd, NavigationStart, Router, RouterOutlet} from '@angular/router';
import {filter} from 'rxjs/operators';
import {SeoService} from './shared-services/seo.service';
import {map} from 'rxjs';

@Component({
	selector: 'app-root',
	imports: [RouterOutlet],
	templateUrl: './app.html',
	styleUrl: './app.css'
})
export class App implements OnInit {

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private seo: SeoService
	) {
	}

	ngOnInit() {
		this.router.events.pipe(
			filter(event => event instanceof NavigationEnd),
			map(() => {
				let child = this.route;
				while (child.firstChild) {
					child = child.firstChild;
				}
				return child.snapshot.data['seo'];
			})
		).subscribe(seo => this.seo.update(seo));
	}
}
