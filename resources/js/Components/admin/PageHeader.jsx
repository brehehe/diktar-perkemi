import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

export default function PageHeader({
    title,
    description,
    breadcrumbs = [],
    action,
    secondaryAction,
    children,
}) {
    const suppliedBreadcrumbs = breadcrumbs.filter((crumb) => crumb.label?.toLowerCase() !== 'admin');
    const visibleBreadcrumbs = suppliedBreadcrumbs.length > 0 ? suppliedBreadcrumbs : [{ label: title }];
    const pageActions = action || children;

    return (
        <header className="mb-6 border-b border-[#DCE7F3] pb-5 sm:pb-6">
            <nav className="mb-2 overflow-x-auto" aria-label="Breadcrumb">
                <ol className="flex min-w-max items-center gap-1.5 text-xs text-[#6B7C93]">
                    <li>
                        <Link href="/admin" className="rounded-sm transition-colors hover:text-[#0B63CE] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]">
                            Admin
                        </Link>
                    </li>
                    {visibleBreadcrumbs.map((crumb, idx) => (
                        <React.Fragment key={`${crumb.label}-${idx}`}>
                            <li aria-hidden="true">
                                <ChevronRight className="size-3.5 shrink-0 text-[#6B7C93]/50" />
                            </li>
                            <li>
                                {crumb.href ? (
                                    <Link href={crumb.href} className="rounded-sm transition-colors hover:text-[#0B63CE] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]">
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span className="font-medium text-[#112743]" aria-current="page">
                                        {crumb.label}
                                    </span>
                                )}
                            </li>
                        </React.Fragment>
                    ))}
                </ol>
            </nav>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                    <h1 className="text-pretty break-words font-display text-2xl font-bold tracking-tight text-[#0E2747] sm:text-3xl">
                        {title}
                    </h1>
                    {description && (
                        <p className="mt-1 max-w-3xl text-sm leading-6 text-[#6B7C93]">
                            {description}
                        </p>
                    )}
                </div>

                {(pageActions || secondaryAction) && (
                    <div className="flex w-full shrink-0 flex-wrap items-center gap-2.5 sm:w-auto sm:justify-end">
                        {secondaryAction}
                        {pageActions}
                    </div>
                )}
            </div>
        </header>
    );
}
