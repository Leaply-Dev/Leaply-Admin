"use client";

import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminSidebar } from "@/components/AdminSidebar";
import { useAuthStore } from "@/lib/store/authStore";

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const { isAuthenticated, isAdmin, logout } = useAuthStore();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!mounted) return;

		// Detect stale cookie (cookie says auth but Zustand store says not)
		const authCookie = Cookies.get("leaply-admin-auth-state");
		if (authCookie && !isAuthenticated) {
			try {
				const parsed = JSON.parse(authCookie);
				if (parsed.isAuthenticated) {
					Cookies.remove("leaply-admin-auth-state", { path: "/" });
					router.push("/login?expired=true");
					return;
				}
			} catch {
				Cookies.remove("leaply-admin-auth-state", { path: "/" });
			}
		}

		if (!isAuthenticated) {
			router.push("/login");
			return;
		}
		if (!isAdmin()) {
			logout();
			router.push("/login");
		}
	}, [mounted, isAuthenticated, isAdmin, logout, router]);

	if (!mounted || !isAuthenticated || !isAdmin()) {
		return (
			<div className="h-screen flex items-center justify-center">
				<div className="animate-pulse text-muted-foreground">Loading...</div>
			</div>
		);
	}

	return (
		<div className="h-screen flex">
			<AdminSidebar />
			<div className="flex-1 flex flex-col overflow-hidden">
				<AdminHeader />
				<main className="flex-1 overflow-y-auto bg-muted/30 p-6">
					{children}
				</main>
			</div>
		</div>
	);
}
