import { Link } from '@inertiajs/react';
import EmptyState from '@/Components/ui/EmptyState';
import { Calendar, Clock, MapPin, BookOpen, Award, Search, User, Filter, Printer, ArrowUpRight, X, Info, Compass, Plus, Edit3, Trash2, Lock, Unlock, QrCode } from 'lucide-react';
import { useSpeakerSchedule } from './SpeakerScheduleContext';

export default function SpeakerRoster() {
    const {
        speaker,
        isSupervisorMode,
        canManageSchedule,
        sessions,
        availableEvents,
        availableDays,
        availableSpeakers,
        currentEvent,
        search,
        setSearch,
        selectedEvent,
        selectedDay,
        selectedSpeaker,
        setSelectedSessionForModal,
        openRescheduleModal,
        openCreateSessionModal,
        openEditSessionModal,
        handleDeleteSession,
        updateFilters,
        handleEventChange,
        handleDayChange,
        handleSpeakerChange,
        handleSearchSubmit,
        handleResetFilters,
        hasActiveFilters,
        groupedSessions,
    } = useSpeakerSchedule();

    return (
        <>
        {/* 3. Main Roster Content */}
        <main className="no-print max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
            {/* Filter & Search Bar */}
            <div className="bg-white rounded-xl border border-[#DCE7F3] p-4 sm:p-5 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Event Filter Pills */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-[#0E2747] mr-1 flex items-center gap-1.5">
                            <Compass className="size-3.5 text-[#0B63CE]" />
                            Pilih Event Penataran:
                        </span>
                        <button
                            type="button"
                            onClick={() => handleEventChange('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE] ${
                                selectedEvent === 'all'
                                    ? 'bg-[#0E2747] text-white font-semibold shadow-xs'
                                    : 'bg-[#F8FBFF] border border-[#DCE7F3] text-[#6B7C93] hover:text-[#112743] hover:bg-white'
                            }`}
                        >
                            Semua Event ({availableEvents.length})
                        </button>
                        {availableEvents.map((evt) => {
                            const isSelected = String(selectedEvent) === String(evt.id);
                            return (
                                <button
                                    key={evt.id}
                                    type="button"
                                    onClick={() => handleEventChange(evt.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE] ${
                                        isSelected
                                            ? 'bg-[#0E2747] text-white font-semibold shadow-xs'
                                            : 'bg-[#F8FBFF] border border-[#DCE7F3] text-[#6B7C93] hover:text-[#112743] hover:bg-white'
                                    }`}
                                    title={`${evt.name} · ${evt.date_formatted || ''}`}
                                >
                                    <span className="truncate max-w-[200px]">{evt.name}</span>
                                    {evt.is_active && (
                                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                            isSelected
                                                ? 'bg-emerald-400 text-slate-900'
                                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                        }`}>
                                            Aktif
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSearchSubmit} className="relative min-w-[240px] sm:w-72">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari topik, kode, atau materi..."
                            className="w-full pl-9 pr-8 py-2 rounded-lg text-xs border border-[#DCE7F3] bg-[#F8FBFF] text-[#112743] placeholder-[#6B7C93] focus:outline-none focus:border-[#0B63CE] focus:bg-white transition-colors focus-visible:ring-2 focus-visible:ring-[#0B63CE]"
                        />
                        <Search className="size-4 text-[#6B7C93] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        {search && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                    updateFilters({ q: '' });
                                }}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7C93] hover:text-[#112743]"
                                aria-label="Hapus pencarian"
                            >
                                <X className="size-3.5" />
                            </button>
                        )}
                    </form>
                </div>

                {/* Day Filter Tabs & Reset Action */}
                <div className="pt-3 border-t border-[#DCE7F3]/70 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-[#6B7C93] mr-1.5">
                            Hari Penataran:
                        </span>
                        <button
                            type="button"
                            onClick={() => handleDayChange('')}
                            className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-all ${
                                !selectedDay
                                    ? 'bg-[#0B63CE] text-white font-semibold'
                                    : 'bg-[#F8FBFF] text-[#6B7C93] hover:text-[#112743] border border-[#DCE7F3]'
                            }`}
                        >
                            Semua Hari
                        </button>
                        {availableDays.map((dayNum) => (
                            <button
                                key={dayNum}
                                type="button"
                                onClick={() => handleDayChange(dayNum)}
                                className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-all ${
                                    Number(selectedDay) === dayNum
                                        ? 'bg-[#0B63CE] text-white font-semibold'
                                        : 'bg-[#F8FBFF] text-[#6B7C93] hover:text-[#112743] border border-[#DCE7F3]'
                                }`}
                            >
                                Hari ke-{dayNum}
                            </button>
                        ))}
                    </div>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className="text-xs text-[#0B63CE] hover:text-[#0A3F82] font-semibold underline underline-offset-2 flex items-center gap-1"
                        >
                            <X className="size-3" />
                            Reset Semua Filter
                        </button>
                    )}
                </div>

                {/* Supervisor Speaker Filter */}
                {isSupervisorMode && availableSpeakers.length > 0 && (
                    <div className="pt-3 border-t border-[#DCE7F3]/70 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-[#112743] flex items-center gap-1.5 shrink-0">
                            <User className="size-3.5 text-[#0B63CE]" />
                            Filter Pemateri:
                        </span>
                        <select
                            value={selectedSpeaker}
                            onChange={(e) => handleSpeakerChange(e.target.value)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#F8FBFF] border border-[#DCE7F3] text-[#112743] focus:outline-none focus:border-[#0B63CE] focus:bg-white"
                        >
                            <option value="">Semua Pemateri ({availableSpeakers.length} Sensei)</option>
                            {availableSpeakers.map((sp) => (
                                <option key={sp.id} value={sp.id}>
                                    {sp.name}
                                </option>
                            ))}
                        </select>
                        {selectedSpeaker ? (
                            <span className="text-xs text-[#0B63CE] bg-[#EAF5FF] px-2 py-0.5 rounded border border-[#BCE0FD]">
                                Menampilkan jadwal pemateri terpilih
                            </span>
                        ) : (
                            <span className="text-[11px] text-[#6B7C93]">
                                (Sebagai supervisor, Anda dapat melihat seluruh jadwal pengajar)
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Selected Event Details Card Banner */}
            {currentEvent && (
                <div className="bg-gradient-to-r from-[#0B63CE]/10 via-[#EAF5FF] to-white rounded-xl border border-[#BCE0FD] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
                    <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#0B63CE] bg-white px-2 py-0.5 rounded border border-[#BCE0FD]">
                                Kegiatan Terpilih
                            </span>
                            {currentEvent.is_active && (
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Event Aktif · Sedang Berlangsung
                                </span>
                            )}
                            <span className="text-xs text-[#6B7C93]">
                                Status: <strong className="text-[#0E2747]">{currentEvent.status_label || 'Aktif'}</strong>
                            </span>
                        </div>
                        <h2 className="font-display font-bold text-base sm:text-lg text-[#0E2747] leading-snug">
                            {currentEvent.name}
                        </h2>
                        <div className="flex flex-wrap items-center gap-3.5 text-xs text-[#6B7C93]">
                            {currentEvent.date_formatted && (
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="size-3.5 text-[#0B63CE]" />
                                    <span>{currentEvent.date_formatted}</span>
                                </span>
                            )}
                            {currentEvent.location && (
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="size-3.5 text-[#0B63CE]" />
                                    <span>{currentEvent.location}</span>
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {canManageSchedule && (
                            <button
                                type="button"
                                onClick={openCreateSessionModal}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-[#20A47A] hover:bg-[#198462] text-white shadow-xs transition-colors"
                                title="Tambah sesi rundown untuk event ini"
                            >
                                <Plus className="size-3.5" />
                                <span>+ Tambah Sesi</span>
                            </button>
                        )}

                        <a
                            href={`/admin/event/${currentEvent.id}/rundown/cetak`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-[#0A3F82] hover:bg-[#0B63CE] text-white shadow-xs transition-colors"
                            title="Cetak format lembar resmi A4 Landscape rundown kegiatan ini"
                        >
                            <Printer className="size-3.5 text-white" />
                            <span>Cetak Format Resmi A4</span>
                        </a>

                        {canManageSchedule && (
                            <Link
                                href={`/admin/event/${currentEvent.id}?tab=rundown`}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-[#0E2747] border border-[#DCE7F3] shadow-2xs transition-colors"
                                title="Buka tab rundown di halaman admin event"
                            >
                                <ArrowUpRight className="size-3.5 text-[#6B7C93]" />
                                <span>Admin Rundown</span>
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {/* Master Roster List */}
            {sessions.length === 0 ? (
                <div className="bg-white rounded-xl border border-[#DCE7F3] p-10 text-center shadow-xs">
                    <EmptyState
                        icon={Calendar}
                        title="Tidak Ada Jadwal Mengajar Ditemukan"
                        description={
                            hasActiveFilters
                                ? 'Tidak ditemukan jadwal mengajar yang sesuai dengan filter atau kata kunci pencarian Anda.'
                                : 'Belum ada sesi penataran yang ditugaskan kepada Anda saat ini. Silakan hubungi panitia kegiatan.'
                        }
                        actionText={hasActiveFilters ? 'Reset Filter Pencarian' : undefined}
                        onAction={hasActiveFilters ? handleResetFilters : undefined}
                    />
                </div>
            ) : (
                <div className="space-y-6">
                    {groupedSessions.map((group) => (
                        <section
                            key={group.event_name}
                            className="bg-white rounded-xl border border-[#DCE7F3] overflow-hidden shadow-xs"
                        >
                            {/* Event Header Banner (Admin Style) */}
                            <div className="bg-[#F8FBFF] border-b border-[#DCE7F3] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-[#0E2747] text-white">
                                            Event Penataran
                                        </span>
                                        <span className="text-xs font-mono text-[#0A3F82] font-semibold">
                                            {group.event_date}
                                        </span>
                                    </div>
                                    <h2 className="text-base sm:text-lg font-bold text-[#0E2747]">
                                        {group.event_name}
                                    </h2>
                                    {group.event_place && (
                                        <p className="text-xs text-[#6B7C93] flex items-center gap-1.5">
                                            <MapPin className="size-3.5 text-[#EE9B25]" />
                                            <span>Lokasi Penyelenggaraan: {group.event_place}</span>
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-2 self-start sm:self-center shrink-0">
                                    <span className="px-3 py-1 rounded bg-white text-[#0E2747] text-xs font-mono font-semibold border border-[#DCE7F3]">
                                        {group.sessions.length} Sesi Terjadwal
                                    </span>
                                    <Link
                                        href={`/admin/rundown?event_id=${group.event_id || selectedEvent || ''}&day=${selectedDay || 1}`}
                                        className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[#0A3F82] hover:bg-[#0B63CE] text-white text-xs font-semibold shadow-2xs transition-colors"
                                        title="Buka tampilan penuh di menu Admin Rundown"
                                    >
                                        <span>Buka di Admin Rundown</span>
                                        <ArrowUpRight className="size-3" />
                                    </Link>
                                </div>
                            </div>

                            {/* Sessions Table (Identical to Admin Tab 2 Rundown) */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-[#DCE7F3] bg-slate-50 text-[#0E2747] font-semibold text-[11px] uppercase tracking-wider">
                                            <th className="px-4 py-3">Waktu & Sesi</th>
                                            <th className="px-4 py-3">Jenis Sesi & Jalur</th>
                                            <th className="px-4 py-3">Topik & Integrasi</th>
                                            <th className="px-4 py-3">Pemateri / Pengawas</th>
                                            <th className="px-4 py-3">Ruang</th>
                                            <th className="px-4 py-3">Status Absensi</th>
                                            <th className="px-4 py-3 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#DCE7F3]/60">
                                        {group.sessions.map((session) => (
                                            <tr key={session.id} className="hover:bg-[#F8FBFF] transition-colors">
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="font-mono font-bold text-[#0B63CE]">{session.time_range}</div>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className="text-[11px] text-[#6B7C93]">{session.session_number} ({session.duration_jp} JP)</span>
                                                        {session.status === 'delayed' && (
                                                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                                                Molor
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex flex-wrap items-center gap-1">
                                                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                                                            {session.session_type_name || 'Sesi'}
                                                        </span>
                                                        {session.track_codes && session.track_codes.length > 0 ? (
                                                            session.track_codes.map((tc) => (
                                                                <span key={tc} className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                                                    {tc}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                                                                Semua Jalur
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] text-[#6B7C93] mt-0.5">{session.method}</div>
                                                </td>
                                                <td className="px-4 py-3 min-w-[220px]">
                                                    <div className="font-semibold text-[#0E2747]">{session.topic}</div>
                                                    {session.subtopic && <div className="text-[11px] text-[#6B7C93] mt-0.5 line-clamp-1">{session.subtopic}</div>}

                                                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                                        {session.materials && session.materials.map((mat) => (
                                                            <a
                                                                key={mat.id}
                                                                href={mat.read_url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-1 font-mono text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 hover:bg-emerald-100 transition-colors"
                                                                title={`Buka Buku Digital: ${mat.title}`}
                                                            >
                                                                <BookOpen className="w-3 h-3" />
                                                                <span>Buku: {mat.title}</span>
                                                            </a>
                                                        ))}
                                                        {session.learning_module && (
                                                            <span className="inline-flex items-center bg-[#EAF5FF] px-2 py-0.5 text-[10px] font-medium text-[#0A3F82] rounded">
                                                                Modul: [{session.learning_module.code}] {session.learning_module.title}
                                                            </span>
                                                        )}
                                                        {session.event_module && (
                                                            <a
                                                                href={session.event_module.download_url}
                                                                className="inline-flex items-center bg-[#EAF5FF] px-2 py-0.5 text-[10px] font-medium text-[#0A3F82] rounded hover:underline"
                                                            >
                                                                Modul: {session.event_module.title}
                                                            </a>
                                                        )}
                                                        {session.cbt_package_title && (
                                                            <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-purple-50 text-purple-800 px-2 py-0.5 rounded border border-purple-200">
                                                                <Award className="w-3 h-3" />
                                                                <span>CBT: {session.cbt_package_title}</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {session.speaker ? (
                                                        <div>
                                                            <div className="font-medium text-[#112743]">
                                                                {session.speaker.full_name || session.speaker.name}
                                                            </div>
                                                            <div className="text-[10px] text-[#6B7C93] flex items-center gap-1">
                                                                {session.speaker.dan_rank && <span>{session.speaker.dan_rank}</span>}
                                                                {session.is_own_session && (
                                                                    <span className="text-[9px] font-bold px-1 rounded bg-[#20A47A]/15 text-[#20A47A]">
                                                                        Sesi Anda
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[#6B7C93] italic">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap font-medium text-[#112743]">
                                                    {session.room || '-'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="space-y-1.5">
                                                        {session.is_attendance_open ? (
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                                                    <Unlock className="w-3 h-3" />
                                                                    <span>Dibuka ({session.qr_short_code})</span>
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                                                                    <Lock className="w-3 h-3" />
                                                                    <span>Tutup</span>
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-1.5">
                                                            {session.attendance_setting === 'check_in_out' ? (
                                                                <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                                                                    Masuk & Keluar
                                                                </span>
                                                            ) : session.attendance_setting === 'check_in' ? (
                                                                <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                                                    Masuk Saja
                                                                </span>
                                                            ) : (
                                                                <span className="px-1.5 py-0.2 rounded text-[9px] font-normal bg-slate-100 text-slate-500 border border-slate-200">
                                                                    Tidak Diperlukan
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-[10px] text-[#6B7C93] flex items-center gap-2">
                                                            <span>Hadir: <strong>{session.attendances_count ?? 0}</strong></span>
                                                            {session.is_attendance_open && (
                                                                <>
                                                                    <span>•</span>
                                                                    <a
                                                                        href={`/admin/event/${session.event_id}/sesi/${session.id}/cetak-qr`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-1 font-bold text-xs text-[#0B63CE] bg-[#EAF5FF] hover:bg-[#D5EBFF] border border-[#B8D7FF] px-2 py-0.5 rounded transition-colors shadow-2xs"
                                                                        title="Cetak lembar QR absensi sesi ini"
                                                                    >
                                                                        <QrCode className="w-3.5 h-3.5" />
                                                                        <span>Cetak QR</span>
                                                                    </a>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {canManageSchedule && (
                                                            <button
                                                                type="button"
                                                                onClick={() => openRescheduleModal(session)}
                                                                className="p-1 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded transition-colors"
                                                                title="Sesuaikan Jadwal (Molor / Geser Waktu)"
                                                                aria-label={`Sesuaikan jadwal sesi ${session.topic}`}
                                                            >
                                                                <Clock className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                        {canManageSchedule && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openEditSessionModal(session)}
                                                                    className="p-1 text-[#6B7C93] hover:text-[#0B63CE] rounded"
                                                                    aria-label={`Edit sesi ${session.topic}`}
                                                                >
                                                                    <Edit3 className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteSession(session)}
                                                                    className="p-1 text-[#6B7C93] hover:text-[#DD4D7C] rounded"
                                                                    aria-label={`Hapus sesi ${session.topic}`}
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedSessionForModal(session)}
                                                            className="p-1 text-[#6B7C93] hover:text-[#0B63CE] rounded"
                                                            title="Lihat Detail Silabus"
                                                        >
                                                            <Info className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    ))}
                </div>
            )}
        </main>
        </>
    );
}
