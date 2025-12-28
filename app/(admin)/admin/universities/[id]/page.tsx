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

export default function EditUniversityPage() {
	const params = useParams();
	const router = useRouter();
	const id = params.id as string;

	const [isLoadingData, setIsLoadingData] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [name, setName] = useState("");
	const [nameLocal, setNameLocal] = useState("");
	const [country, setCountry] = useState("");
	const [city, setCity] = useState("");
	const [region, setRegion] = useState("");
	const [type, setType] = useState("");
	const [rankingQs, setRankingQs] = useState("");
	const [rankingTimes, setRankingTimes] = useState("");
	const [rankingNational, setRankingNational] = useState("");
	const [primaryLanguage, setPrimaryLanguage] = useState("english");
	const [logoUrl, setLogoUrl] = useState("");
	const [websiteUrl, setWebsiteUrl] = useState("");
	const [description, setDescription] = useState("");

	useEffect(() => {
		const fetchUniversity = async () => {
			try {
				const data = await adminApi.getUniversity(id);
				setName(data.name);
				setNameLocal(data.nameLocal || "");
				setCountry(data.country);
				setCity(data.city || "");
				setRegion(data.region || "");
				setType(data.type || "");
				setRankingQs(data.rankingQs?.toString() || "");
				setRankingTimes(data.rankingTimes?.toString() || "");
				setRankingNational(data.rankingNational?.toString() || "");
				setPrimaryLanguage(data.primaryLanguage || "english");
				setLogoUrl(data.logoUrl || "");
				setWebsiteUrl(data.websiteUrl || "");
				setDescription(data.description || "");
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Failed to load university",
				);
			} finally {
				setIsLoadingData(false);
			}
		};
		fetchUniversity();
	}, [id]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			await adminApi.updateUniversity(id, {
				name,
				nameLocal: nameLocal || undefined,
				country,
				city: city || undefined,
				region: region || undefined,
				type: type || undefined,
				rankingQs: rankingQs ? Number.parseInt(rankingQs, 10) : undefined,
				rankingTimes: rankingTimes
					? Number.parseInt(rankingTimes, 10)
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
				err instanceof Error ? err.message : "Failed to update university",
			);
		} finally {
			setIsLoading(false);
		}
	};

	if (isLoadingData) {
		return (
			<div>
				<PageHeader
					title="Edit University"
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
				title="Edit University"
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
								<Label htmlFor="country">Country *</Label>
								<Input
									id="country"
									value={country}
									onChange={(e) => setCountry(e.target.value)}
									required
									disabled={isLoading}
								/>
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
								<Label htmlFor="region">Region</Label>
								<Input
									id="region"
									value={region}
									onChange={(e) => setRegion(e.target.value)}
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

							<div className="space-y-2">
								<Label htmlFor="rankingQs">QS World Ranking</Label>
								<Input
									id="rankingQs"
									type="number"
									value={rankingQs}
									onChange={(e) => setRankingQs(e.target.value)}
									disabled={isLoading}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="rankingTimes">Times Higher Ed Ranking</Label>
								<Input
									id="rankingTimes"
									type="number"
									value={rankingTimes}
									onChange={(e) => setRankingTimes(e.target.value)}
									disabled={isLoading}
								/>
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
								<Label htmlFor="logoUrl">Logo URL</Label>
								<Input
									id="logoUrl"
									type="url"
									value={logoUrl}
									onChange={(e) => setLogoUrl(e.target.value)}
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
								Update University
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
