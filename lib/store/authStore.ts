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
	isAuthenticated: boolean;
	login: (profile: AdminProfile) => void;
	logout: () => void;
	isAdmin: () => boolean;
	isSuperAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			profile: null,
			isAuthenticated: false,

			login: (profile) => set({ profile, isAuthenticated: true }),

			logout: () => set({ profile: null, isAuthenticated: false }),

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
				isAuthenticated: state.isAuthenticated,
			}),
		},
	),
);

// Sync auth state to cookie for Next.js middleware route protection
useAuthStore.subscribe((state) => {
	if (state.isAuthenticated) {
		Cookies.set(
			"leaply-admin-auth-state",
			JSON.stringify({ isAuthenticated: true, role: state.profile?.role }),
			{ expires: 7, path: "/", sameSite: "lax" },
		);
	} else {
		Cookies.remove("leaply-admin-auth-state", { path: "/" });
	}
});
