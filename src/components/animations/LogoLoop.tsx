import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './LogoLoop.css';

export type LogoItem =
    | { node: React.ReactNode; href?: string; title?: string; ariaLabel?: string; }
    | { src: string; alt?: string; href?: string; title?: string; srcSet?: string; sizes?: string; width?: number; height?: number; };

export interface LogoLoopProps {
    logos: LogoItem[];
    speed?: number;
    direction?: 'left' | 'right' | 'up' | 'down';
    logoHeight?: number;
    gap?: number;
    pauseOnHover?: boolean;
    hoverSpeed?: number;
    fadeOut?: boolean;
    fadeOutColor?: string;
    className?: string;
    style?: React.CSSProperties;
}

const ANIMATION_CONFIG = {
    SMOOTH_TAU: 0.25,
    MIN_COPIES: 2,
    COPY_HEADROOM: 2
} as const;

const useResizeObserver = (
    callback: () => void,
    elements: Array<React.RefObject<Element | null>>,
    dependencies: React.DependencyList
) => {
    useEffect(() => {
        if (!window.ResizeObserver) {
            const handleResize = () => callback();
            window.addEventListener('resize', handleResize);
            callback();
            return () => window.removeEventListener('resize', handleResize);
        }
        const observers = elements.map(ref => {
            if (!ref.current) return null;
            const observer = new ResizeObserver(callback);
            observer.observe(ref.current);
            return observer;
        });
        callback();
        return () => observers.forEach(observer => observer?.disconnect());
    }, dependencies);
};

const useImageLoader = (seqRef: React.RefObject<HTMLUListElement | null>, onLoad: () => void, dependencies: React.DependencyList) => {
    useEffect(() => {
        const images = seqRef.current?.querySelectorAll('img') ?? [];
        if (images.length === 0) { onLoad(); return; }
        let remainingImages = images.length;
        const handleImageLoad = () => {
            remainingImages -= 1;
            if (remainingImages === 0) onLoad();
        };
        images.forEach(img => {
            const htmlImg = img as HTMLImageElement;
            if (htmlImg.complete) handleImageLoad();
            else {
                htmlImg.addEventListener('load', handleImageLoad, { once: true });
                htmlImg.addEventListener('error', handleImageLoad, { once: true });
            }
        });
    }, dependencies);
};

const useAnimationLoop = (trackRef: React.RefObject<HTMLDivElement | null>, targetVelocity: number, seqWidth: number, seqHeight: number, isHovered: boolean, hoverSpeed: number | undefined, isVertical: boolean) => {
    const rafRef = useRef<number | null>(null);
    const lastTimestampRef = useRef<number | null>(null);
    const offsetRef = useRef(0);
    const velocityRef = useRef(0);

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;
        const seqSize = isVertical ? seqHeight : seqWidth;
        const animate = (timestamp: number) => {
            if (lastTimestampRef.current === null) lastTimestampRef.current = timestamp;
            const deltaTime = Math.max(0, timestamp - lastTimestampRef.current) / 1000;
            lastTimestampRef.current = timestamp;
            const target = isHovered && hoverSpeed !== undefined ? hoverSpeed : targetVelocity;
            const easingFactor = 1 - Math.exp(-deltaTime / ANIMATION_CONFIG.SMOOTH_TAU);
            velocityRef.current += (target - velocityRef.current) * easingFactor;
            if (seqSize > 0) {
                let nextOffset = offsetRef.current + velocityRef.current * deltaTime;
                nextOffset = ((nextOffset % seqSize) + seqSize) % seqSize;
                offsetRef.current = nextOffset;
                track.style.transform = isVertical ? `translate3d(0, ${-offsetRef.current}px, 0)` : `translate3d(${-offsetRef.current}px, 0, 0)`;
            }
            rafRef.current = requestAnimationFrame(animate);
        };
        rafRef.current = requestAnimationFrame(animate);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); lastTimestampRef.current = null; };
    }, [targetVelocity, seqWidth, seqHeight, isHovered, hoverSpeed, isVertical]);
};

export const LogoLoop: React.FC<LogoLoopProps> = ({ logos, speed = 120, direction = 'left', logoHeight = 28, gap = 32, pauseOnHover, hoverSpeed, fadeOut = false, fadeOutColor, className = '', style }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const seqRef = useRef<HTMLUListElement>(null);
    const [seqWidth, setSeqWidth] = useState(0);
    const [seqHeight, setSeqHeight] = useState(0);
    const [copyCount, setCopyCount] = useState<number>(ANIMATION_CONFIG.MIN_COPIES);
    const [isHovered, setIsHovered] = useState(false);
    const effectiveHoverSpeed = useMemo(() => hoverSpeed !== undefined ? hoverSpeed : (pauseOnHover === true ? 0 : undefined), [hoverSpeed, pauseOnHover]);
    const isVertical = direction === 'up' || direction === 'down';
    const targetVelocity = useMemo(() => {
        const magnitude = Math.abs(speed);
        const directionMultiplier = isVertical ? (direction === 'up' ? 1 : -1) : (direction === 'left' ? 1 : -1);
        return magnitude * directionMultiplier * (speed < 0 ? -1 : 1);
    }, [speed, direction, isVertical]);

    const updateDimensions = useCallback(() => {
        const containerWidth = containerRef.current?.clientWidth ?? 0;
        const sequenceRect = seqRef.current?.getBoundingClientRect();
        if (isVertical && sequenceRect?.height) {
            setSeqHeight(Math.ceil(sequenceRect.height));
            setCopyCount(Math.max(ANIMATION_CONFIG.MIN_COPIES, Math.ceil((containerRef.current?.clientHeight ?? 0) / sequenceRect.height) + ANIMATION_CONFIG.COPY_HEADROOM));
        } else if (sequenceRect?.width) {
            setSeqWidth(Math.ceil(sequenceRect.width));
            setCopyCount(Math.max(ANIMATION_CONFIG.MIN_COPIES, Math.ceil(containerWidth / sequenceRect.width) + ANIMATION_CONFIG.COPY_HEADROOM));
        }
    }, [isVertical]);

    useResizeObserver(updateDimensions, [containerRef, seqRef], [logos, gap, logoHeight, isVertical]);
    useImageLoader(seqRef, updateDimensions, [logos, gap, logoHeight, isVertical]);
    useAnimationLoop(trackRef, targetVelocity, seqWidth, seqHeight, isHovered, effectiveHoverSpeed, isVertical);

    const renderLogoItem = (item: LogoItem, key: React.Key) => (
        <li className="logoloop__item" key={key}>
            {'node' in item ? <span className="logoloop__node">{item.node}</span> : <img src={item.src} alt={item.alt ?? ''} height={logoHeight} />}
        </li>
    );

    return (
        <div ref={containerRef} className={`logoloop ${isVertical ? 'logoloop--vertical' : 'logoloop--horizontal'} ${fadeOut ? 'logoloop--fade' : ''} ${className}`} style={{ ...style, '--logoloop-gap': `${gap}px`, '--logoloop-logoHeight': `${logoHeight}px`, '--logoloop-fadeColor': fadeOutColor } as any}>
            <div className="logoloop__track" ref={trackRef} onMouseEnter={() => effectiveHoverSpeed !== undefined && setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                {Array.from({ length: copyCount }).map((_, i) => (
                    <ul className="logoloop__list" key={i} ref={i === 0 ? seqRef : undefined}>
                        {logos.map((logo, j) => renderLogoItem(logo, `${i}-${j}`))}
                    </ul>
                ))}
            </div>
        </div>
    );
};

export default LogoLoop;
