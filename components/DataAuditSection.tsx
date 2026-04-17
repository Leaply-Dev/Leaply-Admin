"use client";

import { AlertCircle, Database, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { adminApi } from "@/lib/api/adminApi";
import type { ColumnAuditResponse } from "@/lib/types/admin";

// Display names for tables
const TABLE_LABELS: Record<string, string> = {
	universities: "Universities",
	scholarships: "Scholarships",
	programs: "Programs",
	user_profiles: "User Profiles",
};

// Display names for columns (snake_case to Title Case)
function formatColumnName(column: string): string {
	return column
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

export function DataAuditSection() {
	const [auditableTables, setAuditableTables] = useState<
		Record<string, string[]>
	>({});
	const [selectedTable, setSelectedTable] = useState<string>("");
	const [selectedColumn, setSelectedColumn] = useState<string>("");
	const [auditData, setAuditData] = useState<ColumnAuditResponse | null>(null);
	const [isLoadingTables, setIsLoadingTables] = useState(true);
	const [isLoadingAudit, setIsLoadingAudit] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Load available tables on mount
	useEffect(() => {
		async function loadTables() {
			try {
				const tables = await adminApi.getAuditableTables();
				setAuditableTables(tables);
				// Auto-select first table
				const firstTable = Object.keys(tables)[0];
				if (firstTable) {
					setSelectedTable(firstTable);
				}
			} catch (err) {
				setError("Failed to load auditable tables");
				console.error(err);
			} finally {
				setIsLoadingTables(false);
			}
		}
		loadTables();
	}, []);

	// Reset column when table changes
	useEffect(() => {
		setSelectedColumn("");
		setAuditData(null);
	}, [selectedTable]);

	// Load audit data when column is selected
	const loadAuditData = useCallback(async () => {
		if (!selectedTable || !selectedColumn) return;

		setIsLoadingAudit(true);
		setError(null);

		try {
			const data = await adminApi.auditColumn(selectedTable, selectedColumn);
			setAuditData(data);
		} catch (err) {
			setError("Failed to load audit data");
			console.error(err);
		} finally {
			setIsLoadingAudit(false);
		}
	}, [selectedTable, selectedColumn]);

	useEffect(() => {
		if (selectedColumn) {
			loadAuditData();
		}
	}, [selectedColumn, loadAuditData]);

	const columns = selectedTable ? auditableTables[selectedTable] || [] : [];
	const totalWithValues = auditData
		? auditData.values.reduce((sum, v) => sum + v.count, 0)
		: 0;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Database className="h-5 w-5" />
					Data Audit
				</CardTitle>
				<CardDescription>
					Inspect unique values and counts for any column to identify data
					anomalies and enum mismatches.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Selectors */}
				<div className="flex gap-4">
					<div className="flex-1">
						<label className="text-sm font-medium mb-1.5 block">Table</label>
						<Select
							value={selectedTable}
							onValueChange={setSelectedTable}
							disabled={isLoadingTables}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select a table..." />
							</SelectTrigger>
							<SelectContent>
								{Object.keys(auditableTables).map((table) => (
									<SelectItem key={table} value={table}>
										{TABLE_LABELS[table] || table}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="flex-1">
						<label className="text-sm font-medium mb-1.5 block">Column</label>
						<Select
							value={selectedColumn}
							onValueChange={setSelectedColumn}
							disabled={!selectedTable || columns.length === 0}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select a column..." />
							</SelectTrigger>
							<SelectContent>
								{columns.map((column) => (
									<SelectItem key={column} value={column}>
										{formatColumnName(column)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				{/* Error State */}
				{error && (
					<div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md flex items-center gap-2">
						<AlertCircle className="h-4 w-4 flex-shrink-0" />
						{error}
					</div>
				)}

				{/* Loading State */}
				{isLoadingAudit && (
					<div className="flex items-center justify-center py-8">
						<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
					</div>
				)}

				{/* Results */}
				{auditData && !isLoadingAudit && (
					<div className="space-y-4">
						{/* Summary Stats */}
						<div className="grid grid-cols-3 gap-4">
							<div className="p-3 bg-muted/50 rounded-lg text-center">
								<div className="text-lg font-semibold">
									{auditData.totalRecords}
								</div>
								<div className="text-xs text-muted-foreground">
									Total Records
								</div>
							</div>
							<div className="p-3 bg-muted/50 rounded-lg text-center">
								<div className="text-lg font-semibold">
									{auditData.values.length}
								</div>
								<div className="text-xs text-muted-foreground">
									Unique Values
								</div>
							</div>
							<div className="p-3 bg-muted/50 rounded-lg text-center">
								<div className="text-lg font-semibold">
									{auditData.nullCount}
								</div>
								<div className="text-xs text-muted-foreground">
									{auditData.isArrayColumn ? "Empty/Null" : "Null"}
								</div>
							</div>
						</div>

						{/* Array Column Indicator */}
						{auditData.isArrayColumn && (
							<div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
								This is an array column. Values are counted individually
								(unnested).
							</div>
						)}

						{/* Values Table */}
						{auditData.values.length > 0 ? (
							<div className="border rounded-lg max-h-80 overflow-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Value</TableHead>
											<TableHead className="w-24 text-right">Count</TableHead>
											<TableHead className="w-24 text-right">%</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{auditData.values.map((item, index) => {
											const percentage =
												totalWithValues > 0
													? ((item.count / totalWithValues) * 100).toFixed(1)
													: "0";
											return (
												<TableRow key={index}>
													<TableCell className="font-mono text-sm">
														{item.value || "(empty)"}
													</TableCell>
													<TableCell className="text-right">
														{item.count}
													</TableCell>
													<TableCell className="text-right text-muted-foreground">
														{percentage}%
													</TableCell>
												</TableRow>
											);
										})}
									</TableBody>
								</Table>
							</div>
						) : (
							<div className="text-center py-8 text-muted-foreground">
								No values found for this column.
							</div>
						)}
					</div>
				)}

				{/* Empty State */}
				{!selectedColumn && !isLoadingTables && (
					<div className="text-center py-8 text-muted-foreground">
						Select a table and column to audit.
					</div>
				)}
			</CardContent>
		</Card>
	);
}
