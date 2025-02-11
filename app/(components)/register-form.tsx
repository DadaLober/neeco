import { signUp } from "@/lib/actions"
import { redirect } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function RegisterForm() {
    return (
        <form
            className="space-y-4"
            action={async (formData) => {
                "use server";
                const res = await signUp(formData);
                if (res.success) {
                    redirect("/login");
                }
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
            <Button
                type="submit"
                className="w-full mt-6 bg-[#008033] hover:bg-[#006028] text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-[#E8FE05] focus:ring-opacity-50"
            >Register
            </Button>
        </form>
    )
}