import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DataCard from "@/components/dashboard/DataCard";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const items = [
    {
      id: "ID-12345",
      referenceNo: "REF-001",
      itemType: "Equipment",
      itemStatus: "Active",
      purpose: "For office use and daily operations",
      supplier: "Tech Solutions Inc.",
      oic: "John Doe",
      date: "2023-05-15",
      pdfUrl: "https://documentcloud.adobe.com/view-sdk-demo/PDFs/Bodea%20Brochure.pdf",
    },
    {
      id: "ID-67890",
      referenceNo: "REF-002",
      itemType: "Supplies",
      itemStatus: "Pending",
      purpose: "Inventory replenishment for Q2",
      supplier: "Office Depot",
      oic: "Jane Smith",
      date: "2023-06-22",
      pdfUrl: "https://documentcloud.adobe.com/view-sdk-demo/PDFs/Bodea%20Brochure.pdf",
    },
    {
      id: "ID-24680",
      referenceNo: "REF-003",
      itemType: "Software",
      itemStatus: "Completed",
      purpose: "Upgrade of existing systems to improve efficiency and productivity",
      supplier: "Digital Systems Ltd.",
      oic: "Robert Johnson",
      date: "2023-04-10",
      pdfUrl: "https://documentcloud.adobe.com/view-sdk-demo/PDFs/Bodea%20Brochure.pdf",
    },
  ]

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Item Records</h1>
      <p className="text-muted-foreground text-sm">Tap on a card to view details</p>
      <div className="grid grid-cols-1 gap-4">
        {items.map((item) => (
          <DataCard key={item.id} {...item} />
        ))}
      </div>
    </div>
  )
}