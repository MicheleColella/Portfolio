import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TextShuffleProps {
    text: string;
    className?: string;
    trigger?: boolean;
    duration?: number;
    scrambleSpeed?: number;
    charset?: string;
    as?: keyof JSX.IntrinsicElements;
}

const DEFAULT_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';

export function TextShuffle({
    text,
    className = '',
    trigger = false,
    duration = 600,
    scrambleSpeed = 30,
    charset = DEFAULT_CHARSET,
    as: Tag = 'span'
}: TextShuffleProps) {
    const [displayText, setDisplayText] = useState(text);
    const [isAnimating, setIsAnimating] = useState(false);
    const [prevText, setPrevText] = useState(text);

    const scrambleText = useCallback((targetText: string, progress: number): string => {
        return targetText
            .split('')
            .map((char, index) => {
                if (char === ' ') return ' ';

                // Calculate reveal threshold for each character (stagger effect)
                const charThreshold = (index / targetText.length) * 0.7;

                if (progress > charThreshold + 0.3) {
                    // Fully revealed
                    return char;
                } else if (progress > charThreshold) {
                    // Scrambling phase
                    return charset[Math.floor(Math.random() * charset.length)];
                } else {
                    // Not yet started - show previous char or scramble
                    return charset[Math.floor(Math.random() * charset.length)];
                }
            })
            .join('');
    }, [charset]);

    useEffect(() => {
        // Only animate when text actually changes or trigger fires
        if (text !== prevText || trigger) {
            setIsAnimating(true);
            setPrevText(text);

            const iterations = duration / scrambleSpeed;
            let currentIteration = 0;

            const interval = setInterval(() => {
                currentIteration++;
                const progress = currentIteration / iterations;

                if (progress >= 1) {
                    clearInterval(interval);
                    setDisplayText(text);
                    setIsAnimating(false);
                } else {
                    setDisplayText(scrambleText(text, progress));
                }
            }, scrambleSpeed);

            return () => {
                clearInterval(interval);
                // Force cleanup to avoid stuck scrambled text
                setDisplayText(text);
                setIsAnimating(false);
            };
        }
    }, [text, trigger, duration, scrambleSpeed, scrambleText]);

    // Initial render without animation
    useEffect(() => {
        if (!isAnimating) {
            setDisplayText(text);
        }
    }, [text, isAnimating]);

    return (
        <Tag className={className}>
            <AnimatePresence mode="wait">
                <motion.span
                    key={isAnimating ? 'animating' : 'static'}
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0.8 }}
                    transition={{ duration: 0.1 }}
                >
                    {displayText}
                </motion.span>
            </AnimatePresence>
        </Tag>
    );
}
