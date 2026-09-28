import { PenTool, RotateCcw } from 'lucide-react';
import { useRegistrationForm } from './RegistrationFormContext';

export default function RegistrationSignatureSection() {
    const {
        data,
        setData,
        errors,
        clientErrors,
        setClientErrors,
        canvasRef,
        hasNewSignature,
        startDrawing,
        draw,
        stopDrawing,
        clearSignature,
        generateAutoSignature,
        allErrors,
    } = useRegistrationForm();

    return (
        <>
            {/* BAGIAN VIII: PENANDATANGANAN & TANDA TANGAN DIGITAL */}
            <div className="rounded-xl border border-[#DCE7F3] bg-white p-6 shadow-xs">
                <div className="mb-5 flex items-center gap-2 border-b border-[#DCE7F3] pb-3">
                    <PenTool className="h-5 w-5 text-[#0B63CE]" />
                    <h2 className="font-display text-base font-bold text-[#0E2747]">
                        VIII. Tempat, Tanggal & Tanda Tangan Pemohon
                    </h2>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-[#112743]">
                                Tempat Penandatanganan <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.sign_place}
                                onChange={(e) => {
                                    setData('sign_place', e.target.value);
                                    if (clientErrors.sign_place) {
                                        setClientErrors((prev) => {
                                            const c = { ...prev };
                                            delete c.sign_place;
                                            return c;
                                        });
                                    }
                                }}
                                placeholder="Kota Penandatanganan (misal: Mojokerto)"
                                className={`mt-1 block w-full rounded-md border ${allErrors.sign_place ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-[#DCE7F3] focus:border-[#0B63CE]'} px-3 py-2 text-xs text-[#112743] focus:outline-none`}
                                required
                            />
                            {allErrors.sign_place && <p className="mt-1 text-[11px] text-rose-500 font-medium">{allErrors.sign_place}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[#112743]">
                                Tanggal Penandatanganan <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={data.sign_date}
                                onChange={(e) => {
                                    setData('sign_date', e.target.value);
                                    if (clientErrors.sign_date) {
                                        setClientErrors((prev) => {
                                            const c = { ...prev };
                                            delete c.sign_date;
                                            return c;
                                        });
                                    }
                                }}
                                className={`mt-1 block w-full rounded-md border ${allErrors.sign_date ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-[#DCE7F3] focus:border-[#0B63CE]'} px-3 py-2 text-xs text-[#112743] focus:outline-none`}
                                required
                            />
                            {allErrors.sign_date && <p className="mt-1 text-[11px] text-rose-500 font-medium">{allErrors.sign_date}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[#112743]">
                                Nama Lengkap Pemohon <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.applicant_name}
                                onChange={(e) => {
                                    setData('applicant_name', e.target.value);
                                    if (clientErrors.applicant_name) {
                                        setClientErrors((prev) => {
                                            const c = { ...prev };
                                            delete c.applicant_name;
                                            return c;
                                        });
                                    }
                                }}
                                className={`mt-1 block w-full rounded-md border ${allErrors.applicant_name ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-[#DCE7F3] focus:border-[#0B63CE]'} px-3 py-2 text-xs text-[#112743] focus:outline-none`}
                                required
                            />
                            {allErrors.applicant_name && <p className="mt-1 text-[11px] text-rose-500 font-medium">{allErrors.applicant_name}</p>}
                        </div>
                    </div>

                    {/* Canvas Drawing Signature Pad */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-semibold text-[#112743]">
                                Goreskan Tanda Tangan Pemohon <span className="text-rose-500">*</span>
                            </label>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={generateAutoSignature}
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0B63CE] hover:text-[#0A3F82] bg-[#EAF5FF] px-2 py-0.5 rounded"
                                    title="Buat tanda tangan otomatis berdasarkan nama"
                                >
                                    <PenTool className="h-3 w-3" />
                                    Tanda Tangan Otomatis
                                </button>
                                <button
                                    type="button"
                                    onClick={clearSignature}
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-800"
                                >
                                    <RotateCcw className="h-3 w-3" />
                                    Bersihkan Pad
                                </button>
                            </div>
                        </div>

                        {/* Existing Signature Preview if available */}
                        {data.signature_data && !hasNewSignature && (
                            <div className="mb-2 rounded-lg border border-dashed border-[#DCE7F3] bg-[#F8FBFF] p-2 text-center">
                                <p className="text-[10px] text-[#6B7C93] mb-1">Tanda tangan tersimpan:</p>
                                <img
                                    src={data.signature_data}
                                    alt="Tanda Tangan Pemohon"
                                    className="mx-auto max-h-16 object-contain"
                                />
                                <p className="mt-1 text-[10px] text-[#0B63CE]">
                                    Gunakan canvas di bawah jika ingin memperbarui tanda tangan.
                                </p>
                            </div>
                        )}

                        <div className="relative touch-none rounded-lg border-2 border-dashed border-[#DCE7F3] bg-white p-1 hover:border-[#0B63CE] transition-colors">
                            <canvas
                                ref={canvasRef}
                                width={480}
                                height={180}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={stopDrawing}
                                className="w-full h-36 bg-white cursor-crosshair rounded"
                            />
                            <div className="pointer-events-none absolute bottom-2 right-2 text-[10px] text-[#6B7C93] opacity-60">
                                Gambar tanda tangan di sini
                            </div>
                        </div>
                        {errors.signature_data && <p className="mt-1 text-[11px] text-rose-500">{errors.signature_data}</p>}
                    </div>
                </div>
            </div>
        </>
    );
}
