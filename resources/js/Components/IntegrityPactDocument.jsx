import React from 'react';

export default function IntegrityPactDocument({ pact = {}, isPrint = false }) {
    const rawType = (pact.pact_type || '').toLowerCase();
    const pactTypeUpper = rawType === 'penguji'
        ? 'PENGUJI'
        : rawType === 'wasit'
            ? 'WASIT'
            : 'PELATIH';

    const roleLabel = rawType === 'penguji'
        ? 'Penguji'
        : rawType === 'wasit'
            ? 'Wasit'
            : 'Pelatih';

    const fullName = pact.full_name || pact.participant_name || '-';
    const birthPlace = pact.birth_place || '-';
    const birthDate = pact.birth_date || '-';
    const danLevel = pact.dan_level || pact.dan_rank || '-';
    const dojo = pact.origin_dojo || pact.dojo || '-';

    const certNumber = pact.certificate_number && pact.certificate_number !== '-'
        ? pact.certificate_number
        : null;

    const formatIndonesianDate = (val) => {
        if (!val || val === '-') return '';
        if (/[a-zA-Z]/.test(val)) return val;
        const parts = String(val).split('-');
        if (parts.length === 3) {
            const months = [
                'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
            ];
            const day = parseInt(parts[2], 10);
            const monthIdx = parseInt(parts[1], 10) - 1;
            const year = parts[0];
            if (monthIdx >= 0 && monthIdx < 12 && !isNaN(day)) {
                return `${day} ${months[monthIdx]} ${year}`;
            }
        }
        return val;
    };

    const formattedValidEndDate = formatIndonesianDate(pact.valid_end_date);
    const validityText = formattedValidEndDate
        ? `(s.d ${formattedValidEndDate})`
        : '';

    const certDisplay = certNumber
        ? `${certNumber} ${validityText}`.trim()
        : (validityText ? `- ${validityText}` : '-');

    return (
        <div
            className={`rounded-xl border border-[#DCE7F3] bg-white p-6 sm:p-8 font-serif text-[11pt] leading-normal text-black print:border-none print:p-0 print:shadow-none print:text-black ${isPrint ? 'shadow-none' : 'shadow-xs'
                }`}
        >
            {/* Kop PB PERKEMI */}
            <div className="border-b-2 border-black pb-3 text-center">
                <div className="font-black text-sm sm:text-base tracking-wider uppercase font-sans">
                    PERSAUDARAAN SHORINJI KEMPO INDONESIA
                </div>
                <div className="font-bold text-xs sm:text-sm tracking-widest uppercase font-sans mt-0.5">
                    PENGURUS BESAR (PB. PERKEMI)
                </div>
            </div>

            {/* Judul Dokumen */}
            <div className="text-center my-4 sm:my-5">
                <h3 className="font-bold text-base sm:text-lg uppercase tracking-wider underline font-sans">
                    PAKTA INTEGRITAS {pactTypeUpper}
                </h3>
            </div>

            <p className="text-xs sm:text-[13px] font-sans mb-3 font-medium text-black">
                Yang bertanda tangan di bawah ini, saya Kenshi Persaudaraan Shorinji Kempo Indonesia:
            </p>

            {/* Data Kenshi Table */}
            <div className="space-y-1.5 font-sans text-xs sm:text-[13px] bg-[#F8FBFF] print:bg-slate-50/60 p-3 sm:p-4 rounded-lg border border-[#DCE7F3] print:border-slate-300 mb-4 sm:mb-5">
                <div className="grid grid-cols-[150px_10px_1fr] sm:grid-cols-[170px_10px_1fr] items-baseline">
                    <span className="text-[#6B7C93] print:text-black">Nama Lengkap</span>
                    <span>:</span>
                    <span className="font-bold text-[#0E2747] print:text-black">{fullName}</span>
                </div>
                <div className="grid grid-cols-[150px_10px_1fr] sm:grid-cols-[170px_10px_1fr] items-baseline">
                    <span className="text-[#6B7C93] print:text-black">Tempat & Tanggal Lahir</span>
                    <span>:</span>
                    <span>{birthPlace}, {birthDate}</span>
                </div>
                <div className="grid grid-cols-[150px_10px_1fr] sm:grid-cols-[170px_10px_1fr] items-baseline">
                    <span className="text-[#6B7C93] print:text-black">Nomor Induk Kenshi (NIK)</span>
                    <span>:</span>
                    <span className="font-mono font-semibold">{pact.kenshi_id_number || '-'}</span>
                </div>
                <div className="grid grid-cols-[150px_10px_1fr] sm:grid-cols-[170px_10px_1fr] items-baseline">
                    <span className="text-[#6B7C93] print:text-black">Tingkatan DAN / Dojo</span>
                    <span>:</span>
                    <span>{danLevel} / {dojo}</span>
                </div>
                <div className="grid grid-cols-[150px_10px_1fr] sm:grid-cols-[170px_10px_1fr] items-baseline">
                    <span className="text-[#6B7C93] print:text-black">No. Sertifikat / Masa Berlaku</span>
                    <span>:</span>
                    <span className="font-semibold text-[#0E2747] print:text-black">{certDisplay}</span>
                </div>
                <div className="grid grid-cols-[150px_10px_1fr] sm:grid-cols-[170px_10px_1fr] items-start">
                    <span className="text-[#6B7C93] print:text-black pt-0.5">Alamat KTP</span>
                    <span className="pt-0.5">:</span>
                    <span className="leading-snug">{pact.id_card_address || '-'}</span>
                </div>
            </div>

            {/* Butir-Butir Komitmen */}
            <div className="space-y-2 font-sans text-xs sm:text-[13px] text-justify leading-relaxed">
                <p className="font-semibold text-[#0E2747] print:text-black">
                    Menyatakan dengan sesungguhnya dan berikrar untuk:
                </p>
                <ol className="list-decimal pl-5 space-y-1.5 sm:space-y-2 text-[#112743] print:text-black">
                    <li>
                        <strong>Kepatuhan & Loyalitas:</strong> Senantiasa taat dan patuh pada Janji Kenshi, Ikrar Kempo, serta Anggaran Dasar dan Anggaran Rumah Tangga (AD/ART) Persaudaraan Shorinji Kempo Indonesia (PERKEMI).
                    </li>
                    <li>
                        <strong>Integritas & Kehormatan:</strong> Menjunjung tinggi kehormatan, kejujuran, sportivitas, serta budi pekerti luhur dalam setiap pelaksanaan tugas dan pergaulan sesama Kenshi.
                    </li>
                    <li>
                        <strong>Profesionalisme Tugas:</strong> Melaksanakan kewajiban dan wewenang sebagai <span className="capitalize font-semibold">{roleLabel}</span> dengan penuh rasa tanggung jawab, dedikasi, keikhlasan, dan tanpa membeda-bedakan dojo maupun daerah.
                    </li>
                    <li>
                        <strong>Penyalahgunaan Wewenang:</strong> Tidak menyalahgunakan sertifikat keahlian, wewenang, jabatan, atau nama organisasi PB PERKEMI untuk kepentingan pribadi maupun pihak lain yang merugikan persaudaraan.
                    </li>
                    <li>
                        <strong>Kesiapan Sanksi:</strong> Bersedia menerima tindakan dan sanksi organisasi sesuai ketentuan dan disiplin PB PERKEMI apabila terbukti melanggar butir-butir pakta integritas ini.
                    </li>
                </ol>
            </div>

            {/* Tanda Tangan 2 Kolom (PB PERKEMI & Kenshi) */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6 mt-8 sm:mt-10 pt-4 font-sans text-xs sm:text-[13px] border-t border-slate-200 print:border-black">
                {/* Kolom Kiri: Verifikasi PB PERKEMI */}
                <div className="text-center flex flex-col justify-between min-h-[140px]">
                    {/* <div>
                        <div className="text-[#6B7C93] print:text-black">Mengetahui / Memverifikasi,</div>
                        <div className="font-bold text-[#0E2747] print:text-black mt-0.5">PB PERKEMI</div>
                    </div>
                    <div className="my-2 flex items-center justify-center min-h-[50px]">
                        {pact.status === 'verified' ? (
                            <div className="rounded-lg border border-emerald-500 bg-emerald-50 print:bg-white print:border-emerald-700 px-3 py-1.5 text-center">
                                <div className="font-bold text-emerald-800 print:text-emerald-900 text-[10px] tracking-wide">
                                    TERVERIFIKASI PB PERKEMI
                                </div>
                                {pact.verified_at && (
                                    <div className="text-[9px] text-emerald-700 print:text-emerald-800">
                                        {pact.verified_at}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <span className="text-slate-400 italic text-[11px] print:text-black">
                                (Menunggu Verifikasi)
                            </span>
                        )}
                    </div>
                    <div>
                        <div className="font-bold text-[#0E2747] print:text-black">
                            {pact.verified_by_name || (pact.status === 'verified' ? 'PB PERKEMI' : 'Admin PB PERKEMI')}
                        </div>
                    </div> */}
                </div>

                {/* Kolom Kanan: Pembuat Pernyataan */}
                <div className="text-center flex flex-col justify-between min-h-[140px]">
                    <div>
                        <div className="text-black">
                            {pact.sign_place || 'Mojokerto'}, {pact.sign_date || '-'}
                        </div>
                        <div className="font-bold mt-0.5 text-black">Pembuat Pernyataan,</div>
                    </div>
                    <div className="my-2 flex items-center justify-center min-h-[50px]">
                        {pact.signature_data ? (
                            <img
                                src={pact.signature_data}
                                alt="Tanda Tangan Digital"
                                className="max-h-14 sm:max-h-16 object-contain"
                            />
                        ) : pact.submission_mode === 'upload' ? (
                            <span className="text-indigo-600 font-medium text-[11px] print:text-black">
                                (Berkas Fisik Terunggah)
                            </span>
                        ) : (
                            <span className="text-slate-400 italic text-[11px] print:text-black">
                                (Belum Ditandatangani)
                            </span>
                        )}
                    </div>
                    <div>
                        <div className="font-bold underline uppercase text-[#0E2747] print:text-black whitespace-nowrap tracking-tight">
                            ({fullName})
                        </div>
                        <div className="text-[10px] sm:text-xs text-[#6B7C93] print:text-black font-mono mt-0.5">
                            NIK: {pact.kenshi_id_number || '-'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
