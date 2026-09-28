import Button from '@/Components/ui/Button';
import Modal from '@/Components/ui/Modal';
import FormField from '@/Components/ui/FormField';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';
import { Clock, FileText, Award, Compass, Check, AlertCircle } from 'lucide-react';
import { useSpeakerSchedule } from './SpeakerScheduleContext';

export default function SpeakerScheduleDialogs() {
    const {
        speaker,
        canManageSchedule,
        availableEvents,
        allSpeakers,
        allTracks,
        allSessionTypes,
        selectedSessionForModal,
        setSelectedSessionForModal,
        isRescheduleModalOpen,
        setIsRescheduleModalOpen,
        reschedulingSession,
        setReschedulingSession,
        rescheduleForm,
        handleQuickShift,
        handleSaveReschedule,
        isSessionModalOpen,
        setIsSessionModalOpen,
        editingSession,
        setEditingSession,
        sessionForm,
        handleSaveSession,
    } = useSpeakerSchedule();

    return (
        <>
            {/* 4. Modal Detail Silabus & Sasaran Kompetensi */}
            {selectedSessionForModal && (
                <Modal
                    isOpen={Boolean(selectedSessionForModal)}
                    onClose={() => setSelectedSessionForModal(null)}
                    title={`Silabus Sesi: ${selectedSessionForModal.topic}`}
                    description={`Hari ${selectedSessionForModal.day_number} • ${selectedSessionForModal.time_range} • ${selectedSessionForModal.room}`}
                    size="xl"
                    footer={
                        <div className="flex items-center justify-between w-full">
                            <span className="text-xs font-mono text-[#6B7C93]">
                                {selectedSessionForModal.event_name}
                            </span>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setSelectedSessionForModal(null)}
                            >
                                Tutup
                            </Button>
                        </div>
                    }
                >
                    <div className="space-y-5 text-sm">
                        {/* Overview Box */}
                        <div className="bg-[#F8FBFF] rounded-lg p-4 border border-[#DCE7F3] space-y-2">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                                <div>
                                    <span className="text-[#6B7C93] block">Tanggal & Waktu</span>
                                    <span className="font-semibold text-[#112743]">
                                        {selectedSessionForModal.date_formatted}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[#6B7C93] block">Alokasi Waktu</span>
                                    <span className="font-semibold text-[#0B63CE]">
                                        {selectedSessionForModal.duration_jp} Jam Pelajaran (JP)
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[#6B7C93] block">Ruangan / Dojo</span>
                                    <span className="font-semibold text-[#112743]">
                                        {selectedSessionForModal.room}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Subtopic */}
                        {selectedSessionForModal.subtopic && (
                            <div className="space-y-1">
                                <h4 className="text-xs font-mono uppercase tracking-wider text-[#6B7C93]">
                                    Subtopik Bahasan
                                </h4>
                                <p className="text-sm text-[#112743] font-medium">
                                    {selectedSessionForModal.subtopic}
                                </p>
                            </div>
                        )}

                        {/* Learning Objectives / Sasaran Kompetensi */}
                        {selectedSessionForModal.learning_module?.learning_objectives &&
                            selectedSessionForModal.learning_module.learning_objectives.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-mono uppercase tracking-wider text-[#0A3F82] font-semibold flex items-center gap-1.5">
                                        <Compass className="size-3.5 text-[#0B63CE]" />
                                        <span>Tujuan Pembelajaran Khusus (TPK)</span>
                                    </h4>
                                    <ul className="space-y-1.5 bg-[#F8FBFF] p-3 rounded-lg border border-[#DCE7F3]">
                                        {selectedSessionForModal.learning_module.learning_objectives.map((obj, i) => (
                                            <li key={i} className="text-xs text-[#112743] flex items-start gap-2">
                                                <Check className="size-3.5 text-[#20A47A] shrink-0 mt-0.5" />
                                                <span>{obj}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                        {/* Competency Outcomes */}
                        {selectedSessionForModal.learning_module?.competency_outcomes &&
                            selectedSessionForModal.learning_module.competency_outcomes.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-mono uppercase tracking-wider text-[#0A3F82] font-semibold flex items-center gap-1.5">
                                        <Award className="size-3.5 text-[#EE9B25]" />
                                        <span>Standar Kompetensi Akhir</span>
                                    </h4>
                                    <ul className="space-y-1.5 bg-[#F8FBFF] p-3 rounded-lg border border-[#DCE7F3]">
                                        {selectedSessionForModal.learning_module.competency_outcomes.map((comp, i) => (
                                            <li key={i} className="text-xs text-[#112743] flex items-start gap-2">
                                                <Check className="size-3.5 text-[#0B63CE] shrink-0 mt-0.5" />
                                                <span>{comp}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                        {/* Materials Attached in Modal */}
                        <div className="space-y-2 pt-2 border-t border-[#DCE7F3]">
                            <h4 className="text-xs font-mono uppercase tracking-wider text-[#6B7C93]">
                                Dokumen Materi Pembelajaran
                            </h4>
                            {selectedSessionForModal.materials.length > 0 ? (
                                <div className="space-y-2">
                                    {selectedSessionForModal.materials.map((mat) => (
                                        <div
                                            key={mat.id}
                                            className="flex items-center justify-between p-2.5 bg-white rounded border border-[#DCE7F3] text-xs"
                                        >
                                            <div className="flex items-center gap-2 truncate pr-2">
                                                <FileText className="size-4 text-[#EE9B25] shrink-0" />
                                                <span className="font-semibold text-[#112743] truncate">
                                                    {mat.title}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <a
                                                    href={mat.read_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="px-2.5 py-1 rounded bg-[#0B63CE] text-white font-semibold text-xs hover:bg-[#0A3F82] transition-colors"
                                                >
                                                    Buka Reader
                                                </a>
                                                <a
                                                    href={mat.download_url}
                                                    className="px-2 py-1 rounded border border-[#DCE7F3] text-[#112743] text-xs hover:bg-[#F8FBFF] transition-colors"
                                                >
                                                    Unduh
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-[#6B7C93] italic">
                                    Tidak ada dokumen bahan ajar yang terhubung.
                                </p>
                            )}
                        </div>
                    </div>
                </Modal>
            )}

            {/* 4b. Modal Sesuaikan Jadwal / Penanganan Sesi Molor */}
            <Modal
                isOpen={isRescheduleModalOpen}
                onClose={() => {
                    setIsRescheduleModalOpen(false);
                    setReschedulingSession(null);
                }}
                title={reschedulingSession ? `Sesuaikan Jadwal Sesi (${reschedulingSession.session_number})` : 'Sesuaikan Jadwal'}
                description={reschedulingSession ? `${reschedulingSession.event_name} • Hari ke-${reschedulingSession.day_number}` : ''}
                size="md"
                footer={
                    <div className="flex items-center justify-end gap-2 w-full">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                                setIsRescheduleModalOpen(false);
                                setReschedulingSession(null);
                            }}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            form="speaker-reschedule-form"
                            variant="primary"
                            size="sm"
                            loading={rescheduleForm.processing}
                        >
                            Simpan Perubahan Jadwal
                        </Button>
                    </div>
                }
            >
                {reschedulingSession && (
                    <form id="speaker-reschedule-form" onSubmit={handleSaveReschedule} className="space-y-4">
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1">
                            <div className="font-bold text-amber-900 flex items-center gap-1.5">
                                <Clock className="size-4 text-amber-700" />
                                <span>Penanganan Jadwal Molor & Pergeseran Sesi</span>
                            </div>
                            <p className="text-amber-800">
                                Topik: <strong>{reschedulingSession.topic}</strong>
                            </p>
                        </div>

                        {/* Quick Add Delay Buttons */}
                        <div>
                            <label className="block text-xs font-semibold text-[#112743] mb-1.5">
                                Tambah Keterlambatan Cepat:
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
                                    <option value="delayed">Molor / Diundur</option>
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

                        {canManageSchedule && (
                            <FormField label="Sensei Pengampu" error={rescheduleForm.errors.speaker_id}>
                                <Select
                                    value={rescheduleForm.data.speaker_id}
                                    onChange={(e) => rescheduleForm.setData('speaker_id', e.target.value)}
                                >
                                    <option value="">-- Tetap / Pilih Sensei --</option>
                                    {allSpeakers.map((sp) => (
                                        <option key={sp.id} value={sp.id}>
                                            {sp.name}
                                        </option>
                                    ))}
                                </Select>
                            </FormField>
                        )}

                        <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg">
                            <label className="flex items-start gap-2.5 text-xs text-sky-950 font-medium cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rescheduleForm.data.shift_subsequent_sessions}
                                    onChange={(e) => rescheduleForm.setData('shift_subsequent_sessions', e.target.checked)}
                                    className="mt-0.5 rounded border-sky-300 text-[#0B63CE] focus:ring-[#0B63CE]"
                                />
                                <span>
                                    <strong>Mundurkan otomatis sesi-sesi berikutnya</strong> pada Hari {reschedulingSession.day_number} sebanyak selisih waktu keterlambatan agar seluruh jadwal berikutnya tetap sinkron.
                                </span>
                            </label>
                        </div>
                    </form>
                )}
            </Modal>

            {/* 4c. Modal Tambah / Edit Sesi Rundown Lengkap */}
            <Modal
                isOpen={isSessionModalOpen}
                onClose={() => {
                    setIsSessionModalOpen(false);
                    setEditingSession(null);
                }}
                title={editingSession ? 'Edit Sesi Rundown' : 'Tambah Sesi Rundown Baru'}
                description="Sesuaikan rincian jadwal, materi, ruangan, pengajar, dan sasaran peserta."
                size="2xl"
                footer={
                    <div className="flex items-center justify-end gap-2 w-full">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                                setIsSessionModalOpen(false);
                                setEditingSession(null);
                            }}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            form="speaker-session-form"
                            variant="primary"
                            size="sm"
                            loading={sessionForm.processing}
                        >
                            {editingSession ? 'Simpan Perubahan' : 'Buat Sesi Rundown'}
                        </Button>
                    </div>
                }
            >
                <form id="speaker-session-form" onSubmit={handleSaveSession} className="space-y-4">
                    {Object.keys(sessionForm.errors).length > 0 && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                            <AlertCircle className="size-4 shrink-0 text-rose-600 mt-0.5" />
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

                    {!editingSession && availableEvents.length > 1 && (
                        <FormField label="Pilih Kegiatan Penataran" required error={sessionForm.errors.event_id}>
                            <Select
                                value={sessionForm.data.event_id}
                                onChange={(e) => sessionForm.setData('event_id', e.target.value)}
                                required
                            >
                                {availableEvents.map((evt) => (
                                    <option key={evt.id} value={evt.id}>
                                        {evt.name}
                                    </option>
                                ))}
                            </Select>
                        </FormField>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <FormField label="Hari ke-" required error={sessionForm.errors.day_number}>
                            <Input
                                type="number"
                                min="1"
                                max="60"
                                value={sessionForm.data.day_number}
                                onChange={(e) => sessionForm.setData('day_number', Number(e.target.value))}
                                required
                            />
                        </FormField>

                        <FormField label="Nomor Sesi" required error={sessionForm.errors.session_number}>
                            <Input
                                value={sessionForm.data.session_number}
                                onChange={(e) => sessionForm.setData('session_number', e.target.value)}
                                placeholder="Contoh: Sesi 1"
                                required
                            />
                        </FormField>

                        <FormField label="Alokasi JP" required error={sessionForm.errors.duration_jp}>
                            <Input
                                type="number"
                                min="0"
                                value={sessionForm.data.duration_jp}
                                onChange={(e) => sessionForm.setData('duration_jp', Number(e.target.value))}
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
                        <FormField label="Jenis Sesi" error={sessionForm.errors.event_session_type_id}>
                            <Select
                                value={sessionForm.data.event_session_type_id}
                                onChange={(e) => {
                                    const st = allSessionTypes.find((s) => String(s.id) === String(e.target.value));
                                    sessionForm.setData((prev) => ({
                                        ...prev,
                                        event_session_type_id: e.target.value,
                                        session_type_code: st?.code || '',
                                    }));
                                }}
                            >
                                <option value="">-- Pilih Jenis Sesi --</option>
                                {allSessionTypes.map((st) => (
                                    <option key={st.id} value={st.id}>
                                        {st.name} ({st.code})
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

                    <FormField label="Subtopik / Pokok Bahasan" error={sessionForm.errors.subtopic}>
                        <Input
                            value={sessionForm.data.subtopic}
                            onChange={(e) => sessionForm.setData('subtopic', e.target.value)}
                            placeholder="Contoh: Teknik dasar Chudan Tsuki & Uchiuke"
                        />
                    </FormField>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Sensei Pengampu" error={sessionForm.errors.speaker_id}>
                            <Select
                                value={sessionForm.data.speaker_id}
                                onChange={(e) => sessionForm.setData('speaker_id', e.target.value)}
                            >
                                <option value="">-- Pilih Sensei Pengampu --</option>
                                {allSpeakers.map((sp) => (
                                    <option key={sp.id} value={sp.id}>
                                        {sp.name}
                                    </option>
                                ))}
                            </Select>
                        </FormField>

                        <FormField label="Ruangan / Lokasi Dojo" error={sessionForm.errors.room}>
                            <Input
                                value={sessionForm.data.room}
                                onChange={(e) => sessionForm.setData('room', e.target.value)}
                                placeholder="Contoh: Dojo Utama / Aula Serbaguna"
                            />
                        </FormField>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Metode Pengajaran" error={sessionForm.errors.method}>
                            <Input
                                value={sessionForm.data.method}
                                onChange={(e) => sessionForm.setData('method', e.target.value)}
                                placeholder="Teori & Praktik"
                            />
                        </FormField>

                        <FormField label="Status Sesi" error={sessionForm.errors.status}>
                            <Select
                                value={sessionForm.data.status}
                                onChange={(e) => sessionForm.setData('status', e.target.value)}
                            >
                                <option value="scheduled">Terjadwal</option>
                                <option value="ongoing">Sedang Berlangsung</option>
                                <option value="delayed">Molor / Diundur</option>
                                <option value="completed">Selesai</option>
                                <option value="cancelled">Dibatalkan</option>
                            </Select>
                        </FormField>
                    </div>

                    {allTracks.length > 0 && (
                        <FormField label="Sasaran Tingkatan / Jalur Peserta" error={sessionForm.errors.target_tracks}>
                            <div className="space-y-2 p-3 bg-slate-50 border border-[#DCE7F3] rounded-xl text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-[#6B7C93]">Pilih jalur peserta yang diwajibkan mengikuti sesi ini:</span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => sessionForm.setData('target_tracks', allTracks.map((t) => t.code))}
                                            className="text-[#0B63CE] hover:underline font-semibold"
                                        >
                                            Pilih Semua
                                        </button>
                                        <span className="text-[#DCE7F3]">•</span>
                                        <button
                                            type="button"
                                            onClick={() => sessionForm.setData('target_tracks', [])}
                                            className="text-[#6B7C93] hover:underline"
                                        >
                                            Kosongkan
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                                    {allTracks.map((t) => {
                                        const selectedTracks = sessionForm.data.target_tracks || [];
                                        const isChecked = selectedTracks.includes(t.code);
                                        return (
                                            <label
                                                key={t.code}
                                                className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                                                    isChecked
                                                        ? 'bg-[#EAF5FF] border-[#0B63CE] text-[#0A3F82] font-semibold'
                                                        : 'bg-white border-[#DCE7F3] text-slate-700 hover:bg-slate-50'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={(e) => {
                                                        const cur = sessionForm.data.target_tracks || [];
                                                        if (e.target.checked) {
                                                            sessionForm.setData('target_tracks', [...cur, t.code]);
                                                        } else {
                                                            sessionForm.setData('target_tracks', cur.filter((c) => c !== t.code));
                                                        }
                                                    }}
                                                    className="rounded border-[#DCE7F3] text-[#0B63CE] focus:ring-[#0B63CE] size-3.5"
                                                />
                                                <span>{t.code} · {t.name}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </FormField>
                    )}
                </form>
            </Modal>
        </>
    );
}
