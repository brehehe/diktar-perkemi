import EventCbtDialogs from './EventCbtDialogs';
import Button from '../../../../Components/ui/Button';
import Modal from '../../../../Components/ui/Modal';
import FormField from '../../../../Components/ui/FormField';
import Input from '../../../../Components/ui/Input';
import Select from '../../../../Components/ui/Select';
import Textarea from '../../../../Components/ui/Textarea';
import Checkbox from '../../../../Components/ui/Checkbox';
import Combobox from '../../../../Components/ui/Combobox';
import FileInput from '../../../../Components/ui/FileInput';
import { Trash2, Upload, Camera } from 'lucide-react';
import { useEventShow } from './EventShowContext';

export default function EventLearningDialogs() {
    const {
        event,
        availableMasterModules,
        availableMasterCbtPackages,
        availableQuestionModules,
        sessionsByDay,
        speakers,
        availableParticipants,
        tracks,
        publishedMaterials,
        isModuleModalOpen,
        setIsModuleModalOpen,
        editingModule,
        setEditingModule,
        isAddParticipantModalOpen,
        setIsAddParticipantModalOpen,
        participantMode,
        setParticipantMode,
        editingParticipant,
        setEditingParticipant,
        editingParticipantPhotoPreview,
        isAttachModuleModalOpen,
        setIsAttachModuleModalOpen,
        isAttachCbtModalOpen,
        setIsAttachCbtModalOpen,
        isCbtPackageModalOpen,
        setIsCbtPackageModalOpen,
        editingCbtPackage,
        isAddQuestionModalOpen,
        setIsAddQuestionModalOpen,
        activeCbtPackageForQuestion,
        attachModuleForm,
        attachCbtForm,
        moduleForm,
        participantEditForm,
        participantAddForm,
        participantNewForm,
        cbtPackageForm,
        questionForm,
        handleSaveModule,
        handleParticipantPhotoChange,
        handleParticipantRemovePhoto,
        handleUpdateParticipant,
        handleAddParticipant,
        handleCreateParticipant,
        handleSaveCbtPackage,
        handleSaveQuestion,
        handleAttachModule,
        handleAttachCbt,
    } = useEventShow();

    return (
        <>
            <EventCbtDialogs />
            {/* MODAL: Tambah/Edit Modul Pembelajaran */}
            <Modal
                isOpen={isModuleModalOpen}
                onClose={() => {
                    setIsModuleModalOpen(false);
                    setEditingModule(null);
                }}
                title={editingModule ? 'Edit Modul Kurikulum Penataran' : 'Tambah Modul Kurikulum Penataran'}
                size="full"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => {
                            setIsModuleModalOpen(false);
                            setEditingModule(null);
                        }}>
                            Batal
                        </Button>
                        <Button type="submit" form="module-form" variant="primary" loading={moduleForm.processing}>
                            {editingModule ? 'Simpan Perubahan' : 'Simpan Modul'}
                        </Button>
                    </>
                }
            >
                <form id="module-form" onSubmit={handleSaveModule} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Kode Modul" required>
                            <Input
                                value={moduleForm.data.code}
                                onChange={(e) => moduleForm.setData('code', e.target.value)}
                                placeholder="MOD-WAS-02"
                                required
                            />
                        </FormField>

                        <FormField label="Durasi (JP)" required>
                            <Input
                                type="number"
                                min="1"
                                value={moduleForm.data.duration_jp}
                                onChange={(e) => moduleForm.setData('duration_jp', parseInt(e.target.value) || 1)}
                                required
                            />
                        </FormField>
                    </div>

                    <FormField label="Judul Modul" required>
                        <Input
                            value={moduleForm.data.title}
                            onChange={(e) => moduleForm.setData('title', e.target.value)}
                            placeholder="Contoh: Manajemen Perwasitan & Kode Etik Wasit PERKEMI"
                            required
                        />
                    </FormField>

                    <FormField label="Instruktur Pengampu">
                        <Select
                            value={moduleForm.data.speaker_id}
                            onChange={(e) => moduleForm.setData('speaker_id', e.target.value)}
                        >
                            <option value="">-- Pilih Instruktur --</option>
                            {speakers.map((sp) => (
                                <option key={sp.id} value={sp.id}>
                                    {sp.name}
                                </option>
                            ))}
                        </Select>
                    </FormField>

                    <FormField label="Sumber materi">
                        <Select value={moduleForm.data.source_type} onChange={(e) => moduleForm.setData('source_type', e.target.value)}>
                            <option value="collection">Ambil dari koleksi</option>
                            <option value="uploaded_pdf">Unggah PDF baru</option>
                            <option value="external_link">Tautan buku digital</option>
                            <option value="video">Video pembelajaran</option>
                        </Select>
                    </FormField>
                    {moduleForm.data.source_type === 'collection' && <FormField label="Buku digital dari koleksi">
                        <Select value={moduleForm.data.material_id} onChange={(e) => moduleForm.setData('material_id', e.target.value)}>
                            <option value="">Pilih jika diperlukan</option>
                            {publishedMaterials.map((mat) => <option key={mat.id} value={mat.id}>[{mat.code}] {mat.title}</option>)}
                        </Select>
                    </FormField>}
                    {moduleForm.data.source_type === 'uploaded_pdf' && <FileInput id="module-pdf" label={editingModule?.has_source_file ? "Berkas PDF (kosongkan jika tidak mengubah, maks 50 MB)" : "Berkas PDF, maksimal 50 MB"} accept="application/pdf" required={!editingModule || !editingModule.has_source_file} onChange={(event) => moduleForm.setData('source_file', event.target.files[0] || null)} error={moduleForm.errors.source_file} />}
                    {['external_link', 'video'].includes(moduleForm.data.source_type) && <FormField label={moduleForm.data.source_type === 'video' ? 'URL video YouTube atau Vimeo' : 'URL buku digital HTTPS'} error={moduleForm.errors.source_url}>
                        <Input type="url" required value={moduleForm.data.source_url} onChange={(e) => moduleForm.setData('source_url', e.target.value)} />
                    </FormField>}
                    <FormField label="Metode pembelajaran">
                        <Input value={moduleForm.data.delivery_method} onChange={(e) => moduleForm.setData('delivery_method', e.target.value)} />
                    </FormField>
                    <FormField label="Deskripsi modul">
                        <Textarea value={moduleForm.data.description} onChange={(e) => moduleForm.setData('description', e.target.value)} rows={3} />
                    </FormField>
                    <FormField label="Indikator pembelajaran">
                        <Textarea value={moduleForm.data.learning_indicators} onChange={(e) => moduleForm.setData('learning_indicators', e.target.value)} rows={2} />
                    </FormField>
                    <fieldset className="border-t border-[#DCE7F3] pt-3">
                        <legend className="text-xs font-semibold text-[#112743]">Jalur peserta</legend>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                            {tracks.map((track) => <Checkbox key={track.id} checked={moduleForm.data.target_tracks.includes(track.code)} onChange={(event) => moduleForm.setData('target_tracks', event.target.checked ? [...moduleForm.data.target_tracks, track.code] : moduleForm.data.target_tracks.filter((code) => code !== track.code))} label={track.name} />)}
                        </div>
                    </fieldset>
                    <FormField label="Status publikasi">
                        <Select value={moduleForm.data.publication_status} onChange={(e) => moduleForm.setData('publication_status', e.target.value)}>
                            <option value="draft">Draft</option>
                            <option value="review">Dalam peninjauan</option>
                            <option value="published">Terbit</option>
                        </Select>
                    </FormField>
                </form>
            </Modal>

            <Modal
                isOpen={isAddParticipantModalOpen}
                onClose={() => setIsAddParticipantModalOpen(false)}
                title="Daftarkan Peserta ke Event"
                description="Pilih data master atau buat peserta baru, lalu tentukan jalurnya untuk event ini."
                size="xl"
                footer={<><Button variant="secondary" onClick={() => setIsAddParticipantModalOpen(false)}>Batal</Button><Button type="submit" form={participantMode === 'existing' ? 'participant-add-form' : 'participant-new-form'} variant="primary" loading={participantMode === 'existing' ? participantAddForm.processing : participantNewForm.processing} disabled={participantMode === 'existing' && availableParticipants.length === 0}>Daftarkan Peserta</Button></>}
            >
                <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Cara mendaftarkan peserta"><button type="button" onClick={() => setParticipantMode('existing')} aria-pressed={participantMode === 'existing'} className={`min-h-11 border px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-[#0B63CE] ${participantMode === 'existing' ? 'border-[#0B63CE] bg-[#EAF5FF] text-[#0A3F82]' : 'border-[#DCE7F3] text-[#112743] hover:border-[#0B63CE]'}`}>Ambil dari master</button><button type="button" onClick={() => setParticipantMode('new')} aria-pressed={participantMode === 'new'} className={`min-h-11 border px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-[#0B63CE] ${participantMode === 'new' ? 'border-[#0B63CE] bg-[#EAF5FF] text-[#0A3F82]' : 'border-[#DCE7F3] text-[#112743] hover:border-[#0B63CE]'}`}>Buat peserta baru</button></div>
                {participantMode === 'existing' && (availableParticipants.length === 0 ? <p className="border border-[#DCE7F3] bg-[#F8FBFF] p-4 text-sm text-[#6B7C93]">Semua peserta master sudah terdaftar pada event ini, atau data peserta master belum tersedia.</p> : (
                    <form id="participant-add-form" onSubmit={handleAddParticipant} className="space-y-4">
                        <Combobox
                            label="Peserta master"
                            value={participantAddForm.data.participant_id}
                            onChange={(value) => participantAddForm.setData('participant_id', value)}
                            options={availableParticipants.map((participant) => ({ value: participant.id, label: `${participant.name}${participant.kenshi_id_number ? ` · ${participant.kenshi_id_number}` : ''}` }))}
                            placeholder="Pilih peserta"
                            searchPlaceholder="Cari nama atau ID Kenshi…"
                            emptyText="Peserta yang dapat ditambahkan tidak ditemukan."
                            error={participantAddForm.errors.participant_id}
                            required
                        />
                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField label="Jalur peserta" error={participantAddForm.errors.participant_track_id} required>
                                <Select value={participantAddForm.data.participant_track_id} onChange={(e) => participantAddForm.setData('participant_track_id', e.target.value)} required>
                                    <option value="">Pilih jalur…</option>
                                    {tracks.map((track) => <option key={track.id} value={track.id}>{track.code} · {track.name}</option>)}
                                </Select>
                            </FormField>
                            <FormField label="Kelompok rotasi" error={participantAddForm.errors.rotation_group}>
                                <Select value={participantAddForm.data.rotation_group} onChange={(e) => participantAddForm.setData('rotation_group', e.target.value)}><option value="A1">A1</option><option value="A2">A2</option></Select>
                            </FormField>
                        </div>
                        <FormField label="Status administrasi" error={participantAddForm.errors.admin_status} required>
                            <Select value={participantAddForm.data.admin_status} onChange={(e) => participantAddForm.setData('admin_status', e.target.value)}><option value="verified">Terverifikasi</option><option value="pending">Menunggu verifikasi</option></Select>
                        </FormField>
                    </form>
                ))}
                {participantMode === 'new' && <form id="participant-new-form" onSubmit={handleCreateParticipant} className="space-y-4">
                    <p className="border-l-2 border-[#0B63CE] bg-[#EAF5FF] px-4 py-3 text-sm text-[#112743]">Jika email sudah memiliki akun Peserta yang belum tertaut, akun tersebut akan dihubungkan otomatis.</p>
                    <div className="grid gap-4 sm:grid-cols-2"><FormField label="Nama peserta" error={participantNewForm.errors.name} required><Input value={participantNewForm.data.name} onChange={(e) => participantNewForm.setData('name', e.target.value)} required /></FormField><FormField label="Email peserta" error={participantNewForm.errors.email} required><Input type="email" value={participantNewForm.data.email} onChange={(e) => participantNewForm.setData('email', e.target.value)} required /></FormField></div>
                    <div className="grid gap-4 sm:grid-cols-2"><FormField label="Nomor Kenshi" error={participantNewForm.errors.kenshi_id}><Input value={participantNewForm.data.kenshi_id} onChange={(e) => participantNewForm.setData('kenshi_id', e.target.value)} /></FormField><FormField label="Telepon" error={participantNewForm.errors.phone}><Input type="tel" value={participantNewForm.data.phone} onChange={(e) => participantNewForm.setData('phone', e.target.value)} /></FormField></div>
                    <div className="grid gap-4 sm:grid-cols-2"><FormField label="Asal provinsi" error={participantNewForm.errors.origin} required><Input value={participantNewForm.data.origin} onChange={(e) => participantNewForm.setData('origin', e.target.value)} required /></FormField><FormField label="Dojo" error={participantNewForm.errors.dojo}><Input value={participantNewForm.data.dojo} onChange={(e) => participantNewForm.setData('dojo', e.target.value)} /></FormField></div>
                    <div className="grid gap-4 sm:grid-cols-2"><FormField label="Tingkat DAN" error={participantNewForm.errors.dan_level}><Input type="number" min="1" max="10" value={participantNewForm.data.dan_level} onChange={(e) => participantNewForm.setData('dan_level', e.target.value)} /></FormField><FormField label="Jalur peserta" error={participantNewForm.errors.participant_track_id} required><Select value={participantNewForm.data.participant_track_id} onChange={(e) => participantNewForm.setData('participant_track_id', e.target.value)} required><option value="">Pilih jalur…</option>{tracks.map((track) => <option key={track.id} value={track.id}>{track.code} · {track.name}</option>)}</Select></FormField></div>
                    <div className="grid gap-4 sm:grid-cols-2"><FormField label="Kelompok rotasi" error={participantNewForm.errors.rotation_group}><Select value={participantNewForm.data.rotation_group} onChange={(e) => participantNewForm.setData('rotation_group', e.target.value)}><option value="A1">A1</option><option value="A2">A2</option></Select></FormField><FormField label="Status administrasi" error={participantNewForm.errors.admin_status} required><Select value={participantNewForm.data.admin_status} onChange={(e) => participantNewForm.setData('admin_status', e.target.value)}><option value="verified">Terverifikasi</option><option value="pending">Menunggu verifikasi</option></Select></FormField></div>
                </form>}
            </Modal>

            {/* MODAL: Edit Peserta Event */}
            <Modal
                isOpen={!!editingParticipant}
                onClose={() => setEditingParticipant(null)}
                title={`Kelola Peserta: ${editingParticipant?.name}`}
                size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setEditingParticipant(null)}>
                            Batal
                        </Button>
                        <Button type="submit" form="participant-edit-form" variant="primary" loading={participantEditForm.processing}>
                            Simpan Perubahan
                        </Button>
                    </>
                }
            >
                <form id="participant-edit-form" onSubmit={handleUpdateParticipant} className="space-y-4">
                    {/* Foto Kenshi Upload */}
                    <div className="p-3.5 rounded-xl border border-[#DCE7F3] bg-[#F8FBFF] flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-full border-2 border-[#0B63CE]/30 bg-white overflow-hidden shadow-xs shrink-0 flex items-center justify-center">
                            {editingParticipantPhotoPreview ? (
                                <img src={editingParticipantPhotoPreview} alt="Preview Foto" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-[#6B7C93]">
                                    <Camera className="w-6 h-6 text-[#0B63CE]" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 space-y-1.5">
                            <label className="block text-xs font-bold text-[#0E2747]">
                                Pasfoto Resmi Kenshi
                            </label>
                            <p className="text-[11px] text-[#6B7C93] leading-tight">
                                JPG, PNG, atau WEBP maks. 5MB. Otomatis disinkronkan ke Master Peserta, ID card, dan akun user.
                            </p>
                            <div className="flex items-center gap-2 pt-1">
                                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#DCE7F3] text-xs font-semibold text-[#0E2747] hover:bg-slate-50 hover:border-[#0B63CE] cursor-pointer shadow-xs transition-colors">
                                    <Camera className="w-3.5 h-3.5 text-[#0B63CE]" />
                                    <span>{editingParticipantPhotoPreview ? 'Ganti Foto' : 'Unggah Foto'}</span>
                                    <FileInput
                                        visuallyHidden
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleParticipantPhotoChange}
                                    />
                                </label>
                                {editingParticipantPhotoPreview && (
                                    <button
                                        type="button"
                                        onClick={handleParticipantRemovePhoto}
                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Hapus</span>
                                    </button>
                                )}
                            </div>
                            {participantEditForm.errors.photo && (
                                <p className="text-xs text-rose-600 font-medium">{participantEditForm.errors.photo}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Kelompok Rotasi">
                            <Select
                                value={participantEditForm.data.rotation_group}
                                onChange={(e) => participantEditForm.setData('rotation_group', e.target.value)}
                            >
                                <option value="A1">Kelompok A1</option>
                                <option value="A2">Kelompok A2</option>
                            </Select>
                        </FormField>

                        <FormField label="Status Administrasi">
                            <Select
                                value={participantEditForm.data.admin_status}
                                onChange={(e) => participantEditForm.setData('admin_status', e.target.value)}
                            >
                                <option value="verified">Terverifikasi</option>
                                <option value="pending">Menunggu Verifikasi</option>
                                <option value="rejected">Ditolak</option>
                            </Select>
                        </FormField>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Nilai Teori">
                            <Input
                                type="number"
                                step="0.1"
                                value={participantEditForm.data.theory_score}
                                onChange={(e) => participantEditForm.setData('theory_score', e.target.value)}
                                placeholder="0 - 100"
                            />
                        </FormField>

                        <FormField label="Nilai Praktik">
                            <Input
                                type="number"
                                step="0.1"
                                value={participantEditForm.data.practice_score}
                                onChange={(e) => participantEditForm.setData('practice_score', e.target.value)}
                                placeholder="0 - 100"
                            />
                        </FormField>
                    </div>

                    <FormField label="Nomor Sertifikat">
                        <Input
                            value={participantEditForm.data.certificate_number}
                            onChange={(e) => participantEditForm.setData('certificate_number', e.target.value)}
                            placeholder="SK-PWAD-2026-001"
                        />
                    </FormField>
                </form>
            </Modal>

            {/* MODAL: Hubungkan Modul Pembelajaran */}
            <Modal
                isOpen={isAttachModuleModalOpen}
                onClose={() => setIsAttachModuleModalOpen(false)}
                title="Hubungkan Master Modul Pembelajaran ke Event"
                size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsAttachModuleModalOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            form="attach-module-form"
                            variant="primary"
                            loading={attachModuleForm.processing}
                        >
                            Hubungkan Modul
                        </Button>
                    </>
                }
            >
                <form id="attach-module-form" onSubmit={handleAttachModule} className="space-y-4">
                    <Combobox
                        label="Pilih Master Modul Pembelajaran"
                        value={attachModuleForm.data.learning_module_id}
                        onChange={(value) => attachModuleForm.setData('learning_module_id', value)}
                        options={availableMasterModules.map((module) => ({ value: module.id, label: `[${module.code}] ${module.title} (${module.total_jp} JP - ${module.category || 'Materi'})` }))}
                        placeholder="Pilih modul pembelajaran"
                        searchPlaceholder="Cari kode atau nama modul…"
                        error={attachModuleForm.errors.learning_module_id}
                        required
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Target Jalur Peserta" required>
                            <Select
                                value={attachModuleForm.data.participant_path_id}
                                onChange={(e) => attachModuleForm.setData('participant_path_id', e.target.value)}
                            >
                                <option value="all">Semua Jalur Peserta</option>
                                {tracks.map((t) => (
                                    <option key={t.id} value={t.code}>
                                        {t.name} ({t.code})
                                    </option>
                                ))}
                            </Select>
                        </FormField>

                        <FormField label="Urutan Pembelajaran">
                            <Input
                                type="number"
                                min="1"
                                value={attachModuleForm.data.sort_order}
                                onChange={(e) => attachModuleForm.setData('sort_order', parseInt(e.target.value) || 1)}
                            />
                        </FormField>
                    </div>

                    <div className="rounded-lg border border-[#DCE7F3] bg-[#F8FBFF] p-3">
                        <Checkbox
                            id="module_is_required"
                            checked={attachModuleForm.data.is_required}
                            onChange={(e) => attachModuleForm.setData('is_required', e.target.checked)}
                            label="Modul Wajib"
                            helperText="Peserta wajib menyelesaikan modul ini untuk kelulusan."
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Mulai Tersedia (Opsional)">
                            <Input
                                type="datetime-local"
                                value={attachModuleForm.data.availability_start_at}
                                onChange={(e) => attachModuleForm.setData('availability_start_at', e.target.value)}
                            />
                        </FormField>
                        <FormField label="Batas Akses (Opsional)">
                            <Input
                                type="datetime-local"
                                value={attachModuleForm.data.availability_end_at}
                                onChange={(e) => attachModuleForm.setData('availability_end_at', e.target.value)}
                            />
                        </FormField>
                    </div>
                </form>
            </Modal>

            {/* MODAL: Hubungkan Paket CBT */}
            <Modal
                isOpen={isAttachCbtModalOpen}
                onClose={() => setIsAttachCbtModalOpen(false)}
                title="Hubungkan Master Paket CBT ke Event"
                size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsAttachCbtModalOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            form="attach-cbt-form"
                            variant="primary"
                            loading={attachCbtForm.processing}
                        >
                            Hubungkan Paket CBT
                        </Button>
                    </>
                }
            >
                <form id="attach-cbt-form" onSubmit={handleAttachCbt} className="space-y-4">
                    <Combobox
                        label="Pilih Paket Ujian CBT (Siap Digunakan / Dibuka)"
                        value={attachCbtForm.data.cbt_exam_package_id}
                        onChange={(value) => attachCbtForm.setData('cbt_exam_package_id', value)}
                        options={availableMasterCbtPackages.map((pkg) => ({ value: pkg.id, label: `[${pkg.code}] ${pkg.title} (${pkg.exam_type_label || pkg.exam_type} - ${pkg.duration_minutes}m - ${pkg.status})` }))}
                        placeholder="Pilih paket CBT"
                        searchPlaceholder="Cari kode atau nama paket CBT…"
                        error={attachCbtForm.errors.cbt_exam_package_id}
                        required
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Target Jalur Peserta" required>
                            <Select
                                value={attachCbtForm.data.participant_path_id}
                                onChange={(e) => attachCbtForm.setData('participant_path_id', e.target.value)}
                            >
                                <option value="all">Semua Jalur Peserta</option>
                                {tracks.map((t) => (
                                    <option key={t.id} value={t.code}>
                                        {t.name} ({t.code})
                                    </option>
                                ))}
                            </Select>
                        </FormField>

                        <FormField label="Urutan Evaluasi">
                            <Input
                                type="number"
                                min="1"
                                value={attachCbtForm.data.sort_order}
                                onChange={(e) => attachCbtForm.setData('sort_order', parseInt(e.target.value) || 1)}
                            />
                        </FormField>
                    </div>

                    <FormField label="Syarat Presensi Sesi Rundown (Opsional)">
                        <Select
                            value={attachCbtForm.data.requires_attendance_session_id}
                            onChange={(e) => attachCbtForm.setData('requires_attendance_session_id', e.target.value)}
                        >
                            <option value="">-- Tanpa Syarat Presensi Sesi (Langsung Terbuka) --</option>
                            {Object.values(sessionsByDay || {})
                                .flatMap((d) => d.sessions || [])
                                .map((s) => (
                                    <option key={s.id} value={s.id}>
                                        Hari {s.day_number} • {s.session_number} — {s.topic}
                                    </option>
                                ))}
                        </Select>
                        <p className="text-[11px] text-[#6B7C93] mt-1">
                            Bila dipilih, tombol "Mulai Ujian" di portal peserta hanya akan aktif bila kenshi telah tercatat hadir pada sesi tersebut.
                        </p>
                    </FormField>

                    <div className="rounded-lg border border-[#DCE7F3] bg-[#F8FBFF] p-3">
                        <Checkbox
                            id="cbt_is_required"
                            checked={attachCbtForm.data.is_required}
                            onChange={(e) => attachCbtForm.setData('is_required', e.target.checked)}
                            label="Ujian Wajib"
                            helperText="Kelulusan peserta bergantung pada nilai paket ujian ini."
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Mulai Tersedia (Opsional)">
                            <Input
                                type="datetime-local"
                                value={attachCbtForm.data.availability_start_at}
                                onChange={(e) => attachCbtForm.setData('availability_start_at', e.target.value)}
                            />
                        </FormField>
                        <FormField label="Batas Akses (Opsional)">
                            <Input
                                type="datetime-local"
                                value={attachCbtForm.data.availability_end_at}
                                onChange={(e) => attachCbtForm.setData('availability_end_at', e.target.value)}
                            />
                        </FormField>
                    </div>
                </form>
            </Modal>
        </>
    );
}
