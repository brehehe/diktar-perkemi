import { useState, useMemo } from 'react';
import { router } from '@inertiajs/react';

export default function useEventReviewState({ event, registrationForms, integrityPacts, examAttempts, cbtCompletionMatrix, tracks }) {
    // Formulir Pendaftaran states
    const [formSearch, setFormSearch] = useState('');
    const [formTrackFilter, setFormTrackFilter] = useState('all');
    const [formStatusFilter, setFormStatusFilter] = useState('all');
    const [formPage, setFormPage] = useState(1);
    const [formPerPage, setFormPerPage] = useState(25);
    const [selectedFormForModal, setSelectedFormForModal] = useState(null);
    const [isVerifyingForm, setIsVerifyingForm] = useState(false);
    const [uploadModalParticipant, setUploadModalParticipant] = useState(null);
    const [adminUploadFile, setAdminUploadFile] = useState(null);
    const [adminUploadFormType, setAdminUploadFormType] = useState('PELATIH');
    const [adminUploadPenataranLevel, setAdminUploadPenataranLevel] = useState('Daerah');
    const [adminUploadAutoVerify, setAdminUploadAutoVerify] = useState(true);
    const [adminUploadNotes, setAdminUploadNotes] = useState('');
    const [isAdminUploading, setIsAdminUploading] = useState(false);

    const handleAdminUploadSubmit = (e) => {
        e.preventDefault();
        if (!adminUploadFile) {
            alert('Silakan pilih file formulir terlebih dahulu.');
            return;
        }
        setIsAdminUploading(true);
        const formData = new FormData();
        formData.append('file', adminUploadFile);
        formData.append('participant_id', uploadModalParticipant.participant_id);
        formData.append('form_type', adminUploadFormType);
        formData.append('penataran_level', adminUploadPenataranLevel);
        if (adminUploadAutoVerify) formData.append('verified', '1');
        if (adminUploadNotes) formData.append('notes', adminUploadNotes);

        router.post(`/admin/event/${event.id}/formulir/upload`, formData, {
            preserveScroll: true,
            onSuccess: () => {
                setIsAdminUploading(false);
                setUploadModalParticipant(null);
                setAdminUploadFile(null);
                setAdminUploadNotes('');
            },
            onError: () => {
                setIsAdminUploading(false);
            },
        });
    };

    const filteredRegistrationForms = useMemo(() => {
        return registrationForms.filter((rf) => {
            const matchesSearch = !formSearch ||
                rf.participant_name?.toLowerCase().includes(formSearch.toLowerCase()) ||
                rf.kenshi_id_number?.toLowerCase().includes(formSearch.toLowerCase()) ||
                rf.dan_level?.toLowerCase().includes(formSearch.toLowerCase()) ||
                rf.origin_dojo?.toLowerCase().includes(formSearch.toLowerCase());

            const matchesTrack = formTrackFilter === 'all' ||
                rf.track_code?.toLowerCase().includes(formTrackFilter.toLowerCase()) ||
                rf.form_type?.toLowerCase() === formTrackFilter.toLowerCase();

            const matchesStatus = formStatusFilter === 'all' || rf.status === formStatusFilter;

            return matchesSearch && matchesTrack && matchesStatus;
        });
    }, [registrationForms, formSearch, formTrackFilter, formStatusFilter]);

    const totalFormPages = Math.max(1, Math.ceil(filteredRegistrationForms.length / formPerPage));
    const paginatedRegistrationForms = useMemo(() => {
        const start = (formPage - 1) * formPerPage;
        return filteredRegistrationForms.slice(start, start + formPerPage);
    }, [filteredRegistrationForms, formPage, formPerPage]);

    const handleVerifyForm = (formId) => {
        if (!formId) return;
        setIsVerifyingForm(true);
        router.post(`/admin/event/${event.id}/formulir/${formId}/verifikasi`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setIsVerifyingForm(false);
                if (selectedFormForModal) {
                    setSelectedFormForModal((prev) => prev ? { ...prev, status: 'verified', verified_at: new Date().toLocaleDateString('id-ID') } : null);
                }
            },
            onError: () => setIsVerifyingForm(false),
        });
    };

    // Pakta Integritas states
    const [pactSearch, setPactSearch] = useState('');
    const [pactTrackFilter, setPactTrackFilter] = useState('all');
    const [pactStatusFilter, setPactStatusFilter] = useState('all');
    const [pactPage, setPactPage] = useState(1);
    const [pactPerPage, setPactPerPage] = useState(25);
    const [selectedPactForModal, setSelectedPactForModal] = useState(null);
    const [isVerifyingPact, setIsVerifyingPact] = useState(false);
    const [uploadModalPactParticipant, setUploadModalPactParticipant] = useState(null);
    const [adminUploadPactFile, setAdminUploadPactFile] = useState(null);
    const [adminUploadPactType, setAdminUploadPactType] = useState('pelatih');
    const [adminUploadPactAutoVerify, setAdminUploadPactAutoVerify] = useState(true);
    const [isAdminUploadingPact, setIsAdminUploadingPact] = useState(false);

    const filteredIntegrityPacts = useMemo(() => {
        return (integrityPacts || []).filter((p) => {
            const matchesSearch = !pactSearch ||
                p.participant_name?.toLowerCase().includes(pactSearch.toLowerCase()) ||
                p.kenshi_id_number?.toLowerCase().includes(pactSearch.toLowerCase()) ||
                p.dan_level?.toLowerCase().includes(pactSearch.toLowerCase()) ||
                p.origin_dojo?.toLowerCase().includes(pactSearch.toLowerCase());

            const matchesTrack = pactTrackFilter === 'all' ||
                p.track_code?.toLowerCase().includes(pactTrackFilter.toLowerCase()) ||
                p.pact_type?.toLowerCase() === pactTrackFilter.toLowerCase();

            const matchesStatus = pactStatusFilter === 'all' ||
                (pactStatusFilter === 'verified' && p.status === 'verified') ||
                (pactStatusFilter === 'signed' && (p.status === 'signed' || p.status === 'verified')) ||
                (pactStatusFilter === 'uploaded' && p.submission_mode === 'upload') ||
                (pactStatusFilter === 'unfilled' && p.status === 'unfilled');

            return matchesSearch && matchesTrack && matchesStatus;
        });
    }, [integrityPacts, pactSearch, pactTrackFilter, pactStatusFilter]);

    const totalPactPages = Math.max(1, Math.ceil(filteredIntegrityPacts.length / pactPerPage));
    const paginatedIntegrityPacts = useMemo(() => {
        const start = (pactPage - 1) * pactPerPage;
        return filteredIntegrityPacts.slice(start, start + pactPerPage);
    }, [filteredIntegrityPacts, pactPage, pactPerPage]);

    const handleVerifyPact = (pactId) => {
        if (!pactId) return;
        setIsVerifyingPact(true);
        router.post(`/admin/event/${event.id}/pakta-integritas/${pactId}/verifikasi`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setIsVerifyingPact(false);
                if (selectedPactForModal) {
                    setSelectedPactForModal((prev) => prev ? { ...prev, status: 'verified', verified_at: new Date().toLocaleDateString('id-ID') } : null);
                }
            },
            onError: () => setIsVerifyingPact(false),
        });
    };

    const handleAdminPactUploadSubmit = (e) => {
        e.preventDefault();
        if (!adminUploadPactFile) {
            alert('Silakan pilih berkas pakta integritas terlebih dahulu.');
            return;
        }
        setIsAdminUploadingPact(true);
        const formData = new FormData();
        formData.append('file', adminUploadPactFile);
        formData.append('participant_id', uploadModalPactParticipant.participant_id);
        formData.append('pact_type', adminUploadPactType);
        if (adminUploadPactAutoVerify) formData.append('verified', '1');

        router.post(`/admin/event/${event.id}/pakta-integritas/upload`, formData, {
            preserveScroll: true,
            onSuccess: () => {
                setIsAdminUploadingPact(false);
                setUploadModalPactParticipant(null);
                setAdminUploadPactFile(null);
            },
            onError: () => {
                setIsAdminUploadingPact(false);
            },
        });
    };

    // CBT Exam Sub-tab ('rekap' | 'riwayat')
    const [cbtSubTab, setCbtSubTab] = useState('rekap');

    // CBT Exam Attempts states
    const [examSearch, setExamSearch] = useState('');
    const [examPackageFilter, setExamPackageFilter] = useState('all');
    const [examTrackFilter, setExamTrackFilter] = useState('all');
    const [examStatusFilter, setExamStatusFilter] = useState('all');
    const [examPage, setExamPage] = useState(1);
    const [examPerPage, setExamPerPage] = useState(25);
    const [selectedAttemptForDetail, setSelectedAttemptForDetail] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [attemptDetailData, setAttemptDetailData] = useState(null);

    const filteredExamAttempts = useMemo(() => {
        return (examAttempts || []).filter((att) => {
            const matchesSearch = !examSearch ||
                att.participant_name?.toLowerCase().includes(examSearch.toLowerCase()) ||
                att.kenshi_id_number?.toLowerCase().includes(examSearch.toLowerCase()) ||
                att.origin_dojo?.toLowerCase().includes(examSearch.toLowerCase()) ||
                att.package_title?.toLowerCase().includes(examSearch.toLowerCase());

            const matchesPackage = examPackageFilter === 'all' ||
                String(att.package_id) === String(examPackageFilter);

            const matchesTrack = examTrackFilter === 'all' ||
                att.track_code === examTrackFilter ||
                att.track_name?.toLowerCase() === examTrackFilter.toLowerCase();

            const matchesStatus = examStatusFilter === 'all' ||
                (examStatusFilter === 'passed' && att.is_passed) ||
                (examStatusFilter === 'failed' && !att.is_passed && att.status === 'submitted') ||
                (examStatusFilter === 'in_progress' && att.status !== 'submitted');

            return matchesSearch && matchesPackage && matchesTrack && matchesStatus;
        });
    }, [examAttempts, examSearch, examPackageFilter, examTrackFilter, examStatusFilter]);

    const totalExamPages = Math.max(1, Math.ceil(filteredExamAttempts.length / examPerPage));
    const paginatedExamAttempts = useMemo(() => {
        const start = (examPage - 1) * examPerPage;
        return filteredExamAttempts.slice(start, start + examPerPage);
    }, [filteredExamAttempts, examPage, examPerPage]);

    const uniqueExamPackages = useMemo(() => {
        const map = new Map();
        (examAttempts || []).forEach((att) => {
            if (att.package_id && !map.has(att.package_id)) {
                map.set(att.package_id, att.package_title);
            }
        });
        return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
    }, [examAttempts]);

    const uniqueExamTracks = useMemo(() => {
        const map = new Map();
        (examAttempts || []).forEach((att) => {
            if (att.track_code && att.track_code !== '-' && !map.has(att.track_code)) {
                map.set(att.track_code, att.track_name && att.track_name !== '-' ? att.track_name : att.track_code);
            }
        });
        (cbtCompletionMatrix || []).forEach((item) => {
            if (item.track_code && item.track_code !== '-' && !map.has(item.track_code)) {
                map.set(item.track_code, item.track_name && item.track_name !== '-' ? item.track_name : item.track_code);
            }
        });
        (tracks || []).forEach((t) => {
            if (t.code && !map.has(t.code)) {
                map.set(t.code, t.name || t.code);
            }
        });
        return Array.from(map.entries()).map(([code, name]) => ({ code, name }));
    }, [examAttempts, cbtCompletionMatrix, tracks]);

    const handleOpenAttemptDetail = async (attempt) => {
        setSelectedAttemptForDetail(attempt);
        setIsDetailModalOpen(true);
        setIsLoadingDetail(true);
        setAttemptDetailData(null);
        try {
            const res = await fetch(`/admin/event/${event.id}/cbt-attempts/${attempt.id}/detail`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            if (res.ok) {
                const data = await res.json();
                setAttemptDetailData(data);
            } else {
                alert('Gagal memuat rincian jawaban ujian.');
            }
        } catch (err) {
            console.error(err);
            alert('Terjadi kesalahan jaringan saat memuat rincian.');
        } finally {
            setIsLoadingDetail(false);
        }
    };

    return {
        formSearch,
        setFormSearch,
        formTrackFilter,
        setFormTrackFilter,
        formStatusFilter,
        setFormStatusFilter,
        formPage,
        setFormPage,
        formPerPage,
        setFormPerPage,
        selectedFormForModal,
        setSelectedFormForModal,
        isVerifyingForm,
        uploadModalParticipant,
        setUploadModalParticipant,
        adminUploadFile,
        setAdminUploadFile,
        adminUploadFormType,
        setAdminUploadFormType,
        adminUploadPenataranLevel,
        setAdminUploadPenataranLevel,
        adminUploadAutoVerify,
        setAdminUploadAutoVerify,
        adminUploadNotes,
        setAdminUploadNotes,
        isAdminUploading,
        handleAdminUploadSubmit,
        filteredRegistrationForms,
        totalFormPages,
        paginatedRegistrationForms,
        handleVerifyForm,
        pactSearch,
        setPactSearch,
        pactTrackFilter,
        setPactTrackFilter,
        pactStatusFilter,
        setPactStatusFilter,
        pactPage,
        setPactPage,
        pactPerPage,
        setPactPerPage,
        selectedPactForModal,
        setSelectedPactForModal,
        isVerifyingPact,
        uploadModalPactParticipant,
        setUploadModalPactParticipant,
        adminUploadPactFile,
        setAdminUploadPactFile,
        adminUploadPactType,
        setAdminUploadPactType,
        adminUploadPactAutoVerify,
        setAdminUploadPactAutoVerify,
        isAdminUploadingPact,
        filteredIntegrityPacts,
        totalPactPages,
        paginatedIntegrityPacts,
        handleVerifyPact,
        handleAdminPactUploadSubmit,
        cbtSubTab,
        setCbtSubTab,
        examSearch,
        setExamSearch,
        examPackageFilter,
        setExamPackageFilter,
        examTrackFilter,
        setExamTrackFilter,
        examStatusFilter,
        setExamStatusFilter,
        examPage,
        setExamPage,
        examPerPage,
        setExamPerPage,
        selectedAttemptForDetail,
        setSelectedAttemptForDetail,
        isDetailModalOpen,
        setIsDetailModalOpen,
        isLoadingDetail,
        attemptDetailData,
        setAttemptDetailData,
        filteredExamAttempts,
        totalExamPages,
        paginatedExamAttempts,
        uniqueExamPackages,
        uniqueExamTracks,
        handleOpenAttemptDetail,
    };
}
