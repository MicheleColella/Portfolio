import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TechSkill } from '@/types/portfolio';
import { TechLogo } from './TechLogo';

interface TechCategory {
    category: string;
    skills: TechSkill[] | string[];
}

interface TechTabsProps {
    categories: TechCategory[];
}

export default function TechTabs({ categories }: TechTabsProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <div className="w-full">
            {/* Tabs Navigation */}
            <div className="flex flex-wrap gap-2 mb-8">
                {categories.map((cat, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActiveIndex(idx)}
                        className={`relative px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-300 ${activeIndex === idx
                            ? 'text-white'
                            : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        {activeIndex === idx && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-white/10 border border-white/20 rounded-full"
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10">{cat.category}</span>
                    </button>
                ))}
            </div>

            {/* Content Panel */}
            <div className="relative min-h-[200px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8"
                    >
                        <h4 className="text-xl font-bold text-white mb-6">
                            {categories[activeIndex].category}
                        </h4>
                        <div className="flex flex-wrap gap-3">
                            {categories[activeIndex].skills.map((skill, idx) => {
                                const isObject = typeof skill === 'object' && skill !== null;
                                const name = isObject ? (skill as TechSkill).name : (skill as string);
                                const icon = isObject ? (skill as TechSkill).icon : null;

                                return (
                                    <motion.span
                                        key={name}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200 flex items-center gap-2"
                                    >
                                        {icon && <TechLogo name={icon} className="w-4 h-4" />}
                                        {name}
                                    </motion.span>
                                );
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
