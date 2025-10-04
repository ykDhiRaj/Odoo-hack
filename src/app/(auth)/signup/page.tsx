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

    // Form states
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

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

    const filteredCountries = useMemo(() => {
        if (!searchQuery) {
            return displayedCountries;
        }
        return allCountries.filter((country) =>
            country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            country.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            country.currency.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [allCountries, displayedCountries, searchQuery]);

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement;
        const bottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;

        if (bottom && !isLoadingMore && !searchQuery && visibleCount < allCountries.length) {
            setIsLoadingMore(true);

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

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setSubmitError(null);
        setSubmitSuccess(false);

        // Validation
        if (!name || !email || !password || !confirmPassword || !selectedCountry) {
            setSubmitError("Please fill in all fields");
            return;
        }

        if (password !== confirmPassword) {
            setSubmitError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setSubmitError("Password must be at least 6 characters long");
            return;
        }

        setIsSubmitting(true);

        try {
            const selectedCountryData = allCountries.find(c => c.code === selectedCountry);

            // First create company
            const companyResponse = await fetch('/api/companies', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: `${name}'s Company`,
                    country: selectedCountryData?.name || selectedCountry,
                    currency: selectedCountryData?.currency || 'USD',
                }),
            });

            const companyData = await companyResponse.json();

            if (!companyResponse.ok) {
                throw new Error(companyData.error || 'Failed to create company');
            }

            // Then create user as admin
            const userResponse = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    firstName: name.split(' ')[0] || name,
                    lastName: name.split(' ').slice(1).join(' ') || '',
                    companyId: companyData.company.id,
                    role: 'admin',
                }),
            });

            const userData = await userResponse.json();

            if (!userResponse.ok) {
                throw new Error(userData.error || 'Failed to create user');
            }

            setSubmitSuccess(true);
            // Reset form
            setName("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            setSelectedCountry("");

        } catch (err: unknown) {
            console.error("Error creating account:", err);
            const errorMessage = err instanceof Error ? err.message : "Failed to create account. Please try again.";
            setSubmitError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
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
                    <div>
                        <div className="grid w-full items-center gap-4">
                            {submitError && (
                                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                                    <AlertCircle className="h-3 w-3" />
                                    <span>{submitError}</span>
                                </div>
                            )}
                            {submitSuccess && (
                                <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                                    <Check className="h-3 w-3" />
                                    <span>Account created successfully!</span>
                                </div>
                            )}
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    placeholder="Enter your email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    placeholder="Enter your password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="confirm-password">Confirm Password</Label>
                                <Input
                                    id="confirm-password"
                                    placeholder="Confirm your password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 pt-6">
                    <Button
                        className="w-full h-11 text-base font-semibold"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating Account...
                            </>
                        ) : (
                            "Create Account"
                        )}
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