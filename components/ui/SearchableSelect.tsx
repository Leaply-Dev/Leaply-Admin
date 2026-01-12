"use client";

import { ChevronDown, Loader2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface SearchableSelectProps<T> {
	value: string;
	onChange: (id: string, item?: T) => void;
	searchFn: (query: string) => Promise<T[]>;
	displayFn: (item: T) => string;
	getIdFn: (item: T) => string;
	placeholder?: string;
	recentStorageKey?: string;
	disabled?: boolean;
	required?: boolean;
	selectedDisplayValue?: string;
}

const DEBOUNCE_MS = 300;
const MAX_RECENT = 5;
const MIN_SEARCH_LENGTH = 2;

export function SearchableSelect<T>({
	value,
	onChange,
	searchFn,
	displayFn,
	getIdFn,
	placeholder = "Search...",
	recentStorageKey,
	disabled = false,
	required = false,
	selectedDisplayValue,
}: SearchableSelectProps<T>) {
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [results, setResults] = useState<T[]>([]);
	const [recentItems, setRecentItems] = useState<T[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [displayValue, setDisplayValue] = useState(selectedDisplayValue || "");

	const containerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const debounceRef = useRef<NodeJS.Timeout | null>(null);

	// Load recent items from localStorage
	useEffect(() => {
		if (recentStorageKey && typeof window !== "undefined") {
			try {
				const stored = localStorage.getItem(recentStorageKey);
				if (stored) {
					setRecentItems(JSON.parse(stored));
				}
			} catch {
				// Ignore localStorage errors
			}
		}
	}, [recentStorageKey]);

	// Update display value when selectedDisplayValue changes
	useEffect(() => {
		if (selectedDisplayValue) {
			setDisplayValue(selectedDisplayValue);
		}
	}, [selectedDisplayValue]);

	// Save recent item
	const saveRecentItem = useCallback(
		(item: T) => {
			if (!recentStorageKey) return;

			const itemId = getIdFn(item);
			const newRecent = [
				item,
				...recentItems.filter((r) => getIdFn(r) !== itemId),
			].slice(0, MAX_RECENT);

			setRecentItems(newRecent);

			try {
				localStorage.setItem(recentStorageKey, JSON.stringify(newRecent));
			} catch {
				// Ignore localStorage errors
			}
		},
		[recentStorageKey, recentItems, getIdFn],
	);

	// Search with debounce
	const handleSearch = useCallback(
		async (query: string) => {
			if (query.length < MIN_SEARCH_LENGTH) {
				setResults([]);
				return;
			}

			setIsLoading(true);
			try {
				const data = await searchFn(query);
				setResults(data);
			} catch {
				setResults([]);
			} finally {
				setIsLoading(false);
			}
		},
		[searchFn],
	);

	// Handle input change with debounce
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const query = e.target.value;
		setSearchQuery(query);
		setDisplayValue(query);

		if (debounceRef.current) {
			clearTimeout(debounceRef.current);
		}

		debounceRef.current = setTimeout(() => {
			handleSearch(query);
		}, DEBOUNCE_MS);
	};

	// Handle item selection
	const handleSelect = (item: T) => {
		const id = getIdFn(item);
		const display = displayFn(item);

		onChange(id, item);
		setDisplayValue(display);
		setSearchQuery("");
		setResults([]);
		setIsOpen(false);
		saveRecentItem(item);
	};

	// Handle clear
	const handleClear = () => {
		onChange("", undefined);
		setDisplayValue("");
		setSearchQuery("");
		setResults([]);
		inputRef.current?.focus();
	};

	// Handle click outside
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				setIsOpen(false);
				setSearchQuery("");
				setResults([]);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Handle keyboard navigation
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Escape") {
			setIsOpen(false);
			setSearchQuery("");
			setResults([]);
		}
	};

	// Items to show in dropdown
	const showItems =
		searchQuery.length >= MIN_SEARCH_LENGTH ? results : recentItems;
	const showRecentsLabel =
		searchQuery.length < MIN_SEARCH_LENGTH && recentItems.length > 0;

	return (
		<div ref={containerRef} className="relative">
			<div className="relative">
				<input
					ref={inputRef}
					type="text"
					value={isOpen ? searchQuery || displayValue : displayValue}
					onChange={handleInputChange}
					onFocus={() => setIsOpen(true)}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					disabled={disabled}
					required={required && !value}
					className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-16 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				/>
				<div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
					{isLoading && (
						<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
					)}
					{value && !disabled && (
						<button
							type="button"
							onClick={handleClear}
							className="p-1 hover:bg-muted rounded"
						>
							<X className="h-4 w-4 text-muted-foreground" />
						</button>
					)}
					<ChevronDown className="h-4 w-4 text-muted-foreground" />
				</div>
			</div>

			{isOpen && (
				<div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
					{searchQuery.length > 0 && searchQuery.length < MIN_SEARCH_LENGTH && (
						<div className="p-3 text-sm text-muted-foreground">
							Type at least {MIN_SEARCH_LENGTH} characters to search...
						</div>
					)}

					{showRecentsLabel && (
						<div className="px-3 py-2 text-xs text-muted-foreground border-b">
							Recent selections
						</div>
					)}

					{showItems.length > 0 ? (
						<ul className="max-h-60 overflow-auto py-1">
							{showItems.map((item) => (
								<li key={getIdFn(item)}>
									<button
										type="button"
										onClick={() => handleSelect(item)}
										className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
									>
										{displayFn(item)}
									</button>
								</li>
							))}
						</ul>
					) : (
						searchQuery.length >= MIN_SEARCH_LENGTH &&
						!isLoading && (
							<div className="p-3 text-sm text-muted-foreground">
								No results found
							</div>
						)
					)}
				</div>
			)}
		</div>
	);
}
