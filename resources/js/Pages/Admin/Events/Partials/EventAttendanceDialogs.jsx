import Button from '../../../../Components/ui/Button';
import Modal from '../../../../Components/ui/Modal';
import FormField from '../../../../Components/ui/FormField';
import Input from '../../../../Components/ui/Input';
import Select from '../../../../Components/ui/Select';
import Textarea from '../../../../Components/ui/Textarea';
import Checkbox from '../../../../Components/ui/Checkbox';
import { Check, Sparkles } from 'lucide-react';
import { useEventShow } from './EventShowContext';

export default function EventAttendanceDialogs() {
    const {
        event,
        sessionsByDay,
        arrivalSession,
        participants,
        isOverrideModalOpen,
        setIsOverrideModalOpen,
        isEditAttendanceModalOpen,
        setIsEditAttendanceModalOpen,
        editingAttendance,
        setEditingAttendance,
        isGenerateAttendanceModalOpen,
        setIsGenerateAttendanceModalOpen,
        isGeneratingAttendance,
        generateTrack,
        setGenerateTrack,
        generateStatus,
        setGenerateStatus,
        generateIncludeArrival,
        setGenerateIncludeArrival,
        generateIncludeDaily,
        setGenerateIncludeDaily,
        generateIncludeSessions,
        setGenerateIncludeSessions,
        generateDay,
        setGenerateDay,
        overrideForm,
        editAttendanceForm,
        handleSaveOverride,
        handleSaveEditAttendance,
        daysList,
        availableTrackOptions,
        handleGenerateAllAttendance,
    } = useEventShow();

    return (
        <>
            {/* MODAL: Override Kehadiran Manual */}
            <Modal
                isOpen={isOverrideModalOpen}
                onClose={() => setIsOverrideModalOpen(false)}
                title="Override Kehadiran Manual (Admin)"
                size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsOverrideModalOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" form="override-form" variant="primary" loading={overrideForm.processing}>
                            Simpan Override
                        </Button>
                    </>
                }
            >
                <form id="override-form" onSubmit={handleSaveOverride} className="space-y-4">
                    <FormField label="Pilih Sesi Rundown" required>
                        <Select
                            value={overrideForm.data.event_session_id}
                            onChange={(e) => overrideForm.setData('event_session_id', e.target.value)}
                            required
                        >
                            <option value="">-- Pilih Sesi --</option>
                            {arrivalSession && <option value={arrivalSession.id}>Kedatangan awal event</option>}
                            {Object.values(sessionsByDay).flatMap((d) => d.sessions).map((s) => (
                                <option key={s.id} value={s.id}>
                                    Hari {s.day_number} - {s.session_number}: {s.topic}
                                </option>
                            ))}
                        </Select>
                    </FormField>

                    <FormField label="Pilih Peserta Kenshi" required>
                        <Select
                            value={overrideForm.data.participant_id}
                            onChange={(e) => overrideForm.setData('participant_id', e.target.value)}
                            required
                        >
                            <option value="">-- Pilih Peserta --</option>
                            {participants.map((p) => (
                                <option key={p.id} value={p.participant_id}>
                                    {p.name} ({p.track_code} - {p.kenshi_id})
                                </option>
                            ))}
                        </Select>
                    </FormField>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Tipe Absensi" required>
                            <Select
                                value={overrideForm.data.attendance_type}
                                onChange={(e) => overrideForm.setData('attendance_type', e.target.value)}
                            >
                                <option value="check_in">Absensi Masuk</option>
                                <option value="check_out">Absensi Keluar</option>
                            </Select>
                        </FormField>

                        <FormField label="Status Kehadiran" required>
                            <Select
                                value={overrideForm.data.status}
                                onChange={(e) => overrideForm.setData('status', e.target.value)}
                            >
                                <option value="present">Hadir Tepat Waktu</option>
                                <option value="late">Hadir Terlambat</option>
                                <option value="excused">Izin / Dispensasi Panitia</option>
                                <option value="manual_override">Override Panitia Khusus</option>
                                <option value="absent">Tidak Hadir</option>
                            </Select>
                        </FormField>
                    </div>

                    <FormField label="Alasan / Catatan Override (Wajib Audit)" required>
                        <Textarea
                            value={overrideForm.data.notes}
                            onChange={(e) => overrideForm.setData('notes', e.target.value)}
                            rows={3}
                            placeholder="Tuliskan alasan panitia melakukan perubahan status kehadiran..."
                            required
                        />
                    </FormField>
                </form>
            </Modal>

            {/* MODAL: Edit Absensi Peserta */}
            <Modal
                isOpen={isEditAttendanceModalOpen}
                onClose={() => {
                    setIsEditAttendanceModalOpen(false);
                    setEditingAttendance(null);
                }}
                title="Edit Catatan Absensi"
                size="md"
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setIsEditAttendanceModalOpen(false);
                                setEditingAttendance(null);
                            }}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            form="edit-attendance-form"
                            variant="primary"
                            loading={editAttendanceForm.processing}
                        >
                            Simpan Perubahan
                        </Button>
                    </>
                }
            >
                {editingAttendance && (
                    <form id="edit-attendance-form" onSubmit={handleSaveEditAttendance} className="space-y-4">
                        <div className="p-3 bg-slate-50 border border-[#DCE7F3] rounded-xl space-y-1.5 text-xs">
                            <div className="flex justify-between items-start">
                                <span className="text-[#6B7C93] font-medium">Nama Peserta:</span>
                                <span className="font-bold text-[#0E2747] text-right">
                                    {editingAttendance.participant_name}
                                    {editingAttendance.participant_kenshi_id && (
                                        <span className="block text-[11px] font-normal text-[#6B7C93]">
                                            No. Kenshi: {editingAttendance.participant_kenshi_id}
                                        </span>
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between items-start pt-1.5 border-t border-[#DCE7F3]/70">
                                <span className="text-[#6B7C93] font-medium">Sesi Kegiatan:</span>
                                <span className="font-semibold text-[#112743] text-right">
                                    {editingAttendance.session_topic}
                                    <span className="block text-[11px] font-normal text-[#6B7C93]">
                                        Hari {editingAttendance.day_number} • Sesi {editingAttendance.session_number}
                                    </span>
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <FormField label="Tipe Absensi" required error={editAttendanceForm.errors.attendance_type}>
                                <Select
                                    value={editAttendanceForm.data.attendance_type}
                                    onChange={(e) => editAttendanceForm.setData('attendance_type', e.target.value)}
                                    required
                                >
                                    <option value="check_in">Absensi Masuk</option>
                                    <option value="check_out">Absensi Keluar</option>
                                </Select>
                            </FormField>

                            <FormField label="Status Kehadiran" required error={editAttendanceForm.errors.status}>
                                <Select
                                    value={editAttendanceForm.data.status}
                                    onChange={(e) => editAttendanceForm.setData('status', e.target.value)}
                                    required
                                >
                                    <option value="present">Hadir Tepat Waktu</option>
                                    <option value="late">Hadir Terlambat</option>
                                    <option value="excused">Izin / Dispensasi Panitia</option>
                                    <option value="manual_override">Override Panitia Khusus</option>
                                    <option value="absent">Tidak Hadir</option>
                                </Select>
                            </FormField>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <FormField label="Waktu Pencatatan" error={editAttendanceForm.errors.checked_in_at}>
                                <Input
                                    type="datetime-local"
                                    value={editAttendanceForm.data.checked_in_at}
                                    onChange={(e) => editAttendanceForm.setData('checked_in_at', e.target.value)}
                                />
                            </FormField>

                            <FormField label="Metode Pencatatan" error={editAttendanceForm.errors.method}>
                                <Select
                                    value={editAttendanceForm.data.method}
                                    onChange={(e) => editAttendanceForm.setData('method', e.target.value)}
                                >
                                    <option value="manual_admin">Manual Admin</option>
                                    <option value="qr_scan">Scan QR</option>
                                    <option value="short_code">Kode Sesi</option>
                                </Select>
                            </FormField>
                        </div>

                        <FormField label="Catatan / Alasan Perubahan" error={editAttendanceForm.errors.notes}>
                            <Textarea
                                value={editAttendanceForm.data.notes}
                                onChange={(e) => editAttendanceForm.setData('notes', e.target.value)}
                                rows={3}
                                placeholder="Tuliskan catatan perbaikan atau alasan perubahan status kehadiran..."
                            />
                        </FormField>
                    </form>
                )}
            </Modal>

            {/* MODAL: Generate Absensi Seluruh Peserta */}
            <Modal
                isOpen={isGenerateAttendanceModalOpen}
                onClose={() => setIsGenerateAttendanceModalOpen(false)}
                title="Generate Absensi Semua Peserta"
                size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsGenerateAttendanceModalOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            type="button"
                            variant="primary"
                            loading={isGeneratingAttendance}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={handleGenerateAllAttendance}
                        >
                            Generate Absensi Sekarang
                        </Button>
                    </>
                }
            >
                <div className="space-y-4 text-xs text-[#112743]">
                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-emerald-800">
                        <div className="flex items-start gap-2.5">
                            <Sparkles className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                            <div>
                                <p className="font-semibold text-emerald-900">Catat Kehadiran Lengkap Otomatis</p>
                                <p className="mt-1 text-[11px] leading-relaxed">
                                    Tindakan ini akan mencatat status presensi hadir secara serentak untuk seluruh kenshi terdaftar 
                                    (<strong>{participants.length} peserta</strong>) pada seluruh sesi penataran yang sesuai dengan jalurnya masing-masing.
                                    Data kehadiran yang sudah ada akan diperbarui tanpa membuat duplikat.
                                </p>
                            </div>
                        </div>
                    </div>

                    <FormField label="Pilih Target Jalur Peserta">
                        <Select
                            value={generateTrack}
                            onChange={(e) => setGenerateTrack(e.target.value)}
                        >
                            <option value="all">Semua Jalur ({participants.length} peserta)</option>
                            {availableTrackOptions.map((code) => {
                                const count = participants.filter((p) => p.track_code === code).length;
                                return (
                                    <option key={code} value={code}>
                                        Jalur {code} ({count} peserta)
                                    </option>
                                );
                            })}
                        </Select>
                    </FormField>

                    <FormField label="Pilih Hari Kegiatan">
                        <Select
                            value={generateDay}
                            onChange={(e) => setGenerateDay(e.target.value)}
                        >
                            <option value="all">Semua Hari (Hari 1 s/d {event.total_days || 4})</option>
                            {daysList.map((day) => (
                                <option key={day} value={String(day)}>
                                    Khusus Hari ke-{day}
                                </option>
                            ))}
                        </Select>
                    </FormField>

                    <FormField label="Status Kehadiran">
                        <Select
                            value={generateStatus}
                            onChange={(e) => setGenerateStatus(e.target.value)}
                        >
                            <option value="present">Hadir Tepat Waktu (Present)</option>
                            <option value="late">Terlambat (Late)</option>
                            <option value="manual_override">Manual Override</option>
                        </Select>
                    </FormField>

                    <div className="space-y-2 pt-2 border-t border-[#DCE7F3]">
                        <span className="font-semibold text-[#0E2747] block text-[11px] uppercase tracking-wider">
                            Cakupan Sesi yang Digenerate:
                        </span>
                        <Checkbox
                            checked={generateIncludeArrival}
                            onChange={(e) => setGenerateIncludeArrival(e.target.checked)}
                            label="Kedatangan awal event (Check-in awal kenshi)"
                        />
                        <Checkbox
                            checked={generateIncludeDaily}
                            onChange={(e) => setGenerateIncludeDaily(e.target.checked)}
                            label="Presensi harian wajib seluruh hari kegiatan"
                        />
                        <Checkbox
                            checked={generateIncludeSessions}
                            onChange={(e) => setGenerateIncludeSessions(e.target.checked)}
                            label="Sesi materi, kelas paralel & ujian sesuai jalur"
                        />
                    </div>
                </div>
            </Modal>
        </>
    );
}
