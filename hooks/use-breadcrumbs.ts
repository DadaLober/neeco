import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

export type BreadcrumbItem = {
  href: string;
  label: string;
  type: 'link' | 'page';
};

// Custom mapping
const ROUTE_LABELS: { [key: string]: string } = {
  'dashboard': 'Neeco 2 Area 1',
};

export function useBreadcrumbs(): BreadcrumbItem[] {
  const pathname = usePathname();

  return useMemo(() => {
    const pathSegments = pathname.replace(/^\/|\/$/g, '').split('/');

    // Map path segments to breadcrumb items
    return pathSegments.map((segment, index, array) => {
      let label = ROUTE_LABELS[segment] || segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Truncate labels longer than 7 characters with ellipsis
      if (label.length > 14) {
        label = label.substring(0, 14) + '...';
      }

      const href = '/' + pathSegments.slice(0, index + 1).join('/');

      return {
        href,
        label,
        type: index === array.length - 1 ? 'page' : 'link'
      };
    });
  }, [pathname]);
}