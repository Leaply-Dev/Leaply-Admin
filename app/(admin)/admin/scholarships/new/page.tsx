"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { adminApi } from "@/lib/api/adminApi";
import type {
    ScholarshipCoverageDuration,
    ScholarshipCoverageType,
    ScholarshipDegreeLevel,
    ScholarshipEligibilityFocus,
    ScholarshipEligibilityType,
    ScholarshipSourceType,
    RequiredDocument,
    UniversityAdminResponse,
} from "@/lib/types/admin";

const MAJOR_CATEGORIES = [
    "Computer Science/IT",
    "Business",
    "Engineering",
    "Finance",
    "Data Science",
    "Design",
    "Public Health",
    "Other",
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
    const [universities, setUniversities] = useState<UniversityAdminResponse[]>([]);

    // Basic Info
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [description, setDescription] = useState("");
    const [sourceType, setSourceType] = useState<ScholarshipSourceType>("university");
    const [sourceName, setSourceName] = useState("");
    const [universityId, setUniversityId] = useState("");
    const [country, setCountry] = useState("");

    // Target & Scope
    const [degreeLevels, setDegreeLevels] = useState<ScholarshipDegreeLevel[]>(["master"]);
    const [allFieldsEligible, setAllFieldsEligible] = useState(true);
    const [eligibleFields, setEligibleFields] = useState<string[]>([]);

    // Coverage & Benefits
    const [coverageType, setCoverageType] = useState<ScholarshipCoverageType>("full_funded");
    const [coverageDuration, setCoverageDuration] = useState<ScholarshipCoverageDuration>("full_program");
    const [coveragePercentage, setCoveragePercentage] = useState("");
    const [coverageAmount, setCoverageAmount] = useState("");
    const [coverageCurrency, setCoverageCurrency] = useState("USD");

    // Eligibility & Requirements
    const [eligibilityType, setEligibilityType] = useState<ScholarshipEligibilityType>("merit");
    const [eligibilityFocus, setEligibilityFocus] = useState<ScholarshipEligibilityFocus | "">("academic");
    const [minGpa, setMinGpa] = useState("");
    const [gpaScale, setGpaScale] = useState("4.0");
    const [minIelts, setMinIelts] = useState("");
    const [minToefl, setMinToefl] = useState("");
    const [workExperienceRequired, setWorkExperienceRequired] = useState(false);
    const [minWorkExperienceYears, setMinWorkExperienceYears] = useState("");
    const [requiredDocuments, setRequiredDocuments] = useState<RequiredDocument[]>([]);

    // Timeline
    const [applicationOpenDate, setApplicationOpenDate] = useState("");
    const [applicationDeadline, setApplicationDeadline] = useState("");

    // Admin Notes
    const [dataSource, setDataSource] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [notes, setNotes] = useState("");

    useEffect(() => {
        const fetchUniversities = async () => {
            try {
                const data = await adminApi.getUniversities({ size: 100 });
                setUniversities(data.content);
            } catch (err) {
                console.error("Failed to fetch universities:", err);
            }
        };
        fetchUniversities();
    }, []);

    // Auto-fill country when university is selected
    useEffect(() => {
        if (universityId) {
            const uni = universities.find((u) => u.id === universityId);
            if (uni) {
                setCountry(uni.country);
            }
        }
    }, [universityId, universities]);

    const handleDegreeLevelChange = (level: ScholarshipDegreeLevel, checked: boolean) => {
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
                country: country || undefined,
                sourceType,
                sourceName: sourceName || undefined,
                degreeLevels,
                eligibleFields: allFieldsEligible ? undefined : eligibleFields,
                coverageType,
                coverageDuration,
                coveragePercentage: coveragePercentage ? Number(coveragePercentage) : undefined,
                coverageAmount: coverageAmount ? Number(coverageAmount) : undefined,
                coverageCurrency,
                eligibilityType,
                eligibilityFocus: eligibilityFocus || undefined,
                minGpa: minGpa ? Number(minGpa) : undefined,
                gpaScale: Number(gpaScale),
                minIelts: minIelts ? Number(minIelts) : undefined,
                minToefl: minToefl ? Number(minToefl) : undefined,
                workExperienceRequired,
                minWorkExperienceYears: minWorkExperienceYears
                    ? Number(minWorkExperienceYears)
                    : undefined,
                requiredDocuments: requiredDocuments.length > 0 ? requiredDocuments : undefined,
                applicationOpenDate: applicationOpenDate || undefined,
                applicationDeadline: applicationDeadline || undefined,
                isActive,
                dataSource: dataSource || undefined,
                notes: notes || undefined,
            });
            router.push("/admin/scholarships");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create scholarship");
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
                                    onValueChange={(v) => setSourceType(v as ScholarshipSourceType)}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="university">University</SelectItem>
                                        <SelectItem value="government">Government</SelectItem>
                                        <SelectItem value="foundation">Foundation/NGO</SelectItem>
                                        <SelectItem value="corporate">Corporate</SelectItem>
                                        <SelectItem value="bilateral">Bilateral Agreement</SelectItem>
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
                                <Select
                                    value={universityId}
                                    onValueChange={setUniversityId}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select university" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {universities.map((uni) => (
                                            <SelectItem key={uni.id} value={uni.id}>
                                                {uni.name} - {uni.country}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="country">Country *</Label>
                                <Input
                                    id="country"
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    required
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
                                        {MAJOR_CATEGORIES.map((field) => (
                                            <label key={field} className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={eligibleFields.includes(field)}
                                                    onChange={(e) =>
                                                        handleEligibleFieldChange(field, e.target.checked)
                                                    }
                                                    disabled={isLoading}
                                                    className="rounded border-input"
                                                />
                                                <span className="text-sm">{field}</span>
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
                                    onValueChange={(v) => setCoverageType(v as ScholarshipCoverageType)}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="full_funded">
                                            Full Funded (Tuition + Living)
                                        </SelectItem>
                                        <SelectItem value="full_tuition">Full Tuition Only</SelectItem>
                                        <SelectItem value="partial_tuition">Partial Tuition</SelectItem>
                                        <SelectItem value="stipend_only">Stipend Only</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
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
                                    </SelectContent>
                                </Select>
                            </div>

                            {coverageType === "partial_tuition" && (
                                <div className="space-y-2">
                                    <Label htmlFor="coveragePercentage">Coverage Percentage</Label>
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
                                <Label htmlFor="coverageAmount">Coverage Amount</Label>
                                <Input
                                    id="coverageAmount"
                                    type="number"
                                    value={coverageAmount}
                                    onChange={(e) => setCoverageAmount(e.target.value)}
                                    disabled={isLoading}
                                />
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
                                        <SelectItem value="SGD">SGD</SelectItem>
                                        <SelectItem value="VND">VND</SelectItem>
                                    </SelectContent>
                                </Select>
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
                                        <SelectItem value="hybrid">Hybrid</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {(eligibilityType === "merit" || eligibilityType === "hybrid") && (
                                <div className="space-y-2">
                                    <Label htmlFor="eligibilityFocus">Eligibility Focus</Label>
                                    <Select
                                        value={eligibilityFocus}
                                        onValueChange={(v) =>
                                            setEligibilityFocus(v as ScholarshipEligibilityFocus)
                                        }
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select focus" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="academic">Academic Excellence</SelectItem>
                                            <SelectItem value="holistic">Holistic Review</SelectItem>
                                            <SelectItem value="leadership">Leadership</SelectItem>
                                            <SelectItem value="research">Research</SelectItem>
                                            <SelectItem value="community_service">
                                                Community Service
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
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

                            <div className="space-y-2 md:col-span-2">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={workExperienceRequired}
                                        onChange={(e) => setWorkExperienceRequired(e.target.checked)}
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
                                            onChange={(e) => setMinWorkExperienceYears(e.target.value)}
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
                                <Label htmlFor="applicationDeadline">Application Deadline</Label>
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
