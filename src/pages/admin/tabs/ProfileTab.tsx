
import { useState, useEffect } from 'react';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { doc, setDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ProfileData } from '@/types/portfolio';
import { Save, Upload, Loader2, Plus, X } from 'lucide-react';

const emptyProfile: ProfileData = {
    image: "",
    roles: [],
    location: { it: "", en: "" },
    available: false,
    bio: {
        title: { it: "", en: "" },
        short: { it: "", en: "" },
        long: { it: "", en: "" }
    },
    socials: { github: "", linkedin: "", email: "" }
};

export default function ProfileTab() {
    const { profile, loading } = usePortfolioData();
    const [formData, setFormData] = useState<ProfileData | null>(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (profile) {
            setFormData(profile);
        } else if (!loading && !formData) {
            setFormData(emptyProfile);
        }
    }, [profile, loading]);

    const handleSave = async () => {
        if (!formData) return;
        setSaving(true);
        try {
            await setDoc(doc(db, 'profile', 'main'), formData);
            alert('Profilo aggiornato!');
        } catch (error) {
            console.error(error);
            alert('Errore aggiornamento');
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0] || !formData) return;
        setUploading(true);
        try {
            const file = e.target.files[0];
            const storageRef = ref(storage, `profile/${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            setFormData({ ...formData, image: url });
        } catch (error) {
            console.error(error);
            alert('Errore upload');
        } finally {
            setUploading(false);
        }
    };

    const addRole = () => {
        if (formData) setFormData({ ...formData, roles: [...formData.roles, "New Role"] });
    };

    const updateRole = (index: number, val: string) => {
        if (!formData) return;
        const newRoles = [...formData.roles];
        newRoles[index] = val;
        setFormData({ ...formData, roles: newRoles });
    };

    const removeRole = (index: number) => {
        if (!formData) return;
        setFormData({ ...formData, roles: formData.roles.filter((_, i) => i !== index) });
    };

    if (loading || !formData) return <Loader2 className="animate-spin" />;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <h2 className="text-2xl font-bold mb-6">Modifica Profilo</h2>

            {/* Main Info */}
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 space-y-6">
                <div className="flex gap-6 items-start">
                    {/* Image Upload */}
                    <div className="w-32 h-32 relative group">
                        <img src={formData.image} className="w-full h-full object-cover rounded-full border-2 border-white/20" />
                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer rounded-full transition-all">
                            <Upload className="text-white" />
                            <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                        </label>
                        {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full"><Loader2 className="animate-spin" /></div>}
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-zinc-500">Location (IT)</label>
                                <input
                                    value={formData.location.it}
                                    onChange={(e) => setFormData({ ...formData, location: { ...formData.location, it: e.target.value } })}
                                    className="w-full bg-black/50 border border-white/10 rounded p-2"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-500">Location (EN)</label>
                                <input
                                    value={formData.location.en}
                                    onChange={(e) => setFormData({ ...formData, location: { ...formData.location, en: e.target.value } })}
                                    className="w-full bg-black/50 border border-white/10 rounded p-2"
                                />
                            </div>
                        </div>

                        {/* Availability */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.available}
                                onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                                className="w-4 h-4"
                            />
                            <span className="text-sm">Mostra "Open for Work"</span>
                        </div>
                    </div>
                </div>

                {/* Roles */}
                <div>
                    <label className="text-sm font-bold block mb-2">Ruoli (Rotating Text)</label>
                    <div className="flex flex-wrap gap-2">
                        {formData.roles.map((role, i) => (
                            <div key={i} className="flex items-center bg-black/30 rounded px-2 py-1 border border-white/10">
                                <input
                                    value={role}
                                    onChange={(e) => updateRole(i, e.target.value)}
                                    className="bg-transparent border-none text-sm w-32 focus:outline-none"
                                />
                                <button onClick={() => removeRole(i)} className="ml-2 text-zinc-500 hover:text-red-400">
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                        <button onClick={addRole} className="p-1 bg-white/10 rounded hover:bg-white/20">
                            <Plus size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Bio */}
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 space-y-6">
                <h3 className="text-lg font-bold">Biografia</h3>

                <div className="space-y-4">
                    <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold">Titolo (Headline)</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            value={formData.bio.title.it}
                            onChange={(e) => setFormData({ ...formData, bio: { ...formData.bio, title: { ...formData.bio.title, it: e.target.value } } })}
                            className="bg-black/50 border border-white/10 rounded p-3 text-base" placeholder="IT"
                        />
                        <input
                            type="text"
                            value={formData.bio.title.en}
                            onChange={(e) => setFormData({ ...formData, bio: { ...formData.bio, title: { ...formData.bio.title, en: e.target.value } } })}
                            className="bg-black/50 border border-white/10 rounded p-3 text-base" placeholder="EN"
                        />
                    </div>

                    <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold">Descrizione Breve</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <textarea
                            value={formData.bio.short.it}
                            onChange={(e) => setFormData({ ...formData, bio: { ...formData.bio, short: { ...formData.bio.short, it: e.target.value } } })}
                            className="bg-black/50 border border-white/10 rounded p-2 h-24 resize-none" placeholder="IT"
                        />
                        <textarea
                            value={formData.bio.short.en}
                            onChange={(e) => setFormData({ ...formData, bio: { ...formData.bio, short: { ...formData.bio.short, en: e.target.value } } })}
                            className="bg-black/50 border border-white/10 rounded p-2 h-24 resize-none" placeholder="EN"
                        />
                    </div>

                    <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold">Descrizione Completa</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <textarea
                            value={formData.bio.long.it}
                            onChange={(e) => setFormData({ ...formData, bio: { ...formData.bio, long: { ...formData.bio.long, it: e.target.value } } })}
                            className="bg-black/50 border border-white/10 rounded p-2 h-32 resize-none" placeholder="IT"
                        />
                        <textarea
                            value={formData.bio.long.en}
                            onChange={(e) => setFormData({ ...formData, bio: { ...formData.bio, long: { ...formData.bio.long, en: e.target.value } } })}
                            className="bg-black/50 border border-white/10 rounded p-2 h-32 resize-none" placeholder="EN"
                        />
                    </div>
                </div>
            </div>

            {/* Socials */}
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 space-y-4">
                <h3 className="text-lg font-bold">Social Links</h3>
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="text-xs text-zinc-500">Email</label>
                        <input
                            value={formData.socials.email}
                            onChange={(e) => setFormData({ ...formData, socials: { ...formData.socials, email: e.target.value } })}
                            className="w-full bg-black/50 border border-white/10 rounded p-2"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-zinc-500">GitHub</label>
                        <input
                            value={formData.socials.github}
                            onChange={(e) => setFormData({ ...formData, socials: { ...formData.socials, github: e.target.value } })}
                            className="w-full bg-black/50 border border-white/10 rounded p-2"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-zinc-500">LinkedIn</label>
                        <input
                            value={formData.socials.linkedin}
                            onChange={(e) => setFormData({ ...formData, socials: { ...formData.socials, linkedin: e.target.value } })}
                            className="w-full bg-black/50 border border-white/10 rounded p-2"
                        />
                    </div>
                </div>
            </div>

            <div className="fixed bottom-6 right-6 z-20">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-white text-black px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2 hover:scale-105 transition-transform"
                >
                    {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                    Salva Modifiche
                </button>
            </div>
        </div>
    );
}
