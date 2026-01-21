
import { useState, useEffect } from 'react';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TimelineItem } from '@/types/portfolio';
import { Plus, X, GripVertical, Trash2, Edit2, AlertTriangle } from 'lucide-react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';

const emptyItem: TimelineItem = {
    id: '',
    year: new Date().getFullYear().toString(),
    type: 'work',
    order: 0,
    title: { it: '', en: '' },
    subtitle: { it: '', en: '' },
    note: { it: '', en: '' },
    details: { it: '', en: '' }
};

export default function TimelineTab() {
    const { timelineData } = usePortfolioData();
    const [items, setItems] = useState<TimelineItem[]>([]);
    const [editingItem, setEditingItem] = useState<TimelineItem | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<TimelineItem | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        setItems(timelineData);
    }, [timelineData]);

    const handleReorder = (newOrder: TimelineItem[]) => {
        setItems(newOrder);
    };

    const saveOrder = async () => {
        const batch = writeBatch(db);
        items.forEach((item, index) => {
            const ref = doc(db, 'experience', item.id);
            batch.update(ref, { order: index + 1 });
        });
        await batch.commit();
        alert('Ordine salvato!');
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        setDeleting(true);
        try {
            await deleteDoc(doc(db, 'experience', deleteConfirm.id));
            setItems(items.filter(i => i.id !== deleteConfirm.id));
            setDeleteConfirm(null);
        } catch (e) {
            console.error('Error deleting:', e);
            alert('Errore durante l\'eliminazione');
        } finally {
            setDeleting(false);
        }
    };

    const handleSaveItem = async () => {
        if (!editingItem) return;
        const id = editingItem.id || uuidv4();
        const dataToSave = { ...editingItem, id };

        await setDoc(doc(db, 'experience', id), dataToSave);
        setEditingItem(null);
    };

    const openEdit = (item: TimelineItem) => {
        setEditingItem({
            ...item,
            note: item.note || { it: '', en: '' }
        });
    };

    const openCreate = () => {
        setEditingItem({ ...emptyItem, id: '', order: items.length + 1 });
    };

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Gestione Timeline</h2>
                <div className="flex gap-2">
                    <button onClick={saveOrder} className="px-4 py-2 bg-zinc-800 rounded hover:bg-zinc-700 text-sm">
                        Salva Ordine
                    </button>
                    <button onClick={openCreate} className="px-4 py-2 bg-white text-black rounded hover:bg-zinc-200 flex items-center gap-2 font-bold">
                        <Plus size={16} /> Aggiungi
                    </button>
                </div>
            </div>

            <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="space-y-3">
                {items.map((item) => (
                    <Reorder.Item key={item.id} value={item} className="bg-zinc-900 border border-white/10 rounded-xl p-4 flex items-center gap-4 hover:border-white/30 transition-colors">
                        <GripVertical className="text-zinc-600 cursor-grab active:cursor-grabbing" />

                        <div className="w-16 text-center font-mono text-zinc-500 text-sm border-r border-white/10 pr-4">
                            {item.year}
                            <div className="text-xs uppercase mt-1 text-zinc-600">{item.type}</div>
                        </div>

                        <div className="flex-1">
                            <h3 className="font-bold">{item.title.it}</h3>
                            <p className="text-sm text-zinc-400">{item.subtitle.it}</p>
                        </div>

                        <div className="flex gap-2">
                            <button onClick={() => openEdit(item)} className="p-2 hover:bg-white/10 rounded">
                                <Edit2 size={16} />
                            </button>
                            <button onClick={() => setDeleteConfirm(item)} className="p-2 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 rounded">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </Reorder.Item>
                ))}
            </Reorder.Group>

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
                                Sei sicuro di voler eliminare <strong className="text-white">"{deleteConfirm.title.it}"</strong>?
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

            {/* Edit Modal */}
            <AnimatePresence>
                {editingItem && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto"
                        onClick={() => setEditingItem(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-3xl p-6"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">{editingItem.id ? 'Modifica' : 'Nuovo'} Elemento</h3>
                                <button onClick={() => setEditingItem(null)}><X /></button>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-xs uppercase text-zinc-500 mb-1">Anno</label>
                                    <input
                                        value={editingItem.year}
                                        onChange={e => setEditingItem({ ...editingItem, year: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-zinc-500 mb-1">Tipo</label>
                                    <select
                                        value={editingItem.type}
                                        onChange={e => setEditingItem({ ...editingItem, type: e.target.value as 'work' | 'edu' })}
                                        className="w-full bg-black/50 border border-white/10 rounded p-2"
                                    >
                                        <option value="work">Lavoro (Work)</option>
                                        <option value="edu">Formazione (Education)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs uppercase text-zinc-500 mb-1">Titolo (IT)</label>
                                        <input
                                            value={editingItem.title.it}
                                            onChange={e => setEditingItem({ ...editingItem, title: { ...editingItem.title, it: e.target.value } })}
                                            className="w-full bg-black/50 border border-white/10 rounded p-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase text-zinc-500 mb-1">Title (EN)</label>
                                        <input
                                            value={editingItem.title.en}
                                            onChange={e => setEditingItem({ ...editingItem, title: { ...editingItem.title, en: e.target.value } })}
                                            className="w-full bg-black/50 border border-white/10 rounded p-2"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs uppercase text-zinc-500 mb-1">Sottotitolo (IT)</label>
                                        <input
                                            value={editingItem.subtitle.it}
                                            onChange={e => setEditingItem({ ...editingItem, subtitle: { ...editingItem.subtitle, it: e.target.value } })}
                                            className="w-full bg-black/50 border border-white/10 rounded p-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase text-zinc-500 mb-1">Subtitle (EN)</label>
                                        <input
                                            value={editingItem.subtitle.en}
                                            onChange={e => setEditingItem({ ...editingItem, subtitle: { ...editingItem.subtitle, en: e.target.value } })}
                                            className="w-full bg-black/50 border border-white/10 rounded p-2"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs uppercase text-zinc-500 mb-1">Nota (Opzionale IT)</label>
                                        <input
                                            value={editingItem.note?.it || ''}
                                            onChange={e => setEditingItem({ ...editingItem, note: { ...(editingItem.note || { en: '' }), it: e.target.value } })}
                                            className="w-full bg-black/50 border border-white/10 rounded p-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase text-zinc-500 mb-1">Note (Optional EN)</label>
                                        <input
                                            value={editingItem.note?.en || ''}
                                            onChange={e => setEditingItem({ ...editingItem, note: { ...(editingItem.note || { it: '' }), en: e.target.value } })}
                                            className="w-full bg-black/50 border border-white/10 rounded p-2"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-xs uppercase text-zinc-500 mb-1">Dettagli Markdown (IT)</label>
                                    <textarea
                                        value={editingItem.details.it}
                                        onChange={e => setEditingItem({ ...editingItem, details: { ...editingItem.details, it: e.target.value } })}
                                        className="w-full h-40 bg-black/50 border border-white/10 rounded p-2 font-mono text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-zinc-500 mb-1">Details Markdown (EN)</label>
                                    <textarea
                                        value={editingItem.details.en}
                                        onChange={e => setEditingItem({ ...editingItem, details: { ...editingItem.details, en: e.target.value } })}
                                        className="w-full h-40 bg-black/50 border border-white/10 rounded p-2 font-mono text-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button onClick={() => setEditingItem(null)} className="px-6 py-2 rounded text-zinc-400 hover:text-white">Annulla</button>
                                <button onClick={handleSaveItem} className="px-6 py-2 bg-white text-black rounded font-bold hover:bg-zinc-200">Salva</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
