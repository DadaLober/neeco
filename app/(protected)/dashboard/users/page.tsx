import { getAllUsers, deleteUser, getAllDepartments, getAllApprovalRoles, updateUser } from "@/actions/adminActions"
import { isAdmin } from "@/actions/roleActions";
import { auth } from "@/auth";
import AccessDeniedPage from "@/components/admin/access-denied"
import { UsersTable } from "@/components/admin/users-table"
import { User } from "@prisma/client";
import { revalidatePath } from "next/cache";


export default async function UsersPage() {
  const session = await auth();

  if (!(await isAdmin(session) || !session)) {
    return <AccessDeniedPage />
  }

  const users = await getAllUsers()
  const departments = await getAllDepartments()
  const approvalRoles = await getAllApprovalRoles()

  if ('error' in users || 'error' in departments || 'error' in approvalRoles) {
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

  const handleUpdate = async (userId: string, data: Partial<User>) => {
    "use server";
    try {
      await updateUser(userId, data)
      revalidatePath("/dashboard/users")
    } catch (error) {
      console.error("Error updating user:", error)
    }
  }

  return (
    <main className="flex flex-col">
      <div className="flex">
        <UsersTable users={users} departments={departments} approvalRoles={approvalRoles} deleteAction={handleDelete} updateAction={handleUpdate} />
      </div>
    </main>
  )
}



