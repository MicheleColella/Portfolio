import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n';

export function LanguageToggle() {
    const { language, toggleLanguage, isChanging } = useTranslation();

    return (
        <motion.button
            onClick={toggleLanguage}
            disabled={isChanging}
            className="fixed top-6 right-6 z-50 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
        >
            <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-zinc-900/90 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden group-hover:border-white/30 transition-colors">
                {/* Background glow effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Rotating Container */}
                <motion.div
                    className="relative w-full h-full flex items-center justify-center"
                    animate={{ rotate: language === 'en' ? 0 : 180 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                    {/* EN Text */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.span
                            className="font-bold text-sm bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400"
                            animate={{
                                opacity: language === 'en' ? 1 : 0,
                                scale: language === 'en' ? 1 : 0.5,
                                rotate: language === 'en' ? 0 : 180
                            }}
                        >
                            EN
                        </motion.span>
                    </div>

                    {/* IT Text */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.span
                            className="font-bold text-sm bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400"
                            animate={{
                                opacity: language === 'it' ? 1 : 0,
                                scale: language === 'it' ? 1 : 0.5,
                                rotate: language === 'it' ? 180 : 0
                            }}
                            style={{ rotate: 180 }} // Pre-rotated so it's upright when container rotates
                        >
                            IT
                        </motion.span>
                    </div>
                </motion.div>

                {/* Orbital Ring (Moon effect trace) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none p-1" style={{ opacity: 0.3 }}>
                    <circle cx="50%" cy="50%" r="48%" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-white/20" />
                </svg>
            </div>
        </motion.button>
    );
}
