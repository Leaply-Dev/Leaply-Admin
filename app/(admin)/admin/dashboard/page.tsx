"use client";

import {
	Building2,
	Calendar,
	CheckCircle,
	GraduationCap,
	UserCheck,
	UserPlus,
	Users,
	XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{isLoading ? (
					Array.from({ length: 8 }).map((_, i) => <StatCardSkeleton key={i} />)
				) : stats ? (
					<>
						<StatCard
							title="Total Users"
							value={stats.totalUsers}
							icon={Users}
							description={`${stats.activeUsers} active in last 30 days`}
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
							description={`${Math.round((stats.onboardedUsers / stats.totalUsers) * 100)}% completion rate`}
						/>
						<StatCard
							title="Upcoming Deadlines"
							value={stats.upcomingDeadlines}
							icon={Calendar}
							description="Intakes in next 30 days"
						/>
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
							title="Accepted Applications"
							value={stats.applicationsByStatus.accepted}
							icon={CheckCircle}
						/>
						<StatCard
							title="Rejected Applications"
							value={stats.applicationsByStatus.rejected}
							icon={XCircle}
						/>
					</>
				) : null}
			</div>

			{stats && (
				<div className="mt-8">
					<Card>
						<CardHeader>
							<CardTitle>Application Status Breakdown</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid gap-4 md:grid-cols-5">
								<div className="text-center p-4 bg-muted/50 rounded-lg">
									<div className="text-2xl font-bold">
										{stats.applicationsByStatus.planning}
									</div>
									<div className="text-sm text-muted-foreground">Planning</div>
								</div>
								<div className="text-center p-4 bg-muted/50 rounded-lg">
									<div className="text-2xl font-bold">
										{stats.applicationsByStatus.writing}
									</div>
									<div className="text-sm text-muted-foreground">Writing</div>
								</div>
								<div className="text-center p-4 bg-muted/50 rounded-lg">
									<div className="text-2xl font-bold">
										{stats.applicationsByStatus.submitted}
									</div>
									<div className="text-sm text-muted-foreground">Submitted</div>
								</div>
								<div className="text-center p-4 bg-primary/10 rounded-lg">
									<div className="text-2xl font-bold text-primary">
										{stats.applicationsByStatus.accepted}
									</div>
									<div className="text-sm text-muted-foreground">Accepted</div>
								</div>
								<div className="text-center p-4 bg-destructive/10 rounded-lg">
									<div className="text-2xl font-bold text-destructive">
										{stats.applicationsByStatus.rejected}
									</div>
									<div className="text-sm text-muted-foreground">Rejected</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
}
