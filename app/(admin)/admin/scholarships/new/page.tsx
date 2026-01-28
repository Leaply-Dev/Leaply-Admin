"use client";

import { ArrowLeft, Loader2, Plus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { adminApi } from "@/lib/api/adminApi";
import type {
	OtherTest,
	RequiredDocument,
	ScholarshipCoverageDuration,
	ScholarshipCoverageType,
	ScholarshipDegreeLevel,
	ScholarshipEligibilityFocus,
	ScholarshipEligibilityType,
	ScholarshipSourceType,
	UniversityAdminResponse,
} from "@/lib/types/admin";

const ELIGIBLE_FIELDS: { value: string; label: string }[] = [
	{ value: "cs_it", label: "Computer Science/IT" },
	{ value: "business", label: "Business" },
	{ value: "engineering", label: "Engineering" },
	{ value: "finance", label: "Finance" },
	{ value: "data_science", label: "Data Science" },
	{ value: "design", label: "Design" },
	{ value: "health", label: "Public Health" },
	{ value: "arts", label: "Arts" },
	{ value: "media_communication", label: "Media & Communication" },
	{ value: "science", label: "Science" },
	{ value: "humanities", label: "Humanities" },
	{ value: "law", label: "Law" },
	{ value: "other", label: "Other" },
];

const REQUIRED_DOCUMENTS: { value: RequiredDocument; label: string }[] = [
	{ value: "transcript", label: "Transcript" },
	{ value: "cv", label: "CV/Resume" },
	{ value: "motivation_letter", label: "Motivation Letter" },
	{ value: "recommendation_letters", label: "Recommendation Letters" },
	{ value: "portfolio", label: "Portfolio" },
	{ value: "research_proposal", label: "Research Proposal" },
	{ value: "financial_documents", label: "Financial Documents" },
	{ value: "language_certificate", label: "Language Certificate" },
];

export default function NewScholarshipPage() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Basic Info
	const [name, setName] = useState("");
	const [url, setUrl] = useState("");
	const [description, setDescription] = useState("");
	const [sourceType, setSourceType] =
		useState<ScholarshipSourceType>("university");
	const [sourceName, setSourceName] = useState("");
	const [universityId, setUniversityId] = useState("");
	const [universityDisplay, setUniversityDisplay] = useState("");

	// Target & Scope
	const [degreeLevels, setDegreeLevels] = useState<ScholarshipDegreeLevel[]>([
		"master",
	]);
	const [allFieldsEligible, setAllFieldsEligible] = useState(true);
	const [eligibleFields, setEligibleFields] = useState<string[]>([]);

	// Coverage & Benefits
	const [coverageType, setCoverageType] =
		useState<ScholarshipCoverageType>("full_funded");
	const [coverageDuration, setCoverageDuration] =
		useState<ScholarshipCoverageDuration>("full_program");
	const [coverageDurationOther, setCoverageDurationOther] = useState("");
	const [coveragePercentage, setCoveragePercentage] = useState("");
	const [coverageAmountMin, setCoverageAmountMin] = useState("");
	const [coverageAmountMax, setCoverageAmountMax] = useState("");
	const [coverageCurrency, setCoverageCurrency] = useState("USD");
	const [coverageNotes, setCoverageNotes] = useState("");

	// Eligibility & Requirements
	const [eligibilityType, setEligibilityType] =
		useState<ScholarshipEligibilityType>("merit");
	const [eligibilityFocus, setEligibilityFocus] = useState<
		ScholarshipEligibilityFocus[]
	>(["academic"]);
	const [minGpa, setMinGpa] = useState("");
	const [gpaScale, setGpaScale] = useState("4.0");
	const [minIelts, setMinIelts] = useState("");
	const [minToefl, setMinToefl] = useState("");
	const [minGre, setMinGre] = useState("");
	const [minGmat, setMinGmat] = useState("");
	const [otherTests, setOtherTests] = useState<OtherTest[]>([]);
	const [workExperienceRequired, setWorkExperienceRequired] = useState(false);
	const [minWorkExperienceYears, setMinWorkExperienceYears] = useState("");
	const [requiredDocuments, setRequiredDocuments] = useState<
		RequiredDocument[]
	>([]);
	const [requiredDocumentsOther, setRequiredDocumentsOther] = useState("");
	const [englishProficiencyRequirement, setEnglishProficiencyRequirement] =
		useState("");
	const [applyWithProgram, setApplyWithProgram] = useState(false);
	const [programApplicationUrl, setProgramApplicationUrl] = useState("");

	// Timeline
	const [applicationOpenDate, setApplicationOpenDate] = useState("");
	const [applicationDeadline, setApplicationDeadline] = useState("");

	// Admin Notes
	const [dataSource, setDataSource] = useState("");
	const [isActive, setIsActive] = useState(true);
	const [notes, setNotes] = useState("");

	const handleUniversityChange = (
		id: string,
		item?: UniversityAdminResponse,
	) => {
		setUniversityId(id);
		if (item) {
			setUniversityDisplay(`${item.name} - ${item.country}`);
		} else {
			setUniversityDisplay("");
		}
	};

	const handleDegreeLevelChange = (
		level: ScholarshipDegreeLevel,
		checked: boolean,
	) => {
		if (checked) {
			setDegreeLevels([...degreeLevels, level]);
		} else {
			setDegreeLevels(degreeLevels.filter((l) => l !== level));
		}
	};

	const handleEligibleFieldChange = (field: string, checked: boolean) => {
		if (checked) {
			setEligibleFields([...eligibleFields, field]);
		} else {
			setEligibleFields(eligibleFields.filter((f) => f !== field));
		}
	};

	const handleRequiredDocChange = (doc: RequiredDocument, checked: boolean) => {
		if (checked) {
			setRequiredDocuments([...requiredDocuments, doc]);
		} else {
			setRequiredDocuments(requiredDocuments.filter((d) => d !== doc));
		}
	};

	const handleEligibilityFocusChange = (
		focus: ScholarshipEligibilityFocus,
		checked: boolean,
	) => {
		if (checked) {
			setEligibilityFocus([...eligibilityFocus, focus]);
		} else {
			setEligibilityFocus(eligibilityFocus.filter((f) => f !== focus));
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
			await adminApi.createScholarship({
				name,
				url: url || undefined,
				description: description || undefined,
				universityId: universityId || undefined,
				sourceType,
				sourceName: sourceName || undefined,
				degreeLevels,
				eligibleFields: allFieldsEligible ? undefined : eligibleFields,
				coverageType,
				coverageDuration,
				coverageDurationOther:
					coverageDuration === "other" ? coverageDurationOther : undefined,
				coveragePercentage: coveragePercentage
					? Number(coveragePercentage)
					: undefined,
				coverageAmountMin: coverageAmountMin
					? Number(coverageAmountMin)
					: undefined,
				coverageAmountMax: coverageAmountMax
					? Number(coverageAmountMax)
					: undefined,
				coverageCurrency,
				coverageNotes: coverageNotes || undefined,
				eligibilityType,
				eligibilityFocus:
					eligibilityFocus.length > 0 ? eligibilityFocus : undefined,
				minGpa: minGpa ? Number(minGpa) : undefined,
				gpaScale: Number(gpaScale),
				minIelts: minIelts ? Number(minIelts) : undefined,
				minToefl: minToefl ? Number(minToefl) : undefined,
				minGre: minGre ? Number(minGre) : undefined,
				minGmat: minGmat ? Number(minGmat) : undefined,
				otherTests:
					otherTests.filter((t) => t.name && t.value).length > 0
						? otherTests.filter((t) => t.name && t.value)
						: undefined,
				workExperienceRequired,
				minWorkExperienceYears: minWorkExperienceYears
					? Number(minWorkExperienceYears)
					: undefined,
				requiredDocuments:
					requiredDocuments.length > 0 ? requiredDocuments : undefined,
				requiredDocumentsOther: requiredDocumentsOther || undefined,
				englishProficiencyRequirement:
					englishProficiencyRequirement || undefined,
				applyWithProgram,
				programApplicationUrl: programApplicationUrl || undefined,
				applicationOpenDate: applicationOpenDate || undefined,
				applicationDeadline: applicationDeadline || undefined,
				isActive,
				dataSource: dataSource || undefined,
				notes: notes || undefined,
			});
			router.push("/admin/scholarships");
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to create scholarship",
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div>
			<PageHeader
				title="Add Scholarship"
				action={
					<Button variant="outline" asChild>
						<Link href="/admin/scholarships">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back
						</Link>
					</Button>
				}
			/>

			<form onSubmit={handleSubmit} className="space-y-6">
				{error && (
					<div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
						{error}
					</div>
				)}

				{/* Section 1: Basic Information */}
				<Card>
					<CardHeader>
						<CardTitle>Basic Information</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="name">Name *</Label>
								<Input
									id="name"
									value={name}
									onChange={(e) => setName(e.target.value)}
									required
									disabled={isLoading}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="url">URL</Label>
								<Input
									id="url"
									type="url"
									value={url}
									onChange={(e) => setUrl(e.target.value)}
									placeholder="https://..."
									disabled={isLoading}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="sourceType">Source Type *</Label>
								<Select
									value={sourceType}
									onValueChange={(v) =>
										setSourceType(v as ScholarshipSourceType)
									}
									disabled={isLoading}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="university">University</SelectItem>
										<SelectItem value="government">Government</SelectItem>
										<SelectItem value="foundation">Foundation</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="sourceName">Source Name</Label>
								<Input
									id="sourceName"
									value={sourceName}
									onChange={(e) => setSourceName(e.target.value)}
									placeholder="e.g., Chevening, DAAD, Fulbright"
									disabled={isLoading}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="universityId">
									University {sourceType === "university" ? "*" : ""}
								</Label>
								<SearchableSelect<UniversityAdminResponse>
									value={universityId}
									onChange={handleUniversityChange}
									searchFn={adminApi.searchUniversities}
									displayFn={(uni) => `${uni.name} - ${uni.country}`}
									getIdFn={(uni) => uni.id}
									placeholder="Search universities..."
									recentStorageKey="leaply-recent-universities"
									disabled={isLoading}
									required={sourceType === "university"}
									selectedDisplayValue={universityDisplay}
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

				{/* Section 2: Target & Scope */}
				<Card>
					<CardHeader>
						<CardTitle>Target & Scope</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="space-y-2">
								<Label>Degree Levels *</Label>
								<div className="flex gap-4">
									{(["bachelor", "master", "phd"] as const).map((level) => (
										<label key={level} className="flex items-center gap-2">
											<input
												type="checkbox"
												checked={degreeLevels.includes(level)}
												onChange={(e) =>
													handleDegreeLevelChange(level, e.target.checked)
												}
												disabled={isLoading}
												className="rounded border-input"
											/>
											<span className="capitalize">{level}</span>
										</label>
									))}
								</div>
							</div>

							<div className="space-y-2">
								<label className="flex items-center gap-2">
									<input
										type="checkbox"
										checked={allFieldsEligible}
										onChange={(e) => setAllFieldsEligible(e.target.checked)}
										disabled={isLoading}
										className="rounded border-input"
									/>
									<span>All fields eligible</span>
								</label>
								{!allFieldsEligible && (
									<div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 ml-6">
										{ELIGIBLE_FIELDS.map((field) => (
											<label
												key={field.value}
												className="flex items-center gap-2"
											>
												<input
													type="checkbox"
													checked={eligibleFields.includes(field.value)}
													onChange={(e) =>
														handleEligibleFieldChange(
															field.value,
															e.target.checked,
														)
													}
													disabled={isLoading}
													className="rounded border-input"
												/>
												<span className="text-sm">{field.label}</span>
											</label>
										))}
									</div>
								)}
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Section 3: Coverage & Benefits */}
				<Card>
					<CardHeader>
						<CardTitle>Coverage & Benefits</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="coverageType">Coverage Type *</Label>
								<Select
									value={coverageType}
									onValueChange={(v) =>
										setCoverageType(v as ScholarshipCoverageType)
									}
									disabled={isLoading}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="full_funded">Fully Funded</SelectItem>
										<SelectItem value="partial_funded">
											Partially Funded
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="coverageDuration">Coverage Duration *</Label>
								<Select
									value={coverageDuration}
									onValueChange={(v) =>
										setCoverageDuration(v as ScholarshipCoverageDuration)
									}
									disabled={isLoading}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="first_year">First Year Only</SelectItem>
										<SelectItem value="annual_renewable">
											Annual (Renewable)
										</SelectItem>
										<SelectItem value="full_program">Full Program</SelectItem>
										<SelectItem value="one_time">One-time Grant</SelectItem>
										<SelectItem value="not_specified">Not Specified</SelectItem>
										<SelectItem value="other">Other</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{coverageDuration === "other" && (
								<div className="space-y-2">
									<Label htmlFor="coverageDurationOther">
										Coverage Duration (specify)
									</Label>
									<Input
										id="coverageDurationOther"
										value={coverageDurationOther}
										onChange={(e) => setCoverageDurationOther(e.target.value)}
										placeholder="e.g., 2 semesters"
										disabled={isLoading}
									/>
								</div>
							)}

							{coverageType === "partial_funded" && (
								<div className="space-y-2">
									<Label htmlFor="coveragePercentage">
										Coverage Percentage
									</Label>
									<Input
										id="coveragePercentage"
										type="number"
										min={0}
										max={100}
										value={coveragePercentage}
										onChange={(e) => setCoveragePercentage(e.target.value)}
										placeholder="e.g., 50"
										disabled={isLoading}
									/>
								</div>
							)}

							<div className="space-y-2">
								<Label>Coverage Amount</Label>
								<div className="flex gap-2 items-center">
									<Input
										id="coverageAmountMin"
										type="number"
										value={coverageAmountMin}
										onChange={(e) => setCoverageAmountMin(e.target.value)}
										placeholder="Min"
										disabled={isLoading}
										className="flex-1"
									/>
									<span className="text-muted-foreground">-</span>
									<Input
										id="coverageAmountMax"
										type="number"
										value={coverageAmountMax}
										onChange={(e) => setCoverageAmountMax(e.target.value)}
										placeholder="Max (optional)"
										disabled={isLoading}
										className="flex-1"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="coverageCurrency">Currency</Label>
								<Select
									value={coverageCurrency}
									onValueChange={setCoverageCurrency}
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

							<div className="space-y-2 md:col-span-2">
								<Label htmlFor="coverageNotes">Coverage Notes</Label>
								<textarea
									id="coverageNotes"
									value={coverageNotes}
									onChange={(e) => setCoverageNotes(e.target.value)}
									placeholder="Additional notes about coverage..."
									disabled={isLoading}
									className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Section 4: Eligibility & Requirements */}
				<Card>
					<CardHeader>
						<CardTitle>Eligibility & Requirements</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="eligibilityType">Eligibility Type *</Label>
								<Select
									value={eligibilityType}
									onValueChange={(v) =>
										setEligibilityType(v as ScholarshipEligibilityType)
									}
									disabled={isLoading}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="merit">Merit-based</SelectItem>
										<SelectItem value="need_based">Need-based</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{eligibilityType === "merit" && (
								<div className="space-y-2 md:col-span-2">
									<Label>Eligibility Focus</Label>
									<div className="flex flex-wrap gap-4">
										{(
											[
												{ value: "academic", label: "Academic Excellence" },
												{ value: "holistic", label: "Holistic Review" },
												{ value: "leadership", label: "Leadership" },
												{ value: "research", label: "Research" },
												{
													value: "community_service",
													label: "Community Service",
												},
											] as const
										).map((focus) => (
											<label
												key={focus.value}
												className="flex items-center gap-2"
											>
												<input
													type="checkbox"
													checked={eligibilityFocus.includes(focus.value)}
													onChange={(e) =>
														handleEligibilityFocusChange(
															focus.value,
															e.target.checked,
														)
													}
													disabled={isLoading}
													className="rounded border-input"
												/>
												<span>{focus.label}</span>
											</label>
										))}
									</div>
								</div>
							)}

							<div className="space-y-2">
								<Label htmlFor="minGpa">Minimum GPA</Label>
								<Input
									id="minGpa"
									type="number"
									step="0.01"
									min={0}
									max={4}
									value={minGpa}
									onChange={(e) => setMinGpa(e.target.value)}
									disabled={isLoading}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="gpaScale">GPA Scale</Label>
								<Select
									value={gpaScale}
									onValueChange={setGpaScale}
									disabled={isLoading}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="4.0">4.0</SelectItem>
										<SelectItem value="5.0">5.0</SelectItem>
										<SelectItem value="10.0">10.0</SelectItem>
										<SelectItem value="100">100</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="minIelts">Minimum IELTS</Label>
								<Input
									id="minIelts"
									type="number"
									step="0.5"
									min={0}
									max={9}
									value={minIelts}
									onChange={(e) => setMinIelts(e.target.value)}
									disabled={isLoading}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="minToefl">Minimum TOEFL</Label>
								<Input
									id="minToefl"
									type="number"
									min={0}
									max={120}
									value={minToefl}
									onChange={(e) => setMinToefl(e.target.value)}
									disabled={isLoading}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="minGre">Minimum GRE</Label>
								<Input
									id="minGre"
									type="number"
									min={0}
									max={340}
									value={minGre}
									onChange={(e) => setMinGre(e.target.value)}
									placeholder="e.g., 320"
									disabled={isLoading}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="minGmat">Minimum GMAT</Label>
								<Input
									id="minGmat"
									type="number"
									min={0}
									max={800}
									value={minGmat}
									onChange={(e) => setMinGmat(e.target.value)}
									placeholder="e.g., 700"
									disabled={isLoading}
								/>
							</div>

							<div className="space-y-2 md:col-span-2">
								<Label>Other Tests</Label>
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

							<div className="space-y-2 md:col-span-2">
								<label className="flex items-center gap-2">
									<input
										type="checkbox"
										checked={workExperienceRequired}
										onChange={(e) =>
											setWorkExperienceRequired(e.target.checked)
										}
										disabled={isLoading}
										className="rounded border-input"
									/>
									<span>Work experience required</span>
								</label>
								{workExperienceRequired && (
									<div className="ml-6 mt-2 w-32">
										<Input
											type="number"
											min={0}
											value={minWorkExperienceYears}
											onChange={(e) =>
												setMinWorkExperienceYears(e.target.value)
											}
											placeholder="Min years"
											disabled={isLoading}
										/>
									</div>
								)}
							</div>

							<div className="space-y-2 md:col-span-2">
								<Label>Required Documents</Label>
								<div className="grid grid-cols-2 md:grid-cols-4 gap-2">
									{REQUIRED_DOCUMENTS.map((doc) => (
										<label key={doc.value} className="flex items-center gap-2">
											<input
												type="checkbox"
												checked={requiredDocuments.includes(doc.value)}
												onChange={(e) =>
													handleRequiredDocChange(doc.value, e.target.checked)
												}
												disabled={isLoading}
												className="rounded border-input"
											/>
											<span className="text-sm">{doc.label}</span>
										</label>
									))}
								</div>
								<div className="mt-2">
									<Label htmlFor="requiredDocumentsOther">
										Other Documents
									</Label>
									<Input
										id="requiredDocumentsOther"
										value={requiredDocumentsOther}
										onChange={(e) => setRequiredDocumentsOther(e.target.value)}
										placeholder="e.g., Writing samples, Art portfolio"
										disabled={isLoading}
									/>
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
								<label className="flex items-center gap-2">
									<input
										type="checkbox"
										checked={applyWithProgram}
										onChange={(e) => setApplyWithProgram(e.target.checked)}
										disabled={isLoading}
										className="rounded border-input"
									/>
									<span>Apply with a program</span>
								</label>
								{applyWithProgram && (
									<div className="ml-6 mt-2">
										<Label htmlFor="programApplicationUrl">
											Program Application URL
										</Label>
										<Input
											id="programApplicationUrl"
											type="url"
											value={programApplicationUrl}
											onChange={(e) => setProgramApplicationUrl(e.target.value)}
											placeholder="https://..."
											disabled={isLoading}
										/>
									</div>
								)}
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Section 5: Timeline */}
				<Card>
					<CardHeader>
						<CardTitle>Timeline</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="applicationOpenDate">Application Opens</Label>
								<Input
									id="applicationOpenDate"
									type="date"
									value={applicationOpenDate}
									onChange={(e) => setApplicationOpenDate(e.target.value)}
									disabled={isLoading}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="applicationDeadline">
									Application Deadline
								</Label>
								<Input
									id="applicationDeadline"
									type="date"
									value={applicationDeadline}
									onChange={(e) => setApplicationDeadline(e.target.value)}
									disabled={isLoading}
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Section 6: Admin Notes */}
				<Card>
					<CardHeader>
						<CardTitle>Admin Notes</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="dataSource">Data Source</Label>
								<Input
									id="dataSource"
									value={dataSource}
									onChange={(e) => setDataSource(e.target.value)}
									placeholder="e.g., hotcourses.vn, official website"
									disabled={isLoading}
								/>
							</div>

							<div className="space-y-2">
								<Label>Active Status</Label>
								<label className="flex items-center gap-2">
									<input
										type="checkbox"
										checked={isActive}
										onChange={(e) => setIsActive(e.target.checked)}
										disabled={isLoading}
										className="rounded border-input"
									/>
									<span>Scholarship is active</span>
								</label>
							</div>

							<div className="space-y-2 md:col-span-2">
								<Label htmlFor="notes">Internal Notes</Label>
								<textarea
									id="notes"
									value={notes}
									onChange={(e) => setNotes(e.target.value)}
									placeholder="Internal notes, not shown to users"
									disabled={isLoading}
									className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Form Actions */}
				<div className="flex justify-end gap-4">
					<Button
						type="button"
						variant="outline"
						onClick={() => router.back()}
						disabled={isLoading}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						disabled={isLoading || !name || degreeLevels.length === 0}
					>
						{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Create Scholarship
					</Button>
				</div>
			</form>
		</div>
	);
}
