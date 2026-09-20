import React, { useState, useRef, useEffect } from 'react';

export default function DropdownMenu({
    trigger,
    items = [],
    align = 'right',
    className = '',
}) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    const alignments = {
        left: 'left-0 origin-top-left',
        right: 'right-0 origin-top-right',
    };

    return (
        <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
            <div onClick={() => setIsOpen(!isOpen)}>
                {trigger}
            </div>

            {isOpen && (
                <div
                    className={`
                        absolute z-40 mt-1.5 min-w-[180px] rounded-lg bg-white shadow-lg border border-[#DCE7F3] py-1 text-xs
                        animate-in fade-in-80 zoom-in-95 duration-100 ${alignments[align] || alignments.right}
                    `}
                >
                    {items.map((item, index) => {
                        if (item.divider) {
                            return <hr key={index} className="my-1 border-[#DCE7F3]" />;
                        }

                        const Icon = item.icon;
                        const isDanger = item.variant === 'danger';

                        return (
                            <button
                                key={index}
                                type="button"
                                disabled={item.disabled}
                                onClick={(e) => {
                                    setIsOpen(false);
                                    if (item.onClick) item.onClick(e);
                                }}
                                className={`
                                    w-full text-left px-3 py-2 flex items-center gap-2.5 transition-colors
                                    ${item.disabled ? 'opacity-40 cursor-not-allowed' : isDanger ? 'text-[#FA5252] hover:bg-[#FDE8EF]' : 'text-[#112743] hover:bg-[#EAF5FF] hover:text-[#0B63CE]'}
                                `}
                            >
                                {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                                <span className="font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
