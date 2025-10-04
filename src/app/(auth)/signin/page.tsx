"use client";

import { useState } from "react";
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
import Link from "next/link";
import { Loader2, AlertCircle, Check } from "lucide-react";
import { useRouter } from "next/navigation";

const SigninPage = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        // Validation
        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Failed to sign in");
                return;
            }

            // Success - store user data in localStorage
            setSuccess(true);

            if (typeof window !== 'undefined') {
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            // Redirect based on user role
            setTimeout(() => {
                const role = data.user.role;
                if (role === 'admin') {
                    router.push('/admin/dashboard');
                } else if (role === 'manager') {
                    router.push('/manager/dashboard');
                } else {
                    router.push('/employee/dashboard');
                }
            }, 1500);

        } catch (err) {
            console.error("Error signing in:", err);
            setError("Failed to sign in. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>Signin</CardTitle>
                    <CardDescription>
                        Enter your information to login to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div>
                        <div className="grid w-full items-center gap-4">
                            {error && (
                                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                                    <AlertCircle className="h-3 w-3" />
                                    <span>{error}</span>
                                </div>
                            )}
                            {success && (
                                <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                                    <Check className="h-3 w-3" />
                                    <span>Login successful! Redirecting...</span>
                                </div>
                            )}
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    placeholder="Enter your email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isSubmitting}
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
                                    disabled={isSubmitting}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSubmit(e as unknown as React.MouseEvent<HTMLButtonElement>);
                                        }
                                    }}
                                />
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
                                Signing In...
                            </>
                        ) : (
                            "Sign In"
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
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/signup"
                            className="font-medium text-primary underline-offset-4 hover:underline"
                        >
                            Sign up
                        </Link>
                    </p>

                    {/* Horizontal line above Forgot Password */}
                    <span className="w-full border-t" />

                    <Link
                        href="/forgot-password"
                        className="text-sm text-primary font-medium text-center underline-offset-4 hover:underline"
                    >
                        Forgot password?
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
};

export default SigninPage;