"use client";

import {
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type OnChangeFn,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import * as React from "react";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	// Optional server-side sorting support
	sorting?: SortingState;
	onSortingChange?: OnChangeFn<SortingState>;
	// When true, disables client-side pagination (use with server-side pagination)
	manualPagination?: boolean;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	sorting: externalSorting,
	onSortingChange: externalOnSortingChange,
	manualPagination = false,
}: DataTableProps<TData, TValue>) {
	const [internalSorting, setInternalSorting] = React.useState<SortingState>(
		[],
	);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});

	// Use external sorting state if provided (server-side), otherwise use internal state (client-side)
	const isServerSide =
		externalSorting !== undefined && externalOnSortingChange !== undefined;
	const sorting = isServerSide ? externalSorting : internalSorting;
	const onSortingChange = isServerSide
		? externalOnSortingChange
		: setInternalSorting;

	const table = useReactTable({
		data,
		columns,
		onSortingChange,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		// Only use client-side pagination when not using server-side pagination
		...(manualPagination
			? { manualPagination: true }
			: { getPaginationRowModel: getPaginationRowModel() }),
		// Only use client-side sorting model when not using server-side sorting
		...(isServerSide
			? { manualSorting: true }
			: { getSortedRowModel: getSortedRowModel() }),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
		},
	});

	return (
		<div className="w-full">
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
