import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/admin/PageHeader';
import Button from '../../../Components/ui/Button';
import FormField from '../../../Components/ui/FormField';
import Input from '../../../Components/ui/Input';
import Select from '../../../Components/ui/Select';
import Textarea from '../../../Components/ui/Textarea';
import { ArrowLeft, Save, Calendar, Clock } from 'lucide-react';

export default function Edit({ event = {}, organizers = [], canAssignOrganizer = false }) {
    const eventName = event.name || event.title || '';
    const eventPlace = event.place || event.location || '';
    const eventDuration = event.duration_days || event.duration_text || '';
    const eventQuota = event.participant_quota ?? event.quota ?? '';
    const eventBanner = event.cover_image || event.banner_image || event.banner_path || '';

    const { data, setData, put, processing, errors } = useForm({
        name: eventName,
        description: event.description || '',
        start_date: event.start_date ? event.start_date.substring(0, 10) : '',
        end_date: event.end_date ? event.end_date.substring(0, 10) : '',
        place: eventPlace,
        organizer: event.organizer || '',
        responsible_user_id: event.responsible_user_id || '',
        duration_days: eventDuration,
        total_effective_jp: event.total_effective_jp || 34,
        total_schedule_jp: event.total_schedule_jp || 38,
        jp_duration_minutes: event.jp_duration_minutes || 45,
        learning_method: event.learning_method || '',
        participant_quota: eventQuota,
        status: event.status || 'draft',
        cover_image: eventBanner,
        banner_image: eventBanner,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(`/admin/event/${event.id}`);
    };

    return (
        <AdminLayout>
            <Head title={`Edit ${eventName || 'Event'}`} />

            <div className="mx-auto w-full max-w-full space-y-6">
                <PageHeader
                    title="Edit Informasi Event Penataran"
                    description="Perbarui informasi umum, tanggal kegiatan, kuota, atau konfigurasi jam pelajaran."
                    breadcrumbs={[
                        { label: 'Event Penataran', href: '/admin/event' },
                        { label: eventName || 'Detail', href: `/admin/event/${event.id}` },
                        { label: 'Edit' },
                    ]}
                    action={
                        <Button as={Link} href={`/admin/event/${event.id}`} size="sm" variant="secondary" icon={<ArrowLeft className="w-4 h-4" />}>
                            Kembali ke Detail
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
                                required
                            />
                        </FormField>

                        <FormField label="Deskripsi Singkat" error={errors.description}>
                            <Textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={3}
                            />
                        </FormField>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Tempat / Lokasi" error={errors.place} required>
                                <Input
                                    value={data.place}
                                    onChange={(e) => setData('place', e.target.value)}
                                    required
                                />
                            </FormField>

                            <FormField label="Penyelenggara" error={errors.organizer} required>
                                <Input
                                    value={data.organizer}
                                    onChange={(e) => setData('organizer', e.target.value)}
                                    required
                                />
                            </FormField>
                        </div>

                        {canAssignOrganizer ? <FormField label="Penanggung Jawab" error={errors.responsible_user_id}>
                            <Select value={data.responsible_user_id} onChange={(e) => setData('responsible_user_id', e.target.value)}>
                                <option value="">Belum ditetapkan</option>
                                {organizers.map((user) => <option key={user.id} value={user.id}>{user.name} ({user.email})</option>)}
                            </Select>
                        </FormField> : <p className="text-sm text-[#6B7C93]">Penanggung jawab: {organizers.find((user) => user.id === Number(data.responsible_user_id))?.name || 'Belum ditetapkan'}</p>}

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
                                />
                            </FormField>
                        </div>
                    </div>

                    {/* Section 2: Beban Jam Pelajaran & Metode */}
                    <div className="bg-white rounded-xl border border-[#DCE7F3] p-6 shadow-xs space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-[#DCE7F3]">
                            <Clock className="w-5 h-5 text-[#EE9B25]" />
                            <h3 className="font-display font-bold text-sm text-[#0E2747]">
                                Beban Jam Pelajaran (JP) & Metode
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField label="Total JP Efektif (Akreditasi)" error={errors.total_effective_jp} required>
                                <Input
                                    type="number"
                                    min="1"
                                    value={data.total_effective_jp}
                                    onChange={(e) => setData('total_effective_jp', parseInt(e.target.value) || 0)}
                                    required
                                />
                            </FormField>

                            <FormField label="Total JP Jadwal (Termasuk Rotasi)" error={errors.total_schedule_jp} required>
                                <Input
                                    type="number"
                                    min="1"
                                    value={data.total_schedule_jp}
                                    onChange={(e) => setData('total_schedule_jp', parseInt(e.target.value) || 0)}
                                    required
                                />
                            </FormField>

                            <FormField label="Durasi 1 JP (Menit)" error={errors.jp_duration_minutes} required>
                                <Input
                                    type="number"
                                    min="1"
                                    value={data.jp_duration_minutes}
                                    onChange={(e) => setData('jp_duration_minutes', parseInt(e.target.value) || 45)}
                                    required
                                />
                            </FormField>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Metode Pembelajaran" error={errors.learning_method}>
                                <Input
                                    value={data.learning_method}
                                    onChange={(e) => setData('learning_method', e.target.value)}
                                />
                            </FormField>

                            <FormField label="Kuota Maksimal Peserta" error={errors.participant_quota} required>
                                <Input
                                    type="number"
                                    min="1"
                                    value={data.participant_quota}
                                    onChange={(e) => setData('participant_quota', e.target.value)}
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
                                />
                            </FormField>
                        </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Link href={`/admin/event/${event.id}`}>
                            <Button variant="secondary">Batal</Button>
                        </Link>
                        <Button
                            type="submit"
                            variant="primary"
                            loading={processing}
                            icon={<Save className="w-4 h-4" />}
                        >
                            Perbarui Data Event
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
