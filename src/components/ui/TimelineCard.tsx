import { motion, AnimatePresence } from 'framer-motion';

import { ChevronRight, ChevronLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ShinyText from './ShinyText';
import { TextShuffle } from '../animations/TextShuffle';
import { useTranslation } from '@/i18n';

interface TimelineItem {
    year: string;
    type: string;
    title: string;
    subtitle: string;
    note: string | null;
    details: string;
}

interface TimelineCardProps {
    item: TimelineItem;
    index: number;
    isExpanded: boolean;
    onToggle: () => void;
}

export default function TimelineCard({ item, index, isExpanded, onToggle }: TimelineCardProps) {

    const isEven = index % 2 === 0;
    // Even (0, 2): Content on RIGHT.
    // Odd (1, 3): Content on LEFT.

    return (
        <motion.div
            className="relative flex flex-col md:flex-row w-full items-center" // added items-center to align dot
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >

            {/* CENTER ABSOLUTE DOT */}
            <div className="absolute left-4 md:left-1/2 w-3 h-3 bg-white rounded-full -translate-x-1/2 z-10 shadow-[0_0_10px_rgba(255,255,255,0.8)]" />

            {/* LEFT SIDE (Visible for ODD items, Spacer for EVEN items) */}
            <div className={`md:w-1/2 flex justify-end md:pr-32 pl-12 md:pl-0 ${!isEven ? 'block' : 'hidden md:block'}`}>
                {!isEven && (
                    <ContentBlock
                        item={item}
                        align="right"
                        isExpanded={isExpanded}
                        onToggle={onToggle}
                    />
                )}
            </div>

            {/* RIGHT SIDE (Visible for EVEN items, Spacer for ODD items) */}
            <div className={`md:w-1/2 flex justify-start md:pl-32 pl-12 md:pl-0 ${isEven ? 'block' : 'hidden md:block'}`}>
                {isEven && (
                    <ContentBlock
                        item={item}
                        align="left"
                        isExpanded={isExpanded}
                        onToggle={onToggle}
                    />
                )}
            </div>

        </motion.div>
    );
}

// Memoized Title Component to prevent re-renders causing layout shifts
const TimelineTitle = ({ title, trigger }: { title: string; trigger: boolean }) => (
    <h4 className="text-xl font-bold text-white whitespace-nowrap">
        <ShinyText speed={3} shimmerWidth={100}>
            <TextShuffle text={title} trigger={trigger} />
        </ShinyText>
    </h4>
);

// Sub-component for content
const ContentBlock = ({
    item,
    align,
    isExpanded,
    onToggle
}: {
    item: TimelineItem;
    align: 'left' | 'right';
    isExpanded: boolean;
    onToggle: () => void;
}) => {
    const { isChanging } = useTranslation();
    return (
        <div className={`relative flex flex-col ${align === 'right' ? 'md:items-end md:text-right' : 'md:items-start md:text-left'} text-left items-start`}>

            {/* Year with connecting line style */}
            <div className={`flex items-center gap-4 mb-2 flex-row ${align === 'right' ? 'md:flex-row-reverse' : ''}`}>
                <span className="text-xs font-mono text-zinc-500">{item.year}</span>
                <div className="h-[1px] w-8 bg-white/10" />
            </div>

            {/* Title Row - Clickable, Stable Layout */}
            <div
                className={`flex items-center gap-3 mb-2 h-8 cursor-pointer flex-row ${align === 'right' ? 'md:flex-row-reverse' : ''}`}
                onClick={onToggle}
            >
                {/* Fixed container for Title */}
                <div className="flex-shrink-0">
                    <TimelineTitle title={item.title} trigger={isChanging} />
                </div>

                {/* Strictly Sized Button Wrapper */}
                <div className="w-8 h-8 flex-shrink-0 relative">
                    <button
                        className={`absolute inset-0 w-full h-full flex items-center justify-center rounded-full border transition-colors duration-200 z-20 
                            ${isExpanded ? 'bg-white text-black border-white' : 'border-white/20 text-white hover:bg-white/10'}`}
                        aria-label="Toggle details"
                    >
                        <motion.span
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center justify-center w-full h-full"
                        >
                            {align === 'right' ? (
                                <>
                                    <span className="hidden md:block"><ChevronLeft size={16} /></span>
                                    <span className="md:hidden"><ChevronRight size={16} /></span>
                                </>
                            ) : (
                                <ChevronRight size={16} />
                            )}
                        </motion.span>
                    </button>
                </div>
            </div>

            <p className="text-zinc-400 text-sm font-medium">
                <TextShuffle text={item.subtitle} trigger={isChanging} />
            </p>
            {item.note && (
                <p className="text-zinc-600 text-xs mt-1 font-mono">
                    <TextShuffle text={item.note} trigger={isChanging} />
                </p>
            )}

            {/* DESKTOP SIDE PANEL (OUTSIDE - Visible only on XL screens) */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, x: align === 'left' ? -20 : 20, pointerEvents: 'none' }}
                        animate={{ opacity: 1, x: 0, pointerEvents: 'auto' }}
                        exit={{ opacity: 0, x: align === 'left' ? -20 : 20, pointerEvents: 'none' }}
                        transition={{ duration: 0.3 }}
                        className={`hidden xl:block absolute top-0 z-30 w-[350px] ${align === 'left' ? 'left-full ml-8' : 'right-full mr-8'}`}
                    >
                        <div className="relative">
                            <div className="p-6 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-[0_0_30px_-5px_rgba(0,0,0,0.5)] relative">
                                <div className="text-sm text-zinc-300 leading-relaxed text-left markdown-content">
                                    <ReactMarkdown
                                        components={{
                                            strong: ({ node, ...props }) => <span className="text-white font-semibold" {...props} />,
                                            ul: ({ node, ...props }) => <ul className="list-disc pl-4 mt-2 space-y-1" {...props} />,
                                            li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                            p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />
                                        }}
                                    >
                                        {item.details}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MOBILE/TABLET ACCORDION - In-flow (pushes content) up to XL screens */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full xl:hidden overflow-hidden"
                    >
                        <div className="pt-4">
                            <div className="p-4 bg-zinc-900/50 border border-white/10 rounded-xl">
                                <div className="text-sm text-zinc-300 leading-relaxed markdown-content">
                                    <ReactMarkdown
                                        components={{
                                            strong: ({ node, ...props }) => <span className="text-white font-semibold" {...props} />,
                                            ul: ({ node, ...props }) => <ul className="list-disc pl-4 mt-2 space-y-1" {...props} />,
                                            li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                            p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />
                                        }}
                                    >
                                        {item.details}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
