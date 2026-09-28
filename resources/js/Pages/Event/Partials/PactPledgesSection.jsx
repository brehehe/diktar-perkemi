import { Shield } from 'lucide-react';
import { useIntegrityPact } from './IntegrityPactContext';

export default function PactPledgesSection() {
    const {
        pledgePoints,
    } = useIntegrityPact();

    return (
        <>
            {/* 4. Butir Ikrar & Pernyataan Integritas Resmi PB PERKEMI */}
            <section aria-labelledby="section-pledges" className="rounded-xl border border-[#0B63CE]/20 bg-[#F0F7FF] p-5 sm:p-6">
                <h2 id="section-pledges" className="flex items-center gap-2 text-sm font-bold text-[#0E2747]">
                    <Shield className="h-4 w-4 text-[#0B63CE]" />
                    Pernyataan & Komitmen Integritas PB PERKEMI
                </h2>
                <p className="mt-1 text-xs text-[#6B7C93]">
                    Dengan ini menyatakan secara sadar dan sungguh-sungguh atas hal-hal sebagai berikut:
                </p>

                <ol className="mt-4 space-y-3">
                    {pledgePoints.map((point, index) => (
                        <li key={index} className="flex items-start gap-3 text-xs leading-relaxed text-[#112743]">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0B63CE] text-[10px] font-bold text-white">
                                {index + 1}
                            </span>
                            <span>{point}</span>
                        </li>
                    ))}
                </ol>

                <div className="mt-5 rounded-lg border border-[#DCE7F3] bg-white p-3.5 text-xs text-[#6B7C93] leading-relaxed italic">
                    &ldquo;Demikian Pakta Integritas ini saya tanda tangani dengan kesadaran penuh tanpa desakan atau paksaan didalam bentuk yang bagaimanapun dan dari pihak manapun. Apabila saya melakukan pelanggaran dengan sengaja ataupun tanpa sengaja, atas ketentuan dan/atau persyaratan Pakta Integritas ini, tertulis atau tersirat, maka Saya bersedia untuk bertanggung jawab sepenuhnya termasuk untuk mendapatkan sanksi Organisasi sesuai dengan ketentuan yang berlaku.&rdquo;
                </div>
            </section>
        </>
    );
}
