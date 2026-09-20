import React, { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronsUpDown, Loader2, Search, X } from 'lucide-react';

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
    id,
    name,
}) {
    const generatedId = useId();
    const inputId = id || name || generatedId;
    const listboxId = `${inputId}-listbox`;
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const listRef = useRef(null);

    const optionValue = (option) => (typeof option === 'object' ? option.value ?? option.id : option);
    const optionLabel = (option) => (typeof option === 'object' ? option.label ?? option.name : option);
    const filteredOptions = options.filter((option) => {
        const text = typeof option === 'object'
            ? `${optionLabel(option) || ''} ${option.metadata || option.meta || ''}`
            : String(option);

        return text.toLowerCase().includes(searchQuery.toLowerCase());
    });
    const selectedOption = options.find((option) => String(optionValue(option)) === String(value));

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
        if (!isOpen) return;

        setSearchQuery('');
        setHighlightedIndex(0);
        const timer = window.setTimeout(() => inputRef.current?.focus(), 50);
        return () => window.clearTimeout(timer);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        listRef.current?.querySelector(`[data-option-index="${highlightedIndex}"]`)?.scrollIntoView({ block: 'nearest' });
    }, [highlightedIndex, isOpen]);

    const chooseOption = (option) => {
        onChange(optionValue(option));
        setIsOpen(false);
    };

    const handleKeyDown = (event) => {
        if (!isOpen) {
            if (['Enter', ' ', 'ArrowDown'].includes(event.key)) {
                event.preventDefault();
                setIsOpen(true);
            }
            return;
        }

        if (event.key === 'Escape') {
            event.preventDefault();
            setIsOpen(false);
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            setHighlightedIndex((current) => (current < filteredOptions.length - 1 ? current + 1 : 0));
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setHighlightedIndex((current) => (current > 0 ? current - 1 : Math.max(filteredOptions.length - 1, 0)));
        } else if (event.key === 'Enter' && filteredOptions[highlightedIndex]) {
            event.preventDefault();
            chooseOption(filteredOptions[highlightedIndex]);
        }
    };

    return (
        <div className={`relative w-full ${className}`} ref={containerRef}>
            {label && (
                <label htmlFor={inputId} className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#112743]">
                    {label}
                    {required && <span className="ml-1 font-bold text-[#DD4D7C]" aria-hidden="true">*</span>}
                </label>
            )}

            <div className="relative">
                <button
                    id={inputId}
                    type="button"
                    role="combobox"
                    disabled={disabled}
                    onClick={() => !disabled && setIsOpen((open) => !open)}
                    onKeyDown={handleKeyDown}
                    aria-haspopup="listbox"
                    aria-controls={listboxId}
                    aria-expanded={isOpen}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
                    className={`min-h-11 w-full rounded-lg border bg-white px-3.5 py-2 text-left text-sm transition-colors duration-150 focus:outline-none focus:ring-3 motion-reduce:transition-none disabled:cursor-not-allowed disabled:bg-[#F8FBFF] disabled:text-[#6B7C93] ${
                        error
                            ? 'border-[#DD4D7C] focus:ring-[#DD4D7C]/20'
                            : 'border-[#DCE7F3] hover:border-[#0B63CE]/50 focus:border-[#0B63CE] focus:ring-[#0B63CE]/20'
                    }`}
                >
                    <span className="flex min-w-0 items-center gap-2 truncate pr-14">
                        {selectedOption ? (
                            <>
                                {selectedOption.color && <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: selectedOption.color }} />}
                                <span className="truncate font-medium text-[#112743]">{optionLabel(selectedOption)}</span>
                            </>
                        ) : (
                            <span className="truncate text-[#6B7C93]/70">{placeholder}</span>
                        )}
                    </span>
                    <ChevronsUpDown className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#6B7C93]" aria-hidden="true" />
                </button>

                {clearable && !required && selectedOption && !disabled && (
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            onChange('');
                        }}
                        aria-label="Hapus pilihan"
                        className="absolute right-8 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded text-[#6B7C93] hover:bg-[#FDE8EF] hover:text-[#DD4D7C] focus-visible:outline-2 focus-visible:outline-[#0B63CE]"
                    >
                        <X className="size-3.5" />
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-lg border border-[#DCE7F3] bg-white text-sm shadow-xl" onKeyDown={handleKeyDown}>
                    <div className="border-b border-[#DCE7F3] bg-[#F8FBFF] p-2">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#6B7C93]" aria-hidden="true" />
                            <input
                                ref={inputRef}
                                type="search"
                                value={searchQuery}
                                onChange={(event) => {
                                    setSearchQuery(event.target.value);
                                    setHighlightedIndex(0);
                                }}
                                placeholder={searchPlaceholder}
                                aria-label={searchPlaceholder}
                                aria-controls={listboxId}
                                aria-activedescendant={filteredOptions[highlightedIndex] ? `${inputId}-option-${highlightedIndex}` : undefined}
                                className="min-h-10 w-full rounded-md border border-[#DCE7F3] bg-white py-2 pl-9 pr-3 text-xs text-[#112743] placeholder:text-[#6B7C93]/60 focus:border-[#0B63CE] focus:outline-none focus:ring-2 focus:ring-[#0B63CE]/20"
                            />
                        </div>
                    </div>

                    <ul id={listboxId} ref={listRef} role="listbox" className="max-h-60 overflow-y-auto py-1">
                        {loading && (
                            <li className="flex items-center justify-center gap-2 px-3 py-4 text-center text-xs text-[#6B7C93]">
                                <Loader2 className="size-4 animate-spin text-[#0B63CE] motion-reduce:animate-none" aria-hidden="true" />
                                <span>Memuat data...</span>
                            </li>
                        )}
                        {!loading && filteredOptions.length === 0 && <li className="px-3 py-4 text-center text-xs text-[#6B7C93]">{emptyText}</li>}
                        {!loading && filteredOptions.map((option, index) => {
                            const currentValue = optionValue(option);
                            const isSelected = String(currentValue) === String(value);
                            const isHighlighted = index === highlightedIndex;

                            return (
                                <li
                                    key={String(currentValue)}
                                    id={`${inputId}-option-${index}`}
                                    data-option-index={index}
                                    role="option"
                                    aria-selected={isSelected}
                                    onMouseEnter={() => setHighlightedIndex(index)}
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={() => chooseOption(option)}
                                    className={`flex min-h-10 cursor-pointer items-center justify-between px-3.5 py-2 text-xs transition-colors motion-reduce:transition-none ${
                                        isHighlighted ? 'bg-[#EAF5FF] text-[#0B63CE]' : 'text-[#112743]'
                                    } ${isSelected ? 'font-semibold' : 'font-normal'}`}
                                >
                                    <span className="flex min-w-0 items-center gap-2 truncate">
                                        {option.color && <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: option.color }} />}
                                        <span className="truncate">{optionLabel(option)}</span>
                                        {option.meta && <span className="rounded border border-[#DCE7F3] bg-[#F8FBFF] px-1.5 py-0.5 text-[10px] text-[#6B7C93]">{option.meta}</span>}
                                    </span>
                                    {isSelected && <Check className="ml-2 size-3.5 shrink-0 text-[#0B63CE]" aria-hidden="true" />}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {error && <p id={`${inputId}-error`} role="alert" className="mt-1.5 text-xs font-medium text-[#DD4D7C]">{error}</p>}
            {!error && helperText && <p id={`${inputId}-helper`} className="mt-1.5 text-xs text-[#6B7C93]">{helperText}</p>}
        </div>
    );
}
