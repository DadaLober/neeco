import { getAllUsers } from "@/actions/adminActions"
import { isAdmin } from "@/actions/roleActions"
import AccessDeniedPage from "@/components/admin/access-denied"
import { UsersTable } from "@/components/admin/users-table"
import { UnauthorizedResponse } from "@/schemas/types"
import { User } from "@/schemas/types"


export default async function UsersPage() {
  const data: User[] | UnauthorizedResponse = await getAllUsers(isAdmin)

  if ('error' in data) {
    return <AccessDeniedPage />
  }

  return (
    <div className="p-6 b-card rounded-lg border shadow-sm">
      <UsersTable users={data} />
    </div>
  )
}