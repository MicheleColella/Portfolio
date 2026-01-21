import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface MediaItem {
    type: 'image' | 'video';
    src: string;
    duration: number;
    volume?: number;
}

export interface BilingualText {
    it: string;
    en: string;
}

export interface Project {
    id: number;
    title: BilingualText;
    description: BilingualText;
    longDescription: BilingualText;
    categories: string[];
    tags: string[];
    image: string;
    gitLink: string;
    liveLink: string;
    featured: boolean;
    sortDate: string;
    media: MediaItem[];
}

export function useProjects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        try {
            const projectsRef = collection(db, 'projects');
            const q = query(projectsRef, orderBy('sortDate', 'desc'));
            const snapshot = await getDocs(q);

            const projectsData: Project[] = [];
            snapshot.forEach((doc) => {
                projectsData.push(doc.data() as Project);
            });

            setProjects(projectsData);
            setError(null);
        } catch (err) {
            console.error('Error fetching projects:', err);
            setError(err instanceof Error ? err : new Error('Failed to fetch projects'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const refetch = useCallback(() => {
        fetchProjects();
    }, [fetchProjects]);

    return { projects, loading, error, refetch };
}
