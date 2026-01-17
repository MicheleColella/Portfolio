import { motion } from "framer-motion";
import { X, ExternalLink, Github, Layers } from "lucide-react";
import { useEffect } from "react";
import { ProjectMediaCarousel } from "./carousel/ProjectMediaCarousel";
import ReactMarkdown from 'react-markdown';
import { TextShuffle } from "../animations/TextShuffle";
import { useTranslation } from "@/i18n";

interface Project {
    id: number;
    title: string;
    description: string;
    longDescription: string;
    tags: string[];
    image: string;
    gitLink: string;
    liveLink: string;
    categories: string[];
    media?: { type: string; src: string; duration?: number; volume?: number }[];
}

export const ProjectModal = ({
    project,
    onClose,
}: {
    project: Project;
    onClose: () => void;
}) => {
    const { isChanging } = useTranslation();
    // Lock scroll when modal is open and prevent layout shift
    useEffect(() => {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = "hidden";
        document.body.style.paddingRight = `${scrollbarWidth}px`;

        return () => {
            document.body.style.overflow = "auto";
            document.body.style.paddingRight = "0px";
        };
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 pt-20 md:p-10"
        >
            <div
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
                layoutId={`project-${project.id}`}
                className="relative w-full max-w-7xl max-h-[85vh] overflow-hidden bg-[#0a0a0a] rounded-2xl border border-white/10 shadow-2xl flex flex-col lg:flex-row"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-white hover:text-black rounded-full transition-colors border border-white/10"
                >
                    <X size={20} />
                </button>

                {/* Media Section (Carousel) - Now takes 60% width on large screens */}
                <div className="w-full lg:w-3/5 h-[40vh] lg:h-auto relative bg-[#050505] flex items-center justify-center border-r border-white/5">
                    <ProjectMediaCarousel
                        media={project.media || []}
                        coverImage={project.image}
                        title={project.title}
                    />
                </div>

                {/* Content Section - Now takes 40% width */}
                <div className="flex-1 lg:w-2/5 p-8 lg:p-10 overflow-y-auto custom-scrollbar bg-zinc-900/30">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-xs font-mono border border-white/20 px-2 py-1 rounded text-zinc-400">
                                <TextShuffle text={project.categories.join(' / ')} trigger={isChanging} />
                            </span>
                            <div className="h-px bg-white/10 flex-1" />
                        </div>

                        <motion.h2 layoutId={`title-${project.id}`} className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                            <TextShuffle text={project.title} trigger={isChanging} />
                        </motion.h2>

                        <div className="text-zinc-400 leading-relaxed mb-8 text-lg prose prose-invert max-w-none">
                            <ReactMarkdown>{project.longDescription}</ReactMarkdown>
                        </div>

                        <div className="mb-10">
                            <h3 className="text-sm font-mono text-zinc-500 mb-4 flex items-center gap-2">
                                <Layers size={14} /> TECH STACK
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {project.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-zinc-300">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-8 border-t border-white/10">
                            {project.liveLink && (
                                <a href={project.liveLink} target="_blank" rel="noopener noreferrer" className="flex-1 py-4 bg-white text-black font-bold text-center hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 rounded-lg">
                                    <ExternalLink size={18} /> LIVE DEMO
                                </a>
                            )}
                            {project.gitLink && (
                                <a href={project.gitLink} target="_blank" rel="noopener noreferrer" className={`flex-1 py-4 border border-white/20 text-white font-bold text-center hover:bg-white/10 transition-colors flex items-center justify-center gap-2 rounded-lg ${!project.liveLink ? 'w-full' : ''}`}>
                                    <Github size={18} /> SOURCE
                                </a>
                            )}
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>
    );
};
