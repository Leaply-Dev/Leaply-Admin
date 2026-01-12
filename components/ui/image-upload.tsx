"use client";

import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

interface ImageUploadProps {
	value?: string;
	onChange: (url: string | undefined) => void;
	onUpload: (file: File) => Promise<string>;
	disabled?: boolean;
	className?: string;
}

export function ImageUpload({
	value,
	onChange,
	onUpload,
	disabled,
	className,
}: ImageUploadProps) {
	const [isUploading, setIsUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isDragOver, setIsDragOver] = useState(false);

	const validateFile = (file: File): string | null => {
		if (!ALLOWED_TYPES.includes(file.type)) {
			return "Invalid file type. Allowed: JPG, PNG, WebP";
		}
		if (file.size > MAX_SIZE) {
			return "File size must not exceed 2MB";
		}
		return null;
	};

	const handleFile = useCallback(
		async (file: File) => {
			const validationError = validateFile(file);
			if (validationError) {
				setError(validationError);
				return;
			}

			setError(null);
			setIsUploading(true);

			try {
				const url = await onUpload(file);
				onChange(url);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to upload");
			} finally {
				setIsUploading(false);
			}
		},
		[onUpload, onChange],
	);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setIsDragOver(false);

			if (disabled || isUploading) return;

			const file = e.dataTransfer.files[0];
			if (file) {
				handleFile(file);
			}
		},
		[disabled, isUploading, handleFile],
	);

	const handleDragOver = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			if (!disabled && !isUploading) {
				setIsDragOver(true);
			}
		},
		[disabled, isUploading],
	);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
	}, []);

	const handleFileSelect = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file) {
				handleFile(file);
			}
			// Reset input so same file can be selected again
			e.target.value = "";
		},
		[handleFile],
	);

	const handleRemove = useCallback(() => {
		onChange(undefined);
		setError(null);
	}, [onChange]);

	return (
		<div className={cn("space-y-2", className)}>
			{value ? (
				<div className="relative inline-block">
					<div className="relative h-24 w-24 rounded-md border overflow-hidden bg-muted">
						<Image
							src={value}
							alt="Uploaded logo"
							fill
							className="object-contain"
							unoptimized
						/>
					</div>
					{!disabled && (
						<Button
							type="button"
							variant="destructive"
							size="icon"
							className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
							onClick={handleRemove}
						>
							<X className="h-3 w-3" />
						</Button>
					)}
				</div>
			) : (
				<div
					onDrop={handleDrop}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					className={cn(
						"flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-6 transition-colors",
						isDragOver && "border-primary bg-primary/5",
						disabled && "opacity-50 cursor-not-allowed",
						!disabled &&
							!isUploading &&
							"cursor-pointer hover:border-primary/50",
					)}
					onClick={() => {
						if (!disabled && !isUploading) {
							document.getElementById("logo-upload-input")?.click();
						}
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							if (!disabled && !isUploading) {
								document.getElementById("logo-upload-input")?.click();
							}
						}
					}}
				>
					<input
						id="logo-upload-input"
						type="file"
						accept=".jpg,.jpeg,.png,.webp"
						onChange={handleFileSelect}
						disabled={disabled || isUploading}
						className="sr-only"
					/>
					{isUploading ? (
						<>
							<Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
							<span className="text-sm text-muted-foreground">
								Uploading...
							</span>
						</>
					) : (
						<>
							<div className="flex items-center justify-center h-12 w-12 rounded-full bg-muted">
								<ImageIcon className="h-6 w-6 text-muted-foreground" />
							</div>
							<div className="text-center">
								<p className="text-sm font-medium">
									<Upload className="inline h-4 w-4 mr-1" />
									Click to upload or drag & drop
								</p>
								<p className="text-xs text-muted-foreground mt-1">
									JPG, PNG, WebP (max 2MB)
								</p>
							</div>
						</>
					)}
				</div>
			)}
			{error && <p className="text-sm text-destructive">{error}</p>}
		</div>
	);
}
