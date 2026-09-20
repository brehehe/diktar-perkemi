import React, { useState } from 'react';
import { ExternalLink, Globe, ShieldAlert, CheckCircle2 } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';

export default function ExternalUrlField({
    url = '',
    onUrlChange,
    sourceName = '',
    onSourceNameChange,
    openMode = 'new_tab',
    onOpenModeChange,
    error,
    className = '',
}) {
    const [testError, setTestError] = useState('');

    const handleTestUrl = () => {
        setTestError('');
        if (!url) {
            setTestError('Masukkan URL terlebih dahulu sebelum menguji.');
            return;
        }

        const trimmed = url.trim();
        if (!trimmed.toLowerCase().startsWith('https://')) {
            setTestError('URL harus diawali dengan https:// demi keamanan portal.');
            return;
        }

        try {
            const parsed = new URL(trimmed);
            const host = parsed.hostname.toLowerCase();
            if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local') || host.endsWith('.test')) {
                setTestError('URL lokal atau localhost tidak diizinkan.');
                return;
            }

            window.open(trimmed, '_blank', 'noopener,noreferrer');
        } catch (e) {
            setTestError('Format tautan tidak valid.');
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Guidance banner */}
            <div className="flex items-start gap-3 p-3.5 bg-[#FFF3E6] border border-[#FFD8A8] rounded-xl text-xs text-[#8F4F00]">
                <Globe className="w-4 h-4 text-[#EE9B25] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                    <p className="font-semibold text-[#112743]">
                        Tautan Buku Digital Eksternal
                    </p>
                    <p className="text-[11px] text-[#6B7C93] leading-relaxed">
                        Tautkan e-book dari repositori digital resmi (Perpusnas, Kempo Digital, dll). Pastikan menggunakan protokol <strong>HTTPS</strong>. Alamat localhost, IP internal, dan script tidak diizinkan.
                    </p>
                </div>
            </div>

            {/* Input URL Buku Digital */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-[#112743]">
                        URL Buku Digital <span className="text-[#FA5252]">*</span>
                    </label>
                    {url && (
                        <button
                            type="button"
                            onClick={handleTestUrl}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0B63CE] hover:text-[#0A3F82] transition-colors"
                        >
                            <ExternalLink className="w-3 h-3" />
                            <span>Uji Tautan</span>
                        </button>
                    )}
                </div>

                <div className="relative">
                    <Input
                        name="external_url"
                        value={url}
                        onChange={(e) => onUrlChange && onUrlChange(e.target.value)}
                        placeholder="https://perpustakaan.kempo.id/buku/pedoman-penataran.pdf"
                        required
                        error={error}
                    />
                </div>

                {testError && (
                    <p className="text-xs text-[#FA5252] flex items-center gap-1 mt-1">
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                        <span>{testError}</span>
                    </p>
                )}
            </div>

            {/* Input Nama Sumber (Opsional) */}
            <Input
                label="Nama Sumber / Repositori (Opsional)"
                name="external_source_name"
                value={sourceName}
                onChange={(e) => onSourceNameChange && onSourceNameChange(e.target.value)}
                placeholder="Contoh: Perpustakaan Nasional RI, Arsip PB PERKEMI, DOAJ"
                helperText="Nama institusi atau penerbit penyedia buku digital."
            />

            {/* Mode Buka */}
            <div className="space-y-2 pt-1">
                <label className="block text-xs font-semibold text-[#112743]">
                    Perilaku Tampilan untuk Pembaca
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                        className={`
                            p-3 rounded-xl border-2 cursor-pointer flex items-start gap-2.5 transition-all
                            ${openMode === 'new_tab'
                                ? 'border-[#0B63CE] bg-[#EAF5FF]/50 text-[#0E2747]'
                                : 'border-[#DCE7F3] bg-white text-[#6B7C93] hover:border-[#BCE0FD]'
                            }
                        `}
                    >
                        <input
                            type="radio"
                            name="external_open_mode"
                            value="new_tab"
                            checked={openMode === 'new_tab'}
                            onChange={() => onOpenModeChange && onOpenModeChange('new_tab')}
                            className="sr-only"
                        />
                        <div className="space-y-0.5">
                            <span className="text-xs font-bold text-[#0E2747] flex items-center gap-1.5">
                                <ExternalLink className="w-3.5 h-3.5 text-[#0B63CE]" />
                                Buka di Tab Baru (Disarankan)
                            </span>
                            <p className="text-[11px] text-[#6B7C93] leading-relaxed">
                                Pembaca diarahkan ke situs sumber asli di tab peramban baru dengan proteksi keamanan.
                            </p>
                        </div>
                    </label>

                    <label
                        className={`
                            p-3 rounded-xl border-2 cursor-pointer flex items-start gap-2.5 transition-all
                            ${openMode === 'embed'
                                ? 'border-[#0B63CE] bg-[#EAF5FF]/50 text-[#0E2747]'
                                : 'border-[#DCE7F3] bg-white text-[#6B7C93] hover:border-[#BCE0FD]'
                            }
                        `}
                    >
                        <input
                            type="radio"
                            name="external_open_mode"
                            value="embed"
                            checked={openMode === 'embed'}
                            onChange={() => onOpenModeChange && onOpenModeChange('embed')}
                            className="sr-only"
                        />
                        <div className="space-y-0.5">
                            <span className="text-xs font-bold text-[#0E2747] flex items-center gap-1.5">
                                <Globe className="w-3.5 h-3.5 text-[#20A47A]" />
                                Sematkan dalam Portal
                            </span>
                            <p className="text-[11px] text-[#6B7C93] leading-relaxed">
                                Tampilkan langsung di portal. Sistem otomatis mengoptimalkan tautan Flipsnack, Google Drive, FlipHTML5, dll.
                            </p>
                        </div>
                    </label>
                </div>
            </div>
        </div>
    );
}
