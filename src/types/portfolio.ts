
export interface BilingualText {
    it: string;
    en: string;
}

export interface SocialLinks {
    github: string;
    linkedin: string;
    email: string;
}

export interface ProfileData {
    image: string;
    roles: string[];
    location: BilingualText;
    available: boolean;
    bio: {
        title: BilingualText;
        short: BilingualText;
        long: BilingualText;
    };
    socials: SocialLinks;
}

export interface TimelineItem {
    id: string;
    order: number;
    year: string;
    type: 'work' | 'edu';
    title: BilingualText;
    subtitle: BilingualText;
    note: BilingualText | null;
    details: BilingualText;
}

export interface TechSkill {
    name: string;
    icon: string; // URL or internal path
}

export interface TechCategory {
    id: string;
    order: number;
    title: BilingualText;
    skills: TechSkill[];
}

export interface Certification {
    id: number | string; // Normalized to string in DB usually, keeping flexible for migration
    title: BilingualText;
    description: BilingualText;
    icon: string; // URL or name for icon component
}
