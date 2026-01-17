import { useState, useRef, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TextShuffle } from '../animations/TextShuffle';
import { useTranslation } from '@/i18n';
import { useMobilePreview } from '@/context/MobilePreviewContext';

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
    const [isDesktopHovered, setIsDesktopHovered] = useState(false);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const { isChanging } = useTranslation();

    // Mobile preview context
    const { activeCardId, registerCard, unregisterCard, isMobile } = useMobilePreview();
    const cardId = useId();

    const mediaList: MediaItem[] = project.media || [];
    const hasMedia = mediaList.length > 0;

    // Register card with context on mount
    useEffect(() => {
        if (isMobile && cardRef.current) {
            registerCard(cardId, cardRef.current);
        }
        return () => {
            if (isMobile) {
                unregisterCard(cardId);
            }
        };
    }, [isMobile, cardId, registerCard, unregisterCard]);

    // Determine if this card should show preview
    const isMobileHovered = isMobile && activeCardId === cardId;
    const isHovered = isDesktopHovered || isMobileHovered;

    // Media slideshow logic
    useEffect(() => {
        let timeout: NodeJS.Timeout;

        if (isHovered && hasMedia) {
            const currentItem = mediaList[currentMediaIndex];

            if (currentItem.type === 'video' && videoRef.current) {
                videoRef.current.currentTime = 0;
                videoRef.current.play().catch(() => { });
            }

            timeout = setTimeout(() => {
                setCurrentMediaIndex((prev) => (prev + 1) % mediaList.length);
            }, currentItem.duration);
        } else {
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
            ref={cardRef}
            onClick={onClick}
            onMouseEnter={() => !isMobile && setIsDesktopHovered(true)}
            onMouseLeave={() => !isMobile && setIsDesktopHovered(false)}
            className="group cursor-pointer cursor-target bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden relative"
        >
            {/* Image Container */}
            <div className="relative aspect-video overflow-hidden bg-zinc-950">
                {/* Base Image (Static) */}
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
                            transition={{ duration: 0.8 }}
                            className="absolute inset-0 w-full h-full z-20 bg-zinc-950"
                        >
                            {mediaList[currentMediaIndex].type === 'video' ? (
                                <video
                                    ref={videoRef}
                                    src={mediaList[currentMediaIndex].src}
                                    muted
                                    loop={false}
                                    playsInline
                                    preload="metadata"
                                    className="w-full h-full object-cover"
                                    onLoadedData={(e) => {
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
