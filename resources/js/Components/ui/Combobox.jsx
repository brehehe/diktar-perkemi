import React, { useState, useRef, useEffect } from 'react';
import { ChevronsUpDown, Check, Search, X, Loader2 } from 'lucide-react';

export default function Combobox({
    label,
    value,
    onChange,
    options = [],
    placeholder = 'Pilih atau cari...',
    searchPlaceholder = 'Ketik untuk mencari...',
    emptyText = 'Data tidak ditemukan.',
    error,
    helperText,
    required = false,
    disabled = false,
    loading = false,
    clearable = true,
    className = '',
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(0);

    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const listRef = useRef(null);

    const filteredOptions = options.filter((opt) => {
        const text = typeof opt === 'object' ? `${opt.label || opt.name} ${opt.metadata || ''}` : String(opt);
        return text.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const selectedOption = options.find((opt) => {
        const optVal = typeof opt === 'object' ? opt.value ?? opt.id : opt;
        return String(optVal) === String(value);
    });

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setSearchQuery('');
            setHighlightedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    const handleKeyDown = (e) => {
        if (!isOpen) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                e.preventDefault();
                setIsOpen(true);
            }
            return;
        }

        if (e.key === 'Escape') {
            e.preventDefault();
            setIsOpen(false);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredOptions[highlightedIndex]) {
                const opt = filteredOptions[highlightedIndex];
                const optVal = typeof opt === 'object' ? opt.value ?? opt.id : opt;
                onChange(optVal);
                setIsOpen(false);
            }
        }
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange('');
    };

    return (
        <div className={`w-full relative ${className}`} ref={containerRef}>
            {label && (
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#112743] mb-1.5">
                    {label}
                    {required && <span className="text-[#FA5252] ml-1 font-bold" aria-hidden="true">*</span>}
                </label>
            )}

            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                onKeyDown={handleKeyDown}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                className={`
                    w-full flex items-center justify-between rounded-lg bg-white border text-sm text-left px-3.5 py-2 transition-all duration-150
                    ${error ? 'border-[#FA5252] focus:ring-[#FA5252]/20' : 'border-[#DCE7F3] hover:border-[#0B63CE]/50 focus:border-[#0B63CE] focus:ring-[#0B63CE]/20'}
                    focus:outline-none focus:ring-3
                    disabled:bg-[#F8FBFF] disabled:text-[#6B7C93] disabled:cursor-not-allowed
                `}
            >
                <div className="flex items-center gap-2 truncate pr-2">
                    {selectedOption ? (
                        <>
                            {selectedOption.color && (
                                <span
                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                    style={{ backgroundColor: selectedOption.color }}
                                />
                            )}
                            <span className="text-[#112743] font-medium truncate">
                                {selectedOption.label || selectedOption.name}
                            </span>
                        </>
                    ) : (
                        <span className="text-[#6B7C93]/70">{placeholder}</span>
                    )}
                </div>

                <div className="flex items-center gap-1 shrink-0 text-[#6B7C93]">
                    {clearable && !required && selectedOption && !disabled && (
                        <span
                            role="button"
                            tabIndex={0}
                            onClick={handleClear}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    handleClear(e);
                                }
                            }}
                            aria-label="Hapus pilihan"
                            className="p-1 hover:text-[#FA5252] hover:bg-[#F8FBFF] rounded transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </span>
                    )}
                    <ChevronsUpDown className="w-4 h-4" />
                </div>
            </button>

            {isOpen && (
                <div
                    className="absolute z-50 mt-1.5 w-full bg-white rounded-lg shadow-xl border border-[#DCE7F3] overflow-hidden text-sm"
                    onKeyDown={handleKeyDown}
                >
                    <div className="p-2 border-b border-[#DCE7F3] bg-[#F8FBFF]">
                        <div className="relative">
                            <Search className="w-3.5 h-3.5 text-[#6B7C93] absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#DCE7F3] rounded-md text-[#112743] placeholder-[#6B7C93]/60 focus:outline-none focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]"
                            />
                        </div>
                    </div>

                    <ul
                        ref={listRef}
                        role="listbox"
                        className="max-h-60 overflow-y-auto py-1 divide-y divide-[#DCE7F3]/30"
                    >
                        {loading && (
                            <li className="px-3 py-4 text-center text-xs text-[#6B7C93] flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-[#0B63CE]" />
                                <span>Memuat data...</span>
                            </li>
                        )}

                        {!loading && filteredOptions.length === 0 && (
                            <li className="px-3 py-4 text-center text-xs text-[#6B7C93]">
                                {emptyText}
                            </li>
                        )}

                        {!loading &&
                            filteredOptions.map((opt, index) => {
                                const optVal = typeof opt === 'object' ? opt.value ?? opt.id : opt;
                                const optLabel = typeof opt === 'object' ? opt.label ?? opt.name : opt;
                                const isSelected = String(optVal) === String(value);
                                const isHighlighted = index === highlightedIndex;

                                return (
                                    <li
                                        key={String(optVal)}
                                        role="option"
                                        aria-selected={isSelected}
                                        onMouseEnter={() => setHighlightedIndex(index)}
                                        onClick={() => {
                                            onChange(optVal);
                                            setIsOpen(false);
                                        }}
                                        className={`
                                            px-3.5 py-2 flex items-center justify-between cursor-pointer transition-colors text-xs
                                            ${isHighlighted ? 'bg-[#EAF5FF] text-[#0B63CE]' : 'text-[#112743]'}
                                            ${isSelected ? 'font-semibold' : 'font-normal'}
                                        `}
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            {opt.color && (
                                                <span
                                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                                    style={{ backgroundColor: opt.color }}
                                                />
                                            )}
                                            <span className="truncate">{optLabel}</span>
                                            {opt.meta && (
                                                <span className="text-[10px] text-[#6B7C93] bg-[#F8FBFF] px-1.5 py-0.5 rounded border border-[#DCE7F3]">
                                                    {opt.meta}
                                                </span>
                                            )}
                                        </div>

                                        {isSelected && (
                                            <Check className="w-3.5 h-3.5 text-[#0B63CE] shrink-0 ml-2" />
                                        )}
                                    </li>
                                );
                            })}
                    </ul>
                </div>
            )}

            {error && (
                <p className="mt-1.5 text-xs text-[#FA5252] font-medium flex items-center gap-1">
                    <span>{error}</span>
                </p>
            )}
            {!error && helperText && (
                <p className="mt-1.5 text-xs text-[#6B7C93]">
                    {helperText}
                </p>
            )}
        </div>
    );
}
