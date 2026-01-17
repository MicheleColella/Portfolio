import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Play, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type MediaItem = {
    type: string;
    src: string;
    duration?: number;
    volume?: number;
};

interface ProjectMediaCarouselProps {
    media: MediaItem[];
    coverImage: string;
    title: string;
}

export const ProjectMediaCarousel = ({ media, coverImage, title }: ProjectMediaCarouselProps) => {
    // If no media (or empty array), just show the cover image.
    const items = media && media.length > 0 ? media : [{ type: 'image', src: coverImage }];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    // Get logical volume from current item (0.0 - 1.0), default 1.0 if missing
    const currentItem = items[currentIndex];
    const targetVolume = currentItem.volume ?? 1.0;

    const videoRef = useRef<HTMLVideoElement>(null);

    // Apply volume reactive to targetVolume changes
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.volume = targetVolume;
        }
    }, [targetVolume]);

    // Handle initial volume for new video elements
    const handleVideoMount = (el: HTMLVideoElement | null) => {
        if (el) {
            el.volume = targetVolume;
        }
    };

    // Navigate to a specific index - immediate, no blocking delay
    const goToSlide = useCallback((index: number) => {
        // Pause current video immediately if playing
        const el = videoRef.current;
        if (el && isPlaying) {
            el.pause();
            el.volume = 0;
        }

        setCurrentIndex(index);
        setIsPlaying(false);
    }, [isPlaying]);

    const nextSlide = useCallback(() => {
        goToSlide((currentIndex + 1) % items.length);
    }, [currentIndex, items.length, goToSlide]);

    const prevSlide = useCallback(() => {
        goToSlide((currentIndex - 1 + items.length) % items.length);
    }, [currentIndex, items.length, goToSlide]);

    // Fade volume utility (non-blocking, only for smooth audio transitions)
    const fadeVolume = (el: HTMLVideoElement, target: number, duration: number, callback?: () => void) => {
        const startVolume = el.volume;
        const startTime = performance.now();

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            el.volume = startVolume + (target - startVolume) * progress;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else if (callback) {
                callback();
            }
        };

        requestAnimationFrame(animate);
    };

    const toggleVideo = () => {
        const el = videoRef.current;
        if (el) {
            if (isPlaying) {
                // Fade out before pausing for smoothness
                fadeVolume(el, 0, 150, () => {
                    el.pause();
                    setIsPlaying(false);
                });
            } else {
                // Fade in when starting
                el.volume = 0;
                el.play();
                setIsPlaying(true);
                fadeVolume(el, targetVolume, 300);
            }
        }
    };

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (videoRef.current) {
            const newMutedState = !isMuted;
            videoRef.current.muted = newMutedState;
            setIsMuted(newMutedState);
        }
    };

    return (
        <div className="relative w-full h-full bg-black group">
            {/* Media Content - Using crossfade instead of wait for smoother transitions */}
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 flex items-center justify-center bg-zinc-950"
                >
                    {currentItem.type === 'video' ? (
                        <div className="relative w-full h-full flex items-center justify-center bg-black">
                            <video
                                ref={(el) => {
                                    (videoRef as any).current = el;
                                    handleVideoMount(el);
                                }}
                                src={currentItem.src}
                                className="w-full h-full object-contain max-h-[60vh] md:max-h-full"
                                playsInline
                                loop
                                muted={isMuted}
                                onClick={toggleVideo}
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                                onLoadedMetadata={(e) => {
                                    e.currentTarget.volume = targetVolume;
                                }}
                            />
                            {/* Controls Overlay */}
                            <div
                                className="absolute inset-x-0 bottom-0 p-4 flex justify-end items-end gap-3 z-30 pointer-events-none bg-gradient-to-t from-black/60 to-transparent h-24"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <motion.button
                                    onClick={toggleMute}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-colors pointer-events-auto border border-white/10 mb-1"
                                >
                                    <AnimatePresence mode="wait" initial={false}>
                                        {isMuted ? (
                                            <motion.div
                                                key="muted"
                                                initial={{ opacity: 0, rotate: -20, scale: 0.5 }}
                                                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                                                exit={{ opacity: 0, rotate: 20, scale: 0.5 }}
                                                transition={{ duration: 0.15 }}
                                            >
                                                <VolumeX size={20} />
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="unmuted"
                                                initial={{ opacity: 0, rotate: 20, scale: 0.5 }}
                                                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                                                exit={{ opacity: 0, rotate: -20, scale: 0.5 }}
                                                transition={{ duration: 0.15 }}
                                            >
                                                <Volume2 size={20} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.button>
                            </div>

                            {/* Play Button Overlay */}
                            {!isPlaying && (
                                <button
                                    onClick={toggleVideo}
                                    className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/10 transition-colors group/video z-10"
                                >
                                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-full border border-white/20 group-hover/video:scale-110 transition-transform">
                                        <Play fill="white" size={32} />
                                    </div>
                                </button>
                            )}
                        </div>
                    ) : (
                        <img
                            src={currentItem.src}
                            alt={`${title} - slide ${currentIndex + 1}`}
                            className="w-full h-full object-contain max-h-[60vh] md:max-h-full"
                        />
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons (only if > 1 item) */}
            {items.length > 1 && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-white hover:text-black rounded-full backdrop-blur-sm border border-white/10 transition-all opacity-0 group-hover:opacity-100 z-40"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-white hover:text-black rounded-full backdrop-blur-sm border border-white/10 transition-all opacity-0 group-hover:opacity-100 z-40"
                    >
                        <ChevronRight size={24} />
                    </button>

                    {/* Dots Indicator - Now clickable! */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-40">
                        {items.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={(e) => { e.stopPropagation(); goToSlide(idx); }}
                                className={`w-2.5 h-2.5 rounded-full transition-all duration-200 hover:scale-125 ${idx === currentIndex
                                        ? 'bg-white scale-110'
                                        : 'bg-white/30 hover:bg-white/60'
                                    }`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
