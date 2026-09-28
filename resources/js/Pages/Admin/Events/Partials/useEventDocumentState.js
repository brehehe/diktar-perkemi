import { useState, useEffect, useRef } from 'react';
import { router, useForm } from '@inertiajs/react';

export default function useEventDocumentState({ event, documentNumberLabels, documentNumberOverrides, certificateSignatureSettings, certificateSignatureDefaults }) {
    const [isGeneratingDocuments, setIsGeneratingDocuments] = useState(false);
    const documentNumberForm = useForm({
        apply_to_participants: true,
        regenerate_documents: true,
        numbers: Object.fromEntries(Object.keys(documentNumberLabels).map((trackCode) => [trackCode, {
            prefix: (documentNumberOverrides.certificate?.[trackCode]?.prefix ?? documentNumberOverrides[trackCode]?.prefix) ?? '',
            start: (documentNumberOverrides.certificate?.[trackCode]?.start ?? documentNumberOverrides[trackCode]?.start) ?? '',
        }])),
    });

    useEffect(() => {
        documentNumberForm.setData((prev) => ({
            ...prev,
            numbers: Object.fromEntries(Object.keys(documentNumberLabels).map((trackCode) => [trackCode, {
                prefix: (documentNumberOverrides.certificate?.[trackCode]?.prefix ?? documentNumberOverrides[trackCode]?.prefix) ?? '',
                start: (documentNumberOverrides.certificate?.[trackCode]?.start ?? documentNumberOverrides[trackCode]?.start) ?? '',
            }])),
        }));
    }, [documentNumberOverrides, documentNumberLabels]);
    const signatureForm = useForm({
        city: certificateSignatureSettings.city ?? certificateSignatureDefaults.city ?? 'Jakarta',
        date: certificateSignatureSettings.date ?? event.end_date ?? '',
        organization: certificateSignatureSettings.organization ?? certificateSignatureDefaults.organization ?? 'Pengurus Besar PERKEMI',
        position: certificateSignatureSettings.position ?? certificateSignatureDefaults.position ?? 'Ketua Umum,',
        signer_name: certificateSignatureSettings.signer_name ?? certificateSignatureDefaults.signer_name ?? 'Laksdya TNI (Purn) Prof. Dr. Agus Setiadji, S.A.P., M.A.',
        signature_image: null,
        signature_data: '',
    });
    const [signatureMode, setSignatureMode] = useState('draw'); // 'draw' or 'upload'
    const [signaturePreview, setSignaturePreview] = useState(certificateSignatureSettings.signature_url || null);
    const [isDeletingSignature, setIsDeletingSignature] = useState(false);
    const signatureCanvasRef = useRef(null);
    const [isDrawingSig, setIsDrawingSig] = useState(false);
    const [hasDrawnSig, setHasDrawnSig] = useState(false);

    useEffect(() => {
        setSignaturePreview(certificateSignatureSettings.signature_url || null);
    }, [certificateSignatureSettings.signature_url]);

    const getSigCoordinates = (e) => {
        const canvas = signatureCanvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: (clientX - rect.left) * (canvas.width / rect.width),
            y: (clientY - rect.top) * (canvas.height / rect.height),
        };
    };

    const startDrawingSig = (e) => {
        e.preventDefault();
        const canvas = signatureCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const { x, y } = getSigCoordinates(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#000000';
        setIsDrawingSig(true);
        setHasDrawnSig(true);
    };

    const drawSig = (e) => {
        if (!isDrawingSig) return;
        e.preventDefault();
        const canvas = signatureCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const { x, y } = getSigCoordinates(e);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawingSig = () => {
        if (!isDrawingSig) return;
        setIsDrawingSig(false);
        const canvas = signatureCanvasRef.current;
        if (canvas) {
            const dataUrl = canvas.toDataURL('image/png');
            signatureForm.setData('signature_data', dataUrl);
            setSignaturePreview(dataUrl);
        }
    };

    const clearSignatureCanvas = () => {
        const canvas = signatureCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasDrawnSig(false);
        signatureForm.setData('signature_data', '');
        setSignaturePreview(certificateSignatureSettings.signature_url || null);
    };

    const autoGenerateSignature = () => {
        const canvas = signatureCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const name = signatureForm.data.signer_name || certificateSignatureDefaults.signer_name || 'Ketua Umum';
        ctx.font = 'italic 30px "Brush Script MT", "Caveat", "Segoe Script", cursive';
        ctx.fillStyle = '#000000';
        ctx.fillText(name, 20, canvas.height / 2 + 8);

        ctx.beginPath();
        ctx.moveTo(15, canvas.height / 2 + 22);
        ctx.lineTo(canvas.width - 25, canvas.height / 2 + 18);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();

        const dataUrl = canvas.toDataURL('image/png');
        setHasDrawnSig(true);
        signatureForm.setData('signature_data', dataUrl);
        setSignaturePreview(dataUrl);
    };

    const handleSignatureSubmit = (e) => {
        e.preventDefault();
        signatureForm.post(`/admin/event/${event.id}/pengaturan-ttd`, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                signatureForm.reset('signature_image', 'signature_data');
                setHasDrawnSig(false);
            },
        });
    };

    const handleDeleteSignature = () => {
        if (!confirm('Hapus gambar TTD digital? Tanda tangan akan kembali kosong.')) return;
        setIsDeletingSignature(true);
        router.delete(`/admin/event/${event.id}/pengaturan-ttd/signature`, {
            preserveScroll: true,
            onFinish: () => {
                setIsDeletingSignature(false);
                clearSignatureCanvas();
            },
        });
    };
    return {
        isGeneratingDocuments,
        setIsGeneratingDocuments,
        documentNumberForm,
        signatureForm,
        signatureMode,
        setSignatureMode,
        signaturePreview,
        setSignaturePreview,
        isDeletingSignature,
        signatureCanvasRef,
        hasDrawnSig,
        startDrawingSig,
        drawSig,
        stopDrawingSig,
        clearSignatureCanvas,
        autoGenerateSignature,
        handleSignatureSubmit,
        handleDeleteSignature,
    };
}
