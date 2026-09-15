import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

export default function PageHeader({
    title,
    description,
    breadcrumbs = [],
    action,
    secondaryAction,
}) {
    return (
        <div className="mb-6">
            {/* Breadcrumb */}
            {breadcrumbs.length > 0 && (
                <nav className="flex items-center gap-1.5 text-xs text-[#6B7C93] mb-2" aria-label="Breadcrumb">
                    <Link href="/admin" className="hover:text-[#0B63CE] transition-colors">
                        Admin
                    </Link>
                    {breadcrumbs.map((crumb, idx) => (
                        <React.Fragment key={idx}>
                            <ChevronRight className="w-3.5 h-3.5 text-[#6B7C93]/50 shrink-0" />
                            {crumb.href ? (
                                <Link href={crumb.href} className="hover:text-[#0B63CE] transition-colors">
                                    {crumb.label}
                                </Link>
                            ) : (
                                <span className="text-[#112743] font-medium" aria-current="page">
                                    {crumb.label}
                                </span>
                            )}
                        </React.Fragment>
                    ))}
                </nav>
            )}

            {/* Title & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0E2747]">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-xs sm:text-sm text-[#6B7C93] mt-1 leading-relaxed max-w-3xl">
                            {description}
                        </p>
                    )}
                </div>

                {(action || secondaryAction) && (
                    <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
                        {secondaryAction}
                        {action}
                    </div>
                )}
            </div>
        </div>
    );
}
