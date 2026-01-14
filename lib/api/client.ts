import { useAuthStore } from "../store/authStore";
import type { RefreshTokenResponse } from "../types/admin";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
const isDev = process.env.NODE_ENV === "development";

// Token lifetime in seconds (matches backend JWT config)
export const TOKEN_LIFETIME_SECONDS = 900; // 15 minutes

// Retry configuration for token refresh
const MAX_REFRESH_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 1000; // 1s, 2s, 4s exponential backoff

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if an error is retryable (network errors, 5xx server errors)
 * 4xx errors (like invalid token) should not be retried
 */
function isRetryableError(error: unknown, status?: number): boolean {
	// Network errors are retryable
	if (error instanceof TypeError && error.message.includes("fetch")) {
		return true;
	}
	// 5xx server errors are retryable
	if (status && status >= 500) {
		return true;
	}
	// Timeout errors are retryable
	if (error instanceof Error && error.message.includes("timeout")) {
		return true;
	}
	return false;
}

type RequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

// Token refresh state management
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(callback: (token: string) => void) {
	refreshSubscribers.push(callback);
}

function onTokenRefreshed(newToken: string) {
	for (const callback of refreshSubscribers) {
		callback(newToken);
	}
	refreshSubscribers = [];
}

function onRefreshFailed() {
	refreshSubscribers = [];
}

interface FetchOptions extends RequestInit {
	token?: string;
	_retry?: boolean; // Flag to prevent infinite retry loops
	_skipAuth?: boolean; // Skip auth header (for refresh endpoint)
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
		console.error("Field:", this.field || "N/A");
		console.error("Details:", this.details || "N/A");
		console.error("Timestamp:", this.timestamp || "N/A");
		console.groupEnd();
	}
}

/**
 * Attempt to refresh the access token using the refresh token
 * Includes retry logic with exponential backoff for transient failures
 */
export async function refreshAccessToken(
	retryCount = 0,
): Promise<string | null> {
	const { refreshToken, setTokens, logout } = useAuthStore.getState();

	if (!refreshToken) {
		logout();
		return null;
	}

	try {
		const response = await fetch(`${API_URL}/v1/auth/refresh`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ refreshToken }),
		});

		// Check if error is retryable (5xx server errors)
		if (!response.ok) {
			if (
				retryCount < MAX_REFRESH_RETRIES &&
				isRetryableError(null, response.status)
			) {
				const delay = RETRY_BASE_DELAY_MS * 2 ** retryCount;
				if (isDev)
					console.log(
						`Token refresh failed with ${response.status}, retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_REFRESH_RETRIES})`,
					);
				await sleep(delay);
				return refreshAccessToken(retryCount + 1);
			}
			throw new Error("Refresh failed");
		}

		const data = (await response.json()) as ApiResponse<RefreshTokenResponse>;

		if (!data.success || !data.data) {
			throw new Error("Invalid refresh response");
		}

		const { accessToken, refreshToken: newRefreshToken, expiresIn } = data.data;
		setTokens(accessToken, newRefreshToken, expiresIn);

		if (isDev) {
			console.log("🔄 Token refreshed successfully");
		}

		return accessToken;
	} catch (error) {
		// Retry on network/transient errors
		if (retryCount < MAX_REFRESH_RETRIES && isRetryableError(error)) {
			const delay = RETRY_BASE_DELAY_MS * 2 ** retryCount;
			if (isDev)
				console.log(
					`Token refresh error, retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_REFRESH_RETRIES})`,
				);
			await sleep(delay);
			return refreshAccessToken(retryCount + 1);
		}
		if (isDev) {
			console.error("🔄 Token refresh failed:", error);
		}
		logout();
		return null;
	}
}

async function handleUnauthorized(): Promise<string | null> {
	// If already refreshing, wait for it to complete
	if (isRefreshing) {
		return new Promise<string | null>((resolve) => {
			subscribeTokenRefresh((token) => resolve(token));
		});
	}

	isRefreshing = true;

	try {
		const newToken = await refreshAccessToken();

		if (newToken) {
			onTokenRefreshed(newToken);
			return newToken;
		}

		onRefreshFailed();
		// Redirect to login
		if (typeof window !== "undefined") {
			window.location.href = "/login?expired=true";
		}
		return null;
	} finally {
		isRefreshing = false;
	}
}

async function apiFetch<T>(
	endpoint: string,
	method: RequestMethod = "GET",
	body?: unknown,
	options: FetchOptions = {},
): Promise<T> {
	const { token, headers, _retry, _skipAuth, ...customConfig } = options;

	const requestHeaders: HeadersInit = {
		"Content-Type": "application/json",
		...((headers as Record<string, string>) || {}),
	};

	// Add authorization header unless skipped
	if (!_skipAuth) {
		if (token) {
			requestHeaders.Authorization = `Bearer ${token}`;
		} else {
			try {
				const storeToken = useAuthStore.getState().accessToken;
				if (storeToken) {
					requestHeaders.Authorization = `Bearer ${storeToken}`;
				}
			} catch (e) {
				if (isDev) console.warn("Failed to retrieve token from store", e);
			}
		}
	}

	const config: RequestInit = {
		method,
		headers: requestHeaders,
		...customConfig,
	};

	if (body) {
		config.body = JSON.stringify(body);
	}

	const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
	const url = `${API_URL}${path}`;

	if (isDev) {
		console.log(`📡 [${method}] ${path}`, body ? { body } : "");
	}

	const startTime = performance.now();

	try {
		const response = await fetch(url, config);

		let data: ApiResponse<T> | null = null;
		const contentType = response.headers.get("content-type");

		if (contentType?.includes("application/json")) {
			try {
				data = (await response.json()) as ApiResponse<T>;
			} catch (parseError) {
				if (isDev) console.error("Failed to parse JSON response:", parseError);
				throw new ApiError(
					"Invalid response from server",
					response.status,
					"PARSE_ERROR",
					undefined,
					{ parseError: String(parseError) },
					path,
				);
			}
		} else {
			const textBody = await response.text();
			if (isDev) console.error("Non-JSON response:", textBody);
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
			const duration = (performance.now() - startTime).toFixed(0);
			console.log(
				`${response.ok ? "✅" : "❌"} [${method}] ${path} - ${response.status} (${duration}ms)`,
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

			// Handle 401 Unauthorized - attempt token refresh
			if (response.status === 401 && !_retry) {
				const newToken = await handleUnauthorized();

				if (newToken) {
					// Retry the original request with new token
					return apiFetch<T>(endpoint, method, body, {
						...options,
						token: newToken,
						_retry: true,
					});
				}

				// Refresh failed, error will be thrown
			}

			// Handle 403 Forbidden - show error only, no logout
			if (response.status === 403) {
				// Just throw the error, don't logout
				// User is authenticated but lacks permission
			}

			throw apiError;
		}

		return data.data;
	} catch (error) {
		if (error instanceof ApiError) {
			throw error;
		}

		const isNetworkError =
			error instanceof TypeError && error.message.includes("fetch");

		if (isDev) {
			console.error(`🌐 Network Error [${method}] ${path}:`, error);
		}

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
