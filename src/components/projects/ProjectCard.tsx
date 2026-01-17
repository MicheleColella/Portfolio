import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TextShuffle } from '../animations/TextShuffle';
import { useTranslation } from '@/i18n';

type MediaItem = {
    type: string;
    src: string;
    duration: number;
};

type ProjectCardProps = {
    project: any;
    onClick: () => void;
};

export const ProjectCard = ({ project, onClick }: ProjectCardProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const { isChanging } = useTranslation();

    const mediaList: MediaItem[] = project.media || [];
    const hasMedia = mediaList.length > 0;

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        if (isHovered && hasMedia) {
            const currentItem = mediaList[currentMediaIndex];

            // If video, play it
            if (currentItem.type === 'video' && videoRef.current) {
                videoRef.current.currentTime = 0;
                videoRef.current.play().catch(() => { }); // catch autoplay restrictions
            }

            // Set timer for next slide
            timeout = setTimeout(() => {
                setCurrentMediaIndex((prev) => (prev + 1) % mediaList.length);
            }, currentItem.duration);
        } else {
            // Reset when hover ends
            setCurrentMediaIndex(0);
            if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
            }
        }

        return () => clearTimeout(timeout);
    }, [isHovered, currentMediaIndex, hasMedia, mediaList]);

    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group cursor-pointer cursor-target bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden relative"
        >
            {/* Image Container */}
            <div className="relative aspect-video overflow-hidden bg-zinc-950">
                {/* Base Image (Static) - Visible when NOT hovered or when no media */}
                <img
                    src={project.image}
                    alt={project.title}
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 z-10 ${isHovered && hasMedia ? 'opacity-0' : 'opacity-100'}`}
                />

                {/* Media Overlay (Active on Hover) */}
                <AnimatePresence>
                    {isHovered && hasMedia && (
                        <motion.div
                            key={currentMediaIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8 }} // Transizione più lenta e fluida
                            className="absolute inset-0 w-full h-full z-20 bg-zinc-950"
                        >
                            {mediaList[currentMediaIndex].type === 'video' ? (
                                <video
                                    ref={videoRef}
                                    src={mediaList[currentMediaIndex].src}
                                    muted
                                    loop={false} // Loop gestito manualmente dal timer
                                    playsInline
                                    preload="metadata" // Evita di caricare 2GB subito
                                    className="w-full h-full object-cover"
                                    onLoadedData={(e) => {
                                        // Assicura che il video sia pronto prima di mostrarlo se possibile
                                        e.currentTarget.play().catch(() => { });
                                    }}
                                />
                            ) : (
                                <img
                                    src={mediaList[currentMediaIndex].src}
                                    alt=""
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500 z-30 pointer-events-none" />
            </div>

            {/* Content */}
            <div className="p-6 relative z-30 bg-zinc-900/95">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold">
                        <TextShuffle text={project.title} trigger={isChanging} />
                    </h3>
                    {/* Arrow Icon would need to be passed or imported */}
                </div>
                <div className="text-zinc-400 text-sm line-clamp-2 mb-4 h-10">
                    <TextShuffle text={project.description} trigger={isChanging} />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {project.tags.slice(0, 3).map((t: string) => (
                        <span key={t} className="text-xs border border-white/10 px-2 py-1 rounded bg-white/5">{t}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};
