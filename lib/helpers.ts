function getSortedFilteredUsers(
    users: User[],
    searchQuery: string,
    sortField: SortField | null,
    sortDirection: SortDirection
): User[] {
    return users
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
}