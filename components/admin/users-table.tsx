"use client"

import { useState } from "react"
import {
    CheckCircle2,
    XCircle,
    Trash2,
    Search,
    UserCog,
    MoreHorizontal,
    ArrowDown,
    ArrowUp,
    ChevronsUpDownIcon as ChevronUpDown,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { User, UnauthorizedResponse } from "@/schemas/types"
import { setRole, deleteUser, setRoleInDB, deleteUserFromDB } from "@/actions/adminActions"
import { isAdmin } from "@/actions/roleActions"
import { toast } from "sonner"
import AccessDeniedPage from "./access-denied"

// Available roles for the setRole action
const availableRoles = ["USER", "ADMIN"]

type SortField = "name" | "email" | "role" | "isActive" | "lastLogin" | "loginAttempts"
type SortDirection = "asc" | "desc" | null

interface UsersTableProps {
    initialUsers: User[] | UnauthorizedResponse;
}

export function UsersTable({ initialUsers }: UsersTableProps) {

    if ('message' in initialUsers) return <AccessDeniedPage />

    const [users, setUsers] = useState<User[]>(initialUsers)
    const [searchQuery, setSearchQuery] = useState("")
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [newRole, setNewRole] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const [sortField, setSortField] = useState<SortField | null>(null)
    const [sortDirection, setSortDirection] = useState<SortDirection>(null)

    // Handle sorting logic
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            // Toggle direction if already sorting by this field
            if (sortDirection === "asc") {
                setSortDirection("desc")
            } else if (sortDirection === "desc") {
                setSortField(null)
                setSortDirection(null)
            } else {
                setSortDirection("asc")
            }
        } else {
            // Start with ascending sort for new field
            setSortField(field)
            setSortDirection("asc")
        }
    }

    const filteredUsers = users
        .filter(
            (user) =>
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.role.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        .sort((a, b) => {
            if (!sortField || !sortDirection) return 0

            const direction = sortDirection === "asc" ? 1 : -1

            switch (sortField) {
                case "name":
                    return direction * a.name.localeCompare(b.name)
                case "email":
                    return direction * a.email.localeCompare(b.email)
                case "role":
                    return direction * a.role.localeCompare(b.role)
                case "isActive":
                    return direction * (a.isActive === b.isActive ? 0 : a.isActive ? -1 : 1)
                case "lastLogin":
                    if (a.lastLogin === null && b.lastLogin === null) return 0
                    if (a.lastLogin === null) return direction
                    if (b.lastLogin === null) return -direction
                    return direction * (new Date(a.lastLogin).getTime() - new Date(b.lastLogin).getTime())
                case "loginAttempts":
                    return direction * (a.loginAttempts - b.loginAttempts)
                default:
                    return 0
            }
        })

    // Implementation using server action to set user role
    const handleSetRole = async () => {
        if (!selectedUser || !newRole) return

        try {
            setIsLoading(true)
            const response = await setRole(isAdmin, selectedUser.id, newRole, setRoleInDB)

            if ('message' in response) {
                // Handle error
                toast(`Error changing role: ${response.message}`)
            } else {
                // Update local state with the updated user
                setUsers(users.map((user) => (user.id === selectedUser.id ? { ...user, role: newRole } : user)))
                toast(`${selectedUser.name}'s role has been updated to ${newRole}.`,)
            }
        } catch (error) {
            toast("An unexpected error occurred. Please try again.")
            console.error("Error changing role:", error)
        } finally {
            setIsLoading(false)
            setIsRoleDialogOpen(false)
            setSelectedUser(null)
            setNewRole("")
        }
    }

    // Implementation using server action to delete a user
    const handleDeleteUser = async () => {
        if (!selectedUser) return

        try {
            setIsLoading(true)
            const response = await deleteUser(isAdmin, selectedUser.id, deleteUserFromDB)

            if ('message' in response) {
                // Handle error
                toast(`Error deleting user: ${response.message}`)
            } else {
                // Remove the user from the local state
                setUsers(users.filter((user) => user.id !== selectedUser.id))
                toast(`${selectedUser.name} has been permanently removed.`)
            }
        } catch (error) {
            toast("An unexpected error occurred. Please try again.")
            console.error("Error deleting user:", error)
        } finally {
            setIsLoading(false)
            setIsDeleteDialogOpen(false)
            setSelectedUser(null)
        }
    }

    // Format date for display
    const formatDate = (date: Date | string | null) => {
        if (!date) return "Never"
        return new Date(date).toLocaleString()
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search users..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>
                                <button
                                    onClick={() => handleSort("name")}
                                    className="flex items-center hover:text-primary focus:outline-none"
                                >
                                    Name
                                    {sortField === "name" ? (
                                        sortDirection === "asc" ? (
                                            <ArrowUp className="ml-1 h-4 w-4" />
                                        ) : (
                                            <ArrowDown className="ml-1 h-4 w-4" />
                                        )
                                    ) : (
                                        <ChevronUpDown className="ml-1 h-4 w-4 opacity-50" />
                                    )}
                                </button>
                            </TableHead>
                            <TableHead>
                                <button
                                    onClick={() => handleSort("email")}
                                    className="flex items-center hover:text-primary focus:outline-none"
                                >
                                    Email
                                    {sortField === "email" ? (
                                        sortDirection === "asc" ? (
                                            <ArrowUp className="ml-1 h-4 w-4" />
                                        ) : (
                                            <ArrowDown className="ml-1 h-4 w-4" />
                                        )
                                    ) : (
                                        <ChevronUpDown className="ml-1 h-4 w-4 opacity-50" />
                                    )}
                                </button>
                            </TableHead>
                            <TableHead>
                                <button
                                    onClick={() => handleSort("role")}
                                    className="flex items-center hover:text-primary focus:outline-none"
                                >
                                    Role
                                    {sortField === "role" ? (
                                        sortDirection === "asc" ? (
                                            <ArrowUp className="ml-1 h-4 w-4" />
                                        ) : (
                                            <ArrowDown className="ml-1 h-4 w-4" />
                                        )
                                    ) : (
                                        <ChevronUpDown className="ml-1 h-4 w-4 opacity-50" />
                                    )}
                                </button>
                            </TableHead>
                            <TableHead>
                                <button
                                    onClick={() => handleSort("isActive")}
                                    className="flex items-center hover:text-primary focus:outline-none"
                                >
                                    Status
                                    {sortField === "isActive" ? (
                                        sortDirection === "asc" ? (
                                            <ArrowUp className="ml-1 h-4 w-4" />
                                        ) : (
                                            <ArrowDown className="ml-1 h-4 w-4" />
                                        )
                                    ) : (
                                        <ChevronUpDown className="ml-1 h-4 w-4 opacity-50" />
                                    )}
                                </button>
                            </TableHead>
                            <TableHead>
                                <button
                                    onClick={() => handleSort("lastLogin")}
                                    className="flex items-center hover:text-primary focus:outline-none"
                                >
                                    Last Login
                                    {sortField === "lastLogin" ? (
                                        sortDirection === "asc" ? (
                                            <ArrowUp className="ml-1 h-4 w-4" />
                                        ) : (
                                            <ArrowDown className="ml-1 h-4 w-4" />
                                        )
                                    ) : (
                                        <ChevronUpDown className="ml-1 h-4 w-4 opacity-50" />
                                    )}
                                </button>
                            </TableHead>
                            <TableHead>
                                <button
                                    onClick={() => handleSort("loginAttempts")}
                                    className="flex items-center hover:text-primary focus:outline-none"
                                >
                                    Login Attempts
                                    {sortField === "loginAttempts" ? (
                                        sortDirection === "asc" ? (
                                            <ArrowUp className="ml-1 h-4 w-4" />
                                        ) : (
                                            <ArrowDown className="ml-1 h-4 w-4" />
                                        )
                                    ) : (
                                        <ChevronUpDown className="ml-1 h-4 w-4 opacity-50" />
                                    )}
                                </button>
                            </TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === "admin" ? "destructive" : "secondary"}>{user.role}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {user.isActive ? (
                                            <div className="flex items-center">
                                                <CheckCircle2 className="mr-1 h-4 w-4 text-green-500" />
                                                <span>Active</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center">
                                                <XCircle className="mr-1 h-4 w-4 text-red-500" />
                                                <span>Inactive</span>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>{formatDate(user.lastLogin)}</TableCell>
                                    <TableCell>
                                        {user.loginAttempts > 0 ? (
                                            <Badge variant="outline" className="text-amber-500 border-amber-500">
                                                {user.loginAttempts}
                                            </Badge>
                                        ) : (
                                            <span>0</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Open menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setSelectedUser(user)
                                                        setNewRole(user.role)
                                                        setIsRoleDialogOpen(true)
                                                    }}
                                                >
                                                    <UserCog className="mr-2 h-4 w-4" />
                                                    Change Role
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setSelectedUser(user)
                                                        setIsDeleteDialogOpen(true)
                                                    }}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete User
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Change Role Dialog */}
            <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change User Role</DialogTitle>
                        <DialogDescription>
                            Change the role for {selectedUser?.name}. This will update their permissions in the system.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Select a new role:</p>
                            <Select value={newRole} onValueChange={setNewRole}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableRoles.map((role) => (
                                        <SelectItem key={role} value={role}>
                                            {role.charAt(0).toUpperCase() + role.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button onClick={handleSetRole} disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete User Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user account for {selectedUser?.name} and
                            remove their data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700" disabled={isLoading}>
                            {isLoading ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}