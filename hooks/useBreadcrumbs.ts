import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

// Define a type for breadcrumb items
export type BreadcrumbItem = {
  href: string;
  label: string;
  type: 'link' | 'page';
};

// Custom mapping for specific routes to improve readability
const ROUTE_LABELS: { [key: string]: string } = {
  'dashboard': 'Dashboard',
  'analytics': 'Analytics',
  'user-profile': 'Profile',
  'settings': 'Settings',
  'billing': 'Billing',
  'team': 'Team Management',
};

export function useBreadcrumbs(): BreadcrumbItem[] {
  const pathname = usePathname();

  return useMemo(() => {
    // Remove leading and trailing slashes, split the path
    const pathSegments = pathname.replace(/^\/|\/$/g, '').split('/');
    
    // Map path segments to breadcrumb items
    return pathSegments.map((segment, index, array) => {
      // Use custom label mapping or fallback to formatted segment
      const label = ROUTE_LABELS[segment] || segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      // Construct the href by joining path segments up to this point
      const href = '/' + pathSegments.slice(0, index + 1).join('/');
      
      // If it's the last segment, it's the current page
      return {
        href,
        label,
        type: index === array.length - 1 ? 'page' : 'link'
      };
    });
  }, [pathname]);
}
