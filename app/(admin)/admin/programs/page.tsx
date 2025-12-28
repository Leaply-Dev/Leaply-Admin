"use client";

import {
	Calendar,
	MoreHorizontal,
	Pencil,
	Plus,
	Search,
	Trash2,
} from "lucide-react";
import Link from "next/link";
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
import type { ProgramAdminResponse } from "@/lib/types/admin";

export default function ProgramsPage() {
	const [programs, setPrograms] = useState<ProgramAdminResponse[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const fetchPrograms = async () => {
		setIsLoading(true);
		try {
			const data = await adminApi.getPrograms({
				page,
				size: 20,
				search: search || undefined,
			});
			setPrograms(data.content);
			setTotalPages(data.totalPages);
		} catch (error) {
			console.error("Failed to fetch programs:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchPrograms();
	}, [fetchPrograms]);

	useEffect(() => {
		const timer = setTimeout(() => {
			setPage(0);
			fetchPrograms();
		}, 300);
		return () => clearTimeout(timer);
	}, [fetchPrograms]);

	const handleDelete = async () => {
		if (!deleteId) return;
		setIsDeleting(true);
		try {
			await adminApi.deleteProgram(deleteId);
			setDeleteId(null);
			fetchPrograms();
		} catch (error) {
			console.error("Failed to delete program:", error);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div>
			<PageHeader
				title="Programs"
				description="Manage program data"
				action={
					<Button asChild>
						<Link href="/admin/programs/new">
							<Plus className="h-4 w-4 mr-2" />
							Add Program
						</Link>
					</Button>
				}
			/>

			<div className="flex items-center gap-4 mb-4">
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search programs..."
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
							<TableHead>Program</TableHead>
							<TableHead>University</TableHead>
							<TableHead>Degree</TableHead>
							<TableHead>Language</TableHead>
							<TableHead className="text-center">Intakes</TableHead>
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
										<Skeleton className="h-4 w-32" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-20" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-16" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-8 mx-auto" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-8 w-8" />
									</TableCell>
								</TableRow>
							))
						) : programs.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={6}
									className="text-center text-muted-foreground py-8"
								>
									No programs found
								</TableCell>
							</TableRow>
						) : (
							programs.map((program) => (
								<TableRow key={program.id}>
									<TableCell className="font-medium">{program.name}</TableCell>
									<TableCell>{program.universityName}</TableCell>
									<TableCell>
										<Badge variant="secondary" className="capitalize">
											{program.degreeType}
										</Badge>
									</TableCell>
									<TableCell className="capitalize">
										{program.language}
									</TableCell>
									<TableCell className="text-center">
										{program.intakeCount}
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
														href={`/admin/programs/${program.id}`}
														className="flex items-center"
													>
														<Pencil className="h-4 w-4 mr-2" />
														Edit
													</Link>
												</DropdownMenuItem>
												<DropdownMenuItem asChild>
													<Link
														href={`/admin/programs/${program.id}/intakes`}
														className="flex items-center"
													>
														<Calendar className="h-4 w-4 mr-2" />
														Manage Intakes
													</Link>
												</DropdownMenuItem>
												<DropdownMenuItem
													className="text-destructive"
													onClick={() => setDeleteId(program.id)}
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
				title="Delete Program"
				description="Are you sure you want to delete this program? This will also delete all associated intakes."
				isLoading={isDeleting}
			/>
		</div>
	);
}
