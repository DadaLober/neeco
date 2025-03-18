"use client"

// React core imports
import { useState } from "react"

// Form handling imports
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

// Authentication imports
import { register } from "@/actions/authActions"
import type { RegisterInput } from "@/actions/authActions"

// Validation imports
import { registerSchema } from "@/schemas"

// UI Component imports
import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/ui/password-input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "../ui/input"

// Utility imports
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

function PasswordStrengthIndicator({ password }: { password: string }) {
    const requirements = [
        { re: /[A-Z]/, label: "Uppercase" },
        { re: /[a-z]/, label: "Lowercase" },
        { re: /[0-9]/, label: "Number" },
        { re: /.{8,}/, label: "Min 8 characters" },
    ]

    const strength = requirements.reduce((count, { re }) => count + Number(re.test(password)), 0)

    return password ? (
        <div className="space-y-2">
            <div className="flex gap-1">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "h-2 w-full rounded-full transition-all",
                            i < strength ? "bg-primary" : "bg-muted"
                        )}
                    />
                ))}
            </div>
            <ul className="text-sm text-muted-foreground">
                {requirements.map(({ re, label }) => (
                    <li
                        key={label}
                        className={cn(
                            "flex items-center gap-2",
                            re.test(password) ? "text-primary" : "text-muted-foreground"
                        )}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="h-4 w-4"
                            aria-hidden="true"
                        >
                            {re.test(password) ? (
                                <path
                                    fillRule="evenodd"
                                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                    clipRule="evenodd"
                                />
                            ) : (
                                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                            )}
                        </svg>
                        {label}
                    </li>
                ))}
            </ul>
        </div>
    ) : null
}

const DEFAULT_VALUES: RegisterInput = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
}

export function RegisterForm() {
    const [error, setError] = useState<string>("")
    const router = useRouter()

    const form = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
        defaultValues: DEFAULT_VALUES,
    })

    async function onSubmit(values: RegisterInput) {
        setError("")
        const result = await register(values)

        if ('error' in result) {
            setError(result.error)
            form.setError("root", { message: result.error })
            return
        }
        router.push(result.callbackUrl)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={cn("flex flex-col gap-6")}>
                <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">Create an account</h1>
                    <p className="text-balance text-sm text-muted-foreground">
                        Enter your information below to create your account
                    </p>
                </div>
                {error && (
                    <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                        {error}
                    </div>
                )}
                <div className="grid gap-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        disabled={form.formState.isSubmitting}
                                        autoComplete="name"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="email"
                                        placeholder="m@example.com"
                                        disabled={form.formState.isSubmitting}
                                        autoComplete="email"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <PasswordInput
                                        {...field}
                                        disabled={form.formState.isSubmitting}
                                        autoComplete="new-password"
                                    />
                                </FormControl>
                                <PasswordStrengthIndicator password={field.value} />
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                    <PasswordInput
                                        {...field}
                                        disabled={form.formState.isSubmitting}
                                        autoComplete="new-password"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Creating account..." : "Create account"}
                    </Button>
                    <div className="text-center text-sm">
                        Already have an account?{" "}
                        <a href="/login" className="underline underline-offset-4 hover:text-primary">
                            Sign in
                        </a>
                    </div>
                </div>
            </form>
        </Form>
    )
}
