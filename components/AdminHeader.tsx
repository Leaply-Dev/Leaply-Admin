"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/authStore";

export function AdminHeader() {
	const router = useRouter();
	const { profile, logout } = useAuthStore();

	const handleLogout = () => {
		logout();
		router.push("/login");
	};

	const getRoleBadgeVariant = (role: string) => {
		switch (role) {
			case "super_admin":
				return "destructive";
			case "data_admin":
				return "default";
			default:
				return "secondary";
		}
	};

	const getRoleLabel = (role: string) => {
		switch (role) {
			case "super_admin":
				return "Super Admin";
			case "data_admin":
				return "Data Admin";
			default:
				return role;
		}
	};

	return (
		<header className="h-14 border-b border-border bg-card flex items-center justify-between px-6">
			<h1 className="text-lg font-semibold">Admin Dashboard</h1>

			<div className="flex items-center gap-4">
				<div className="flex items-center gap-3">
					<Avatar className="h-8 w-8">
						<AvatarFallback>
							{profile?.fullName?.charAt(0) ||
								profile?.email?.charAt(0).toUpperCase() ||
								"A"}
						</AvatarFallback>
					</Avatar>
					<div className="text-sm">
						<p className="font-medium">
							{profile?.fullName || profile?.email || "Admin"}
						</p>
						<Badge
							variant={getRoleBadgeVariant(profile?.role || "")}
							className="text-xs"
						>
							{getRoleLabel(profile?.role || "")}
						</Badge>
					</div>
				</div>
				<Button variant="ghost" size="icon" onClick={handleLogout}>
					<LogOut className="h-4 w-4" />
				</Button>
			</div>
		</header>
	);
}
