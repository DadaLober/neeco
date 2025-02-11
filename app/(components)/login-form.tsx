"use client";

import { useState, useTransition } from "react";
import { loginUser } from "@/actions/authActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

export function LoginForm() {
    const [isPending, startTransition] = useTransition();
    const [errorMessage, setErrorMessage] = useState("");

    return (
        <form
            className="space-y-4"
            action={(formData) => {
                startTransition(async () => {
                    const result = await loginUser(formData);

                    if (result.success) {
                        toast({
                            title: "Success!",
                            description: "Successfully signed in.",
                        });
                    } else {
                        toast({
                            title: "Error",
                            description: result.message || "Login failed. Please try again.",
                            variant: "destructive",
                        });
                        setErrorMessage(result.message);
                    }
                });
            }}
        >
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-[#008033]">
                        Email
                    </Label>
                    <Input
                        name="email"
                        type="email"
                        placeholder="email@example.com"
                        required
                        autoComplete="email"
                        className="w-full px-3 py-2 border rounded-md border-[#008033] focus:outline-none focus:ring-2 focus:ring-[#E8FE05]"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-[#008033]">
                        Password
                    </Label>
                    <Input
                        name="password"
                        type="password"
                        required
                        autoComplete="current-password"
                        className="w-full px-3 py-2 border rounded-md border-[#008033] focus:outline-none focus:ring-2 focus:ring-[#E8FE05] pr-10"
                    />
                </div>
            </div>

            {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

            <Button
                type="submit"
                disabled={isPending}
                className="w-full mt-6 bg-[#008033] hover:bg-[#006028] text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-[#E8FE05] focus:ring-opacity-50"
            >
                {isPending ? "Signing in..." : "Sign In"}
            </Button>
        </form>
    );
}
