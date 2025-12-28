"use client";

import { MoreHorizontal, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { adminApi } from "@/lib/api/adminApi";
import { useAuthStore } from "@/lib/store/authStore";
import type { UserAdminResponse } from "@/lib/types/admin";

export default function UsersPage() {
	const { profile, isSuperAdmin } = useAuthStore();
	const [users, setUsers] = useState<UserAdminResponse[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [roleFilter, setRoleFilter] = useState("");
	const [page, setPage] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const fetchUsers = async () => {
		setIsLoading(true);
		try {
			const data = await adminApi.getUsers({
				page,
				size: 20,
				search: search || undefined,
				role: roleFilter || undefined,
			});
			setUsers(data.content);
			setTotalPages(data.totalPages);
		} catch (error) {
			console.error("Failed to fetch users:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	useEffect(() => {
		const timer = setTimeout(() => {
			setPage(0);
			fetchUsers();
		}, 300);
		return () => clearTimeout(timer);
	}, [fetchUsers]);

	const handleDelete = async () => {
		if (!deleteId) return;
		setIsDeleting(true);
		try {
			await adminApi.deleteUser(deleteId);
			setDeleteId(null);
			fetchUsers();
		} catch (error) {
			console.error("Failed to delete user:", error);
		} finally {
			setIsDeleting(false);
		}
	};

	const handleRoleChange = async (userId: string, newRole: string) => {
		try {
			await adminApi.updateUserRole(userId, {
				role: newRole as "user" | "data_admin" | "super_admin",
			});
			fetchUsers();
		} catch (error) {
			console.error("Failed to update user role:", error);
		}
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

	const formatDate = (dateString: string | null) => {
		if (!dateString) return "-";
		return new Date(dateString).toLocaleDateString();
	};

	return (
		<div>
			<PageHeader title="Users" description="Manage user accounts and roles" />

			<div className="flex items-center gap-4 mb-4">
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search users..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="pl-9"
					/>
				</div>
				<Select value={roleFilter} onValueChange={setRoleFilter}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="All roles" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="">All roles</SelectItem>
						<SelectItem value="user">User</SelectItem>
						<SelectItem value="data_admin">Data Admin</SelectItem>
						<SelectItem value="super_admin">Super Admin</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="bg-card rounded-lg border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Role</TableHead>
							<TableHead>Onboarding</TableHead>
							<TableHead>Last Active</TableHead>
							<TableHead>Joined</TableHead>
							{isSuperAdmin() && <TableHead className="w-[70px]" />}
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							Array.from({ length: 5 }).map((_, i) => (
								<TableRow key={i}>
									<TableCell>
										<Skeleton className="h-4 w-32" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-40" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-20" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-16" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-24" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-24" />
									</TableCell>
									{isSuperAdmin() && (
										<TableCell>
											<Skeleton className="h-8 w-8" />
										</TableCell>
									)}
								</TableRow>
							))
						) : users.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={isSuperAdmin() ? 7 : 6}
									className="text-center text-muted-foreground py-8"
								>
									No users found
								</TableCell>
							</TableRow>
						) : (
							users.map((user) => (
								<TableRow key={user.id}>
									<TableCell className="font-medium">
										{user.fullName || "-"}
									</TableCell>
									<TableCell>{user.email}</TableCell>
									<TableCell>
										{isSuperAdmin() && user.id !== profile?.id ? (
											<Select
												value={user.role}
												onValueChange={(value) =>
													handleRoleChange(user.id, value)
												}
											>
												<SelectTrigger className="w-[130px]">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="user">User</SelectItem>
													<SelectItem value="data_admin">Data Admin</SelectItem>
													<SelectItem value="super_admin">
														Super Admin
													</SelectItem>
												</SelectContent>
											</Select>
										) : (
											<Badge variant={getRoleBadgeVariant(user.role)}>
												{user.role.replace("_", " ")}
											</Badge>
										)}
									</TableCell>
									<TableCell>
										<Badge
											variant={
												user.onboardingCompleted ? "default" : "secondary"
											}
										>
											{user.onboardingCompleted ? "Complete" : "Pending"}
										</Badge>
									</TableCell>
									<TableCell>{formatDate(user.lastActiveAt)}</TableCell>
									<TableCell>{formatDate(user.createdAt)}</TableCell>
									{isSuperAdmin() && (
										<TableCell>
											{user.id !== profile?.id && (
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="icon">
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem
															className="text-destructive"
															onClick={() => setDeleteId(user.id)}
														>
															<Trash2 className="h-4 w-4 mr-2" />
															Delete
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											)}
										</TableCell>
									)}
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			<Pagination
				currentPage={page}
				totalPages={totalPages}
				onPageChange={setPage}
			/>

			<DeleteConfirmDialog
				open={!!deleteId}
				onOpenChange={(open) => !open && setDeleteId(null)}
				onConfirm={handleDelete}
				title="Delete User"
				description="Are you sure you want to delete this user? This will permanently remove their account and all associated data."
				isLoading={isDeleting}
			/>
		</div>
	);
}
