import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
	ReactiveFormsModule,
	FormBuilder,
	FormGroup,
	Validators,
	AbstractControl,
	ValidationErrors,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../shared-services/api-service/auth.service';

function passwordMatchValidator(ctrl: AbstractControl): ValidationErrors | null {
	const pw  = ctrl.get('password')?.value;
	const cpw = ctrl.get('confirmPassword')?.value;
	return pw && cpw && pw !== cpw ? { mismatch: true } : null;
}

@Component({
	selector: 'app-register',
	standalone: true,
	imports: [CommonModule, RouterModule, ReactiveFormsModule],
	template: `
		<div class="min-h-screen flex bg-[#f2f3f7]">

			<!-- ══════════════════════════════════════
				 LEFT  —  Brand panel (desktop only)
			══════════════════════════════════════ -->
			<div class="hidden lg:flex w-[44%] xl:w-[42%] flex-shrink-0 flex-col
                  relative overflow-hidden
                  bg-[linear-gradient(155deg,#09122e_0%,#132060_48%,#1c3db5_100%)]">

				<!-- Subtle dot-grid texture -->
				<div class="absolute inset-0 pointer-events-none opacity-[0.07]"
					 style="background-image:radial-gradient(circle,#fff 1px,transparent 1px);
                    background-size:28px 28px"></div>

				<!-- Bottom-right glow -->
				<div class="absolute -bottom-40 -right-40 w-[560px] h-[560px] rounded-full pointer-events-none"
					 style="background:radial-gradient(circle,rgba(99,152,255,0.22) 0%,transparent 65%)"></div>

				<!-- Top-left glow -->
				<div class="absolute -top-24 -left-24 w-[320px] h-[320px] rounded-full pointer-events-none"
					 style="background:radial-gradient(circle,rgba(42,82,232,0.15) 0%,transparent 70%)"></div>

				<!-- Inner layout -->
				<div class="relative z-10 flex flex-col h-full px-10 py-9">

					<!-- ── Logo ── -->
					<a routerLink="/" class="inline-flex items-center gap-3.5 group w-fit">
						<!-- Logo container — proper visible size -->
						<div class="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center flex-shrink-0
                        bg-white/10 border border-white/20 backdrop-blur-sm
                        group-hover:bg-white/15 transition-colors duration-200
                        shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
							<img src="assets/images/logo.png"
								 alt="Global Next"
								 class="w-[34px] h-[34px] object-contain drop-shadow-sm" />
						</div>
						<div class="flex flex-col">
              <span class="text-[1.05rem] font-bold text-white tracking-[-0.3px] leading-tight"
					style="font-family:'Fraunces',Georgia,serif">
                Global <span class="text-[#7aaeff]">Next</span>
              </span>
							<span class="text-[0.58rem] font-bold uppercase tracking-[0.15em] text-white/35 mt-[3px]">
                Admin Portal
              </span>
						</div>
					</a>

					<!-- ── Headline + copy ── -->
					<div class="flex-1 flex flex-col justify-center py-12">
						<p class="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[#7aaeff]/70 mb-4">
							Get started today
						</p>
						<h2 class="text-[clamp(1.8rem,2.6vw,2.5rem)] font-bold text-white leading-[1.15] tracking-[-0.5px] mb-5"
							style="font-family:'Fraunces',Georgia,serif">
							Manage global<br/>
							education from<br/>
							<span class="text-[#7aaeff]">one place.</span>
						</h2>
						<p class="text-[0.875rem] text-white/45 leading-[1.8] max-w-[290px] mb-10">
							Create your account and get instant access to applications,
							users, content, and analytics — all in one unified dashboard.
						</p>
					</div>

					<!-- ── Status bar ── -->
					<div class="flex items-center gap-2.5 py-3 px-4 rounded-[10px] bg-white/[0.05] border border-white/[0.08] w-fit">
						<div class="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"
							 style="box-shadow:0 0 7px rgba(52,211,153,0.8)"></div>
						<span class="text-[0.7rem] text-white/40 font-medium">All systems operational · 99.9% uptime</span>
					</div>

				</div>
			</div>

			<!-- ══════════════════════════════════════
				 RIGHT  —  Form panel
			══════════════════════════════════════ -->
			<div class="flex-1 flex items-center justify-center
                  px-4 py-8 sm:px-8 overflow-y-auto min-h-screen">

				<div class="w-full max-w-[480px]">

					<!-- ── Mobile logo (hidden on desktop) ── -->
					<a routerLink="/"
					   class="flex lg:hidden items-center justify-center gap-3 mb-7 no-underline">
						<!-- Properly sized mobile logo -->
						<div class="w-[46px] h-[46px] rounded-[12px] flex items-center justify-center flex-shrink-0
                        bg-[linear-gradient(135deg,#1e3fc0,#4a6ef5)]
                        shadow-[0_4px_14px_rgba(42,82,232,0.30)]">
							<img src="assets/images/logo.png"
								 alt="Global Next"
								 class="w-[28px] h-[28px] object-contain" />
						</div>
						<div class="flex flex-col">
              <span class="text-[1rem] font-bold text-[#0f1623] tracking-tight leading-tight"
					style="font-family:'Fraunces',Georgia,serif">
                Global <span class="text-[#2a52e8]">Next</span>
              </span>
							<span class="text-[0.55rem] font-bold uppercase tracking-[0.13em] text-[#a8afc4] mt-0.5">
                Admin Portal
              </span>
						</div>
					</a>

					<!-- ── Card ── -->
					<div class="bg-white rounded-2xl border border-[#e4e6ed]
                      shadow-[0_8px_32px_rgba(15,22,35,0.08),0_2px_8px_rgba(15,22,35,0.04)]
                      px-7 py-8 sm:px-9 sm:py-9">

						<!-- Heading -->
						<div class="mb-7">
							<h1 class="text-[1.5rem] font-bold text-[#0f1623] tracking-[-0.4px] leading-tight mb-1.5"
								style="font-family:'Fraunces',Georgia,serif">
								Create your account
							</h1>
							<p class="text-[0.83rem] text-[#7a8299] leading-relaxed">
								Join Global Next — your study abroad management platform
							</p>
						</div>

						<!-- Error alert -->
						@if (error$ | async; as err) {
							<div class="flex items-start gap-2.5 bg-red-50 border border-red-200
                          rounded-xl px-4 py-3 mb-6 text-red-600 text-[0.8rem] font-medium leading-relaxed">
								<svg class="w-4 h-4 flex-shrink-0 mt-[1px]" viewBox="0 0 24 24" fill="none"
									 stroke="currentColor" stroke-width="2.2">
									<circle cx="12" cy="12" r="10"/>
									<line x1="12" y1="8" x2="12" y2="12"/>
									<line x1="12" y1="16" x2="12.01" y2="16"/>
								</svg>
								<span>{{ err }}</span>
							</div>
						}

						<!-- Form -->
						<form [formGroup]="form" (ngSubmit)="onSubmit()">

							<!-- Name + Email row -->
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

								<!-- Full Name -->
								<div>
									<label class="block text-[0.76rem] font-semibold text-[#374151] mb-[5px] tracking-[0.01em]">
										Full Name
									</label>
									<input type="text" formControlName="displayName"
										   placeholder="Aarav Shrestha"
										   class="w-full h-[42px] px-3.5 rounded-[9px] text-[0.84rem] text-[#111827]
                                border-[1.5px] border-[#e4e6ed] bg-[#f8f9fc] outline-none
                                placeholder:text-[#c1c7d4]
                                focus:border-[#2a52e8] focus:bg-white
                                focus:shadow-[0_0_0_3px_rgba(42,82,232,0.09)]
                                transition-all duration-150"
										   [class.!border-red-400]="f['displayName'].invalid && f['displayName'].touched" />
									@if (f['displayName'].invalid && f['displayName'].touched) {
										<p class="flex items-center gap-1 text-[0.71rem] text-red-500 font-medium mt-1">
											<svg class="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
											Min 2 characters required.
										</p>
									}
								</div>

								<!-- Email -->
								<div>
									<label class="block text-[0.76rem] font-semibold text-[#374151] mb-[5px] tracking-[0.01em]">
										Email Address
									</label>
									<input type="email" formControlName="email"
										   placeholder="you@example.com" autocomplete="email"
										   class="w-full h-[42px] px-3.5 rounded-[9px] text-[0.84rem] text-[#111827]
                                border-[1.5px] border-[#e4e6ed] bg-[#f8f9fc] outline-none
                                placeholder:text-[#c1c7d4]
                                focus:border-[#2a52e8] focus:bg-white
                                focus:shadow-[0_0_0_3px_rgba(42,82,232,0.09)]
                                transition-all duration-150"
										   [class.!border-red-400]="f['email'].invalid && f['email'].touched" />
									@if (f['email'].invalid && f['email'].touched) {
										<p class="flex items-center gap-1 text-[0.71rem] text-red-500 font-medium mt-1">
											<svg class="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
											{{ f['email'].hasError('required') ? 'Required.' : 'Invalid email.' }}
										</p>
									}
								</div>

							</div>

							<!-- Phone -->
							<div class="mb-4">
								<label class="block text-[0.76rem] font-semibold text-[#374151] mb-[5px] tracking-[0.01em]">
									Phone
									<span class="text-[#b0b8cc] font-normal ml-1 text-[0.72rem]">(optional)</span>
								</label>
								<input type="tel" formControlName="phone"
									   placeholder="+977 9800000000"
									   class="w-full h-[42px] px-3.5 rounded-[9px] text-[0.84rem] text-[#111827]
                              border-[1.5px] border-[#e4e6ed] bg-[#f8f9fc] outline-none
                              placeholder:text-[#c1c7d4]
                              focus:border-[#2a52e8] focus:bg-white
                              focus:shadow-[0_0_0_3px_rgba(42,82,232,0.09)]
                              transition-all duration-150" />
							</div>

							<!-- Password + Confirm row -->
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

								<!-- Password -->
								<div>
									<label class="block text-[0.76rem] font-semibold text-[#374151] mb-[5px] tracking-[0.01em]">
										Password
									</label>
									<div class="relative">
										<input [type]="showPassword() ? 'text' : 'password'"
											   formControlName="password"
											   placeholder="Min 8 characters"
											   autocomplete="new-password"
											   (input)="updateStrength()"
											   class="w-full h-[42px] pl-3.5 pr-10 rounded-[9px] text-[0.84rem] text-[#111827]
                                  border-[1.5px] border-[#e4e6ed] bg-[#f8f9fc] outline-none
                                  placeholder:text-[#c1c7d4]
                                  focus:border-[#2a52e8] focus:bg-white
                                  focus:shadow-[0_0_0_3px_rgba(42,82,232,0.09)]
                                  transition-all duration-150"
											   [class.!border-red-400]="f['password'].invalid && f['password'].touched" />
										<button type="button"
												(click)="showPassword.set(!showPassword())"
												class="absolute right-0 top-0 h-[42px] w-[40px] flex items-center justify-center
                                   text-[#b0b8cc] hover:text-[#374151] transition-colors duration-150">
											@if (showPassword()) {
												<svg class="w-[17px] h-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
													<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
													<line x1="1" y1="1" x2="23" y2="23"/>
												</svg>
											} @else {
												<svg class="w-[17px] h-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
													<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
													<circle cx="12" cy="12" r="3"/>
												</svg>
											}
										</button>
									</div>

									<!-- Strength meter -->
									@if (f['password'].value) {
										<div class="flex gap-1 mt-1.5">
											@for (i of [0,1,2,3]; track i) {
												<div class="h-[3px] flex-1 rounded-full transition-all duration-300"
													 [style.background]="i < strength() ? strengthColor() : '#e4e6ed'"></div>
											}
										</div>
										<p class="text-[0.68rem] font-semibold mt-1" [style.color]="strengthColor()">
											{{ strengthLabel() }}
										</p>
									}
									@if (f['password'].invalid && f['password'].touched && !f['password'].value) {
										<p class="flex items-center gap-1 text-[0.71rem] text-red-500 font-medium mt-1">
											<svg class="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
											Min 8 characters.
										</p>
									}
								</div>

								<!-- Confirm Password -->
								<div>
									<label class="block text-[0.76rem] font-semibold text-[#374151] mb-[5px] tracking-[0.01em]">
										Confirm Password
									</label>
									<div class="relative">
										<input [type]="showPassword() ? 'text' : 'password'"
											   formControlName="confirmPassword"
											   placeholder="Re-enter password"
											   autocomplete="new-password"
											   class="w-full h-[42px] pl-3.5 pr-10 rounded-[9px] text-[0.84rem] text-[#111827]
                                  border-[1.5px] border-[#e4e6ed] bg-[#f8f9fc] outline-none
                                  placeholder:text-[#c1c7d4]
                                  focus:border-[#2a52e8] focus:bg-white
                                  focus:shadow-[0_0_0_3px_rgba(42,82,232,0.09)]
                                  transition-all duration-150"
											   [class.!border-red-400]="f['confirmPassword'].touched && form.hasError('mismatch')" />
										<!-- Match tick -->
										@if (f['confirmPassword'].value && !form.hasError('mismatch')) {
											<div class="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
												<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
													<polyline points="20 6 9 17 4 12"/>
												</svg>
											</div>
										}
									</div>
									@if (f['confirmPassword'].touched && form.hasError('mismatch')) {
										<p class="flex items-center gap-1 text-[0.71rem] text-red-500 font-medium mt-1">
											<svg class="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
											Passwords don't match.
										</p>
									}
								</div>

							</div>

							<!-- Account Type -->
							<div class="mb-6">
								<label class="block text-[0.76rem] font-semibold text-[#374151] mb-2.5 tracking-[0.01em]">
									Account Type
								</label>
								<div class="flex flex-col gap-2">
									@for (role of roles; track role.value) {
										<label
											class="flex items-center gap-3.5 px-4 py-3 rounded-[11px]
                             border-[1.5px] cursor-pointer transition-all duration-150 select-none"
											[class.border-[#2a52e8]]="form.value.role === role.value"
											[class.bg-[#eef1fd]]="form.value.role === role.value"
											[class.border-[#e4e6ed]]="form.value.role !== role.value"
											[class.bg-[#f8f9fc]]="form.value.role !== role.value"
											[class.hover:border-[#9db3f7]]="form.value.role !== role.value"
											[class.hover:bg-[#f3f5fe]]="form.value.role !== role.value">

											<!-- Hidden radio -->
											<input type="radio" [value]="role.value" formControlName="role" class="sr-only" />

											<!-- Icon badge -->
											<div class="w-9 h-9 rounded-[9px] flex items-center justify-center flex-shrink-0 text-[1.1rem]"
												 [class.bg-[#dce3fb]]="form.value.role === role.value"
												 [class.bg-[#eceef4]]="form.value.role !== role.value">
												{{ role.icon }}
											</div>

											<!-- Text -->
											<div class="flex-1 min-w-0">
												<p class="text-[0.82rem] font-semibold leading-tight"
												   [class.text-[#1e3fc0]]="form.value.role === role.value"
												   [class.text-[#111827]]="form.value.role !== role.value">
													{{ role.label }}
												</p>
												<p class="text-[0.71rem] text-[#8a93a8] mt-[2px]">{{ role.desc }}</p>
											</div>

											<!-- Radio indicator -->
											<div class="w-[18px] h-[18px] rounded-full flex-shrink-0 flex items-center justify-center
                                  border-[1.5px] transition-all duration-150"
												 [class.border-[#2a52e8]]="form.value.role === role.value"
												 [class.bg-[#2a52e8]]="form.value.role === role.value"
												 [class.border-[#c8cdd9]]="form.value.role !== role.value"
												 [class.bg-transparent]="form.value.role !== role.value">
												@if (form.value.role === role.value) {
													<div class="w-[7px] h-[7px] rounded-full bg-white"></div>
												}
											</div>

										</label>
									}
								</div>
							</div>

							<!-- Submit -->
							<button
								type="submit"
								[disabled]="(loading$ | async) || form.invalid"
								class="w-full h-[46px] flex items-center justify-center gap-2
                       rounded-[11px] font-bold text-[0.88rem] text-white tracking-[0.01em]
                       bg-[linear-gradient(135deg,#1a35c8_0%,#2a52e8_60%,#4a6ef5_100%)]
                       shadow-[0_4px_16px_rgba(42,82,232,0.38)]
                       transition-all duration-150
                       hover:shadow-[0_6px_20px_rgba(42,82,232,0.45)] hover:-translate-y-[1px]
                       active:translate-y-0 active:shadow-[0_2px_10px_rgba(42,82,232,0.3)]
                       disabled:opacity-50 disabled:cursor-not-allowed
                       disabled:shadow-none disabled:translate-y-0">
								@if (loading$ | async) {
									<div class="w-[17px] h-[17px] rounded-full border-[2.5px] border-white/30 border-t-white animate-spin"></div>
									<span>Creating account…</span>
								} @else {
									<span>Create Account</span>
									<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none"
										 stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
										<line x1="5" y1="12" x2="19" y2="12"/>
										<polyline points="12 5 19 12 12 19"/>
									</svg>
								}
							</button>

							<!-- Sign in link -->
							<p class="text-center text-[0.8rem] text-[#9ba3b5] mt-5">
								Already have an account?
								<a routerLink="/auth/login"
								   class="text-[#2a52e8] font-semibold ml-1 no-underline
                          hover:text-[#1a35c8] transition-colors duration-150">
									Sign in
								</a>
							</p>

						</form>
					</div>

				</div>
			</div>

		</div>
	`
})
export class RegisterComponent implements OnInit, OnDestroy {
	private readonly authService = inject(AuthService);
	private readonly fb          = inject(FormBuilder);
	private readonly destroy$    = new Subject<void>();

	readonly loading$ = this.authService.loading$;
	readonly error$   = this.authService.error$;

	showPassword  = signal(false);
	strength      = signal(0);
	strengthLabel = signal('');
	strengthColor = signal('#e4e6ed');

	form!: FormGroup;
	get f() { return this.form.controls; }

	readonly roles = [
		// { value: 'user',      label: 'Student / Applicant', icon: '🎓', desc: 'Looking to study abroad' },
		{ value: 'moderator', label: 'Staff / Counsellor',  icon: '💼', desc: 'Internal team member'    },
		// { value: 'admin',     label: 'Administrator',        icon: '🛡️', desc: 'Full system access'      },
	];

	ngOnInit(): void {
		this.form = this.fb.group({
			displayName:     ['', [Validators.required, Validators.minLength(2)]],
			email:           ['', [Validators.required, Validators.email]],
			phone:           [''],
			password:        ['', [Validators.required, Validators.minLength(8)]],
			confirmPassword: ['', Validators.required],
			role:            ['moderator'],
		}, { validators: passwordMatchValidator });
		this.authService.clearError();
	}

	updateStrength(): void {
		const pw: string = this.form.value.password || '';
		let score = 0;
		if (pw.length >= 8)          score++;
		if (/[A-Z]/.test(pw))        score++;
		if (/[0-9]/.test(pw))        score++;
		if (/[^A-Za-z0-9]/.test(pw)) score++;

		const labels = ['Weak', 'Fair', 'Good', 'Strong'];
		const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
		this.strength.set(score);
		this.strengthLabel.set(labels[score - 1] ?? '');
		this.strengthColor.set(colors[score - 1] ?? '#e4e6ed');
	}

	onSubmit(): void {
		if (this.form.invalid) { this.form.markAllAsTouched(); return; }
		this.authService.register(this.form.value)
			.pipe(takeUntil(this.destroy$))
			.subscribe({ error: () => {} });
	}

	ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
