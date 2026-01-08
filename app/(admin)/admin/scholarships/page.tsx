"use client";

import {
    MoreHorizontal,
    Pencil,
    Plus,
    Power,
    Search,
    Trash2,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
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
import type {
    ScholarshipAdminResponse,
    ScholarshipCoverageType,
    ScholarshipEligibilityType,
    ScholarshipSourceType,
} from "@/lib/types/admin";

const SOURCE_TYPE_LABELS: Record<ScholarshipSourceType, string> = {
    university: "University",
    government: "Government",
    foundation: "Foundation/NGO",
    corporate: "Corporate",
    bilateral: "Bilateral",
};

const COVERAGE_TYPE_LABELS: Record<ScholarshipCoverageType, string> = {
    full_funded: "Full Funded",
    full_tuition: "Full Tuition",
    partial_tuition: "Partial Tuition",
    stipend_only: "Stipend Only",
    other: "Other",
};

const ELIGIBILITY_TYPE_LABELS: Record<ScholarshipEligibilityType, string> = {
    merit: "Merit-based",
    need_based: "Need-based",
};

type ScholarshipStatus = "active" | "expiring_soon" | "expired" | "inactive";

function getScholarshipStatus(scholarship: ScholarshipAdminResponse): ScholarshipStatus {
    if (!scholarship.isActive) return "inactive";

    if (scholarship.applicationDeadline) {
        const deadline = new Date(scholarship.applicationDeadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (deadline < today) return "expired";

        const thirtyDaysFromNow = new Date(today);
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        if (deadline <= thirtyDaysFromNow) return "expiring_soon";
    }

    return "active";
}

function getStatusBadge(status: ScholarshipStatus) {
    switch (status) {
        case "active":
            return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
        case "expiring_soon":
            return <Badge className="bg-yellow-500 hover:bg-yellow-600">Expiring Soon</Badge>;
        case "expired":
            return <Badge className="bg-red-500 hover:bg-red-600">Expired</Badge>;
        case "inactive":
            return <Badge variant="secondary">Inactive</Badge>;
    }
}

function formatDeadline(dateString: string | null) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export default function ScholarshipsPage() {
    const [scholarships, setScholarships] = useState<ScholarshipAdminResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Filters
    const [sourceType, setSourceType] = useState<string>("");
    const [coverageType, setCoverageType] = useState<string>("");
    const [eligibilityType, setEligibilityType] = useState<string>("");
    const [isActive, setIsActive] = useState<string>("");

    const fetchScholarships = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await adminApi.getScholarships({
                page,
                size: 20,
                search: search || undefined,
                sourceType: (sourceType as ScholarshipSourceType) || undefined,
                coverageType: (coverageType as ScholarshipCoverageType) || undefined,
                eligibilityType: (eligibilityType as ScholarshipEligibilityType) || undefined,
                isActive: isActive === "" ? undefined : isActive === "true",
            });
            setScholarships(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Failed to fetch scholarships:", error);
        } finally {
            setIsLoading(false);
        }
    }, [page, search, sourceType, coverageType, eligibilityType, isActive]);

    useEffect(() => {
        fetchScholarships();
    }, [fetchScholarships]);

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            await adminApi.deleteScholarship(deleteId);
            setDeleteId(null);
            fetchScholarships();
        } catch (error) {
            console.error("Failed to delete scholarship:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleToggleActive = async (id: string) => {
        try {
            await adminApi.toggleScholarshipActive(id);
            fetchScholarships();
        } catch (error) {
            console.error("Failed to toggle scholarship status:", error);
        }
    };

    return (
        <div>
            <PageHeader
                title="Scholarships"
                description="Manage scholarship data"
                action={
                    <Button asChild>
                        <Link href="/admin/scholarships/new">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Scholarship
                        </Link>
                    </Button>
                }
            />

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search scholarships..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={sourceType} onValueChange={setSourceType}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Source Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Sources</SelectItem>
                        <SelectItem value="university">University</SelectItem>
                        <SelectItem value="government">Government</SelectItem>
                        <SelectItem value="foundation">Foundation</SelectItem>
                        <SelectItem value="corporate">Corporate</SelectItem>
                        <SelectItem value="bilateral">Bilateral</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={coverageType} onValueChange={setCoverageType}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Coverage Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Coverage</SelectItem>
                        <SelectItem value="full_funded">Full Funded</SelectItem>
                        <SelectItem value="full_tuition">Full Tuition</SelectItem>
                        <SelectItem value="partial_tuition">Partial Tuition</SelectItem>
                        <SelectItem value="stipend_only">Stipend Only</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={eligibilityType} onValueChange={setEligibilityType}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Eligibility" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="merit">Merit-based</SelectItem>
                        <SelectItem value="need_based">Need-based</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={isActive} onValueChange={setIsActive}>
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="bg-card rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>University</TableHead>
                            <TableHead>Country</TableHead>
                            <TableHead>Coverage</TableHead>
                            <TableHead>Deadline</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[70px]" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                                </TableRow>
                            ))
                        ) : scholarships.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="text-center text-muted-foreground py-8"
                                >
                                    No scholarships found
                                </TableCell>
                            </TableRow>
                        ) : (
                            scholarships.map((scholarship) => {
                                const status = getScholarshipStatus(scholarship);
                                return (
                                    <TableRow key={scholarship.id}>
                                        <TableCell className="font-medium">
                                            <Link
                                                href={`/admin/scholarships/${scholarship.id}`}
                                                className="hover:underline"
                                            >
                                                {scholarship.name}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            {scholarship.universityName || "-"}
                                        </TableCell>
                                        <TableCell>{scholarship.country}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {COVERAGE_TYPE_LABELS[scholarship.coverageType]}
                                                {scholarship.coverageType === "partial_tuition" &&
                                                    scholarship.coveragePercentage &&
                                                    ` (${scholarship.coveragePercentage}%)`}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {formatDeadline(scholarship.applicationDeadline)}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(status)}</TableCell>
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
                                                            href={`/admin/scholarships/${scholarship.id}`}
                                                            className="flex items-center"
                                                        >
                                                            <Pencil className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleToggleActive(scholarship.id)}
                                                    >
                                                        <Power className="h-4 w-4 mr-2" />
                                                        {scholarship.isActive ? "Deactivate" : "Activate"}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => setDeleteId(scholarship.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
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
                title="Delete Scholarship"
                description="Are you sure you want to delete this scholarship? This action cannot be undone."
                isLoading={isDeleting}
            />
        </div>
    );
}
