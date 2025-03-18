import { getAllUsers, deleteUser } from "@/actions/adminActions"
import { isAdmin } from "@/actions/roleActions";
import { auth } from "@/auth";
import AccessDeniedPage from "@/components/admin/access-denied"
import { UsersTable } from "@/components/admin/users-table"
import { revalidatePath } from "next/cache";


export default async function UsersPage() {
  const session = await auth();

  if (!(await isAdmin(session) || !session)) {
    return <AccessDeniedPage />
  }

  const data = await getAllUsers()

  const mockData = [{
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "ADMIN",
    lastLogin: new Date(),
    loginAttempts: 0,
    approvalRole: {
      id: "2",
      name: "Department Manager",
      sequence: 2
    },
    department: {
      id: "2",
      name: "TSD"
    },
  }
  ]

  if ('error' in data) {
    return <AccessDeniedPage />
  }

  const combinedData = [...data, ...mockData]

  const handleDelete = async (userId: string) => {
    "use server";
    try {
      await deleteUser(userId)
      revalidatePath("/dashboard/users")
    } catch (error) {
      console.error("Error deleting user:", error)
    }
  }

  return (
    <main className="flex flex-col">
      <div className="flex">
        <UsersTable users={combinedData} deleteAction={handleDelete} />
      </div>
    </main>
  )
}



