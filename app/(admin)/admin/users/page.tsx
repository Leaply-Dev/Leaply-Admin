"use client";

import { Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { adminApi } from "@/lib/api/adminApi";
import { useAuthStore } from "@/lib/store/authStore";
import type { UserAdminResponse } from "@/lib/types/admin";
import { createUserColumns } from "./columns";

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

	const fetchUsers = useCallback(async () => {
		setIsLoading(true);
		try {
			const data = await adminApi.getUsers({
				page,
				size: 20,
				search: search || undefined,
				role: roleFilter === "all" ? undefined : roleFilter || undefined,
			});
			setUsers(data.content);
			setTotalPages(data.totalPages);
		} catch (error) {
			console.error("Failed to fetch users:", error);
		} finally {
			setIsLoading(false);
		}
	}, [page, search, roleFilter]);

	useEffect(() => {
		fetchUsers();
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

	const handleRoleChange = useCallback(
		async (userId: string, newRole: string) => {
			try {
				await adminApi.updateUserRole(userId, {
					role: newRole as "user" | "data_admin" | "super_admin",
				});
				fetchUsers();
			} catch (error) {
				console.error("Failed to update user role:", error);
			}
		},
		[fetchUsers],
	);

	const columns = useMemo(
		() =>
			createUserColumns({
				onRoleChange: handleRoleChange,
				onDelete: setDeleteId,
				isSuperAdmin: isSuperAdmin(),
				currentUserId: profile?.id,
			}),
		[handleRoleChange, isSuperAdmin, profile?.id],
	);

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
				<Select value={roleFilter || "all"} onValueChange={setRoleFilter}>
					<SelectTrigger className="w-35">
						<SelectValue placeholder="All roles" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All roles</SelectItem>
						<SelectItem value="user">User</SelectItem>
						<SelectItem value="data_admin">Data Admin</SelectItem>
						<SelectItem value="super_admin">Super Admin</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{isLoading ? (
				<div className="bg-card rounded-lg border p-8 text-center text-muted-foreground">
					Loading...
				</div>
			) : (
				<DataTable columns={columns} data={users} />
			)}

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
