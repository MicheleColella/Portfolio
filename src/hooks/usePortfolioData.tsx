
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import {
    ProfileData,
    TimelineItem,
    TechCategory,
    Certification
} from '@/types/portfolio';

export interface LogoLoopItem {
    id: string;
    name: string;      // Nome del logo (usato come slug in Tech Stack)
    imageUrl: string;  // URL dell'immagine su Firebase Storage
    order: number;
}

export const usePortfolioData = () => {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [timelineData, setTimelineData] = useState<TimelineItem[]>([]);
    const [techStackData, setTechStackData] = useState<TechCategory[]>([]);
    const [certificationsData, setCertificationsData] = useState<Certification[]>([]);
    const [logoLoopData, setLogoLoopData] = useState<LogoLoopItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);

        // 1. Profile Listener
        const unsubProfile = onSnapshot(doc(db, 'profile', 'main'),
            (doc) => {
                if (doc.exists()) {
                    setProfile(doc.data() as ProfileData);
                }
                setLoading(false);
            },
            (error) => {
                console.error("Profile listen error:", error);
                setLoading(false);
            }
        );

        // 2. Timeline Listener
        const qTimeline = query(collection(db, 'experience'), orderBy('order', 'asc'));
        const unsubTimeline = onSnapshot(qTimeline,
            (snapshot) => {
                const items: TimelineItem[] = [];
                snapshot.forEach((doc) => {
                    items.push({ id: doc.id, ...doc.data() } as TimelineItem);
                });
                setTimelineData(items);
            },
            (error) => {
                console.error("Timeline listen error:", error);
            }
        );

        // 3. Tech Stack Listener
        const qTech = query(collection(db, 'tech_stack'), orderBy('order', 'asc'));
        const unsubTech = onSnapshot(qTech,
            (snapshot) => {
                const items: TechCategory[] = [];
                snapshot.forEach((doc) => {
                    items.push({ id: doc.id, ...doc.data() } as TechCategory);
                });
                setTechStackData(items);
            },
            (error) => {
                console.error("TechStack listen error:", error);
            }
        );

        // 4. Certifications Listener
        const unsubCerts = onSnapshot(collection(db, 'certifications'),
            (snapshot) => {
                const items: Certification[] = [];
                snapshot.forEach((doc) => {
                    items.push({ id: doc.id, ...doc.data() } as Certification);
                });
                setCertificationsData(items);
            },
            (error) => {
                console.error("Certifications listen error:", error);
            }
        );

        // 5. Logo Loop Listener
        const qLogos = query(collection(db, 'logo_loop'), orderBy('order', 'asc'));
        const unsubLogos = onSnapshot(qLogos,
            (snapshot) => {
                const items: LogoLoopItem[] = [];
                snapshot.forEach((doc) => {
                    items.push({ id: doc.id, ...doc.data() } as LogoLoopItem);
                });
                setLogoLoopData(items);
            },
            (error) => {
                console.error("Logo loop listen error:", error);
            }
        );

        // Cleanup
        return () => {
            unsubProfile();
            unsubTimeline();
            unsubTech();
            unsubCerts();
            unsubLogos();
        };
    }, []);

    return {
        profile,
        timelineData,
        techStackData,
        certificationsData,
        logoLoopData,
        loading
    };
};
