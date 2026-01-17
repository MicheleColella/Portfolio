import { forwardRef, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './RotatingText.css';

export interface RotatingTextProps {
    texts: string[];
    rotationInterval?: number;
    staggerDuration?: number;
    className?: string;
}

const RotatingText = forwardRef<HTMLSpanElement, RotatingTextProps>((props, ref) => {
    const { texts, rotationInterval = 2000, staggerDuration = 0.025, className = '', ...rest } = props;
    const [currentTextIndex, setCurrentTextIndex] = useState(0);

    const elements = useMemo(() => {
        const text = texts[currentTextIndex];
        return Array.from(text).map(c => ({ character: c }));
    }, [texts, currentTextIndex]);

    useEffect(() => {
        const id = setInterval(() => setCurrentTextIndex(i => (i + 1) % texts.length), rotationInterval);
        return () => clearInterval(id);
    }, [texts.length, rotationInterval]);

    return (
        <motion.span ref={ref} className={`text-rotate ${className}`} {...rest}>
            <AnimatePresence mode="wait">
                <motion.span key={currentTextIndex} className="text-rotate-content">
                    {elements.map((item, i) => (
                        <motion.span
                            key={i}
                            className="text-rotate-char"
                            initial={{ y: '100%', opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: '-120%', opacity: 0 }}
                            transition={{ delay: i * staggerDuration, duration: 0.3 }}
                        >
                            {item.character === ' ' ? '\u00A0' : item.character}
                        </motion.span>
                    ))}
                </motion.span>
            </AnimatePresence>
        </motion.span>
    );
});

export default RotatingText;
