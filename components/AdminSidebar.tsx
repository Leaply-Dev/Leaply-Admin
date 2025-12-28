"use client";

import {
	Building2,
	GraduationCap,
	LayoutDashboard,
	Upload,
	Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
	{ href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
	{ href: "/admin/universities", icon: Building2, label: "Universities" },
	{ href: "/admin/programs", icon: GraduationCap, label: "Programs" },
	{ href: "/admin/users", icon: Users, label: "Users" },
	{ href: "/admin/import", icon: Upload, label: "Import" },
];

export function AdminSidebar() {
	const pathname = usePathname();

	return (
		<aside className="w-64 bg-card border-r border-border flex flex-col">
			<div className="p-4 border-b border-border">
				<Link href="/admin/universities" className="flex items-center gap-2">
					<Image src="/Logo.png" alt="Leaply" width={100} height={32} />
					<span className="text-sm font-medium text-muted-foreground">
						Admin
					</span>
				</Link>
			</div>

			<nav className="flex-1 p-4 space-y-1">
				{navItems.map((item) => {
					const isActive =
						pathname === item.href || pathname.startsWith(`${item.href}/`);
					return (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								"flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
								isActive
									? "bg-primary text-primary-foreground"
									: "text-muted-foreground hover:bg-muted hover:text-foreground",
							)}
						>
							<item.icon className="h-4 w-4" />
							{item.label}
						</Link>
					);
				})}
			</nav>

			<div className="p-4 border-t border-border">
				<p className="text-xs text-muted-foreground">
					Leaply Admin Dashboard v0.1.0
				</p>
			</div>
		</aside>
	);
}
