"use client"

import { CardTable } from "../ui/card-table"
import { User } from "@/schemas/types"

type UsersTableProps = {
    users: User[]
}

export function UsersTable({ users }: UsersTableProps) {
    return (
        <CardTable
            data={users}
            columns={[
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
                    header: "Last Login",
                    accessorKey: "lastLogin",
                    cell: (user) => (
                        <div className="flex items-center gap-2">
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
                        </div>
                    ),
                },
                {
                    header: "Login Attempts",
                    accessorKey: "loginAttempts",
                }
            ]}
            title="Users"
            description="A list of all users in your organization."
            searchable
            searchPlaceholder="Search users..."
            onRowClick={(user) => {
                alert({
                    title: "User selected",
                    description: `You clicked on ${user.name}`,
                })
            }}
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

