import { useState } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { LogOut, LayoutGrid, User, Clock, Cpu, Award, Image } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Tabs
import ProjectsTab from './tabs/ProjectsTab';
import ProfileTab from './tabs/ProfileTab';
import TimelineTab from './tabs/TimelineTab';
import TechStackTab from './tabs/TechStackTab';
import CertificationsTab from './tabs/CertificationsTab';
import LogosTab from './tabs/LogosTab';

type TabType = 'projects' | 'profile' | 'timeline' | 'tech' | 'certs' | 'logos';

export default function AdminDashboard() {
    const { logout } = useAdminAuth();
    const [activeTab, setActiveTab] = useState<TabType>('projects');

    const tabs = [
        { id: 'projects', label: 'Progetti', icon: LayoutGrid, component: ProjectsTab },
        { id: 'profile', label: 'Profilo', icon: User, component: ProfileTab },
        { id: 'timeline', label: 'Timeline', icon: Clock, component: TimelineTab },
        { id: 'tech', label: 'Tech Stack', icon: Cpu, component: TechStackTab },
        { id: 'certs', label: 'Certificazioni', icon: Award, component: CertificationsTab },
        { id: 'logos', label: 'Logo Loop', icon: Image, component: LogosTab },
    ] as const;

    const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || ProjectsTab;

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-zinc-900/80 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                            <span className="text-black font-bold">A</span>
                        </div>
                        <h1 className="text-lg font-bold">Admin Dashboard</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Migration button removed as script was deleted */}
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 text-zinc-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm font-medium">Esci</span>
                        </button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="border-t border-white/5">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex gap-8 overflow-x-auto no-scrollbar">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as TabType)}
                                        className={`relative flex items-center gap-2 py-4 text-sm font-medium transition-colors whitespace-nowrap ${isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                                            }`}
                                    >
                                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                                        {tab.label}
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute bottom-0 left-0 right-0 h-[2px] bg-white"
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="w-full"
                    >
                        <ActiveComponent />
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}
