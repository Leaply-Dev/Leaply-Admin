// Common types
export interface PageResponse<T> {
	content: T[];
	totalElements: number;
	totalPages: number;
	size: number;
	number: number; // current page (0-indexed)
}

// Auth types
export interface AuthResponse {
	userId: string;
	email: string;
	token: string;
	role: "user" | "data_admin" | "super_admin";
	onboardingCompleted: boolean;
}

export interface LoginRequest {
	email: string;
	password: string;
}

// Dashboard Stats
export interface DashboardStatsResponse {
	totalUsers: number;
	activeUsers: number;
	newUsersThisMonth: number;
	onboardedUsers: number;
	totalUniversities: number;
	totalPrograms: number;
	applicationsByStatus: {
		planning: number;
		writing: number;
		submitted: number;
		accepted: number;
		rejected: number;
	};
	upcomingDeadlines: number;
}

// User Admin
export interface UserAdminResponse {
	id: string;
	email: string;
	fullName: string | null;
	role: "user" | "data_admin" | "super_admin";
	onboardingCompleted: boolean;
	profileCompletion: number;
	lastActiveAt: string | null;
	createdAt: string;
}

export interface UserRoleUpdateRequest {
	role: "user" | "data_admin" | "super_admin";
}

// University Admin
export interface UniversityAdminResponse {
	id: string;
	name: string;
	nameLocal: string | null;
	country: string;
	city: string | null;
	region: string | null;
	type: string | null;
	rankingQs: number | null;
	rankingTimes: number | null;
	rankingNational: number | null;
	primaryLanguage: string;
	logoUrl: string | null;
	websiteUrl: string | null;
	description: string | null;
	programCount: number;
	createdAt: string;
	updatedAt: string;
	createdBy: string | null;
	updatedBy: string | null;
}

export interface UniversityCreateRequest {
	name: string;
	nameLocal?: string;
	country: string;
	city?: string;
	region?: string;
	type?: string;
	rankingQs?: number;
	rankingTimes?: number;
	rankingNational?: number;
	primaryLanguage?: string;
	logoUrl?: string;
	websiteUrl?: string;
	description?: string;
}

export type UniversityUpdateRequest = Partial<UniversityCreateRequest>;

// Program Admin
export interface ProgramAdminResponse {
	id: string;
	universityId: string;
	universityName: string;
	name: string;
	degreeType: string;
	degreeName: string | null;
	majorCategories: string[] | null;
	majorSubcategory: string | null;
	durationMonths: number | null;
	deliveryMode: string | null;
	language: string;
	tuition: {
		annualUsd?: number;
		totalUsd?: number;
		currency?: string;
		amount?: number;
	} | null;
	applicationFeeUsd: number | null;
	scholarshipAvailable: boolean;
	scholarshipNotes: string | null;
	description: string | null;
	requirements: {
		gpaMinimum?: number;
		ieltsMinimum?: number;
		toeflMinimum?: number;
		greRequired?: boolean;
		gmatRequired?: boolean;
		workExperienceYears?: number;
	} | null;
	programUrl: string | null;
	admissionsUrl: string | null;
	intakeCount: number;
	createdAt: string;
	updatedAt: string;
	createdBy: string | null;
	updatedBy: string | null;
}

export interface ProgramCreateRequest {
	universityId: string;
	name: string;
	degreeType: string;
	degreeName?: string;
	majorCategories?: string[];
	majorSubcategory?: string;
	durationMonths?: number;
	deliveryMode?: string;
	language?: string;
	tuition?: {
		annualUsd?: number;
		totalUsd?: number;
		currency?: string;
		amount?: number;
	};
	applicationFeeUsd?: number;
	scholarshipAvailable?: boolean;
	scholarshipNotes?: string;
	description?: string;
	requirements?: {
		gpaMinimum?: number;
		ieltsMinimum?: number;
		toeflMinimum?: number;
		greRequired?: boolean;
		gmatRequired?: boolean;
		workExperienceYears?: number;
	};
	programUrl?: string;
	admissionsUrl?: string;
}

export type ProgramUpdateRequest = Partial<
	Omit<ProgramCreateRequest, "universityId">
>;

// Intake Admin
export interface IntakeAdminResponse {
	id: string;
	programId: string;
	programName: string;
	universityName: string;
	intakeSeason: string;
	intakeNotes: string | null;
	applicationStartDate: string | null;
	applicationDeadline: string | null;
	earlyDeadline: string | null;
	decisionDate: string | null;
	startDate: string | null;
	tuitionForIntake: number | null;
	isActive: boolean;
	createdAt: string;
	createdBy: string | null;
	updatedBy: string | null;
}

export interface IntakeCreateRequest {
	intakeSeason: string;
	intakeNotes?: string;
	applicationStartDate?: string;
	applicationDeadline?: string;
	earlyDeadline?: string;
	decisionDate?: string;
	startDate?: string;
	tuitionForIntake?: number;
	isActive?: boolean;
}

export type IntakeUpdateRequest = Partial<IntakeCreateRequest>;

// CSV Import
export interface ImportResultResponse {
	total: number;
	created: number;
	updated: number;
	skipped: number;
	errors: Array<{
		row: number;
		message: string;
	}>;
}

// Query params
export interface UserListParams {
	page?: number;
	size?: number;
	search?: string;
	role?: string;
}

export interface UniversityListParams {
	page?: number;
	size?: number;
	search?: string;
	country?: string;
}

export interface ProgramListParams {
	page?: number;
	size?: number;
	universityId?: string;
	country?: string;
	search?: string;
}

export interface IntakeListParams {
	page?: number;
	size?: number;
}
