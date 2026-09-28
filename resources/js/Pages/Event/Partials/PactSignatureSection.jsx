import { RotateCcw, Sparkles } from 'lucide-react';
import { useIntegrityPact } from './IntegrityPactContext';

export default function PactSignatureSection() {
    const {
        participant,
        data,
        setData,
        errors,
        canvasRef,
        hasDrawn,
        startDrawing,
        draw,
        stopDrawing,
        clearSignature,
        autoGenerateSignature,
    } = useIntegrityPact();

    return (
        <>
            {/* 5. Tanda Tangan Digital & Materai */}
            <section aria-labelledby="section-signature">
                <h2 id="section-signature" className="flex items-center gap-2 text-sm font-bold text-[#0E2747]">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0B63CE] text-[10px] text-white">
                        5
                    </span>
                    Tanda Tangan Digital & Legalisasi
                </h2>

                <div className="mt-3 grid gap-6 sm:grid-cols-2">
                    <div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-semibold text-[#0E2747]">
                                    Tempat Penandatanganan <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.sign_place}
                                    onChange={(e) => setData('sign_place', e.target.value)}
                                    className="mt-1 block w-full rounded-lg border border-[#DCE7F3] bg-white px-3 py-2 text-xs text-[#0E2747] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#0E2747]">
                                    Tanggal <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={data.sign_date}
                                    onChange={(e) => setData('sign_date', e.target.value)}
                                    className="mt-1 block w-full rounded-lg border border-[#DCE7F3] bg-white px-3 py-2 text-xs text-[#0E2747] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]"
                                    required
                                />
                            </div>
                        </div>

                        {/* Preview Kotak Materai Resmi */}
                        <div className="mt-4 flex items-center gap-4 rounded-xl border border-dashed border-[#DCE7F3] bg-[#F8FBFF] p-4">
                            <div className="flex h-16 w-24 shrink-0 flex-col items-center justify-center rounded-lg border-2 border-emerald-600 bg-emerald-50 text-center">
                                <span className="text-[9px] font-black tracking-widest text-emerald-800 uppercase">MATERAI</span>
                                <span className="text-xs font-black text-emerald-700">Rp 10.000</span>
                            </div>
                            <p className="text-[11px] text-[#6B7C93] leading-snug">
                                Sesuai ketentuan PB PERKEMI, tanda tangan digital Anda akan ditempatkan di atas stempel Materai Rp 10.000 pada salinan cetak resmi.
                            </p>
                        </div>

                        <div className="mt-4">
                            <label className="flex items-start gap-2.5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.agree_pledge}
                                    onChange={(e) => setData('agree_pledge', e.target.checked)}
                                    className="mt-0.5 rounded border-[#DCE7F3] text-[#0B63CE] focus:ring-[#0B63CE]"
                                    required
                                />
                                <span className="text-xs text-[#0E2747] leading-relaxed">
                                    Saya menyatakan telah membaca dan menyetujui seluruh butir Pakta Integritas PB PERKEMI di atas dengan penuh kesadaran dan tanggung jawab.
                                </span>
                            </label>
                            {errors.agree_pledge && (
                                <p className="mt-1 text-xs text-rose-600">{errors.agree_pledge}</p>
                            )}
                        </div>
                    </div>

                    {/* Canvas Pad */}
                    <div>
                        <div className="flex items-center justify-between">
                            <label className="block text-xs font-semibold text-[#0E2747]">
                                Goreskan Tanda Tangan Digital <span className="text-rose-500">*</span>
                            </label>
                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={autoGenerateSignature}
                                    className="inline-flex items-center gap-1 text-[11px] text-[#0B63CE] hover:underline"
                                    title="Buat tanda tangan otomatis dari nama"
                                >
                                    <Sparkles className="h-3 w-3" />
                                    <span>Buat Rapi</span>
                                </button>
                                <span className="text-slate-300">•</span>
                                <button
                                    type="button"
                                    onClick={clearSignature}
                                    className="inline-flex items-center gap-1 text-[11px] text-rose-600 hover:underline"
                                >
                                    <RotateCcw className="h-3 w-3" />
                                    <span>Hapus</span>
                                </button>
                            </div>
                        </div>

                        <div className="relative mt-1 overflow-hidden rounded-xl border border-[#DCE7F3] bg-white shadow-xs touch-none">
                            <canvas
                                ref={canvasRef}
                                width={360}
                                height={160}
                                className="h-40 w-full cursor-crosshair bg-white"
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={stopDrawing}
                            />
                            {!hasDrawn && (
                                <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-slate-300">
                                    Tanda tangani di sini dengan jari / kursor
                                </div>
                            )}
                        </div>

                        <div className="mt-2 text-center text-xs font-bold text-[#0E2747] uppercase tracking-wide">
                            ({data.full_name || participant.name})
                        </div>

                        {errors.signature_data && (
                            <p className="mt-1 text-xs text-rose-600">{errors.signature_data}</p>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
}
