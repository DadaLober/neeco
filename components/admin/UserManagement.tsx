'use client'

import { useState, useEffect, useMemo } from 'react';
import {
  getAllUsers,
  updateUserRole,
  toggleUserActivation,
  deleteUser
} from '@/actions/adminActions';
import { getUserRoles } from '@/actions/roleActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, ArrowUpDown, Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';

type User = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  isActive: boolean;
  lastLogin: Date | null;
  loginAttempts: number;
};

type SortKey = keyof Pick<User, 'name' | 'email' | 'role' | 'isActive' | 'lastLogin' | 'loginAttempts'>;
type SortDirection = 'asc' | 'desc';

type SearchColumn = SortKey;

const COLUMN_NAMES: Record<SearchColumn, string> = {
  name: 'Name',
  email: 'Email',
  role: 'Role',
  isActive: 'Status',
  lastLogin: 'Last Login',
  loginAttempts: 'Login Attempts'
};

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchColumns, setSearchColumns] = useState<SearchColumn[]>(['name', 'email', 'role']);
  const [selectedSearchColumn, setSelectedSearchColumn] = useState<SearchColumn>('name');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  // Sorting states
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const fetchedUsers = await getAllUsers();
        const fetchedRoles = await getUserRoles();
        setUsers(fetchedUsers);
        setRoles(fetchedRoles);
      } catch (error) {
        toast.error('Failed to fetch users', { description: error instanceof Error ? error.message : 'Unknown error' });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const toggleSearchColumn = (column: SearchColumn) => {
    setSearchColumns(prev =>
      prev.includes(column)
        ? prev.filter(c => c !== column)
        : [...prev, column]
    );
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // If no search columns are selected, return all users
      if (searchColumns.length === 0) return true;

      // Check if the search term matches any of the selected columns
      return searchColumns.some(column => {
        const value = user[column];

        // Handle null or undefined values
        if (value == null) return false;

        // Convert to string and check if it includes the search term
        return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [users, searchTerm, searchColumns]);

  const sortedUsers = useMemo(() => {
    // If no sorting key is selected, return users in original order
    if (!sortKey) return filteredUsers;

    return [...filteredUsers].sort((a, b) => {
      const valueA = a[sortKey];
      const valueB = b[sortKey];

      // Handle potential null or undefined values
      if (valueA == null) return sortDirection === 'asc' ? 1 : -1;
      if (valueB == null) return sortDirection === 'asc' ? -1 : 1;

      // Special handling for different types
      if (sortKey === 'lastLogin') {
        const dateA = valueA as Date;
        const dateB = valueB as Date;
        return sortDirection === 'asc'
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      if (typeof valueA === 'boolean' && typeof valueB === 'boolean') {
        return sortDirection === 'asc'
          ? (valueA === valueB ? 0 : valueA ? 1 : -1)
          : (valueA === valueB ? 0 : valueA ? -1 : 1);
      }

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortDirection === 'asc'
          ? valueA - valueB
          : valueB - valueA;
      }

      return 0;
    });
  }, [filteredUsers, sortKey, sortDirection]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * usersPerPage;
    return sortedUsers.slice(startIndex, startIndex + usersPerPage);
  }, [sortedUsers, currentPage, usersPerPage]);

  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);

  const handleSort = (key: SortKey) => {
    // If sorting by the same column, toggle direction or reset
    if (sortKey === key) {
      if (sortDirection === 'desc') {
        // Reset sorting when clicked the second time
        setSortKey(null);
        setSortDirection('asc');
      } else {
        // Toggle to descending on the first click
        setSortDirection('desc');
      }
    } else {
      // If sorting by a new column, default to ascending
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const updatedUser = await updateUserRole(userId, newRole);
      setUsers(users.map(user => user.id === userId ? updatedUser : user));
      toast.success('User role updated successfully');
    } catch (error) {
      toast.error('Failed to update user role', { description: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const handleToggleActivation = async (userId: string) => {
    try {
      const updatedUser = await toggleUserActivation(userId);
      setUsers(users.map(user => user.id === userId ? updatedUser : user));
      toast.success(`User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      toast.error('Failed to toggle user activation', { description: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser.id);
      setUsers(users.filter(user => user.id !== selectedUser.id));
      setIsDeleteDialogOpen(false);
      toast.success('User deleted successfully');
    } catch (error) {
      toast.error('Failed to delete user', { description: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const renderLastLogin = (lastLogin: Date | null) => {
    if (!lastLogin) return 'Never';

    try {
      return formatDistanceToNow(lastLogin, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting last login:', error);
      return 'Invalid Date';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between mb-4 space-x-4">
        <div className="flex space-x-2 flex-grow">
          <div className="relative flex-grow flex items-center">
            <Select
              value={selectedSearchColumn}
              onValueChange={(value: SearchColumn) => setSelectedSearchColumn(value)}
            >
              <SelectTrigger className="w-[180px] mr-2">
                <SelectValue placeholder="Search by" />
              </SelectTrigger>
              <SelectContent>
                {(['name', 'email', 'role', 'loginAttempts'] as SearchColumn[]).map(column => (
                  <SelectItem key={column} value={column}>
                    {COLUMN_NAMES[column]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative flex-grow">
              <Input
                placeholder={`Search by ${COLUMN_NAMES[selectedSearchColumn]}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-12"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <Search className="text-gray-400" size={20} />
              </div>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="self-center">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            {(['name', 'email', 'role', 'isActive', 'lastLogin', 'loginAttempts'] as SortKey[]).map(column => (
              <TableHead
                key={column}
                className={cn(
                  "cursor-pointer hover:bg-gray-100 transition-colors",
                  sortKey === column && "bg-green-50"
                )}
                onClick={() => handleSort(column)}
              >
                <div className="flex items-center justify-between">
                  <span>{column === 'isActive' ? 'Status' : column.charAt(0).toUpperCase() + column.slice(1)}</span>
                  <div className="flex items-center">
                    <ArrowUpDown
                      className={cn(
                        "ml-2 h-4 w-4 transition-colors",
                        sortKey === column
                          ? (sortDirection === 'asc'
                            ? "text-green-600 rotate-180"
                            : "text-green-600")
                          : "text-gray-400"
                      )}
                    />
                  </div>
                </div>
              </TableHead>
            ))}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name || 'N/A'}</TableCell>
              <TableCell>{user.email || 'N/A'}</TableCell>
              <TableCell>
                <Select
                  value={user.role}
                  onValueChange={(newRole) => handleRoleChange(user.id, newRole)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Badge variant={user.isActive ? 'default' : 'destructive'}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>{renderLastLogin(user.lastLogin)}</TableCell>
              <TableCell>{user.loginAttempts}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant={user.isActive ? 'destructive' : 'default'}
                    size="sm"
                    onClick={() => handleToggleActivation(user.id)}
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {paginatedUsers.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          No users found
        </div>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the user {selectedUser?.name}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
