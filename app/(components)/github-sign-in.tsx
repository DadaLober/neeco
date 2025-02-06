import { signIn } from "@/lib/auth";
import { FaGithub } from "react-icons/fa";

export default function GithubSignIn() {
    return (
        <form
            action={async () => {
                "use server";
                await signIn("github");
            }}
        >
            <button
                type="submit"
                className="w-full flex items-center justify-center rounded-lg px-4 py-2 bg-white"
            >
                <FaGithub className="mr-2 h-4 w-4" />
                GitHub
            </button>
        </form>
    );
}