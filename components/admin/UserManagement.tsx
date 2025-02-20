'use client'

import { useState, useEffect } from 'react';
import { 
  getAllUsers, 
  updateUserRole, 
  toggleUserActivation, 
  deleteUser 
} from '@/actions/userManagementActions';
import { getUserRoles } from '@/actions/roleActions';
import { Button } from '@/components/ui/button';
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

type User = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  isActive: boolean;
  lastLogin: Date | null;
  loginAttempts: number;
};

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const fetchedUsers = await getAllUsers();
        const fetchedRoles = await getUserRoles();
        setUsers(fetchedUsers);
        setRoles(fetchedRoles);
      } catch (error) {
        toast.error('Failed to fetch users', { description: error instanceof Error ? error.message : 'Unknown error' });
      }
    }
    fetchData();
  }, []);

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

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead>Login Attempts</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
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
              <TableCell>{user.lastLogin?.toLocaleString() || 'Never'}</TableCell>
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
