import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import {
    Award,
    CalendarDays,
    Download,
    ExternalLink,
    FileCheck2,
    FileText,
    MapPin,
    Pencil,
    Plus,
    ShieldCheck,
    Trash2,
    UserRoundCheck,
    Users,
    X,
} from 'lucide-react';
import Button from '../../../../Components/ui/Button';
import Card, { CardContent, CardHeader } from '../../../../Components/ui/Card';
import FileInput from '../../../../Components/ui/FileInput';
import Input from '../../../../Components/ui/Input';
import Textarea from '../../../../Components/ui/Textarea';
import { useEventShow } from './EventShowContext';

const emptyMandate = {
    letter_number: '',
    title: 'Surat Mandat Penguji',
    event_name: '',
    source_references: [],
    issued_place: '',
    issued_at: '',
    valid_from: '',
    valid_until: '',
    venue: '',
    address: '',
    province: '',
    exam_scope: '',
    participant_total: '',
    examiners: [],
    provisions: [],
    participant_summary: [],
    home_assignments: [],
    signatory_name: '',
    signatory_title: '',
    document: null,
};

function InformationItem({ icon: Icon, label, children }) {
    return (
        <div className="rounded-xl border border-[#DCE7F3] bg-[#F8FBFF] p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6B7C93]">
                <Icon className="size-4 text-[#0B63CE]" aria-hidden="true" />
                {label}
            </div>
            <div className="mt-2 text-sm font-semibold leading-6 text-[#112743]">{children || 'Belum diisi'}</div>
        </div>
    );
}

function SectionHeading({ title, description }) {
    return (
        <div>
            <h3 className="font-display text-base font-bold text-[#0E2747]">{title}</h3>
            {description && <p className="mt-1 text-sm leading-6 text-[#6B7C93]">{description}</p>}
        </div>
    );
}

export default function EventMandateTab() {
    const { event, mandate } = useEventShow();
    const [isEditing, setIsEditing] = useState(!mandate && event.can_update);
    const form = useForm({
        ...emptyMandate,
        ...(mandate || {}),
        source_references: mandate?.source_references || [],
        examiners: mandate?.examiners || [],
        provisions: mandate?.provisions || [],
        participant_summary: mandate?.participant_summary || [],
        home_assignments: mandate?.home_assignments || [],
        document: null,
        _method: 'put',
    });

    const updateArrayValue = (field, index, value) => {
        form.setData(field, form.data[field].map((item, itemIndex) => itemIndex === index ? value : item));
    };

    const updateObjectValue = (field, index, key, value) => {
        form.setData(field, form.data[field].map((item, itemIndex) => (
            itemIndex === index ? { ...item, [key]: value } : item
        )));
    };

    const removeArrayItem = (field, index) => {
        form.setData(field, form.data[field].filter((_, itemIndex) => itemIndex !== index));
    };

    const submit = (submission) => {
        submission.preventDefault();
        form
            .transform((data) => ({
                ...data,
                participant_total: data.participant_total === '' ? null : Number(data.participant_total),
                participant_summary: data.participant_summary.map((item) => ({
                    ...item,
                    count: Number(item.count || 0),
                })),
            }))
            .post(`/admin/event/${event.id}/mandat`, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    form.setData('document', null);
                    setIsEditing(false);
                },
            });
    };

    const destroyDocument = () => {
        if (!window.confirm('Lepas bukti PDF mandat dari event ini? Informasi mandat tetap tersimpan.')) {
            return;
        }

        router.delete(`/admin/event/${event.id}/mandat/dokumen`, {
            preserveScroll: true,
        });
    };

    if (isEditing) {
        return (
            <form onSubmit={submit} className="space-y-5">
                <Card>
                    <CardHeader
                        title={mandate ? 'Ubah Informasi Surat Mandat' : 'Tambahkan Surat Mandat Event'}
                        description="Informasi ini disimpan khusus untuk event ini. Event lain dapat memiliki nomor, penguji, ketentuan, dan bukti dokumen yang berbeda."
                        action={mandate && (
                            <Button type="button" variant="ghost" size="sm" icon={X} onClick={() => setIsEditing(false)}>
                                Batal
                            </Button>
                        )}
                    />
                    <CardContent className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Input label="Nomor surat" required value={form.data.letter_number} onChange={(change) => form.setData('letter_number', change.target.value)} error={form.errors.letter_number} />
                            <Input label="Judul mandat" required value={form.data.title} onChange={(change) => form.setData('title', change.target.value)} error={form.errors.title} />
                            <div className="md:col-span-2">
                                <Textarea label="Nama kegiatan dalam mandat" rows={2} value={form.data.event_name} onChange={(change) => form.setData('event_name', change.target.value)} error={form.errors.event_name} />
                            </div>
                            <Input label="Tempat diterbitkan" value={form.data.issued_place} onChange={(change) => form.setData('issued_place', change.target.value)} error={form.errors.issued_place} />
                            <Input label="Tanggal diterbitkan" type="date" value={form.data.issued_at} onChange={(change) => form.setData('issued_at', change.target.value)} error={form.errors.issued_at} />
                            <Input label="Mulai berlaku" type="date" value={form.data.valid_from} onChange={(change) => form.setData('valid_from', change.target.value)} error={form.errors.valid_from} />
                            <Input label="Sampai tanggal" type="date" value={form.data.valid_until} onChange={(change) => form.setData('valid_until', change.target.value)} error={form.errors.valid_until} />
                            <Input label="Tempat kegiatan" value={form.data.venue} onChange={(change) => form.setData('venue', change.target.value)} error={form.errors.venue} />
                            <Input label="Provinsi" value={form.data.province} onChange={(change) => form.setData('province', change.target.value)} error={form.errors.province} />
                            <div className="md:col-span-2">
                                <Textarea label="Alamat kegiatan" rows={2} value={form.data.address} onChange={(change) => form.setData('address', change.target.value)} error={form.errors.address} />
                            </div>
                            <div className="md:col-span-2">
                                <Textarea label="Ruang lingkup ujian" rows={2} value={form.data.exam_scope} onChange={(change) => form.setData('exam_scope', change.target.value)} error={form.errors.exam_scope} />
                            </div>
                            <Input label="Jumlah peserta tervalidasi" type="number" min="0" max="65535" value={form.data.participant_total} onChange={(change) => form.setData('participant_total', change.target.value)} error={form.errors.participant_total} />
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Input label="Nama penandatangan" value={form.data.signatory_name} onChange={(change) => form.setData('signatory_name', change.target.value)} error={form.errors.signatory_name} />
                                <Input label="Jabatan penandatangan" value={form.data.signatory_title} onChange={(change) => form.setData('signatory_title', change.target.value)} error={form.errors.signatory_title} />
                            </div>
                        </div>

                        <EditableStringList
                            title="Dasar atau referensi surat"
                            values={form.data.source_references}
                            onAdd={() => form.setData('source_references', [...form.data.source_references, ''])}
                            onChange={(index, value) => updateArrayValue('source_references', index, value)}
                            onRemove={(index) => removeArrayItem('source_references', index)}
                            errors={form.errors}
                            errorPrefix="source_references"
                        />

                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <SectionHeading title="Penguji yang diberi mandat" />
                                <Button type="button" variant="outline" size="sm" icon={Plus} onClick={() => form.setData('examiners', [...form.data.examiners, { name: '', rank: '' }])}>Tambah Penguji</Button>
                            </div>
                            <div className="space-y-3">
                                {form.data.examiners.map((examiner, index) => (
                                    <div key={`examiner-${index}`} className="grid gap-3 rounded-xl border border-[#DCE7F3] bg-[#F8FBFF] p-3 sm:grid-cols-[minmax(0,1fr)_10rem_auto] sm:items-end">
                                        <Input label={`Nama penguji ${index + 1}`} value={examiner.name} onChange={(change) => updateObjectValue('examiners', index, 'name', change.target.value)} error={form.errors[`examiners.${index}.name`]} />
                                        <Input label="Tingkat" placeholder="DAN IV" value={examiner.rank || ''} onChange={(change) => updateObjectValue('examiners', index, 'rank', change.target.value)} error={form.errors[`examiners.${index}.rank`]} />
                                        <Button type="button" variant="ghost" size="sm" icon={Trash2} onClick={() => removeArrayItem('examiners', index)} aria-label={`Hapus penguji ${index + 1}`}>Hapus</Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <EditableStringList
                            title="Ketentuan pelaksanaan"
                            values={form.data.provisions}
                            onAdd={() => form.setData('provisions', [...form.data.provisions, ''])}
                            onChange={(index, value) => updateArrayValue('provisions', index, value)}
                            onRemove={(index) => removeArrayItem('provisions', index)}
                            errors={form.errors}
                            errorPrefix="provisions"
                        />

                        <ParticipantSummaryEditor form={form} updateObjectValue={updateObjectValue} removeArrayItem={removeArrayItem} />
                        <HomeAssignmentEditor form={form} removeArrayItem={removeArrayItem} />

                        <div className="space-y-3 rounded-xl border border-[#B8D8F5] bg-[#F5FAFF] p-4">
                            <SectionHeading title="Bukti dokumen mandat" description="Unggah PDF maksimal 20 MB. Berkas baru akan menggantikan bukti dokumen sebelumnya dan disimpan pada penyimpanan privat." />
                            <FileInput label="File PDF mandat" accept="application/pdf,.pdf" onChange={(change) => form.setData('document', change.target.files?.[0] || null)} error={form.errors.document} helperText={mandate?.document_name ? `Dokumen saat ini: ${mandate.document_name}` : 'Belum ada dokumen mandat.'} />
                        </div>
                    </CardContent>
                </Card>

                <div className="sticky bottom-4 z-20 flex justify-end rounded-xl border border-[#DCE7F3] bg-white/95 p-3 shadow-lg backdrop-blur-sm">
                    <Button type="submit" icon={FileCheck2} loading={form.processing}>Simpan Informasi Mandat</Button>
                </div>
            </form>
        );
    }

    if (!mandate) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
                    <div className="flex size-14 items-center justify-center rounded-full bg-[#EAF5FF] text-[#0B63CE]"><FileText className="size-7" aria-hidden="true" /></div>
                    <div>
                        <h2 className="font-display text-lg font-bold text-[#0E2747]">Mandat belum dicatat</h2>
                        <p className="mt-1 max-w-xl text-sm leading-6 text-[#6B7C93]">Masukkan informasi surat dan unggah bukti PDF resmi untuk event ini.</p>
                    </div>
                    {event.can_update && <Button icon={Plus} onClick={() => setIsEditing(true)}>Tambah Mandat</Button>}
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-5">
            <Card className="border-[#B8D8F5]">
                <CardHeader
                    title={mandate.title}
                    description={`Nomor ${mandate.letter_number}`}
                    action={(
                        <>
                            {mandate.document_url && <Button as="a" href={mandate.document_url} target="_blank" rel="noreferrer" variant="outline" size="sm" icon={ExternalLink}>Lihat PDF</Button>}
                            {mandate.document_download_url && <Button as="a" href={mandate.document_download_url} variant="secondary" size="sm" icon={Download}>Unduh</Button>}
                            {mandate.can_update && <Button size="sm" icon={Pencil} onClick={() => setIsEditing(true)}>Kelola Mandat</Button>}
                        </>
                    )}
                />
                <CardContent>
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-200">
                                <ShieldCheck className="size-4" aria-hidden="true" />
                                Mandat resmi terhubung ke event
                            </div>
                            <h2 className="mt-4 font-display text-xl font-bold leading-8 text-[#0E2747]">{mandate.event_name || event.name}</h2>
                            <p className="mt-2 text-sm leading-6 text-[#596F88]">{mandate.exam_scope}</p>
                        </div>
                        {mandate.document_url ? (
                            <div className="min-w-0 rounded-xl border border-emerald-200 bg-emerald-50 p-4 lg:w-72">
                                <div className="flex items-start gap-3">
                                    <FileCheck2 className="mt-0.5 size-5 shrink-0 text-emerald-700" aria-hidden="true" />
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">Bukti PDF tersedia</p>
                                        <p className="mt-1 break-words text-sm font-semibold text-emerald-950">{mandate.document_name}</p>
                                        <p className="mt-1 text-xs text-emerald-800">{mandate.document_size_formatted || 'Ukuran tidak tercatat'}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Bukti PDF belum diunggah.</div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <InformationItem icon={CalendarDays} label="Masa berlaku">{mandate.validity_formatted}</InformationItem>
                <InformationItem icon={MapPin} label="Tempat kegiatan">{mandate.venue}</InformationItem>
                <InformationItem icon={Users} label="Peserta tervalidasi">{mandate.participant_total !== null ? `${mandate.participant_total} kenshi` : null}</InformationItem>
                <InformationItem icon={FileText} label="Diterbitkan">{[mandate.issued_place, mandate.issued_at_formatted].filter(Boolean).join(', ')}</InformationItem>
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
                <Card>
                    <CardHeader title="Dewan Penguji Mandat" description="Nama dan tingkat sebagaimana tercantum pada Surat Mandat PB PERKEMI." />
                    <CardContent>
                        <ol className="space-y-3">
                            {mandate.examiners.map((examiner, index) => (
                                <li key={`${examiner.name}-${index}`} className="flex items-center gap-3 rounded-xl border border-[#DCE7F3] p-3">
                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#EAF5FF] text-sm font-bold text-[#0B63CE]">{index + 1}</span>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-[#112743]">{examiner.name}</p>
                                        <p className="text-xs font-semibold text-[#0B63CE]">{examiner.rank || 'Tingkat belum dicatat'}</p>
                                    </div>
                                    <UserRoundCheck className="size-5 shrink-0 text-emerald-600" aria-hidden="true" />
                                </li>
                            ))}
                        </ol>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader title="Rekap Lampiran Peserta" description="Ringkasan peserta yang telah divalidasi PB PERKEMI berdasarkan tingkat tujuan." />
                    <CardContent>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {mandate.participant_summary.map((item) => (
                                <div key={item.level} className="rounded-xl border border-[#DCE7F3] bg-[#F8FBFF] p-3 text-center">
                                    <p className="text-xs font-semibold text-[#6B7C93]">{item.level}</p>
                                    <p className="mt-1 text-2xl font-bold tabular-nums text-[#0A3F82]">{item.count}</p>
                                    <p className="text-[11px] text-[#6B7C93]">kenshi</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader title="Dasar dan Ketentuan Mandat" description="Ringkasan butir resmi yang perlu dipenuhi penyelenggara, penguji, dan peserta." />
                <CardContent className="grid gap-6 lg:grid-cols-2">
                    <div>
                        <SectionHeading title="Dasar penerbitan" />
                        <ul className="mt-3 space-y-3">
                            {mandate.source_references.map((reference, index) => (
                                <li key={index} className="flex gap-3 text-sm leading-6 text-[#112743]"><FileText className="mt-1 size-4 shrink-0 text-[#0B63CE]" aria-hidden="true" /><span>{reference}</span></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <SectionHeading title="Ketentuan pelaksanaan" />
                        <ol className="mt-3 space-y-3">
                            {mandate.provisions.map((provision, index) => (
                                <li key={index} className="flex gap-3 text-sm leading-6 text-[#112743]"><span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#EAF5FF] text-xs font-bold text-[#0B63CE]">{index + 1}</span><span>{provision}</span></li>
                            ))}
                        </ol>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader title="Home Assignment Peserta UKT" description="Tugas wajib ditulis tangan sebelum atau saat pelaksanaan ujian, dikelompokkan berdasarkan tingkat tujuan." />
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {mandate.home_assignments.map((assignment) => (
                            <section key={assignment.level} aria-labelledby={`assignment-${assignment.level.replace(/\s+/g, '-').toLowerCase()}`} className="rounded-xl border border-[#DCE7F3] p-4">
                                <div className="flex items-center gap-2">
                                    <Award className="size-5 text-[#EE9B25]" aria-hidden="true" />
                                    <h3 id={`assignment-${assignment.level.replace(/\s+/g, '-').toLowerCase()}`} className="font-display font-bold text-[#0E2747]">Menuju {assignment.level}</h3>
                                </div>
                                <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-[#596F88]">
                                    {assignment.questions.map((question, index) => <li key={index}>{question}</li>)}
                                </ol>
                            </section>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7C93]">Penandatangan mandat</p>
                        <p className="mt-1 font-display text-base font-bold text-[#0E2747]">{mandate.signatory_name || 'Belum dicatat'}</p>
                        <p className="text-sm text-[#596F88]">{mandate.signatory_title}</p>
                    </div>
                    {mandate.can_update && mandate.document_url && <Button variant="danger" size="sm" icon={Trash2} onClick={destroyDocument}>Lepas Bukti PDF</Button>}
                </CardContent>
            </Card>
        </div>
    );
}

function EditableStringList({ title, values, onAdd, onChange, onRemove, errors, errorPrefix }) {
    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <SectionHeading title={title} />
                <Button type="button" variant="outline" size="sm" icon={Plus} onClick={onAdd}>Tambah Butir</Button>
            </div>
            <div className="space-y-3">
                {values.map((value, index) => (
                    <div key={`${errorPrefix}-${index}`} className="grid gap-3 rounded-xl border border-[#DCE7F3] bg-[#F8FBFF] p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                        <Textarea label={`Butir ${index + 1}`} rows={2} value={value} onChange={(change) => onChange(index, change.target.value)} error={errors[`${errorPrefix}.${index}`]} />
                        <Button type="button" variant="ghost" size="sm" icon={Trash2} onClick={() => onRemove(index)} aria-label={`Hapus butir ${index + 1}`}>Hapus</Button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ParticipantSummaryEditor({ form, updateObjectValue, removeArrayItem }) {
    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <SectionHeading title="Rekap peserta per tingkat" />
                <Button type="button" variant="outline" size="sm" icon={Plus} onClick={() => form.setData('participant_summary', [...form.data.participant_summary, { level: '', count: 0 }])}>Tambah Tingkat</Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
                {form.data.participant_summary.map((item, index) => (
                    <div key={`summary-${index}`} className="grid gap-3 rounded-xl border border-[#DCE7F3] bg-[#F8FBFF] p-3 sm:grid-cols-[minmax(0,1fr)_8rem_auto] sm:items-end">
                        <Input label="Tingkat" placeholder="KYU 8" value={item.level} onChange={(change) => updateObjectValue('participant_summary', index, 'level', change.target.value)} error={form.errors[`participant_summary.${index}.level`]} />
                        <Input label="Jumlah" type="number" min="0" value={item.count} onChange={(change) => updateObjectValue('participant_summary', index, 'count', change.target.value)} error={form.errors[`participant_summary.${index}.count`]} />
                        <Button type="button" variant="ghost" size="sm" icon={Trash2} onClick={() => removeArrayItem('participant_summary', index)} aria-label={`Hapus rekap tingkat ${index + 1}`}>Hapus</Button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function HomeAssignmentEditor({ form, removeArrayItem }) {
    const updateAssignment = (index, key, value) => {
        form.setData('home_assignments', form.data.home_assignments.map((item, itemIndex) => (
            itemIndex === index ? { ...item, [key]: value } : item
        )));
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <SectionHeading title="Home assignment per tingkat" description="Tuliskan satu pertanyaan per baris." />
                <Button type="button" variant="outline" size="sm" icon={Plus} onClick={() => form.setData('home_assignments', [...form.data.home_assignments, { level: '', questions: [] }])}>Tambah Tingkat</Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
                {form.data.home_assignments.map((assignment, index) => (
                    <div key={`assignment-editor-${index}`} className="space-y-3 rounded-xl border border-[#DCE7F3] bg-[#F8FBFF] p-3">
                        <div className="flex items-end gap-3">
                            <Input label="Tingkat" placeholder="KYU 8" value={assignment.level} onChange={(change) => updateAssignment(index, 'level', change.target.value)} error={form.errors[`home_assignments.${index}.level`]} />
                            <Button type="button" variant="ghost" size="sm" icon={Trash2} onClick={() => removeArrayItem('home_assignments', index)} aria-label={`Hapus tugas tingkat ${index + 1}`}>Hapus</Button>
                        </div>
                        <Textarea
                            label="Pertanyaan"
                            rows={5}
                            value={(assignment.questions || []).join('\n')}
                            onChange={(change) => updateAssignment(index, 'questions', change.target.value.split('\n').filter((line) => line.trim() !== ''))}
                            error={form.errors[`home_assignments.${index}.questions`]}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
