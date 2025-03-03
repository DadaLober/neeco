'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

export function TableSkeleton() {
  return (
    <div>
      <div className="flex justify-between mb-4 space-x-4">
        <div className="flex space-x-2 flex-grow">
          <div className="animate-pulse bg-gray-200 h-10 w-[180px] rounded"></div>
          <div className="relative flex-grow">
            <div className="animate-pulse bg-gray-200 h-10 w-full rounded"></div>
          </div>
        </div>
        <div className="flex space-x-2">
          <div className="animate-pulse bg-gray-200 h-10 w-24 rounded"></div>
          <div className="animate-pulse bg-gray-200 h-10 w-24 rounded"></div>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            {['Name', 'Email', 'Role', 'Status', 'Last Login', 'Login Attempts', 'Actions'].map((header, index) => (
              <TableHead key={index}>
                <div className="flex items-center justify-between">
                  <div className="animate-pulse bg-gray-200 h-4 w-3/4 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-4 w-4 rounded ml-2"></div>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, index) => (
            <TableRow key={index}>
              {[...Array(7)].map((_, cellIndex) => (
                <TableCell key={cellIndex}>
                  <div className="animate-pulse bg-gray-200 h-4 w-full rounded"></div>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
