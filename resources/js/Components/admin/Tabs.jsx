import React, { useRef } from 'react';
import { Link } from '@inertiajs/react';

export default function Tabs({
    tabs = [],
    activeTab,
    onChange,
    ariaLabel = 'Navigasi bagian',
    className = '',
}) {
    const navigationRef = useRef(null);

    const handleKeyDown = (event) => {
        if (!onChange || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
        let nextIndex = currentIndex;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = tabs.length - 1;
        if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
        if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        const nextTab = tabs[nextIndex];
        if (!nextTab) return;
        onChange(nextTab.id);
        navigationRef.current?.querySelector(`[data-tab-id="${nextTab.id}"]`)?.focus();
    };

    return (
        <div className={`overflow-x-auto border-b border-[#DCE7F3] ${className}`}>
            <nav
                ref={navigationRef}
                className="flex min-w-max items-stretch gap-1"
                aria-label={ariaLabel}
                role={onChange ? 'tablist' : undefined}
                onKeyDown={handleKeyDown}
            >
                {tabs.map((tab) => {
                    const isActive = tab.id === activeTab;
                    const Icon = tab.icon;
                    const itemClassName = `relative inline-flex min-h-12 items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#0B63CE] motion-reduce:transition-none ${
                        isActive
                            ? 'bg-[#EAF5FF]/65 text-[#0B63CE] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#0B63CE]'
                            : 'text-[#6B7C93] hover:bg-[#F8FBFF] hover:text-[#112743]'
                    }`;
                    const content = (
                        <>
                            {Icon && <Icon className="size-4 shrink-0" aria-hidden="true" />}
                            <span>{tab.label}</span>
                            {tab.count !== undefined && tab.count !== null && (
                                <span
                                    className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                                        isActive ? 'bg-[#0B63CE] text-white' : 'bg-[#EAF5FF] text-[#0A3F82]'
                                    }`}
                                >
                                    {tab.count}
                                </span>
                            )}
                        </>
                    );

                    if (tab.href) {
                        return (
                            <Link
                                key={tab.id}
                                href={tab.href}
                                className={itemClassName}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                {content}
                            </Link>
                        );
                    }

                    return (
                        <button
                            key={tab.id}
                            type="button"
                            role="tab"
                            data-tab-id={tab.id}
                            aria-selected={isActive}
                            aria-controls={tab.panelId}
                            tabIndex={isActive ? 0 : -1}
                            onClick={() => onChange?.(tab.id)}
                            className={itemClassName}
                        >
                            {content}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}
