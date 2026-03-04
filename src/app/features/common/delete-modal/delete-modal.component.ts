import {Component, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import {DeleteModalOptions} from './service/delete-modal.service';

@Component({
	selector: 'app-delete-modal-portal',
	standalone: true,
	imports: [CommonModule],
	styles: [`
		:host { display: contents; }

		.backdrop {
			position: fixed;
			top: 0; left: 0; right: 0; bottom: 0;
			z-index: 99999;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 1rem;
			background: rgba(9, 14, 43, .58);
			backdrop-filter: blur(5px);
			-webkit-backdrop-filter: blur(5px);
			animation: bkIn .16s ease;
		}
		@keyframes bkIn { from { opacity: 0 } to { opacity: 1 } }

		.modal {
			width: 100%;
			max-width: 400px;
			background: #fff;
			border-radius: 1.25rem;
			box-shadow: 0 32px 80px rgba(0,0,0,.26), 0 0 0 1px rgba(0,0,0,.04);
			overflow: hidden;
			animation: mdIn .22s cubic-bezier(.34,1.45,.64,1);
			font-family: 'DM Sans', system-ui, sans-serif;
		}
		@keyframes mdIn {
			from { opacity: 0; transform: scale(.9) translateY(10px) }
			to   { opacity: 1; transform: none }
		}

		/* Icon + headline */
		.icon-section {
			display: flex; flex-direction: column; align-items: center;
			padding: 2rem 1.5rem 1.125rem; text-align: center;
		}
		.icon-ring {
			width: 56px; height: 56px; border-radius: 50%;
			background: #fee2e2;
			display: flex; align-items: center; justify-content: center;
			margin-bottom: .875rem;
		}
		.modal-title {
			font-size: 1.05rem; font-weight: 800; color: #1a2560;
			margin: 0 0 .3rem; letter-spacing: -.015em;
		}
		.modal-sub {
			font-size: .78rem; color: #64748b; margin: 0; line-height: 1.55;
		}

		/* Preview card */
		.preview {
			margin: 0 1.25rem .875rem;
			padding: .875rem 1rem;
			background: #f4f6fb; border: 1.5px solid #eef1ff;
			border-radius: .875rem;
			display: flex; align-items: center; gap: .75rem;
		}
		.av {
			border-radius: 50%;
			display: flex; align-items: center; justify-content: center;
			font-weight: 700; color: #fff; flex-shrink: 0;
			width: 40px; height: 40px; font-size: .82rem;
		}
		.thumb {
			width: 44px; height: 38px; border-radius: .5rem;
			overflow: hidden; flex-shrink: 0;
			background: #eef4ff;
			display: flex; align-items: center; justify-content: center;
			font-size: 1.2rem;
		}
		.thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
		.preview-info { flex: 1; min-width: 0; }
		.p-title {
			font-size: .84rem; font-weight: 700; color: #1a2560;
			margin: 0 0 2px;
			overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
		}
		.p-sub {
			font-size: .72rem; color: #94a3b8; margin: 0 0 5px;
			overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
		}
		.p-meta {
			display: inline-block;
			font-size: .66rem; font-weight: 700; color: #1a35d4;
			background: #eef4ff; padding: 2px 8px; border-radius: 999px;
		}

		/* Warning */
		.warning {
			display: flex; align-items: center; gap: .5rem;
			margin: 0 1.25rem .875rem;
			padding: .625rem .875rem;
			background: #fff7ed; border: 1px solid #fed7aa;
			border-radius: .625rem;
			font-size: .72rem; font-weight: 600; color: #c2410c;
		}

		/* Footer */
		.footer {
			display: flex; gap: .625rem;
			padding: .875rem 1.25rem 1.125rem;
		}
		.btn {
			flex: 1; display: flex; align-items: center; justify-content: center;
			gap: .4rem; padding: .7rem 1rem; border-radius: .75rem;
			font-size: .83rem; font-weight: 700; cursor: pointer;
			border: 1.5px solid transparent; transition: all .15s;
			font-family: inherit;
		}
		.btn:disabled { opacity: .55; cursor: not-allowed; }
		.btn-cancel  { background: #f4f6fb; color: #64748b; border-color: #e8ecf4; }
		.btn-cancel:hover:not(:disabled)  { background: #e2e8f0; color: #1a2560; }
		.btn-confirm { background: #dc2626; color: #fff; border-color: #dc2626; }
		.btn-confirm:hover:not(:disabled) { background: #b91c1c; border-color: #b91c1c; }

		.spin {
			width: 13px; height: 13px; flex-shrink: 0;
			border: 2px solid rgba(255,255,255,.35);
			border-top-color: #fff; border-radius: 50%;
			animation: sp .6s linear infinite;
		}
		@keyframes sp { to { transform: rotate(360deg) } }
	`],
	template: `
		<div class="backdrop" (click)="!busy() && cancel()">
			<div class="modal" (click)="$event.stopPropagation()">

				<!-- Icon + title -->
				<div class="icon-section">
					<div class="icon-ring">
						<svg width="22" height="22" fill="none" viewBox="0 0 24 24"
							 stroke="#dc2626" stroke-width="2.5">
							<path stroke-linecap="round" stroke-linejoin="round"
								  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862
								     a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6
								     m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
						</svg>
					</div>
					<h3 class="modal-title">Confirm Delete</h3>
					<p class="modal-sub">
						This is permanent and cannot be undone.
					</p>
				</div>

				<!-- Preview card -->
				<div class="preview">
					<!-- Avatar (messages/users) -->
					@if (opts?.avatarText) {
						<div class="av" [style.background]="opts?.avatarColor || '#1a35d4'">
							{{ opts!.avatarText }}
						</div>
					}
					<!-- Thumbnail (blog posts) -->
					@if (opts?.imageUrl && !opts?.avatarText) {
						<div class="thumb">
							<img [src]="opts!.imageUrl" [alt]="opts!.title" />
						</div>
					}
					<div class="preview-info">
						<p class="p-title">{{ opts?.title }}</p>
						@if (opts?.subtitle) { <p class="p-sub">{{ opts!.subtitle }}</p> }
						@if (opts?.meta)     { <span class="p-meta">{{ opts!.meta }}</span> }
					</div>
				</div>

				<!-- Warning strip -->
				<div class="warning">
					<svg width="13" height="13" fill="none" viewBox="0 0 24 24"
						 stroke="currentColor" stroke-width="2.5" style="flex-shrink:0">
						<path stroke-linecap="round" stroke-linejoin="round"
							  d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71
							     3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
					</svg>
					This record will be permanently deleted.
				</div>

				<!-- Action buttons -->
				<div class="footer">
					<button class="btn btn-cancel" [disabled]="busy()" (click)="cancel()">
						Cancel
					</button>
					<button class="btn btn-confirm" [disabled]="busy()" (click)="confirm()">
						@if (busy()) {
							<span class="spin"></span> Deleting…
						} @else {
							<svg width="13" height="13" fill="none" viewBox="0 0 24 24"
								 stroke="currentColor" stroke-width="2.5">
								<path stroke-linecap="round" stroke-linejoin="round"
									  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862
									     a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6
									     m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
							</svg>
							Delete Forever
						}
					</button>
				</div>

			</div>
		</div>
	`
})
export class DeleteModalPortalComponent {
	opts: DeleteModalOptions | null = null;
	busy = signal(false);
	onClose!: () => void;

	cancel(): void { this.onClose(); }

	async confirm(): Promise<void> {
		this.busy.set(true);
		try {
			await this.opts?.onConfirm();
		} finally {
			this.busy.set(false);
			this.onClose();
		}
	}
}
