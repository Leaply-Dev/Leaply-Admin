import type {
	AuthResponse,
	DashboardStatsResponse,
	ImportResultResponse,
	IntakeAdminResponse,
	IntakeCreateRequest,
	IntakeListParams,
	IntakeUpdateRequest,
	LoginRequest,
	PageResponse,
	ProgramAdminResponse,
	ProgramCreateRequest,
	ProgramListParams,
	ProgramUpdateRequest,
	UniversityAdminResponse,
	UniversityCreateRequest,
	UniversityListParams,
	UniversityUpdateRequest,
	UserAdminResponse,
	UserListParams,
	UserRoleUpdateRequest,
} from "@/lib/types/admin";
import { apiClient } from "./client";

function buildQueryString<T extends object>(params?: T): string {
	if (!params) return "";
	const searchParams = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined && value !== null && value !== "") {
			searchParams.append(key, String(value));
		}
	}
	const queryString = searchParams.toString();
	return queryString ? `?${queryString}` : "";
}

// Auth
export async function login(credentials: LoginRequest): Promise<AuthResponse> {
	return apiClient.post<AuthResponse>("/v1/auth/login", credentials);
}

// Stats
export async function getStats(): Promise<DashboardStatsResponse> {
	return apiClient.get<DashboardStatsResponse>("/v1/admin/stats");
}

// Users
export async function getUsers(
	params?: UserListParams,
): Promise<PageResponse<UserAdminResponse>> {
	return apiClient.get<PageResponse<UserAdminResponse>>(
		`/v1/admin/users${buildQueryString(params)}`,
	);
}

export async function deleteUser(id: string): Promise<void> {
	return apiClient.delete(`/v1/admin/users/${id}`);
}

export async function updateUserRole(
	id: string,
	data: UserRoleUpdateRequest,
): Promise<UserAdminResponse> {
	return apiClient.patch<UserAdminResponse>(`/v1/admin/users/${id}/role`, data);
}

// Universities
export async function getUniversities(
	params?: UniversityListParams,
): Promise<PageResponse<UniversityAdminResponse>> {
	return apiClient.get<PageResponse<UniversityAdminResponse>>(
		`/v1/admin/universities${buildQueryString(params)}`,
	);
}

export async function getUniversity(
	id: string,
): Promise<UniversityAdminResponse> {
	return apiClient.get<UniversityAdminResponse>(`/v1/admin/universities/${id}`);
}

export async function createUniversity(
	data: UniversityCreateRequest,
): Promise<UniversityAdminResponse> {
	return apiClient.post<UniversityAdminResponse>(
		"/v1/admin/universities",
		data,
	);
}

export async function updateUniversity(
	id: string,
	data: UniversityUpdateRequest,
): Promise<UniversityAdminResponse> {
	return apiClient.put<UniversityAdminResponse>(
		`/v1/admin/universities/${id}`,
		data,
	);
}

export async function deleteUniversity(id: string): Promise<void> {
	return apiClient.delete(`/v1/admin/universities/${id}`);
}

// Programs
export async function getPrograms(
	params?: ProgramListParams,
): Promise<PageResponse<ProgramAdminResponse>> {
	return apiClient.get<PageResponse<ProgramAdminResponse>>(
		`/v1/admin/programs${buildQueryString(params)}`,
	);
}

export async function getProgram(id: string): Promise<ProgramAdminResponse> {
	return apiClient.get<ProgramAdminResponse>(`/v1/admin/programs/${id}`);
}

export async function createProgram(
	data: ProgramCreateRequest,
): Promise<ProgramAdminResponse> {
	return apiClient.post<ProgramAdminResponse>("/v1/admin/programs", data);
}

export async function updateProgram(
	id: string,
	data: ProgramUpdateRequest,
): Promise<ProgramAdminResponse> {
	return apiClient.put<ProgramAdminResponse>(`/v1/admin/programs/${id}`, data);
}

export async function deleteProgram(id: string): Promise<void> {
	return apiClient.delete(`/v1/admin/programs/${id}`);
}

// Intakes
export async function getIntakes(
	programId: string,
	params?: IntakeListParams,
): Promise<PageResponse<IntakeAdminResponse>> {
	return apiClient.get<PageResponse<IntakeAdminResponse>>(
		`/v1/admin/programs/${programId}/intakes${buildQueryString(params)}`,
	);
}

export async function getIntake(id: string): Promise<IntakeAdminResponse> {
	return apiClient.get<IntakeAdminResponse>(`/v1/admin/intakes/${id}`);
}

export async function createIntake(
	programId: string,
	data: IntakeCreateRequest,
): Promise<IntakeAdminResponse> {
	return apiClient.post<IntakeAdminResponse>(
		`/v1/admin/programs/${programId}/intakes`,
		data,
	);
}

export async function updateIntake(
	id: string,
	data: IntakeUpdateRequest,
): Promise<IntakeAdminResponse> {
	return apiClient.put<IntakeAdminResponse>(`/v1/admin/intakes/${id}`, data);
}

export async function deleteIntake(id: string): Promise<void> {
	return apiClient.delete(`/v1/admin/intakes/${id}`);
}

// CSV Import
export async function importUniversities(
	file: File,
): Promise<ImportResultResponse> {
	const formData = new FormData();
	formData.append("file", file);

	const token =
		typeof window !== "undefined"
			? localStorage.getItem("leaply-admin-auth")
			: null;
	const authData = token ? JSON.parse(token) : null;

	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}/v1/admin/import/universities`,
		{
			method: "POST",
			headers: {
				...(authData?.state?.token && {
					Authorization: `Bearer ${authData.state.token}`,
				}),
			},
			body: formData,
		},
	);

	if (!response.ok) {
		throw new Error("Failed to import universities");
	}

	const result = await response.json();
	return result.data;
}

export async function importPrograms(
	file: File,
): Promise<ImportResultResponse> {
	const formData = new FormData();
	formData.append("file", file);

	const token =
		typeof window !== "undefined"
			? localStorage.getItem("leaply-admin-auth")
			: null;
	const authData = token ? JSON.parse(token) : null;

	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}/v1/admin/import/programs`,
		{
			method: "POST",
			headers: {
				...(authData?.state?.token && {
					Authorization: `Bearer ${authData.state.token}`,
				}),
			},
			body: formData,
		},
	);

	if (!response.ok) {
		throw new Error("Failed to import programs");
	}

	const result = await response.json();
	return result.data;
}

export async function importIntakes(file: File): Promise<ImportResultResponse> {
	const formData = new FormData();
	formData.append("file", file);

	const token =
		typeof window !== "undefined"
			? localStorage.getItem("leaply-admin-auth")
			: null;
	const authData = token ? JSON.parse(token) : null;

	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}/v1/admin/import/intakes`,
		{
			method: "POST",
			headers: {
				...(authData?.state?.token && {
					Authorization: `Bearer ${authData.state.token}`,
				}),
			},
			body: formData,
		},
	);

	if (!response.ok) {
		throw new Error("Failed to import intakes");
	}

	const result = await response.json();
	return result.data;
}

export async function downloadTemplate(
	type: "universities" | "programs" | "intakes",
): Promise<Blob> {
	const token =
		typeof window !== "undefined"
			? localStorage.getItem("leaply-admin-auth")
			: null;
	const authData = token ? JSON.parse(token) : null;

	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}/v1/admin/import/templates/${type}`,
		{
			headers: {
				...(authData?.state?.token && {
					Authorization: `Bearer ${authData.state.token}`,
				}),
			},
		},
	);

	if (!response.ok) {
		throw new Error("Failed to download template");
	}

	return response.blob();
}

export const adminApi = {
	login,
	getStats,
	getUsers,
	deleteUser,
	updateUserRole,
	getUniversities,
	getUniversity,
	createUniversity,
	updateUniversity,
	deleteUniversity,
	getPrograms,
	getProgram,
	createProgram,
	updateProgram,
	deleteProgram,
	getIntakes,
	getIntake,
	createIntake,
	updateIntake,
	deleteIntake,
	importUniversities,
	importPrograms,
	importIntakes,
	downloadTemplate,
};
