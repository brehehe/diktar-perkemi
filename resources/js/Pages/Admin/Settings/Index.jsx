import React, { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/admin/PageHeader';
import Button from '../../../Components/ui/Button';
import Input from '../../../Components/ui/Input';
import Textarea from '../../../Components/ui/Textarea';
import Switch from '../../../Components/ui/Switch';
import {
    Sliders,
    Building,
    LayoutTemplate,
    UserCheck,
    Bell,
    Save,
    Sparkles,
    ArrowUpRight,
} from 'lucide-react';

export default function Index({ settings = {} }) {
    const [activeTab, setActiveTab] = useState('identity');

    // Tab 1: Identitas
    const identityForm = useForm({
        settings_group: 'identity',
        site_name: settings.site_name || 'Pustaka Penataran',
        site_tagline: settings.site_tagline || 'Portal Buku Digital PERKEMI',
        organization_name: settings.organization_name || 'Pengurus Besar Persaudaraan Shorinji Kempo Indonesia (PB PERKEMI)',
        contact_email: settings.contact_email || 'sekretariat@perkemi.id',
        contact_phone: settings.contact_phone || '+62 21 5703888',
    });

    // Tab 2: Tampilan Landing
    const landingForm = useForm({
        settings_group: 'landing',
        hero_badge: settings.hero_badge || 'PORTAL BUKU DIGITAL PERKEMI',
        hero_title: settings.hero_title || 'Satu Akses, Banyak Pengetahuan',
        hero_subtitle: settings.hero_subtitle || 'Akses buku digital, modul penataran, dan bahan ajar pemateri dalam satu portal terintegrasi. Dirancang untuk mendukung proses belajar, pengembangan kompetensi, dan penyelenggaraan penataran PERKEMI.',
    });

    // Tab 3: Akses & Registrasi
    const accessForm = useForm({
        settings_group: 'registration',
        allow_registration: settings.allow_registration === '1' || settings.allow_registration === 'true',
        require_email_verification: settings.require_email_verification === '1' || settings.require_email_verification === 'true',
        maintenance_mode: settings.maintenance_mode === '1' || settings.maintenance_mode === 'true',
    });

    // Tab 4: Notifikasi
    const notificationForm = useForm({
        settings_group: 'notification',
        smtp_host: settings.smtp_host || 'mail.perkemi.id',
        notification_email: settings.notification_email || 'notifikasi@perkemi.id',
    });

    const handleIdentitySubmit = (e) => {
        e.preventDefault();
        identityForm.put('/admin/pengaturan');
    };

    const handleLandingSubmit = (e) => {
        e.preventDefault();
        landingForm.put('/admin/pengaturan');
    };

    const handleAccessSubmit = (e) => {
        e.preventDefault();
        accessForm.transform((data) => ({
            ...data,
            allow_registration: data.allow_registration ? '1' : '0',
            require_email_verification: data.require_email_verification ? '1' : '0',
            maintenance_mode: data.maintenance_mode ? '1' : '0',
        })).put('/admin/pengaturan');
    };

    const handleNotificationSubmit = (e) => {
        e.preventDefault();
        notificationForm.put('/admin/pengaturan');
    };

    const tabs = [
        { id: 'identity', label: 'Identitas Portal', icon: Building },
        { id: 'landing', label: 'Tampilan Beranda', icon: LayoutTemplate },
        { id: 'access', label: 'Akses & Registrasi', icon: UserCheck },
        { id: 'notification', label: 'Notifikasi & Email', icon: Bell },
    ];

    return (
        <AdminLayout title="Pengaturan Portal">
            <PageHeader
                title="Pengaturan Portal"
                description="Konfigurasi identitas kelembagaan PERKEMI, teks halaman beranda, dan parameter keamanan sistem."
                breadcrumbs={[{ label: 'Pengaturan' }]}
            />

            {/* Navigation Tabs */}
            <div className="flex border-b border-[#DCE7F3] mb-6 overflow-x-auto">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                flex items-center gap-2 px-5 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap
                                ${isActive
                                    ? 'border-[#0B63CE] text-[#0B63CE] bg-[#EAF5FF]/30'
                                    : 'border-transparent text-[#6B7C93] hover:text-[#112743] hover:border-[#DCE7F3]'
                                }
                            `}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Tab 1: Identitas */}
            {activeTab === 'identity' && (
                <form onSubmit={handleIdentitySubmit} className="max-w-3xl space-y-6">
                    <div className="bg-white rounded-xl border border-[#DCE7F3] p-6 shadow-xs space-y-5">
                        <h2 className="text-sm font-bold text-[#0E2747] border-b border-[#DCE7F3] pb-3">
                            Identitas Institusi & Portal
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Nama Portal"
                                value={identityForm.data.site_name}
                                onChange={(e) => identityForm.setData('site_name', e.target.value)}
                                required
                            />
                            <Input
                                label="Slogan / Tagline"
                                value={identityForm.data.site_tagline}
                                onChange={(e) => identityForm.setData('site_tagline', e.target.value)}
                            />
                        </div>

                        <Input
                            label="Nama Organisasi Induk"
                            value={identityForm.data.organization_name}
                            onChange={(e) => identityForm.setData('organization_name', e.target.value)}
                            required
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Email Kontak Resmi"
                                type="email"
                                value={identityForm.data.contact_email}
                                onChange={(e) => identityForm.setData('contact_email', e.target.value)}
                                required
                            />
                            <Input
                                label="Nomor Telepon Sekretariat"
                                value={identityForm.data.contact_phone}
                                onChange={(e) => identityForm.setData('contact_phone', e.target.value)}
                            />
                        </div>

                        <div className="pt-4 border-t border-[#DCE7F3] flex justify-end">
                            <Button
                                type="submit"
                                variant="primary"
                                size="sm"
                                icon={Save}
                                loading={identityForm.processing}
                            >
                                Simpan Identitas
                            </Button>
                        </div>
                    </div>
                </form>
            )}

            {/* Tab 2: Landing Page */}
            {activeTab === 'landing' && (
                <div className="max-w-3xl space-y-6">
                    {/* Banner Shortcut ke Showcase 3 Buku */}
                    <div className="bg-gradient-to-r from-[#EAF5FF] to-white rounded-xl border border-[#BCE0FD] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start sm:items-center gap-3.5">
                            <div className="w-10 h-10 rounded-lg bg-[#0B63CE] text-white flex items-center justify-center shrink-0 shadow-xs">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-[#0E2747]">Visual Showcase 3 Buku Beranda</h3>
                                <p className="text-xs text-[#6B7C93] mt-0.5">
                                    Unggah cover custom, ganti judul, dan atur tautan navigasi untuk 3 buku 3D di hero section.
                                </p>
                            </div>
                        </div>
                        <Link href="/admin/showcase" className="shrink-0">
                            <Button type="button" variant="primary" size="sm" icon={ArrowUpRight}>
                                Kelola Showcase
                            </Button>
                        </Link>
                    </div>

                    <form onSubmit={handleLandingSubmit} className="space-y-6">
                        <div className="bg-white rounded-xl border border-[#DCE7F3] p-6 shadow-xs space-y-5">
                            <h2 className="text-sm font-bold text-[#0E2747] border-b border-[#DCE7F3] pb-3">
                                Konten Teks Sorotan Beranda (Hero Section)
                            </h2>

                        <Input
                            label="Lencana Hero (Top Badge)"
                            value={landingForm.data.hero_badge}
                            onChange={(e) => landingForm.setData('hero_badge', e.target.value)}
                        />

                        <Input
                            label="Headline Utama Beranda"
                            value={landingForm.data.hero_title}
                            onChange={(e) => landingForm.setData('hero_title', e.target.value)}
                            required
                        />

                        <Textarea
                            label="Subheadline / Uraian Pengantar"
                            value={landingForm.data.hero_subtitle}
                            onChange={(e) => landingForm.setData('hero_subtitle', e.target.value)}
                            rows={4}
                            required
                        />

                        <div className="pt-4 border-t border-[#DCE7F3] flex justify-end">
                            <Button
                                type="submit"
                                variant="primary"
                                size="sm"
                                icon={Save}
                                loading={landingForm.processing}
                            >
                                Simpan Konten Beranda
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        )}

            {/* Tab 3: Akses & Registrasi */}
            {activeTab === 'access' && (
                <form onSubmit={handleAccessSubmit} className="max-w-3xl space-y-6">
                    <div className="bg-white rounded-xl border border-[#DCE7F3] p-6 shadow-xs space-y-6">
                        <h2 className="text-sm font-bold text-[#0E2747] border-b border-[#DCE7F3] pb-3">
                            Kebijakan Akses & Pendaftaran Akun
                        </h2>

                        <div className="space-y-5">
                            <Switch
                                label="Buka Pendaftaran Akun Mandiri (Registrasi Kenshi)"
                                helperText="Jika dimatikan, hanya administrator yang dapat membuat akun baru melalui panel admin."
                                checked={accessForm.data.allow_registration}
                                onChange={(val) => accessForm.setData('allow_registration', val)}
                            />

                            <Switch
                                label="Wajib Verifikasi Email"
                                helperText="Kenshi harus mengonfirmasi tautan aktivasi email sebelum dapat membaca modul berhak cipta."
                                checked={accessForm.data.require_email_verification}
                                onChange={(val) => accessForm.setData('require_email_verification', val)}
                            />

                            <Switch
                                label="Mode Perawatan Portal (Maintenance Mode)"
                                helperText="Tutup sementara akses portal publik untuk kegiatan pemeliharaan database penataran."
                                checked={accessForm.data.maintenance_mode}
                                onChange={(val) => accessForm.setData('maintenance_mode', val)}
                            />
                        </div>

                        <div className="pt-4 border-t border-[#DCE7F3] flex justify-end">
                            <Button
                                type="submit"
                                variant="primary"
                                size="sm"
                                icon={Save}
                                loading={accessForm.processing}
                            >
                                Simpan Kebijakan Akses
                            </Button>
                        </div>
                    </div>
                </form>
            )}

            {/* Tab 4: Notifikasi */}
            {activeTab === 'notification' && (
                <form onSubmit={handleNotificationSubmit} className="max-w-3xl space-y-6">
                    <div className="bg-white rounded-xl border border-[#DCE7F3] p-6 shadow-xs space-y-5">
                        <h2 className="text-sm font-bold text-[#0E2747] border-b border-[#DCE7F3] pb-3">
                            Konfigurasi Pengiriman Surel Notifikasi
                        </h2>

                        <Input
                            label="Server SMTP Keluar"
                            value={notificationForm.data.smtp_host}
                            onChange={(e) => notificationForm.setData('smtp_host', e.target.value)}
                        />

                        <Input
                            label="Alamat Surel Pengirim (Sender Mailbox)"
                            type="email"
                            value={notificationForm.data.notification_email}
                            onChange={(e) => notificationForm.setData('notification_email', e.target.value)}
                        />

                        <div className="pt-4 border-t border-[#DCE7F3] flex justify-end">
                            <Button
                                type="submit"
                                variant="primary"
                                size="sm"
                                icon={Save}
                                loading={notificationForm.processing}
                            >
                                Simpan Pengaturan Surel
                            </Button>
                        </div>
                    </div>
                </form>
            )}
        </AdminLayout>
    );
}
