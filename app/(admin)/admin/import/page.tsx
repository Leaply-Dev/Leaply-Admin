"use client";

import {
	AlertCircle,
	CheckCircle,
	Download,
	FileSpreadsheet,
	Loader2,
	Upload,
	X,
} from "lucide-react";
import { useCallback, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminApi } from "@/lib/api/adminApi";
import type { ImportResultResponse } from "@/lib/types/admin";

type EntityType = "universities" | "programs" | "intakes";

interface UploadState {
	file: File | null;
	isDragging: boolean;
	isUploading: boolean;
	result: ImportResultResponse | null;
	error: string | null;
}

const initialUploadState: UploadState = {
	file: null,
	isDragging: false,
	isUploading: false,
	result: null,
	error: null,
};

const entityConfig: Record<EntityType, { title: string; description: string }> =
	{
		universities: {
			title: "Universities",
			description:
				"Import university data including name, country, city, rankings, and more.",
		},
		programs: {
			title: "Programs",
			description:
				"Import program data. Requires university IDs to be referenced.",
		},
		intakes: {
			title: "Intakes",
			description: "Import intake data. Requires program IDs to be referenced.",
		},
	};

function FileUploadZone({
	entityType,
	state,
	onStateChange,
}: {
	entityType: EntityType;
	state: UploadState;
	onStateChange: (state: UploadState) => void;
}) {
	const handleDragOver = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			if (!state.isDragging) {
				onStateChange({ ...state, isDragging: true });
			}
		},
		[state, onStateChange],
	);

	const handleDragLeave = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			onStateChange({ ...state, isDragging: false });
		},
		[state, onStateChange],
	);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			const file = e.dataTransfer.files[0];
			if (file && (file.type === "text/csv" || file.name.endsWith(".csv"))) {
				onStateChange({
					...state,
					file,
					isDragging: false,
					result: null,
					error: null,
				});
			} else {
				onStateChange({
					...state,
					isDragging: false,
					error: "Please upload a CSV file",
				});
			}
		},
		[state, onStateChange],
	);

	const handleFileSelect = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file) {
				onStateChange({ ...state, file, result: null, error: null });
			}
		},
		[state, onStateChange],
	);

	const handleRemoveFile = useCallback(() => {
		onStateChange({ ...state, file: null, result: null, error: null });
	}, [state, onStateChange]);

	const handleUpload = useCallback(async () => {
		if (!state.file) return;

		onStateChange({ ...state, isUploading: true, error: null });

		try {
			let result: ImportResultResponse;
			switch (entityType) {
				case "universities":
					result = await adminApi.importUniversities(state.file);
					break;
				case "programs":
					result = await adminApi.importPrograms(state.file);
					break;
				case "intakes":
					result = await adminApi.importIntakes(state.file);
					break;
			}
			onStateChange({ ...state, isUploading: false, result, file: null });
		} catch (err) {
			onStateChange({
				...state,
				isUploading: false,
				error: err instanceof Error ? err.message : "Import failed",
			});
		}
	}, [state, entityType, onStateChange]);

	const handleDownloadTemplate = useCallback(async () => {
		try {
			const blob = await adminApi.downloadTemplate(entityType);
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `${entityType}_template.csv`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		} catch (err) {
			onStateChange({
				...state,
				error:
					err instanceof Error ? err.message : "Failed to download template",
			});
		}
	}, [entityType, state, onStateChange]);

	return (
		<div className="space-y-6">
			{/* Template Download */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-base">Download Template</CardTitle>
					<CardDescription>
						Download a CSV template with the required columns for {entityType}.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button variant="outline" onClick={handleDownloadTemplate}>
						<Download className="h-4 w-4 mr-2" />
						Download {entityConfig[entityType].title} Template
					</Button>
				</CardContent>
			</Card>

			{/* File Upload Zone */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-base">Upload CSV File</CardTitle>
					<CardDescription>
						{entityConfig[entityType].description}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{!state.file ? (
						<div
							className={`
								border-2 border-dashed rounded-lg p-8 text-center transition-colors
								${state.isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
							`}
							onDragOver={handleDragOver}
							onDragLeave={handleDragLeave}
							onDrop={handleDrop}
						>
							<FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
							<p className="text-sm text-muted-foreground mb-2">
								Drag and drop your CSV file here, or
							</p>
							<label>
								<input
									type="file"
									accept=".csv,text/csv"
									onChange={handleFileSelect}
									className="hidden"
								/>
								<Button variant="outline" asChild>
									<span className="cursor-pointer">Browse Files</span>
								</Button>
							</label>
						</div>
					) : (
						<div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
							<div className="flex items-center gap-3">
								<FileSpreadsheet className="h-8 w-8 text-primary" />
								<div>
									<p className="font-medium">{state.file.name}</p>
									<p className="text-sm text-muted-foreground">
										{(state.file.size / 1024).toFixed(1)} KB
									</p>
								</div>
							</div>
							<Button
								variant="ghost"
								size="icon"
								onClick={handleRemoveFile}
								disabled={state.isUploading}
							>
								<X className="h-4 w-4" />
							</Button>
						</div>
					)}

					{state.error && (
						<div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md flex items-center gap-2">
							<AlertCircle className="h-4 w-4 flex-shrink-0" />
							{state.error}
						</div>
					)}

					{state.file && (
						<Button
							onClick={handleUpload}
							disabled={state.isUploading}
							className="w-full"
						>
							{state.isUploading ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Importing...
								</>
							) : (
								<>
									<Upload className="h-4 w-4 mr-2" />
									Import {entityConfig[entityType].title}
								</>
							)}
						</Button>
					)}
				</CardContent>
			</Card>

			{/* Import Results */}
			{state.result && (
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-base flex items-center gap-2">
							<CheckCircle className="h-5 w-5 text-primary" />
							Import Complete
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-4 gap-4">
							<div className="p-4 bg-muted/50 rounded-lg text-center">
								<div className="text-2xl font-bold">{state.result.total}</div>
								<div className="text-sm text-muted-foreground">Total Rows</div>
							</div>
							<div className="p-4 bg-primary/10 rounded-lg text-center">
								<div className="text-2xl font-bold text-primary">
									{state.result.created}
								</div>
								<div className="text-sm text-muted-foreground">Created</div>
							</div>
							<div className="p-4 bg-blue-500/10 rounded-lg text-center">
								<div className="text-2xl font-bold text-blue-500">
									{state.result.updated}
								</div>
								<div className="text-sm text-muted-foreground">Updated</div>
							</div>
							<div className="p-4 bg-destructive/10 rounded-lg text-center">
								<div className="text-2xl font-bold text-destructive">
									{state.result.skipped}
								</div>
								<div className="text-sm text-muted-foreground">Skipped</div>
							</div>
						</div>

						{state.result.errors.length > 0 && (
							<div className="space-y-2">
								<p className="text-sm font-medium">Error Details:</p>
								<div className="max-h-48 overflow-y-auto space-y-1">
									{state.result.errors.map((error, index) => (
										<div
											key={index}
											className="p-2 text-sm bg-destructive/10 text-destructive rounded"
										>
											Row {error.row}: {error.message}
										</div>
									))}
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			)}
		</div>
	);
}

export default function ImportPage() {
	const [activeTab, setActiveTab] = useState<EntityType>("universities");
	const [uploadStates, setUploadStates] = useState<
		Record<EntityType, UploadState>
	>({
		universities: { ...initialUploadState },
		programs: { ...initialUploadState },
		intakes: { ...initialUploadState },
	});

	const handleStateChange = useCallback(
		(entityType: EntityType, state: UploadState) => {
			setUploadStates((prev) => ({ ...prev, [entityType]: state }));
		},
		[],
	);

	return (
		<div>
			<PageHeader
				title="CSV Import"
				description="Import universities, programs, and intakes from CSV files"
			/>

			<Tabs
				value={activeTab}
				onValueChange={(v) => setActiveTab(v as EntityType)}
			>
				<TabsList className="mb-6">
					<TabsTrigger value="universities">Universities</TabsTrigger>
					<TabsTrigger value="programs">Programs</TabsTrigger>
					<TabsTrigger value="intakes">Intakes</TabsTrigger>
				</TabsList>

				<TabsContent value="universities">
					<FileUploadZone
						entityType="universities"
						state={uploadStates.universities}
						onStateChange={(state) => handleStateChange("universities", state)}
					/>
				</TabsContent>

				<TabsContent value="programs">
					<FileUploadZone
						entityType="programs"
						state={uploadStates.programs}
						onStateChange={(state) => handleStateChange("programs", state)}
					/>
				</TabsContent>

				<TabsContent value="intakes">
					<FileUploadZone
						entityType="intakes"
						state={uploadStates.intakes}
						onStateChange={(state) => handleStateChange("intakes", state)}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}
