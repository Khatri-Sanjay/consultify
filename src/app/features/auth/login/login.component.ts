import {Component, inject, OnInit, OnDestroy, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {
	ReactiveFormsModule,
	FormBuilder,
	FormGroup,
	Validators,
} from '@angular/forms';
import {Subject, takeUntil} from 'rxjs';
import {AuthService} from '../../../shared-services/api-service/auth.service';

@Component({
	selector: 'app-login',
	standalone: true,
	imports: [CommonModule, RouterModule, ReactiveFormsModule],
	styles: [`

		/* ─── Layout ─── */
		.login-root {
			min-height: 100vh;
			display: flex;
			background: #f4f5f8;
		}

		/* ─── Left Panel ─── */
		.left-panel {
			position: relative;
			width: 42%;
			flex-shrink: 0;
			background: linear-gradient(160deg, #0b1240 0%, #162080 55%, #1e3fc0 100%);
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			padding: 2.5rem;
			overflow: hidden;
		}

		/* grid pattern overlay */
		.left-panel::before {
			content: '';
			position: absolute;
			inset: 0;
			background-image: linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
			linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
			background-size: 40px 40px;
			pointer-events: none;
		}

		/* glow orb */
		.left-panel::after {
			content: '';
			position: absolute;
			width: 500px;
			height: 500px;
			border-radius: 50%;
			background: radial-gradient(circle, rgba(99, 152, 255, 0.18) 0%, transparent 70%);
			bottom: -120px;
			right: -120px;
			pointer-events: none;
		}

		.left-top {
			position: relative;
			z-index: 1;
		}

		.brand-logo {
			display: flex;
			align-items: center;
			gap: 0.75rem;
			text-decoration: none;
		}

		.brand-logo-img {
			width: 40px;
			height: 40px;
			border-radius: 10px;
			object-fit: contain;
			background: rgba(255, 255, 255, 0.12);
			padding: 5px;
			backdrop-filter: blur(8px);
			border: 1px solid rgba(255, 255, 255, 0.15);
		}

		.brand-name {
			font-family: 'Fraunces', Georgia, serif;
			font-size: 1.1rem;
			font-weight: 700;
			color: #fff;
			letter-spacing: -0.3px;
			line-height: 1.1;
		}

		.brand-name b {
			color: #6398ff;
		}

		.brand-sub {
			display: block;
			font-family: 'Plus Jakarta Sans', sans-serif;
			font-size: 0.58rem;
			font-weight: 700;
			letter-spacing: 0.14em;
			text-transform: uppercase;
			color: rgba(255, 255, 255, 0.4);
			margin-top: 3px;
		}

		.left-body {
			position: relative;
			z-index: 1;
			flex: 1;
			display: flex;
			flex-direction: column;
			justify-content: center;
			padding: 2rem 0 1rem;
		}

		.left-tagline {
			font-family: 'Fraunces', Georgia, serif;
			font-size: clamp(1.75rem, 2.5vw, 2.4rem);
			font-weight: 700;
			color: #fff;
			line-height: 1.2;
			letter-spacing: -0.5px;
			margin-bottom: 1.25rem;
		}

		.left-tagline span {
			color: #6398ff;
		}

		.left-desc {
			font-size: 0.88rem;
			color: rgba(255, 255, 255, 0.55);
			line-height: 1.7;
			max-width: 320px;
			margin-bottom: 2.5rem;
		}

		.left-bottom {
			position: relative;
			z-index: 1;
		}

		.trust-row {
			display: flex;
			align-items: center;
			gap: 0.5rem;
		}

		.trust-dot {
			width: 7px;
			height: 7px;
			border-radius: 50%;
			background: #22c55e;
			box-shadow: 0 0 8px rgba(34, 197, 94, 0.6);
			flex-shrink: 0;
		}

		.trust-text {
			font-size: 0.72rem;
			color: rgba(255, 255, 255, 0.4);
			font-weight: 500;
		}

		/* ─── Right Panel ─── */
		.right-panel {
			flex: 1;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 2rem 1.5rem;
			background: #f4f5f8;
			min-height: 100vh;
		}

		.form-card {
			width: 100%;
			max-width: 420px;
			background: #fff;
			border-radius: 20px;
			border: 1px solid #e8eaef;
			box-shadow: 0 4px 24px rgba(15, 22, 35, 0.07), 0 1px 4px rgba(15, 22, 35, 0.04);
			padding: 2.5rem 2.25rem;
		}

		/* Mobile logo (hidden on desktop) */
		.mobile-logo {
			display: none;
			align-items: center;
			justify-content: center;
			gap: 0.6rem;
			margin-bottom: 1.75rem;
			text-decoration: none;
		}

		.mobile-logo-img {
			width: 36px;
			height: 36px;
			border-radius: 9px;
			object-fit: contain;
			background: linear-gradient(135deg, #1e3fc0, #6398ff);
			padding: 5px;
		}

		.mobile-logo-name {
			font-family: 'Fraunces', Georgia, serif;
			font-size: 1rem;
			font-weight: 700;
			color: #0f1623;
		}

		.mobile-logo-name b {
			color: #2a52e8;
		}

		.form-heading {
			margin-bottom: 1.75rem;
		}

		.form-title {
			font-family: 'Fraunces', Georgia, serif;
			font-size: 1.5rem;
			font-weight: 700;
			color: #0f1623;
			letter-spacing: -0.3px;
			line-height: 1.2;
			margin-bottom: 0.35rem;
		}

		.form-sub {
			font-size: 0.83rem;
			color: #7a8299;
			font-weight: 400;
		}

		/* Alert */
		.alert-error {
			display: flex;
			align-items: flex-start;
			gap: 0.6rem;
			background: #fef2f2;
			border: 1px solid #fca5a5;
			border-radius: 10px;
			padding: 0.75rem 0.9rem;
			color: #dc2626;
			font-size: 0.8rem;
			font-weight: 500;
			margin-bottom: 1.25rem;
			line-height: 1.5;
		}

		.alert-icon {
			font-size: 0.9rem;
			flex-shrink: 0;
			margin-top: 1px;
		}

		/* Field */
		.field {
			margin-bottom: 1.1rem;
		}

		.field-label {
			display: block;
			font-size: 0.78rem;
			font-weight: 600;
			color: #3a4256;
			margin-bottom: 0.45rem;
			letter-spacing: 0.01em;
		}

		.field-row {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 0.45rem;
		}

		.forgot-link {
			font-size: 0.75rem;
			font-weight: 600;
			color: #2a52e8;
			background: none;
			border: none;
			cursor: pointer;
			padding: 0;
			transition: color 0.13s;
			font-family: 'Plus Jakarta Sans', sans-serif;
		}

		.forgot-link:hover {
			color: #1e3fc0;
		}

		.input-wrap {
			position: relative;
		}

		.input-field {
			width: 100%;
			height: 44px;
			padding: 0 1rem;
			border: 1.5px solid #e8eaef;
			border-radius: 10px;
			font-size: 0.85rem;
			font-family: 'Plus Jakarta Sans', sans-serif;
			color: #0f1623;
			background: #f9fafc;
			outline: none;
			transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
		}

		.input-field::placeholder {
			color: #b0b8cc;
		}

		.input-field:focus {
			border-color: #2a52e8;
			box-shadow: 0 0 0 3px rgba(42, 82, 232, 0.1);
			background: #fff;
		}

		.input-field.has-suffix {
			padding-right: 3rem;
		}

		.input-field.ng-invalid.ng-touched {
			border-color: #ef4444;
			box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.08);
		}

		.input-suffix {
			position: absolute;
			right: 0;
			top: 0;
			height: 44px;
			width: 44px;
			display: flex;
			align-items: center;
			justify-content: center;
			background: none;
			border: none;
			cursor: pointer;
			color: #a8afc4;
			transition: color 0.13s;
			border-radius: 0 10px 10px 0;
		}

		.input-suffix:hover {
			color: #3a4256;
		}

		.eye-icon {
			width: 18px;
			height: 18px;
			display: block;
		}

		.field-error {
			font-size: 0.73rem;
			color: #ef4444;
			font-weight: 500;
			margin-top: 0.35rem;
			display: flex;
			align-items: center;
			gap: 0.3rem;
		}

		/* Remember */
		.remember-row {
			display: flex;
			align-items: center;
			gap: 0.55rem;
			margin-bottom: 1.5rem;
		}

		.check-input {
			width: 16px;
			height: 16px;
			border-radius: 4px;
			accent-color: #2a52e8;
			cursor: pointer;
			flex-shrink: 0;
		}

		.check-label {
			font-size: 0.8rem;
			color: #7a8299;
			cursor: pointer;
			user-select: none;
		}

		/* Submit */
		.btn-submit {
			width: 100%;
			height: 46px;
			background: linear-gradient(135deg, #1e3fc0 0%, #2a52e8 50%, #5878f0 100%);
			color: #fff;
			font-weight: 700;
			font-size: 0.88rem;
			font-family: 'Plus Jakarta Sans', sans-serif;
			border-radius: 11px;
			border: none;
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 0.5rem;
			letter-spacing: 0.01em;
			box-shadow: 0 4px 14px rgba(42, 82, 232, 0.35);
			transition: opacity 0.15s, transform 0.15s, box-shadow 0.15s;
		}

		.btn-submit:hover:not(:disabled) {
			opacity: 0.92;
			transform: translateY(-1px);
			box-shadow: 0 6px 18px rgba(42, 82, 232, 0.4);
		}

		.btn-submit:active:not(:disabled) {
			transform: translateY(0);
		}

		.btn-submit:disabled {
			opacity: 0.55;
			cursor: not-allowed;
			box-shadow: none;
		}

		/* Spinner */
		.spinner {
			width: 16px;
			height: 16px;
			border: 2.5px solid rgba(255, 255, 255, 0.3);
			border-top-color: #fff;
			border-radius: 50%;
			animation: spin 0.7s linear infinite;
			flex-shrink: 0;
		}

		@keyframes spin {
			to {
				transform: rotate(360deg);
			}
		}

		/* Footer */
		.form-footer {
			text-align: center;
			font-size: 0.8rem;
			color: #a8afc4;
			margin-top: 1.5rem;
		}

		.form-footer a {
			color: #2a52e8;
			font-weight: 600;
			text-decoration: none;
			margin-left: 0.25rem;
			transition: color 0.13s;
		}

		.form-footer a:hover {
			color: #1e3fc0;
		}

		/* Reset sent */
		.reset-success {
			display: flex;
			align-items: center;
			gap: 0.6rem;
			background: #f0fdf4;
			border: 1px solid #86efac;
			border-radius: 10px;
			padding: 0.75rem 0.9rem;
			color: #16a34a;
			font-size: 0.8rem;
			font-weight: 500;
			margin-top: 1rem;
		}

		/* ─── Responsive ─── */
		@media (max-width: 800px) {
			.left-panel {
				display: none;
			}

			.right-panel {
				padding: 1.5rem 1rem;
				align-items: flex-start;
				padding-top: 2rem;
			}

			.form-card {
				padding: 2rem 1.5rem;
				border-radius: 16px;
				box-shadow: 0 2px 12px rgba(15, 22, 35, 0.06);
			}

			.mobile-logo {
				display: flex;
			}
		}

		@media (max-width: 400px) {
			.form-card {
				padding: 1.75rem 1.25rem;
				border-radius: 14px;
			}
		}
	`],
	template: `
		<div class="login-root">

			<!-- ═══ LEFT BRAND PANEL ═══ -->
			<div class="left-panel">
				<div class="left-top">
					<a class="brand-logo" routerLink="/">
						<img src="assets/images/logo.png" alt="Global Next" class="brand-logo-img"/>
						<div>
							<span class="brand-name">Global <b>Next</b></span>
							<span class="brand-sub">Admin Portal</span>
						</div>
					</a>
				</div>

				<div class="left-body">
					<h2 class="left-tagline">
						Your gateway to<br/>
						<span>global education</span><br/>
						management.
					</h2>
					<p class="left-desc">
						Manage applications, users, blogs and more from one
						unified dashboard — built for teams who move fast.
					</p>
				</div>

				<div class="left-bottom">
					<div class="trust-row">
						<div class="trust-dot"></div>
						<span class="trust-text">All systems operational · 99.9% uptime</span>
					</div>
				</div>
			</div>

			<!-- ═══ RIGHT FORM PANEL ═══ -->
			<div class="right-panel">
				<div class="form-card">

					<!-- Mobile-only logo -->
					<a class="mobile-logo" routerLink="/">
						<img src="assets/images/logo.png" alt="Global Next" class="mobile-logo-img"/>
						<span class="mobile-logo-name">Global <b>Next</b></span>
					</a>

					<!-- Heading -->
					<div class="form-heading">
						<h1 class="form-title">Welcome back</h1>
						<p class="form-sub">Sign in to your admin account to continue</p>
					</div>

					<!-- Error alert -->
					@if (error$ | async; as err) {
						<div class="alert-error">
							  <span class="alert-icon">
								<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
								  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01"
																											  y2="16"/>
								</svg>
							  </span>
							<span>{{ err }}</span>
						</div>
					}

					<!-- Form -->
					<form [formGroup]="form" (ngSubmit)="onSubmit()">

						<!-- Email -->
						<div class="field">
							<label class="field-label" for="email">Email address</label>
							<div class="input-wrap">
								<input
									id="email"
									type="email"
									formControlName="email"
									class="input-field"
									placeholder="you@example.com"
									autocomplete="email"/>
							</div>
							@if (f['email'].invalid && f['email'].touched) {
								<p class="field-error">
									<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
										 stroke-width="2.5">
										<circle cx="12" cy="12" r="10"/>
										<line x1="12" y1="8" x2="12" y2="12"/>
										<line x1="12" y1="16" x2="12.01" y2="16"/>
									</svg>
									{{ f['email'].hasError('required') ? 'Email is required.' : 'Enter a valid email address.' }}
								</p>
							}
						</div>

						<!-- Password -->
						<div class="field">
							<div class="field-row">
								<label class="field-label" for="password" style="margin-bottom:0">Password</label>
								<button type="button" class="forgot-link" (click)="forgotPassword()">
									Forgot password?
								</button>
							</div>
							<div class="input-wrap">
								<input
									id="password"
									[type]="showPassword() ? 'text' : 'password'"
									formControlName="password"
									class="input-field has-suffix"
									placeholder="Enter your password"
									autocomplete="current-password"/>
								<button type="button" class="input-suffix" (click)="showPassword.set(!showPassword())"
										[title]="showPassword() ? 'Hide password' : 'Show password'">
									@if (showPassword()) {
										<svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
											 stroke-width="1.8">
											<path
												d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
											<line x1="1" y1="1" x2="23" y2="23"/>
										</svg>
									} @else {
										<svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
											 stroke-width="1.8">
											<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
											<circle cx="12" cy="12" r="3"/>
										</svg>
									}
								</button>
							</div>
							@if (f['password'].invalid && f['password'].touched) {
								<p class="field-error">
									<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
										 stroke-width="2.5">
										<circle cx="12" cy="12" r="10"/>
										<line x1="12" y1="8" x2="12" y2="12"/>
										<line x1="12" y1="16" x2="12.01" y2="16"/>
									</svg>
									Password is required.
								</p>
							}
						</div>

						<!-- Remember me -->
<!--						<div class="remember-row">-->
<!--							<input type="checkbox" id="remember" formControlName="rememberMe" class="check-input"/>-->
<!--							<label for="remember" class="check-label">Remember me for 30 days</label>-->
<!--						</div>-->

						<!-- Submit -->
						<button type="submit" class="btn-submit" [disabled]="(loading$ | async) || form.invalid">
							@if (loading$ | async) {
								<div class="spinner"></div>
								<span>Signing in…</span>
							} @else {
								<span>Sign In</span>
								<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
									 stroke-width="2.5" stroke-linecap="round">
									<line x1="5" y1="12" x2="19" y2="12"/>
									<polyline points="12 5 19 12 12 19"/>
								</svg>
							}
						</button>

					</form>

					<!-- Reset success -->
					@if (resetSent()) {
						<div class="reset-success">
							<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
								 stroke-width="2.5">
								<polyline points="20 6 9 17 4 12"/>
							</svg>
							Password reset email sent — check your inbox.
						</div>
					}

					<!-- Footer -->
					<p class="form-footer">
						Don't have an account?
						<a routerLink="/auth/register">Create one</a>
					</p>

				</div>
			</div>

		</div>
	`
})
export class LoginComponent implements OnInit, OnDestroy {
	private readonly authService = inject(AuthService);
	private readonly fb = inject(FormBuilder);
	private readonly destroy$ = new Subject<void>();

	readonly loading$ = this.authService.loading$;
	readonly error$ = this.authService.error$;

	showPassword = signal(false);
	resetSent = signal(false);

	form!: FormGroup;

	get f() {
		return this.form.controls;
	}

	ngOnInit(): void {
		this.form = this.fb.group({
			email: ['', [Validators.required, Validators.email]],
			password: ['', Validators.required],
			rememberMe: [false],
		});
		this.authService.clearError();
	}

	onSubmit(): void {
		if (this.form.invalid) {
			this.form.markAllAsTouched();
			return;
		}
		this.authService.login(this.form.value)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				error: () => {
				}
			});
	}

	forgotPassword(): void {
		const email = this.form.value.email;
		if (!email) {
			this.form.get('email')?.markAsTouched();
			return;
		}
		this.authService.resetPassword(email)
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => this.resetSent.set(true));
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}
}
