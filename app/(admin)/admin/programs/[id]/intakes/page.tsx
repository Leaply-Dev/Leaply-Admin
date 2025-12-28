"use client";

import {
	ArrowLeft,
	Loader2,
	MoreHorizontal,
	Pencil,
	Plus,
	Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type {
	IntakeAdminResponse,
	ProgramAdminResponse,
} from "@/lib/types/admin";

export default function IntakesPage() {
	const params = useParams();
	const programId = params.id as string;

	const [program, setProgram] = useState<ProgramAdminResponse | null>(null);
	const [intakes, setIntakes] = useState<IntakeAdminResponse[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	// Dialog state
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingIntake, setEditingIntake] =
		useState<IntakeAdminResponse | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	// Form state
	const [intakeSeason, setIntakeSeason] = useState("");
	const [intakeNotes, setIntakeNotes] = useState("");
	const [applicationStartDate, setApplicationStartDate] = useState("");
	const [applicationDeadline, setApplicationDeadline] = useState("");
	const [earlyDeadline, setEarlyDeadline] = useState("");
	const [startDate, setStartDate] = useState("");
	const [isActive, setIsActive] = useState("true");

	const fetchData = async () => {
		setIsLoading(true);
		try {
			const [programData, intakesData] = await Promise.all([
				adminApi.getProgram(programId),
				adminApi.getIntakes(programId, { size: 100 }),
			]);
			setProgram(programData);
			setIntakes(intakesData.content);
		} catch (error) {
			console.error("Failed to fetch data:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const resetForm = () => {
		setIntakeSeason("");
		setIntakeNotes("");
		setApplicationStartDate("");
		setApplicationDeadline("");
		setEarlyDeadline("");
		setStartDate("");
		setIsActive("true");
		setFormError(null);
	};

	const openCreateDialog = () => {
		resetForm();
		setEditingIntake(null);
		setDialogOpen(true);
	};

	const openEditDialog = (intake: IntakeAdminResponse) => {
		setEditingIntake(intake);
		setIntakeSeason(intake.intakeSeason);
		setIntakeNotes(intake.intakeNotes || "");
		setApplicationStartDate(intake.applicationStartDate || "");
		setApplicationDeadline(intake.applicationDeadline || "");
		setEarlyDeadline(intake.earlyDeadline || "");
		setStartDate(intake.startDate || "");
		setIsActive(intake.isActive ? "true" : "false");
		setFormError(null);
		setDialogOpen(true);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSaving(true);
		setFormError(null);

		try {
			const data = {
				intakeSeason,
				intakeNotes: intakeNotes || undefined,
				applicationStartDate: applicationStartDate || undefined,
				applicationDeadline: applicationDeadline || undefined,
				earlyDeadline: earlyDeadline || undefined,
				startDate: startDate || undefined,
				isActive: isActive === "true",
			};

			if (editingIntake) {
				await adminApi.updateIntake(editingIntake.id, data);
			} else {
				await adminApi.createIntake(programId, data);
			}

			setDialogOpen(false);
			fetchData();
		} catch (err) {
			setFormError(
				err instanceof Error ? err.message : "Failed to save intake",
			);
		} finally {
			setIsSaving(false);
		}
	};

	const handleDelete = async () => {
		if (!deleteId) return;
		setIsDeleting(true);
		try {
			await adminApi.deleteIntake(deleteId);
			setDeleteId(null);
			fetchData();
		} catch (error) {
			console.error("Failed to delete intake:", error);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div>
			<PageHeader
				title="Intakes"
				description={
					program ? `${program.name} - ${program.universityName}` : ""
				}
				action={
					<div className="flex gap-2">
						<Button onClick={openCreateDialog}>
							<Plus className="h-4 w-4 mr-2" />
							Add Intake
						</Button>
						<Button variant="outline" asChild>
							<Link href="/admin/programs">
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back
							</Link>
						</Button>
					</div>
				}
			/>

			<div className="bg-card rounded-lg border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Season</TableHead>
							<TableHead>Application Deadline</TableHead>
							<TableHead>Start Date</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="w-[70px]" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							Array.from({ length: 3 }).map((_, i) => (
								<TableRow key={i}>
									<TableCell>
										<Skeleton className="h-4 w-24" />
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
										<Skeleton className="h-8 w-8" />
									</TableCell>
								</TableRow>
							))
						) : intakes.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={5}
									className="text-center text-muted-foreground py-8"
								>
									No intakes found
								</TableCell>
							</TableRow>
						) : (
							intakes.map((intake) => (
								<TableRow key={intake.id}>
									<TableCell className="font-medium">
										{intake.intakeSeason}
									</TableCell>
									<TableCell>{intake.applicationDeadline || "-"}</TableCell>
									<TableCell>{intake.startDate || "-"}</TableCell>
									<TableCell>
										<Badge variant={intake.isActive ? "default" : "secondary"}>
											{intake.isActive ? "Active" : "Inactive"}
										</Badge>
									</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="icon">
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem
													onClick={() => openEditDialog(intake)}
												>
													<Pencil className="h-4 w-4 mr-2" />
													Edit
												</DropdownMenuItem>
												<DropdownMenuItem
													className="text-destructive"
													onClick={() => setDeleteId(intake.id)}
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

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{editingIntake ? "Edit Intake" : "Add Intake"}
						</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleSubmit} className="space-y-4">
						{formError && (
							<div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
								{formError}
							</div>
						)}

						<div className="space-y-2">
							<Label htmlFor="intakeSeason">Intake Season *</Label>
							<Input
								id="intakeSeason"
								value={intakeSeason}
								onChange={(e) => setIntakeSeason(e.target.value)}
								placeholder="e.g., Fall 2025"
								required
								disabled={isSaving}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="applicationStartDate">
								Application Start Date
							</Label>
							<Input
								id="applicationStartDate"
								type="date"
								value={applicationStartDate}
								onChange={(e) => setApplicationStartDate(e.target.value)}
								disabled={isSaving}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="applicationDeadline">Application Deadline</Label>
							<Input
								id="applicationDeadline"
								type="date"
								value={applicationDeadline}
								onChange={(e) => setApplicationDeadline(e.target.value)}
								disabled={isSaving}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="earlyDeadline">Early Deadline</Label>
							<Input
								id="earlyDeadline"
								type="date"
								value={earlyDeadline}
								onChange={(e) => setEarlyDeadline(e.target.value)}
								disabled={isSaving}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="startDate">Start Date</Label>
							<Input
								id="startDate"
								type="date"
								value={startDate}
								onChange={(e) => setStartDate(e.target.value)}
								disabled={isSaving}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="isActive">Status</Label>
							<Select
								value={isActive}
								onValueChange={setIsActive}
								disabled={isSaving}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="true">Active</SelectItem>
									<SelectItem value="false">Inactive</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="intakeNotes">Notes</Label>
							<textarea
								id="intakeNotes"
								value={intakeNotes}
								onChange={(e) => setIntakeNotes(e.target.value)}
								disabled={isSaving}
								className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-sm"
							/>
						</div>

						<div className="flex justify-end gap-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => setDialogOpen(false)}
								disabled={isSaving}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSaving}>
								{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								{editingIntake ? "Update" : "Create"}
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>

			<DeleteConfirmDialog
				open={!!deleteId}
				onOpenChange={(open) => !open && setDeleteId(null)}
				onConfirm={handleDelete}
				title="Delete Intake"
				description="Are you sure you want to delete this intake?"
				isLoading={isDeleting}
			/>
		</div>
	);
}
