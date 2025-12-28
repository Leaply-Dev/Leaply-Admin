"use client";

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
	const { profile, isAuthenticated, isAdmin } = useAuthStore();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (mounted) {
			if (!isAuthenticated) {
				router.push("/login");
				return;
			}
			if (!isAdmin()) {
				router.push("/login");
				return;
			}
		}
	}, [mounted, isAuthenticated, isAdmin, router]);

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
