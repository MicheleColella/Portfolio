import { useState, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useProjects, Project } from '@/hooks/useProjects';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';
import {
    Plus, Edit2, Trash2, Save, X, Upload, GripVertical, Clock, Volume2, AlertTriangle
} from 'lucide-react';

interface MediaItem {
    id: string;
    type: 'image' | 'video';
    src: string;
    duration: number;
    volume?: number;
}



interface ProjectFormData {
    id: number;
    title: { it: string; en: string };
    description: { it: string; en: string };
    longDescription: { it: string; en: string };
    categories: string[];
    tags: string[];
    image: string;
    gitLink: string;
    liveLink: string;
    featured: boolean;
    sortDate: string;
    media: MediaItem[];
}

const emptyProject: ProjectFormData = {
    id: 0,
    title: { it: '', en: '' },
    description: { it: '', en: '' },
    longDescription: { it: '', en: '' },
    categories: [],
    tags: [],
    image: '',
    gitLink: '',
    liveLink: '',
    featured: false,
    sortDate: new Date().toISOString().split('T')[0],
    media: []
};

export default function ProjectsTab() {
    const { projects, loading, refetch } = useProjects();
    const [editingProject, setEditingProject] = useState<ProjectFormData | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [saving, setSaving] = useState(false);

    const [newCategory, setNewCategory] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; title: string } | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Get all unique categories from existing projects
    const existingCategories = Array.from(
        new Set(projects.flatMap(p => p.categories))
    ).sort();

    const startCreate = () => {
        const maxId = projects.length > 0 ? Math.max(...projects.map(p => p.id)) : 0;
        setEditingProject({ ...emptyProject, id: maxId + 1 });
        setIsCreating(true);
    };

    const startEdit = (project: Project) => {
        // Ensure all media items have IDs
        const mediaWithIds = (project.media || []).map((item, idx) => ({
            ...item,
            id: (item as MediaItem).id || `media-${idx}-${Date.now()}`
        }));
        setEditingProject({ ...project, media: mediaWithIds } as ProjectFormData);
        setIsCreating(false);
    };

    const cancelEdit = () => {
        setEditingProject(null);
        setIsCreating(false);
    };

    const uploadFile = async (file: File, projectId: number): Promise<{ url: string; type: 'image' | 'video' }> => {
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        const isVideo = ['mp4', 'webm', 'mov', 'avi'].includes(ext);
        const type: 'image' | 'video' = isVideo ? 'video' : 'image';
        const folder = isVideo ? 'videos' : 'images';
        const fileName = `${uuidv4()}.${ext}`;
        const path = `projects/${projectId}/${folder}/${fileName}`;

        const storageRef = ref(storage, path);

        try {
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            return { url, type };
        } catch (error) {
            throw error;
        }
    };

    // Helper function to remove undefined values from an object (Firestore doesn't accept undefined)
    const removeUndefined = (obj: Record<string, unknown>): Record<string, unknown> => {
        const cleaned: Record<string, unknown> = {};
        for (const key in obj) {
            const value = obj[key];
            if (value === undefined) {
                continue; // Skip undefined values
            } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                cleaned[key] = removeUndefined(value as Record<string, unknown>);
            } else if (Array.isArray(value)) {
                cleaned[key] = value.map(item =>
                    item !== null && typeof item === 'object' && !Array.isArray(item)
                        ? removeUndefined(item as Record<string, unknown>)
                        : item
                ).filter(item => item !== undefined);
            } else {
                cleaned[key] = value;
            }
        }
        return cleaned;
    };

    const handleSave = async () => {
        if (!editingProject) return;

        setSaving(true);
        try {
            const docRef = doc(db, 'projects', String(editingProject.id));
            const cleanedData = removeUndefined(editingProject as unknown as Record<string, unknown>);

            if (isCreating) {
                await setDoc(docRef, cleanedData);
            } else {
                await setDoc(docRef, cleanedData, { merge: true });
            }

            setEditingProject(null);
            setIsCreating(false);
            refetch();
        } catch (error) {
            console.error('Error saving project:', error);
            alert('Errore durante il salvataggio');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;

        setDeleting(true);
        try {
            await deleteDoc(doc(db, 'projects', String(deleteConfirm.id)));
            setDeleteConfirm(null);
            refetch();
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Errore durante l\'eliminazione. Verifica i permessi Firebase.');
        } finally {
            setDeleting(false);
        }
    };

    const updateMediaItem = (index: number, updates: Partial<MediaItem>) => {
        if (!editingProject) return;
        const newMedia = [...editingProject.media];
        newMedia[index] = { ...newMedia[index], ...updates };
        setEditingProject({ ...editingProject, media: newMedia });
    };

    const removeMediaItem = (index: number) => {
        if (!editingProject) return;
        const newMedia = editingProject.media.filter((_, i) => i !== index);
        setEditingProject({ ...editingProject, media: newMedia });
    };

    // Unified Dropzone Component
    const UnifiedMediaDropzone = () => {
        const onDrop = useCallback(async (acceptedFiles: File[]) => {
            if (!editingProject) return;

            for (const file of acceptedFiles) {


                try {
                    const { url, type: fileType } = await uploadFile(file, editingProject.id);

                    const newMedia: MediaItem = {
                        id: uuidv4(),
                        type: fileType,
                        src: url,
                        duration: fileType === 'video' ? 5000 : 3000,
                        volume: fileType === 'video' ? 0.3 : undefined
                    };

                    setEditingProject(prev => {
                        if (!prev) return prev;
                        return {
                            ...prev,
                            media: [...prev.media, newMedia]
                        };
                    });
                } catch (error) {
                    console.error('Upload failed:', error);
                    alert(`Errore caricamento: ${file.name}`);
                }
            }
        }, [editingProject]);

        const { getRootProps, getInputProps, isDragActive } = useDropzone({
            accept: {
                'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'],
                'video/*': ['.mp4', '.webm', '.mov']
            },
            onDrop
        });

        return (
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragActive
                    ? 'border-white/40 bg-white/5'
                    : 'border-white/10 hover:border-white/20'
                    }`}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-3">
                    <Upload className="w-10 h-10 text-zinc-500" />
                    <div>
                        <p className="text-zinc-300 font-medium">
                            {isDragActive ? 'Rilascia qui' : 'Trascina immagini o video'}
                        </p>
                        <p className="text-zinc-500 text-sm mt-1">
                            Supporta: PNG, JPG, WEBP, GIF, MP4, WEBM, MOV
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    // Cover Image Dropzone
    const CoverDropzone = () => {
        const [coverUploading, setCoverUploading] = useState(false);
        const [coverProgress, setCoverProgress] = useState(0);

        const onDrop = useCallback(async (acceptedFiles: File[]) => {
            if (!editingProject || acceptedFiles.length === 0) return;

            setCoverUploading(true);
            setCoverProgress(0);

            const file = acceptedFiles[0];
            const ext = file.name.split('.').pop()?.toLowerCase() || '';
            const fileName = `${uuidv4()}.${ext}`;
            const path = `projects/${editingProject.id}/cover/${fileName}`;
            const storageRef = ref(storage, path);

            // Animate progress
            let currentProgress = 0;
            const progressInterval = setInterval(() => {
                currentProgress = Math.min(currentProgress + Math.random() * 15, 90);
                setCoverProgress(Math.round(currentProgress));
            }, 150);

            try {
                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);
                clearInterval(progressInterval);
                setCoverProgress(100);

                setTimeout(() => {
                    setEditingProject(prev => prev ? { ...prev, image: url } : prev);
                    setCoverUploading(false);
                }, 300);
            } catch (error) {
                clearInterval(progressInterval);
                setCoverUploading(false);
                console.error('Upload failed:', error);
                alert('Errore caricamento immagine di copertina');
            }
        }, [editingProject]);

        const { getRootProps, getInputProps, isDragActive } = useDropzone({
            accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
            maxFiles: 1,
            onDrop
        });

        if (coverUploading) {
            return (
                <div className="border-2 border-dashed border-white/20 rounded-xl p-6 bg-zinc-800/50">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-zinc-700 rounded-lg flex items-center justify-center">
                            <div className="animate-pulse">
                                <Upload className="w-8 h-8 text-zinc-500" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-zinc-300 mb-2">Caricamento...</p>
                            <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-white rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${coverProgress}%` }}
                                    transition={{ duration: 0.15 }}
                                />
                            </div>
                            <p className="text-xs text-zinc-500 mt-1">{coverProgress}%</p>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${isDragActive
                    ? 'border-white/40 bg-white/5'
                    : 'border-white/10 hover:border-white/20'
                    }`}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-zinc-500" />
                    <p className="text-zinc-400 text-sm">
                        {isDragActive ? 'Rilascia qui' : 'Trascina immagine di copertina'}
                    </p>
                </div>
            </div>
        );
    };

    if (loading) {
        return <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full mx-auto" />
    }

    return (
        <div className="w-full">
            {/* Action Bar */}
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Gestione Progetti</h2>
                <button
                    onClick={startCreate}
                    className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-zinc-200 transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Nuovo Progetto
                </button>
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
                                Sei sicuro di voler eliminare il progetto <strong className="text-white">"{deleteConfirm.title}"</strong>?
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

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <motion.div
                        key={project.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all group"
                    >
                        <div className="relative h-48 bg-zinc-800">
                            {project.image ? (
                                <img
                                    src={project.image}
                                    alt={project.title.it}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                    No Image
                                </div>
                            )}
                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => startEdit(project)}
                                    className="p-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setDeleteConfirm({ id: project.id, title: project.title.it })}
                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-lg mb-1">{project.title.it}</h3>
                            <p className="text-sm text-zinc-400 line-clamp-2">{project.description.it}</p>
                            <div className="flex gap-2 mt-4 flex-wrap">
                                {project.categories.map(cat => (
                                    <span key={cat} className="text-xs px-2 py-1 bg-white/5 rounded-full text-zinc-400">
                                        {cat}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Edit Modal (The rest of the lengthy modal) */}
            <AnimatePresence>
                {editingProject && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 z-50 overflow-y-auto"
                    >
                        <div className="min-h-screen py-8 px-4">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="max-w-4xl mx-auto bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden"
                            >
                                {/* Modal Header */}
                                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                                    <h2 className="text-xl font-bold">
                                        {isCreating ? 'Nuovo Progetto' : 'Modifica Progetto'}
                                    </h2>
                                    <button onClick={cancelEdit} className="text-zinc-400 hover:text-white">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-8">
                                    {/* BASIC INFO */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-zinc-400 mb-1">Titolo (IT)</label>
                                                <input
                                                    type="text"
                                                    value={editingProject.title.it}
                                                    onChange={e => setEditingProject({
                                                        ...editingProject,
                                                        title: { ...editingProject.title, it: e.target.value }
                                                    })}
                                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:border-white/30 focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-zinc-400 mb-1">Titolo (EN)</label>
                                                <input
                                                    type="text"
                                                    value={editingProject.title.en}
                                                    onChange={e => setEditingProject({
                                                        ...editingProject,
                                                        title: { ...editingProject.title, en: e.target.value }
                                                    })}
                                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:border-white/30 focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-zinc-400 mb-1">Data Ordinamento</label>
                                                <input
                                                    type="date"
                                                    value={editingProject.sortDate}
                                                    onChange={e => setEditingProject({ ...editingProject, sortDate: e.target.value })}
                                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:border-white/30 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <CoverDropzone />
                                            <div className="mt-4 flex gap-4">
                                                <div className="flex-1">
                                                    <label className="block text-sm font-medium text-zinc-400 mb-1">GitHub Link</label>
                                                    <input
                                                        type="text"
                                                        value={editingProject.gitLink}
                                                        onChange={e => setEditingProject({ ...editingProject, gitLink: e.target.value })}
                                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:border-white/30 focus:outline-none"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="block text-sm font-medium text-zinc-400 mb-1">Live Demo</label>
                                                    <input
                                                        type="text"
                                                        value={editingProject.liveLink}
                                                        onChange={e => setEditingProject({ ...editingProject, liveLink: e.target.value })}
                                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:border-white/30 focus:outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* DESCRIPTIONS */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-400 mb-1">Descrizione Breve (IT)</label>
                                            <textarea
                                                value={editingProject.description.it}
                                                onChange={e => setEditingProject({
                                                    ...editingProject,
                                                    description: { ...editingProject.description, it: e.target.value }
                                                })}
                                                className="w-full h-24 bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:border-white/30 focus:outline-none resize-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-400 mb-1">Descrizione Breve (EN)</label>
                                            <textarea
                                                value={editingProject.description.en}
                                                onChange={e => setEditingProject({
                                                    ...editingProject,
                                                    description: { ...editingProject.description, en: e.target.value }
                                                })}
                                                className="w-full h-24 bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:border-white/30 focus:outline-none resize-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-400 mb-1">Descrizione Lunga (IT)</label>
                                            <textarea
                                                value={editingProject.longDescription.it}
                                                onChange={e => setEditingProject({
                                                    ...editingProject,
                                                    longDescription: { ...editingProject.longDescription, it: e.target.value }
                                                })}
                                                className="w-full h-32 bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:border-white/30 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-400 mb-1">Descrizione Lunga (EN)</label>
                                            <textarea
                                                value={editingProject.longDescription.en}
                                                onChange={e => setEditingProject({
                                                    ...editingProject,
                                                    longDescription: { ...editingProject.longDescription, en: e.target.value }
                                                })}
                                                className="w-full h-32 bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:border-white/30 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* CATEGORIES & TAGS */}
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-400 mb-2">Categorie</label>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {existingCategories.map(cat => (
                                                <button
                                                    key={cat}
                                                    onClick={() => {
                                                        const cats = editingProject.categories.includes(cat)
                                                            ? editingProject.categories.filter(c => c !== cat)
                                                            : [...editingProject.categories, cat];
                                                        setEditingProject({ ...editingProject, categories: cats });
                                                    }}
                                                    className={`px-3 py-1 rounded-full text-sm border ${editingProject.categories.includes(cat)
                                                        ? 'bg-white text-black border-white'
                                                        : 'border-white/20 text-zinc-400 hover:border-white/40'
                                                        }`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newCategory}
                                                onChange={e => setNewCategory(e.target.value)}
                                                placeholder="Nuova categoria..."
                                                className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-white/30 focus:outline-none"
                                            />
                                            <button
                                                onClick={() => {
                                                    if (newCategory && !editingProject.categories.includes(newCategory)) {
                                                        setEditingProject({
                                                            ...editingProject,
                                                            categories: [...editingProject.categories, newCategory]
                                                        });
                                                        setNewCategory('');
                                                    }
                                                }}
                                                className="px-4 py-2 bg-white/10 rounded-lg text-sm hover:bg-white/20"
                                            >
                                                Aggiungi
                                            </button>
                                        </div>
                                    </div>

                                    {/* MEDIA GALLERY */}
                                    <div>
                                        <h3 className="text-lg font-bold mb-4">Media Gallery</h3>
                                        <UnifiedMediaDropzone />

                                        <div className="mt-8 space-y-4">
                                            <div className="flex justify-between items-center text-sm text-zinc-500 px-2">
                                                <span>Media items ({editingProject.media.length})</span>
                                                <span>Drag to reorder</span>
                                            </div>

                                            <Reorder.Group
                                                axis="y"
                                                values={editingProject.media}
                                                onReorder={(newOrder) => setEditingProject({ ...editingProject, media: newOrder })}
                                                className="space-y-3"
                                            >
                                                {editingProject.media.map((item, index) => (
                                                    <Reorder.Item
                                                        key={item.id}
                                                        value={item}
                                                        className="bg-black/30 border border-white/10 rounded-xl p-4 flex items-center gap-4 group"
                                                    >
                                                        <GripVertical className="w-5 h-5 text-zinc-600 cursor-grab active:cursor-grabbing" />

                                                        <div className="w-20 h-14 bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0">
                                                            {item.type === 'video' ? (
                                                                <video src={item.src} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <img src={item.src} alt="" className="w-full h-full object-cover" />
                                                            )}
                                                        </div>

                                                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                                                            <div>
                                                                <label className="text-xs text-zinc-500 block mb-1">Durata (ms)</label>
                                                                <div className="flex items-center gap-2 bg-black/50 rounded px-2 py-1">
                                                                    <Clock className="w-3 h-3 text-zinc-500" />
                                                                    <input
                                                                        type="number"
                                                                        value={item.duration}
                                                                        onChange={(e) => updateMediaItem(index, { duration: parseInt(e.target.value) })}
                                                                        className="w-full bg-transparent text-sm focus:outline-none"
                                                                    />
                                                                </div>
                                                            </div>

                                                            {item.type === 'video' && (
                                                                <div>
                                                                    <label className="text-xs text-zinc-500 block mb-1">Volume (0-1)</label>
                                                                    <div className="flex items-center gap-2 bg-black/50 rounded px-2 py-1">
                                                                        <Volume2 className="w-3 h-3 text-zinc-500" />
                                                                        <input
                                                                            type="number"
                                                                            step="0.1"
                                                                            min="0"
                                                                            max="1"
                                                                            value={item.volume ?? 0}
                                                                            onChange={(e) => updateMediaItem(index, { volume: parseFloat(e.target.value) })}
                                                                            className="w-full bg-transparent text-sm focus:outline-none"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <button
                                                            onClick={() => removeMediaItem(index)}
                                                            className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </Reorder.Item>
                                                ))}
                                            </Reorder.Group>
                                        </div>
                                    </div>

                                </div>

                                {/* Modal Footer */}
                                <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-zinc-900 sticky bottom-0 z-10">
                                    <button
                                        onClick={cancelEdit}
                                        className="px-6 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                                    >
                                        Annulla
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="px-6 py-2 bg-white text-black rounded-lg font-bold hover:bg-zinc-200 transition-all disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {saving ? 'Salvataggio...' : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                Salva Progetto
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
