"use client"

import { CardTable } from "@/components/ui/card-table"
import { User, Department, ApprovalRole } from "@prisma/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { useDialog } from "@/hooks/use-dialog"
import { toast } from "sonner"

export type UserWithRelations = Partial<User> & {
    department?: Department | null
    approvalRole?: ApprovalRole | null
}

type UsersTableProps = {
    users: UserWithRelations[]
    deleteAction: (userId: string) => Promise<void>
}

export function UsersTable({ users, deleteAction }: UsersTableProps) {
    const { config, openDialog, closeDialog, setLoading } = useDialog()

    const handleDelete = (user: UserWithRelations) => {
        openDialog({
            title: "Confirm Deletion",
            description: (
                <>
                    Are you sure you want to delete <strong>{user.name}</strong>? This action cannot be undone.
                </>
            ),
            confirmLabel: "Delete",
            confirmVariant: "destructive",
            onConfirm: async () => {
                if (!user.id) return

                try {
                    setLoading(true)
                    await deleteAction(user.id)
                    toast.success(`User ${user.id} deleted successfully`)
                } catch (error) {
                    console.error("Error deleting user:", error)
                } finally {
                    closeDialog()
                }
            }
        })
    }

    const handleEdit = (user: UserWithRelations) => {
        openDialog({
            title: "Edit User",
            description: `Do you want to edit ${user.name}?`,
            confirmLabel: "Edit",
            confirmVariant: "default",
            onConfirm: async () => {
                console.log(`Editing user ${user.id}`)
                closeDialog()
            }
        })
    }

    return (
        <>
            <CardTable
                data={users}
                title="Users"
                description="A list of all users in your organization."
                searchable
                searchPlaceholder="Search users..."
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
                    { header: "Role", accessorKey: "role" },
                    {
                        header: "Department",
                        accessorKey: "departmentId",
                        cell: (user) => (
                            <div className="flex items-center gap-2">
                                {user.department ? user.department.name : "None"}
                            </div>
                        ),
                    },
                    {
                        header: "Approval Role",
                        accessorKey: "approvalRoleId",
                        cell: (user) => (
                            <div className="flex items-center gap-2">
                                {user.approvalRole ? user.approvalRole.name : "None"}
                            </div>
                        ),
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
                    { header: "Login Attempts", accessorKey: "loginAttempts" }
                ]}
                rowActions={[
                    { label: "Edit", onClick: handleEdit },
                    { label: "Delete", onClick: handleDelete },
                ]}
            />

            <ConfirmationDialog
                open={config.open}
                onOpenChange={(open) => open ? openDialog({}) : closeDialog()}
                title={config.title}
                description={config.description}
                confirmLabel={config.confirmLabel}
                confirmVariant={config.confirmVariant}
                onConfirm={config.onConfirm}
                isLoading={config.isLoading}
            />
        </>
    )
}
