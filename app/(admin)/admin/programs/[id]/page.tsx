"use client";

import { ArrowLeft, Loader2, Plus, X } from "lucide-react";
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
import type { OtherTest } from "@/lib/types/admin";

const PREREQUISITE_SUGGESTIONS = [
	"Computer Science",
	"Engineering",
	"Mathematics",
	"Business",
	"Economics",
	"Statistics",
	"Physics",
	"Any Bachelor's",
];

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
	const [durationMonthsMin, setDurationMonthsMin] = useState("");
	const [durationMonthsMax, setDurationMonthsMax] = useState("");
	const [deliveryMode, setDeliveryMode] = useState("");
	const [studyTypes, setStudyTypes] = useState<string[]>([]);
	const [language, setLanguage] = useState("english");
	const [tuitionAnnualUsdMin, setTuitionAnnualUsdMin] = useState("");
	const [tuitionAnnualUsdMax, setTuitionAnnualUsdMax] = useState("");
	const [tuitionCurrency, setTuitionCurrency] = useState("USD");
	const [applicationFeeUsd, setApplicationFeeUsd] = useState("");
	const [scholarshipAvailable, setScholarshipAvailable] = useState("false");
	const [gpaMinimum, setGpaMinimum] = useState("");
	const [ieltsMinimum, setIeltsMinimum] = useState("");
	const [toeflMinimum, setToeflMinimum] = useState("");
	const [greMinimum, setGreMinimum] = useState("");
	const [gmatMinimum, setGmatMinimum] = useState("");
	const [programUrl, setProgramUrl] = useState("");
	const [description, setDescription] = useState("");
	const [prerequisiteMajors, setPrerequisiteMajors] = useState<string[]>([]);
	const [prerequisiteInput, setPrerequisiteInput] = useState("");
	const [minWorkExperienceYears, setMinWorkExperienceYears] = useState("");
	const [englishProficiencyRequirement, setEnglishProficiencyRequirement] =
		useState("");
	const [admissionRequirement, setAdmissionRequirement] = useState("");
	const [otherRequirements, setOtherRequirements] = useState<string[]>([]);
	const [otherRequirementInput, setOtherRequirementInput] = useState("");
	const [otherTests, setOtherTests] = useState<OtherTest[]>([]);

	useEffect(() => {
		const fetchProgram = async () => {
			try {
				const data = await adminApi.getProgram(id);
				setUniversityName(data.universityName);
				setName(data.name);
				setDegreeType(data.degreeType);
				setDegreeName(data.degreeName || "");
				setDurationMonthsMin(data.durationMonthsMin?.toString() || "");
				setDurationMonthsMax(data.durationMonthsMax?.toString() || "");
				setDeliveryMode(data.deliveryMode || "");
				setStudyTypes(data.studyTypes || ["Full-time"]);
				setLanguage(data.language || "english");
				setTuitionAnnualUsdMin(
					data.tuition?.annualUsdMin?.toString() ||
						data.tuition?.annualUsd?.toString() ||
						"",
				);
				setTuitionAnnualUsdMax(data.tuition?.annualUsdMax?.toString() || "");
				setTuitionCurrency(data.tuitionCurrency || "USD");
				setApplicationFeeUsd(data.applicationFeeUsd?.toString() || "");
				setScholarshipAvailable(data.scholarshipAvailable ? "true" : "false");
				setGpaMinimum(data.requirements?.gpaMinimum?.toString() || "");
				setIeltsMinimum(data.requirements?.ieltsMinimum?.toString() || "");
				setToeflMinimum(data.requirements?.toeflMinimum?.toString() || "");
				setGreMinimum(data.requirements?.greMinimum?.toString() || "");
				setGmatMinimum(data.requirements?.gmatMinimum?.toString() || "");
				setProgramUrl(data.programUrl || "");
				setDescription(data.description || "");
				// New fields
				setPrerequisiteMajors(data.prerequisiteMajors || []);
				setMinWorkExperienceYears(
					data.minWorkExperienceYears?.toString() || "",
				);
				setEnglishProficiencyRequirement(
					data.englishProficiencyRequirement || "",
				);
				setAdmissionRequirement(data.admissionRequirement || "");
				setOtherRequirements(data.requirements?.otherRequirements || []);
				setOtherTests(data.requirements?.otherTests || []);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to load program");
			} finally {
				setIsLoadingData(false);
			}
		};
		fetchProgram();
	}, [id]);

	const handleStudyTypeChange = (type: string, checked: boolean) => {
		if (checked) {
			setStudyTypes([...studyTypes, type]);
		} else {
			setStudyTypes(studyTypes.filter((t) => t !== type));
		}
	};

	const addPrerequisiteMajor = (major: string) => {
		const trimmed = major.trim();
		if (trimmed && !prerequisiteMajors.includes(trimmed)) {
			setPrerequisiteMajors([...prerequisiteMajors, trimmed]);
		}
		setPrerequisiteInput("");
	};

	const removePrerequisiteMajor = (major: string) => {
		setPrerequisiteMajors(prerequisiteMajors.filter((m) => m !== major));
	};

	const handlePrerequisiteKeyDown = (
		e: React.KeyboardEvent<HTMLInputElement>,
	) => {
		if (e.key === "Enter" || e.key === ",") {
			e.preventDefault();
			addPrerequisiteMajor(prerequisiteInput);
		}
	};

	const handleAddOtherTest = () => {
		setOtherTests([...otherTests, { name: "", value: "" }]);
	};

	const handleRemoveOtherTest = (index: number) => {
		setOtherTests(otherTests.filter((_, i) => i !== index));
	};

	const handleOtherTestChange = (
		index: number,
		field: "name" | "value",
		value: string,
	) => {
		const updated = [...otherTests];
		updated[index][field] = value;
		setOtherTests(updated);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			await adminApi.updateProgram(id, {
				name,
				degreeType,
				degreeName: degreeName || undefined,
				durationMonthsMin: durationMonthsMin
					? Number.parseInt(durationMonthsMin, 10)
					: undefined,
				durationMonthsMax: durationMonthsMax
					? Number.parseInt(durationMonthsMax, 10)
					: undefined,
				deliveryMode: deliveryMode || undefined,
				studyTypes: studyTypes.length > 0 ? studyTypes : undefined,
				prerequisiteMajors:
					prerequisiteMajors.length > 0 ? prerequisiteMajors : undefined,
				minWorkExperienceYears: minWorkExperienceYears
					? Number.parseInt(minWorkExperienceYears, 10)
					: undefined,
				language: language || undefined,
				tuition:
					tuitionAnnualUsdMin || tuitionAnnualUsdMax
						? {
								annualUsdMin: tuitionAnnualUsdMin
									? Number.parseInt(tuitionAnnualUsdMin, 10)
									: undefined,
								annualUsdMax: tuitionAnnualUsdMax
									? Number.parseInt(tuitionAnnualUsdMax, 10)
									: undefined,
							}
						: undefined,
				tuitionCurrency: tuitionCurrency || undefined,
				applicationFeeUsd: applicationFeeUsd
					? Number.parseInt(applicationFeeUsd, 10)
					: undefined,
				scholarshipAvailable: scholarshipAvailable === "true",
				requirements:
					gpaMinimum ||
					ieltsMinimum ||
					toeflMinimum ||
					greMinimum ||
					gmatMinimum ||
					otherRequirements.length > 0 ||
					otherTests.filter((t) => t.name && t.value).length > 0
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
								greMinimum: greMinimum
									? Number.parseInt(greMinimum, 10)
									: undefined,
								gmatMinimum: gmatMinimum
									? Number.parseInt(gmatMinimum, 10)
									: undefined,
								otherRequirements:
									otherRequirements.length > 0 ? otherRequirements : undefined,
								otherTests:
									otherTests.filter((t) => t.name && t.value).length > 0
										? otherTests.filter((t) => t.name && t.value)
										: undefined,
							}
						: undefined,
				programUrl: programUrl || undefined,
				description: description || undefined,
				englishProficiencyRequirement:
					englishProficiencyRequirement || undefined,
				admissionRequirement: admissionRequirement || undefined,
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

			<form onSubmit={handleSubmit} className="space-y-6">
				{error && (
					<div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
						{error}
					</div>
				)}

				<Card>
					<CardHeader>
						<CardTitle>Basic Information</CardTitle>
					</CardHeader>
					<CardContent>
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
										<SelectItem value="masters">Master's</SelectItem>
										<SelectItem value="mba">MBA</SelectItem>
										<SelectItem value="phd">PhD</SelectItem>
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
								<Label>Duration (months)</Label>
								<div className="flex gap-2 items-center">
									<Input
										id="durationMonthsMin"
										type="number"
										value={durationMonthsMin}
										onChange={(e) => setDurationMonthsMin(e.target.value)}
										placeholder="Min"
										disabled={isLoading}
										className="flex-1"
									/>
									<span className="text-muted-foreground">-</span>
									<Input
										id="durationMonthsMax"
										type="number"
										value={durationMonthsMax}
										onChange={(e) => setDurationMonthsMax(e.target.value)}
										placeholder="Max (optional)"
										disabled={isLoading}
										className="flex-1"
									/>
								</div>
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
										<SelectItem value="on_campus">On Campus</SelectItem>
										<SelectItem value="online">Online</SelectItem>
										<SelectItem value="hybrid">Hybrid</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label>Study Types *</Label>
								<div className="flex gap-4 mt-2">
									{["Full-time", "Part-time"].map((type) => (
										<label key={type} className="flex items-center gap-2">
											<input
												type="checkbox"
												checked={studyTypes.includes(type)}
												onChange={(e) =>
													handleStudyTypeChange(type, e.target.checked)
												}
												disabled={isLoading}
												className="rounded border-input"
											/>
											<span>{type}</span>
										</label>
									))}
								</div>
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
										<SelectItem value="dutch">Dutch</SelectItem>
										<SelectItem value="italian">Italian</SelectItem>
										<SelectItem value="japanese">Japanese</SelectItem>
										<SelectItem value="chinese">Chinese</SelectItem>
										<SelectItem value="korean">Korean</SelectItem>
										<SelectItem value="portuguese">Portuguese</SelectItem>
										<SelectItem value="norwegian">Norwegian</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="programUrl">Program URL</Label>
								<Input
									id="programUrl"
									type="url"
									value={programUrl}
									onChange={(e) => setProgramUrl(e.target.value)}
									placeholder="https://..."
									disabled={isLoading}
								/>
							</div>

							<div className="space-y-2 md:col-span-2">
								<Label htmlFor="description">Description</Label>
								<textarea
									id="description"
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									disabled={isLoading}
									className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Tuition & Fees</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label>Annual Tuition</Label>
								<div className="flex gap-2 items-center">
									<Input
										id="tuitionAnnualUsdMin"
										type="number"
										value={tuitionAnnualUsdMin}
										onChange={(e) => setTuitionAnnualUsdMin(e.target.value)}
										placeholder="Min"
										disabled={isLoading}
										className="flex-1"
									/>
									<span className="text-muted-foreground">-</span>
									<Input
										id="tuitionAnnualUsdMax"
										type="number"
										value={tuitionAnnualUsdMax}
										onChange={(e) => setTuitionAnnualUsdMax(e.target.value)}
										placeholder="Max (optional)"
										disabled={isLoading}
										className="flex-1"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="tuitionCurrency">Tuition Currency</Label>
								<Select
									value={tuitionCurrency}
									onValueChange={setTuitionCurrency}
									disabled={isLoading}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="USD">USD</SelectItem>
										<SelectItem value="EUR">EUR</SelectItem>
										<SelectItem value="GBP">GBP</SelectItem>
										<SelectItem value="AUD">AUD</SelectItem>
										<SelectItem value="CAD">CAD</SelectItem>
										<SelectItem value="SGD">SGD</SelectItem>
										<SelectItem value="CHF">CHF</SelectItem>
										<SelectItem value="JPY">JPY</SelectItem>
										<SelectItem value="NZD">NZD</SelectItem>
										<SelectItem value="VND">VND</SelectItem>
									</SelectContent>
								</Select>
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
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Admission Requirements</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2 md:col-span-2">
								<Label htmlFor="prerequisiteMajors">Prerequisite Majors</Label>
								<div className="flex flex-wrap gap-2 mb-2">
									{prerequisiteMajors.map((major) => (
										<span
											key={major}
											className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-sm"
										>
											{major}
											<button
												type="button"
												onClick={() => removePrerequisiteMajor(major)}
												className="hover:text-destructive"
											>
												<X className="h-3 w-3" />
											</button>
										</span>
									))}
								</div>
								<div className="flex gap-2">
									<Input
										id="prerequisiteMajors"
										value={prerequisiteInput}
										onChange={(e) => setPrerequisiteInput(e.target.value)}
										onKeyDown={handlePrerequisiteKeyDown}
										placeholder="Type and press Enter to add"
										disabled={isLoading}
									/>
								</div>
								<div className="flex flex-wrap gap-1 mt-2">
									{PREREQUISITE_SUGGESTIONS.filter(
										(s) => !prerequisiteMajors.includes(s),
									).map((suggestion) => (
										<button
											key={suggestion}
											type="button"
											onClick={() => addPrerequisiteMajor(suggestion)}
											className="px-2 py-0.5 text-xs rounded border border-input hover:bg-accent"
										>
											+ {suggestion}
										</button>
									))}
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="minWorkExperienceYears">
									Min Work Experience (years)
								</Label>
								<Input
									id="minWorkExperienceYears"
									type="number"
									min={0}
									value={minWorkExperienceYears}
									onChange={(e) => setMinWorkExperienceYears(e.target.value)}
									placeholder="Leave empty if not required"
									disabled={isLoading}
								/>
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

							<div className="space-y-2">
								<Label htmlFor="greMinimum">Minimum GRE</Label>
								<Input
									id="greMinimum"
									type="number"
									value={greMinimum}
									onChange={(e) => setGreMinimum(e.target.value)}
									placeholder="e.g., 320"
									disabled={isLoading}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="gmatMinimum">Minimum GMAT</Label>
								<Input
									id="gmatMinimum"
									type="number"
									value={gmatMinimum}
									onChange={(e) => setGmatMinimum(e.target.value)}
									placeholder="e.g., 700"
									disabled={isLoading}
								/>
							</div>

							<div className="space-y-2 md:col-span-2">
								<Label>Other Tests</Label>
								<p className="text-sm text-muted-foreground mb-2">
									Add additional standardized tests (e.g., SAT, Duolingo, PTE)
								</p>
								<div className="space-y-2">
									{otherTests.map((test, index) => (
										<div
											key={`other-test-${index}`}
											className="flex gap-2 items-center"
										>
											<Input
												value={test.name}
												onChange={(e) =>
													handleOtherTestChange(index, "name", e.target.value)
												}
												placeholder="Test name (e.g., SAT)"
												disabled={isLoading}
												className="flex-1"
											/>
											<Input
												value={test.value}
												onChange={(e) =>
													handleOtherTestChange(index, "value", e.target.value)
												}
												placeholder="Requirement (e.g., 1400+)"
												disabled={isLoading}
												className="flex-1"
											/>
											<Button
												type="button"
												variant="ghost"
												size="icon"
												onClick={() => handleRemoveOtherTest(index)}
												disabled={isLoading}
											>
												<X className="h-4 w-4" />
											</Button>
										</div>
									))}
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={handleAddOtherTest}
										disabled={isLoading}
									>
										<Plus className="h-4 w-4 mr-1" />
										Add Test
									</Button>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="englishProficiencyRequirement">
									English Proficiency Requirement
								</Label>
								<Input
									id="englishProficiencyRequirement"
									value={englishProficiencyRequirement}
									onChange={(e) =>
										setEnglishProficiencyRequirement(e.target.value)
									}
									placeholder="e.g., B1, C1 in English"
									disabled={isLoading}
								/>
							</div>

							<div className="space-y-2 md:col-span-2">
								<Label>Other Requirements</Label>
								<p className="text-sm text-muted-foreground mb-2">
									Add additional requirements (e.g., SOP, Letters of
									Recommendation, Portfolio)
								</p>
								<div className="flex flex-wrap gap-2 mb-2">
									{otherRequirements.map((req) => (
										<span
											key={req}
											className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-sm"
										>
											{req}
											<button
												type="button"
												onClick={() =>
													setOtherRequirements(
														otherRequirements.filter((r) => r !== req),
													)
												}
												className="hover:text-destructive"
											>
												<X className="h-3 w-3" />
											</button>
										</span>
									))}
								</div>
								<div className="flex gap-2">
									<Input
										value={otherRequirementInput}
										onChange={(e) => setOtherRequirementInput(e.target.value)}
										onKeyDown={(e) => {
											if (
												(e.key === "Enter" || e.key === ",") &&
												otherRequirementInput.trim()
											) {
												e.preventDefault();
												if (
													!otherRequirements.includes(
														otherRequirementInput.trim(),
													)
												) {
													setOtherRequirements([
														...otherRequirements,
														otherRequirementInput.trim(),
													]);
												}
												setOtherRequirementInput("");
											}
										}}
										placeholder="Type and press Enter to add"
										disabled={isLoading}
									/>
								</div>
								<div className="flex flex-wrap gap-1 mt-2">
									{[
										"Statement of Purpose",
										"Letters of Recommendation",
										"Portfolio",
										"Resume/CV",
										"Writing Sample",
										"Interview",
									]
										.filter((s) => !otherRequirements.includes(s))
										.map((suggestion) => (
											<button
												key={suggestion}
												type="button"
												onClick={() =>
													setOtherRequirements([
														...otherRequirements,
														suggestion,
													])
												}
												className="px-2 py-0.5 text-xs rounded border border-input hover:bg-accent"
											>
												+ {suggestion}
											</button>
										))}
								</div>
							</div>

							<div className="space-y-2 md:col-span-2">
								<Label htmlFor="admissionRequirement">Additional Notes</Label>
								<textarea
									id="admissionRequirement"
									value={admissionRequirement}
									onChange={(e) => setAdmissionRequirement(e.target.value)}
									placeholder="e.g., Requires Master 1 before Master 2"
									disabled={isLoading}
									className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				<div className="flex justify-end gap-4">
					<Button
						type="button"
						variant="outline"
						onClick={() => router.back()}
						disabled={isLoading}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={isLoading || studyTypes.length === 0}>
						{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Update Program
					</Button>
				</div>
			</form>
		</div>
	);
}
