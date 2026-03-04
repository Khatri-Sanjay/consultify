export type UserRole = 'admin' | 'user' | 'moderator';

export interface AppUser {
	uid: string;
	email: string;
	displayName: string;
	role: UserRole;
	photoURL?: string;
	createdAt: Date;
	updatedAt: Date;
	isActive: boolean;
	phone?: string;
}

export interface RegisterForm {
	displayName: string;
	email: string;
	password: string;
	confirmPassword: string;
	phone?: string;
	role?: UserRole;
}

export interface LoginForm {
	email: string;
	password: string;
	rememberMe?: boolean;
}
