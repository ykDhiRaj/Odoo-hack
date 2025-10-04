"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
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

interface Currency {
    code: string;
    name: string;
    symbol: string;
}

interface CountryCurrency {
    name: string;
    symbol?: string;
}

interface RawCountry {
    name: {
        common: string;
    };
    cca2: string;
    currencies?: Record<string, CountryCurrency>;
}

const SubmitExpense = () => {
    const [formData, setFormData] = useState({
        amount: "",
        currency: "",
        category: "",
        date: "",
        description: "",
        receipt: null as File | null,
    });

    const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
    const [allCurrencies, setAllCurrencies] = useState<Currency[]>([]);
    const [displayedCurrencies, setDisplayedCurrencies] = useState<Currency[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [visibleCount, setVisibleCount] = useState(20);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Fetch currencies from REST Countries API using same pattern as signup
    const fetchCurrencies = async () => {
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

            const data: RawCountry[] = await response.json();

            const processedCurrencies: Currency[] = [];

            data.forEach((country) => {
                if (country.currencies) {
                    Object.entries(country.currencies).forEach(([code, currencyInfo]) => {
                        if (currencyInfo && currencyInfo.name) {
                            processedCurrencies.push({
                                code,
                                name: currencyInfo.name,
                                symbol: currencyInfo.symbol || "",
                            });
                        }
                    });
                }
            });

            // Remove duplicates and sort by currency name
            const uniqueCurrencies = processedCurrencies
                .filter((currency, index, self) =>
                    index === self.findIndex(c => c.code === currency.code)
                )
                .sort((a, b) => a.name.localeCompare(b.name));

            setAllCurrencies(uniqueCurrencies);
            setDisplayedCurrencies(uniqueCurrencies.slice(0, 20));
            setLoading(false);
        } catch (err) {
            console.error("Error fetching currencies:", err);
            setError("Failed to load currencies. Please try again.");
            setLoading(false);
        }
    };

    // Fetch currencies on component mount
    useEffect(() => {
        fetchCurrencies();
    }, []);

    // Filter currencies based on search query
    const filteredCurrencies = useMemo(() => {
        if (!searchQuery) {
            return displayedCurrencies;
        }
        // When searching, show all matching currencies
        return allCurrencies.filter((currency) =>
            currency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            currency.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            currency.symbol.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [allCurrencies, displayedCurrencies, searchQuery]);

    // Handle scroll to load more currencies
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement;
        const bottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;

        if (bottom && !isLoadingMore && !searchQuery && visibleCount < allCurrencies.length) {
            setIsLoadingMore(true);

            // Simulate a slight delay for better UX
            setTimeout(() => {
                const newCount = Math.min(visibleCount + 20, allCurrencies.length);
                setVisibleCount(newCount);
                setDisplayedCurrencies(allCurrencies.slice(0, newCount));
                setIsLoadingMore(false);
            }, 300);
        }
    }, [isLoadingMore, searchQuery, visibleCount, allCurrencies]);

    const selectedCurrencyData = allCurrencies.find((c) => c.code === selectedCurrency);

    const retryFetch = () => {
        setError(null);
        fetchCurrencies();
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFormData(prev => ({ ...prev, receipt: file }));

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setReceiptPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setReceiptPreview(null);
        }
    };

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [categories, setCategories] = useState<Array<{id: number, name: string}>>([]);

    // Fetch expense categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                if (!user.companyId) return;

                const response = await fetch(`/api/expense-categories?companyId=${user.companyId}`);
                if (response.ok) {
                    const data = await response.json();
                    setCategories(data.categories);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        // Basic validation
        if (!formData.amount || !formData.currency || !formData.category || !formData.date || !formData.description) {
            setSubmitError("Please fill in all required fields");
            return;
        }

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.id || !user.companyId) {
            setSubmitError("User information not found. Please login again.");
            return;
        }

        setIsSubmitting(true);

        try {
            // Upload receipt if provided
            let receiptUrl = null;
            if (formData.receipt) {
                // In a real app, you'd upload to a file storage service
                // For now, we'll just create a placeholder URL
                receiptUrl = `receipts/${Date.now()}_${formData.receipt.name}`;
            }

            const response = await fetch('/api/expenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    employeeId: user.id,
                    companyId: user.companyId,
                    categoryId: parseInt(formData.category),
                    amount: parseFloat(formData.amount),
                    currency: formData.currency,
                    description: formData.description,
                    expenseDate: formData.date,
                    receiptUrl,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit expense');
            }

            // Reset form
            setFormData({
                amount: "",
                currency: "",
                category: "",
                date: "",
                description: "",
                receipt: null,
            });
            setReceiptPreview(null);
            setSelectedCurrency("");

            alert("Expense submitted successfully!");

        } catch (error) {
            console.error('Error submitting expense:', error);
            setSubmitError(error instanceof Error ? error.message : 'Failed to submit expense');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Submit Expense</h1>
                <p className="text-gray-600 mt-2">Submit a new expense for approval</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Expense Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="amount">Amount *</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.amount}
                                    onChange={(e) => handleInputChange("amount", e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="currency">Currency *</Label>
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
                                                    Loading currencies...
                                                </>
                                            ) : selectedCurrencyData ? (
                                                <span className="truncate">
                                                    {selectedCurrencyData.name} ({selectedCurrencyData.symbol}) - {selectedCurrencyData.code}
                                                </span>
                                            ) : (
                                                "Select currency..."
                                            )}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[400px] p-0">
                                        <Command>
                                            <CommandInput
                                                placeholder="Search currency..."
                                                value={searchQuery}
                                                onValueChange={setSearchQuery}
                                            />
                                            <CommandEmpty>No currency found.</CommandEmpty>
                                            <CommandGroup
                                                ref={scrollRef}
                                                className="max-h-[300px] overflow-auto"
                                                onScroll={handleScroll}
                                            >
                                                {filteredCurrencies.map((currency) => (
                                                    <CommandItem
                                                        key={currency.code}
                                                        value={currency.name}
                                                        onSelect={() => {
                                                            setSelectedCurrency(currency.code);
                                                            setFormData(prev => ({ ...prev, currency: currency.code }));
                                                            setOpen(false);
                                                            setSearchQuery("");
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedCurrency === currency.code
                                                                    ? "opacity-100"
                                                                    : "opacity-0"
                                                            )}
                                                        />
                                                        <span className="flex-1 truncate">
                                                            {currency.name}
                                                        </span>
                                                        <span className="text-xs text-gray-500 ml-2">
                                                            {currency.symbol && ` ${currency.symbol}`} - {currency.code}
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
                                            {!searchQuery && displayedCurrencies.length < allCurrencies.length && (
                                                <div className="p-2 text-xs text-center text-gray-500 border-t">
                                                    Showing {displayedCurrencies.length} of {allCurrencies.length} currencies - Scroll for more
                                                </div>
                                            )}
                                            {searchQuery && (
                                                <div className="p-2 text-xs text-center text-gray-500 border-t">
                                                    Found {filteredCurrencies.length} currencies
                                                </div>
                                            )}
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="category">Category *</Label>
                                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                        {categories.length === 0 && (
                                            <SelectItem value="1">Travel</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="date">Date *</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => handleInputChange("date", e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="description">Description *</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe the expense..."
                                value={formData.description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("description", e.target.value)}
                                rows={3}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="receipt">Receipt Upload</Label>
                            <Input
                                id="receipt"
                                type="file"
                                accept="image/*,.pdf"
                                onChange={handleFileChange}
                                className="mt-1"
                            />
                            {receiptPreview && (
                                <div className="mt-4">
                                    <p className="text-sm text-gray-600 mb-2">Receipt Preview:</p>
                                    <Image
                                        src={receiptPreview}
                                        alt="Receipt preview"
                                        className="max-w-full h-auto max-h-48 border rounded"
                                    />
                                </div>
                            )}
                        </div>

                        {submitError && (
                            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded">
                                <AlertCircle className="h-4 w-4" />
                                <span>{submitError}</span>
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                "Submit Expense"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default SubmitExpense;


