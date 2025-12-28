"use client";

import { MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
import type { UniversityAdminResponse } from "@/lib/types/admin";

export default function UniversitiesPage() {
	const [universities, setUniversities] = useState<UniversityAdminResponse[]>(
		[],
	);
	const [isLoading, setIsLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const fetchUniversities = useCallback(async () => {
		setIsLoading(true);
		try {
			const data = await adminApi.getUniversities({
				page,
				size: 20,
				search: search || undefined,
			});
			setUniversities(data.content);
			setTotalPages(data.totalPages);
		} catch (error) {
			console.error("Failed to fetch universities:", error);
		} finally {
			setIsLoading(false);
		}
	}, [page, search]);

	useEffect(() => {
		fetchUniversities();
	}, [fetchUniversities]);

	const handleDelete = async () => {
		if (!deleteId) return;
		setIsDeleting(true);
		try {
			await adminApi.deleteUniversity(deleteId);
			setDeleteId(null);
			fetchUniversities();
		} catch (error) {
			console.error("Failed to delete university:", error);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div>
			<PageHeader
				title="Universities"
				description="Manage university data"
				action={
					<Button asChild>
						<Link href="/admin/universities/new">
							<Plus className="h-4 w-4 mr-2" />
							Add University
						</Link>
					</Button>
				}
			/>

			<div className="flex items-center gap-4 mb-4">
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search universities..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="pl-9"
					/>
				</div>
			</div>

			<div className="bg-card rounded-lg border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Country</TableHead>
							<TableHead>City</TableHead>
							<TableHead>Type</TableHead>
							<TableHead className="text-center">Programs</TableHead>
							<TableHead className="text-center">QS Rank</TableHead>
							<TableHead className="w-[70px]" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							Array.from({ length: 5 }).map((_, i) => (
								<TableRow key={i}>
									<TableCell>
										<Skeleton className="h-4 w-48" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-24" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-24" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-16" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-8 mx-auto" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-8 mx-auto" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-8 w-8" />
									</TableCell>
								</TableRow>
							))
						) : universities.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={7}
									className="text-center text-muted-foreground py-8"
								>
									No universities found
								</TableCell>
							</TableRow>
						) : (
							universities.map((university) => (
								<TableRow key={university.id}>
									<TableCell className="font-medium">
										{university.name}
									</TableCell>
									<TableCell>{university.country}</TableCell>
									<TableCell>{university.city || "-"}</TableCell>
									<TableCell className="capitalize">
										{university.type || "-"}
									</TableCell>
									<TableCell className="text-center">
										{university.programCount}
									</TableCell>
									<TableCell className="text-center">
										{university.rankingQs || "-"}
									</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="icon">
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem asChild>
													<Link
														href={`/admin/universities/${university.id}`}
														className="flex items-center"
													>
														<Pencil className="h-4 w-4 mr-2" />
														Edit
													</Link>
												</DropdownMenuItem>
												<DropdownMenuItem
													className="text-destructive"
													onClick={() => setDeleteId(university.id)}
												>
													<Trash2 className="h-4 w-4 mr-2" />
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
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
				title="Delete University"
				description="Are you sure you want to delete this university? This action cannot be undone."
				isLoading={isDeleting}
			/>
		</div>
	);
}
