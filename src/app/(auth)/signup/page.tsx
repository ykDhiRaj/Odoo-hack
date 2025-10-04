"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Country {
    code: string;
    name: string;
    currency: string;
    currencySymbol: string;
}

interface RawCountry {
    name: {
        common: string;
    };
    cca2: string;
    currencies?: Record<string, {
        name: string;
        symbol?: string;
    }>;
}

const ITEMS_PER_PAGE = 20;

const SignupPage = () => {
    const [allCountries, setAllCountries] = useState<Country[]>([]);
    const [displayedCountries, setDisplayedCountries] = useState<Country[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    useEffect(() => {
        fetchCountries();
    }, []);

    const fetchCountries = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch("https://restcountries.com/v3.1/independent?status=true", {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            const processedCountries: Country[] = data
                .map((country: RawCountry) => {
                    const currencies = country.currencies
                        ? Object.entries(country.currencies)[0]
                        : null;
                    const currencyCode = currencies ? currencies[0] : "N/A";
                    const currencyInfo = currencies ? currencies[1] : { name: "", symbol: "" };

                    return {
                        code: country.cca2,
                        name: country.name.common,
                        currency: currencyCode,
                        currencySymbol: currencyInfo.symbol || "",
                    };
                })
                .filter((country: Country) => country.code && country.name)
                .sort((a: Country, b: Country) => a.name.localeCompare(b.name));

            setAllCountries(processedCountries);
            setDisplayedCountries(processedCountries.slice(0, ITEMS_PER_PAGE));
            setLoading(false);
        } catch (err) {
            console.error("Error fetching countries:", err);
            setError("Failed to load countries. Please try again.");
            setLoading(false);
        }
    };

    // Filter countries based on search query
    const filteredCountries = useMemo(() => {
        if (!searchQuery) {
            return displayedCountries;
        }
        // When searching, show all matching countries
        return allCountries.filter((country) =>
            country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            country.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            country.currency.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [allCountries, displayedCountries, searchQuery]);

    // Handle scroll to load more countries
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement;
        const bottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;

        if (bottom && !isLoadingMore && !searchQuery && visibleCount < allCountries.length) {
            setIsLoadingMore(true);

            // Simulate a slight delay for better UX
            setTimeout(() => {
                const newCount = Math.min(visibleCount + ITEMS_PER_PAGE, allCountries.length);
                setVisibleCount(newCount);
                setDisplayedCountries(allCountries.slice(0, newCount));
                setIsLoadingMore(false);
            }, 300);
        }
    }, [isLoadingMore, searchQuery, visibleCount, allCountries]);

    const selectedCountryData = allCountries.find((c) => c.code === selectedCountry);

    const retryFetch = () => {
        setError(null);
        fetchCountries();
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle>Signup</CardTitle>
                    <CardDescription>
                        Enter your information to create an account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" placeholder="Enter your name" />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" placeholder="Enter your email" type="email" />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    placeholder="Enter your password"
                                    type="password"
                                />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="confirm-password">Confirm Password</Label>
                                <Input
                                    id="confirm-password"
                                    placeholder="Confirm your password"
                                    type="password"
                                />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="country">Country</Label>
                                {error && (
                                    <div className="flex items-center justify-between gap-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="h-3 w-3" />
                                            <span>{error}</span>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={retryFetch}
                                            className="h-6 px-2 text-xs"
                                        >
                                            Retry
                                        </Button>
                                    </div>
                                )}
                                <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={open}
                                            className="w-full justify-between"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Loading countries...
                                                </>
                                            ) : selectedCountryData ? (
                                                <span className="truncate">
                                                    {selectedCountryData.name} ({selectedCountryData.currency}
                                                    {selectedCountryData.currencySymbol && ` ${selectedCountryData.currencySymbol}`})
                                                </span>
                                            ) : (
                                                "Select country..."
                                            )}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[350px] p-0">
                                        <Command>
                                            <CommandInput
                                                placeholder="Search country..."
                                                value={searchQuery}
                                                onValueChange={setSearchQuery}
                                            />
                                            <CommandEmpty>No country found.</CommandEmpty>
                                            <CommandGroup
                                                ref={scrollRef}
                                                className="max-h-[300px] overflow-auto"
                                                onScroll={handleScroll}
                                            >
                                                {filteredCountries.map((country) => (
                                                    <CommandItem
                                                        key={country.code}
                                                        value={country.name}
                                                        onSelect={() => {
                                                            setSelectedCountry(country.code);
                                                            setOpen(false);
                                                            setSearchQuery("");
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedCountry === country.code
                                                                    ? "opacity-100"
                                                                    : "opacity-0"
                                                            )}
                                                        />
                                                        <span className="flex-1 truncate">
                                                            {country.name}
                                                        </span>
                                                        <span className="text-xs text-gray-500 ml-2">
                                                            {country.currency}
                                                            {country.currencySymbol && ` ${country.currencySymbol}`}
                                                        </span>
                                                    </CommandItem>
                                                ))}
                                                {isLoadingMore && (
                                                    <div className="flex items-center justify-center py-2">
                                                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                                        <span className="ml-2 text-xs text-gray-500">Loading more...</span>
                                                    </div>
                                                )}
                                            </CommandGroup>
                                            {!searchQuery && displayedCountries.length < allCountries.length && (
                                                <div className="p-2 text-xs text-center text-gray-500 border-t">
                                                    Showing {displayedCountries.length} of {allCountries.length} countries - Scroll for more
                                                </div>
                                            )}
                                            {searchQuery && (
                                                <div className="p-2 text-xs text-center text-gray-500 border-t">
                                                    Found {filteredCountries.length} countries
                                                </div>
                                            )}
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 pt-6">
                    <Button className="w-full h-11 text-base font-semibold">
                        Create Account
                    </Button>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-muted-foreground">
                                Or
                            </span>
                        </div>
                    </div>
                    <p className="text-sm text-center text-muted-foreground">
                        Already have an account?{" "}
                        <Link
                            href="/signin"
                            className="font-medium text-primary underline-offset-4 hover:underline"
                        >
                            Sign in
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default SignupPage;