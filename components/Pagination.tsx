"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

export function Pagination({
	currentPage,
	totalPages,
	onPageChange,
}: PaginationProps) {
	if (totalPages <= 1) return null;

	const pages: (number | "...")[] = [];

	// Always show first page
	pages.push(0);

	// Show ellipsis if needed
	if (currentPage > 2) {
		pages.push("...");
	}

	// Show pages around current
	for (
		let i = Math.max(1, currentPage - 1);
		i <= Math.min(totalPages - 2, currentPage + 1);
		i++
	) {
		if (!pages.includes(i)) {
			pages.push(i);
		}
	}

	// Show ellipsis if needed
	if (currentPage < totalPages - 3) {
		pages.push("...");
	}

	// Always show last page
	if (totalPages > 1 && !pages.includes(totalPages - 1)) {
		pages.push(totalPages - 1);
	}

	return (
		<div className="flex items-center justify-center gap-1 mt-4">
			<Button
				variant="outline"
				size="icon"
				onClick={() => onPageChange(currentPage - 1)}
				disabled={currentPage === 0}
			>
				<ChevronLeft className="h-4 w-4" />
			</Button>

			{pages.map((page, index) =>
				page === "..." ? (
					<span
						key={`ellipsis-${index}`}
						className="px-2 text-muted-foreground"
					>
						...
					</span>
				) : (
					<Button
						key={page}
						variant={page === currentPage ? "default" : "outline"}
						size="icon"
						onClick={() => onPageChange(page)}
					>
						{page + 1}
					</Button>
				),
			)}

			<Button
				variant="outline"
				size="icon"
				onClick={() => onPageChange(currentPage + 1)}
				disabled={currentPage === totalPages - 1}
			>
				<ChevronRight className="h-4 w-4" />
			</Button>
		</div>
	);
}
