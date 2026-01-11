import Cookies from "js-cookie";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "user" | "data_admin" | "super_admin";

export interface AdminProfile {
	id: string;
	email: string;
	fullName: string;
	role: UserRole;
}

interface AuthState {
	profile: AdminProfile | null;
	accessToken: string | null;
	refreshToken: string | null;
	tokenExpiresAt: number | null; // Unix timestamp in ms
	isAuthenticated: boolean;
	login: (
		profile: AdminProfile,
		accessToken: string,
		refreshToken: string,
		expiresIn: number,
	) => void;
	setTokens: (
		accessToken: string,
		refreshToken: string,
		expiresIn: number,
	) => void;
	logout: () => void;
	isAdmin: () => boolean;
	isSuperAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			profile: null,
			accessToken: null,
			refreshToken: null,
			tokenExpiresAt: null,
			isAuthenticated: false,

			login: (profile, accessToken, refreshToken, expiresIn) =>
				set({
					profile,
					accessToken,
					refreshToken,
					tokenExpiresAt: Date.now() + expiresIn * 1000,
					isAuthenticated: true,
				}),

			setTokens: (accessToken, refreshToken, expiresIn) =>
				set({
					accessToken,
					refreshToken,
					tokenExpiresAt: Date.now() + expiresIn * 1000,
				}),

			logout: () =>
				set({
					profile: null,
					accessToken: null,
					refreshToken: null,
					tokenExpiresAt: null,
					isAuthenticated: false,
				}),

			isAdmin: () => {
				const { profile } = get();
				return (
					profile?.role === "data_admin" || profile?.role === "super_admin"
				);
			},

			isSuperAdmin: () => {
				const { profile } = get();
				return profile?.role === "super_admin";
			},
		}),
		{
			name: "leaply-admin-auth",
			partialize: (state) => ({
				profile: state.profile,
				accessToken: state.accessToken,
				refreshToken: state.refreshToken,
				tokenExpiresAt: state.tokenExpiresAt,
				isAuthenticated: state.isAuthenticated,
			}),
		},
	),
);

// Sync auth state to cookies for potential middleware use
useAuthStore.subscribe((state) => {
	const authState = {
		isAuthenticated: state.isAuthenticated,
		role: state.profile?.role,
	};
	Cookies.set("leaply-admin-auth-state", JSON.stringify(authState), {
		expires: 7,
		path: "/",
		sameSite: "lax",
	});
});
