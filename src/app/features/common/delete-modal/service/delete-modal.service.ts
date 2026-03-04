import {ApplicationRef, ComponentRef, createComponent, EnvironmentInjector, Injectable} from '@angular/core';
import { DeleteModalPortalComponent} from '../delete-modal.component';

export interface DeleteModalOptions {
	title:        string;
	subtitle?:    string;
	meta?:        string;

	avatarText?:  string;
	avatarColor?: string;
	imageUrl?:    string;

	onConfirm: () => Promise<void> | void;
}
@Injectable({ providedIn: 'root' })
export class DeleteModalService {

	private ref: ComponentRef<DeleteModalPortalComponent> | null = null;

	constructor(
		private appRef:   ApplicationRef,
		private injector: EnvironmentInjector,
	) {}

	open(opts: DeleteModalOptions): void {
		if (this.ref) this.close();

		const ref = createComponent(DeleteModalPortalComponent, {
			environmentInjector: this.injector,
		});

		ref.instance.opts    = opts;
		ref.instance.onClose = () => this.close();

		this.appRef.attachView(ref.hostView);

		// Append directly to <body> — bypasses ALL stacking contexts
		document.body.appendChild(ref.location.nativeElement);
		document.body.style.overflow = 'hidden';

		this.ref = ref;
		ref.changeDetectorRef.detectChanges();
	}

	close(): void {
		if (!this.ref) return;
		document.body.style.overflow = '';
		this.appRef.detachView(this.ref.hostView);
		this.ref.destroy();
		this.ref = null;
	}
}
