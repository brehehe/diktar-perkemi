import React, { useId, useState } from 'react';
import { router } from '@inertiajs/react';
import { Layers, Lightbulb, Sparkles, Target, TrendingUp } from 'lucide-react';

const CATEGORY_LABELS = {
    accommodation: 'Akomodasi',
    consumption: 'Konsumsi',
    printing: 'Cetak',
    venue: 'Tempat',
    transport: 'Transportasi',
    other: 'Lainnya',
};

export default function FinanceInsights({ analysis, eventId = null }) {
    const headingId = useId();
    const [generating, setGenerating] = useState(false);
    const hasTransactions = (analysis?.transaction_count || 0) > 0;
    const dominant = analysis?.dominant_expense;
    const combinedShare = analysis?.accommodation_consumption_share;
    const combinedDominant = (analysis?.expense_by_category?.accommodation || 0) > 0
        && (analysis?.expense_by_category?.consumption || 0) > 0
        && combinedShare >= 50;
    const patternTitle = combinedDominant
        ? 'Akomodasi & konsumsi dominan'
        : dominant ? `${CATEGORY_LABELS[dominant.category] || dominant.category} paling besar` : 'Belum ada pengeluaran';
    const patternDescription = combinedDominant
        ? `Kedua pos ini menyerap ${combinedShare}% dari total pengeluaran tercatat.`
        : dominant ? `${CATEGORY_LABELS[dominant.category] || dominant.category} menyerap ${dominant.share}% dari total pengeluaran tercatat.` : 'Catat pengeluaran menurut kategori untuk melihat polanya.';

    const generateNarrative = () => {
        router.post('/admin/keuangan/analisis-ai', { event: eventId || null }, {
            preserveScroll: true,
            onStart: () => setGenerating(true),
            onFinish: () => setGenerating(false),
        });
    };

    return (
        <section className="rounded-lg border-t-4 border-[#7957D5] bg-[#0E2747] p-5 text-white shadow-xs sm:p-6" aria-labelledby={headingId}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                    <Sparkles className="size-5 text-[#BDAEFF]" aria-hidden="true" />
                    <h3 id={headingId} className="font-display text-lg font-semibold">Analisis Keuangan & Data Mining</h3>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/90">
                    {analysis?.transaction_count || 0} transaksi tercatat · Analisis otomatis
                </span>
            </div>

            {!hasTransactions ? (
                <p className="mt-5 rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white/85">
                    Belum ada transaksi. Masukkan pemasukan dan pengeluaran agar analisis dapat dihitung.
                </p>
            ) : (
                <>
                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                            <div className="flex items-center gap-2 text-xs text-white/80">
                                <Layers className="size-4 text-[#BDAEFF]" aria-hidden="true" />
                                <span>Pola Pengeluaran</span>
                            </div>
                            <h4 className="mt-2 font-display text-base font-semibold">{patternTitle}</h4>
                            <p className="mt-1 text-xs leading-relaxed text-white/85">{patternDescription}</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                            <div className="flex items-center gap-2 text-xs text-white/80">
                                <Target className="size-4 text-emerald-300" aria-hidden="true" />
                                <span>Kontribusi Sponsor</span>
                            </div>
                            <h4 className="mt-2 font-display text-base font-semibold">
                                {analysis.sponsor_share === null ? 'Belum dapat dihitung' : `${analysis.sponsor_share}% dari pemasukan`}
                            </h4>
                            <p className="mt-1 text-xs leading-relaxed text-white/85">
                                {analysis.sponsor_share === null ? 'Catat pemasukan untuk menghitung porsinya.' : `Dana sponsor tercatat Rp ${new Intl.NumberFormat('id-ID').format(analysis.sponsor_amount)}.`}
                            </p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                            <div className="flex items-center gap-2 text-xs text-white/80">
                                <TrendingUp className="size-4 text-blue-300" aria-hidden="true" />
                                <span>Simulasi Saldo Periode Berikutnya</span>
                            </div>
                            <h4 className="mt-2 font-display text-base font-semibold tabular-nums">
                                {analysis.projected_next_balance_text || 'Data belum cukup'}
                            </h4>
                            <p className="mt-1 text-xs leading-relaxed text-white/85">
                                {analysis.projection_basis || `Perlu minimal 3 periode bulanan; saat ini ${analysis.projection_period_count || 0} periode tercatat.`}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center gap-2 text-xs font-medium text-[#D5CAFF]">
                            <Lightbulb className="size-4" aria-hidden="true" />
                            <span>Rekomendasi & Langkah Lanjutan</span>
                        </div>
                        {analysis.recommendations?.length ? (
                            <ul className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                                {analysis.recommendations.map((recommendation) => (
                                    <li key={recommendation} className="rounded-md border border-white/10 bg-white/5 p-3 text-xs leading-5 text-white/90">
                                        {recommendation}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-2 text-xs text-white/85">Belum ada rekomendasi khusus dari kategori yang tercatat.</p>
                        )}
                    </div>

                    <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h4 className="font-display text-sm font-semibold">Ringkasan AI</h4>
                                <p className="mt-1 text-xs text-white/80">Narasi tambahan dari agregat keuangan. Periksa kembali sebelum digunakan untuk keputusan.</p>
                            </div>
                            {analysis.ai_configured && !analysis.ai_narrative && (
                                <button
                                    type="button"
                                    onClick={generateNarrative}
                                    disabled={generating}
                                    className="rounded-md bg-white px-4 py-2 text-xs font-semibold text-[#0E2747] transition-colors hover:bg-[#EAF5FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-wait disabled:opacity-60"
                                >
                                    {generating ? 'Menganalisis…' : 'Buat ringkasan AI'}
                                </button>
                            )}
                        </div>
                        {analysis.ai_narrative ? (
                            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-white/90">{analysis.ai_narrative}</p>
                        ) : !analysis.ai_configured ? (
                            <p className="mt-3 text-xs text-white/80">Ringkasan AI belum diaktifkan oleh pengelola sistem.</p>
                        ) : null}
                    </div>
                </>
            )}
        </section>
    );
}
