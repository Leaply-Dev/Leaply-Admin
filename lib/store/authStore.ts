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
	token: string | null;
	isAuthenticated: boolean;
	login: (profile: AdminProfile, token: string) => void;
	logout: () => void;
	isAdmin: () => boolean;
	isSuperAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			profile: null,
			token: null,
			isAuthenticated: false,

			login: (profile, token) => set({ profile, token, isAuthenticated: true }),

			logout: () =>
				set({
					profile: null,
					token: null,
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
				token: state.token,
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
