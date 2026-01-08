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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminApi } from "@/lib/api/adminApi";
import { useAuthStore } from "@/lib/store/authStore";
import type { UserAdminResponse } from "@/lib/types/admin";
import { createUserColumns } from "./columns";
import type { SortingState } from "@tanstack/react-table";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";

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

	// New state for tabs and sorting
	const [activeTab, setActiveTab] = useState<"active" | "deleted">("active");
	const [sorting, setSorting] = useState<SortingState>([]);

	// New state for restore and hard delete
	const [restoreId, setRestoreId] = useState<string | null>(null);
	const [isRestoring, setIsRestoring] = useState(false);
	const [hardDeleteUser, setHardDeleteUser] = useState<UserAdminResponse | null>(null);
	const [hardDeleteConfirmEmail, setHardDeleteConfirmEmail] = useState("");
	const [isHardDeleting, setIsHardDeleting] = useState(false);

	// Build sort param from sorting state
	const sortParam = useMemo(() => {
		if (sorting.length === 0) return undefined;
		const { id, desc } = sorting[0];
		return `${id},${desc ? "desc" : "asc"}`;
	}, [sorting]);

	const fetchUsers = useCallback(async () => {
		setIsLoading(true);
		try {
			const data = await adminApi.getUsers({
				page,
				size: 20,
				search: search || undefined,
				role: roleFilter === "all" ? undefined : roleFilter || undefined,
				sort: sortParam,
				showDeleted: activeTab === "deleted",
			});
			setUsers(data.content);
			setTotalPages(data.totalPages);
		} catch (error) {
			console.error("Failed to fetch users:", error);
		} finally {
			setIsLoading(false);
		}
	}, [page, search, roleFilter, sortParam, activeTab]);

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	// Reset page when tab changes
	useEffect(() => {
		setPage(0);
	}, [activeTab]);

	// Reset page when sorting changes
	useEffect(() => {
		setPage(0);
	}, [sorting]);

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

	const handleRestore = async () => {
		if (!restoreId) return;
		setIsRestoring(true);
		try {
			await adminApi.restoreUser(restoreId);
			setRestoreId(null);
			fetchUsers();
		} catch (error) {
			console.error("Failed to restore user:", error);
		} finally {
			setIsRestoring(false);
		}
	};

	const handleHardDelete = async () => {
		if (!hardDeleteUser) return;
		setIsHardDeleting(true);
		try {
			await adminApi.hardDeleteUser(hardDeleteUser.id);
			setHardDeleteUser(null);
			setHardDeleteConfirmEmail("");
			fetchUsers();
		} catch (error) {
			console.error("Failed to permanently delete user:", error);
		} finally {
			setIsHardDeleting(false);
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
				onRestore: setRestoreId,
				onHardDelete: (user) => setHardDeleteUser(user),
				isSuperAdmin: isSuperAdmin(),
				currentUserId: profile?.id,
				showDeleted: activeTab === "deleted",
			}),
		[handleRoleChange, isSuperAdmin, profile?.id, activeTab],
	);

	return (
		<div>
			<PageHeader title="Users" description="Manage user accounts and roles" />

			{/* Tabs for Active/Deleted users */}
			<Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "active" | "deleted")} className="mb-4">
				<TabsList>
					<TabsTrigger value="active">Active Users</TabsTrigger>
					<TabsTrigger value="deleted">Deleted Users</TabsTrigger>
				</TabsList>
			</Tabs>

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
				<DataTable
					columns={columns}
					data={users}
					sorting={sorting}
					onSortingChange={setSorting}
				/>
			)}

			<Pagination
				currentPage={page}
				totalPages={totalPages}
				onPageChange={setPage}
			/>

			{/* Soft Delete Confirmation Dialog */}
			<DeleteConfirmDialog
				open={!!deleteId}
				onOpenChange={(open) => !open && setDeleteId(null)}
				onConfirm={handleDelete}
				title="Delete User"
				description="Are you sure you want to delete this user? The user will be moved to the 'Deleted Users' tab and can be restored later."
				isLoading={isDeleting}
			/>

			{/* Restore Confirmation Dialog */}
			<AlertDialog open={!!restoreId} onOpenChange={(open) => !open && setRestoreId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Restore User</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to restore this user? They will be moved back to the active users list.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isRestoring}>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleRestore} disabled={isRestoring}>
							{isRestoring ? "Restoring..." : "Restore"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Hard Delete Confirmation Dialog */}
			<AlertDialog open={!!hardDeleteUser} onOpenChange={(open) => {
				if (!open) {
					setHardDeleteUser(null);
					setHardDeleteConfirmEmail("");
				}
			}}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="text-destructive">Permanently Delete User</AlertDialogTitle>
						<AlertDialogDescription className="space-y-2">
							<p className="font-semibold text-destructive">
								This action is permanent and cannot be undone!
							</p>
							<p>
								This will permanently delete the user <strong>{hardDeleteUser?.email}</strong> and all their associated data.
							</p>
							<p>
								To confirm, type the user's email address below:
							</p>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<div className="py-4">
						<Label htmlFor="confirm-email">Email</Label>
						<Input
							id="confirm-email"
							placeholder={hardDeleteUser?.email || ""}
							value={hardDeleteConfirmEmail}
							onChange={(e) => setHardDeleteConfirmEmail(e.target.value)}
							className="mt-2"
						/>
					</div>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isHardDeleting}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleHardDelete}
							disabled={isHardDeleting || hardDeleteConfirmEmail !== hardDeleteUser?.email}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{isHardDeleting ? "Deleting..." : "Permanently Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
