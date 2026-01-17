import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';

interface MobilePreviewContextType {
    activeCardId: string | null;
    registerCard: (id: string, ref: HTMLDivElement) => void;
    unregisterCard: (id: string) => void;
    isMobile: boolean;
}

const MobilePreviewContext = createContext<MobilePreviewContextType>({
    activeCardId: null,
    registerCard: () => { },
    unregisterCard: () => { },
    isMobile: false
});

export const useMobilePreview = () => useContext(MobilePreviewContext);

interface MobilePreviewProviderProps {
    children: ReactNode;
}

export const MobilePreviewProvider = ({ children }: MobilePreviewProviderProps) => {
    const [activeCardId, setActiveCardId] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const cardsRef = useRef<Map<string, HTMLDivElement>>(new Map());
    const activeCardRef = useRef<string | null>(null);
    const lastScrollTime = useRef<number>(0);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const activationTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Hysteresis threshold: how much closer another card must be to "steal" focus
    const HYSTERESIS_THRESHOLD = 80;
    // Delay before activating preview after scroll stops
    const ACTIVATION_DELAY = 600;
    // Throttle interval for scroll calculations
    const THROTTLE_MS = 100;

    // Detect mobile on mount
    useEffect(() => {
        const checkMobile = () => {
            const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            const isSmallScreen = window.innerWidth <= 768;
            setIsMobile(hasTouchScreen && isSmallScreen);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const registerCard = useCallback((id: string, ref: HTMLDivElement) => {
        cardsRef.current.set(id, ref);
    }, []);

    const unregisterCard = useCallback((id: string) => {
        cardsRef.current.delete(id);
    }, []);

    // Find the closest card to center with hysteresis
    const findClosestCard = useCallback(() => {
        if (cardsRef.current.size === 0) return null;

        const viewportCenter = window.innerHeight / 2;
        let closestId: string | null = null;
        let closestDistance = Infinity;
        let currentActiveDistance = Infinity;

        cardsRef.current.forEach((ref, id) => {
            const rect = ref.getBoundingClientRect();
            const cardCenter = rect.top + rect.height / 2;
            const distance = Math.abs(cardCenter - viewportCenter);

            // Track how far the currently active card is
            if (id === activeCardRef.current) {
                currentActiveDistance = distance;
            }

            if (distance < closestDistance) {
                closestDistance = distance;
                closestId = id;
            }
        });

        // Apply hysteresis: only switch if the new card is significantly closer
        if (activeCardRef.current && closestId !== activeCardRef.current) {
            // Current active card must be at least HYSTERESIS_THRESHOLD pixels further than the closest
            if (currentActiveDistance - closestDistance < HYSTERESIS_THRESHOLD) {
                // Keep current active card
                return activeCardRef.current;
            }
        }

        // Only activate if card is reasonably close to center (within 200px)
        if (closestDistance > 200) {
            return null;
        }

        return closestId;
    }, []);

    // Handle scroll with throttling and delayed activation
    useEffect(() => {
        if (!isMobile) return;

        const handleScroll = () => {
            const now = Date.now();

            // Cancel any pending activation
            if (activationTimerRef.current) {
                clearTimeout(activationTimerRef.current);
                activationTimerRef.current = null;
            }

            // Throttle the calculation
            if (now - lastScrollTime.current < THROTTLE_MS) {
                // Schedule a check after scroll stops
                if (scrollTimeoutRef.current) {
                    clearTimeout(scrollTimeoutRef.current);
                }
                scrollTimeoutRef.current = setTimeout(() => {
                    handleScrollEnd();
                }, ACTIVATION_DELAY);
                return;
            }

            lastScrollTime.current = now;

            // During scrolling, we track closest card (value used for hysteresis)
            findClosestCard();

            // Clear timeout and schedule new check
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
            scrollTimeoutRef.current = setTimeout(() => {
                handleScrollEnd();
            }, ACTIVATION_DELAY);
        };

        const handleScrollEnd = () => {
            const closestId = findClosestCard();

            if (closestId !== activeCardRef.current) {
                // Schedule activation with a small delay for stability
                activationTimerRef.current = setTimeout(() => {
                    activeCardRef.current = closestId;
                    setActiveCardId(closestId);
                }, 200);
            }
        };

        // Initial check
        setTimeout(() => {
            const closestId = findClosestCard();
            if (closestId) {
                activeCardRef.current = closestId;
                setActiveCardId(closestId);
            }
        }, 500);

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
            if (activationTimerRef.current) {
                clearTimeout(activationTimerRef.current);
            }
        };
    }, [isMobile, findClosestCard]);

    return (
        <MobilePreviewContext.Provider value={{ activeCardId, registerCard, unregisterCard, isMobile }}>
            {children}
        </MobilePreviewContext.Provider>
    );
};
