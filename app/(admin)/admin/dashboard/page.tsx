"use client";

import {
	Award,
	Building2,
	GraduationCap,
	Sparkles,
	UserCheck,
	UserPlus,
	Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import type { DashboardStatsResponse } from "@/lib/types/admin";

function StatCard({
	title,
	value,
	icon: Icon,
	description,
}: {
	title: string;
	value: number | string;
	icon: React.ElementType;
	description?: string;
}) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<CardTitle className="text-sm font-medium text-muted-foreground">
					{title}
				</CardTitle>
				<Icon className="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold">{value}</div>
				{description && (
					<p className="text-xs text-muted-foreground mt-1">{description}</p>
				)}
			</CardContent>
		</Card>
	);
}

function StatCardSkeleton() {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<Skeleton className="h-4 w-24" />
				<Skeleton className="h-4 w-4" />
			</CardHeader>
			<CardContent>
				<Skeleton className="h-8 w-16" />
				<Skeleton className="h-3 w-32 mt-2" />
			</CardContent>
		</Card>
	);
}

export default function DashboardPage() {
	const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const data = await adminApi.getStats();
				setStats(data);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to load stats");
			} finally {
				setIsLoading(false);
			}
		};
		fetchStats();
	}, []);

	// Process major coverage data - all majors sorted by count descending
	const majorCoverageData = stats?.programsByMajor
		? Object.entries(stats.programsByMajor).sort(([, a], [, b]) => b - a)
		: [];

	// Calculate total programs across all majors (for percentage)
	const totalMajorCount = majorCoverageData.reduce(
		(sum, [, count]) => sum + count,
		0
	);

	if (error) {
		return (
			<div>
				<PageHeader title="Dashboard" description="Overview of your platform" />
				<div className="p-6 bg-destructive/10 rounded-lg text-destructive">
					{error}
				</div>
			</div>
		);
	}

	return (
		<div>
			<PageHeader title="Dashboard" description="Overview of your platform" />

			{/* User Metrics */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
				{isLoading ? (
					Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
				) : stats ? (
					<>
						<StatCard
							title="Total Users"
							value={stats.totalUsers}
							icon={Users}
						/>
						<StatCard
							title="New Users This Month"
							value={stats.newUsersThisMonth}
							icon={UserPlus}
						/>
						<StatCard
							title="Onboarded Users"
							value={stats.onboardedUsers}
							icon={UserCheck}
							description={`${stats.onboardingCompletionRate.toFixed(1)}% completion rate`}
						/>
						<StatCard
							title="New Scholarships This Month"
							value={stats.newScholarshipsThisMonth}
							icon={Sparkles}
						/>
					</>
				) : null}
			</div>

			{/* Content Metrics */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
				{isLoading ? (
					Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)
				) : stats ? (
					<>
						<StatCard
							title="Universities"
							value={stats.totalUniversities}
							icon={Building2}
						/>
						<StatCard
							title="Programs"
							value={stats.totalPrograms}
							icon={GraduationCap}
						/>
						<StatCard
							title="Scholarships"
							value={stats.totalScholarships}
							icon={Award}
						/>
					</>
				) : null}
			</div>

			{/* Major Field Coverage */}
			<Card>
				<CardHeader>
					<CardTitle>Major Field Coverage</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="space-y-3">
							{Array.from({ length: 5 }).map((_, i) => (
								<div key={i} className="flex justify-between">
									<Skeleton className="h-4 w-48" />
									<Skeleton className="h-4 w-16" />
								</div>
							))}
						</div>
					) : majorCoverageData.length > 0 ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Major Category</TableHead>
									<TableHead className="text-right">Programs</TableHead>
									<TableHead className="text-right">% of Total</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{majorCoverageData.map(([major, count]) => (
									<TableRow key={major}>
										<TableCell className="font-medium">{major}</TableCell>
										<TableCell className="text-right">{count}</TableCell>
										<TableCell className="text-right text-muted-foreground">
											{totalMajorCount > 0
												? ((count / totalMajorCount) * 100).toFixed(1)
												: 0}
											%
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<p className="text-sm text-muted-foreground py-4 text-center">
							No major category data available. Programs may not have major
							categories assigned.
						</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
