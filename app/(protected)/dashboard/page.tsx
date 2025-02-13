import { SignOut } from "@/app/(components)/sign-out";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const Page = async () => {
    const session = await auth();
    if (!session) redirect("/");

    return (
        <>
            <div className="bg-gray-100 rounded-lg p-4 text-center mb-6">
                <p className="text-gray-600">Signed in as:</p>
                <p className="font-medium">{session.user?.email}</p>
                <p className="text-gray-600">Session obj value: {JSON.stringify(session)}</p>
            </div>

            <SignOut />
        </>
    );
};

export default Page;
