'use client';

import { Fragment } from 'react';
import { useBreadcrumbs } from '@/hooks/use-breadcrumbs';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function DynamicBreadcrumb() {
    const breadcrumbs = useBreadcrumbs();

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                    <Fragment key={crumb.href}>
                        <BreadcrumbItem className={index !== breadcrumbs.length - 1 ? 'hidden md:block' : ''}>
                            {crumb.type === 'link' ? (
                                <BreadcrumbLink href={crumb.href}>
                                    {crumb.label}
                                </BreadcrumbLink>
                            ) : (
                                <BreadcrumbPage>
                                    {crumb.label}
                                </BreadcrumbPage>
                            )}
                        </BreadcrumbItem>
                        {index < breadcrumbs.length - 1 && (
                            <BreadcrumbSeparator className="hidden md:block" />
                        )}
                    </Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
}