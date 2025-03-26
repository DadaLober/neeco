import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    return (
        <main className="mx-auto max-w-3xl">
            <h1 className="mb-6 text-4xl font-bold">Web based Approval System</h1>
            <p className="mb-4">
                Built for Neeco 2 Area 1, this web-based approval system provides a user-friendly interface for managing
                approval processes. It offers a clean and intuitive design, with a focus on ease of use and accessibility.
            </p>
            <h2 className="mb-4 mt-8 text-2xl font-semibold">Features</h2>
            <ul className="mb-4 list-inside list-disc space-y-1">
                <li>Clean and minimal design</li>
                <li>Dark mode support</li>
                <li>Responsive layout for mobile and desktop</li>
                <li>Easy navigation with shadcn sidebar</li>
                <li>Built with Next.js App Router</li>
            </ul>
            <h2 className="mb-4 mt-8 text-2xl font-semibold">Tech Stack</h2>
            <p className="mb-4">
                The system is built using the following technologies:
            </p>
            <ul className="mb-4 list-inside list-disc space-y-1">
                <li>React</li>
                <li>Next.js</li>
                <li>Shadcn</li>
                <li>Tailwind CSS</li>
                <li>TypeScript</li>
                <li>Prisma ORM</li>
                <li>MsSQL</li>
            </ul>
            <h2 className="mb-4 mt-8 text-2xl font-semibold">Getting Started</h2>
            <p className="mb-4">
                To get started with our documentation, please navigate through the sections using the sidebar on the left.
                Here&apos;s a quick overview of the available sections:
            </p>
            <ul className="mb-4 list-inside list-disc space-y-1">
                <li>
                    <strong>Introduction</strong>: An overview of the system
                </li>
                <li>
                    <strong>Getting Started</strong>: How to use, install,extend and customize the system
                </li>
            </ul>
        </main>
    )
}

