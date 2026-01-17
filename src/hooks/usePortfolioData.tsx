
import { useMemo } from 'react';
import { useTranslation } from '@/i18n';
import { Award, Globe, Shield, Cpu, Box } from "lucide-react";

export const usePortfolioData = () => {
    const { t } = useTranslation();

    const timelineData = useMemo(() => [
        {
            year: "2026",
            type: "edu",
            title: t('timelineDegreeTitle'),
            subtitle: t('timelineDegreeSubtitle'),
            note: t('timelineInProgress'),
            details: t('timelineDegreeDetails')
        },
        {
            year: "2024",
            type: "work",
            title: t('timelineFreelanceTitle'),
            subtitle: t('timelineFreelanceSubtitle'),
            note: t('timelineFreelanceNote'),
            details: t('timelineFreelanceDetails')
        },
        {
            year: "2024",
            type: "edu",
            title: t('timelineAcademyTitle'),
            subtitle: t('timelineAcademySubtitle'),
            note: t('timelineAcademyNote'),
            details: t('timelineAcademyDetails')
        },
        {
            year: "2022",
            type: "edu",
            title: t('timelineDiplomaTitle'),
            subtitle: t('timelineDiplomaSubtitle'),
            note: null,
            details: t('timelineDiplomaDetails')
        },
        {
            year: "2021",
            type: "work",
            title: t('timelineDataTitle'),
            subtitle: t('timelineDataSubtitle'),
            note: t('timelineDataNote'),
            details: t('timelineDataDetails')
        },
    ], [t]);

    const techStackData = useMemo(() => [
        {
            category: t('techMobile'),
            skills: ["Swift", "SwiftUI", "iOS SDK", "React Native", "UIKit"]
        },
        {
            category: t('techGameDev'),
            skills: ["Unity", "C#", "XR", "OpenGL", "Physics", "3D Integration"]
        },
        {
            category: t('techWeb'),
            skills: ["React", "TypeScript", "Tailwind", "Node.js", "Three.js"]
        },
        {
            category: t('techBackend'),
            skills: ["Python", "SQL", "Firebase", "REST APIs", "Git"]
        },
        {
            category: t('techDesign'),
            skills: ["Figma", "Blender", "UI/UX", "System Design", "Agile"]
        }
    ], [t]);

    const certificationsData = useMemo(() => [
        {
            id: 1,
            title: t('certEnglishTitle'),
            description: t('certEnglishDesc'),
            icon: <Globe size={20} className="carousel-icon" />
        },
        {
            id: 2,
            title: t('certEirsafTitle'),
            description: t('certEirsafDesc'),
            icon: <Award size={20} className="carousel-icon" />
        },
        {
            id: 3,
            title: t('certEipassTitle'),
            description: t('certEipassDesc'),
            icon: <Shield size={20} className="carousel-icon" />
        },
        {
            id: 4,
            title: t('certRoboticsTitle'),
            description: t('certRoboticsDesc'),
            icon: <Cpu size={20} className="carousel-icon" />
        },
        {
            id: 5,
            title: t('cert3DPrintingTitle'),
            description: t('cert3DPrintingDesc'),
            icon: <Box size={20} className="carousel-icon" />
        }
    ], [t]);

    return { timelineData, techStackData, certificationsData };
};
