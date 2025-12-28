"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminApi } from "@/lib/api/adminApi";
import { useAuthStore } from "@/lib/store/authStore";

export default function LoginPage() {
	const router = useRouter();
	const { login } = useAuthStore();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			const response = await adminApi.login({ email, password });

			// Check if user has admin role
			if (response.role !== "data_admin" && response.role !== "super_admin") {
				setError(
					"You don't have admin access. Please contact an administrator.",
				);
				setIsLoading(false);
				return;
			}

			// Login successful
			login(
				{
					id: response.userId,
					email: response.email,
					fullName: "",
					role: response.role,
				},
				response.token,
			);

			router.push("/admin/universities");
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Invalid email or password",
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="flex justify-center mb-4">
						<Image
							src="/Logo.png"
							alt="Leaply"
							width={120}
							height={40}
							priority
						/>
					</div>
					<CardTitle className="text-2xl">Admin Login</CardTitle>
					<p className="text-muted-foreground text-sm">
						Sign in to access the admin dashboard
					</p>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						{error && (
							<div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
								{error}
							</div>
						)}

						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="admin@leaply.ai"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								disabled={isLoading}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								disabled={isLoading}
							/>
						</div>

						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Sign In
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
