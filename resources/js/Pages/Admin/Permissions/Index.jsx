import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/admin/PageHeader';
import Button from '../../../Components/ui/Button';
import AlertDialog from '../../../Components/ui/AlertDialog';
import Checkbox from '../../../Components/ui/Checkbox';
import TableSurface from '../../../Components/admin/TableSurface';
import { ShieldCheck, Save, Check, RotateCcw, AlertTriangle } from 'lucide-react';

export default function Index({ roles = [], permissions = [] }) {
    // Build initial matrix from role.permission_ids
    const buildInitialMatrix = () => {
        const mat = {};
        roles.forEach((r) => {
            mat[r.id] = {};
            (r.permission_ids || []).forEach((pId) => {
                mat[r.id][pId] = true;
            });
        });
        return mat;
    };

    const [matrix, setMatrix] = useState(buildInitialMatrix);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const { data, setData, put, processing } = useForm({
        matrix: buildInitialMatrix(),
    });

    // Group permissions by module
    const modules = {};
    permissions.forEach((p) => {
        const mod = p.module || 'Umum';
        if (!modules[mod]) modules[mod] = [];
        modules[mod].push(p);
    });

    const togglePermission = (roleId, permissionId) => {
        setMatrix((prev) => {
            const updated = { ...prev };
            if (!updated[roleId]) updated[roleId] = {};
            if (updated[roleId][permissionId]) {
                delete updated[roleId][permissionId];
            } else {
                updated[roleId][permissionId] = true;
            }
            setData('matrix', updated);
            return updated;
        });
    };

    const handleSaveClick = () => {
        setIsConfirmOpen(true);
    };

    const handleConfirmSubmit = () => {
        setIsConfirmOpen(false);
        put('/admin/hak-akses', {
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        const initial = buildInitialMatrix();
        setMatrix(initial);
        setData('matrix', initial);
    };

    return (
        <AdminLayout title="Hak Akses & Wewenang Peran">
            <PageHeader
                title="Hak Akses & Wewenang"
                description="Konfigurasi matriks perizinan modul sistem Pustaka Penataran untuk setiap tingkatan peran kenshi."
                breadcrumbs={[{ label: 'Hak Akses' }]}
                action={
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            icon={RotateCcw}
                            onClick={handleReset}
                            disabled={processing}
                        >
                            Reset
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            icon={Save}
                            onClick={handleSaveClick}
                            loading={processing}
                        >
                            Simpan Perubahan
                        </Button>
                    </div>
                }
            />

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-relaxed">
                    <span className="font-bold">Perhatian Keamanan:</span> Perubahan matriks hak akses berdampak langsung pada wewenang setiap kenshi yang memegang peran tersebut saat masuk ke portal. Pastikan wewenang administratif hanya diberikan kepada peran berotoritas resmi.
                </div>
            </div>

            {/* Permissions Matrix grouped by Module */}
            <div className="space-y-6 mb-12">
                {Object.keys(modules).map((modName) => {
                    const modulePermissions = modules[modName];

                    return (
                        <div
                            key={modName}
                            className="bg-white rounded-xl border border-[#DCE7F3] shadow-xs overflow-hidden"
                        >
                            <div className="px-5 py-3.5 bg-[#F8FBFF] border-b border-[#DCE7F3] flex items-center justify-between">
                                <h3 className="text-sm font-bold text-[#0E2747] flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-[#0B63CE]" />
                                    <span>Modul {modName}</span>
                                </h3>
                                <span className="text-xs text-[#6B7C93]">
                                    {modulePermissions.length} hak akses
                                </span>
                            </div>

                            <TableSurface className="rounded-none border-0 shadow-none" ariaLabel={`Matriks hak akses modul ${modName}`}>
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="border-b border-[#DCE7F3] bg-white text-[#6B7C93]">
                                            <th className="px-5 py-3 font-semibold w-1/3 min-w-[220px]">
                                                Fungsi & Hak Akses
                                            </th>
                                            {roles.map((r) => (
                                                <th
                                                    key={r.id}
                                                    className="px-3 py-3 font-semibold text-center min-w-[100px] text-[#112743]"
                                                >
                                                    {r.name}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#DCE7F3]/60">
                                        {modulePermissions.map((perm) => (
                                            <tr key={perm.id} className="hover:bg-[#F8FBFF] transition-colors">
                                                <td className="px-5 py-3">
                                                    <span className="font-semibold text-[#112743] block">
                                                        {perm.label}
                                                    </span>
                                                    <span className="text-[11px] text-[#6B7C93] font-mono">
                                                        {perm.name}
                                                    </span>
                                                    {perm.description && (
                                                        <p className="text-[11px] text-[#6B7C93] mt-0.5">
                                                            {perm.description}
                                                        </p>
                                                    )}
                                                </td>
                                                {roles.map((r) => {
                                                    const isChecked = Boolean(matrix[r.id]?.[perm.id]);
                                                    return (
                                                        <td key={r.id} className="px-3 py-3 text-center align-middle">
                                                            <Checkbox
                                                                checked={isChecked}
                                                                onChange={() => togglePermission(r.id, perm.id)}
                                                                aria-label={`Toggle ${perm.label} untuk peran ${r.name}`}
                                                            />
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </TableSurface>
                        </div>
                    );
                })}
            </div>

            {/* Confirmation Alert Dialog */}
            <AlertDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirmSubmit}
                title="Simpan Perubahan Matriks Wewenang?"
                description="Perubahan hak akses akan segera diberlakukan ke seluruh kenshi dengan peran terkait. Pastikan seluruh izin telah sesuai dengan regulasi organisasi PERKEMI."
                confirmText="Konfirmasi & Simpan"
                cancelText="Kembali Periksa"
                variant="warning"
                loading={processing}
            />
        </AdminLayout>
    );
}
