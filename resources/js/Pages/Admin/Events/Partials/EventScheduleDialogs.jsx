import Button from '../../../../Components/ui/Button';
import Modal from '../../../../Components/ui/Modal';
import FormField from '../../../../Components/ui/FormField';
import Input from '../../../../Components/ui/Input';
import Select from '../../../../Components/ui/Select';
import Checkbox from '../../../../Components/ui/Checkbox';
import Combobox from '../../../../Components/ui/Combobox';
import { Clock, BookOpen, Award, AlertCircle } from 'lucide-react';
import { useEventShow } from './EventShowContext';

export default function EventScheduleDialogs() {
    const {
        event,
        availableMasterModules,
        availableMasterCbtPackages,
        speakers,
        rooms,
        tracks,
        sessionTypes,
        publishedMaterials,
        selectedDay,
        isSessionModalOpen,
        setIsSessionModalOpen,
        editingSession,
        selectedSessionLinks,
        setSelectedSessionLinks,
        sessionForm,
        isRescheduleModalOpen,
        setIsRescheduleModalOpen,
        reschedulingSession,
        setReschedulingSession,
        rescheduleForm,
        handleSaveSession,
        handleQuickShift,
        handleSaveReschedule,
        daysList,
        getDayDateObj,
        getDayDateInfo,
        getDayIsoDate,
    } = useEventShow();

    return (
        <>
            {/* MODAL: Tambah / Edit Sesi Rundown */}
            <Modal
                isOpen={isSessionModalOpen}
                onClose={() => setIsSessionModalOpen(false)}
                title={editingSession ? 'Edit Sesi Rundown' : `Tambah Sesi Rundown (Hari ${selectedDay})`}
                size="2xl"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsSessionModalOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" form="session-form" variant="primary" loading={sessionForm.processing}>
                            Simpan Sesi
                        </Button>
                    </>
                }
            >
                <form id="session-form" onSubmit={handleSaveSession} className="space-y-4">
                    {Object.keys(sessionForm.errors).length > 0 && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                            <div className="space-y-1">
                                <p className="font-bold text-rose-900">Periksa kembali data sesi yang diinput:</p>
                                <ul className="list-disc list-inside space-y-0.5 text-rose-700">
                                    {Object.entries(sessionForm.errors).map(([field, msg]) => (
                                        <li key={field}>{msg}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <FormField label="Hari ke-" required error={sessionForm.errors.day_number}>
                            <Select
                                value={sessionForm.data.day_number}
                                onChange={(e) => {
                                    const newDay = parseInt(e.target.value) || 1;
                                    sessionForm.setData((prev) => ({
                                        ...prev,
                                        day_number: newDay,
                                        session_date: getDayIsoDate(newDay),
                                    }));
                                }}
                            >
                                {daysList.map((day) => {
                                    const dateInfo = getDayDateInfo(day);
                                    return (
                                        <option key={day} value={day}>
                                            Hari {day} {dateInfo ? `(${dateInfo})` : ''}
                                        </option>
                                    );
                                })}
                            </Select>
                        </FormField>

                        <FormField label="Nomor Sesi" required error={sessionForm.errors.session_number}>
                            <Input
                                value={sessionForm.data.session_number}
                                onChange={(e) => sessionForm.setData('session_number', e.target.value)}
                                placeholder="Sesi 1"
                                required
                            />
                        </FormField>

                        <FormField label="Durasi (JP)" required error={sessionForm.errors.duration_jp}>
                            <Input
                                type="number"
                                min={sessionForm.data.session_type_code === 'KEHADIRAN_HARIAN' ? '0' : '1'}
                                value={sessionForm.data.duration_jp}
                                onChange={(e) => sessionForm.setData('duration_jp', Number(e.target.value))}
                                disabled={sessionForm.data.session_type_code === 'KEHADIRAN_HARIAN'}
                                required
                            />
                        </FormField>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Waktu Mulai" required error={sessionForm.errors.start_time}>
                            <Input
                                type="time"
                                value={sessionForm.data.start_time}
                                onChange={(e) => sessionForm.setData('start_time', e.target.value)}
                                required
                            />
                        </FormField>

                        <FormField label="Waktu Selesai" required error={sessionForm.errors.end_time}>
                            <Input
                                type="time"
                                value={sessionForm.data.end_time}
                                onChange={(e) => sessionForm.setData('end_time', e.target.value)}
                                required
                            />
                        </FormField>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Jenis Sesi" required error={sessionForm.errors.event_session_type_id || sessionForm.errors.session_type_code}>
                            <Select
                                value={sessionForm.data.session_type_code === 'KEHADIRAN_HARIAN' ? 'daily' : sessionForm.data.event_session_type_id}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === 'daily') {
                                        sessionForm.setData((current) => ({
                                            ...current,
                                            event_session_type_id: '',
                                            session_type_code: 'KEHADIRAN_HARIAN',
                                            duration_jp: 0,
                                            attendance_setting: 'check_in',
                                            learning_module_id: '',
                                            event_module_id: '',
                                            material_id: '',
                                            cbt_exam_package_id: '',
                                        }));
                                    } else {
                                        const st = sessionTypes.find((item) => String(item.id) === String(val));
                                        const isCbt = st?.code === 'UJIAN' || st?.code === 'CBT' || st?.name?.toLowerCase().includes('ujian') || st?.name?.toLowerCase().includes('cbt');
                                        sessionForm.setData((current) => ({
                                            ...current,
                                            event_session_type_id: val,
                                            session_type_code: st?.code || '',
                                            duration_jp: current.duration_jp === 0 ? 1 : (current.duration_jp || 1),
                                            attendance_setting: current.attendance_setting || 'check_in',
                                            learning_module_id: isCbt ? '' : current.learning_module_id,
                                            event_module_id: isCbt ? '' : current.event_module_id,
                                            material_id: isCbt ? '' : current.material_id,
                                            cbt_exam_package_id: isCbt ? current.cbt_exam_package_id : '',
                                            requires_attendance_before_cbt: isCbt ? true : current.requires_attendance_before_cbt,
                                        }));
                                    }
                                }}
                            >
                                <option value="daily">Kehadiran Harian (QR awal hari)</option>
                                {sessionTypes.map((st) => (
                                    <option key={st.id} value={st.id}>
                                        {st.name}
                                    </option>
                                ))}
                            </Select>
                        </FormField>

                        <FormField label="Pengaturan Absensi" error={sessionForm.errors.attendance_setting}>
                            <Select
                                value={sessionForm.data.attendance_setting}
                                onChange={(e) => sessionForm.setData('attendance_setting', e.target.value)}
                            >
                                <option value="check_in">Absensi Masuk Saja</option>
                                <option value="check_in_out">Absensi Masuk & Keluar</option>
                                <option value="none">Tidak Diperlukan</option>
                            </Select>
                            <p className="mt-1 text-xs text-[#6B7C93]">Sesi yang memuat materi atau ujian wajib memakai absensi masuk.</p>
                        </FormField>
                    </div>

                    <FormField label="Topik / Judul Materi Sesi" required error={sessionForm.errors.topic}>
                        <Input
                            value={sessionForm.data.topic}
                            onChange={(e) => sessionForm.setData('topic', e.target.value)}
                            placeholder="Contoh: Falsafah Shorinji Kempo & Penyeragaman Goho"
                            required
                        />
                    </FormField>

                    {/* Kondisi Berdasarkan Jenis Sesi Sesuai Blueprint Antar-Master */}
                    {(() => {
                        const selectedSessionType = sessionTypes.find((st) => String(st.id) === String(sessionForm.data.event_session_type_id));
                        const stCode = selectedSessionType?.code || '';
                        const stName = selectedSessionType?.name?.toLowerCase() || '';

                        const isMateriType = stCode === 'MATERI' || stCode.startsWith('PAR_') || stName.includes('materi') || stName.includes('paralel') || stName.includes('teori');
                        const isCbtType = stCode === 'UJIAN' || stCode === 'CBT' || stName.includes('ujian') || stName.includes('cbt');
                        const isPraktikType = stCode === 'PRAKTIK' || stName.includes('praktik');
                        const isIstirahatType = stCode === 'ISTIRAHAT' || stName.includes('istirahat') || stName.includes('ishoma');

                        const activeSelectedLearningModule = availableMasterModules.find((lm) => String(lm.id) === String(sessionForm.data.learning_module_id));

                        if (sessionForm.data.session_type_code === 'KEHADIRAN_HARIAN') {
                            return <p className="border border-[#DCE7F3] bg-[#EAF5FF] p-3 text-sm text-[#112743]">QR ini mencatat kehadiran awal hari. Peserta harus memindainya sebelum dapat absen ke sesi lain pada tanggal yang sama.</p>;
                        }

                        if (isIstirahatType) {
                            return (
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-[#6B7C93]">
                                    Sesi Istirahat & Ishoma tidak memerlukan keterhubungan dengan Modul Pembelajaran maupun Paket CBT.
                                </div>
                            );
                        }

                        if (isCbtType) {
                            return (
                                <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-xl space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Award className="w-4 h-4 text-purple-700" />
                                        <span className="font-bold text-xs text-[#0E2747]">Konfigurasi Sesi Ujian CBT</span>
                                    </div>
                                    <Combobox
                                        label="Pilih Paket Ujian CBT (Status Siap Digunakan / Dibuka)"
                                        value={sessionForm.data.cbt_exam_package_id}
                                        onChange={(value) => sessionForm.setData('cbt_exam_package_id', value)}
                                        options={availableMasterCbtPackages.map((pkg) => ({ value: pkg.id, label: `[${pkg.code}] ${pkg.title} (${pkg.exam_type_label || pkg.exam_type} - ${pkg.duration_minutes}m - ${pkg.status})` }))}
                                        placeholder="Pilih paket CBT tersedia"
                                        searchPlaceholder="Cari kode atau nama paket CBT…"
                                        error={sessionForm.errors.cbt_exam_package_id}
                                        required
                                    />

                                    <Checkbox
                                        checked={Boolean(sessionForm.data.requires_attendance_before_cbt)}
                                        onChange={(e) => sessionForm.setData('requires_attendance_before_cbt', e.target.checked)}
                                        label="Wajibkan absensi masuk sesi sebelum peserta dapat memulai ujian CBT"
                                        helperText="Peserta harus tercatat hadir (scan QR / manual override) pada sesi ini sebelum tombol ujian dapat dibuka."
                                        className="min-h-11 rounded-lg border border-[#DCE7F3] bg-white p-3"
                                    />

                                    <p className="border border-[#DCE7F3] bg-white p-3 text-xs text-[#112743]">Peserta harus absen masuk dengan QR sesi ini sebelum dapat memulai ujian.</p>
                                </div>
                            );
                        }

                        // Materi or Praktik or Pleno
                        return (
                            <div className="space-y-3 p-4 bg-[#F8FBFF] border border-[#DCE7F3] rounded-xl">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-[#0B63CE]" />
                                        <span className="font-bold text-xs text-[#0E2747]">
                                            {isMateriType ? 'Keterhubungan Modul Pembelajaran (Wajib)' : 'Keterhubungan Modul & Materi (Opsional)'}
                                        </span>
                                    </div>
                                    {isMateriType && (
                                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                            Wajib Memilih Modul
                                        </span>
                                    )}
                                </div>

                                <fieldset className="grid gap-2 sm:grid-cols-2">
                                    <legend className="mb-2 text-sm font-semibold text-[#112743]">Pilih jenis keterhubungan</legend>
                                    {[
                                        { value: 'master', label: 'Modul pembelajaran', helperText: 'Kurikulum Diktar & modul event ini' },
                                        { value: 'collection', label: 'Koleksi digital', helperText: 'E-book, video & pustaka PERKEMI' },
                                    ].map((link) => {
                                        const checked = selectedSessionLinks.includes(link.value) || (link.value === 'master' && isMateriType);
                                        return (
                                            <Checkbox
                                                key={link.value}
                                                checked={checked}
                                                disabled={link.value === 'master' && isMateriType}
                                                onChange={(change) => {
                                                    setSelectedSessionLinks((current) => change.target.checked ? [...current, link.value] : current.filter((value) => value !== link.value));
                                                    if (!change.target.checked) {
                                                        sessionForm.setData(link.value === 'master' ? 'learning_module_id' : 'material_id', '');
                                                        if (link.value === 'master') {
                                                            sessionForm.setData('event_module_id', '');
                                                        }
                                                    }
                                                }}
                                                label={link.label}
                                                helperText={link.helperText}
                                                className={`min-h-11 rounded-lg border px-3 py-2 ${checked ? 'border-[#0B63CE] bg-[#EAF5FF]' : 'border-[#DCE7F3] bg-white'}`}
                                            />
                                        );
                                    })}
                                </fieldset>

                                {(selectedSessionLinks.includes('master') || isMateriType) && (
                                    <Combobox
                                        label="Pilih Modul Pembelajaran"
                                        value={sessionForm.data.learning_module_id || ''}
                                        required={isMateriType}
                                        onChange={(modId) => {
                                            const mod = availableMasterModules.find((m) => String(m.id) === String(modId));
                                            sessionForm.setData((prev) => ({
                                                ...prev,
                                                learning_module_id: modId,
                                                topic: prev.topic ? prev.topic : (mod ? mod.title : ''),
                                            }));
                                        }}
                                        options={availableMasterModules.map((module) => ({
                                            value: module.id,
                                            label: `[${module.scope_label || (module.is_master ? 'Master Diktar' : 'Khusus Event')}] [${module.code}] ${module.title} (${module.total_jp} JP - ${module.category || 'Materi'})`
                                        }))}
                                        placeholder="Pilih modul pembelajaran"
                                        searchPlaceholder="Cari kode, nama modul, atau ketik Master / Khusus Event…"
                                        error={sessionForm.errors.learning_module_id}
                                    />
                                )}

                                {selectedSessionLinks.includes('collection') && activeSelectedLearningModule && (
                                    <div className="p-3 rounded-lg bg-white border border-[#DCE7F3] space-y-2">
                                        <div className="flex items-center justify-between text-[11px]">
                                            <span className="font-semibold text-[#0E2747]">Koleksi Digital dalam Modul Ini:</span>
                                            <span className="text-[#6B7C93]">{activeSelectedLearningModule.materials?.length || 0} Terhubung</span>
                                        </div>

                                        <FormField label="Pilih Materi Koleksi Digital Utama Sesi (Opsional)" error={sessionForm.errors.material_id}>
                                            <Select
                                                value={sessionForm.data.material_id || ''}
                                                onChange={(e) => sessionForm.setData('material_id', e.target.value)}
                                            >
                                                <option value="">-- Buka Seluruh Materi Modul Pembelajaran --</option>
                                                {activeSelectedLearningModule.materials?.map((mat) => (
                                                    <option key={mat.id} value={mat.id}>
                                                        [{mat.type === 'video' ? 'VIDEO' : mat.type === 'book' ? 'E-BOOK' : 'DOKUMEN'}] {mat.title}
                                                    </option>
                                                ))}
                                                {publishedMaterials
                                                    .filter((pm) => !activeSelectedLearningModule.materials?.some((m) => m.id === pm.id))
                                                    .map((mat) => (
                                                        <option key={mat.id} value={mat.id}>
                                                            [Koleksi Luar: {mat.type?.toUpperCase()}] {mat.title}
                                                        </option>
                                                    ))}
                                            </Select>
                                        </FormField>
                                    </div>
                                )}

                                {selectedSessionLinks.includes('collection') && !activeSelectedLearningModule && (
                                    <FormField label="Atau Hubungkan Langsung ke Koleksi Buku Digital" error={sessionForm.errors.material_id}>
                                        <Select
                                            value={sessionForm.data.material_id}
                                            onChange={(e) => sessionForm.setData('material_id', e.target.value)}
                                        >
                                            <option value="">-- Tidak Terhubung ke Buku --</option>
                                            {publishedMaterials.map((mat) => (
                                                <option key={mat.id} value={mat.id}>
                                                    [{mat.code}] {mat.title}
                                                </option>
                                            ))}
                                        </Select>
                                    </FormField>
                                )}
                            </div>
                        );
                    })()}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Pemateri / Instruktur" error={sessionForm.errors.speaker_id}>
                            <Select
                                value={sessionForm.data.speaker_id}
                                onChange={(e) => sessionForm.setData('speaker_id', e.target.value)}
                            >
                                <option value="">-- Pilih Pemateri --</option>
                                {speakers.map((sp) => (
                                    <option key={sp.id} value={sp.id}>
                                        {sp.name} ({sp.type_label})
                                    </option>
                                ))}
                            </Select>
                        </FormField>

                        <FormField label="Ruangan / Lokasi" name="event-session-room" error={sessionForm.errors.room}>
                            <Input
                                id="event-session-room"
                                list="event-room-options"
                                value={sessionForm.data.room}
                                onChange={(e) => sessionForm.setData('room', e.target.value)}
                            />
                            <datalist id="event-room-options">{rooms.map((room) => <option key={room.id} value={room.name} />)}</datalist>
                        </FormField>
                    </div>

                    <FormField label="Jalur Peserta yang Mengikuti Sesi" error={sessionForm.errors.target_tracks}>
                        <div className="space-y-2 p-3.5 bg-slate-50 border border-[#DCE7F3] rounded-xl">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-[#6B7C93]">Pilih jalur peserta yang diwajibkan mengikuti sesi ini:</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => sessionForm.setData('target_tracks', tracks.map((t) => t.code))}
                                        className="text-[#0B63CE] hover:underline font-semibold text-[11px]"
                                    >
                                        Pilih Semua Jalur
                                    </button>
                                    <span className="text-[#DCE7F3]">•</span>
                                    <button
                                        type="button"
                                        onClick={() => sessionForm.setData('target_tracks', [])}
                                        className="text-[#6B7C93] hover:underline text-[11px]"
                                    >
                                        Kosongkan
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                                {tracks.map((t) => {
                                    const selectedTracks = sessionForm.data.target_tracks || [];
                                    const isChecked = selectedTracks.includes(t.code);
                                    return (
                                        <Checkbox
                                            key={t.id || t.code}
                                            className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                                                isChecked
                                                    ? 'bg-[#EAF5FF] border-[#0B63CE] text-[#0A3F82] font-semibold'
                                                    : 'bg-white border-[#DCE7F3] text-slate-700 hover:bg-slate-50'
                                            }`}
                                            checked={isChecked}
                                            onChange={(e) => {
                                                const cur = sessionForm.data.target_tracks || [];
                                                if (e.target.checked) {
                                                    sessionForm.setData('target_tracks', [...cur, t.code]);
                                                } else {
                                                    sessionForm.setData('target_tracks', cur.filter((c) => c !== t.code));
                                                }
                                            }}
                                            label={`${t.code} · ${t.name}`}
                                        />
                                    );
                                })}
                            </div>
                            <p className="text-[11px] text-[#6B7C93]">
                                Jika semua jalur dipilih atau dikosongkan, sesi akan berlaku untuk seluruh peserta (Pleno/Umum).
                            </p>
                        </div>
                    </FormField>
                </form>
            </Modal>

            {/* MODAL: Sesuaikan Jadwal / Penanganan Molor */}
            <Modal
                isOpen={isRescheduleModalOpen}
                onClose={() => {
                    setIsRescheduleModalOpen(false);
                    setReschedulingSession(null);
                }}
                title={reschedulingSession ? `Sesuaikan Jadwal / Sesi Molor (${reschedulingSession.session_number})` : 'Sesuaikan Jadwal'}
                size="md"
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setIsRescheduleModalOpen(false);
                                setReschedulingSession(null);
                            }}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            form="reschedule-session-form"
                            variant="primary"
                            loading={rescheduleForm.processing}
                        >
                            Simpan Perubahan Jadwal
                        </Button>
                    </>
                }
            >
                {reschedulingSession && (
                    <form id="reschedule-session-form" onSubmit={handleSaveReschedule} className="space-y-4">
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1">
                            <div className="font-bold text-amber-900 flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-amber-700" />
                                <span>Penyesuaian Jadwal & Pemindahan Sesi</span>
                            </div>
                            <p className="text-amber-800">
                                Sesi: <strong>{reschedulingSession.topic}</strong> (Hari ke-{reschedulingSession.day_number})
                            </p>
                        </div>

                        {/* Pindah ke Hari */}
                        <FormField label="Pindah ke Hari (Jadwal Hari)" error={rescheduleForm.errors.day_number}>
                            <Select
                                value={rescheduleForm.data.day_number}
                                onChange={(e) => rescheduleForm.setData('day_number', Number(e.target.value))}
                            >
                                {daysList.map((d) => (
                                    <option key={d} value={d}>
                                        Hari ke-{d} {getDayDateInfo(d) ? `(${getDayDateInfo(d)})` : ''}
                                    </option>
                                ))}
                            </Select>
                        </FormField>

                        {/* Quick Add Delay Buttons */}
                        <div>
                            <label className="block text-xs font-semibold text-[#112743] mb-1.5">
                                Tambah Waktu Keterlambatan (Molor):
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {[15, 30, 45, 60].map((mins) => (
                                    <button
                                        key={mins}
                                        type="button"
                                        onClick={() => handleQuickShift(mins)}
                                        className="py-1.5 px-2 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs text-center transition-colors shadow-2xs"
                                    >
                                        +{mins} menit
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <FormField label="Waktu Mulai" required error={rescheduleForm.errors.start_time}>
                                <Input
                                    type="time"
                                    value={rescheduleForm.data.start_time}
                                    onChange={(e) => rescheduleForm.setData('start_time', e.target.value)}
                                    required
                                />
                            </FormField>
                            <FormField label="Waktu Selesai" required error={rescheduleForm.errors.end_time}>
                                <Input
                                    type="time"
                                    value={rescheduleForm.data.end_time}
                                    onChange={(e) => rescheduleForm.setData('end_time', e.target.value)}
                                    required
                                />
                            </FormField>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <FormField label="Status Sesi" required error={rescheduleForm.errors.status}>
                                <Select
                                    value={rescheduleForm.data.status}
                                    onChange={(e) => rescheduleForm.setData('status', e.target.value)}
                                >
                                    <option value="scheduled">Terjadwal</option>
                                    <option value="ongoing">Sedang Berlangsung</option>
                                    <option value="delayed">Molor / Mundur</option>
                                    <option value="completed">Selesai</option>
                                    <option value="cancelled">Dibatalkan</option>
                                </Select>
                            </FormField>

                            <FormField label="Ruangan / Dojo" error={rescheduleForm.errors.room}>
                                <Input
                                    value={rescheduleForm.data.room}
                                    onChange={(e) => rescheduleForm.setData('room', e.target.value)}
                                    placeholder="Contoh: Dojo Utama"
                                />
                            </FormField>
                        </div>

                        <FormField label="Pemateri Pengampu" error={rescheduleForm.errors.speaker_id}>
                            <Select
                                value={rescheduleForm.data.speaker_id}
                                onChange={(e) => rescheduleForm.setData('speaker_id', e.target.value)}
                            >
                                <option value="">-- Tetap / Pilih Pemateri --</option>
                                {speakers.map((sp) => (
                                    <option key={sp.id} value={sp.id}>
                                        {sp.name} ({sp.type_label})
                                    </option>
                                ))}
                            </Select>
                        </FormField>

                        <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg">
                            <Checkbox
                                checked={rescheduleForm.data.shift_subsequent_sessions}
                                onChange={(e) => rescheduleForm.setData('shift_subsequent_sessions', e.target.checked)}
                                label={<>
                                    <strong>Mundurkan otomatis sesi-sesi berikutnya</strong> pada Hari {reschedulingSession.day_number} sebanyak selisih waktu keterlambatan agar seluruh jadwal berikutnya tetap sinkron.
                                </>}
                            />
                        </div>
                    </form>
                )}
            </Modal>
        </>
    );
}
