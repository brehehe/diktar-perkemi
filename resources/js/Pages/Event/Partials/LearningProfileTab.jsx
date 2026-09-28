import { Link } from '@inertiajs/react';
import Button from '../../../Components/ui/Button';
import { Calendar, MapPin, Award, CheckCircle2, FileText, Camera, Shield, Loader2, CreditCard, User, Upload, Trash2, Printer, Info, Save } from 'lucide-react';
import { useLearningRoom } from './LearningRoomContext';

export default function LearningProfileTab() {
    const {
        event,
        participant,
        profileForm,
        photoPreview,
        isSavingProfile,
        profileSuccessMsg,
        setProfileSuccessMsg,
        handleProfilePhotoChange,
        handleRemoveProfilePhoto,
        handleSubmitProfile,
    } = useLearningRoom();

    return (
        <div className="space-y-6">
            {/* Status Success Alert */}
            {profileSuccessMsg && (
                <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-3 text-xs animate-in fade-in duration-300">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span className="font-semibold">{profileSuccessMsg}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setProfileSuccessMsg(null)}
                        className="text-emerald-700 hover:text-emerald-900 font-bold px-2 py-1"
                    >
                        ✕
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* LEFT COLUMN: INFORMASI PENATARAN & DOKUMEN (5 Cols) */}
                <div className="lg:col-span-5 space-y-5">
                    {/* Event Info Card */}
                    <div className="bg-white rounded-2xl border border-[#DCE7F3] shadow-xs overflow-hidden">
                        <div className="bg-[#0E2747] p-5 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-semibold text-[#EE9B25] border border-white/10 mb-2.5">
                                <Info className="w-3 h-3" />
                                <span>Informasi Resmi Penataran</span>
                            </div>
                            <h3 className="font-display font-bold text-base sm:text-lg leading-snug">
                                {event.title || event.name}
                            </h3>
                            <p className="text-xs text-slate-300 mt-1">
                                {event.organizer || 'Pengurus Besar Persaudaraan Bela Diri Kempo Indonesia'}
                            </p>
                        </div>

                        <div className="p-4 sm:p-5 space-y-4 text-xs">
                            <div className="flex items-start gap-3 text-[#112743]">
                                <Calendar className="w-4 h-4 text-[#0B63CE] shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-bold block text-slate-900">Jadwal Pelaksanaan</span>
                                    <span className="text-[#6B7C93]">{event.date_formatted}</span>
                                    <span className="text-[11px] text-[#0B63CE] block mt-0.5 font-medium">
                                        Durasi: {event.duration_days} • Total {event.total_effective_jp} JP ({event.total_sessions} Sesi)
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 text-[#112743]">
                                <MapPin className="w-4 h-4 text-[#0B63CE] shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-bold block text-slate-900">Lokasi / Tempat</span>
                                    <span className="text-[#6B7C93] leading-relaxed">{event.place || 'Dojo PB PERKEMI'}</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 text-[#112743]">
                                <Award className="w-4 h-4 text-[#0B63CE] shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-bold block text-slate-900">Jalur & Kelompok Anda</span>
                                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${participant.track_badge}`}>
                                            {participant.track_code} — {participant.track_name || 'Jalur Penataran'}
                                        </span>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EAF5FF] text-[#0B63CE] border border-[#0B63CE]/20">
                                            Kelompok {participant.rotation_group || '1'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {event.responsible_user_name && (
                                <div className="flex items-start gap-3 text-[#112743]">
                                    <User className="w-4 h-4 text-[#0B63CE] shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-bold block text-slate-900">Penanggung Jawab Event</span>
                                        <span className="text-[#6B7C93]">{event.responsible_user_name}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Dokumen & Kartu Identitas Akses Cepat */}
                    <div className="bg-white rounded-2xl border border-[#DCE7F3] p-4 sm:p-5 shadow-xs space-y-3">
                        <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#0E2747]">
                            Kelengkapan & Dokumen Peserta
                        </h4>

                        <div className="space-y-2 text-xs">
                            {/* ID Card */}
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-[#EAF5FF] text-[#0B63CE] flex items-center justify-center shrink-0">
                                        <CreditCard className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <span className="font-bold text-[#0E2747] block">Kartu Tanda Peserta (ID Card)</span>
                                        <span className="text-[11px] text-[#6B7C93]">Dilengkapi QR Code presensi</span>
                                    </div>
                                </div>
                                <a
                                    href={`/event/${event.slug}/id-card`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0B63CE] text-white font-semibold text-xs hover:bg-[#0A3F82] shadow-2xs transition-colors shrink-0"
                                >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span>Cetak</span>
                                </a>
                            </div>

                            {/* Formulir Pendaftaran */}
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <span className="font-bold text-[#0E2747] block">Formulir Pendaftaran</span>
                                        <span className="text-[11px] text-emerald-700 font-medium">
                                            {participant.registration_form_status === 'verified' ? 'Terverifikasi PB PERKEMI' : 'Sudah Tersimpan'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <Link
                                        href={`/event/${event.slug}/formulir-pendaftaran`}
                                        className="inline-flex items-center px-2.5 py-1.5 rounded-md border border-[#DCE7F3] bg-white text-xs font-semibold text-[#0B63CE] hover:bg-[#EAF5FF]"
                                    >
                                        Lihat
                                    </Link>
                                    <a
                                        href={`/event/${event.slug}/formulir-pendaftaran/cetak`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-2.5 py-1.5 rounded-md border border-[#DCE7F3] bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                    >
                                        Cetak
                                    </a>
                                </div>
                            </div>

                            {/* Pakta Integritas */}
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                        <Shield className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <span className="font-bold text-[#0E2747] block">Pakta Integritas</span>
                                        <span className="text-[11px] text-[#6B7C93]">
                                            {participant.integrity_pact_status === 'signed' ? 'Sudah Bertandatangan' : 'Formulir Integritas'}
                                        </span>
                                    </div>
                                </div>
                                <a
                                    href={`/event/${event.slug}/pakta-integritas`}
                                    className="inline-flex items-center px-3 py-1.5 rounded-md border border-[#DCE7F3] bg-white text-xs font-semibold text-[#0B63CE] hover:bg-[#EAF5FF] shrink-0"
                                >
                                    Buka
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: PROFIL KENSHI & EDIT/TAMBAH PROFIL SENDIRI (7 Cols) */}
                <div className="lg:col-span-7 bg-white rounded-2xl border border-[#DCE7F3] shadow-xs p-4 sm:p-6 space-y-6">
                    <div className="border-b border-[#DCE7F3] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <h3 className="font-display font-bold text-base text-[#0E2747]">
                                Profil & Biodata Kenshi
                            </h3>
                            <p className="text-xs text-[#6B7C93] mt-0.5">
                                Lengkapi dan perbarui data profil Anda sendiri untuk kebutuhan penataran dan kartu peserta.
                            </p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-[#0B63CE] border border-blue-200 w-fit">
                            Data Mandiri
                        </span>
                    </div>

                    <form onSubmit={handleSubmitProfile} className="space-y-5">
                        {/* Foto Profil Peserta */}
                        <div className="p-4 rounded-xl bg-[#F8FBFF] border border-[#DCE7F3] flex flex-col sm:flex-row items-center sm:items-start gap-4">
                            <div className="relative group shrink-0">
                                <div className="w-24 h-32 rounded-lg bg-slate-200 border-2 border-dashed border-[#0B63CE]/40 flex flex-col items-center justify-center overflow-hidden shadow-xs bg-cover bg-center">
                                    {photoPreview ? (
                                        <img
                                            src={photoPreview}
                                            alt="Foto Profil"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-center p-2">
                                            <Camera className="w-6 h-6 text-[#0B63CE] mx-auto mb-1 opacity-70" />
                                            <span className="text-[10px] text-[#6B7C93] font-medium block leading-tight">
                                                Pasfoto 3x4
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 text-center sm:text-left space-y-2">
                                <span className="font-bold text-xs text-[#0E2747] block">Foto Resmi Peserta (Pasfoto)</span>
                                <p className="text-[11px] text-[#6B7C93] leading-relaxed">
                                    Gunakan pasfoto resmi berseragam Karate-gi (Dogi) PERKEMI dengan latar belakang polos. Foto ini akan otomatis terhubung ke Formulir Penataran & ID Card resmi.
                                </p>
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#0B63CE] text-[#0B63CE] bg-white text-xs font-semibold cursor-pointer hover:bg-[#EAF5FF] transition-colors shadow-2xs">
                                        <Upload className="w-3.5 h-3.5" />
                                        <span>{photoPreview ? 'Ganti Foto' : 'Unggah Foto'}</span>
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/jpg,image/webp"
                                            onChange={handleProfilePhotoChange}
                                            className="hidden"
                                        />
                                    </label>
                                    {photoPreview && (
                                        <button
                                            type="button"
                                            onClick={handleRemoveProfilePhoto}
                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 bg-white text-xs font-semibold hover:bg-rose-50 transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            <span>Hapus</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Data Diri Form Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div className="sm:col-span-2">
                                <label className="block font-bold text-[#0E2747] mb-1">
                                    Nama Lengkap Kenshi <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={profileForm.data.name}
                                    onChange={(e) => profileForm.setData('name', e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-[#DCE7F3] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE] text-xs"
                                    placeholder="Contoh: Victor Leonard Harlim"
                                    required
                                />
                                {profileForm.errors.name && (
                                    <p className="text-[11px] text-rose-500 mt-1">{profileForm.errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block font-bold text-[#0E2747] mb-1">
                                    Nomor Induk Kenshi (No. Kenshi / NIK)
                                </label>
                                <input
                                    type="text"
                                    value={profileForm.data.kenshi_id}
                                    onChange={(e) => profileForm.setData('kenshi_id', e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-[#DCE7F3] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE] text-xs font-mono"
                                    placeholder="Contoh: 90.2.13.01.11.001"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block font-bold text-[#0E2747]">
                                        Tingkatan DAN Saat Ini
                                    </label>
                                    <span className="text-[10px] text-[#6B7C93] font-medium bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                        Resmi Terdata
                                    </span>
                                </div>
                                <select
                                    disabled
                                    value={profileForm.data.dan_level}
                                    className="w-full px-3 py-2 rounded-lg border border-[#DCE7F3] bg-slate-100 text-slate-500 cursor-not-allowed text-xs focus:outline-none"
                                >
                                    <option value={1}>I DAN (Sho-Dan)</option>
                                    <option value={2}>II DAN (Ni-Dan)</option>
                                    <option value={3}>III DAN (San-Dan)</option>
                                    <option value={4}>IV DAN (Yon-Dan)</option>
                                    <option value={5}>V DAN (Go-Dan)</option>
                                    <option value={6}>VI DAN (Roku-Dan)</option>
                                    <option value={7}>VII DAN (Nana-Dan)</option>
                                    <option value={8}>VIII DAN (Hachi-Dan)</option>
                                </select>
                                <p className="text-[10px] text-[#6B7C93] mt-1">
                                    Tingkatan DAN ditetapkan oleh PB PERKEMI dan tidak dapat diubah mandiri.
                                </p>
                            </div>

                            <div>
                                <label className="block font-bold text-[#0E2747] mb-1">
                                    Asal Pengprov / Daerah
                                </label>
                                <input
                                    type="text"
                                    value={profileForm.data.origin}
                                    onChange={(e) => profileForm.setData('origin', e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-[#DCE7F3] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE] text-xs"
                                    placeholder="Contoh: Jawa Timur"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-[#0E2747] mb-1">
                                    Asal Dojo / Kota
                                </label>
                                <input
                                    type="text"
                                    value={profileForm.data.dojo}
                                    onChange={(e) => profileForm.setData('dojo', e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-[#DCE7F3] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE] text-xs"
                                    placeholder="Contoh: Dojo UNAIR Surabaya"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-[#0E2747] mb-1">
                                    Nomor Telepon / WhatsApp
                                </label>
                                <input
                                    type="tel"
                                    value={profileForm.data.phone}
                                    onChange={(e) => profileForm.setData('phone', e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-[#DCE7F3] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE] text-xs font-mono"
                                    placeholder="Contoh: 081234567890"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-[#0E2747] mb-1">
                                    Jenis Kelamin
                                </label>
                                <select
                                    value={profileForm.data.gender}
                                    onChange={(e) => profileForm.setData('gender', e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-[#DCE7F3] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE] text-xs bg-white"
                                >
                                    <option value="Laki-laki">Laki-laki</option>
                                    <option value="Perempuan">Perempuan</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold text-[#0E2747] mb-1">
                                    Tempat Lahir
                                </label>
                                <input
                                    type="text"
                                    value={profileForm.data.birth_place}
                                    onChange={(e) => profileForm.setData('birth_place', e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-[#DCE7F3] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE] text-xs"
                                    placeholder="Contoh: Surabaya"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-[#0E2747] mb-1">
                                    Tanggal Lahir
                                </label>
                                <input
                                    type="date"
                                    value={profileForm.data.birth_date}
                                    onChange={(e) => profileForm.setData('birth_date', e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-[#DCE7F3] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE] text-xs"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block font-bold text-[#0E2747] mb-1">
                                    Pekerjaan / Instansi
                                </label>
                                <input
                                    type="text"
                                    value={profileForm.data.occupation}
                                    onChange={(e) => profileForm.setData('occupation', e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-[#DCE7F3] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE] text-xs"
                                    placeholder="Contoh: Pegawai Negeri / Swasta / Mahasiswa"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block font-bold text-[#0E2747] mb-1">
                                    Alamat Domisili Lengkap
                                </label>
                                <textarea
                                    rows={2}
                                    value={profileForm.data.address}
                                    onChange={(e) => profileForm.setData('address', e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-[#DCE7F3] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE] text-xs"
                                    placeholder="Alamat jalan, kelurahan, kecamatan, kota..."
                                />
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DCE7F3]">
                            <button
                                type="submit"
                                disabled={isSavingProfile || profileForm.processing}
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0B63CE] px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0A3F82] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] disabled:opacity-50 transition-colors"
                            >
                                {isSavingProfile || profileForm.processing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Menyimpan Profil...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>Simpan Profil Kenshi</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
