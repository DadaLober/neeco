'use client'

// React core imports
import { useState, useEffect, useMemo } from 'react';

// Item Action imports
import {
    getAllItems,
    updateItemStatus,
    toggleItemOIC,
    updateItemEmpId,
    deleteItem
} from '@/actions/itemActions';
import { getItemTypes } from '@/actions/itemActions';

// UI Component imports
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

// Icons
import { ArrowUpDown, Search, MoreHorizontal, UserCheck, Pencil, Trash2 } from 'lucide-react';

// Utility and Notification imports
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Import the ItemManagementSkeleton
import { TableSkeleton } from './TableSkeleton';

type Item = {
    id: string;
    referenceNo: string;
    itemType: string;
    status: string;
    empId: string;
    oic: boolean;
    date: Date;
    time: Date;
};

type SortKey = keyof Pick<Item, 'referenceNo' | 'itemType' | 'status' | 'empId' | 'oic' | 'date' | 'time'>;
type SortDirection = 'asc' | 'desc';

type SearchColumn = SortKey;

const COLUMN_NAMES: Record<SearchColumn, string> = {
    referenceNo: 'Reference No',
    itemType: 'Item Type',
    status: 'Status',
    empId: 'Employee ID',
    oic: 'OIC',
    date: 'Date',
    time: 'Time'
};

// Status color mapping
const STATUS_COLORS = {
    'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
    'Processing': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
    'Completed': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
    'Rejected': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' }
};

const ItemManagementEmptyState = () => {
    return (
        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
            </svg>
            <h2 className="text-xl font-semibold text-gray-600 mb-2">No Items Found</h2>
            <p className="text-gray-500 text-center mb-4">
                There are currently no items in the system.
            </p>
        </div>
    );
};

export default function DashboardTable() {
    // Base data states
    const [items, setItems] = useState<Item[]>([]);
    const [itemTypes, setItemTypes] = useState<string[]>([]);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditEmpIdDialogOpen, setIsEditEmpIdDialogOpen] = useState(false);
    const [newEmpId, setNewEmpId] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [searchColumns, setSearchColumns] = useState<SearchColumn[]>(['referenceNo', 'itemType', 'status', 'empId']);
    const [selectedSearchColumn, setSelectedSearchColumn] = useState<SearchColumn>('referenceNo');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    // Sorting states
    const [sortKey, setSortKey] = useState<SortKey | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    // Memoized filtered items
    const filteredItems = useMemo(() => {
        return items.filter(item => {
            // If no search columns are selected, return all items
            if (searchColumns.length === 0) return true;

            // Check if the search term matches any of the selected columns
            return searchColumns.some(column => {
                const value = item[column];
                if (value instanceof Date) {
                    return format(value, 'yyyy-MM-dd').includes(searchTerm.toLowerCase());
                }
                if (typeof value === 'boolean') {
                    return searchTerm.toLowerCase() === value.toString();
                }
                const searchValue = String(value).toLowerCase();
                return searchValue.includes(searchTerm.toLowerCase());
            });
        });
    }, [items, searchTerm, searchColumns]);

    // Memoized sorted items
    const sortedItems = useMemo(() => {
        if (!sortKey) return filteredItems;

        return [...filteredItems].sort((a, b) => {
            const valueA = a[sortKey];
            const valueB = b[sortKey];

            if (valueA == null) return sortDirection === 'asc' ? 1 : -1;
            if (valueB == null) return sortDirection === 'asc' ? -1 : 1;

            if (typeof valueA === 'string' && typeof valueB === 'string') {
                return sortDirection === 'asc'
                    ? valueA.localeCompare(valueB)
                    : valueB.localeCompare(valueA);
            }

            if (typeof valueA === 'number' && typeof valueB === 'number') {
                return sortDirection === 'asc'
                    ? valueA - valueB
                    : valueB - valueA;
            }

            if (typeof valueA === 'boolean' && typeof valueB === 'boolean') {
                return sortDirection === 'asc'
                    ? Number(valueA) - Number(valueB)
                    : Number(valueB) - Number(valueA);
            }

            if (valueA instanceof Date && valueB instanceof Date) {
                return sortDirection === 'asc'
                    ? valueA.getTime() - valueB.getTime()
                    : valueB.getTime() - valueA.getTime();
            }

            return 0;
        });
    }, [filteredItems, sortKey, sortDirection]);

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedItems = sortedItems.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                setIsLoading(true);
                const fetchedItems = await getAllItems();
                const fetchedItemTypes = await getItemTypes();

                // Convert string dates to Date objects
                const parsedItems = fetchedItems.map(item => ({
                    ...item,
                    date: new Date(item.date),
                    time: new Date(item.time)
                }));

                setItems(parsedItems);
                setItemTypes(fetchedItemTypes);
            } catch (error) {
                toast.error('Failed to fetch items', { description: error instanceof Error ? error.message : 'Unknown error' });
            } finally {
                setIsLoading(false);
            }
        };

        fetchItems();
    }, []);

    if (isLoading) {
        return <TableSkeleton />;
    }

    if (items.length === 0) {
        return <ItemManagementEmptyState />;
    }

    const toggleSearchColumn = (column: SearchColumn) => {
        setSearchColumns(prev =>
            prev.includes(column)
                ? prev.filter(c => c !== column)
                : [...prev, column]
        );
    };

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

    const handleStatusChange = async (itemId: string, newStatus: string) => {
        try {
            const updatedItem = await updateItemStatus(itemId, newStatus);
            // Convert date strings to Date objects
            updatedItem.date = new Date(updatedItem.date);
            updatedItem.time = new Date(updatedItem.time);

            setItems(items.map(item => item.id === itemId ? updatedItem : item));
            toast.success('Item status updated successfully');
        } catch (error) {
            toast.error('Failed to update item status', { description: error instanceof Error ? error.message : 'Unknown error' });
        }
    };

    const handleToggleOIC = async (itemId: string) => {
        try {
            const updatedItem = await toggleItemOIC(itemId);
            // Convert date strings to Date objects
            updatedItem.date = new Date(updatedItem.date);
            updatedItem.time = new Date(updatedItem.time);

            setItems(items.map(item => item.id === itemId ? updatedItem : item));
            toast.success(`Item ${updatedItem.oic ? 'assigned to OIC' : 'removed from OIC'} successfully`);
        } catch (error) {
            toast.error('Failed to toggle OIC status', { description: error instanceof Error ? error.message : 'Unknown error' });
        }
    };

    const handleUpdateEmpId = async () => {
        if (!selectedItem || !newEmpId) return;

        try {
            const updatedItem = await updateItemEmpId(selectedItem.id, newEmpId);
            // Convert date strings to Date objects
            updatedItem.date = new Date(updatedItem.date);
            updatedItem.time = new Date(updatedItem.time);

            setItems(items.map(item => item.id === selectedItem.id ? updatedItem : item));
            setIsEditEmpIdDialogOpen(false);
            setNewEmpId('');
            toast.success('Employee ID updated successfully');
        } catch (error) {
            toast.error('Failed to update employee ID', { description: error instanceof Error ? error.message : 'Unknown error' });
        }
    };

    const handleDeleteItem = async () => {
        if (!selectedItem) return;

        try {
            await deleteItem(selectedItem.id);
            setItems(items.filter(item => item.id !== selectedItem.id));
            setIsDeleteDialogOpen(false);
            toast.success('Item deleted successfully');
        } catch (error) {
            toast.error('Failed to delete item', { description: error instanceof Error ? error.message : 'Unknown error' });
        }
    };

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
                                {(['referenceNo', 'itemType', 'status', 'empId'] as SearchColumn[]).map(column => (
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
                        Page {currentPage} of {Math.ceil(sortedItems.length / itemsPerPage)}
                    </span>
                    <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(sortedItems.length / itemsPerPage)))}
                        disabled={currentPage === Math.ceil(sortedItems.length / itemsPerPage)}
                    >
                        Next
                    </Button>
                </div>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        {(['referenceNo', 'itemType', 'status', 'empId', 'oic', 'date'] as SortKey[]).map(column => (
                            <TableHead
                                key={column}
                                className={cn(
                                    "cursor-pointer hover:bg-gray-100 transition-colors",
                                    sortKey === column && "bg-green-50"
                                )}
                                onClick={() => handleSort(column)}
                            >
                                <div className="flex items-center justify-between">
                                    <span>{COLUMN_NAMES[column]}</span>
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
                    {paginatedItems.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>{item.referenceNo}</TableCell>
                            <TableCell>
                                <Select
                                    value={item.itemType}
                                    onValueChange={(newItemType) => {
                                        // Update item type locally until server-side function is available
                                        setItems(items.map(i =>
                                            i.id === item.id
                                                ? { ...i, itemType: newItemType }
                                                : i
                                        ));
                                        toast.info("Item type changes are displayed locally. Server update functionality is not implemented yet.");
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select item type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {itemTypes.length > 0 ? (
                                            itemTypes.map((type) => (
                                                <SelectItem key={type} value={type}>{type}</SelectItem>
                                            ))
                                        ) : (
                                            // Default options if no item types are fetched
                                            ['Request Voucher', 'Purchase Order'].map((type) => (
                                                <SelectItem key={type} value={type}>{type}</SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </TableCell>
                            <TableCell>
                                <Select
                                    value={item.status}
                                    onValueChange={(newStatus) => handleStatusChange(item.id, newStatus)}
                                >
                                    <SelectTrigger className={cn(
                                        "rounded-md px-2 py-1 text-xs font-medium border",
                                        STATUS_COLORS[item.status as keyof typeof STATUS_COLORS]?.bg || "bg-gray-100",
                                        STATUS_COLORS[item.status as keyof typeof STATUS_COLORS]?.text || "text-gray-800",
                                        STATUS_COLORS[item.status as keyof typeof STATUS_COLORS]?.border || "border-gray-200"
                                    )}>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {['Pending', 'Processing', 'Completed', 'Rejected'].map((status) => (
                                            <SelectItem key={status} value={status}>{status}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </TableCell>
                            <TableCell>{item.empId}</TableCell>
                            <TableCell>
                                <Badge variant={item.oic ? 'default' : 'outline'}>
                                    {item.oic ? 'Yes' : 'No'}
                                </Badge>
                            </TableCell>
                            <TableCell>{format(item.date, 'yyyy-MM-dd')}</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            onClick={() => handleToggleOIC(item.id)}
                                            className={item.oic ? "text-red-600" : "text-green-600"}
                                        >
                                            <UserCheck className="mr-2 h-4 w-4" />
                                            {item.oic ? 'Remove OIC' : 'Assign OIC'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setSelectedItem(item);
                                                setNewEmpId(item.empId);
                                                setIsEditEmpIdDialogOpen(true);
                                            }}
                                        >
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Edit Emp ID
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setSelectedItem(item);
                                                setIsDeleteDialogOpen(true);
                                            }}
                                            className="text-red-600"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {paginatedItems.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                    No items found
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Item</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the item with Reference No: {selectedItem?.referenceNo}?
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
                            onClick={handleDeleteItem}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Employee ID Dialog */}
            <Dialog open={isEditEmpIdDialogOpen} onOpenChange={setIsEditEmpIdDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Employee ID</DialogTitle>
                        <DialogDescription>
                            Update the employee ID for item with Reference No: {selectedItem?.referenceNo}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            value={newEmpId}
                            onChange={(e) => setNewEmpId(e.target.value)}
                            placeholder="Enter new employee ID"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsEditEmpIdDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="default"
                            onClick={handleUpdateEmpId}
                            disabled={!newEmpId}
                        >
                            Update
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}