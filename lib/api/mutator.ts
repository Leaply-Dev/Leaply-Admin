import { useAuthStore } from "../store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
const isDev = process.env.NODE_ENV === "development";

function performLogout(redirectUrl = "/login?expired=true") {
	useAuthStore.getState().logout();
	if (typeof window !== "undefined") {
		window.location.href = redirectUrl;
	}
}

/**
 * Custom fetch instance for Orval-generated hooks.
 */
export interface CustomInstanceConfig {
	url: string;
	method: string;
	params?: Record<string, unknown>;
	data?: unknown;
	headers?: HeadersInit;
	signal?: AbortSignal;
}

export const customInstance = async <T>(
	config: CustomInstanceConfig,
): Promise<T> => {
	const { url, method, params, data, headers, signal } = config;

	let fullUrl = `${API_URL}${url}`;
	if (params) {
		const searchParams = new URLSearchParams();
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined && value !== null) {
				searchParams.append(key, String(value));
			}
		}
		const queryString = searchParams.toString();
		if (queryString) fullUrl += `?${queryString}`;
	}

	const requestHeaders: Record<string, string> = {};

	if (!(data instanceof FormData)) {
		requestHeaders["Content-Type"] = "application/json";
	}

	if (headers) {
		const headersObj =
			headers instanceof Headers
				? Object.fromEntries(headers.entries())
				: Array.isArray(headers)
					? Object.fromEntries(headers)
					: (headers as Record<string, string>);
		Object.assign(requestHeaders, headersObj);
	}

	if (isDev) console.log(`🚀 [${method}] ${url}`);

	const fetchConfig: RequestInit = {
		method,
		headers: requestHeaders,
		credentials: "include",
		signal,
	};

	if (data) {
		fetchConfig.body = data instanceof FormData ? data : JSON.stringify(data);
	}

	try {
		const response = await fetch(fullUrl, fetchConfig);

		if (isDev) {
			console.log(`${response.ok ? "✅" : "❌"} [${response.status}] ${url}`);
		}

		if (response.status === 401) {
			performLogout();
			throw new Error("Failed to continue session");
		}

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(
				(errorData as { message?: string }).message || "Request failed",
			);
		}

		return (await response.json()) as T;
	} catch (error) {
		if (
			isDev &&
			error instanceof TypeError &&
			error.message.includes("fetch")
		) {
			console.error(`💥 Network Error [${method}] ${url}:`, error);
		}
		throw error;
	}
};

export default customInstance;

export type ErrorType<Error> = Error;
export type BodyType<BodyData> = BodyData;
