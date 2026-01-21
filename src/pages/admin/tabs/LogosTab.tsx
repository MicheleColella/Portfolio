import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, doc, writeBatch, setDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { GripVertical, Trash2, Save, AlertTriangle, Upload } from 'lucide-react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { useDropzone } from 'react-dropzone';

interface LogoItem {
    id: string;
    name: string;      // Nome del logo (diventa lo slug per Tech Stack)
    imageUrl: string;  // URL dell'immagine su Firebase Storage
    order: number;
}

export default function LogosTab() {
    const [logos, setLogos] = useState<LogoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<LogoItem | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [clearConfirm, setClearConfirm] = useState(false);
    const [clearing, setClearing] = useState(false);

    const fetchLogos = async () => {
        setLoading(true);
        try {
            const snap = await getDocs(collection(db, 'logo_loop'));
            const data = snap.docs.map(d => ({ ...d.data(), id: d.id } as LogoItem));
            data.sort((a, b) => (a.order || 0) - (b.order || 0));
            setLogos(data);
        } catch (e) {
            console.error('Error fetching logos:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogos();
    }, []);

    const handleReorder = (newOrder: LogoItem[]) => {
        setLogos(newOrder);
    };

    const saveAll = async () => {
        setSaving(true);
        try {
            const batch = writeBatch(db);
            logos.forEach((logo, index) => {
                const logoRef = doc(db, 'logo_loop', logo.id);
                batch.set(logoRef, { ...logo, order: index + 1 });
            });
            await batch.commit();
            alert('Logo Loop salvato!');
        } catch (e) {
            console.error('Error saving:', e);
            alert('Errore durante il salvataggio');
        } finally {
            setSaving(false);
        }
    };

    const removeLogo = async (item: LogoItem) => {
        setDeleting(true);
        try {
            // Delete from Storage
            const pathMatch = item.imageUrl.match(/techlogo%2F([^?]+)/);
            if (pathMatch) {
                const fileName = decodeURIComponent(pathMatch[1]);
                const storageRef = ref(storage, `techlogo/${fileName}`);
                await deleteObject(storageRef);
            }

            // Delete from Firestore
            await deleteDoc(doc(db, 'logo_loop', item.id));
            setLogos(logos.filter(l => l.id !== item.id));
            setDeleteConfirm(null);
        } catch (e) {
            console.error('Error deleting:', e);
            alert('Errore durante l\'eliminazione');
        } finally {
            setDeleting(false);
        }
    };

    const updateName = (id: string, name: string) => {
        // Sanitize name to be a valid slug (lowercase, no spaces, no special chars)
        const sanitized = name.toLowerCase().replace(/[^a-z0-9]/g, '');
        setLogos(logos.map(l => l.id === id ? { ...l, name: sanitized } : l));
    };

    // Upload handler
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setUploading(true);
        try {
            for (const file of acceptedFiles) {
                const id = uuidv4();
                const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
                // Use original filename (without extension) as default name, sanitized
                const baseName = file.name.replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9]/g, '');
                const fileName = `${baseName}.${ext}`;
                const path = `techlogo/${fileName}`;
                const storageRef = ref(storage, path);

                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);

                const newItem: LogoItem = {
                    id,
                    name: baseName, // This becomes the slug for Tech Stack
                    imageUrl: url,
                    order: logos.length + 1
                };

                await setDoc(doc(db, 'logo_loop', id), newItem);
                setLogos(prev => [...prev, newItem]);
            }
        } catch (e) {
            console.error('Upload error:', e);
            alert('Errore durante il caricamento');
        } finally {
            setUploading(false);
        }
    }, [logos]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'image/*': ['.png', '.svg', '.jpg', '.jpeg', '.webp', '.gif']
        },
        onDrop
    });

    // Clear all logos from Storage
    const clearStorage = async () => {
        setClearing(true);
        try {
            const folderRef = ref(storage, 'techlogo');
            const list = await listAll(folderRef);

            for (const item of list.items) {
                await deleteObject(item);
            }

            // Also clear Firestore
            const snap = await getDocs(collection(db, 'logo_loop'));
            const batch = writeBatch(db);
            snap.docs.forEach(d => {
                batch.delete(doc(db, 'logo_loop', d.id));
            });
            await batch.commit();

            setLogos([]);
            setClearConfirm(false);
            alert(`Eliminate ${list.items.length} immagini e dati.`);
        } catch (e) {
            console.error('Error clearing storage:', e);
            alert('Errore durante la pulizia');
        } finally {
            setClearing(false);
        }
    };

    if (loading) {
        return <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full mx-auto" />;
    }

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold">Gestione Logo Loop</h2>
                    <p className="text-zinc-500 text-sm mt-1">
                        Carica immagini per il logo loop. Il nome diventa lo slug per il Tech Stack.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setClearConfirm(true)}
                        className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30"
                    >
                        Svuota Storage
                    </button>
                    <button
                        onClick={saveAll}
                        disabled={saving}
                        className="px-4 py-2 bg-white text-black rounded-lg font-bold hover:bg-zinc-200 flex items-center gap-2"
                    >
                        {saving ? <div className="animate-spin w-4 h-4 border-2 border-zinc-400 border-t-black rounded-full" /> : <Save size={16} />}
                        Salva Tutto
                    </button>
                </div>
            </div>

            {/* Upload Section */}
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 mb-8">
                <label className="block text-sm font-medium text-zinc-400 mb-3">Carica nuovi loghi</label>
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragActive ? 'border-white/40 bg-white/5' : 'border-white/10 hover:border-white/20'
                        }`}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-3">
                        {uploading ? (
                            <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full" />
                        ) : (
                            <Upload className="w-10 h-10 text-zinc-500" />
                        )}
                        <div>
                            <p className="text-zinc-300 font-medium">
                                {isDragActive ? 'Rilascia qui' : 'Trascina immagini qui o clicca per selezionare'}
                            </p>
                            <p className="text-zinc-500 text-sm mt-1">
                                PNG, SVG, JPG, WEBP, GIF — Il nome file diventa lo slug per Tech Stack
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6 text-sm">
                <p className="text-blue-300">
                    <strong>Come funziona:</strong> Quando carichi un'immagine (es. <code className="bg-black/30 px-1 rounded">react.png</code>),
                    potrai usare <code className="bg-black/30 px-1 rounded">react</code> come slug nelle icone del Tech Stack.
                </p>
            </div>

            {/* Logos List */}
            <Reorder.Group axis="y" values={logos} onReorder={handleReorder} className="space-y-3">
                {logos.map((logo) => (
                    <Reorder.Item
                        key={logo.id}
                        value={logo}
                        className="bg-zinc-900 border border-white/10 rounded-xl p-4 flex items-center gap-4 hover:border-white/30 transition-colors"
                    >
                        <GripVertical className="text-zinc-600 cursor-grab active:cursor-grabbing" />

                        <div className="w-14 h-14 bg-zinc-800 rounded-lg flex items-center justify-center overflow-hidden p-2">
                            <img
                                src={logo.imageUrl}
                                alt={logo.name}
                                className="max-w-full max-h-full object-contain"
                            />
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <input
                                    value={logo.name}
                                    onChange={(e) => updateName(logo.id, e.target.value)}
                                    className="bg-black/50 border border-white/10 rounded px-3 py-1.5 font-mono text-sm w-48 focus:border-white/30 focus:outline-none"
                                    placeholder="nome-slug"
                                />
                                <span className="text-xs text-zinc-500">← Questo è lo slug per Tech Stack</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setDeleteConfirm(logo)}
                            className="p-2 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 rounded transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    </Reorder.Item>
                ))}
            </Reorder.Group>

            {logos.length === 0 && (
                <div className="text-center py-16 text-zinc-500">
                    <p>Nessun logo caricato. Carica le tue immagini sopra!</p>
                </div>
            )}

            {/* Preview */}
            {logos.length > 0 && (
                <div className="mt-8 p-6 bg-zinc-900/50 border border-white/10 rounded-2xl">
                    <label className="block text-xs text-zinc-500 uppercase mb-4">Anteprima Logo Loop</label>
                    <div className="flex items-center gap-8 overflow-x-auto py-4">
                        {logos.map((logo) => (
                            <div key={logo.id} className="flex-shrink-0 text-center">
                                <img
                                    src={logo.imageUrl}
                                    alt={logo.name}
                                    className="w-12 h-12 object-contain opacity-70 mx-auto"
                                />
                                <p className="text-xs text-zinc-600 mt-1 font-mono">{logo.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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
                                    <h3 className="text-lg font-bold text-white">Elimina logo</h3>
                                    <p className="text-sm text-zinc-500">Verrà eliminato anche dallo Storage</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mb-6 p-3 bg-black/30 rounded-lg">
                                <img src={deleteConfirm.imageUrl} alt="" className="w-10 h-10 object-contain" />
                                <span className="text-white font-mono">{deleteConfirm.name}</span>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    disabled={deleting}
                                    className="flex-1 px-4 py-2.5 bg-zinc-800 text-zinc-300 rounded-xl hover:bg-zinc-700 transition-all disabled:opacity-50"
                                >
                                    Annulla
                                </button>
                                <button
                                    onClick={() => removeLogo(deleteConfirm)}
                                    disabled={deleting}
                                    className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {deleting ? (
                                        <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                    Elimina
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Clear Storage Confirmation Modal */}
            <AnimatePresence>
                {clearConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center px-4"
                        onClick={() => !clearing && setClearConfirm(false)}
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
                                    <h3 className="text-lg font-bold text-white">Svuota tutto lo Storage</h3>
                                    <p className="text-sm text-zinc-500">Questa azione è IRREVERSIBILE</p>
                                </div>
                            </div>

                            <p className="text-zinc-300 mb-6">
                                Verranno eliminate <strong className="text-white">TUTTE</strong> le immagini dalla cartella
                                <code className="bg-black/30 px-2 py-0.5 rounded mx-1">techlogo/</code>
                                e tutti i dati associati.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setClearConfirm(false)}
                                    disabled={clearing}
                                    className="flex-1 px-4 py-2.5 bg-zinc-800 text-zinc-300 rounded-xl hover:bg-zinc-700 transition-all disabled:opacity-50"
                                >
                                    Annulla
                                </button>
                                <button
                                    onClick={clearStorage}
                                    disabled={clearing}
                                    className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {clearing ? (
                                        <>
                                            <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full" />
                                            Eliminazione...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4" />
                                            Svuota Tutto
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
