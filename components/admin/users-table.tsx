"use client"

import { CardTable } from "@/components/ui/card-table"
import { User, Department, ApprovalRole } from "@prisma/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export type UserWithRelations = Partial<User> & {
    department?: Department | null, approvalRole?: ApprovalRole | null
}

type UsersTableProps = {
    users: UserWithRelations[]
}
export function UsersTable({ users }: UsersTableProps) {
    return (
        <CardTable
            data={users}
            columns={[
                {
                    header: "Avatar",
                    accessorKey: "image",
                    cell: (user) => (
                        <div className="flex items-center gap-2">
                            <Avatar>
                                {user.image ? (
                                    <AvatarImage src={user.image} alt={user.name} />
                                ) : (
                                    <AvatarFallback className="bg-green-200">
                                        {user?.name?.[0]?.toUpperCase()}
                                    </AvatarFallback>
                                )}
                            </Avatar>
                        </div>
                    ),
                },
                {
                    header: "User",
                    accessorKey: "name",
                    sortable: true,
                    cell: (user) => (
                        <div className="flex items-center gap-3">
                            <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                        </div>
                    ),
                },
                {
                    header: "Role",
                    accessorKey: "role",
                    sortable: true,
                },
                {
                    header: "Department",
                    accessorKey: "departmentId",
                    sortable: true,
                    cell: (user) => (
                        <div className="flex items-center gap-2">
                            {user.department ? user.department.name : "None"}
                        </div>
                    ),

                },
                {
                    header: "Approval Role",
                    accessorKey: "approvalRoleId",
                    sortable: true,
                    cell: (user) => (
                        <div className="flex items-center gap-2">
                            {user.approvalRole ? user.approvalRole.name : "None"}
                        </div>
                    ),
                },
                {
                    header: "Last Login",
                    accessorKey: "lastLogin",
                    sortable: true,
                    cell: (user) => (
                        <div className="flex items-center gap-2">
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
                        </div>
                    ),
                },
                {
                    header: "Login Attempts",
                    accessorKey: "loginAttempts",
                    sortable: true,
                }
            ]}
            title="Users"
            description="A list of all users in your organization."
            searchable
            searchPlaceholder="Search users..."
            rowActions={
                [
                    {
                        label: "Edit",
                        onClick: (user) => {
                            alert({
                                title: "Edit user",
                                description: `You want to edit ${user.name}`,
                            })
                        },
                    },
                    {
                        label: "Delete",
                        onClick: (user) => {
                            alert({
                                title: "Delete user",
                                description: `You want to delete ${user.name}`,
                                variant: "destructive",
                            })
                        },
                    },
                ]}
        />
    )
}

