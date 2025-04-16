"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { CardTable } from "@/components/ui/card-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { EditableUser, UserWithRelations } from "@/actions/queries"
import { getAllUsers, getAllDepartments, getAllApprovalRoles, deleteUser, updateUser } from "@/actions/adminActions"

type UsersTableProps = {
    users: Awaited<ReturnType<typeof getAllUsers>>;
    departments: Awaited<ReturnType<typeof getAllDepartments>>
    approvalRoles: Awaited<ReturnType<typeof getAllApprovalRoles>>
}

export function UsersTable({
    users,
    departments,
    approvalRoles,
}: UsersTableProps) {
    const router = useRouter()
    const roles = ["ADMIN", "USER"]

    // State for Delete Dialog
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [userToDelete, setUserToDelete] = useState<UserWithRelations | null>(null)
    const [isDeleteLoading, setIsDeleteLoading] = useState(false)

    // State for Edit Dialog
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editedUser, setEditedUser] = useState<EditableUser | null>(null)

    // State for Save Confirmation Dialog
    const [saveDialogOpen, setSaveDialogOpen] = useState(false)
    const [isSaveLoading, setIsSaveLoading] = useState(false)

    // Handle Delete
    const handleDeleteClick = (user: UserWithRelations) => {
        setUserToDelete(user)
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!userToDelete?.id) return

        setIsDeleteLoading(true)
        try {
            const result = await deleteUser(userToDelete.id)

            if (result && !result.success) {
                console.error("Error deleting user:", result.error)
                toast.error(result.error.message || "Failed to delete user")
                return
            }

            router.refresh()
            toast.success(`User ${userToDelete.name} deleted successfully`)
            setDeleteDialogOpen(false)
        } catch (error) {
            console.error("Client error deleting user:", error)
            toast.error("Failed to delete user")

        } finally {
            setIsDeleteLoading(false)
        }
    }

    const handleEditClick = (user: EditableUser) => {
        setEditedUser(user)
        setEditDialogOpen(true)
    }

    const handleEditConfirm = () => {
        setEditDialogOpen(false)
        setSaveDialogOpen(true)
    }

    // Handle Save
    const handleSaveConfirm = async () => {
        if (!editedUser?.id) return

        setIsSaveLoading(true)
        try {
            const result = await updateUser(
                editedUser.id,
                {
                    id: editedUser.id,
                    name: editedUser.name,
                    email: editedUser.email,
                    role: editedUser.role,
                    departmentId: editedUser.departmentId,
                    approvalRoleId: editedUser.approvalRoleId
                })

            if (result && !result.success) {
                console.error("Error updating user:", result.error)
                toast.error(result.error.message || "Failed to update user")
                return
            }

            router.refresh()
            toast.success(`User ${editedUser.name} updated successfully`)
            setSaveDialogOpen(false)
            setEditedUser(null)
        } catch (error) {
            console.error("Client error updating user:", error)
            toast.error("Failed to update user")

        } finally {
            setIsSaveLoading(false)
        }
    }
    return (
        <>
            <CardTable
                data={users.success ? users.data : []}
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
                                <Avatar key={user.id}>
                                    {user.image ? (
                                        <AvatarImage src={user.image} alt={user.name || "User"} />
                                    ) : (
                                        <AvatarFallback className="bg-green-200">
                                            {user.name ? user.name[0].toUpperCase() : "?"}
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
                    },
                    {
                        header: "Department",
                        accessorKey: "departmentId",
                        filterable: true,
                        filterAccessor: "department.name",
                        cell: (user) => (
                            <div className="flex items-center gap-2">{user.department?.name || "None"}</div>
                        ),
                    },
                    {
                        header: "Approval Role",
                        accessorKey: "approvalRoleId",
                        filterable: true,
                        filterAccessor: "approvalRole.name",
                        cell: (user) => (
                            <div className="flex items-center gap-2">{user.approvalRole?.name || "None"}</div>
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
                    {
                        header: "Login Attempts",
                        accessorKey: "loginAttempts",
                        sortable: true
                    },
                ]}
                rowActions={[
                    { label: "Edit", onClick: handleEditClick },
                    { label: "Delete", onClick: handleDeleteClick },
                ]}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Confirm Deletion"
                description={<>Are you sure you want to delete <strong>{userToDelete?.name}</strong>? This action cannot be undone.</>}
                confirmLabel="Delete"
                confirmVariant="destructive"
                onConfirm={handleDeleteConfirm}
                isLoading={isDeleteLoading}
            />

            {/* Edit User Dialog */}
            <ConfirmationDialog
                open={editDialogOpen}
                onOpenChange={(open) => {
                    setEditDialogOpen(open);
                    if (!open) setEditedUser(null);
                }}
                title={`Edit User: ${editedUser?.name}`}
                description="Update the user's role, department, and approval role."
                confirmLabel="Save Changes"
                confirmVariant="default"
                onConfirm={handleEditConfirm}
                content={
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Role</label>
                            <Select
                                value={editedUser?.role || ""}
                                onValueChange={(value) => setEditedUser((prev) => prev ? { ...prev, role: value } : prev)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role} value={role}>
                                            {role}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Department</label>
                            <Select
                                value={editedUser?.departmentId ? String(editedUser.departmentId) : "none"}
                                onValueChange={(value) =>
                                    setEditedUser((prev) => {
                                        if (!prev) return prev
                                        const deptId = value === "none" ? null : Number.parseInt(value, 10)
                                        return {
                                            ...prev,
                                            departmentId: deptId
                                        }
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {departments.success && departments.data.map((dept) => (
                                        <SelectItem key={dept.id} value={String(dept.id)}>
                                            {dept.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Approval Role</label>
                            <Select
                                value={editedUser?.approvalRoleId ? String(editedUser.approvalRoleId) : "none"}
                                onValueChange={(value) =>
                                    setEditedUser((prev) => {
                                        if (!prev) return prev
                                        const roleId = value === "none" ? null : Number.parseInt(value, 10)
                                        return {
                                            ...prev,
                                            approvalRoleId: roleId
                                        }
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select approval role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {approvalRoles.success && approvalRoles.data.map((role) => (
                                        <SelectItem key={role.id} value={String(role.id)}>
                                            {role.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                }
            />

            {/* Save Confirmation Dialog */}
            <ConfirmationDialog
                open={saveDialogOpen}
                onOpenChange={(open) => {
                    setSaveDialogOpen(open);
                    if (!open) setEditedUser(null);
                }}
                title="Save Changes"
                description={<> Are you sure you want to save changes to <strong>{editedUser?.name}</strong>? </>}
                confirmLabel="Save"
                confirmVariant="default"
                onConfirm={handleSaveConfirm}
                isLoading={isSaveLoading}
            />
        </>
    )
}