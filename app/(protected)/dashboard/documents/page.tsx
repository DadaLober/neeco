import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAllDocuments } from "@/actions/itemActions";

export default async function DashboardPage() {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    const items = await getAllDocuments();


    if ('error' in items) {
        return <div>Error fetching items</div>
    }

    return (
        <div className="container mx-auto p-4 space-y-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
    )
}