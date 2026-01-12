"use client";

import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminSidebar } from "@/components/AdminSidebar";
import { SessionTimeoutWarning } from "@/components/SessionTimeoutWarning";
import { refreshAccessToken } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/authStore";

// Session timeout configuration
const PROACTIVE_REFRESH_BUFFER_MS = 120000; // 2 minutes before expiry
const WARNING_BUFFER_MS = 60000; // 1 minute before expiry
const REFRESH_CHECK_INTERVAL_MS = 10000; // Check every 10 seconds

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const { isAuthenticated, isAdmin, accessToken, tokenExpiresAt, logout } =
		useAuthStore();
	const [mounted, setMounted] = useState(false);
	const [showWarning, setShowWarning] = useState(false);
	const [secondsRemaining, setSecondsRemaining] = useState(60);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Proactive token refresh and session warning
	useEffect(() => {
		if (!mounted || !isAuthenticated || !tokenExpiresAt) return;

		const checkTokenExpiry = async () => {
			const now = Date.now();
			const timeUntilExpiry = tokenExpiresAt - now;

			// Already expired - let the auth check handle it
			if (timeUntilExpiry <= 0) return;

			// Warning zone: <= 1 minute remaining
			if (timeUntilExpiry <= WARNING_BUFFER_MS) {
				const seconds = Math.max(0, Math.ceil(timeUntilExpiry / 1000));
				setSecondsRemaining(seconds);
				setShowWarning(true);
				return;
			}

			// Proactive refresh zone: <= 2 minutes remaining but > 1 minute
			if (timeUntilExpiry <= PROACTIVE_REFRESH_BUFFER_MS) {
				try {
					await refreshAccessToken();
					// Token refreshed, warning not needed
					setShowWarning(false);
				} catch {
					// Refresh failed, let the warning show when we hit 1 minute
				}
			}
		};

		// Check immediately
		checkTokenExpiry();

		// Then check periodically
		const interval = setInterval(checkTokenExpiry, REFRESH_CHECK_INTERVAL_MS);

		return () => clearInterval(interval);
	}, [mounted, isAuthenticated, tokenExpiresAt]);

	const handleExtendSession = useCallback(() => {
		setShowWarning(false);
		setSecondsRemaining(60);
	}, []);

	useEffect(() => {
		if (mounted) {
			// Check for auth state corruption: cookie says auth but store says not
			const authCookie = Cookies.get("leaply-admin-auth-state");
			if (authCookie && !isAuthenticated) {
				try {
					const parsed = JSON.parse(authCookie);
					if (parsed.isAuthenticated) {
						console.warn("Admin auth state corruption: clearing stale cookie");
						Cookies.remove("leaply-admin-auth-state", { path: "/" });
						router.push("/login?expired=true");
						return;
					}
				} catch {
					// Invalid cookie, remove it
					Cookies.remove("leaply-admin-auth-state", { path: "/" });
				}
			}

			// Check for corruption: authenticated but no token
			if (isAuthenticated && !accessToken) {
				console.warn("Admin auth corruption: auth but no token");
				logout();
				router.push("/login?expired=true");
				return;
			}

			// Check if token is expired (with 60 second buffer)
			if (
				isAuthenticated &&
				tokenExpiresAt &&
				tokenExpiresAt < Date.now() + 60000
			) {
				console.warn("Admin token expired, redirecting to login");
				logout();
				router.push("/login?expired=true");
				return;
			}

			if (!isAuthenticated) {
				router.push("/login");
				return;
			}
			if (!isAdmin()) {
				router.push("/login");
				return;
			}
		}
	}, [
		mounted,
		isAuthenticated,
		isAdmin,
		router,
		accessToken,
		tokenExpiresAt,
		logout,
	]);

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
			<SessionTimeoutWarning
				isOpen={showWarning}
				secondsRemaining={secondsRemaining}
				onExtendSession={handleExtendSession}
			/>
		</div>
	);
}
