import * as React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    MoreHorizontal,
    Search,
    SortAsc,
    SortDesc,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type Column<T> = {
    header: string;
    accessorKey: keyof T;
    filterAccessor?: string; // Add this property for nested objects filtering
    cell?: (item: T) => React.ReactNode;
    sortable?: boolean;
    filterable?: boolean; // Property to indicate if the column is filterable
};

export type CardTableProps<T> = {
    data: T[];
    columns: Column<T>[];
    title?: string;
    description?: string;
    pageSize?: number;
    searchable?: boolean;
    searchPlaceholder?: string;
    onRowClick?: (item: T) => void;
    rowActions?: {
        label: string;
        onClick: (item: T) => void;
    }[];
    className?: string;
};

// Helper function to get a value from an object using a path string (e.g. "department.name")
const getValueByPath = (obj: Record<string, unknown>, path: string): unknown => {
    return path.split('.').reduce<unknown>((acc, part) => {
        if (typeof acc === 'object' && acc !== null && part in acc) {
            return (acc as Record<string, unknown>)[part];
        }
        return undefined;
    }, obj);
};

export function CardTable<T extends Record<string, unknown>>({
    data,
    columns,
    title,
    description,
    pageSize = 5,
    searchable = false,
    searchPlaceholder = "Search...",
    onRowClick,
    rowActions,
    className,
}: CardTableProps<T>) {
    const [page, setPage] = React.useState(1);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [filters, setFilters] = React.useState<Record<keyof T, string>>({} as Record<keyof T, string>); // State for filters
    const [sortConfig, setSortConfig] = React.useState<{
        key: keyof T | null;
        direction: "asc" | "desc";
    }>({ key: null, direction: "asc" });

    // Reset page to 1 when searchQuery or filters change
    React.useEffect(() => {
        setPage(1);
    }, [searchQuery, filters]);

    // Filter data based on search query and filters
    const filteredData = React.useMemo(() => {
        let result = data;

        // Apply search query
        if (searchQuery) {
            result = result.filter((item) =>
                Object.values(item).some((value) => value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())),
            );
        }

        // Apply filters
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== "all") {
                const column = columns.find(col => col.accessorKey === key);

                result = result.filter((item) => {
                    let itemValue;

                    if (column?.filterAccessor) {
                        itemValue = getValueByPath(item, column.filterAccessor);
                    } else {
                        itemValue = item[key];
                    }

                    // Handle null/undefined values
                    if (itemValue === null || itemValue === undefined) {
                        return value === "None";
                    }

                    return String(itemValue).toLowerCase() === value.toLowerCase();
                });
            }
        });

        return result;
    }, [data, searchQuery, filters, columns]);

    // Sort data based on sort config
    const sortedData = React.useMemo(() => {
        if (!sortConfig.key) return filteredData;
        return [...filteredData].sort((a, b) => {
            const aValue = a[sortConfig.key || ""];
            const bValue = b[sortConfig.key || ""];

            if (aValue === bValue) return 0;

            if (sortConfig.direction === "asc") {
                return aValue < bValue ? -1 : 1;
            } else {
                return aValue > bValue ? -1 : 1;
            }
        });
    }, [filteredData, sortConfig]);

    // Paginate data
    const paginatedData = React.useMemo(() => {
        const startIndex = (page - 1) * pageSize;
        return sortedData.slice(startIndex, startIndex + pageSize);
    }, [sortedData, page, pageSize]);

    const totalPages = Math.ceil(sortedData.length / pageSize);

    // Handle sorting
    const handleSort = (key: keyof T) => {
        setSortConfig((prev) => {
            if (prev.key === key) {
                return {
                    key,
                    direction: prev.direction === "asc" ? "desc" : "asc",
                };
            }
            return { key, direction: "asc" };
        });
    };

    // Handle pagination
    const goToPage = (newPage: number) => {
        setPage(Math.max(1, Math.min(newPage, totalPages)));
    };

    // Handle filter change
    const handleFilterChange = (key: keyof T, value: string) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value === "all" ? "" : value, // Convert "all" to empty string for clear filtering
        }));
    };

    // Reusable pagination controls component
    const PaginationControls = () => (
        <div className="flex items-center justify-between w-full">
            <div className="text-sm text-muted-foreground">Page {page} of {totalPages}</div>
            <div className="flex space-x-2">
                <Button onClick={() => goToPage(1)} disabled={page === 1} size="sm"><ChevronsLeft className="h-4 w-4" /></Button>
                <Button onClick={() => goToPage(page - 1)} disabled={page === 1} size="sm"><ChevronLeft className="h-4 w-4" /></Button>
                <Button onClick={() => goToPage(page + 1)} disabled={page === totalPages} size="sm"><ChevronRight className="h-4 w-4" /></Button>
                <Button onClick={() => goToPage(totalPages)} disabled={page === totalPages} size="sm"><ChevronsRight className="h-4 w-4" /></Button>
            </div>
        </div>
    );

    return (
        <Card className={cn("w-full", className)}>
            {(title || description || searchable) && (
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            {title && <CardTitle>{title}</CardTitle>}
                            {description && <CardDescription>{description}</CardDescription>}
                        </div>
                        {searchable && (
                            <div className="flex items-center gap-4">
                                <div className="relative max-w-sm">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder={searchPlaceholder}
                                        className="pl-8"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                {/* Render filters for filterable columns */}
                                {columns
                                    .filter((column) => column.filterable)
                                    .map((column) => {
                                        // Extract unique values for the filter options
                                        const uniqueValues = [...new Set(data.map((item) => {
                                            let value;
                                            if (column.filterAccessor) {
                                                value = getValueByPath(item, column.filterAccessor);
                                            } else {
                                                value = item[column.accessorKey];
                                            }
                                            return value !== undefined && value !== null ? String(value) : "None";
                                        }))].sort();

                                        return (
                                            <Select
                                                key={column.header as string}
                                                onValueChange={(value) => handleFilterChange(column.accessorKey, value)}
                                                value={filters[column.accessorKey] || "all"}
                                            >
                                                <SelectTrigger className="w-[180px]">
                                                    <SelectValue placeholder={`Filter by ${column.header}`} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All</SelectItem>
                                                    {uniqueValues.map((value) => (
                                                        <SelectItem key={value} value={value}>
                                                            {value}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        );
                                    })}
                            </div>
                        )}
                    </div>
                </CardHeader>
            )}
            <CardContent>
                <div className="overflow-x-auto hidden sm:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableHead key={column.header as string}>
                                        <div className="flex items-center gap-1">
                                            {column.header}
                                            {column.sortable && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => handleSort(column.accessorKey)}
                                                >
                                                    {sortConfig.key === column.accessorKey ? (
                                                        sortConfig.direction === "asc" ? (
                                                            <SortAsc className="h-3 w-3" />
                                                        ) : (
                                                            <SortDesc className="h-3 w-3" />
                                                        )
                                                    ) : (
                                                        <SortAsc className="h-3 w-3 text-muted-foreground/50" />
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </TableHead>
                                ))}
                                {rowActions && <TableHead className="w-[80px]"></TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length + (rowActions ? 1 : 0)} className="h-24 text-center">
                                        No results found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map((item, index) => (
                                    <TableRow
                                        key={index}
                                        className={cn(onRowClick && "cursor-pointer hover:bg-muted/50")}
                                        onClick={onRowClick ? () => onRowClick(item) : undefined}
                                    >
                                        {columns.map((column) => (
                                            <TableCell key={`${index}-${column.header as string}`}>
                                                {column.cell
                                                    ? column.cell(item)
                                                    : item[column.accessorKey] !== undefined
                                                        ? String(item[column.accessorKey])
                                                        : ""}
                                            </TableCell>
                                        ))}
                                        {rowActions && (
                                            <TableCell className="text-right">
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-" onClick={(e) => e.stopPropagation()}>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent align="end" className="w-36 p-1">
                                                        {rowActions.map((action, actionIndex) => (
                                                            <Button
                                                                key={actionIndex}
                                                                variant="ghost"
                                                                className="w-full text-sm px-2 py-1.5 justify-center"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    action.onClick(item)
                                                                }}
                                                            >
                                                                {action.label}
                                                            </Button>
                                                        ))}
                                                    </PopoverContent>
                                                </Popover>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                {/* Mobile card view for small screens */}
                <div className="grid grid-cols-1 gap-4 sm:hidden">
                    {/* Mobile pagination at the top */}
                    {totalPages > 1 && (
                        <div className="mb-4">
                            <PaginationControls />
                        </div>
                    )}

                    {paginatedData.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground">No results found.</div>
                    ) : (
                        paginatedData.map((item, index) => (
                            <Card
                                key={index}
                                className={cn("overflow-hidden", onRowClick && "cursor-pointer hover:bg-muted/50")}
                                onClick={onRowClick ? () => onRowClick(item) : undefined}
                            >
                                <CardContent className="p-4">
                                    <div className="space-y-3">
                                        {columns.map((column) => (
                                            <div key={`${index}-${column.header as string}`} className="flex flex-col">
                                                <span className="text-sm font-medium text-muted-foreground">{column.header}</span>
                                                <div>
                                                    {column.cell
                                                        ? column.cell(item)
                                                        : item[column.accessorKey] !== undefined
                                                            ? String(item[column.accessorKey])
                                                            : ""}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>

                                {rowActions && (
                                    <CardFooter className="flex justify-end p-2 pt-0 border-t">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    Actions <MoreHorizontal className="ml-2 h-4 w-4" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent align="end" className="w-40 p-2">
                                                <div className="flex flex-col space-y-2">
                                                    {rowActions.map((action, actionIndex) => (
                                                        <Button
                                                            key={actionIndex}
                                                            variant="ghost"
                                                            size="sm"
                                                            className="justify-start w-full"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                action.onClick(item)
                                                            }}
                                                        >
                                                            {action.label}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </CardFooter>
                                )}
                            </Card>
                        ))
                    )}

                    {/* Mobile pagination at the bottom */}
                    {totalPages > 1 && (
                        <div className="mt-4">
                            <PaginationControls />
                        </div>
                    )}
                </div>
            </CardContent>
            {/* Desktop pagination in footer */}
            {totalPages > 1 && (
                <CardFooter className="hidden sm:flex items-center justify-between">
                    <PaginationControls />
                </CardFooter>
            )}
        </Card>
    );
}