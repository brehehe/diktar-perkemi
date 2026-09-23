import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast() {
    const { flash } = usePage().props;
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState('success'); // 'success' | 'error' | 'info'

    useEffect(() => {
        if (flash?.success) {
            setMessage(flash.success);
            setType('success');
            setVisible(true);
        } else if (flash?.error) {
            setMessage(flash.error);
            setType('error');
            setVisible(true);
        } else if (flash?.info) {
            setMessage(flash.info);
            setType('info');
            setVisible(true);
        }
    }, [flash]);

    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => {
                setVisible(false);
            }, 4500);
            return () => clearTimeout(timer);
        }
    }, [visible]);

    if (!visible || !message) return null;

    const isSuccess = type === 'success';
    const isInfo = type === 'info';

    return (
        <div className="fixed bottom-5 right-5 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 duration-200">
            <div
                className={`
                    flex items-start gap-3 p-4 rounded-xl shadow-xl border
                    ${isSuccess ? 'bg-white border-[#20A47A]/30 text-[#112743]' : isInfo ? 'bg-white border-[#0B63CE]/30 text-[#112743]' : 'bg-white border-[#FA5252]/30 text-[#112743]'}
                `}
                role="status"
                aria-live="polite"
            >
                <div className="shrink-0 mt-0.5">
                    {isSuccess ? (
                        <CheckCircle2 className="w-5 h-5 text-[#20A47A]" />
                    ) : isInfo ? (
                        <Info className="w-5 h-5 text-[#0B63CE]" />
                    ) : (
                        <AlertCircle className="w-5 h-5 text-[#FA5252]" />
                    )}
                </div>

                <div className="flex-1 text-xs leading-relaxed">
                    <p className="font-semibold text-sm mb-0.5">
                        {isSuccess ? 'Berhasil' : isInfo ? 'Informasi' : 'Perhatian'}
                    </p>
                    <p className="text-[#6B7C93]">{message}</p>
                </div>

                <button
                    type="button"
                    onClick={() => setVisible(false)}
                    className="shrink-0 text-[#6B7C93] hover:text-[#112743] p-1 rounded-md transition-colors"
                    aria-label="Tutup notifikasi"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
