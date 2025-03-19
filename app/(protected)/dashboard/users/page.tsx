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

  if ('error' in data) {
    return <AccessDeniedPage />
  }

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
        <UsersTable users={data} deleteAction={handleDelete} />
      </div>
    </main>
  )
}



