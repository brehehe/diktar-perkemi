import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/admin/PageHeader';
import Button from '../../../Components/ui/Button';
import FormField from '../../../Components/ui/FormField';
import Input from '../../../Components/ui/Input';
import Select from '../../../Components/ui/Select';
import Textarea from '../../../Components/ui/Textarea';
import { ArrowLeft, Save, Calendar, Info, Clock, MapPin, Building, Users } from 'lucide-react';

export default function Create({ organizers = [], canAssignOrganizer = true, currentOrganizer = null }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        place: '',
        organizer: '',
        responsible_user_id: '',
        duration_days: '',
        total_effective_jp: '',
        total_schedule_jp: '',
        jp_duration_minutes: 45,
        learning_method: '',
        participant_quota: '',
        status: 'draft',
        cover_image: '',
        banner_image: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/admin/event');
    };

    return (
        <AdminLayout>
            <Head title="Tambah Event Penataran Baru" />

            <div className="mx-auto w-full max-w-full space-y-6">
                <PageHeader
                    title="Buat Event Penataran Baru"
                    description="Daftarkan kegiatan penataran kualifikasi, beban jam pelajaran efektif, dan metode pelatihan."
                    breadcrumbs={[
                        { label: 'Event Penataran', href: '/admin/event' },
                        { label: 'Tambah Event' },
                    ]}
                    action={
                        <Button as={Link} href="/admin/event" size="sm" variant="secondary" icon={<ArrowLeft className="w-4 h-4" />}>
                            Kembali
                        </Button>
                    }
                />

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Section 1: Informasi Utama */}
                    <div className="bg-white rounded-xl border border-[#DCE7F3] p-6 shadow-xs space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-[#DCE7F3]">
                            <Calendar className="w-5 h-5 text-[#0B63CE]" />
                            <h3 className="font-display font-bold text-sm text-[#0E2747]">
                                Informasi Umum Penataran
                            </h3>
                        </div>

                        <FormField label="Nama Event Penataran" error={errors.name} required>
                            <Input
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Contoh: Workshop Kualifikasi Pelatih & Wasit Shorinji Kempo 2026"
                                required
                            />
                        </FormField>

                        <FormField label="Deskripsi Singkat" error={errors.description}>
                            <Textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={3}
                                placeholder="Jelaskan tujuan kegiatan, target peserta, dan hasil yang diharapkan..."
                            />
                        </FormField>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Tempat / Lokasi" error={errors.place} required>
                                <Input
                                    value={data.place}
                                    onChange={(e) => setData('place', e.target.value)}
                                    placeholder="Contoh: Ubaya Training Center (UTC), Trawas, Mojokerto"
                                    required
                                />
                            </FormField>

                            <FormField label="Penyelenggara" error={errors.organizer} required>
                                <Input
                                    value={data.organizer}
                                    onChange={(e) => setData('organizer', e.target.value)}
                                    placeholder="Contoh: PB PERKEMI / Pengprov"
                                    required
                                />
                            </FormField>
                        </div>

                        <FormField label="Penanggung Jawab" error={errors.responsible_user_id}>
                            {canAssignOrganizer ? (
                                <Select value={data.responsible_user_id} onChange={(e) => setData('responsible_user_id', e.target.value)}>
                                    <option value="">Belum ditetapkan</option>
                                    {organizers.map((user) => <option key={user.id} value={user.id}>{user.name} ({user.email})</option>)}
                                </Select>
                            ) : (
                                <div className="min-h-11 rounded-lg border border-[#DCE7F3] bg-[#F8FBFF] px-3 py-2.5 text-sm text-[#112743]">
                                    <span className="font-semibold">{currentOrganizer?.name}</span>
                                    {currentOrganizer?.email && <span className="ml-1 text-[#6B7C93]">({currentOrganizer.email})</span>}
                                    <p className="mt-1 text-xs text-[#6B7C93]">Event baru otomatis menjadi tanggung jawab akun Anda.</p>
                                </div>
                            )}
                        </FormField>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField label="Tanggal Mulai" error={errors.start_date} required>
                                <Input
                                    type="date"
                                    value={data.start_date}
                                    onChange={(e) => setData('start_date', e.target.value)}
                                    required
                                />
                            </FormField>

                            <FormField label="Tanggal Selesai" error={errors.end_date} required>
                                <Input
                                    type="date"
                                    value={data.end_date}
                                    onChange={(e) => setData('end_date', e.target.value)}
                                    required
                                />
                            </FormField>

                            <FormField label="Estimasi Durasi Hari" error={errors.duration_days}>
                                <Input
                                    value={data.duration_days}
                                    onChange={(e) => setData('duration_days', e.target.value)}
                                    placeholder="Contoh: 3,5 hari"
                                />
                            </FormField>
                        </div>
                    </div>

                    {/* Section 2: Beban Jam Pelajaran & Metode */}
                    <div className="bg-white rounded-xl border border-[#DCE7F3] p-6 shadow-xs space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-[#DCE7F3]">
                            <Clock className="w-5 h-5 text-[#EE9B25]" />
                            <div>
                                <h3 className="font-display font-bold text-sm text-[#0E2747]">
                                    Kurikulum & Beban Jam Pelajaran (JP)
                                </h3>
                                <p className="text-[11px] text-[#6B7C93]">
                                    Total JP Efektif disimpan terpisah dari Total JP Jadwal agar kelas rotasi ganda tidak merusak akreditasi.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField label="Total JP Efektif (Akreditasi)" error={errors.total_effective_jp} required>
                                <Input
                                    type="number"
                                    min="1"
                                    value={data.total_effective_jp}
                                    onChange={(e) => setData('total_effective_jp', parseInt(e.target.value) || 0)}
                                    placeholder="34"
                                    required
                                />
                                <span className="text-[10px] text-[#6B7C93] mt-0.5 block">
                                    Beban belajar yang diakui sertifikat (contoh: 34 JP).
                                </span>
                            </FormField>

                            <FormField label="Total JP Jadwal (Termasuk Rotasi)" error={errors.total_schedule_jp} required>
                                <Input
                                    type="number"
                                    min="1"
                                    value={data.total_schedule_jp}
                                    onChange={(e) => setData('total_schedule_jp', parseInt(e.target.value) || 0)}
                                    placeholder="38"
                                    required
                                />
                                <span className="text-[10px] text-[#6B7C93] mt-0.5 block">
                                    Total sesi rundown fisik (contoh: 38 JP).
                                </span>
                            </FormField>

                            <FormField label="Durasi 1 JP (Menit)" error={errors.jp_duration_minutes} required>
                                <Input
                                    type="number"
                                    min="1"
                                    value={data.jp_duration_minutes}
                                    onChange={(e) => setData('jp_duration_minutes', parseInt(e.target.value) || 45)}
                                    placeholder="45"
                                    required
                                />
                                <span className="text-[10px] text-[#6B7C93] mt-0.5 block">
                                    Standar PERKEMI: 1 JP = 45 menit.
                                </span>
                            </FormField>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Metode Pembelajaran" error={errors.learning_method}>
                                <Input
                                    value={data.learning_method}
                                    onChange={(e) => setData('learning_method', e.target.value)}
                                    placeholder="Contoh: Pleno, paralel, dan rotasi peserta ganda"
                                />
                            </FormField>

                            <FormField label="Kuota Maksimal Peserta" error={errors.participant_quota} required>
                                <Input
                                    type="number"
                                    min="1"
                                    value={data.participant_quota}
                                    onChange={(e) => setData('participant_quota', e.target.value)}
                                    placeholder="100"
                                    required
                                />
                            </FormField>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Status Publikasi Event" error={errors.status} required>
                                <Select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                >
                                    <option value="draft">Draft (Hanya Pengurus)</option>
                                    <option value="open_registration">Pendaftaran Dibuka</option>
                                    <option value="ongoing">Sedang Berlangsung</option>
                                    <option value="completed">Selesai</option>
                                    <option value="archived">Diarsipkan</option>
                                </Select>
                            </FormField>

                            <FormField label="URL Gambar Cover / Banner" error={errors.cover_image}>
                                <Input
                                    value={data.cover_image}
                                    onChange={(e) => setData('cover_image', e.target.value)}
                                    placeholder="https://..."
                                />
                            </FormField>
                        </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Link href="/admin/event">
                            <Button variant="secondary">Batal</Button>
                        </Link>
                        <Button
                            type="submit"
                            variant="primary"
                            loading={processing}
                            icon={<Save className="w-4 h-4" />}
                        >
                            Simpan & Buka Detail Event
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
