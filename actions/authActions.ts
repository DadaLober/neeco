"use server"

import { signIn } from "@/lib/auth";
import { executeAction } from "./executeAction";

import { schema } from "@/lib/schema";
import db from "@/lib/db/db";

const loginUser = async function loginUser(formData: FormData) {
    const result = await executeAction({
        actionFn: async () => {
            await signIn("credentials", formData);
        },
    });
    return result;
}

const signUp = async (formData: FormData) => {
    return executeAction({
        actionFn: async () => {
            const email = formData.get("email");
            const password = formData.get("password");
            const validatedData = schema.parse({ email, password });
            await db.user.create({
                data: {
                    email: validatedData.email.toLocaleLowerCase(),
                    password: validatedData.password,
                },
            });
        },
        successMessage: "Signed up successfully",
    });
};

export { loginUser, signUp };