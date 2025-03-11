import { getAllUsers, getAllUsersFromDB } from "@/actions/adminActions"
import { isAdmin } from "@/actions/roleActions"
import { UsersTable } from "@/components/admin/users-table"

export default async function UsersPage() {
  const data = await getAllUsers(isAdmin, getAllUsersFromDB)

  return (
    <div className="p-6 b -card rounded-lg border shadow-sm">
      <UsersTable initialUsers={data} />
    </div>
  )
}