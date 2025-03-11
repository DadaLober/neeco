import { getAllUsers, getAllUsersFromDB } from "@/actions/adminActions"
import { isAdmin } from "@/actions/roleActions"
import { UsersTable } from "@/components/admin/users-table"

export default async function UsersPage() {
  const data = await getAllUsers(isAdmin, getAllUsersFromDB)
  console.log(data)
  return (
    <div className="p-6 bg-card rounded-lg border shadow-sm">
      <UsersTable />
    </div>
  )
}

