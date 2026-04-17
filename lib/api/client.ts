import { useAuthStore } from "../store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
const isDev = process.env.NODE_ENV === "development";

type RequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface FetchOptions extends RequestInit {
	_skipAuth?: boolean;
}

export interface ApiResponse<T> {
	success: boolean;
	data: T;
	message?: string;
	error?: {
		code?: string;
		field?: string;
		details?: Record<string, unknown>;
	};
	timestamp?: string;
}

export class ApiError extends Error {
	constructor(
		public message: string,
		public status: number,
		public code?: string,
		public field?: string,
		public details?: Record<string, unknown>,
		public endpoint?: string,
		public timestamp?: string,
	) {
		super(message);
		this.name = "ApiError";
	}

	getUserMessage(): string {
		switch (this.status) {
			case 400:
				return this.message || "Invalid request. Please check your input.";
			case 401:
				return "Please log in to continue.";
			case 403:
				return "You don't have permission to perform this action.";
			case 404:
				return "The requested resource was not found.";
			case 500:
				return "Something went wrong on our end. Please try again later.";
			default:
				return this.message || "An unexpected error occurred.";
		}
	}

	logDetails(): void {
		console.group(`🚨 API Error [${this.status}] - ${this.endpoint}`);
		console.error("Message:", this.message);
		console.error("Code:", this.code || "N/A");
		console.error("Details:", this.details || "N/A");
		console.error("Timestamp:", this.timestamp || "N/A");
		console.groupEnd();
	}
}

async function apiFetch<T>(
	endpoint: string,
	method: RequestMethod = "GET",
	body?: unknown,
	options: FetchOptions = {},
): Promise<T> {
	const { headers, ...customConfig } = options;

	const requestHeaders: HeadersInit = {
		"Content-Type": "application/json",
		...((headers as Record<string, string>) || {}),
	};

	const config: RequestInit = {
		method,
		headers: requestHeaders,
		credentials: "include",
		...customConfig,
	};

	if (body) {
		config.body = JSON.stringify(body);
	}

	const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
	const url = `${API_URL}${path}`;

	if (isDev) console.log(`📡 [${method}] ${path}`, body ? { body } : "");

	try {
		const response = await fetch(url, config);

		let data: ApiResponse<T> | null = null;
		const contentType = response.headers.get("content-type");

		if (contentType?.includes("application/json")) {
			data = (await response.json()) as ApiResponse<T>;
		} else {
			const textBody = await response.text();
			throw new ApiError(
				"Unexpected response format from server",
				response.status,
				"INVALID_CONTENT_TYPE",
				undefined,
				{ contentType, body: textBody.slice(0, 500) },
				path,
			);
		}

		if (isDev) {
			console.log(
				`${response.ok ? "✅" : "❌"} [${method}] ${path} - ${response.status}`,
			);
		}

		if (!response.ok || !data?.success) {
			const apiError = new ApiError(
				data?.message || "An error occurred",
				response.status,
				data?.error?.code,
				data?.error?.field,
				data?.error?.details,
				path,
				data?.timestamp,
			);

			if (isDev) apiError.logDetails();

			if (response.status === 401) {
				useAuthStore.getState().logout();
				if (typeof window !== "undefined") {
					window.location.href = "/login?expired=true";
				}
			}

			throw apiError;
		}

		return data.data;
	} catch (error) {
		if (error instanceof ApiError) throw error;

		const isNetworkError =
			error instanceof TypeError && error.message.includes("fetch");

		throw new ApiError(
			isNetworkError
				? "Unable to connect to server. Please check your connection."
				: error instanceof Error
					? error.message
					: "Network error",
			0,
			isNetworkError ? "NETWORK_ERROR" : "UNKNOWN_ERROR",
			undefined,
			{ originalError: String(error) },
			path,
		);
	}
}

export const apiClient = {
	get: <T>(endpoint: string, options?: FetchOptions) =>
		apiFetch<T>(endpoint, "GET", undefined, options),
	post: <T>(endpoint: string, body: unknown, options?: FetchOptions) =>
		apiFetch<T>(endpoint, "POST", body, options),
	put: <T>(endpoint: string, body: unknown, options?: FetchOptions) =>
		apiFetch<T>(endpoint, "PUT", body, options),
	delete: <T>(endpoint: string, options?: FetchOptions) =>
		apiFetch<T>(endpoint, "DELETE", undefined, options),
	patch: <T>(endpoint: string, body: unknown, options?: FetchOptions) =>
		apiFetch<T>(endpoint, "PATCH", body, options),
};
