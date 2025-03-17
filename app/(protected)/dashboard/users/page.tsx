import { getAllUsers } from "@/actions/adminActions"
import AccessDeniedPage from "@/components/admin/access-denied"
import { UnauthorizedResponse } from "@/schemas/types"
import { User } from "@/schemas/types"


export default async function UsersPage() {
  const data: User[] | UnauthorizedResponse = await getAllUsers()

  if ('error' in data) {
    return <AccessDeniedPage />
  }

  return (
    <div className="p-6 b-card rounded-lg border shadow-sm">
      {/* Users Table */}
    </div>
  )
}