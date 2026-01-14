"use client";

import { ArrowLeft, Loader2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { adminApi } from "@/lib/api/adminApi";
import type {
	CountryOption,
	RegionOption,
	UniversityAdminResponse,
} from "@/lib/types/admin";

// Helper to format enum value to display label (e.g., "computer_science" -> "Computer Science")
const formatEnumLabel = (value: string): string => {
	return value
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
};

export default function NewProgramPage() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Dropdown options from API
	const [prerequisiteMajorOptions, setPrerequisiteMajorOptions] = useState<
		string[]
	>([]);
	const [regionOptions, setRegionOptions] = useState<RegionOption[]>([]);
	const [countryOptions, setCountryOptions] = useState<CountryOption[]>([]);

	// Fetch dropdown options on mount
	useEffect(() => {
		const fetchOptions = async () => {
			try {
				const options = await adminApi.getDropdownOptions();
				setPrerequisiteMajorOptions(options.prerequisiteMajors);
				setRegionOptions(options.regions);
				setCountryOptions(options.countries);
			} catch (err) {
				console.error("Failed to fetch dropdown options:", err);
			}
		};
		fetchOptions();
	}, []);

	const [universityId, setUniversityId] = useState("");
	const [universityDisplay, setUniversityDisplay] = useState("");
	const [name, setName] = useState("");
	const [country, setCountry] = useState("");
	const [degreeType, setDegreeType] = useState("");
	const [degreeName, setDegreeName] = useState("");
	const [durationMonthsMin, setDurationMonthsMin] = useState("");
	const [durationMonthsMax, setDurationMonthsMax] = useState("");
	const [deliveryMode, setDeliveryMode] = useState("");
	const [studyTypes, setStudyTypes] = useState<string[]>(["Full-time"]);
	const [language, setLanguage] = useState("english");
	const [tuitionAnnualUsd, setTuitionAnnualUsd] = useState("");
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
	// New fields
	const [prerequisiteMajors, setPrerequisiteMajors] = useState<string[]>([]);
	const [minWorkExperienceYears, setMinWorkExperienceYears] = useState("");
	const [englishProficiencyRequirement, setEnglishProficiencyRequirement] =
		useState("");
	const [admissionRequirement, setAdmissionRequirement] = useState("");

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

	const handleStudyTypeChange = (type: string, checked: boolean) => {
		if (checked) {
			setStudyTypes([...studyTypes, type]);
		} else {
			setStudyTypes(studyTypes.filter((t) => t !== type));
		}
	};

	const handlePrerequisiteMajorChange = (major: string, checked: boolean) => {
		if (checked) {
			setPrerequisiteMajors([...prerequisiteMajors, major]);
		} else {
			setPrerequisiteMajors(prerequisiteMajors.filter((m) => m !== major));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			await adminApi.createProgram({
				universityId,
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
				tuition: tuitionAnnualUsd
					? { annualUsd: Number.parseInt(tuitionAnnualUsd, 10) }
					: undefined,
				tuitionCurrency: tuitionCurrency || undefined,
				applicationFeeUsd: applicationFeeUsd
					? Number.parseInt(applicationFeeUsd, 10)
					: undefined,
				scholarshipAvailable: scholarshipAvailable === "true",
			requirements:
				gpaMinimum || ieltsMinimum || toeflMinimum || greMinimum || gmatMinimum
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
			setError(err instanceof Error ? err.message : "Failed to create program");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div>
			<PageHeader
				title="Add Program"
				action={
					<Button variant="outline" asChild>
						<Link href="/admin/programs">
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

				<Card>
					<CardHeader>
						<CardTitle>Basic Information</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="universityId">University *</Label>
								<SearchableSelect<UniversityAdminResponse>
									value={universityId}
									onChange={handleUniversityChange}
									searchFn={adminApi.searchUniversities}
									displayFn={(uni) => `${uni.name} - ${uni.country}`}
									getIdFn={(uni) => uni.id}
									placeholder="Search universities..."
									recentStorageKey="leaply-recent-universities"
									disabled={isLoading}
									required
									selectedDisplayValue={universityDisplay}
								/>
							</div>

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
								<Label htmlFor="country">Country</Label>
								<Select
									value={country}
									onValueChange={setCountry}
									disabled={isLoading}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select country">
											{country &&
												countryOptions.find((c) => c.value === country)?.label}
										</SelectValue>
									</SelectTrigger>
									<SelectContent>
										{regionOptions.map((region) => (
											<SelectGroup key={region.value}>
												<SelectLabel>{region.label}</SelectLabel>
												{countryOptions
													.filter((c) => c.region === region.value)
													.map((countryOpt) => (
														<SelectItem
															key={countryOpt.value}
															value={countryOpt.value}
														>
															{countryOpt.label}
														</SelectItem>
													))}
											</SelectGroup>
										))}
									</SelectContent>
								</Select>
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
										<SelectItem value="on-campus">On Campus</SelectItem>
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
								<Label htmlFor="tuitionAnnualUsd">Annual Tuition</Label>
								<Input
									id="tuitionAnnualUsd"
									type="number"
									value={tuitionAnnualUsd}
									onChange={(e) => setTuitionAnnualUsd(e.target.value)}
									disabled={isLoading}
								/>
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
								<Label>Prerequisite Majors</Label>
								<p className="text-sm text-muted-foreground mb-2">
									Select the required undergraduate majors for this program
								</p>
								<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
									{prerequisiteMajorOptions.map((major) => (
										<label
											key={major}
											className="flex items-center gap-2 p-2 rounded border border-input hover:bg-accent cursor-pointer"
										>
											<input
												type="checkbox"
												checked={prerequisiteMajors.includes(major)}
												onChange={(e) =>
													handlePrerequisiteMajorChange(major, e.target.checked)
												}
												disabled={isLoading}
												className="rounded border-input"
											/>
											<span className="text-sm">{formatEnumLabel(major)}</span>
										</label>
									))}
								</div>
								{prerequisiteMajors.length > 0 && (
									<p className="text-sm text-muted-foreground mt-2">
										Selected:{" "}
										{prerequisiteMajors.map(formatEnumLabel).join(", ")}
									</p>
								)}
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
								<Label htmlFor="admissionRequirement">
									Other Admission Requirements
								</Label>
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
					<Button
						type="submit"
						disabled={
							isLoading ||
							!universityId ||
							!degreeType ||
							studyTypes.length === 0
						}
					>
						{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Create Program
					</Button>
				</div>
			</form>
		</div>
	);
}
