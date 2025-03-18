import { getAllUsers } from "@/actions/adminActions"
import { isAdmin } from "@/actions/roleActions";
import { auth } from "@/auth";
import AccessDeniedPage from "@/components/admin/access-denied"
import { UsersTable } from "@/components/admin/users-table"


export default async function UsersPage() {
  const session = await auth();

  if (!(await isAdmin(session) || !session)) {
    return <AccessDeniedPage />
  }

  const data = await getAllUsers()

  if ('error' in data) {
    return <AccessDeniedPage />
  }

  const data2 = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "USER",
      isActive: true,
      lastLogin: new Date(),
      loginAttempts: 0
    },
    {
      id: "2",
      name: "Jane Doe",
      email: "jane@example.com",
      role: "ADMIN",
      isActive: true,
      lastLogin: new Date(),
      loginAttempts: 0
    }
    ,
    {
      id: "3",
      name: "Bob Smith",
      email: "bob@example.com",
      role: "USER",
      isActive: true,
      lastLogin: new Date(),
      loginAttempts: 0
    },
    {
      id: "4",
      name: "Alice Johnson",
      email: "alice@example.com",
      role: "USER",
      isActive: true,
      lastLogin: new Date(),
      loginAttempts: 0
    },
    {
      id: "5",
      name: "Charlie Brown",
      email: "charlie@example.com",
      role: "USER",
      isActive: true,
      lastLogin: new Date(),
      loginAttempts: 0,
    },
  ]

  const combinedData = [...data, ...data2]

  return (
    <main className="flex flex-col">
      <div className="flex">
        <UsersTable users={combinedData} />
      </div>
    </main>
  )
}



