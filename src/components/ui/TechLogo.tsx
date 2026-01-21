import { useState, useEffect, useRef } from 'react';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

interface TechLogoProps {
    name: string;
    className?: string;
}

export const TechLogo = ({ name, className = "w-6 h-6" }: TechLogoProps) => {
    const [src, setSrc] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        setIsLoaded(false);
        setHasError(false);
        setSrc(null);

        const loadImage = async () => {
            // If name is empty, don't try to load
            if (!name || name.trim() === '') {
                if (mountedRef.current) {
                    setHasError(true);
                }
                return;
            }

            // If name is already a full URL, use it directly
            if (name.startsWith('http://') || name.startsWith('https://')) {
                if (mountedRef.current) {
                    setSrc(name);
                }
                return;
            }

            // Try to load from Firebase Storage (techlogo folder)
            const extensions = ['png', 'svg', 'jpg', 'webp'];

            for (const ext of extensions) {
                try {
                    const storageRef = ref(storage, `techlogo/${name}.${ext}`);
                    const url = await getDownloadURL(storageRef);
                    if (mountedRef.current) {
                        setSrc(url);
                    }
                    return;
                } catch {
                    // Continue to next extension
                }
            }

            // No valid icon found in Firebase
            if (mountedRef.current) {
                setHasError(true);
            }
        };

        loadImage();

        return () => {
            mountedRef.current = false;
        };
    }, [name]);

    // If we have an error (no icon found) or still loading (no src), return null
    if (hasError || !src) {
        return null;
    }

    // Render the image with visibility controlled by isLoaded state
    return (
        <img
            src={src}
            alt={name}
            className={`${className} object-contain filter brightness-0 invert transition-opacity duration-150 ${isLoaded ? 'opacity-70 group-hover:opacity-100' : 'opacity-0'
                }`}
            onLoad={() => {
                setIsLoaded(true);
            }}
            onError={() => {
                setHasError(true);
            }}
        />
    );
};

