"use client";

import { useState, useMemo } from "react";
import { User } from "@/schemas/types";
import { UsersTableActions } from "@/components/admin/user-table-actions";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"; // Import icons
import { Input } from "../ui/input";

interface UsersTableProps {
    users: User[];
}

export function UsersTable({ users }: UsersTableProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortColumn, setSortColumn] = useState<keyof User | null>(null);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null); // Allows resetting sorting

    // Memoized search results
    const filteredUsers = useMemo(() => {
        return users.filter(user =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, users]);

    // Memoized sorting
    const sortedUsers = useMemo(() => {
        if (!sortColumn || !sortOrder) return filteredUsers; // Default order

        return [...filteredUsers].sort((a, b) => {
            const aValue = a[sortColumn] ?? ""; // Handle null values
            const bValue = b[sortColumn] ?? "";

            if (aValue === "" && bValue !== "") return 1; // Move nulls last
            if (bValue === "" && aValue !== "") return -1;

            if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
            if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });
    }, [filteredUsers, sortColumn, sortOrder]);

    // Handle sorting logic
    const handleSort = (column: keyof User) => {
        if (sortColumn === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : sortOrder === "desc" ? null : "asc");
        } else {
            setSortColumn(column);
            setSortOrder("asc");
        }
    };

    // Function to get sorting icon
    const getSortIcon = (column: keyof User) => {
        if (sortColumn === column) {
            return sortOrder === "asc" ? <ArrowUp className="text-blue-600 h-4 w-4 inline" /> :
                sortOrder === "desc" ? <ArrowDown className="text-red-600 h-4 w-4 inline" /> :
                    <ArrowUpDown className="text-gray-400 h-4 w-4 inline" />;
        }
        return <ArrowUpDown className="text-gray-400 h-4 w-4 inline" />; // Default icon
    };

    return (
        <div className="overflow-hidden rounded-md border bg-white shadow">
            {/* Search Input */}
            <div className="p-4 bg-gray-100 border-b">
                <Input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
            </div>

            {/* Table */}
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-200 text-gray-700">
                        {["name", "email", "role", "isActive", "lastLogin", "loginAttempts"].map((column) => (
                            <th
                                key={column}
                                className="px-4 py-3 text-left font-medium cursor-pointer hover:text-blue-600 transition"
                                onClick={() => handleSort(column as keyof User)}
                            >
                                {column.charAt(0).toUpperCase() + column.slice(1)} {" "}
                                {getSortIcon(column as keyof User)}
                            </th>
                        ))}
                        <th className="px-4 py-3 text-left font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y bg-white">
                    {sortedUsers.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                                No users found
                            </td>
                        </tr>
                    ) : (
                        sortedUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition">
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
