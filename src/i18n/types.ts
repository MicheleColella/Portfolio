export type Language = 'it' | 'en';

export interface TranslationKeys {
    // Hero
    heroGreeting: string;
    heroName: string;
    heroRole1: string;
    heroRole2: string;
    heroRole3: string;
    heroDescription: string;
    heroCTA: string;

    // Profile Card
    profileLocation: string;
    profileProjects: string;
    profileExperience: string;
    profileYears: string;

    // Availability
    availableTitle: string;
    availableCTA: string;

    // Sections
    sectionTechStack: string;
    sectionTimeline: string;
    sectionTimelineSubtitle: string;
    sectionProjects: string;
    sectionProjectsSubtitle: string;

    // Tech Categories
    techMobile: string;
    techGameDev: string;
    techWeb: string;
    techBackend: string;
    techDesign: string;

    // Timeline
    timelineInProgress: string;
    timelineDegreeTitle: string;
    timelineDegreeSubtitle: string;
    timelineDegreeDetails: string;
    timelineFreelanceTitle: string;
    timelineFreelanceSubtitle: string;
    timelineFreelanceNote: string;
    timelineFreelanceDetails: string;
    timelineAcademyTitle: string;
    timelineAcademySubtitle: string;
    timelineAcademyNote: string;
    timelineAcademyDetails: string;
    timelineDiplomaTitle: string;
    timelineDiplomaSubtitle: string;
    timelineDiplomaDetails: string;
    timelineDataTitle: string;
    timelineDataSubtitle: string;
    timelineDataNote: string;
    timelineDataDetails: string;

    // Certifications
    certEnglishTitle: string;
    certEnglishDesc: string;
    certEirsafTitle: string;
    certEirsafDesc: string;
    certEipassTitle: string;
    certEipassDesc: string;
    certRoboticsTitle: string;
    certRoboticsDesc: string;
    cert3DPrintingTitle: string;
    cert3DPrintingDesc: string;

    // Projects
    projectsFilterAll: string;
    projectsViewGithub: string;
    projectsViewLive: string;

    // Footer / General
    footerRights: string;
}

export type Translations = {
    [key in Language]: TranslationKeys;
};
