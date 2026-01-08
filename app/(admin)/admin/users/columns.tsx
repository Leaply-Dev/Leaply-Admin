"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, RotateCcw, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { UserAdminResponse } from "@/lib/types/admin";

interface UserColumnsProps {
	onRoleChange: (userId: string, newRole: string) => void;
	onDelete: (userId: string) => void;
	onRestore: (userId: string) => void;
	onHardDelete: (user: UserAdminResponse) => void;
	isSuperAdmin: boolean;
	currentUserId?: string;
	showDeleted: boolean;
}

const formatRole = (role: string): string => {
	switch (role) {
		case "user":
			return "User";
		case "data_admin":
			return "Data Admin";
		case "super_admin":
			return "Super Admin";
		default:
			return role;
	}
};

const getRoleBadgeVariant = (
	role: string,
): "destructive" | "default" | "secondary" => {
	switch (role) {
		case "super_admin":
			return "destructive";
		case "data_admin":
			return "default";
		default:
			return "secondary";
	}
};

const formatDate = (dateString: string | null): string => {
	if (!dateString) return "-";
	return new Date(dateString).toLocaleDateString();
};

const formatDateTime = (dateString: string | null): string => {
	if (!dateString) return "-";
	return new Date(dateString).toLocaleString();
};

export const createUserColumns = ({
	onRoleChange,
	onDelete,
	onRestore,
	onHardDelete,
	isSuperAdmin,
	currentUserId,
	showDeleted,
}: UserColumnsProps): ColumnDef<UserAdminResponse>[] => {
	const baseColumns: ColumnDef<UserAdminResponse>[] = [
		{
			accessorKey: "fullName",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						Name
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			cell: ({ row }) => {
				const isDeleted = showDeleted;
				return (
					<div className={`font-medium ${isDeleted ? "text-muted-foreground" : ""}`}>
						{row.getValue("fullName") || "-"}
					</div>
				);
			},
		},
		{
			accessorKey: "email",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						Email
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			cell: ({ row }) => {
				const isDeleted = showDeleted;
				return <div className={isDeleted ? "text-muted-foreground" : ""}>{row.getValue("email")}</div>;
			},
		},
		{
			accessorKey: "role",
			header: "Role",
			cell: ({ row }) => {
				const user = row.original;
				const role = row.getValue("role") as string;

				// Don't allow role changes for deleted users
				if (showDeleted) {
					return (
						<Badge variant={getRoleBadgeVariant(role)} className="opacity-60">
							{formatRole(role)}
						</Badge>
					);
				}

				if (isSuperAdmin && user.id !== currentUserId) {
					return (
						<Select
							value={role}
							onValueChange={(value) => onRoleChange(user.id, value)}
						>
							<SelectTrigger className="w-35">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="user">User</SelectItem>
								<SelectItem value="data_admin">Data Admin</SelectItem>
								<SelectItem value="super_admin">Super Admin</SelectItem>
							</SelectContent>
						</Select>
					);
				}

				return (
					<Badge variant={getRoleBadgeVariant(role)}>{formatRole(role)}</Badge>
				);
			},
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
		},
		{
			accessorKey: "onboardingCompleted",
			header: "Onboarding",
			cell: ({ row }) => {
				const completed = row.getValue("onboardingCompleted") as boolean;
				const isDeleted = showDeleted;
				return (
					<Badge
						variant={completed ? "default" : "secondary"}
						className={isDeleted ? "opacity-60" : ""}
					>
						{completed ? "Complete" : "Pending"}
					</Badge>
				);
			},
		},
		{
			accessorKey: "lastActiveAt",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						Last Active
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			cell: ({ row }) => {
				const isDeleted = showDeleted;
				return <div className={isDeleted ? "text-muted-foreground" : ""}>{formatDate(row.getValue("lastActiveAt"))}</div>;
			},
		},
	];

	// Add "Joined" or "Deleted At" column based on view
	if (showDeleted) {
		baseColumns.push({
			accessorKey: "deletedAt",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						Deleted At
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			cell: ({ row }) => {
				return (
					<div className="text-destructive">
						{formatDateTime(row.getValue("deletedAt"))}
					</div>
				);
			},
		});
	} else {
		baseColumns.push({
			accessorKey: "createdAt",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						Joined
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			cell: ({ row }) => {
				return <div>{formatDate(row.getValue("createdAt"))}</div>;
			},
		});
	}

	// Add actions column for super_admin
	if (isSuperAdmin) {
		baseColumns.push({
			id: "actions",
			enableHiding: false,
			cell: ({ row }) => {
				const user = row.original as UserAdminResponse;

				if (user.id === currentUserId) {
					return null;
				}

				if (showDeleted) {
					// Actions for deleted users: Restore and Hard Delete
					return (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon">
									<span className="sr-only">Open menu</span>
									<MoreHorizontal className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={() => onRestore(user.id)}>
									<RotateCcw className="h-4 w-4 mr-2" />
									Restore
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									className="text-destructive"
									onClick={() => onHardDelete(user)}
								>
									<Trash2 className="h-4 w-4 mr-2" />
									Permanently Delete
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					);
				}

				// Actions for active users: Soft Delete
				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon">
								<span className="sr-only">Open menu</span>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								className="text-destructive"
								onClick={() => onDelete(user.id)}
							>
								<Trash2 className="h-4 w-4 mr-2" />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		} as ColumnDef<UserAdminResponse>);
	}

	return baseColumns;
};
