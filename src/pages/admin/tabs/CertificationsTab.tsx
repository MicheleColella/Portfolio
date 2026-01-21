
import { useState, useEffect } from 'react';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Certification } from '@/types/portfolio';
import { Plus, X, Trash2, Edit2, Globe, Award, Shield, Cpu, Box, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';

const emptyCert: Certification = {
    id: '',
    title: { it: '', en: '' },
    description: { it: '', en: '' },
    icon: 'award'
};

const iconOptions = [
    { value: 'globe', label: 'Globe', icon: <Globe size={16} /> },
    { value: 'award', label: 'Award', icon: <Award size={16} /> },
    { value: 'shield', label: 'Shield', icon: <Shield size={16} /> },
    { value: 'cpu', label: 'CPU', icon: <Cpu size={16} /> },
    { value: 'box', label: 'Box', icon: <Box size={16} /> }
];

export default function CertificationsTab() {
    const { certificationsData } = usePortfolioData();
    const [certs, setCerts] = useState<Certification[]>([]);
    const [editingCert, setEditingCert] = useState<Certification | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<Certification | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        setCerts(certificationsData);
    }, [certificationsData]);

    const handleSave = async () => {
        if (!editingCert) return;
        const id = String(editingCert.id || uuidv4());
        await setDoc(doc(db, 'certifications', id), { ...editingCert, id });
        setEditingCert(null);
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        setDeleting(true);
        try {
            await deleteDoc(doc(db, 'certifications', String(deleteConfirm.id)));
            setCerts(certs.filter(c => c.id !== deleteConfirm.id));
            setDeleteConfirm(null);
        } catch (e) {
            console.error('Error deleting:', e);
            alert('Errore durante l\'eliminazione');
        } finally {
            setDeleting(false);
        }
    };

    const openCreate = () => {
        setEditingCert({ ...emptyCert, id: '' });
    };

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Gestione Certificazioni</h2>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-bold hover:bg-zinc-200"
                >
                    <Plus size={16} /> Nuova
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certs.map((cert) => (
                    <div key={cert.id} className="bg-zinc-900 border border-white/10 rounded-2xl p-6 hover:border-white/30 transition-colors group relative">
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditingCert(cert)} className="p-2 bg-white text-black rounded hover:bg-zinc-200">
                                <Edit2 size={14} />
                            </button>
                            <button onClick={() => setDeleteConfirm(cert)} className="p-2 bg-red-500 text-white rounded hover:bg-red-600">
                                <Trash2 size={14} />
                            </button>
                        </div>

                        <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-4 text-white">
                            {iconOptions.find(o => o.value === cert.icon)?.icon || <Award />}
                        </div>

                        <h3 className="font-bold mb-2">{cert.title.it}</h3>
                        <p className="text-sm text-zinc-400 line-clamp-2">{cert.description.it}</p>
                    </div>
                ))}
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center px-4"
                        onClick={() => !deleting && setDeleteConfirm(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-md w-full"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Conferma eliminazione</h3>
                                    <p className="text-sm text-zinc-500">Questa azione è irreversibile</p>
                                </div>
                            </div>

                            <p className="text-zinc-300 mb-6">
                                Sei sicuro di voler eliminare la certificazione <strong className="text-white">"{deleteConfirm.title.it}"</strong>?
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    disabled={deleting}
                                    className="flex-1 px-4 py-2.5 bg-zinc-800 text-zinc-300 rounded-xl hover:bg-zinc-700 transition-all disabled:opacity-50"
                                >
                                    Annulla
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {deleting ? (
                                        <>
                                            <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full" />
                                            Eliminazione...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4" />
                                            Elimina
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit/Create Modal */}
            <AnimatePresence>
                {editingCert && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                        onClick={() => setEditingCert(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-2xl p-6"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">{editingCert.id ? 'Modifica' : 'Nuova'} Certificazione</h3>
                                <button onClick={() => setEditingCert(null)}><X /></button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-xs uppercase text-zinc-500 mb-1">Titolo (IT)</label>
                                    <input
                                        value={editingCert.title.it}
                                        onChange={e => setEditingCert({ ...editingCert, title: { ...editingCert.title, it: e.target.value } })}
                                        className="w-full bg-black/50 border border-white/10 rounded p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-zinc-500 mb-1">Title (EN)</label>
                                    <input
                                        value={editingCert.title.en}
                                        onChange={e => setEditingCert({ ...editingCert, title: { ...editingCert.title, en: e.target.value } })}
                                        className="w-full bg-black/50 border border-white/10 rounded p-2"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-xs uppercase text-zinc-500 mb-1">Descrizione (IT)</label>
                                    <textarea
                                        value={editingCert.description.it}
                                        onChange={e => setEditingCert({ ...editingCert, description: { ...editingCert.description, it: e.target.value } })}
                                        className="w-full h-24 bg-black/50 border border-white/10 rounded p-2 resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-zinc-500 mb-1">Description (EN)</label>
                                    <textarea
                                        value={editingCert.description.en}
                                        onChange={e => setEditingCert({ ...editingCert, description: { ...editingCert.description, en: e.target.value } })}
                                        className="w-full h-24 bg-black/50 border border-white/10 rounded p-2 resize-none"
                                    />
                                </div>
                            </div>

                            <div className="mb-8">
                                <label className="block text-xs uppercase text-zinc-500 mb-2">Icona</label>
                                <div className="flex gap-3">
                                    {iconOptions.map(option => (
                                        <button
                                            key={option.value}
                                            onClick={() => setEditingCert({ ...editingCert, icon: option.value })}
                                            className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${editingCert.icon === option.value
                                                ? 'bg-white text-black border-white'
                                                : 'bg-zinc-800 border-white/10 text-zinc-400 hover:bg-zinc-700'
                                                }`}
                                            title={option.label}
                                        >
                                            {option.icon}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button onClick={() => setEditingCert(null)} className="px-6 py-2 rounded text-zinc-400 hover:text-white">Annulla</button>
                                <button onClick={handleSave} className="px-6 py-2 bg-white text-black rounded font-bold hover:bg-zinc-200">Salva</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
