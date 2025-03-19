"use client"

import { useState } from "react"
import { CardTable } from "@/components/ui/card-table"
import type { User, Department, ApprovalRole } from "@prisma/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type UserWithRelations = Partial<User> & {
    department?: Department | null
    approvalRole?: ApprovalRole | null
}

type UsersTableProps = {
    users: UserWithRelations[]
    deleteAction: (userId: string) => Promise<void>
    updateAction?: (userId: string, data: Partial<UserWithRelations>) => Promise<void>
    departments?: Department[]
    approvalRoles?: ApprovalRole[]
}

export function UsersTable({
    users,
    deleteAction,
    updateAction,
    departments = [],
    approvalRoles = [],
}: UsersTableProps) {
    const roles = ["ADMIN", "USER"]

    // State for Delete Dialog
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [userToDelete, setUserToDelete] = useState<UserWithRelations | null>(null)
    const [isDeleteLoading, setIsDeleteLoading] = useState(false)

    // State for Edit Dialog
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editedUser, setEditedUser] = useState<UserWithRelations | null>(null)

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
            await deleteAction(userToDelete.id)
            toast.success(`User ${userToDelete.name} deleted successfully`)
            setDeleteDialogOpen(false)
        } catch (error) {
            console.error("Error deleting user:", error)
            toast.error("Failed to delete user")
        } finally {
            setIsDeleteLoading(false)
        }
    }

    // Handle Edit
    const handleEditClick = (user: UserWithRelations) => {
        setEditedUser({
            ...user,
            department: user.department,
            approvalRole: user.approvalRole
        })
        setEditDialogOpen(true)
    }

    const handleEditConfirm = () => {
        setEditDialogOpen(false)
        setSaveDialogOpen(true)
    }

    // Handle Save
    const handleSaveConfirm = async () => {
        if (!editedUser?.id || !updateAction) return

        setIsSaveLoading(true)
        try {
            await updateAction(editedUser.id, {
                role: editedUser.role,
                departmentId: editedUser.departmentId,
                approvalRoleId: editedUser.approvalRoleId,
            })
            toast.success(`User ${editedUser.name} updated successfully`)
            setSaveDialogOpen(false)
            setEditedUser(null)
        } catch (error) {
            console.error("Error updating user:", error)
            toast.error("Failed to update user")
        } finally {
            setIsSaveLoading(false)
        }
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
                                        <AvatarFallback className="bg-green-200">{user?.name?.[0]?.toUpperCase()}</AvatarFallback>
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
                            <div className="flex items-center gap-2">{user.department ? user.department.name : "None"}</div>
                        ),
                    },
                    {
                        header: "Approval Role",
                        accessorKey: "approvalRoleId",
                        cell: (user) => (
                            <div className="flex items-center gap-2">{user.approvalRole ? user.approvalRole.name : "None"}</div>
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
                    { header: "Login Attempts", accessorKey: "loginAttempts" },
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
                                onValueChange={(value) => setEditedUser((prev) => (prev ? { ...prev, role: value } : prev))}
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
                                value={editedUser?.department?.id ? String(editedUser.department.id) : "none"}
                                onValueChange={(value) =>
                                    setEditedUser((prev) => {
                                        if (!prev) return prev
                                        const deptId = value === "none" ? null : Number.parseInt(value, 10)
                                        const selectedDepartment = deptId ? departments.find((d) => d.id === deptId) || null : null
                                        return {
                                            ...prev,
                                            departmentId: deptId,
                                            department: selectedDepartment
                                        }
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {departments.map((dept) => (
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
                                value={editedUser?.approvalRole?.id ? String(editedUser.approvalRole.id) : "none"}
                                onValueChange={(value) =>
                                    setEditedUser((prev) => {
                                        if (!prev) return prev
                                        const roleId = value === "none" ? null : Number.parseInt(value, 10)
                                        const selectedRole = roleId ? approvalRoles.find((r) => r.id === roleId) || null : null
                                        return {
                                            ...prev,
                                            approvalRoleId: roleId,
                                            approvalRole: selectedRole
                                        }
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select approval role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {approvalRoles.map((role) => (
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