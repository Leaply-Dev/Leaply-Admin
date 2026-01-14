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
	accessToken: string;
	refreshToken: string;
	expiresIn: number; // seconds until access token expires
	role: "user" | "data_admin" | "super_admin";
	onboardingCompleted: boolean;
}

export interface RefreshTokenRequest {
	refreshToken: string;
}

export interface RefreshTokenResponse {
	accessToken: string;
	refreshToken: string;
	expiresIn: number;
}

export interface LoginRequest {
	email: string;
	password: string;
}

// Dashboard Stats
export interface DashboardStatsResponse {
	// User metrics
	totalUsers: number;
	newUsersThisMonth: number;
	onboardedUsers: number;
	onboardingCompletionRate: number;

	// Content metrics
	totalUniversities: number;
	totalPrograms: number;
	totalScholarships: number;
	newScholarshipsThisMonth: number;

	// Program distribution by prerequisite major (bachelor's degree background)
	programsByPrerequisiteMajor: Record<string, number>;
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
	deletedAt: string | null;
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
	// Ranking ranges (min/max for QS and Times, single value for National)
	rankingQsMin: number | null;
	rankingQsMax: number | null;
	rankingQsDisplay: string | null; // "150" or "501-600"
	rankingTimesMin: number | null;
	rankingTimesMax: number | null;
	rankingTimesDisplay: string | null; // "150" or "501-600"
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
	// Ranking ranges (min/max for QS and Times, single value for National)
	rankingQsMin?: number;
	rankingQsMax?: number;
	rankingTimesMin?: number;
	rankingTimesMax?: number;
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
	displayName: string | null;
	useCustomDisplayName: boolean;
	degreeType: string;
	degreeName: string | null;
	majorCategories: string[] | null;
	majorSubcategory: string | null;
	durationMonthsMin: number | null;
	durationMonthsMax: number | null;
	deliveryMode: string | null;
	studyTypes: string[] | null;
	prerequisiteMajors: string[] | null;
	minWorkExperienceYears: number | null;
	language: string;
	tuition: {
		annualUsd?: number;
		annualUsdMin?: number;
		annualUsdMax?: number;
		totalUsd?: number;
		currency?: string;
		amount?: number;
	} | null;
	tuitionCurrency: string;
	applicationFeeUsd: number | null;
	scholarshipAvailable: boolean;
	scholarshipNotes: string | null;
	description: string | null;
	requirements: {
		gpaMinimum?: number;
		ieltsMinimum?: number;
		toeflMinimum?: number;
		greMinimum?: number;
		gmatMinimum?: number;
		otherTests?: OtherTest[];
		workExperienceYears?: number;
		otherRequirements?: string[];
	} | null;
	programUrl: string | null;
	admissionsUrl: string | null;
	englishProficiencyRequirement: string | null;
	admissionRequirement: string | null;
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
	useCustomDisplayName?: boolean;
	majorCategories?: string[];
	majorSubcategory?: string;
	durationMonthsMin?: number;
	durationMonthsMax?: number;
	deliveryMode?: string;
	studyTypes?: string[];
	prerequisiteMajors?: string[];
	minWorkExperienceYears?: number;
	language?: string;
	tuition?: {
		annualUsd?: number;
		annualUsdMin?: number;
		annualUsdMax?: number;
		totalUsd?: number;
		currency?: string;
		amount?: number;
	};
	tuitionCurrency?: string;
	applicationFeeUsd?: number;
	scholarshipAvailable?: boolean;
	scholarshipNotes?: string;
	description?: string;
	requirements?: {
		gpaMinimum?: number;
		ieltsMinimum?: number;
		toeflMinimum?: number;
		greMinimum?: number;
		gmatMinimum?: number;
		otherTests?: OtherTest[];
		workExperienceYears?: number;
		otherRequirements?: string[];
	};
	programUrl?: string;
	admissionsUrl?: string;
	englishProficiencyRequirement?: string;
	admissionRequirement?: string;
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

// Scholarship Admin
export type ScholarshipSourceType = "university" | "government" | "foundation";

export type ScholarshipCoverageType = "full_funded" | "partial_funded";

export type ScholarshipCoverageDuration =
	| "first_year"
	| "annual_renewable"
	| "full_program"
	| "one_time"
	| "not_specified"
	| "other";

export type ScholarshipEligibilityType = "merit" | "need_based";

export type ScholarshipEligibilityFocus =
	| "academic"
	| "holistic"
	| "leadership"
	| "research"
	| "community_service";

export type ScholarshipDegreeLevel = "bachelor" | "master" | "phd";

export type RequiredDocument =
	| "transcript"
	| "cv"
	| "motivation_letter"
	| "recommendation_letters"
	| "portfolio"
	| "research_proposal"
	| "financial_documents"
	| "language_certificate";

export interface ScholarshipAdditionalBenefits {
	travel?: boolean;
	living_stipend_monthly?: number;
	health_insurance?: boolean;
	books?: boolean;
	visa_support?: boolean;
	accommodation?: boolean;
}

// Other test type for dynamic test list
export interface OtherTest {
	name: string;
	value: string;
}

export interface ScholarshipAdminResponse {
	id: string;
	name: string;
	url: string | null;
	description: string | null;
	universityId: string | null;
	universityName: string | null;
	country: string | null;
	sourceType: ScholarshipSourceType;
	sourceName: string | null;
	degreeLevels: ScholarshipDegreeLevel[];
	eligibleFields: string[] | null;
	coverageType: ScholarshipCoverageType;
	coveragePercentage: number | null;
	coverageAmountMin: number | null;
	coverageAmountMax: number | null;
	coverageCurrency: string;
	coverageDuration: ScholarshipCoverageDuration;
	coverageDurationOther: string | null;
	coverageNotes: string | null;
	additionalBenefits: ScholarshipAdditionalBenefits | null;
	eligibilityType: ScholarshipEligibilityType;
	eligibilityFocus: ScholarshipEligibilityFocus[] | null;
	minGpa: number | null;
	gpaScale: number;
	minIelts: number | null;
	minToefl: number | null;
	minGre: number | null;
	minGmat: number | null;
	otherTests: OtherTest[] | null;
	workExperienceRequired: boolean;
	minWorkExperienceYears: number | null;
	requiredDocuments: RequiredDocument[];
	requiredDocumentsOther: string | null;
	nationalityEligible: string[] | null;
	otherRequirements: string | null;
	englishProficiencyRequirement: string | null;
	applyWithProgram: boolean;
	programApplicationUrl: string | null;
	applicationOpenDate: string | null;
	applicationDeadline: string | null;
	intakeSeasons: string[];
	isActive: boolean;
	dataSource: string | null;
	dataVerifiedAt: string | null;
	notes: string | null;
	createdAt: string;
	updatedAt: string;
	createdBy: string | null;
	updatedBy: string | null;
}

export interface ScholarshipCreateRequest {
	name: string;
	url?: string;
	description?: string;
	universityId?: string;
	sourceType?: ScholarshipSourceType;
	sourceName?: string;
	degreeLevels: ScholarshipDegreeLevel[];
	eligibleFields?: string[];
	coverageType: ScholarshipCoverageType;
	coveragePercentage?: number;
	coverageAmountMin?: number;
	coverageAmountMax?: number;
	coverageCurrency?: string;
	coverageDuration?: ScholarshipCoverageDuration;
	coverageDurationOther?: string;
	coverageNotes?: string;
	additionalBenefits?: ScholarshipAdditionalBenefits;
	eligibilityType?: ScholarshipEligibilityType;
	eligibilityFocus?: ScholarshipEligibilityFocus[];
	minGpa?: number;
	gpaScale?: number;
	minIelts?: number;
	minToefl?: number;
	minGre?: number;
	minGmat?: number;
	otherTests?: OtherTest[];
	workExperienceRequired?: boolean;
	minWorkExperienceYears?: number;
	requiredDocuments?: RequiredDocument[];
	requiredDocumentsOther?: string;
	nationalityEligible?: string[];
	otherRequirements?: string;
	englishProficiencyRequirement?: string;
	applyWithProgram?: boolean;
	programApplicationUrl?: string;
	applicationOpenDate?: string;
	applicationDeadline?: string;
	intakeSeasons?: string[];
	isActive?: boolean;
	dataSource?: string;
	notes?: string;
}

export type ScholarshipUpdateRequest = Partial<ScholarshipCreateRequest>;

export interface ScholarshipListParams {
	page?: number;
	size?: number;
	search?: string;
	universityId?: string;
	sourceType?: ScholarshipSourceType;
	coverageType?: ScholarshipCoverageType;
	eligibilityType?: ScholarshipEligibilityType;
	isActive?: boolean;
}

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
	sort?: string;
	showDeleted?: boolean;
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

// Dropdown Options (for admin forms)
export interface RegionOption {
	value: string;
	label: string;
	labelVi: string;
	countries: string[]; // Country values for this region
}

export interface CountryOption {
	value: string;
	label: string;
	labelVi: string;
	region: string; // Region value this country belongs to
}

export interface DropdownOptionsResponse {
	regions: RegionOption[];
	countries: CountryOption[];
	universityTypes: string[];
	primaryLanguages: string[];
	degreeTypes: string[];
	deliveryModes: string[];
	majorCategories: string[];
	prerequisiteMajors: string[];
	scholarshipSourceTypes: string[];
	scholarshipCoverageTypes: string[];
	scholarshipEligibilityTypes: string[];
	scholarshipCoverageDurations: string[];
	scholarshipDegreeLevels: string[];
	requiredDocuments: string[];
}
