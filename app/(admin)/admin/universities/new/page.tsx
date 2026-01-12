"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
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
import type { CountryOption, RegionOption } from "@/lib/types/admin";

export default function NewUniversityPage() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Dropdown options
	const [regionOptions, setRegionOptions] = useState<RegionOption[]>([]);
	const [countryOptions, setCountryOptions] = useState<CountryOption[]>([]);

	// Fetch dropdown options on mount
	useEffect(() => {
		const fetchOptions = async () => {
			try {
				const options = await adminApi.getDropdownOptions();
				setRegionOptions(options.regions);
				setCountryOptions(options.countries);
			} catch (err) {
				console.error("Failed to fetch dropdown options:", err);
			}
		};
		fetchOptions();
	}, []);

	const [name, setName] = useState("");
	const [nameLocal, setNameLocal] = useState("");
	const [country, setCountry] = useState("");
	const [city, setCity] = useState("");
	const [region, setRegion] = useState("");
	const [type, setType] = useState("");
	// Ranking ranges (min/max for QS and Times)
	const [rankingQsMin, setRankingQsMin] = useState("");
	const [rankingQsMax, setRankingQsMax] = useState("");
	const [rankingTimesMin, setRankingTimesMin] = useState("");
	const [rankingTimesMax, setRankingTimesMax] = useState("");
	const [rankingNational, setRankingNational] = useState("");
	const [primaryLanguage, setPrimaryLanguage] = useState("english");
	const [logoUrl, setLogoUrl] = useState("");
	const [websiteUrl, setWebsiteUrl] = useState("");
	const [description, setDescription] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			await adminApi.createUniversity({
				name,
				nameLocal: nameLocal || undefined,
				country,
				city: city || undefined,
				region: region || undefined,
				type: type || undefined,
				// Ranking ranges - if only min is provided, set max = min (exact value)
				rankingQsMin: rankingQsMin
					? Number.parseInt(rankingQsMin, 10)
					: undefined,
				rankingQsMax: rankingQsMax
					? Number.parseInt(rankingQsMax, 10)
					: rankingQsMin
						? Number.parseInt(rankingQsMin, 10)
						: undefined,
				rankingTimesMin: rankingTimesMin
					? Number.parseInt(rankingTimesMin, 10)
					: undefined,
				rankingTimesMax: rankingTimesMax
					? Number.parseInt(rankingTimesMax, 10)
					: rankingTimesMin
						? Number.parseInt(rankingTimesMin, 10)
						: undefined,
				rankingNational: rankingNational
					? Number.parseInt(rankingNational, 10)
					: undefined,
				primaryLanguage: primaryLanguage || undefined,
				logoUrl: logoUrl || undefined,
				websiteUrl: websiteUrl || undefined,
				description: description || undefined,
			});
			router.push("/admin/universities");
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to create university",
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div>
			<PageHeader
				title="Add University"
				action={
					<Button variant="outline" asChild>
						<Link href="/admin/universities">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back
						</Link>
					</Button>
				}
			/>

			<Card>
				<CardHeader>
					<CardTitle>University Details</CardTitle>
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
								<Label htmlFor="name">University Name *</Label>
								<Input
									id="name"
									value={name}
									onChange={(e) => setName(e.target.value)}
									required
									disabled={isLoading}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="nameLocal">Local Name</Label>
								<Input
									id="nameLocal"
									value={nameLocal}
									onChange={(e) => setNameLocal(e.target.value)}
									disabled={isLoading}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="region">Region *</Label>
								<Select
									value={region}
									onValueChange={(val) => {
										setRegion(val);
										setCountry(""); // Reset country when region changes
									}}
									disabled={isLoading}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select region">
											{region &&
												regionOptions.find((r) => r.value === region)?.label}
										</SelectValue>
									</SelectTrigger>
									<SelectContent>
										{regionOptions.map((r) => (
											<SelectItem key={r.value} value={r.value}>
												{r.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="country">Country *</Label>
								<Select
									value={country}
									onValueChange={setCountry}
									disabled={isLoading || !region}
								>
									<SelectTrigger>
										<SelectValue
											placeholder={
												region ? "Select country" : "Select region first"
											}
										>
											{country &&
												countryOptions.find((c) => c.value === country)?.label}
										</SelectValue>
									</SelectTrigger>
									<SelectContent>
										{countryOptions
											.filter((c) => c.region === region)
											.map((c) => (
												<SelectItem key={c.value} value={c.value}>
													{c.label}
												</SelectItem>
											))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="city">City</Label>
								<Input
									id="city"
									value={city}
									onChange={(e) => setCity(e.target.value)}
									disabled={isLoading}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="type">Type</Label>
								<Select
									value={type}
									onValueChange={setType}
									disabled={isLoading}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="public">Public</SelectItem>
										<SelectItem value="private">Private</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2 md:col-span-2">
								<Label>QS World Ranking</Label>
								<div className="flex gap-2 items-center">
									<Input
										id="rankingQsMin"
										type="number"
										placeholder="Min (or exact)"
										value={rankingQsMin}
										onChange={(e) => setRankingQsMin(e.target.value)}
										disabled={isLoading}
										className="flex-1"
									/>
									<span className="text-muted-foreground">to</span>
									<Input
										id="rankingQsMax"
										type="number"
										placeholder="Max (optional)"
										value={rankingQsMax}
										onChange={(e) => setRankingQsMax(e.target.value)}
										disabled={isLoading}
										className="flex-1"
									/>
								</div>
								<p className="text-xs text-muted-foreground">
									Enter exact rank or range (e.g., 501-600)
								</p>
							</div>

							<div className="space-y-2 md:col-span-2">
								<Label>Times Higher Ed Ranking</Label>
								<div className="flex gap-2 items-center">
									<Input
										id="rankingTimesMin"
										type="number"
										placeholder="Min (or exact)"
										value={rankingTimesMin}
										onChange={(e) => setRankingTimesMin(e.target.value)}
										disabled={isLoading}
										className="flex-1"
									/>
									<span className="text-muted-foreground">to</span>
									<Input
										id="rankingTimesMax"
										type="number"
										placeholder="Max (optional)"
										value={rankingTimesMax}
										onChange={(e) => setRankingTimesMax(e.target.value)}
										disabled={isLoading}
										className="flex-1"
									/>
								</div>
								<p className="text-xs text-muted-foreground">
									Enter exact rank or range (e.g., 501-600)
								</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="rankingNational">National Ranking</Label>
								<Input
									id="rankingNational"
									type="number"
									value={rankingNational}
									onChange={(e) => setRankingNational(e.target.value)}
									disabled={isLoading}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="primaryLanguage">Primary Language</Label>
								<Select
									value={primaryLanguage}
									onValueChange={setPrimaryLanguage}
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
										<SelectItem value="chinese">Chinese</SelectItem>
										<SelectItem value="japanese">Japanese</SelectItem>
										<SelectItem value="korean">Korean</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label>Logo</Label>
								<ImageUpload
									value={logoUrl}
									onChange={(url) => setLogoUrl(url || "")}
									onUpload={async (file) => {
										const result = await adminApi.uploadUniversityLogo(file);
										return result.logoUrl;
									}}
									disabled={isLoading}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="websiteUrl">Website URL</Label>
								<Input
									id="websiteUrl"
									type="url"
									value={websiteUrl}
									onChange={(e) => setWebsiteUrl(e.target.value)}
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
								Create University
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
