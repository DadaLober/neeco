import { isUserOrAdmin } from "@/actions/roleActions";
import { auth } from "@/auth";
import { Dashboard } from "@/components/dashboard/dashboard";
import { redirect } from "next/navigation";
import { addDocuments } from "@/actions/itemActions";
import { Documents } from "@prisma/client";

export default async function DashboardPage() {
  const session = await auth();

  if (!await isUserOrAdmin(session) && !session) {
    redirect("/login");
  }

  const test: Omit<Documents, 'id'>[] = [{
    referenceNo: "123456789021",
    documentType: "APV",
    documentStatus: "APP",
    purpose: "Purpose",
    supplier: "Supplier",
    oic: true,
    date: new Date(),
    departmentId: 1
  },
  {
    referenceNo: "123456789022",
    documentType: "APV",
    documentStatus: "APP",
    purpose: "Purpose",
    supplier: "Supplier",
    oic: true,
    date: new Date(),
    departmentId: 1
  }

  ];

  const result = await addDocuments(test);
  console.log(result);

  return <Dashboard />
}