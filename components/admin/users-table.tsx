import { User } from "@/schemas/types";
import { UsersTableActions } from "@/components/admin/user-table-actions";

interface UsersTableProps {
    users: User[];
}

export function UsersTable({ users }: UsersTableProps) {
    return (
        <div className="overflow-hidden rounded-md border">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Role</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Last Login</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Login Attempts</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {users.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                                No users found
                            </td>
                        </tr>
                    ) : (
                        users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium">{user.name}</td>
                                <td className="px-4 py-3 text-gray-600">{user.email}</td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                        }`}>
                                        {user.isActive ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}
                                </td>
                                <td className="px-4 py-3 text-gray-600">{user.loginAttempts}</td>
                                <td className="px-4 py-3">
                                    <UsersTableActions user={user} />
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
