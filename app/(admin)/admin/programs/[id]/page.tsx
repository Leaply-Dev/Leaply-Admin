"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { adminApi } from "@/lib/api/adminApi";

export default function EditProgramPage() {
	const params = useParams();
	const router = useRouter();
	const id = params.id as string;

	const [isLoadingData, setIsLoadingData] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [universityName, setUniversityName] = useState("");
	const [name, setName] = useState("");
	const [degreeType, setDegreeType] = useState("");
	const [degreeName, setDegreeName] = useState("");
	const [durationMonths, setDurationMonths] = useState("");
	const [deliveryMode, setDeliveryMode] = useState("");
	const [language, setLanguage] = useState("english");
	const [tuitionAnnualUsd, setTuitionAnnualUsd] = useState("");
	const [applicationFeeUsd, setApplicationFeeUsd] = useState("");
	const [scholarshipAvailable, setScholarshipAvailable] = useState("false");
	const [gpaMinimum, setGpaMinimum] = useState("");
	const [ieltsMinimum, setIeltsMinimum] = useState("");
	const [toeflMinimum, setToeflMinimum] = useState("");
	const [programUrl, setProgramUrl] = useState("");
	const [description, setDescription] = useState("");

	useEffect(() => {
		const fetchProgram = async () => {
			try {
				const data = await adminApi.getProgram(id);
				setUniversityName(data.universityName);
				setName(data.name);
				setDegreeType(data.degreeType);
				setDegreeName(data.degreeName || "");
				setDurationMonths(data.durationMonths?.toString() || "");
				setDeliveryMode(data.deliveryMode || "");
				setLanguage(data.language || "english");
				setTuitionAnnualUsd(data.tuition?.annualUsd?.toString() || "");
				setApplicationFeeUsd(data.applicationFeeUsd?.toString() || "");
				setScholarshipAvailable(data.scholarshipAvailable ? "true" : "false");
				setGpaMinimum(data.requirements?.gpaMinimum?.toString() || "");
				setIeltsMinimum(data.requirements?.ieltsMinimum?.toString() || "");
				setToeflMinimum(data.requirements?.toeflMinimum?.toString() || "");
				setProgramUrl(data.programUrl || "");
				setDescription(data.description || "");
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to load program");
			} finally {
				setIsLoadingData(false);
			}
		};
		fetchProgram();
	}, [id]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			await adminApi.updateProgram(id, {
				name,
				degreeType,
				degreeName: degreeName || undefined,
				durationMonths: durationMonths
					? Number.parseInt(durationMonths, 10)
					: undefined,
				deliveryMode: deliveryMode || undefined,
				language: language || undefined,
				tuition: tuitionAnnualUsd
					? { annualUsd: Number.parseInt(tuitionAnnualUsd, 10) }
					: undefined,
				applicationFeeUsd: applicationFeeUsd
					? Number.parseInt(applicationFeeUsd, 10)
					: undefined,
				scholarshipAvailable: scholarshipAvailable === "true",
				requirements:
					gpaMinimum || ieltsMinimum || toeflMinimum
						? {
								gpaMinimum: gpaMinimum
									? Number.parseFloat(gpaMinimum)
									: undefined,
								ieltsMinimum: ieltsMinimum
									? Number.parseFloat(ieltsMinimum)
									: undefined,
								toeflMinimum: toeflMinimum
									? Number.parseInt(toeflMinimum, 10)
									: undefined,
							}
						: undefined,
				programUrl: programUrl || undefined,
				description: description || undefined,
			});
			router.push("/admin/programs");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to update program");
		} finally {
			setIsLoading(false);
		}
	};

	if (isLoadingData) {
		return (
			<div>
				<PageHeader
					title="Edit Program"
					action={
						<Button variant="outline" asChild>
							<Link href="/admin/programs">
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back
							</Link>
						</Button>
					}
				/>
				<Card>
					<CardHeader>
						<Skeleton className="h-6 w-40" />
					</CardHeader>
					<CardContent className="space-y-4">
						{Array.from({ length: 6 }).map((_, i) => (
							<Skeleton key={i} className="h-10 w-full" />
						))}
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div>
			<PageHeader
				title="Edit Program"
				description={universityName}
				action={
					<div className="flex gap-2">
						<Button variant="outline" asChild>
							<Link href={`/admin/programs/${id}/intakes`}>Manage Intakes</Link>
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

			<Card>
				<CardHeader>
					<CardTitle>Program Details</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-6">
						{error && (
							<div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
								{error}
							</div>
						)}

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="name">Program Name *</Label>
								<Input
									id="name"
									value={name}
									onChange={(e) => setName(e.target.value)}
									required
									disabled={isLoading}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="degreeType">Degree Type *</Label>
								<Select
									value={degreeType}
									onValueChange={setDegreeType}
									disabled={isLoading}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select degree type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="bachelor">Bachelor</SelectItem>
										<SelectItem value="master">Master</SelectItem>
										<SelectItem value="phd">PhD</SelectItem>
										<SelectItem value="diploma">Diploma</SelectItem>
										<SelectItem value="certificate">Certificate</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="degreeName">Degree Name</Label>
								<Input
									id="degreeName"
									value={degreeName}
									onChange={(e) => setDegreeName(e.target.value)}
									placeholder="e.g., Bachelor of Science"
									disabled={isLoading}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="durationMonths">Duration (months)</Label>
								<Input
									id="durationMonths"
									type="number"
									value={durationMonths}
									onChange={(e) => setDurationMonths(e.target.value)}
									disabled={isLoading}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="deliveryMode">Delivery Mode</Label>
								<Select
									value={deliveryMode}
									onValueChange={setDeliveryMode}
									disabled={isLoading}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select delivery mode" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="on-campus">On Campus</SelectItem>
										<SelectItem value="online">Online</SelectItem>
										<SelectItem value="hybrid">Hybrid</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="language">Language</Label>
								<Select
									value={language}
									onValueChange={setLanguage}
									disabled={isLoading}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select language" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="english">English</SelectItem>
										<SelectItem value="german">German</SelectItem>
										<SelectItem value="french">French</SelectItem>
										<SelectItem value="spanish">Spanish</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="tuitionAnnualUsd">Annual Tuition (USD)</Label>
								<Input
									id="tuitionAnnualUsd"
									type="number"
									value={tuitionAnnualUsd}
									onChange={(e) => setTuitionAnnualUsd(e.target.value)}
									disabled={isLoading}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="applicationFeeUsd">Application Fee (USD)</Label>
								<Input
									id="applicationFeeUsd"
									type="number"
									value={applicationFeeUsd}
									onChange={(e) => setApplicationFeeUsd(e.target.value)}
									disabled={isLoading}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="scholarshipAvailable">
									Scholarship Available
								</Label>
								<Select
									value={scholarshipAvailable}
									onValueChange={setScholarshipAvailable}
									disabled={isLoading}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="true">Yes</SelectItem>
										<SelectItem value="false">No</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="gpaMinimum">Minimum GPA</Label>
								<Input
									id="gpaMinimum"
									type="number"
									step="0.1"
									value={gpaMinimum}
									onChange={(e) => setGpaMinimum(e.target.value)}
									disabled={isLoading}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="ieltsMinimum">Minimum IELTS</Label>
								<Input
									id="ieltsMinimum"
									type="number"
									step="0.5"
									value={ieltsMinimum}
									onChange={(e) => setIeltsMinimum(e.target.value)}
									disabled={isLoading}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="toeflMinimum">Minimum TOEFL</Label>
								<Input
									id="toeflMinimum"
									type="number"
									value={toeflMinimum}
									onChange={(e) => setToeflMinimum(e.target.value)}
									disabled={isLoading}
								/>
							</div>

							<div className="space-y-2 md:col-span-2">
								<Label htmlFor="programUrl">Program URL</Label>
								<Input
									id="programUrl"
									type="url"
									value={programUrl}
									onChange={(e) => setProgramUrl(e.target.value)}
									disabled={isLoading}
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<textarea
								id="description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								disabled={isLoading}
								className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
							/>
						</div>

						<div className="flex justify-end gap-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => router.back()}
								disabled={isLoading}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isLoading}>
								{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								Update Program
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
