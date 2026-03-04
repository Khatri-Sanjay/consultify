import {Component, OnDestroy, OnInit, signal} from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
	selector: 'app-scroll-up',
	standalone: true,
	imports: [RouterModule],
	template: `
		@if (showBtt()) {
			<button class="btt" (click)="scrollTop()" aria-label="Back to top">
				<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7"/>
				</svg>
			</button>
		}
	`,
	styles: `
		.btt { position:fixed; bottom:1.5rem; right:1.5rem; z-index:40; width:2.75rem; height:2.75rem; border-radius:50%; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#1a35d4,#00aaff); color:#fff; box-shadow:0 4px 16px rgba(26,53,212,.35); transition:all .2s; }
		.btt:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(26,53,212,.45); }
	`
})
export class ScrollUpComponent implements OnInit, OnDestroy{
	showBtt = signal(false);

	scrollTop(): void { window.scrollTo({ top: 0, behavior: 'smooth' }); }

	private _scrollHandler = () => this.showBtt.set(window.scrollY > 400);

	ngOnInit(): void {
		window.addEventListener('scroll', this._scrollHandler, { passive: true });
	}

	ngOnDestroy(): void {
		window.removeEventListener('scroll', this._scrollHandler);
	}

}
