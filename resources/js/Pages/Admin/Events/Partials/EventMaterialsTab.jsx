import { Link } from '@inertiajs/react';
import Button from '../../../../Components/ui/Button';
import { Edit3, BookOpen, Plus, Trash2 } from 'lucide-react';
import { useEventShow } from './EventShowContext';
import { useIsProdas } from '../../../../Utils/isProdas';

export default function EventMaterialsTab() {
    const isProdas = useIsProdas();
    const {
        event,
        modules,
        setIsModuleModalOpen,
        setEditingModule,
        moduleForm,
        openEditModuleModal,
        handleDeleteModule,
    } = useEventShow();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#DCE7F3]">
                <div>
                    <h3 className="font-display font-bold text-sm text-[#0E2747]">
                        {isProdas ? 'Modul Kurikulum & Bahan Pembelajaran' : 'Modul Kurikulum & Koleksi Buku Digital Penataran'}
                    </h3>
                    <p className="text-xs text-[#6B7C93]">
                        Modul kurikulum event dan buku digital yang telah dihubungkan.
                    </p>
                </div>
                <Button
                    variant="primary"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => {
                        setEditingModule(null);
                        moduleForm.reset();
                        setIsModuleModalOpen(true);
                    }}
                >
                    Tambah Modul Kurikulum
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {modules.map((m) => (
                    <div
                        key={m.id}
                        className="p-5 rounded-xl bg-white border border-[#DCE7F3] shadow-xs hover:border-[#0B63CE]/50 transition-all flex flex-col justify-between space-y-4 group"
                    >
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-xs font-bold text-[#0B63CE] bg-[#EAF5FF] px-2 py-0.5 rounded">
                                    {m.code}
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-[#EE9B25] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                        {m.duration_jp} JP
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => openEditModuleModal(m)}
                                        className="p-1 rounded text-[#6B7C93] hover:text-[#0B63CE] hover:bg-[#EAF5FF] transition-colors"
                                        title="Edit Modul"
                                        aria-label={`Edit modul ${m.title}`}
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteModule(m)}
                                        className="p-1 rounded text-[#6B7C93] hover:text-[#DD4D7C] hover:bg-[#FDE8EF] transition-colors"
                                        title="Hapus Modul"
                                        aria-label={`Hapus modul ${m.title}`}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="font-bold text-sm text-[#0E2747] group-hover:text-[#0B63CE] transition-colors line-clamp-2">
                                {m.title}
                            </h3>

                            <div className="text-[11px] text-[#6B7C93]">
                                Instruktur: <span className="font-medium text-[#112743]">{m.speaker?.name || 'Belum ditugaskan'}</span>
                            </div>

                            {m.material && (
                                <div className="p-2.5 rounded-lg bg-[#F8FBFF] border border-[#DCE7F3] text-[11px] space-y-1">
                                    <span className="text-[#6B7C93] block text-[10px]">Buku Digital Terhubung:</span>
                                    <div className="font-semibold text-[#0E2747] truncate">{m.material.title}</div>
                                </div>
                            )}
                        </div>

                        <div className="pt-3 border-t border-[#DCE7F3] flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#0A3F82] bg-[#EAF5FF] px-2 py-0.5 rounded border border-[#DCE7F3]">
                                    {m.publication_status === 'published' ? 'Terbit' : m.publication_status === 'review' ? 'Dalam peninjauan' : 'Draft'}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => openEditModuleModal(m)}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-[#0B63CE] hover:bg-[#EAF5FF] rounded transition-colors"
                                >
                                    <Edit3 className="w-3 h-3" />
                                    <span>Edit</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDeleteModule(m)}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-[#DD4D7C] hover:bg-[#FDE8EF] rounded transition-colors"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Hapus</span>
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                {m.source_type === 'uploaded_pdf' && m.has_source_file ? (
                                    <a href={`/admin/event/${event.id}/modul/${m.id}/pdf`} className="inline-flex min-h-9 items-center px-2.5 text-xs font-semibold text-[#0B63CE] hover:underline focus-visible:outline-2 focus-visible:outline-[#0B63CE]">Unduh PDF</a>
                                ) : ['external_link', 'video'].includes(m.source_type) && m.source_url ? (
                                    <a href={m.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center px-2.5 text-xs font-semibold text-[#0B63CE] hover:underline focus-visible:outline-2 focus-visible:outline-[#0B63CE]">Buka sumber</a>
                                ) : m.material?.slug ? (
                                    <Link
                                        href={`/koleksi/${m.material.slug}/baca`}
                                        target="_blank"
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0B63CE] text-white text-xs font-semibold hover:bg-[#0A3F82] transition-colors shadow-2xs"
                                    >
                                        <BookOpen className="w-3.5 h-3.5" />
                                        <span>Flipbook</span>
                                    </Link>
                                ) : <span className="text-xs text-[#6B7C93]">Belum ada sumber</span>}
                            </div>
                        </div>
                    </div>
                ))}
                {modules.length === 0 && <p className="text-sm text-[#6B7C93]">Belum ada modul kurikulum untuk event ini.</p>}
            </div>
        </div>
    );
}
