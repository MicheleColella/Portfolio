
import { useState, useEffect, useCallback } from 'react';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TechCategory, TechSkill } from '@/types/portfolio';
import { Save, Plus, X, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { TechLogo } from '@/components/ui/TechLogo';

export default function TechStackTab() {
    const { techStackData } = usePortfolioData();
    const [categories, setCategories] = useState<TechCategory[]>([]);
    const [saving, setSaving] = useState(false);
    // Force re-render key for icon previews
    const [iconRefreshKey, setIconRefreshKey] = useState(0);

    useEffect(() => {
        setCategories(techStackData);
    }, [techStackData]);

    const handleSave = async () => {
        setSaving(true);
        try {
            for (const cat of categories) {
                await setDoc(doc(db, 'tech_stack', cat.id), cat);
            }
            alert('Tech Stack salvato!');
        } catch (error) {
            console.error(error);
            alert('Errore salvataggio');
        } finally {
            setSaving(false);
        }
    };

    const addCategory = () => {
        const id = uuidv4();
        setCategories([...categories, {
            id,
            order: categories.length + 1,
            title: { it: 'Nuova Categoria', en: 'New Category' },
            skills: []
        }]);
    };

    const removeCategory = async (id: string) => {
        if (!confirm('Eliminare categoria?')) return;
        setCategories(categories.filter(c => c.id !== id));
        await deleteDoc(doc(db, 'tech_stack', id));
    };

    const updateCategory = (index: number, updates: Partial<TechCategory>) => {
        const newCats = [...categories];
        newCats[index] = { ...newCats[index], ...updates };
        setCategories(newCats);
    };

    const addSkill = (catIndex: number) => {
        const newCats = [...categories];
        newCats[catIndex].skills.push({ name: 'Skill', icon: '' });
        setCategories(newCats);
    };

    // Debounced icon refresh
    const refreshIconPreview = useCallback(() => {
        setIconRefreshKey(prev => prev + 1);
    }, []);

    const updateSkill = (catIndex: number, skillIndex: number, field: 'name' | 'icon', value: string) => {
        const newCats = [...categories];
        const skill = newCats[catIndex].skills[skillIndex];

        if (typeof skill === 'string') {
            newCats[catIndex].skills[skillIndex] = {
                name: field === 'name' ? value : skill,
                icon: field === 'icon' ? value : ''
            };
        } else {
            (newCats[catIndex].skills[skillIndex] as TechSkill)[field] = value;
        }
        setCategories(newCats);

        // Refresh icon preview when icon slug changes
        if (field === 'icon') {
            refreshIconPreview();
        }
    };

    const removeSkill = (catIndex: number, skillIndex: number) => {
        const newCats = [...categories];
        newCats[catIndex].skills.splice(skillIndex, 1);
        setCategories(newCats);
    };

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Gestione Tech Stack</h2>
                <button
                    onClick={addCategory}
                    className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-bold hover:bg-zinc-200"
                >
                    <Plus size={16} /> Nuova Categoria
                </button>
            </div>

            <div className="grid gap-6">
                {categories.map((cat, catIndex) => (
                    <div key={cat.id} className="bg-zinc-900 border border-white/10 rounded-2xl p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex gap-4 flex-1">
                                <div className="flex-1">
                                    <label className="text-xs text-zinc-500 mb-1 block">Nome Categoria (IT)</label>
                                    <input
                                        value={cat.title.it}
                                        onChange={(e) => updateCategory(catIndex, { title: { ...cat.title, it: e.target.value } })}
                                        className="w-full bg-black/50 border border-white/10 rounded p-2 font-bold"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs text-zinc-500 mb-1 block">Category Name (EN)</label>
                                    <input
                                        value={cat.title.en}
                                        onChange={(e) => updateCategory(catIndex, { title: { ...cat.title, en: e.target.value } })}
                                        className="w-full bg-black/50 border border-white/10 rounded p-2 font-bold"
                                    />
                                </div>
                            </div>
                            <button onClick={() => removeCategory(cat.id)} className="p-2 text-zinc-500 hover:text-red-400">
                                <Trash2 size={16} />
                            </button>
                        </div>

                        {/* Skills List */}
                        <div className="space-y-2">
                            <label className="text-xs text-zinc-500 uppercase font-bold">Skills</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {cat.skills.map((skill, skillIndex) => {
                                    const name = typeof skill === 'string' ? skill : skill.name;
                                    const icon = typeof skill === 'string' ? '' : skill.icon;

                                    return (
                                        <div key={`${skillIndex}-${iconRefreshKey}`} className="flex items-center gap-2 bg-black/30 p-2 rounded border border-white/5">
                                            <div className="w-8 h-8 bg-zinc-800 rounded flex items-center justify-center shrink-0">
                                                {icon ? (
                                                    <TechLogo key={`icon-${icon}-${iconRefreshKey}`} name={icon} className="w-6 h-6" />
                                                ) : (
                                                    <span className="text-xs text-zinc-600">?</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 space-y-1">
                                                <input
                                                    value={name}
                                                    onChange={(e) => updateSkill(catIndex, skillIndex, 'name', e.target.value)}
                                                    className="w-full bg-transparent text-sm focus:outline-none border-b border-transparent focus:border-white/20"
                                                    placeholder="Name"
                                                />
                                                <input
                                                    value={icon || ''}
                                                    onChange={(e) => updateSkill(catIndex, skillIndex, 'icon', e.target.value)}
                                                    className="w-full bg-transparent text-xs text-zinc-500 focus:outline-none border-b border-transparent focus:border-white/20"
                                                    placeholder="Icon slug (e.g. react)"
                                                />
                                            </div>
                                            <button onClick={() => removeSkill(catIndex, skillIndex)} className="text-zinc-600 hover:text-red-400">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    );
                                })}
                                <button
                                    onClick={() => addSkill(catIndex)}
                                    className="flex items-center justify-center gap-2 py-4 border border-dashed border-white/10 rounded hover:bg-white/5 text-zinc-500 text-sm"
                                >
                                    <Plus size={14} /> Add Skill
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="fixed bottom-6 right-6 z-20">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-white text-black px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2 hover:scale-105 transition-transform"
                >
                    {saving ? <div className="animate-spin w-4 h-4 border-2 border-zinc-400 border-t-black rounded-full" /> : <Save size={20} />}
                    Salva Tutto
                </button>
            </div>
        </div>
    );
}
